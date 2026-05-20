import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Subject, Grade } from '../types';
import { 
  Trophy, BookOpen, Clock, Award, ShieldAlert, Sparkles, 
  CheckCircle, ArrowUpRight, TrendingUp, HelpCircle, 
  ChevronRight, RefreshCw, Star, AlertCircle, PlayCircle,
  Gem
} from 'lucide-react';

interface StudyRecord {
  id: string;
  userId: string;
  subject: Subject;
  grade: Grade;
  score: number;
  xpEarned: number;
  completedAt: number;
  topic?: string;
  mode?: string;
}

interface AIReport {
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export const StudentProfile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Profile Avatar Editing State
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [customAvatarSeed, setCustomAvatarSeed] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);

  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'results'),
        where('userId', '==', user.uid),
        orderBy('completedAt', 'desc')
      );
      const snap = await getDocs(q);
      const fetched = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyRecord[];
      setRecords(fetched);
    } catch (e) {
      console.error("Error fetching study records:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async (seed: string) => {
    if (!user) return;
    setSavingAvatar(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: seed });
      await refreshProfile();
      setIsEditingAvatar(false);
    } catch (e) {
      console.error("Error changing study avatar:", e);
    } finally {
      setSavingAvatar(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const generateAIReport = async (dataRecords: StudyRecord[]) => {
    if (!user || dataRecords.length === 0) return;
    setLoadingAI(true);
    setAiError(null);
    try {
      // Keep only key info for prompt efficiency
      const simplifiedResults = dataRecords.slice(0, 15).map(r => ({
        subject: r.subject,
        grade: r.grade,
        score: r.score,
        topic: r.topic || "Tổng hợp",
        mode: r.mode || "Bình thường"
      }));

      const res = await fetch("/api/analyze-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: simplifiedResults,
          grade: profile?.grade || 1,
          displayName: profile?.displayName || "Bạn nhỏ"
        })
      });

      if (!res.ok) {
        throw new Error("Không thể kết nối đến máy chủ AI.");
      }

      const data = await res.json();
      setAiReport(data);
    } catch (err: any) {
      console.error("AI report error:", err);
      setAiError(err.message || "Đã xảy ra lỗi khi tạo đánh giá học thuật.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Auto trigger AI evaluation once history is fetched (Only for Diamond users)
  useEffect(() => {
    if (records.length > 0 && !aiReport && !loadingAI && !aiError && profile?.membership === 'diamond') {
      generateAIReport(records);
    }
  }, [records, profile?.membership]);

  // Statistics
  const totalTests = records.length;
  const averageScore = totalTests > 0 
    ? Math.round(records.reduce((acc, r) => acc + r.score, 0) / totalTests) 
    : 0;
  
  const xpCollected = records.reduce((acc, r) => acc + r.xpEarned, 0);

  // Group by Subject
  const subjectStats = records.reduce((acc, r) => {
    if (!acc[r.subject]) {
      acc[r.subject] = { total: 0, sum: 0, count: 0 };
    }
    acc[r.subject].sum += r.score;
    acc[r.subject].count += 1;
    acc[r.subject].total = Math.round(acc[r.subject].sum / acc[r.subject].count);
    return acc;
  }, {} as Record<Subject, { total: number; sum: number; count: number }>);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getVietnameseDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} lúc ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const avatarSeed = profile?.photoURL || user?.uid || 'default';
  const isDiamondUser = profile?.membership === 'diamond';

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Upper Profile Intro */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white mb-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar container with hover click change status */}
          <div 
            onClick={() => setIsEditingAvatar(prev => !prev)}
            className="group relative w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 select-none shadow-md shrink-0 cursor-pointer transition-transform hover:scale-105"
            title="Bấm để thay đổi ảnh đại diện"
          >
            <img 
              src={avatarSeed.startsWith('http') ? avatarSeed : `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-indigo-950/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-black tracking-wider text-white uppercase text-center bg-indigo-600/60 px-1.5 py-0.5 rounded">Thay đổi</span>
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <h2 className="text-3xl font-black font-display">{profile?.displayName || "Học sinh"}</h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/10">Lớp {profile?.grade || 1}</span>
              {isDiamondUser ? (
                <span className="bg-yellow-400 text-indigo-950 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border border-yellow-200 flex items-center gap-1 shadow-sm">
                  💎 Kim Cương
                </span>
              ) : (
                <span className="bg-slate-700/60 text-slate-200 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-slate-600/40">
                  Học sinh thường
                </span>
              )}
            </div>
            <p className="text-indigo-100 text-sm mt-2 opacity-90 font-medium">Bảng học bạ đầy đủ, nhật ký ôn thi và phân tích thành tích cá nhân.</p>
            <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
              <span className="text-xs bg-yellow-400 text-indigo-950 font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-yellow-300">
                ⭐ {profile?.totalPoints?.toLocaleString() || xpCollected?.toLocaleString() || 0} XP tích lũy
              </span>
              <span className="text-xs bg-white/10 font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                🔥 {totalTests} Lượt luyện tập
              </span>
            </div>
          </div>
          
          <button 
            onClick={fetchRecords}
            className="mt-4 md:mt-0 bg-white/10 hover:bg-white/20 transition-all border border-white/20 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer text-white"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Tải lại bảng điểm
          </button>
        </div>

        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-1/3 top-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
      </div>

      {/* Avatar Selection Interface Panel Inline (Animated) */}
      <AnimatePresence>
        {isEditingAvatar && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-6 border border-blue-100 shadow-md mb-8 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-blue-900 text-base flex items-center gap-1.5">
                  🎨 Đổi Ảnh Đại Diện Chân Dung
                </h3>
                <p className="text-slate-400 text-xs">Bấm chọn nhân vật yêu thích của con bên dưới hoặc nhập từ khóa riêng nhé!</p>
              </div>
              <button 
                onClick={() => setIsEditingAvatar(false)} 
                className="text-slate-400 hover:text-slate-600 text-sm font-black cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-full w-7 h-7 flex items-center justify-center transition-colors"
                title="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-5">
              {[
                'Felix', 'Jack', 'Luna', 'Oliver', 'Maya', 'Leo', 'Zoe', 'Milo', 
                'Ruby', 'Jasper', 'Bella', 'Aiden', 'Daisy', 'Cookie', 'Coco', 'Pepper'
              ].map((seed) => (
                <button 
                  key={seed}
                  disabled={savingAvatar}
                  onClick={() => handleUpdateAvatar(seed)}
                  className={`p-1.5 rounded-2xl border-2 hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer bg-white ${
                    avatarSeed === seed ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-100'
                  }`}
                >
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`} alt={seed} className="w-12 h-12 mx-auto" />
                  <span className="text-[10px] text-slate-500 font-bold block text-center mt-1">{seed}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t border-slate-100 pt-4">
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-bold mb-1">Tự viết thiết kế riêng (Custom Seed)</p>
                <input 
                  type="text" 
                  placeholder="Ví dụ: sieunhan, kitty, ironman, doremon..." 
                  value={customAvatarSeed}
                  onChange={(e) => setCustomAvatarSeed(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <button
                disabled={savingAvatar || !customAvatarSeed.trim()}
                onClick={() => handleUpdateAvatar(customAvatarSeed.trim())}
                className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs px-6 py-3.5 rounded-xl cursor-pointer shadow-sm disabled:opacity-50 hover:opacity-95 transition-opacity"
              >
                {savingAvatar ? 'Đang lưu...' : 'Sáng tạo chân dung mới'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-bold">Đang tải lịch sử ôn thi và bảng điểm...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Chưa có lịch sử học tập</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">Em hãy luyện tập, giải các bài thi hoặc ôn tập các chuyên đề ở Trang chủ để mở khóa báo cáo tiến trình học tập thông minh!</p>
          <div className="text-xs text-blue-500 font-bold uppercase tracking-wider">Luyện đề ngay • Nhận ngay điểm thưởng XP</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main left column: Overall Stats & AI insights */}
          <div className="lg:col-span-8 space-y-8">
            
            {isDiamondUser ? (
              <>
                {/* KPI grid row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold shrink-0">📊</div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ĐIỂM TRUNG BÌNH</p>
                      <p className="text-2xl font-black text-slate-800 font-display">{averageScore}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold shrink-0">🏆</div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TỔNG LẦN THI</p>
                      <p className="text-2xl font-black text-slate-800 font-display">{totalTests}</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold shrink-0">✨</div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HIỆU SUẤT TRUNG BÌNH</p>
                      <p className="text-2xl font-black text-slate-800 font-display">{averageScore >= 80 ? 'XUẤT SẮC' : averageScore >= 50 ? 'KHÁ KHÁ' : 'CẦN ÔN THÊM'}</p>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Report Component */}
                <div className="bg-gradient-to-br from-blue-50/40 via-purple-50/20 to-white border border-blue-100/50 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-base">🤖</div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-1.5 font-display">
                          ĐÁNH GIÁ SỰ TIẾN BỘ TỪ AI <Sparkles size={16} className="text-yellow-500 animate-pulse" />
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold">Trợ lý Cố vấn Học tập thông minh</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => generateAIReport(records)}
                      disabled={loadingAI}
                      className="bg-white hover:bg-slate-50 disabled:opacity-50 text-blue-600 border border-blue-100 px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-sm"
                    >
                      <RefreshCw size={12} className={loadingAI ? "animate-spin" : ""} /> Cập nhật đánh giá
                    </button>
                  </div>

                  {loadingAI ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-sm font-bold text-slate-600 animate-pulse">Trợ lý AI đang chấm điểm và phân tích lỗ hổng kiến thức tiểu học...</p>
                      <p className="text-[11px] text-slate-400 mt-1">Quá trình này bám sát chuẩn kiến thức sách Kết nối tri thức.</p>
                    </div>
                  ) : aiError ? (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                      <AlertCircle size={20} className="shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold">Không thể tải đánh giá học tập AI</p>
                        <p className="opacity-80 mt-0.5">{aiError}</p>
                      </div>
                    </div>
                  ) : aiReport ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* General summary */}
                      <div className="bg-white/80 backdrop-blur-sm border border-blue-100/40 p-5 rounded-2xl text-slate-700 text-sm leading-relaxed font-medium">
                        <span className="text-[10px] font-black tracking-widest text-blue-600 block mb-2 uppercase">💡 LỜI KHUYÊN & ĐÁNH GIÁ CHUNG:</span>
                        <p>{aiReport.overallSummary}</p>
                      </div>

                      {/* Strengths & Weaknesses row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="bg-emerald-50/40 border border-emerald-100/60 p-5 rounded-2xl">
                          <span className="text-[10px] font-black tracking-widest text-emerald-600 mb-2.5 flex items-center gap-1.5 uppercase">
                            <CheckCircle size={14} className="text-emerald-500" /> Điểm mạnh nổi bật:
                          </span>
                          <ul className="space-y-2 mt-1.5">
                            {aiReport.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-slate-600 font-semibold flex items-start gap-1.5 leading-relaxed">
                                <span className="text-emerald-500 mt-0.5">✔</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-rose-50/40 border border-rose-100/60 p-5 rounded-2xl">
                          <span className="text-[10px] font-black tracking-widest text-rose-600 mb-2.5 flex items-center gap-1.5 uppercase">
                            <ShieldAlert size={14} className="text-rose-500" /> Chuyên đề cần cải tiến:
                          </span>
                          <ul className="space-y-2 mt-1.5">
                            {aiReport.weaknesses.map((w, i) => (
                              <li key={i} className="text-xs text-slate-600 font-semibold flex items-start gap-1.5 leading-relaxed">
                                <span className="text-rose-400 mt-0.5">⌁</span> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action plans/Suggestions */}
                      <div className="bg-indigo-50/30 border border-indigo-100/50 p-5 rounded-2xl">
                        <span className="text-[10px] font-black tracking-widest text-indigo-600 mb-3 flex items-center gap-1.5 uppercase">
                          <TrendingUp size={14} className="text-indigo-500" /> KHUYẾN NGHỊ RÈN LUYỆN TỪ CHUYÊN GIA:
                        </span>
                        <ul className="space-y-2 mt-1">
                          {aiReport.suggestions.map((sug, i) => (
                            <li key={i} className="text-xs text-indigo-950 font-bold flex items-start gap-2 leading-relaxed bg-white/50 border border-indigo-100/20 p-2.5 rounded-xl">
                              <span className="bg-indigo-600 text-white font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i+1}</span>
                              <span>{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-white/80 p-6 rounded-2xl text-center text-xs text-slate-400 italic">
                      Chưa thể chạy bộ phân tích thông minh do dữ liệu không đủ. Hãy làm thêm tối thiểu 1 đề ôn để trợ lý đưa ra đánh giá.
                    </div>
                  )}
                </div>

                {/* Subject breakdowns */}
                <section className="space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" /> TRUNG BÌNH THEO MÔN HỌC
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {(["Toán", "Tiếng Việt", "Tiếng Anh", "Tin học"] as Subject[]).map((subj) => {
                      const stat = subjectStats[subj] || { total: 0, count: 0 };
                      const colorMap = {
                        "Toán": { bar: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: 'border-orange-100' },
                        "Tiếng Việt": { bar: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: 'border-blue-100' },
                        "Tiếng Anh": { bar: "bg-pink-500", text: "text-pink-700", bg: "bg-pink-50", border: 'border-pink-100' },
                        "Tin học": { bar: "bg-teal-500", text: "text-teal-700", bg: "bg-teal-50", border: 'border-teal-100' }
                      };
                      const cols = colorMap[subj];

                      return (
                        <div key={subj} className="p-5 rounded-3xl border bg-white shadow-sm transition-all">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-sm text-slate-800">{subj}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${cols.bg} ${cols.text} border ${cols.border}`}>
                              {stat.count} Bài
                            </span>
                          </div>
                          
                          <div className="flex items-baseline gap-1 my-3">
                            <span className="text-3xl font-black text-slate-800 font-display">{stat.total}%</span>
                            <span className="text-[10px] text-slate-400 font-extrabold">ĐIỂM TRUNG BÌNH</span>
                          </div>

                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${cols.bar}`} 
                              style={{ width: `${stat.total || 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            ) : (
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-indigo-500/30 shadow-2xl">
                {/* Background flare */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 text-center max-w-xl mx-auto py-6">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-3xl mx-auto shadow-lg mb-6 shadow-cyan-500/25 animate-pulse">
                    💎
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-200">
                    Báo Cáo Học Tập Kim Cương AI
                  </h3>
                  
                  <p className="text-slate-300 font-medium text-sm mt-3 leading-relaxed">
                    Ba mẹ hoặc Thầy cô ơi! Hãy kích hoạt trạng thái <span className="text-cyan-400 font-bold">"Học viên Kim Cương"</span> tại trang quản trị hệ thống để mở khóa toàn bộ các siêu năng lực phân tích học tập thông minh bằng trí tuệ nhân tạo (AI):
                  </p>

                  <div className="mt-8 space-y-3.5 text-left max-w-md mx-auto">
                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10">
                      <span className="text-cyan-400 text-lg shrink-0">📊</span>
                      <div>
                        <p className="font-extrabold text-white text-xs">Thống kê điểm & Đánh giá năng lực</p>
                        <p className="text-[11px] text-slate-400 font-medium">Báo cáo trung bình môn học, phân tích tỉ lệ phần trăm hiệu suất chi tiết.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10">
                      <span className="text-purple-400 text-lg shrink-0">🤖</span>
                      <div>
                        <p className="font-extrabold text-white text-xs">Đánh giá tiến bộ tổng quan AI</p>
                        <p className="text-[11px] text-slate-400 font-medium">Trí tuệ nhân tạo Gemini tự động phân tích điểm mạnh, điểm yếu theo học bạ.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl transition-all hover:bg-white/10">
                      <span className="text-yellow-400 text-lg shrink-0">🎯</span>
                      <div>
                        <p className="font-extrabold text-white text-xs">Đề xuất chuyên đề rèn luyện</p>
                        <p className="text-[11px] text-slate-400 font-medium">Bộ đề xuất khắc phục chi tiết chuẩn sách Kết nối tri thức.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/10">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lập quyền truy cập</p>
                    <p className="text-xs text-orange-200 mt-1 leading-normal px-2">
                       Sử dụng tài khoản có quyền Quản trị (hoặc tài khoản demo chứa chữ 'admin' trong mail) để ấn nút <span className="font-black bg-slate-800 text-amber-400 px-1.5 rounded-md">Quản trị</span> và nâng cấp cho học viên này nhé!
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right column: Recent activities logs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Badges card */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm text-center">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-5 flex items-center justify-center gap-1.5">
                <Award size={16} className="text-yellow-500 animate-bounce" /> HUY HIỆU ĐÃ ĐẠT
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 bg-pink-100 rounded-full flex items-center justify-center text-xl shadow-inner cursor-help" title="Mới bắt đầu">🥇</div>
                  <span className="text-[9px] text-slate-500 font-bold mt-1">Khai Phá</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 bg-yellow-100 rounded-full flex items-center justify-center text-xl shadow-inner cursor-help" title="Làm bài tuyệt đối">🔥</div>
                  <span className="text-[9px] text-slate-500 font-bold mt-1">Tuyệt Đối</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-xl shadow-inner cursor-help ${averageScore >= 85 ? '' : 'grayscale opacity-30'}`} title="Khá Giỏi">⚡</div>
                  <span className="text-[9px] text-slate-400 font-bold mt-1">Khá Giỏi</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center text-xl shadow-inner cursor-help ${totalTests >= 5 ? '' : 'grayscale opacity-30'}`} title="Cần Mẫn">🎖️</div>
                  <span className="text-[9px] text-slate-400 font-bold mt-1">Cần Mẫn</span>
                </div>
              </div>
            </div>

            {/* Historical logs */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-5 flex items-center gap-1.5">
                <Clock size={16} className="text-indigo-500" /> NHẬT KÝ LUYỆN ĐỀ (LOGS)
              </h3>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {records.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between gap-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        {/* Subject header */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${
                            rec.subject === "Toán" ? "bg-orange-50 text-orange-600 border border-orange-100" :
                            rec.subject === "Tiếng Việt" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                            rec.subject === "Tin học" ? "bg-teal-50 text-teal-600 border border-teal-100" :
                            "bg-pink-50 text-pink-600 border border-pink-100"
                          }`}>
                            {rec.subject} Lớp {rec.grade}
                          </span>
                          
                          {rec.mode && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {rec.mode === 'semester_review' ? 'Ôn học kỳ' : 
                               rec.mode === 'topic_focus' ? 'Chuyên đề' : 
                               rec.mode === 'mock_exam' ? 'Thi thử' : 'Ôn tập'}
                            </span>
                          )}
                        </div>

                        {/* Topic detail */}
                        <p className="font-bold text-slate-700 text-xs mt-1.5 line-clamp-1">
                          {rec.topic ? rec.topic : "Luyện đề tổng hợp kiến thức"}
                        </p>
                      </div>

                      {/* Score circle badge */}
                      <span className={`text-sm font-black px-2.5 py-1 rounded-full border shrink-0 ${getScoreColor(rec.score)} font-display`}>
                        {rec.score}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase mt-1">
                      <span>⏱ {getVietnameseDate(rec.completedAt)}</span>
                      <span className="text-yellow-600">+{rec.xpEarned} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
