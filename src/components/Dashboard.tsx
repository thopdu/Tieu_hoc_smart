import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookText, Calculator, ChevronRight, GraduationCap, Trophy, Sparkles, Map, Search, X, Calendar } from 'lucide-react';
import { Grade, Subject, PracticeConfig, UserProfile, PracticeMode } from '../types';
import { useAuth } from '../lib/AuthContext';
import { collection, limit, orderBy, query, getDocs } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { getWeeklyTopics } from '../lib/weeklyHomeworkData';

interface PracticeInterfaceProps {
  onStart: (config: PracticeConfig) => void;
}

export const Dashboard: React.FC<PracticeInterfaceProps> = ({ onStart }) => {
  const { profile, user, loading: authLoading } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(profile?.grade || null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'weeks' | 'topics'>('weeks');
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);

  useEffect(() => {
    // Reset subject when grade changes
    setSelectedSubject(null);
  }, [selectedGrade]);

  useEffect(() => {
    const fetchMiniLeaderboard = async () => {
      if (authLoading) return;
      if (!user) {
        setTopUsers([]);
        return;
      }
      try {
        const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(3));
        const snap = await getDocs(q);
        setTopUsers(snap.docs.map(doc => doc.data() as UserProfile));
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        try {
          handleFirestoreError(error, OperationType.LIST, 'users');
        } catch (e) {
          // Keep failure logged but don't crash app
        }
      }
    };
    fetchMiniLeaderboard();
  }, [authLoading, user]);

  useEffect(() => {
    if (profile?.grade && !selectedGrade) {
      setSelectedGrade(profile.grade);
    }
  }, [profile, selectedGrade]);

  const mathTopics = ["Phép cộng, phép trừ", "Phép nhân, phép chia", "Hình học & Đo lường", "Bài toán có lời văn", "Số học & So sánh"];
  const englishTopics = ["Vocabulary (Từ vựng)", "Grammar (Ngữ pháp)", "Reading (Đọc hiểu)", "Listening (Nghe hiểu)", "Phonics (Phát âm)"];

  const getSubjectTopics = (grade: Grade, subject: Subject): string[] => {
    if (subject === "Tiếng Việt") {
      switch (grade) {
        case 1:
          return [
            "Học âm, vần & Thanh điệu (KNTT)",
            "Đọc trơn & Viết chính tả chữ ghi âm",
            "Từ ngữ & Câu đơn giản chủ đề Gia đình",
            "Chủ đề: Nhà rông Tây Nguyên & Lễ hội",
            "Chủ đề: Loài vật quanh ta & Thiên nhiên"
          ];
        case 2:
          return [
            "Chủ điểm: Em học lớp Hai (KNTT)",
            "Chủ điểm: Mái gia đình yêu thương (KNTT)",
            "Chủ điểm: Hành tinh xanh & Cuộc sống",
            "Luyện từ & Câu: Sự vật, hoạt động, đặc điểm",
            "Mẫu câu ai làm gì? ai thế nào? ai là gì?"
          ];
        case 3:
          return [
            "Chủ điểm: Mái trường thân yêu (KNTT)",
            "Chủ điểm: Mái ấm gia đình & Bạn bè (KNTT)",
            "Chủ điểm: Đất nước ngàn năm tươi đẹp",
            "Biện pháp tu từ: So sánh & Nhân hóa",
            "Từ ngữ chỉ đặc điểm, hoạt động, trạng thái"
          ];
        case 4:
          return [
            "Chủ điểm: Trên những nẻo đường đất nước",
            "Chủ điểm: Trải nghiệm & Khám phá mới (KNTT)",
            "Chủ điểm: Chắp cánh ước mơ tuổi thơ (KNTT)",
            "Luyện từ & Câu: Danh, động, tính từ",
            "Biện pháp nhân hóa & Các loại dấu câu",
            "Cảm thụ văn học & Kể chuyện sáng tạo"
          ];
        case 5:
        default:
          return [
            "Chủ điểm: Thế giới quanh ta & Tuổi thơ (KNTT)",
            "Chủ điểm: Giữ lấy màu xanh đại ngàn",
            "Luyện từ & Câu: Đại từ, Quan hệ từ",
            "Từ đồng nghĩa, từ trái nghĩa, từ đồng âm",
            "Liên kết câu & Cấu trúc câu ghép (KNTT)",
            "Cảm thụ văn học & Viết văn miêu tả"
          ];
      }
    }
    if (subject === "Tiếng Anh") {
      return englishTopics;
    }
    if (subject === "Tin học") {
      switch (grade) {
        case 1:
          return [
            "Trò chơi luyện chuột cơ bản",
            "Nhận diện máy tính quanh em"
          ];
        case 2:
          return [
            "Làm quen với máy tính: Bàn phím & Chuột",
            "Tư thế ngồi học và An toàn về điện",
            "Xem tin tức và Giải trí lành mạnh trên Internet",
            "Khám phá thế giới số & Thiết bị thông minh",
            "Phần mềm học tập: Tập vẽ, luyện gõ phím"
          ];
        case 3:
          return [
            "Chủ đề A: Máy tính và em (KNTT)",
            "Chủ đề B: Mạng máy tính và Internet cơ bản",
            "Chủ đề C: Tổ chức lưu trữ, tìm kiếm thông tin",
            "Chủ đề D: Đạo đức, pháp luật & Văn hóa môi trường số",
            "Chủ đề E: Làm quen phần mềm Trình chiếu KNTT",
            "Chủ đề F: Giải quyết vấn đề với sự trợ giúp máy tính"
          ];
        case 4:
          return [
            "Chủ đề A: Phần cứng & Phần mềm máy tính (KNTT)",
            "Chủ đề B: Gõ bàn phím đúng cách & Bảo vệ thông tin",
            "Chủ đề C: Sử dụng Internet để tìm thông tin hữu ích",
            "Chủ đề D: Tạo bài trình chiếu đa phương tiện KNTT",
            "Chủ đề E: Làm quen ngôn ngữ lập trình Scratch",
            "Chủ đề E: Lập trình nhân vật chuyển động & Vẽ hình"
          ];
        case 5:
        default:
          return [
            "Chủ đề A: Máy tính và em - Thu thập thông tin",
            "Chủ đề B: Các dịch vụ Internet tiện ích & An toàn mạng",
            "Chủ đề C: Sắp xếp thông tin trong máy tính",
            "Chủ đề D: Tôn trọng quyền tác giả và bảo mật",
            "Chủ đề E: Trình bày đa phương tiện & Excel căn bản",
            "Chủ đề F: Lập trình Scratch: Sử dụng biến và thuật toán"
          ];
      }
    }
    return mathTopics;
  };

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

  const startExam = (grade: Grade, subject: Subject, mode: PracticeMode, title: string, duration?: number) => {
    onStart({
      grade,
      subject,
      mode,
      topic: title,
      count: mode === 'mock_exam' ? 20 : 15,
      difficulty: mode === 'mock_exam' ? "bám sát đề thi thật" : "tổng hợp kiến thức",
      duration
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

  // Dynamically build all searchable items for internal search optimization
  const getAllSearchableTopics = () => {
    const list: { grade: Grade; subject: Subject; topic: string }[] = [];
    const subjectsList: Subject[] = ["Toán", "Tiếng Việt", "Tiếng Anh", "Tin học"];
    grades.forEach(g => {
      subjectsList.forEach(s => {
        if (s === "Tin học" && g === 1) return; // Tin học is only for grades 2 to 5
        const topics = getSubjectTopics(g, s);
        topics.forEach(t => {
          list.push({ grade: g, subject: s, topic: t });
        });
      });
    });
    return list;
  };

  const searchableTopics = getAllSearchableTopics();
  const filteredSearchTopics = searchQuery.trim() !== ""
    ? searchableTopics.filter(item => 
        item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `lớp ${item.grade}`.includes(searchQuery.toLowerCase())
      )
    : [];

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
                ? 'bg-yellow-400 hover:bg-yellow-300 text-indigo-900 border-b-4 border-yellow-600 active:border-b-0 cursor-pointer' 
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

      {/* Search Bar section */}
      <div className="mb-10 max-w-2xl mx-auto relative z-20">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 w-5 h-5 focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm nhanh bài học, chủ đề... (Ví dụ: cộng trừ, Scratch, từ vựng, con vật...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-white border-2 border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl font-bold text-slate-750 placeholder-slate-400 transition-all outline-none shadow-sm shadow-slate-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {/* Real-time Search Results Box */}
        <AnimatePresence>
          {searchQuery.trim() !== '' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 mt-3 bg-white rounded-2xl border border-slate-150 shadow-2xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-100 z-50 text-slate-700"
            >
              <div className="p-3 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                <span>Kết quả tìm kiếm ({filteredSearchTopics.length})</span>
                {filteredSearchTopics.length > 0 && <span className="text-[10px] text-blue-500 lowercase font-bold">Bấm để luyện tập ngay</span>}
              </div>
              {filteredSearchTopics.length > 0 ? (
                filteredSearchTopics.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      startTopic(item.grade, item.subject, item.topic);
                      setSearchQuery('');
                    }}
                    className="w-full p-4 hover:bg-slate-50 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.topic}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.subject === 'Toán' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                          item.subject === 'Tiếng Việt' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          item.subject === 'Tin học' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                          'bg-pink-50 text-pink-600 border border-pink-100'
                        }`}>
                          {item.subject}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">
                          Lớp {item.grade}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <p className="font-bold">Không tìm thấy bài học phù hợp</p>
                  <p className="text-xs text-slate-400 mt-1">Hãy thử tìm với các cụm từ ngắn hơn như: "cộng", "chia", "vẽ", "Scratch"...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
                  className={`py-3 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all text-center font-display font-bold text-base md:text-lg cursor-pointer ${
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div 
                    onClick={() => setSelectedSubject("Toán")}
                    className={`p-5 md:p-6 rounded-3xl border transition-all cursor-pointer group flex items-center gap-4 ${
                      selectedSubject === "Toán" 
                      ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-100' 
                      : 'bg-orange-50 border-orange-100 hover:bg-white hover:shadow-lg hover:border-orange-200'
                    }`}
                  >
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-md transition-transform group-hover:scale-110 ${
                      selectedSubject === "Toán" ? 'bg-white/20' : 'bg-orange-500 text-white'
                    }`}>➕</div>
                    <div>
                      <h4 className={`font-bold text-lg md:text-xl font-display ${selectedSubject === "Toán" ? 'text-white' : 'text-orange-700'}`}>Toán Học</h4>
                      <p className={`text-xs md:text-sm font-medium ${selectedSubject === "Toán" ? 'text-orange-50' : 'text-orange-600 opacity-80'}`}>Bám sát chương trình</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedSubject("Tiếng Việt")}
                    className={`p-5 md:p-6 rounded-3xl border transition-all cursor-pointer group flex items-center gap-4 ${
                      selectedSubject === "Tiếng Việt" 
                      ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-100' 
                      : 'bg-blue-50 border-blue-100 hover:bg-white hover:shadow-lg hover:border-blue-200'
                    }`}
                  >
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-md transition-transform group-hover:scale-110 ${
                      selectedSubject === "Tiếng Việt" ? 'bg-white/20' : 'bg-blue-500 text-white'
                    }`}>📖</div>
                    <div>
                      <h4 className={`font-bold text-lg md:text-xl font-display ${selectedSubject === "Tiếng Việt" ? 'text-white' : 'text-blue-700'}`}>Tiếng Việt</h4>
                      <p className={`text-xs md:text-sm font-medium ${selectedSubject === "Tiếng Việt" ? 'text-blue-50' : 'text-blue-600 opacity-80'}`}>Luyện đọc và viết</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedSubject("Tiếng Anh")}
                    className={`p-5 md:p-6 rounded-3xl border transition-all cursor-pointer group flex items-center gap-4 ${
                      selectedSubject === "Tiếng Anh" 
                      ? 'bg-pink-500 text-white border-pink-600 shadow-lg shadow-pink-100' 
                      : 'bg-pink-50 border-pink-100 hover:bg-white hover:shadow-lg hover:border-pink-200'
                    }`}
                  >
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-md transition-transform group-hover:scale-110 ${
                      selectedSubject === "Tiếng Anh" ? 'bg-white/20' : 'bg-pink-500 text-white'
                    }`}>🔤</div>
                    <div>
                      <h4 className={`font-bold text-lg md:text-xl font-display ${selectedSubject === "Tiếng Anh" ? 'text-white' : 'text-pink-700'}`}>Tiếng Anh</h4>
                      <p className={`text-xs md:text-sm font-medium ${selectedSubject === "Tiếng Anh" ? 'text-pink-50' : 'text-pink-600 opacity-80'}`}>Luyện từ vựng</p>
                    </div>
                  </div>

                  {selectedGrade !== 1 && (
                    <div 
                      onClick={() => setSelectedSubject("Tin học")}
                      className={`p-5 md:p-6 rounded-3xl border transition-all cursor-pointer group flex items-center gap-4 ${
                        selectedSubject === "Tin học" 
                        ? 'bg-teal-500 text-white border-teal-600 shadow-lg shadow-teal-100' 
                        : 'bg-teal-50 border-teal-100 hover:bg-white hover:shadow-lg hover:border-teal-200'
                      }`}
                    >
                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-md transition-transform group-hover:scale-110 ${
                        selectedSubject === "Tin học" ? 'bg-white/20' : 'bg-teal-500 text-white'
                      }`}>💻</div>
                      <div>
                        <h4 className={`font-bold text-lg md:text-xl font-display ${selectedSubject === "Tin học" ? 'text-white' : 'text-teal-700'}`}>Tin học</h4>
                        <p className={`text-xs md:text-sm font-medium ${selectedSubject === "Tin học" ? 'text-teal-50' : 'text-teal-600 opacity-80'}`}>Kết nối tri thức</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-categories Section */}
                <AnimatePresence mode="wait">
                  {selectedSubject && (
                    <motion.div
                      key={selectedSubject}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 md:space-y-8"
                    >
                      <div className="bg-white rounded-[2rem] p-5 md:p-6 border border-slate-150/80 shadow-xs">
                        <div className="flex items-center gap-2 mb-5">
                          <Sparkles className="text-yellow-500" size={18} />
                          <h3 className="font-extrabold text-slate-800 text-base md:text-lg">Mục tiêu học tập môn {selectedSubject}:</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <button 
                            onClick={() => {
                              setActiveSegment('weeks');
                              setTimeout(() => {
                                const el = document.getElementById('topics-section');
                                el?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                            className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all text-left shadow-xs flex items-center gap-2.5 group relative overflow-hidden cursor-pointer"
                          >
                            <span className="absolute top-0 right-0 bg-rose-500 text-white font-black text-[7px] px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wider">Chọn lọc</span>
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">📅</div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-xs md:text-sm text-indigo-950 truncate">Bài tập tuần (KNTT)</span>
                              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider truncate">35 Tuần chuẩn SGK</span>
                            </div>
                            <div className="absolute -right-2 -bottom-2 text-2xl opacity-10">🗓️</div>
                          </button>

                          <button 
                            onClick={() => {
                              setActiveSegment('topics');
                              setTimeout(() => {
                                const el = document.getElementById('topics-section');
                                el?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                            className="p-3 rounded-2xl bg-white border border-slate-150 hover:border-blue-500 hover:shadow-md transition-all text-left shadow-xs flex items-center gap-2.5 group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-300 group-hover:text-blue-900 transition-colors shrink-0 text-sm">🎯</div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-xs md:text-sm text-slate-800">Luyện tập Chuyên đề</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Học theo kỹ năng</span>
                            </div>
                          </button>

                          <button 
                            onClick={() => startExam(selectedGrade, selectedSubject, "midterm_review", "Ôn tập giữa kỳ I")}
                            className="p-3 rounded-2xl bg-white border border-slate-150 hover:border-emerald-500 hover:shadow-md transition-all text-left shadow-xs flex items-center gap-2.5 group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-300 group-hover:text-emerald-900 transition-colors shrink-0 text-sm">📝</div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-xs md:text-sm text-slate-800">Ôn tập giữa kỳ I</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Luyện đề giữa kỳ I</span>
                            </div>
                          </button>

                          <button 
                            onClick={() => startExam(selectedGrade, selectedSubject, "final_review", "Ôn thi cuối kỳ I")}
                            className="p-3 rounded-2xl bg-white border border-slate-150 hover:border-indigo-500 hover:shadow-md transition-all text-left shadow-xs flex items-center gap-2.5 group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-300 group-hover:text-indigo-900 transition-colors shrink-0 text-sm">🎓</div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-xs md:text-sm text-slate-800">Ôn thi cuối kỳ I</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Luyện đề thi học kỳ I</span>
                            </div>
                          </button>

                          <button 
                            onClick={() => startExam(selectedGrade, selectedSubject, "midterm_review", "Ôn tập giữa kỳ II")}
                            className="p-3 rounded-2xl bg-white border border-slate-150 hover:border-orange-500 hover:shadow-md transition-all text-left shadow-xs flex items-center gap-2.5 group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-300 group-hover:text-orange-900 transition-colors shrink-0 text-sm">📚</div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-xs md:text-sm text-slate-800">Ôn tập giữa kỳ II</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Luyện đề giữa kỳ II</span>
                            </div>
                          </button>

                          <button 
                            onClick={() => startExam(selectedGrade, selectedSubject, "final_review", "Ôn thi cuối kỳ II")}
                            className="p-3 rounded-2xl bg-white border border-slate-150 hover:border-pink-500 hover:shadow-md transition-all text-left shadow-xs flex items-center gap-2.5 group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 group-hover:bg-pink-300 group-hover:text-pink-900 transition-colors shrink-0 text-sm">🌟</div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-xs md:text-sm text-slate-800">Ôn thi cuối kỳ II</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Luyện đề thi học kỳ II</span>
                            </div>
                          </button>

                          <button 
                            onClick={() => startExam(selectedGrade, selectedSubject, "mock_exam", "Thi thử học kỳ I", 60)}
                            className="p-3 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50/40 border border-yellow-250 hover:border-yellow-500 hover:shadow-md transition-all text-left shadow-xs flex items-center gap-2.5 group relative overflow-hidden cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-yellow-500 flex items-center justify-center text-white shrink-0 text-sm">⏰</div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-xs md:text-sm text-yellow-800">Thi thử học kỳ I</span>
                              <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider font-mono">60 Phút • 20 câu</span>
                            </div>
                            <div className="absolute -right-2 -bottom-2 text-2xl opacity-10">⏳</div>
                          </button>

                          <button 
                            onClick={() => startExam(selectedGrade, selectedSubject, "mock_exam", "Thi thử học kỳ II", 60)}
                            className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-250 hover:border-blue-500 hover:shadow-md transition-all text-left shadow-xs flex items-center gap-2.5 group relative overflow-hidden cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0 text-sm">⏰</div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-xs md:text-sm text-blue-800">Thi thử học kỳ II</span>
                              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider font-mono">60 Phút • 20 câu</span>
                            </div>
                            <div className="absolute -right-2 -bottom-2 text-2xl opacity-10">⏳</div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Topics & Weekly Container */}
                <div id="topics-section" className="space-y-8 pt-4">
                  {/* Modern segment control tab switcher */}
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md">
                    <button
                      onClick={() => setActiveSegment('weeks')}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeSegment === 'weeks'
                          ? 'bg-white text-indigo-950 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Calendar size={16} />
                      Bài tập tuần (KNTT)
                    </button>
                    <button
                      onClick={() => setActiveSegment('topics')}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeSegment === 'topics'
                          ? 'bg-white text-indigo-950 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles size={16} />
                      Luyện Chuyên đề
                    </button>
                  </div>

                  {activeSegment === 'weeks' ? (
                    <section className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-4 px-1">
                        <div>
                          <h3 className="font-bold text-slate-800 text-xl font-display flex items-center gap-2">
                            <span>📅</span> 35 Bài tập tuần bám sát SGK Kết nối tri thức
                          </h3>
                          <p className="text-slate-500 text-xs">Lộ trình rèn luyện tuần tự đầy đủ, chi tiết từ Bộ Giáo Dục.</p>
                        </div>

                        {/* Semester toggle */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                          <button
                            onClick={() => setSelectedSemester(1)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selectedSemester === 1 ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500'
                            }`}
                          >
                            Học kỳ I (T1-18)
                          </button>
                          <button
                            onClick={() => setSelectedSemester(2)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selectedSemester === 2 ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500'
                            }`}
                          >
                            Học kỳ II (T19-35)
                          </button>
                        </div>
                      </div>

                      {/* Weeks list inside selected semester */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getWeeklyTopics(selectedGrade || 1, selectedSubject || "Toán")
                          .filter(t => t.semester === selectedSemester)
                          .map((weekTopic) => {
                            const isEnglish = (selectedSubject || "Toán") === "Tiếng Anh";
                            const isVietnamese = (selectedSubject || "Toán") === "Tiếng Việt";
                            const isMath = (selectedSubject || "Toán") === "Toán";
                            const isInfo = (selectedSubject || "Toán") === "Tin học";

                            const accentBg = isMath 
                              ? 'border-orange-100 hover:border-orange-300 hover:bg-orange-50/20' 
                              : isVietnamese 
                              ? 'border-blue-100 hover:border-blue-300 hover:bg-blue-50/20' 
                              : isEnglish 
                              ? 'border-pink-100 hover:border-pink-300 hover:bg-pink-50/20' 
                              : 'border-teal-100 hover:border-teal-300 hover:bg-teal-50/20';

                            const badgeColor = isMath 
                              ? 'bg-orange-100 text-orange-700' 
                              : isVietnamese 
                              ? 'bg-blue-100 text-blue-700' 
                              : isEnglish 
                              ? 'bg-pink-100 text-pink-700' 
                              : 'bg-teal-100 text-teal-700';

                            const btnStyle = isMath
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : isVietnamese
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : isEnglish
                              ? 'bg-pink-500 hover:bg-pink-600 text-white'
                              : 'bg-teal-500 hover:bg-teal-600 text-white';

                            return (
                              <motion.div
                                key={weekTopic.week}
                                layoutId={`week-card-${weekTopic.week}`}
                                className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all flex flex-col justify-between gap-4 shadow-sm group ${accentBg}`}
                                onClick={() => startTopic(selectedGrade || 1, selectedSubject || "Toán", weekTopic.title)}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${badgeColor}`}>
                                      Tuần {weekTopic.week}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Học kỳ {weekTopic.semester}</span>
                                  </div>
                                  <h4 className="font-extrabold text-slate-800 text-base md:text-lg group-hover:text-indigo-950 transition-colors">
                                    {weekTopic.title}
                                  </h4>
                                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                    {weekTopic.description}
                                  </p>
                                </div>
                                <div className="flex items-center justify-end pt-2 border-t border-slate-50">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startTopic(selectedGrade || 1, selectedSubject || "Toán", weekTopic.title);
                                    }}
                                    className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all w-full justify-center sm:w-auto cursor-pointer ${btnStyle}`}
                                  >
                                    Luyện đề ngay <ChevronRight size={14} />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                      </div>
                    </section>
                  ) : (
                    <section className="space-y-6">
                      <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          {(!selectedSubject || selectedSubject === "Toán") && (
                            <>
                              <Calculator size={14} className="text-orange-500" /> Toán Chuyên Đề
                            </>
                          )}
                          {selectedSubject === "Tiếng Việt" && (
                            <>
                              <BookText size={14} className="text-blue-500" /> Tiếng Việt - Sách Kết nối tri thức
                            </>
                          )}
                          {selectedSubject === "Tiếng Anh" && (
                            <>
                              <Sparkles size={14} className="text-pink-500" /> Tiếng Anh Chuyên Đề
                            </>
                          )}
                          {selectedSubject === "Tin học" && (
                            <>
                              <BookText size={14} className="text-teal-500" /> Tin học - Sách Kết nối tri thức
                            </>
                          )}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {getSubjectTopics(selectedGrade || 1, selectedSubject || "Toán").map((topic, i) => (
                          <button 
                            key={i}
                            onClick={() => startTopic(selectedGrade || 1, selectedSubject || "Toán", topic)}
                            className={`bg-white border border-slate-100 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-slate-600 transition-all shadow-sm text-sm md:text-base cursor-pointer ${
                              (!selectedSubject || selectedSubject === "Toán")
                                ? "hover:border-orange-500 hover:text-orange-600"
                                : selectedSubject === "Tiếng Việt"
                                ? "hover:border-blue-500 hover:text-blue-600"
                                : selectedSubject === "Tiếng Anh"
                                ? "hover:border-pink-500 hover:text-pink-600"
                                : "hover:border-teal-500 hover:text-teal-600"
                            }`}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
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
              {topUsers.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4 italic">
                  {user ? "Đang tải bảng xếp hạng..." : "Đăng nhập để xem bảng vàng"}
                </p>
              )}
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
