import React, { useState } from 'react';
import { BookOpen, Trophy, User, Home, Star, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { signInWithGoogle, logout } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onLeaderboardClick: () => void;
  onHomeClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLeaderboardClick, onHomeClick }) => {
  const { user, profile, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLinks = () => (
    <>
      <button 
        onClick={() => { onHomeClick(); setIsMenuOpen(false); }}
        className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Home size={18} /> Trang chủ
      </button>
      <button 
        onClick={() => { onLeaderboardClick(); setIsMenuOpen(false); }}
        className="hover:text-blue-500 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Trophy size={18} /> Xếp hạng
      </button>
      <button 
        onClick={() => {
          onHomeClick();
          setIsMenuOpen(false);
          setTimeout(() => {
            const element = document.getElementById('topics-section');
            element?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        className="hover:text-blue-500 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Star size={18} /> Chuyên đề
      </button>
    </>
  );

  return (
    <>
      <nav className="h-20 bg-white border-b border-blue-100 flex items-center justify-between px-6 md:px-8 shadow-sm shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={onHomeClick}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-inner">🎓</div>
          <div className="leading-tight">
            <h1 className="font-bold text-lg md:text-xl text-blue-600 font-display uppercase tracking-tight">Tiểu học Smart</h1>
            <p className="hidden md:block text-[10px] uppercase tracking-widest text-blue-400 font-bold">Kết nối tri thức & Cuộc sống</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden lg:flex items-center gap-8 font-bold text-sm text-slate-500">
            <NavLinks />
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full border-2 border-blue-100 border-t-blue-500 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-2 md:gap-3 bg-slate-50 py-1.5 px-2 md:px-3 rounded-full border border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] md:text-xs font-bold text-slate-800 leading-none">{profile?.displayName}</p>
                  <p className="text-[8px] md:text-[10px] text-green-600 font-bold uppercase mt-0.5">Lớp {profile?.grade} • {profile?.totalPoints} XP</p>
                </div>
                <button 
                  onClick={() => logout()}
                  className="w-9 h-9 md:w-10 md:h-10 bg-blue-500 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-white text-xs hover:bg-red-500 transition-colors group relative cursor-pointer"
                  title="Đăng xuất"
                >
                  <User size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-8 py-2 md:py-2.5 rounded-full font-bold text-sm md:text-base transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span className="hidden sm:inline">Đăng nhập với Google</span>
                <span className="sm:hidden">Đăng nhập</span>
              </button>
            )}

            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl">🎓</div>
                  <span className="font-bold text-blue-600">TIỂU HỌC SMART</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex flex-col gap-6 font-bold text-lg text-slate-600">
                <NavLinks />
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                {user ? (
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full py-4 text-center text-red-500 font-bold border-2 border-red-50 rounded-2xl cursor-pointer"
                  >
                    Đăng xuất tài khoản
                  </button>
                ) : (
                  <button 
                    onClick={() => { signInWithGoogle(); setIsMenuOpen(false); }}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
