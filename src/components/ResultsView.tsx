import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowLeft, RotateCcw, Share2, Award, Check, Copy } from 'lucide-react';
import { Grade, Subject, PracticeConfig } from '../types';
import { useAuth } from '../lib/AuthContext';
import { addDoc, collection, doc, increment, updateDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';

interface ResultsViewProps {
  score: number;
  config: PracticeConfig;
  answersLog?: any[];
  onRestart: () => void;
  onGoHome: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ score, config, answersLog, onRestart, onGoHome }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const { grade, subject } = config;
  const hasSaved = React.useRef(false);

  const [aiReport, setAiReport] = useState<{ summary: string; weaknesses: string[]; recommendations: string[] } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  const isDiamondUser = profile?.membership === 'diamond';

  useEffect(() => {
    if (!isDiamondUser || !user) return;

    const fetchAIRecommendations = async () => {
      setLoadingAI(true);
      setAiError("");
      try {
        const resp = await fetch('/api/analyze-weaknesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject,
            grade,
            topic: config.topic || null,
            answersLog: answersLog || [],
            score
          })
        });

        if (!resp.ok) throw new Error("Failed to load evaluation");
        const data = await resp.json();
        setAiReport(data);
      } catch (err: any) {
        console.error("AI Evaluation Error:", err);
        setAiError("Không thể tải kết quả đánh giá học thuật từ AI.");
      } finally {
        setLoadingAI(false);
      }
    };

    fetchAIRecommendations();
  }, [user, answersLog, isDiamondUser, subject, grade, score]);

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
        try {
          handleFirestoreError(error, OperationType.CREATE, 'results');
        } catch (err) {
          // Log but don't crash
        }
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
  const shareText = config.mode === 'mock_exam'
    ? `Tớ vừa đạt ${(score / 10).toFixed(1)}/10 điểm (${score * 10} XP) môn Thi thử ${subject} Lớp ${grade}! Hãy cùng tớ tham gia thử thách ngay tại: ${shareUrl}`
    : `Tớ vừa đạt ${score}% điểm (${score * 10} XP) môn ${subject} Lớp ${grade}! Hãy cùng tớ tham gia thử thách ngay tại: ${shareUrl}`;
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
            <p className="text-2xl md:text-4xl font-black text-blue-900 font-display">
              {config.mode === 'mock_exam' ? `${(score / 10).toFixed(1)}/10 điểm` : `${score}%`}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 md:p-4 rounded-xl border border-yellow-100 shadow-sm" >
            <p className="text-yellow-600 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mb-1">XP Nhận được</p>
            <p className="text-2xl md:text-4xl font-black text-yellow-900 font-display">+{score * 10}</p>
          </div>
        </div>
 
        {isDiamondUser && (
          <div className="w-full text-left my-4 md:my-6">
            {loadingAI && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 p-5 rounded-2xl border border-indigo-100/60 shadow-inner flex flex-col items-center justify-center gap-3 animate-pulse py-8">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-black text-indigo-900 font-display text-center">Trợ lý học tập AI đang đánh giá bài làm của con...</p>
              </div>
            )}

            {aiError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold">
                ⚠️ {aiError}
              </div>
            )}

            {aiReport && (
              <div className="bg-gradient-to-br from-indigo-50/30 via-slate-50/50 to-blue-50/20 rounded-2xl p-4 md:p-5 border border-indigo-100 text-left relative overflow-hidden shadow-xs">
                {/* Glowing decorative indicator */}
                <div className="absolute top-0 right-0 bg-yellow-400 text-indigo-950 font-black text-[9px] px-2.5 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 font-display">
                  💎 Diamond AI
                </div>
                
                <h3 className="text-sm font-black text-indigo-950 flex items-center gap-1.5 uppercase mb-3.5 tracking-wide font-display">
                  ✨ NHẬN XÉT SƯ PHẠM & BỔ SUNG KIẾN THỨC
                </h3>
                
                {/* Summary */}
                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed mb-4 p-3 bg-white/70 rounded-xl border border-indigo-50 shadow-2xs">
                  💭 {aiReport.summary}
                </p>

                {/* Two Columns Grid: Weakspots & Suggestions */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Weaknesses */}
                  <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
                    <h4 className="text-[11px] sm:text-xs font-black text-rose-800 uppercase mb-2 flex items-center gap-1 font-display">
                      ❌ KIẾN THỨC CÒN YẾU (CẦN LƯU Ý)
                    </h4>
                    <ul className="space-y-1.5">
                      {aiReport.weaknesses.map((w, index) => (
                        <li key={index} className="text-xs text-rose-750 font-bold leading-relaxed flex items-start gap-1">
                          <span className="shrink-0 text-rose-500 font-black">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                    <h4 className="text-[11px] sm:text-xs font-black text-emerald-800 uppercase mb-2 flex items-center gap-1 font-display">
                      🚀 GIẢI PHÁP BỒI DƯỠNG THÊM
                    </h4>
                    <ul className="space-y-1.5">
                      {aiReport.recommendations.map((r, index) => (
                        <li key={index} className="text-xs text-emerald-700 font-bold leading-relaxed flex items-start gap-1">
                          <span className="shrink-0 text-emerald-500 font-extrabold">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
