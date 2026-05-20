import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft, RotateCcw, Share2, Award } from 'lucide-react';
import { Grade, Subject, PracticeConfig } from '../types';
import { useAuth } from '../lib/AuthContext';
import { addDoc, collection, doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ResultsViewProps {
  score: number;
  config: PracticeConfig;
  onRestart: () => void;
  onGoHome: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ score, config, onRestart, onGoHome }) => {
  const { user, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const { grade, subject } = config;
  const hasSaved = React.useRef(false);

  const xpEarned = score * 10;

  useEffect(() => {
    if (hasSaved.current || !user) return;

    const saveResult = async () => {
      hasSaved.current = true;
      setSaving(true);
      try {
        // Save to results collection
        await addDoc(collection(db, 'results'), {
          userId: user.uid,
          subject,
          grade,
          score,
          xpEarned,
          completedAt: Date.now(),
          topic: config.topic || null,
          mode: config.mode
        });

        // Update user's total points
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          totalPoints: increment(xpEarned)
        });

        await refreshProfile();
      } catch (error) {
        console.error("Error saving results:", error);
      } finally {
        setSaving(false);
      }
    };

    saveResult();
  }, [user, score, subject, grade, xpEarned, refreshProfile]);

  const getFeedback = () => {
    if (score === 100) return { title: "Tuyệt đỉnh!", msg: "Em đã đạt điểm tuyệt đối. Thật đáng tự hào!", icon: "🏆" };
    if (score >= 80) return { title: "Xuất sắc!", msg: "Em làm rất tốt, hãy phát huy nhé!", icon: "🌟" };
    if (score >= 50) return { title: "Khá lắm!", msg: "Em đã nắm được bài, cố gắng thêm một chút nữa nhé!", icon: "👍" };
    return { title: "Cố gắng lên!", msg: "Đừng nản chí, hãy ôn tập lại và thử lại nhé!", icon: "💪" };
  };

  const feedback = getFeedback();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-6 sm:p-10 md:p-12 shadow-xl border border-blue-50 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-400 via-yellow-400 to-emerald-400" />
        
        <div className="text-[80px] md:text-[120px] leading-none mb-4 md:mb-8 drop-shadow-sm">{feedback.icon}</div>
        <h1 className="text-3xl md:text-6xl font-black text-slate-800 mb-2 md:mb-4 font-display">{feedback.title}</h1>
        <p className="text-base md:text-2xl text-slate-500 mb-8 md:mb-12 max-w-lg mx-auto leading-relaxed">{feedback.msg}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-blue-50 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-blue-100 shadow-sm">
            <p className="text-blue-500 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 md:mb-2">Kết quả bài học</p>
            <p className="text-4xl md:text-6xl font-black text-blue-900 font-display">{score}%</p>
          </div>
          <div className="bg-yellow-50 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-yellow-100 shadow-sm" >
            <p className="text-yellow-600 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 md:mb-2">XP Nhận được</p>
            <p className="text-4xl md:text-6xl font-black text-yellow-900 font-display">+{score * 10}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center">
          <button 
            onClick={onRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 md:gap-3 cursor-pointer"
          >
            <RotateCcw size={20} className="md:w-6 md:h-6" /> Làm lại
          </button>
          <button 
            onClick={onGoHome}
            className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-100 px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl transition-all shadow-sm flex items-center justify-center gap-2 md:gap-3 cursor-pointer"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" /> Về trang chủ
          </button>
        </div>

        <div className="mt-8 md:mt-12 flex flex-wrap justify-center items-center gap-3 md:gap-4">
          <button className="p-4 md:p-5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-blue-500 transition-all border border-slate-100 cursor-pointer">
            <Share2 size={20} className="md:w-6 md:h-6" />
          </button>
          <div className={`flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold text-sm md:text-base border transition-all ${saving ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
            {saving ? (
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
            ) : (
              <Award size={20} className="md:w-6 md:h-6 animate-bounce" />
            )}
            {saving ? 'Đang lưu...' : 'Đã lưu thành tích'}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
