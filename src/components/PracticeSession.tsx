import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, Loader2, RefreshCw, Trophy, BrainCircuit, Play, Pause, Volume2, Eye, EyeOff } from 'lucide-react';
import { Grade, Subject, Question, PracticeConfig } from '../types';

interface PracticeSessionProps {
  config: PracticeConfig;
  onFinish: (score: number) => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({ config, onFinish }) => {
  const { grade, subject, count, difficulty, topic, mode } = config;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(config.duration ? config.duration * 60 : null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const currentQuestion = questions[currentIndex];

  const speakPassage = (textToSpeak?: string) => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    window.speechSynthesis.cancel();

    const targetText = textToSpeak || currentQuestion?.readingPassage?.content;
    if (!targetText) return;

    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = 'en-US';
    utterance.rate = speechRate;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech error", e);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopPassage = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPassage();
    } else {
      speakPassage();
    }
  };

  // If rate changes and we are speaking, speak again
  useEffect(() => {
    if (isPlaying) {
      speakPassage();
    }
  }, [speechRate]);

  // Handle auto-playing when changing questions
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setShowTranscript(false);

    if (!currentQuestion) return;

    const isListening = 
      config.subject === "Tiếng Anh" && 
      (
        (config.topic && /listening|nghe/i.test(config.topic)) || 
        (currentQuestion.section && /listening|nghe/i.test(currentQuestion.section)) ||
        (currentQuestion.readingPassage?.title && /listening|transcript/i.test(currentQuestion.readingPassage.title)) ||
        /listen/i.test(currentQuestion.questionText)
      );

    if (isListening && currentQuestion?.readingPassage?.content) {
      const timer = setTimeout(() => {
        speakPassage(currentQuestion.readingPassage?.content);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      onFinish(score);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => (t !== null ? t - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    generateQuestions();
  }, [config]);

  const generateQuestions = async () => {
    setLoading(true);
    setQuestions([]);
    try {
      const resp = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, subject, count, difficulty, topic, mode })
      });
      
      if (!resp.ok) throw new Error("Failed to fetch questions");
      
