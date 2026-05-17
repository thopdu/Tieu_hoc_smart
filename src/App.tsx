/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './lib/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PracticeSession } from './components/PracticeSession';
import { ResultsView } from './components/ResultsView';
import { Grade, Subject, PracticeConfig } from './types';

export default function App() {
  const [view, setView] = useState<"dashboard" | "practice" | "results">("dashboard");
  const [lastScore, setLastScore] = useState(0);
  const [config, setConfig] = useState<PracticeConfig>({
    grade: 1,
    subject: "Toán",
    mode: "normal",
    count: 5,
    difficulty: "trung bình"
  });

  const handleStart = (newConfig: PracticeConfig) => {
    setConfig(newConfig);
    setView("practice");
  };

  const handleFinish = (score: number) => {
    setLastScore(score);
    setView("results");
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-sky-50/50">
        <Navbar />
        
        <main className="pb-20">
          {view === "dashboard" && (
            <Dashboard onStart={handleStart} />
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

        <footer className="bg-white border-t border-slate-100 py-10 px-6 mt-auto">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-slate-400 font-medium">© 2026 Hành Trang Học Tập. Đồng hành cùng học sinh Việt Nam.</p>
            <p className="text-xs text-slate-300 mt-2 italic">Kết nối tri thức và cuộc sống</p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

