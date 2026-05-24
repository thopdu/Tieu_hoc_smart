import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { Subject, Grade } from '../types';
import { 
  Trophy, BookOpen, Clock, Award, ShieldAlert, Sparkles, 
  CheckCircle, ArrowUpRight, TrendingUp, HelpCircle, 
  ChevronLeft, ChevronRight, RefreshCw, Star, AlertCircle, PlayCircle,
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

  // Membership extension states
  const [extending, setExtending] = useState(false);
  const [extendSuccess, setExtendSuccess] = useState(false);

  // Grade Editing State
  const [updatingGrade, setUpdatingGrade] = useState(false);

  const handleUpdateGrade = async (newGrade: Grade) => {
    if (!user) return;
    setUpdatingGrade(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { grade: newGrade });
      await refreshProfile();
    } catch (e) {
      console.error("Error updating grade:", e);
    } finally {
      setUpdatingGrade(false);
    }
  };

  // Pagination states for practice logs
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Reset page to 1 when records length changes (e.g. on new test completion or refetch)
  useEffect(() => {
    setCurrentPage(1);
  }, [records.length]);

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
      try {
        handleFirestoreError(e, OperationType.LIST, 'results');
      } catch (err) {
        // Log but don't crash
      }
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
      try {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      } catch (err) {
        // Log but don't crash
      }
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleExtendMembership = async () => {
    if (!user) return;
    setExtending(true);
    setExtendSuccess(false);
    try {
      const now = Date.now();
      const currentExpiresAt = profile?.membershipExpiresAt || 0;
      const isCurrentlyDiamond = profile?.membership === 'diamond';
      const baseTime = (isCurrentlyDiamond && currentExpiresAt > now) ? currentExpiresAt : now;
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      const newExpiresAt = baseTime + oneYear;

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        membership: 'diamond',
        membershipActivatedAt: profile?.membershipActivatedAt || now,
        membershipExpiresAt: newExpiresAt
      });

      await refreshProfile();
      setExtendSuccess(true);
      setTimeout(() => setExtendSuccess(false), 5000);
    } catch (e) {
      console.error("Error extending/activating membership:", e);
    } finally {
      setExtending(false);
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

  // Slicing logic for pagination
  const totalPages = Math.ceil(records.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = records.slice(indexOfFirstItem, indexOfLastItem);

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
              <div className="relative inline-flex items-center">
                <select
                  value={profile?.grade || 1}
                  disabled={updatingGrade}
                  onChange={(e) => handleUpdateGrade(Number(e.target.value) as Grade)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border border-white/15 pr-8 focus:outline-none cursor-pointer transition-all appearance-none"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'right 0.75rem center', 
                    backgroundSize: '0.65em' 
                  }}
                  title="Thay đổi lớp học"
                >
                  <option value={1} className="text-slate-900 font-bold">Lớp 1</option>
                  <option value={2} className="text-slate-900 font-bold">Lớp 2</option>
                  <option value={3} className="text-slate-900 font-bold">Lớp 3</option>
                  <option value={4} className="text-slate-900 font-bold">Lớp 4</option>
                  <option value={5} className="text-slate-900 font-bold">Lớp 5</option>
                </select>
                {updatingGrade && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
                  </span>
                )}
              </div>
              {isDiamondUser ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                  <span className="bg-yellow-400 text-indigo-950 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border border-yellow-200 flex items-center gap-1 shadow-sm">
                    💎 Kim Cương
                  </span>
                  {profile?.membershipExpiresAt && (
                    <span className="bg-white/10 text-indigo-100 px-3 py-1 rounded-full text-[10px] font-bold border border-white/15">
                      Hạn dùng: {new Date(profile.membershipExpiresAt).toLocaleDateString('vi-VN')}
                      {' '}(Còn {Math.max(0, Math.ceil((profile.membershipExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)))} ngày)
                    </span>
                  )}
                </div>
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
            
            {/* KPI grid row (Visible to all students beautifully) */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-widest uppercase flex items-center gap-1.5 font-display text-blue-900 border-b border-blue-50 pb-2">
                📊 KẾT QUẢ VÀ HIỆU SUẤT TỔNG QUAN
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-blue-100 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold shrink-0">📊</div>
                  <div>
                    <span className="text-xs sm:text-sm text-black font-black block uppercase tracking-wider mb-1">ĐIỂM TRUNG BÌNH</span>
                    <p className="text-2xl font-black text-slate-800 font-display mt-0.5">{averageScore}%</p>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-blue-100 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold shrink-0">🏆</div>
                  <div>
                    <span className="text-xs sm:text-sm text-black font-black block uppercase tracking-wider mb-1">TỔNG LẦN THI</span>
                    <p className="text-2xl font-black text-slate-800 font-display mt-0.5">{totalTests}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-blue-100 hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold shrink-0">✨</div>
                  <div>
                    <span className="text-xs sm:text-sm text-black font-black block uppercase tracking-wider mb-1">HIỆU SUẤT PHÂN TÍCH</span>
                    <p className="text-base font-black text-emerald-600 font-display mt-1 tracking-tight leading-none uppercase">
                      {averageScore >= 80 ? 'XUẤT SẮC' : averageScore >= 50 ? 'KHÁ KHÁ' : 'CẦN ÔN THÊM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pedagogical criteria explanation box (Explaining the evaluation weights beautifully) */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-150 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                <span className="text-xl">🎓</span>
                <div>
                  <h4 className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-wider font-display">
                    Cơ sở khoa học & Tiêu chí Đánh giá Học thuật
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-black uppercase font-display tracking-wide mt-1">
                    BÁM SÁT THÔNG TƯ 27/2020/TT-BGDĐT • BỘ GIÁO DỤC VÀ ĐÀO TẠO
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700 leading-relaxed font-semibold">
                <div className="bg-white p-4.5 rounded-2xl border border-slate-150 shadow-sm">
                  <p className="font-black text-indigo-700 text-xs sm:text-sm mb-2 flex items-center gap-1 uppercase tracking-wide">
                    📝 Thực lực học tập (60%)
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
                    Được tính toán từ điểm trung bình thực tế các đề ôn để đo lường mức độ tiếp thu sâu, tính vững vàng của tư duy logic.
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-150 shadow-sm">
                  <p className="font-black text-blue-700 text-xs sm:text-sm mb-2 flex items-center gap-1 uppercase tracking-wide">
                    🧩 Bao phủ chuyên đề (30%)
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
                    Độ phân bổ giữa Toán, Tiếng Việt, Tiếng Anh và Tin học, giúp ba mẹ phát hiện kịp thời các học phần lệch của con.
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-slate-150 shadow-sm">
                  <p className="font-black text-amber-700 text-xs sm:text-sm mb-2 flex items-center gap-1 uppercase tracking-wide">
                    ⭐ Chuyên cần & Nỗ lực (10%)
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
                    Được đánh giá dựa trên mức tích lũy XP của con qua các đề thi rèn luyện, ghi nhận sự nỗ lực vượt khó chủ động.
                  </p>
                </div>
              </div>
            </div>
            
            {isDiamondUser ? (
              <>

                {/* AI Assistant Report Component */}
                <div className="bg-gradient-to-br from-blue-50/40 via-purple-50/20 to-white border border-blue-100/50 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-base">🤖</div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5 font-display">
                          ĐÁNH GIÁ SỰ TIẾN BỘ TỪ AI <Sparkles size={16} className="text-yellow-500 animate-pulse" />
                        </h3>
                        <p className="text-xs text-blue-600 font-extrabold uppercase tracking-wider mt-0.5">Trợ lý Cố vấn Học tập thông minh</p>
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
                      <div className="bg-white/80 backdrop-blur-sm border border-blue-100/40 p-6 rounded-2xl text-slate-800 text-[0.9rem] leading-relaxed font-bold">
                        <span className="text-xs sm:text-sm font-black tracking-widest text-blue-700 block mb-2.5 uppercase">💡 LỜI KHUYÊN & ĐÁNH GIÁ CHUNG:</span>
                        <p>{aiReport.overallSummary}</p>
                      </div>

                      {/* Strengths & Weaknesses row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl">
                          <span className="text-xs sm:text-sm font-black tracking-widest text-emerald-700 mb-3 flex items-center gap-1.5 uppercase">
                            <CheckCircle size={16} className="text-emerald-600" /> Điểm mạnh nổi bật:
                          </span>
                          <ul className="space-y-2.5 mt-2">
                            {aiReport.strengths.map((s, i) => (
                              <li key={i} className="text-sm sm:text-base text-slate-800 font-extrabold flex items-start gap-2 leading-relaxed">
                                <span className="text-emerald-600 mt-0.5">✔</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl">
                          <span className="text-xs sm:text-sm font-black tracking-widest text-rose-700 mb-3 flex items-center gap-1.5 uppercase">
                            <ShieldAlert size={16} className="text-rose-600" /> Chuyên đề cần cải tiến:
                          </span>
                          <ul className="space-y-2.5 mt-2">
                            {aiReport.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm sm:text-base text-slate-800 font-extrabold flex items-start gap-2 leading-relaxed">
                                <span className="text-rose-500 mt-0.5">⌁</span> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action plans/Suggestions */}
                      <div className="bg-indigo-50/40 border border-indigo-100 p-6 rounded-2xl">
                        <span className="text-xs sm:text-sm font-black tracking-widest text-indigo-700 mb-4 flex items-center gap-1.5 uppercase">
                          <TrendingUp size={16} className="text-indigo-600" /> KHUYẾN NGHỊ RÈN LUYỆN TỪ CHUYÊN GIA:
                        </span>
                        <ul className="space-y-3 mt-1.5">
                          {aiReport.suggestions.map((sug, i) => (
                            <li key={i} className="text-sm sm:text-base text-indigo-950 font-extrabold flex items-start gap-3 leading-relaxed bg-white/70 border border-indigo-100/30 p-3.5 sm:p-4 rounded-2xl shadow-sm">
                              <span className="bg-indigo-600 text-white font-extrabold w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">{i+1}</span>
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
                            <span className="text-xs text-black font-black uppercase tracking-wider">ĐIỂM TRUNG BÌNH</span>
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
                    Báo Cáo Học Tập - {profile?.displayName || "Học Viên"}
                  </h3>
                  
                  <p className="text-slate-300 font-medium text-sm mt-3 leading-relaxed">
                    Ba mẹ ơi! Hãy kích hoạt <span className="text-cyan-400 font-bold">"Học viên Kim Cương"</span> để mở khóa toàn bộ các tính năng phân tích và đánh giá quá trình học tập con. Vui lòng liên hệ: 0941.38.28.35, Email: vuihoctieuhoc76@gmail.com
                  </p>

                  {/* Pricing and Activation Terms details with interactive upgrade button */}
                  <div className="mt-6 inline-flex flex-col items-center bg-indigo-950/60 border border-cyan-500/30 px-6 py-4 rounded-3xl shadow-xl backdrop-blur-sm mx-auto">
                    <span className="text-[10px] text-cyan-300 font-extrabold uppercase tracking-widest mb-1 font-display">🎁 Ưu đãi Phí Kích Hoạt</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-yellow-400 font-display">200.000 VNĐ</span>
                      <span className="text-xs text-slate-300 font-bold">/ năm</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-200 font-semibold bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-900/30 mb-4">
                      <span>⚡ Thời gian kích hoạt có hiệu lực: <strong>1 năm (365 ngày)</strong></span>
                    </div>

                    <div className="w-full bg-indigo-900/40 border border-yellow-500/20 px-4 py-3 rounded-2xl text-center">
                      <p className="text-amber-300 text-xs font-bold font-display uppercase tracking-wider">⚡ Gia hạn/Kích hoạt bởi Quản trị viên</p>
                      <p className="text-[10px] text-slate-300 font-semibold mt-1">Yêu cầu kích hoạt sẽ được quản trị viên xử lý ngay sau khi liên hệ.</p>
                    </div>
                  </div>

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
                  <span className="text-[9px] text-slate-500 font-bold mt-1">Khá Giỏi</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center text-xl shadow-inner cursor-help ${totalTests >= 5 ? '' : 'grayscale opacity-30'}`} title="Cần Mẫn">🎖️</div>
                  <span className="text-[9px] text-slate-500 font-bold mt-1">Cần Mẫn</span>
                </div>
              </div>
            </div>

            {/* Historical logs */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 text-base tracking-wider uppercase mb-5 flex items-center gap-1.5">
                <Clock size={18} className="text-indigo-600 animate-pulse" /> NHẬT KÝ LUYỆN ĐỀ (LOGS)
              </h3>
              
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {currentRecords.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-150 hover:bg-white flex flex-col gap-2 hover:shadow-xs transition-all duration-300"
                  >
                    {/* Top line: Topic Name & Score */}
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug">
                        {rec.topic ? rec.topic : `${rec.subject} Lớp ${rec.grade} - Luyện đề tổng hợp`}
                      </p>
                      
                      <span className={`text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-lg border shadow-xs shrink-0 ${getScoreColor(rec.score)} font-display`}>
                        {rec.mode === 'mock_exam' ? `${(rec.score / 10).toFixed(1)}/10 điểm` : `+${rec.xpEarned} XP`}
                      </span>
                    </div>

                    {/* Bottom line: Only Completion Time */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase mt-1">
                      <span>⏱ {getVietnameseDate(rec.completedAt)}</span>
                    </div>
                  </div>
                ))}

                {records.length === 0 && (
                  <p className="text-slate-500 font-black text-sm text-center py-4">Chưa có nhật ký luyện tập nào.</p>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col items-center gap-3">
                  <div className="flex items-center justify-between w-full text-xs sm:text-sm text-slate-600 font-extrabold">
                    <span>
                      Dòng {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, records.length)} của {records.length}
                    </span>
                    <span>
                      Trang {currentPage}/{totalPages}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 w-full flex-wrap">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-xs font-black cursor-pointer"
                      title="Trang đầu"
                    >
                      &lt;&lt;
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 px-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-colors cursor-pointer"
                      title="Trang trước"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {/* Dynamic Page Buttons */}
                    {(() => {
                      const pages = [];
                      const maxButtons = 3; // Show 3 page numbers at once to save mobile space
                      let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                      let endPage = Math.min(totalPages, startPage + maxButtons - 1);

                      if (endPage - startPage + 1 < maxButtons) {
                        startPage = Math.max(1, endPage - maxButtons + 1);
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-7 h-7 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                              currentPage === i
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-slate-700 border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      return pages;
                    })()}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 px-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-colors cursor-pointer"
                      title="Trang sau"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-xs font-black cursor-pointer"
                      title="Trang cuối"
                    >
                      &gt;&gt;
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
