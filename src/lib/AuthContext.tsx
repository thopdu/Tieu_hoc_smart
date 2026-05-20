import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        const emailLower = (data.email || '').toLowerCase();
        const isAdmin = emailLower === 'pvantho@pdu.edu.vn' || emailLower.includes('admin');
        const role = data.role || (isAdmin ? 'admin' : 'user');
        const membership = data.membership || 'regular';
        
        const updatedData = { ...data, role, membership };
        if (!data.role || !data.membership) {
          await setDoc(docRef, { role, membership }, { merge: true });
        }
        setProfile(updatedData);
      } else {
        // Initialize basic profile for new users
        const email = auth.currentUser?.email || '';
        const emailLower = email.toLowerCase();
        const isAdmin = emailLower === 'pvantho@pdu.edu.vn' || emailLower.includes('admin');
        const newProfile: UserProfile = {
          uid,
          displayName: auth.currentUser?.displayName || 'Học sinh',
          email: email,
          grade: 1,
          totalPoints: 0,
          badges: [],
          createdAt: Date.now(),
          membership: 'regular',
          role: isAdmin ? 'admin' : 'user'
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchProfile(user.uid).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile: () => fetchProfile(user?.uid || '') }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
