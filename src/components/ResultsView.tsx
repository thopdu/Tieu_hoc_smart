import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowLeft, RotateCcw, Share2, Award, Check, Copy } from 'lucide-react';
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
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const shareUrl = window.location.origin || 'https://tieuhoc.giasuhongtrang.edu.vn/';
  const shareText = `Tớ vừa đạt ${score}% điểm (${score * 10} XP) môn ${subject} Lớp ${grade}! Hãy cùng tớ tham gia thử thách ngay tại: ${shareUrl}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
  const zaloShareUrl = `https://zalo.me/share?to=&utm_source=&utm_medium=&utm_campaign=&url=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const feedback = getFeedback();

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 md:py-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl md:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-xl border border-blue-50 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-yellow-400 to-emerald-400" />
        
        <div className="text-[50px] md:text-[70px] leading-none mb-2 md:mb-3 drop-shadow-sm">{feedback.icon}</div>
        <h1 className="text-xl md:text-3xl font-black text-slate-800 mb-1 font-display">{feedback.title}</h1>
        <p className="text-xs md:text-sm text-slate-500 mb-4 md:mb-6 max-w-md mx-auto leading-relaxed">{feedback.msg}</p>
 
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-blue-50 p-3 md:p-4 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-blue-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mb-1">Kết quả bài học</p>
            <p className="text-2xl md:text-4xl font-black text-blue-900 font-display">{score}%</p>
          </div>
          <div className="bg-yellow-50 p-3 md:p-4 rounded-xl border border-yellow-100 shadow-sm" >
            <p className="text-yellow-600 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mb-1">XP Nhận được</p>
            <p className="text-2xl md:text-4xl font-black text-yellow-900 font-display">+{score * 10}</p>
          </div>
        </div>
 
        <div className="flex flex-row gap-3 justify-center items-center">
          <button 
            onClick={onRestart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-sm md:text-base transition-all shadow-md hover:shadow-blue-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={16} className="md:w-5 md:h-5" /> Làm lại
          </button>
          <button 
            onClick={onGoHome}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-sm md:text-base transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={16} className="md:w-5 md:h-5" /> Về trang chủ
          </button>
        </div>
 
        <div className="mt-4 md:mt-6 flex flex-col items-center justify-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <button 
              onClick={() => setShowShareOptions(!showShareOptions)}
              className={`p-2 md:p-2.5 rounded-xl transition-all border cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                showShareOptions 
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-500 border-slate-200'
              }`}
            >
              <Share2 size={16} className="md:w-5 md:h-5" />
              <span>Chia sẻ thành tích</span>
            </button>

            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs border transition-all ${saving ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
              {saving ? (
                <div className="w-3.5 h-3.5 border border-slate-300 border-t-slate-500 rounded-full animate-spin" />
              ) : (
                <Award size={16} className="md:w-5 md:h-5 animate-bounce" />
              )}
              {saving ? 'Đang lưu...' : 'Đã lưu thành tích'}
            </div>
          </div>

          <AnimatePresence>
            {showShareOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden w-full max-w-md bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex flex-col gap-2.5"
              >
                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider text-center">
                  Cùng chia sẻ niềm vui học tập với bạn bè
                </p>
                
                <div className="flex flex-row gap-2 justify-center items-center">
                  {/* Share Facebook */}
                  <a 
                    href={facebookShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#1877F2] hover:bg-[#166FE5] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                    <span>Facebook</span>
                  </a>

                  {/* Share Zalo */}
                  <a 
                    href={zaloShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#0068FF] hover:bg-[#005cd1] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
                  >
                    <span className="font-extrabold text-[8px] uppercase tracking-tighter bg-white text-[#0068FF] px-1 py-0.5 rounded leading-none">
                      Zalo
                    </span>
                    <span>Zalo</span>
                  </a>

                  {/* Copy Link */}
                  <button 
                    onClick={handleCopyLink}
                    className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Đã sao chép' : 'Copy link'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
