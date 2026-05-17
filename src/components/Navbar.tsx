import React from 'react';
import { BookOpen, Trophy, User, Home, Star } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { signInWithGoogle, logout } from '../lib/firebase';

export const Navbar: React.FC = () => {
  const { user, profile, loading } = useAuth();

  return (
    <nav className="h-20 bg-white border-b border-blue-100 flex items-center justify-between px-8 shadow-sm shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl shadow-inner">🎓</div>
        <div className="leading-tight">
          <h1 className="font-bold text-xl text-blue-600 font-display">TIỂU HỌC SMART</h1>
          <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Kết nối tri thức & Cuộc sống</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-6 font-bold text-sm text-slate-500">
          <button className="text-blue-600 border-b-2 border-blue-600 pb-1 flex items-center gap-1.5">
            <Home size={16} /> Trang chủ
          </button>
          <button className="hover:text-blue-500 flex items-center gap-1.5 transition-colors">
            <Star size={16} /> Chuyên đề
          </button>
          <button className="hover:text-blue-500 flex items-center gap-1.5 transition-colors">
            <Trophy size={16} /> Xếp hạng
          </button>
        </div>

        {loading ? (
          <div className="w-8 h-8 rounded-full border-2 border-blue-100 border-t-blue-500 animate-spin" />
        ) : user ? (
          <div className="flex items-center gap-3 bg-slate-50 py-1.5 px-3 rounded-full border border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{profile?.displayName}</p>
              <p className="text-[10px] text-green-600 font-bold">Lớp {profile?.grade} • {profile?.totalPoints} XP</p>
            </div>
            <button 
              onClick={() => logout()}
              className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-white text-xs hover:bg-red-500 transition-colors group relative"
              title="Đăng xuất"
            >
              <User className="group-hover:hidden" size={18} />
              <span className="hidden group-hover:block font-bold">OUT</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-bold transition-all shadow-sm flex items-center gap-2"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </nav>
  );
};
