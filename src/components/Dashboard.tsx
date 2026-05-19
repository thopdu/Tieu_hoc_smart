import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookText, Calculator, ChevronRight, GraduationCap, Trophy, Sparkles, Map } from 'lucide-react';
import { Grade, Subject, PracticeConfig, UserProfile } from '../types';
import { useAuth } from '../lib/AuthContext';
import { collection, limit, orderBy, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PracticeInterfaceProps {
  onStart: (config: PracticeConfig) => void;
}

export const Dashboard: React.FC<PracticeInterfaceProps> = ({ onStart }) => {
  const { profile } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(profile?.grade || null);
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchMiniLeaderboard = async () => {
      const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(3));
      const snap = await getDocs(q);
      setTopUsers(snap.docs.map(doc => doc.data() as UserProfile));
    };
    fetchMiniLeaderboard();
  }, []);

  useEffect(() => {
    if (profile?.grade && !selectedGrade) {
      setSelectedGrade(profile.grade);
    }
  }, [profile, selectedGrade]);

  const mathTopics = ["Phép cộng, phép trừ", "Phép nhân, phép chia", "Hình học & Đo lường", "Bài toán có lời văn", "Số học & So sánh"];
  const englishTopics = ["Vocabulary (Từ vựng)", "Grammar (Ngữ pháp)", "Reading (Đọc hiểu)", "Listening (Nghe hiểu)", "Phonics (Phát âm)"];

  const startNormal = (grade: Grade, subject: Subject) => {
    onStart({
      grade,
      subject,
      mode: "normal",
      count: 10,
      difficulty: "trung bình"
    });
  };

  const startSemesterReview = (grade: Grade, subject: Subject) => {
    onStart({
      grade,
      subject,
      mode: "semester_review",
      count: 10,
      difficulty: "30% nhận biết, 40% thông hiểu, 30% vận dụng"
    });
  };

  const startTopic = (grade: Grade, subject: Subject, topic: string) => {
    onStart({
      grade,
      subject,
      mode: "topic_focus",
      topic,
      count: 10,
      difficulty: "trung bình"
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const grades: Grade[] = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2.5rem] p-6 sm:p-8 md:p-12 text-white mb-8 md:mb-12 relative overflow-hidden shadow-lg min-h-[auto] md:min-h-[300px] flex items-center"
      >
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 font-display leading-tight">
            Chào bạn nhỏ, hôm nay học gì nhỉ? 👋
          </h2>
          <p className="text-blue-100 text-base md:text-lg mb-6 md:mb-8 leading-relaxed opacity-90">
            Bạn đã sẵn sàng để chinh phục những kiến thức mới và nhận huy hiệu "Chiến binh hiếu học" chưa?
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <button 
              onClick={() => profile?.lastSession && onStart(profile.lastSession)}
              disabled={!profile?.lastSession}
              className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2 ${
                profile?.lastSession 
                ? 'bg-yellow-400 hover:bg-yellow-300 text-indigo-900 border-b-4 border-yellow-600 active:border-b-0' 
                : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              Học tiếp bài cũ <ChevronRight />
            </button>
            <div className="flex -space-x-4 items-center justify-center sm:justify-start">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-blue-400 overflow-hidden shadow-sm">
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${i * 777}`} alt="avatar" />
                </div>
              ))}
              <span className="pl-6 font-bold text-sm text-blue-50">1,250+ bạn đang trực tuyến</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute right-10 bottom-0 text-[180px] opacity-20 pointer-events-none grayscale brightness-200">🦊</div>
        <Sparkles className="absolute top-10 right-1/4 text-yellow-300 w-8 h-8 animate-pulse" />
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Navigation & Subjects */}
        <div className="flex-1 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Map size={14} /> Chọn Lớp Học
              </h3>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3"
            >
              {grades.map((grade) => (
                <motion.button
                  key={grade}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGrade(grade)}
                  className={`py-3 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all text-center font-display font-bold text-base md:text-lg ${
                    selectedGrade === grade 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-blue-50 hover:border-blue-200'
                  }`}
                >
                  Lớp {grade}
                </motion.button>
              ))}
            </motion.div>
          </section>

          <AnimatePresence>
            {selectedGrade && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-8 md:space-y-10"
              >
                {/* Subject Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div 
                    onClick={() => startNormal(selectedGrade, "Toán")}
                    className="p-5 md:p-6 rounded-3xl bg-orange-50 border border-orange-100 flex items-center gap-4 cursor-pointer group hover:bg-white hover:shadow-lg hover:border-orange-200 transition-all"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl md:text-3xl text-white shadow-orange-100 shadow-md group-hover:scale-110 transition-transform">➕</div>
                    <div>
                      <h4 className="font-bold text-orange-700 text-lg md:text-xl font-display">Toán Học</h4>
                      <p className="text-xs md:text-sm text-orange-600 font-medium opacity-80">Bám sát chương trình</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => startNormal(selectedGrade, "Tiếng Việt")}
                    className="p-5 md:p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-center gap-4 cursor-pointer group hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl md:text-3xl text-white shadow-blue-100 shadow-md group-hover:scale-110 transition-transform">📖</div>
                    <div>
                      <h4 className="font-bold text-blue-700 text-lg md:text-xl font-display">Tiếng Việt</h4>
                      <p className="text-xs md:text-sm text-blue-600 font-medium opacity-80">Luyện đọc và viết</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => startNormal(selectedGrade, "Tiếng Anh")}
                    className="p-5 md:p-6 rounded-3xl bg-pink-50 border border-pink-100 flex items-center gap-4 cursor-pointer group hover:bg-white hover:shadow-lg hover:border-pink-200 transition-all"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-500 rounded-2xl flex items-center justify-center text-2xl md:text-3xl text-white shadow-pink-100 shadow-md group-hover:scale-110 transition-transform">🔤</div>
                    <div>
                      <h4 className="font-bold text-pink-700 text-lg md:text-xl font-display">Tiếng Anh</h4>
                      <p className="text-xs md:text-sm text-pink-600 font-medium opacity-80">Luyện từ vựng</p>
                    </div>
                  </div>
                </div>

                {/* Semester Review Banner */}
                <div 
                  onClick={() => startSemesterReview(selectedGrade, "Toán")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-pointer shadow-lg hover:shadow-emerald-200 transition-all group"
                >
                  <div className="flex-1">
                    <div className="bg-white/20 w-fit px-4 py-1 rounded-full text-[10px] font-bold mb-3 uppercase tracking-widest">Đặc biệt</div>
                    <h4 className="text-2xl md:text-3xl font-black font-display mb-2">Ôn Tập Học Kỳ (Đề 10 Câu)</h4>
                    <p className="text-xs md:text-sm text-emerald-50 opacity-90 leading-relaxed">Cấu trúc: Trắc nghiệm & Tự luận. Điểm số tối đa là 10.0</p>
                  </div>
                  <div className="bg-white/20 p-4 md:p-5 rounded-3xl group-hover:bg-white group-hover:text-emerald-600 transition-all self-end sm:self-center">
                    <GraduationCap size={32} className="md:w-10 md:h-10" />
                  </div>
                </div>

                {/* Topics Container */}
                <div id="topics-section" className="space-y-12 pt-8">
                  {/* Math Topics Section */}
                  <section>
                    <div className="flex items-center justify-between mb-6 px-1">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calculator size={14} className="text-orange-500" /> Toán Chuyên Đề
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {mathTopics.map((topic, i) => (
                        <button 
                          key={i}
                          onClick={() => startTopic(selectedGrade, "Toán", topic)}
                          className="bg-white border border-slate-100 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm text-sm md:text-base"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* English Topics Section */}
                  <section>
                    <div className="flex items-center justify-between mb-6 px-1">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <BookText size={14} className="text-pink-500" /> Tiếng Anh Chuyên Đề
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {englishTopics.map((topic, i) => (
                        <button 
                          key={i}
                          onClick={() => startTopic(selectedGrade, "Tiếng Anh", topic)}
                          className="bg-white border border-slate-100 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-slate-600 hover:border-pink-500 hover:text-pink-600 transition-all shadow-sm text-sm md:text-base"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Sidebar content */}
        <aside className="w-full lg:w-80 space-y-8">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-blue-50">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
              Bảng Vàng Tuần <Trophy size={18} className="text-yellow-500" />
            </h3>
            <div className="space-y-4">
              {topUsers.map((user, i) => (
                <div key={user.uid} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${user.uid === profile?.uid ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                  <span className={`font-black text-xs w-6 text-center ${i === 0 ? 'text-yellow-600' : 'text-slate-400'}`}>{i + 1}</span>
                  <div className={`w-10 h-10 rounded-full bg-blue-100 border-2 border-white overflow-hidden flex items-center justify-center`}>
                    <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`} alt="avatar" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${user.uid === profile?.uid ? 'text-blue-800' : 'text-slate-700'}`}>{user.displayName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{user.totalPoints.toLocaleString()} XP</p>
                  </div>
                  {i === 0 && <span className="text-lg">👑</span>}
                </div>
              ))}
              {topUsers.length === 0 && <p className="text-center text-xs text-slate-400 py-4 italic">Đang tải bảng xếp hạng...</p>}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-blue-50 text-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Huy hiệu mới nhất</h3>
            <div className="flex justify-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl shadow-inner cursor-help" title="Chăm chỉ">🔥</div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl shadow-inner cursor-help" title="Siêu trí tuệ">⚡</div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl shadow-inner grayscale opacity-40">?</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
