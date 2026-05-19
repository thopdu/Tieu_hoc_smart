import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookText, Calculator, ChevronRight, GraduationCap, Trophy, Sparkles, Map } from 'lucide-react';
import { Grade, Subject, PracticeConfig } from '../types';

interface PracticeInterfaceProps {
  onStart: (config: PracticeConfig) => void;
}

export const Dashboard: React.FC<PracticeInterfaceProps> = ({ onStart }) => {
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

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
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white mb-12 relative overflow-hidden shadow-lg min-h-[300px] flex items-center"
      >
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black mb-4 font-display leading-tight">
            Chào bạn nhỏ, hôm nay học gì nhỉ? 👋
          </h2>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed opacity-90">
            Bạn đã sẵn sàng để chinh phục những kiến thức mới và nhận huy hiệu "Chiến binh hiếu học" chưa?
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-md flex items-center gap-2">
              Học tiếp bài cũ <ChevronRight />
            </button>
            <div className="flex -space-x-4 items-center">
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
              className="grid grid-cols-5 gap-3"
            >
              {grades.map((grade) => (
                <motion.button
                  key={grade}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGrade(grade)}
                  className={`py-4 rounded-2xl border-2 transition-all text-center font-display font-bold text-lg ${
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
                className="space-y-10"
              >
                {/* Subject Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div 
                    onClick={() => startNormal(selectedGrade, "Toán")}
                    className="p-6 rounded-3xl bg-orange-50 border border-orange-100 flex items-center gap-4 cursor-pointer group hover:bg-white hover:shadow-lg hover:border-orange-200 transition-all"
                  >
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-3xl text-white shadow-orange-100 shadow-md group-hover:scale-110 transition-transform">➕</div>
                    <div>
                      <h4 className="font-bold text-orange-700 text-xl font-display">Toán Học</h4>
                      <p className="text-sm text-orange-600 font-medium">Bám sát chương trình Lớp {selectedGrade}</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => startNormal(selectedGrade, "Tiếng Việt")}
                    className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-center gap-4 cursor-pointer group hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all"
                  >
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl text-white shadow-blue-100 shadow-md group-hover:scale-110 transition-transform">📖</div>
                    <div>
                      <h4 className="font-bold text-blue-700 text-xl font-display">Tiếng Việt</h4>
                      <p className="text-sm text-blue-600 font-medium">Luyện đọc và viết Lớp {selectedGrade}</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => startNormal(selectedGrade, "Tiếng Anh")}
                    className="p-6 rounded-3xl bg-pink-50 border border-pink-100 flex items-center gap-4 cursor-pointer group hover:bg-white hover:shadow-lg hover:border-pink-200 transition-all"
                  >
                    <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center text-3xl text-white shadow-pink-100 shadow-md group-hover:scale-110 transition-transform">🔤</div>
                    <div>
                      <h4 className="font-bold text-pink-700 text-xl font-display">Tiếng Anh</h4>
                      <p className="text-sm text-pink-600 font-medium">Luyện từ vựng và câu Lớp {selectedGrade}</p>
                    </div>
                  </div>
                </div>

                {/* Semester Review Banner */}
                <div 
                  onClick={() => startSemesterReview(selectedGrade, "Toán")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between cursor-pointer shadow-lg hover:shadow-emerald-200 transition-all group"
                >
                  <div>
                    <div className="bg-white/20 w-fit px-4 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-widest">Đặc biệt</div>
                    <h4 className="text-3xl font-black font-display mb-2">Ôn Tập Học Kỳ (Đề 10 Câu)</h4>
                    <p className="text-emerald-50 opacity-90">Cấu trúc: Trắc nghiệm & Tự luận. Điểm số tối đa là 10.0</p>
                  </div>
                  <div className="bg-white/20 p-5 rounded-3xl group-hover:bg-white group-hover:text-emerald-600 transition-all">
                    <GraduationCap size={40} />
                  </div>
                </div>

                {/* Math Topics Section */}
                <section>
                  <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Calculator size={14} className="text-orange-500" /> Toán Chuyên Đề
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {mathTopics.map((topic, i) => (
                      <button 
                        key={i}
                        onClick={() => startTopic(selectedGrade, "Toán", topic)}
                        className="bg-white border border-slate-100 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
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
                  <div className="flex flex-wrap gap-3">
                    {englishTopics.map((topic, i) => (
                      <button 
                        key={i}
                        onClick={() => startTopic(selectedGrade, "Tiếng Anh", topic)}
                        className="bg-white border border-slate-100 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:border-pink-500 hover:text-pink-600 transition-all shadow-sm"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </section>
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
              {[
                { name: "Minh Tuấn", xp: "3,420", color: "bg-yellow-400", rank: 1, symbol: "👑" },
                { name: "Hoàng Anh", xp: "2,890", color: "bg-indigo-400", rank: 2 },
                { name: "Bạn", xp: "1,250", color: "bg-blue-500", rank: 7, me: true },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${item.me ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                  <span className={`font-black text-xs w-6 text-center ${item.rank === 1 ? 'text-yellow-600' : 'text-slate-400'}`}>{item.rank}</span>
                  <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {item.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${item.me ? 'text-blue-800' : 'text-slate-700'}`}>{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.xp} XP</p>
                  </div>
                  {item.symbol && <span className="text-lg">{item.symbol}</span>}
                </div>
              ))}
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
