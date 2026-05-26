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
import { Gem, X } from 'lucide-react';

import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './lib/firebase';

function AppContent() {
  const { user, profile, refreshProfile } = useAuth();
  const [view, setView] = useState<"dashboard" | "practice" | "results" | "leaderboard" | "profile" | "admin">("dashboard");
  const [lastScore, setLastScore] = useState(0);
  const [lastAnswersLog, setLastAnswersLog] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(false);
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

    const isDiamondUser = profile?.membership === 'diamond';
    if (!isDiamondUser) {
      setCheckingLimit(true);
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const startTimestamp = startOfDay.getTime();

        const q = query(
          collection(db, 'results'),
          where('userId', '==', user.uid),
          where('completedAt', '>=', startTimestamp)
        );
        const snap = await getDocs(q);
        if (snap.size >= 4) {
          setView("profile");
          setShowLimitModal(true);
          setCheckingLimit(false);
          return;
        }
      } catch (err) {
        console.error("Error checking limit:", err);
      } finally {
        setCheckingLimit(false);
      }
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
      try {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      } catch (err) {
        // Log but don't crash the handler
      }
    }

    setConfig(newConfig);
    setView("practice");
  };

  const handleFinish = (score: number, answersLog?: any[]) => {
    setLastScore(score);
    setLastAnswersLog(answersLog || []);
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
            answersLog={lastAnswersLog}
            onRestart={() => setView("practice")}
            onGoHome={() => setView("dashboard")}
          />
        )}
      </main>

      {checkingLimit && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <span className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-sm font-black text-indigo-900 font-display">Đang kiểm tra lượt làm bài...</span>
          </div>
        </div>
      )}

      {showLimitModal && (
        <div id="limit-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
            <button 
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mt-3">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100 shadow-inner">
                <Gem className="text-amber-500 w-8 h-8" />
              </div>
              
              <h3 className="text-lg md:text-xl font-black text-slate-800 mb-2 leading-snug font-display">
                ĐÃ ĐẠT GIỚI HẠN LUYỆN ĐỀ
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Ba mẹ ơi! Mỗi ngày tài khoản <strong className="text-slate-700">Học sinh thường</strong> chỉ được làm tối đa <strong className="text-blue-600">4 lượt luyện đề</strong> để tránh quá tải. Hãy nâng cấp lên tài khoản <strong className="text-indigo-600 font-extrabold">"KIM CƯƠNG"</strong> để con được luyện tập không giới hạn và nhận phân tích học tập AI chuyên sâu nhé!
              </p>
              
              <div className="w-full space-y-2.5">
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    setView("profile");
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-sm tracking-wide transition-all shadow-md hover:shadow-indigo-105 cursor-pointer text-center block"
                >
                  💎 KÍCH HOẠT HỘI VIÊN KIM CƯƠNG
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer text-center block"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-100 py-5 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 text-sm font-medium">© 2026 Vui Học Tiểu Học (vuihoctieuhoc.edu.vn). Đồng hành cùng học sinh lớp lá đến lớp 5.</p>
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

