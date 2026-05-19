import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, User, Crown } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data() as UserProfile);
        });
        setTopUsers(users);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-block p-3 md:p-4 bg-yellow-100 rounded-full mb-4">
          <Trophy size={32} className="md:w-12 md:h-12 text-yellow-600" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-800 font-display">Bảng Vàng Danh Dự</h1>
        <p className="text-sm md:text-base text-slate-500 mt-2">Vinh danh những Chiến binh hiếu học xuất sắc</p>
      </div>

      <div className="grid gap-3 md:gap-4">
        {topUsers.map((user, index) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border transition-all ${
              index === 0 ? 'bg-yellow-50 border-yellow-200' : 
              index === 1 ? 'bg-slate-50 border-slate-200' :
              index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'
            }`}
          >
            <div className="w-8 ml-1 md:ml-0 md:w-12 text-center font-black text-lg md:text-xl text-slate-400 shrink-0">
              {index === 0 ? <Crown className="text-yellow-500 mx-auto w-6 h-6 md:w-8 md:h-8" /> : index + 1}
            </div>
            
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
              <img 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-lg text-slate-800 truncate">{user.displayName}</h3>
              <div className="flex items-center gap-2 md:gap-3 mt-1">
                <span className="bg-blue-500 text-white text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full font-bold uppercase shrink-0">Lớp {user.grade}</span>
                <span className="text-slate-400 text-[10px] md:text-sm truncate">{user.badges?.length || 0} Huy hiệu</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xl md:text-2xl font-black text-blue-600 leading-none">{user.totalPoints.toLocaleString()}</p>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tight md:tracking-widest mt-1">XP</p>
            </div>
          </motion.div>
        ))}

        {topUsers.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400">Chưa có dữ liệu xếp hạng. Hãy là người đầu tiên!</p>
          </div>
        )}
      </div>
    </div>
  );
};
