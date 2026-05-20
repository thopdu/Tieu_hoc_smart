/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PracticeSession } from './components/PracticeSession';
import { ResultsView } from './components/ResultsView';
import { Leaderboard } from './components/Leaderboard';
import { StudentProfile } from './components/StudentProfile';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { Grade, Subject, PracticeConfig } from './types';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

function AppContent() {
  const { user, profile, refreshProfile } = useAuth();
  const [view, setView] = useState<"dashboard" | "practice" | "results" | "leaderboard" | "profile" | "admin">("dashboard");
  const [lastScore, setLastScore] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [config, setConfig] = useState<PracticeConfig>({
    grade: 1,
    subject: "Toán",
    mode: "normal",
    count: 5,
    difficulty: "trung bình"
  });

  const handleStart = async (newConfig: PracticeConfig) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Save last session
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        lastSession: newConfig
      });
      await refreshProfile();
    } catch (e) {
      console.error("Error saving session:", e);
    }

    setConfig(newConfig);
    setView("practice");
  };

  const handleFinish = (score: number) => {
    setLastScore(score);
    setView("results");
  };

  return (
    <div className="min-h-screen bg-sky-50/50 flex flex-col">
      <Navbar 
        onLeaderboardClick={() => setView("leaderboard")} 
        onHomeClick={() => setView("dashboard")} 
        onProfileClick={() => setView("profile")}
        onAdminClick={() => setView("admin")}
      />
      
      <main className="flex-1 pb-20">
        {view === "dashboard" && (
          <Dashboard onStart={handleStart} />
        )}

        {view === "leaderboard" && (
          <Leaderboard />
        )}

        {view === "profile" && (
          <StudentProfile />
        )}

        {view === "admin" && (
          <AdminPanel />
        )}

        {view === "practice" && (
          <PracticeSession 
            config={config}
            onFinish={handleFinish} 
          />
        )}

        {view === "results" && (
          <ResultsView 
            score={lastScore} 
            config={config}
            onRestart={() => setView("practice")}
            onGoHome={() => setView("dashboard")}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-5 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 text-sm font-medium">© 2026 Vui Học Tiểu Học (tieuhoc.giasuhongtrang.edu.vn). Đồng hành cùng học sinh lớp lá đến lớp 5.</p>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