      const data = await resp.json();
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        throw new Error("Invalid questions data received");
      }
    } catch (e) {
      console.error("PracticeSession Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelection = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    let answerToCompare = selectedAnswer;
    if (currentQuestion.type === 'fill_in_blank') {
      answerToCompare = typedAnswer.trim();
    }

    if (!answerToCompare && currentQuestion.type !== 'fill_in_blank') return;
    if (currentQuestion.type === 'fill_in_blank' && !typedAnswer.trim()) return;
    
    const isCorrect = answerToCompare?.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    setIsAnswered(true);
    setFeedback(isCorrect ? "correct" : "wrong");
    
    if (isCorrect) {
      if (currentQuestion.points) {
        setScore(s => Number((s + currentQuestion.points!).toFixed(1)));
      } else {
        const pointsPerQuestion = 100 / count;
        setScore(s => Math.round(s + pointsPerQuestion));
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setTypedAnswer("");
      setIsAnswered(false);
      setFeedback(null);
    } else {
      onFinish(score);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BrainCircuit className="text-blue-500 w-16 h-16" />
        </motion.div>
        <p className="text-2xl font-bold text-blue-900 font-display animate-pulse text-center">AI đang soạn đề cho em...</p>
        <p className="text-slate-400">Em chờ một chút nhé, sắp xong rồi!</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="bg-rose-50 p-6 rounded-full">
          <RefreshCw className="text-rose-500 w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Ối, có chút trục trặc rồi!</h2>
          <p className="text-slate-500 max-w-md">Hệ thống AI đang bận một chút hoặc không thể tạo câu hỏi lúc này. Em hãy thử lại nhé!</p>
        </div>
        <button 
          onClick={generateQuestions}
          className="button-primary"
        >
          Thử lại ngay
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter">
          {config.topic || (config.mode === 'semester_review' ? `Ôn Tập Học Kỳ ${config.subject}` : `Luyện tập: ${config.subject}`)}
        </h1>
        {config.mode === 'topic_focus' && <p className="text-blue-600 font-bold text-sm md:text-base">Chuyên đề: {config.topic}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="bg-white rounded-2xl px-4 md:px-6 py-2 md:py-3 border border-blue-100 shadow-sm shrink-0">
            <span className="text-blue-600 font-bold font-display text-lg md:text-xl">Câu {currentIndex + 1}/{questions.length}</span>
          </div>
          <div className="bg-blue-600 rounded-2xl px-4 md:px-6 py-2 md:py-3 shadow-md shadow-blue-100 shrink-0">
            <span className="text-white font-bold font-display text-lg md:text-xl">Điểm: {score}</span>
          </div>
          {timeLeft !== null && (
            <div className={`rounded-2xl px-4 md:px-6 py-2 md:py-3 shadow-sm border shrink-0 flex items-center gap-2 ${timeLeft < 300 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <span className="font-bold font-display text-lg md:text-xl">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        <div className="w-full sm:flex-1 sm:max-w-xs h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
      </div>

      <div className={currentQuestion.readingPassage ? "grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch" : ""}>
        {currentQuestion.readingPassage && (
          (() => {
            const isListeningQuestion = 
              config.subject === "Tiếng Anh" && 
              (
                (config.topic && /listening|nghe/i.test(config.topic)) || 
                (currentQuestion.section && /listening|nghe/i.test(currentQuestion.section)) ||
                (currentQuestion.readingPassage?.title && /listening|transcript/i.test(currentQuestion.readingPassage.title)) ||
                /listen/i.test(currentQuestion.questionText)
              );

            if (isListeningQuestion) {
              return (
                <div className="lg:col-span-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center shadow-sm select-none relative overflow-hidden min-h-[350px]">
                  {/* Decorative background circle */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
                  
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1.5 shrink-0">
                    <Volume2 size={16} className="animate-pulse" /> PHẦN NGHE HIỂU (LISTENING)
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold mb-4">Luyện nghe Tiếng Anh cùng Trợ lý ảo</span>

                  {/* Audio Wave Visualizer */}
                  <div className="flex justify-center items-center gap-1.5 h-12 my-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <motion.div
                        key={i}
                        animate={isPlaying ? {
                          scaleY: [0.3, 1.2, 0.3],
                          backgroundColor: ["#3b82f6", "#10b981", "#3b82f6"]
                        } : { scaleY: 0.25, backgroundColor: "#cbd5e1" }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.1,
                        }}
                        className="w-1.5 h-10 rounded-full bg-slate-300 origin-center"
                      />
                    ))}
                  </div>

                  {/* Control Buttons */}
                  <div className="flex flex-col items-center gap-4 w-full px-2">
                    <button
                      onClick={togglePlayback}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                        isPlaying 
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                      }`}
                    >
                      {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                    </button>

                    {/* Speed Rate Selector */}
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-blue-100 shadow-sm text-xs font-bold text-slate-600 mt-2 shrink-0">
                      <span className="pl-3 text-slate-400 text-[10px]">TỐC ĐỘ:</span>
                      {[0.8, 1.0, 1.2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setSpeechRate(rate)}
                          className={`px-3 py-1 rounded-full text-[11px] transition-colors cursor-pointer ${
                            speechRate === rate 
                              ? 'bg-blue-600 text-white' 
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {rate === 1.0 ? 'Chuẩn' : rate === 0.8 ? 'Chậm' : 'Nhanh'}
                        </button>
                      ))}
                    </div>

                    {/* Show / Hide Transcript Button */}
                    <button
                      onClick={() => setShowTranscript(prev => !prev)}
                      className="mt-6 flex items-center gap-2 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider cursor-pointer font-display"
                    >
                      {showTranscript ? (
                        <>
                          <EyeOff size={14} /> Ẩn từ vựng (Hide Transcript)
                        </>
                      ) : (
                        <>
                          <Eye size={14} /> Hiện từ vựng (Show Transcript)
                        </>
                      )}
                    </button>

                    {/* Transcript Display Container */}
                    <AnimatePresence>
                      {showTranscript && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="w-full mt-4 bg-white border border-blue-100/60 rounded-2xl p-4 text-left max-h-[180px] overflow-y-auto shadow-inner select-text"
                        >
                          <span className="text-[10px] font-bold text-blue-500 block mb-1 uppercase">LỜI THOẠI BÀI NGHE (TRANSCRIPT):</span>
                          <p className="text-slate-600 text-sm italic font-medium leading-relaxed whitespace-pre-line">
                            {currentQuestion.readingPassage.content}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-2">💡 Khuyên dùng: Em hãy cố gắng rèn luyện khả năng nghe trước nhé!</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!showTranscript && (
                      <div className="text-[11px] text-slate-400 font-medium italic mt-2 text-center max-w-xs">
                        Nội dung đã được ẩn đi để em rèn luyện kỹ năng nghe tốt nhất. Bấm nút phía trên nếu em cần xem lại văn bản.
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/30 to-slate-50 border border-blue-100/50 p-6 sm:p-8 rounded-[2rem] flex flex-col overflow-y-auto max-h-[400px] lg:max-h-[580px] shadow-sm select-text">
                <span className="text-[10px] md:text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 shrink-0">BÀI ĐỌC THẦM:</span>
                <h3 className="text-xl font-extrabold text-slate-800 leading-tight mb-4 font-display text-center uppercase tracking-tight shrink-0">
                  {currentQuestion.readingPassage.title}
                </h3>
                <div className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">
                  {currentQuestion.readingPassage.content}
                </div>
              </div>
            );
          })()
        )}

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 shadow-sm border border-blue-50 min-h-[400px] md:min-h-[450px] flex flex-col justify-between relative overflow-hidden ${
            currentQuestion.readingPassage ? 'lg:col-span-7' : 'w-full'
          }`}
        >
          {currentQuestion.section && (
            <div className="absolute top-0 right-0 bg-blue-50 px-4 md:px-6 py-1.5 md:py-2 rounded-bl-3xl font-bold text-blue-600 text-[10px] md:text-sm uppercase ring-1 ring-blue-100/50">
              {currentQuestion.section}
            </div>
          )}

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 md:mb-10 leading-tight font-display">
              {currentQuestion.questionText}
              {currentQuestion.points && (
                <span className="ml-2 md:ml-3 text-sm md:text-base font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-xl whitespace-nowrap">
                  ({currentQuestion.points} điểm)
                </span>
              )}
            </h2>

            <div className="grid gap-3 md:gap-4">
              {currentQuestion.type === 'fill_in_blank' ? (
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => !isAnswered && setTypedAnswer(e.target.value)}
                    disabled={isAnswered}
                    placeholder="Nhập đáp án của em..."
                    className={`w-full p-5 md:p-6 rounded-2xl text-xl md:text-2xl font-bold font-display border-4 transition-all outline-none ${
                      isAnswered
                        ? typedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                          : 'bg-rose-50 border-rose-400 text-rose-700'
                        : 'bg-slate-50 border-slate-100 focus:border-blue-400 focus:bg-white text-slate-800'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && typedAnswer.trim() && !isAnswered) {
                        checkAnswer();
                      }
                    }}
                  />
                  {isAnswered && typedAnswer.trim().toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() && (
                    <div className="text-lg md:text-xl font-bold text-emerald-600 mt-1 md:mt-2">
                      Đáp án gợi ý: <span className="underline">{currentQuestion.correctAnswer}</span>
                    </div>
                  )}
                </div>
              ) : (
                currentQuestion.options?.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={!isAnswered ? { x: 4 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswerSelection(option)}
                    className={`p-4 md:p-6 rounded-2xl text-left text-lg md:text-xl font-bold font-display border-2 transition-all flex items-center justify-between gap-4 cursor-pointer ${
                      isAnswered 
                        ? option === currentQuestion.correctAnswer
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                          : option === selectedAnswer
                            ? 'bg-rose-50 border-rose-400 text-rose-700'
                            : 'bg-white border-slate-100 text-slate-300'
                        : selectedAnswer === option
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md shadow-blue-50'
                          : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex-1">{option}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {isAnswered && option === currentQuestion.correctAnswer && <CheckCircle2 className="text-emerald-500" />}
                      {isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && <XCircle className="text-rose-500" />}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 md:mt-12 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 text-center md:text-left">
            <AnimatePresence>
              {isAnswered ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex-1 flex items-center gap-3 p-4 md:p-5 rounded-2xl md:rounded-3xl ${
                    feedback === "correct" ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                  }`}
                >
                   <div className={`p-2 rounded-xl shrink-0 ${feedback === "correct" ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                     {feedback === "correct" ? <Trophy size={20} className="md:w-6 md:h-6" /> : <BrainCircuit size={20} className="md:w-6 md:h-6" />}
                   </div>
                   <span className="font-bold text-sm md:text-lg leading-tight">{currentQuestion.explanation}</span>
                </motion.div>
              ) : <div className="flex-1 hidden md:block" />}
            </AnimatePresence>

            <button
              onClick={isAnswered ? nextQuestion : checkAnswer}
              disabled={currentQuestion.type === 'fill_in_blank' ? !typedAnswer.trim() : !selectedAnswer}
              className={`w-full md:w-auto px-8 md:px-12 py-4 md:py-5 rounded-2xl font-display font-black text-lg md:text-xl transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer ${
                (currentQuestion.type === 'fill_in_blank' ? !typedAnswer.trim() : !selectedAnswer)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : isAnswered 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
              }`}
            >
              {isAnswered ? (currentIndex === questions.length - 1 ? "Xem kết quả" : "Tiếp theo") : "Kiểm tra"}
              <ArrowRight size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
