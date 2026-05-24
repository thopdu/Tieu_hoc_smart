import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { UserProfile } from '../types';
import { useAuth } from '../lib/AuthContext';
import { 
  Users, Gem, UserCheck, ShieldAlert, Search, RefreshCw, 
  ArrowLeftRight, CheckCircle2, XCircle, Award, Star
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'res', text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'));
      const snap = await getDocs(q);
      const fetched: UserProfile[] = [];
      snap.forEach(doc => {
        const data = doc.data() as UserProfile;
        let membership = data.membership || 'regular';
        let membershipExpiresAt = data.membershipExpiresAt;
        let membershipActivatedAt = data.membershipActivatedAt;

        // Auto transition expired diamond members on display
        if (membership === 'diamond' && membershipExpiresAt && membershipExpiresAt < Date.now()) {
          membership = 'regular';
          membershipExpiresAt = undefined;
          membershipActivatedAt = undefined;
        }

        fetched.push({
          uid: doc.id,
          ...data,
          membership,
          membershipExpiresAt,
          membershipActivatedAt
        } as UserProfile);
      });
      setUsers(fetched);
    } catch (e) {
      console.error("Error fetching admin users:", e);
      try {
        handleFirestoreError(e, OperationType.LIST, 'users');
      } catch (err) {
        // Log but don't crash the panel
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleMembership = async (userId: string, currentVal?: 'regular' | 'diamond') => {
    setUpdatingId(userId);
    const targetStatus = currentVal === 'diamond' ? 'regular' : 'diamond';
    const now = Date.now();
    const oneYearLater = now + 365 * 24 * 60 * 60 * 1000;
    try {
      const userRef = doc(db, 'users', userId);
      const updateData: any = {
        membership: targetStatus
      };
      if (targetStatus === 'diamond') {
        updateData.membershipActivatedAt = now;
        updateData.membershipExpiresAt = oneYearLater;
      } else {
        updateData.membershipActivatedAt = null;
        updateData.membershipExpiresAt = null;
      }

      await updateDoc(userRef, updateData);
      
      // Update local state smoothly
      setUsers(prev => prev.map(u => u.uid === userId ? { 
        ...u, 
        membership: targetStatus,
        membershipActivatedAt: targetStatus === 'diamond' ? now : undefined,
        membershipExpiresAt: targetStatus === 'diamond' ? oneYearLater : undefined
      } : u));
      
      setActionMessage({
        type: 'success',
        text: targetStatus === 'diamond'
          ? `Đã kích hoạt KIM CƯƠNG thành công! (Phí kích hoạt: 100.000 VNĐ · Thời hạn: 1 năm)`
          : 'Hạ xuống tài khoản THƯỜNG thành công.'
      });

      // If updating current user's profile, update context
      if (userId === profile?.uid) {
        await refreshProfile();
      }

      setTimeout(() => setActionMessage(null), 3000);
    } catch (e: any) {
      console.error("Failed to update status:", e);
      setActionMessage({
        type: 'res',
        text: 'Lỗi nâng cấp tài khoản: ' + e.message
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats
  const totalPupils = users.length;
  const diamondStars = users.filter(u => u.membership === 'diamond').length;
  const regularPupils = totalPupils - diamondStars;

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Intro Dashboard admin */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white mb-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-xs font-extrabold tracking-wider px-3.5 py-1 rounded-full uppercase border border-orange-400">ADMIN CONTROL CENTER</span>
              <span className="bg-slate-700 text-[11px] text-slate-300 px-2.5 py-1 rounded-md font-mono">v1.2.5</span>
            </div>
            <h2 className="text-3xl font-black mt-3 font-display">Trang Quản Trị Hệ Thống</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Nơi kích hoạt, phân quyền và nâng cấp tài khoản từ thành viên bình thường sang 
              <span className="text-blue-400 font-bold"> "Học viên Kim Cương"</span> để khám phá Đánh giá học tập bằng AI.
            </p>
          </div>

          <button 
            onClick={fetchUsers}
            className="bg-slate-700 hover:bg-slate-600 transition-all border border-slate-600 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Đồng bộ dữ liệu
          </button>
        </div>
        
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI counters row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold shrink-0">👥</div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TỔNG HỌC SINH</p>
            <p className="text-2xl font-black text-slate-800 font-display">{totalPupils}</p>
          </div>
        </div>

        <div className="bg-blue-50/40 p-5 rounded-3xl border border-blue-100/50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-lg font-bold shrink-0">💎</div>
          <div>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">HỌC VIÊN KIM CƯƠNG</p>
            <p className="text-2xl font-black text-blue-950 font-display">{diamondStars}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center text-xl font-bold shrink-0">⭐</div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HỌC VIÊN THƯỜNG</p>
            <p className="text-2xl font-black text-slate-800 font-display">{regularPupils}</p>
          </div>
        </div>

        <div className="bg-emerald-50/40 p-5 rounded-3xl border border-emerald-100/50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl font-bold shrink-0">✔</div>
          <div>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">QUYỀN PHÁT BIỂU</p>
            <p className="text-2xl font-black text-emerald-950 font-display">TỰ ĐỘNG AI</p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl mb-6 font-bold text-xs flex items-center gap-2.5 ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}
        >
          {actionMessage.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>{actionMessage.text}</span>
        </motion.div>
      )}

      {/* User Search & Table */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
        
        {/* Search Input bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">Danh sách tài khoản học viên</h3>
            <p className="text-slate-400 text-xs font-semibold">Tăng bậc hoặc hạ cấp thành viên thời gian thực</p>
          </div>

          <div className="relative max-w-sm sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm outline-none font-bold placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold animate-pulse">Đang tải học dạnh của hệ thống...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Không tìm thấy học sinh nào khớp với từ khóa tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  <th className="py-4 px-3">Học Sinh</th>
                  <th className="py-4 px-3">Email</th>
                  <th className="py-4 px-3 font-mono">Tích lũy XP</th>
                  <th className="py-4 px-3">Cấp Lớp</th>
                  <th className="py-4 px-3 text-center">Trạng Thái</th>
                  <th className="py-4 px-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 text-sm">
                {filteredUsers.map((user) => {
                  const isDiamond = user.membership === 'diamond';
                  const avatarSeed = user.photoURL || user.uid || 'default';
                  const isCurUser = user.uid === profile?.uid;

                  return (
                    <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name card */}
                      <td className="py-4 px-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-100 shadow-sm shrink-0">
                          <img 
                            src={avatarSeed.startsWith('http') ? avatarSeed : `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
                            alt="avatar" 
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 flex items-center gap-1.5 leading-tight">
                            {user.displayName}
                            {isCurUser && (
                              <span className="bg-slate-100 text-[9px] text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">BẠN</span>
                            )}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold">{user.uid}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-3 font-medium text-slate-500 text-xs">
                        {user.email || "Chưa thiết lập"}
                      </td>

                      {/* Score cumulative */}
                      <td className="py-4 px-3">
                        <span className="font-extrabold text-orange-600 font-mono text-xs">
                          {user.totalPoints ? user.totalPoints.toLocaleString() : 0} XP
                        </span>
                      </td>

                      {/* Grade level */}
                      <td className="py-4 px-3 font-bold text-slate-500 text-xs">
                        Lớp {user.grade || 1}
                      </td>

                      {/* Badge / Status */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider leading-none ${
                            isDiamond 
                              ? 'bg-blue-50 text-blue-600 border-blue-100' 
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                            {isDiamond ? (
                              <>
                                <Gem size={10} className="text-blue-500" /> KIM CƯƠNG
                              </>
                            ) : (
                              'THƯỜNG'
                            )}
                          </span>
                          {isDiamond && user.membershipExpiresAt && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              <p>Hạn dùng: {new Date(user.membershipExpiresAt).toLocaleDateString('vi-VN')}</p>
                              <p className="text-[9px] text-blue-500 font-extrabold uppercase">
                                Còn {Math.max(0, Math.ceil((user.membershipExpiresAt - Date.now()) / (1000 * 60 * 60 * 24)))} ngày
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Toggle button */}
                      <td className="py-4 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          {isDiamond && (
                            <button
                              disabled={updatingId === user.uid}
                              onClick={async () => {
                                setUpdatingId(user.uid);
                                const currentExpiresAt = user.membershipExpiresAt || Date.now();
                                const baseTime = currentExpiresAt > Date.now() ? currentExpiresAt : Date.now();
                                const oneYearLater = baseTime + 365 * 24 * 60 * 60 * 1000;
                                try {
                                  const userRef = doc(db, 'users', user.uid);
                                  await updateDoc(userRef, {
                                    membershipExpiresAt: oneYearLater
                                  });
                                  setUsers(prev => prev.map(u => u.uid === user.uid ? { 
                                    ...u, 
                                    membershipExpiresAt: oneYearLater 
                                  } : u));
                                  setActionMessage({
                                    type: 'success',
                                    text: `Đã gia hạn thành công +1 năm học viên Kim Cương cho học sinh ${user.displayName || "này"}!`
                                  });
                                  if (user.uid === profile?.uid) {
                                    await refreshProfile();
                                  }
                                  setTimeout(() => setActionMessage(null), 3000);
                                } catch (e: any) {
                                  setActionMessage({ type: 'res', text: 'Lỗi gia hạn: ' + e.message });
                                } finally {
                                  setUpdatingId(null);
                                }
                              }}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1 border border-blue-600 shadow-sm active:translate-y-0.5"
                            >
                              {updatingId === user.uid ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <>⚡ Gia hạn +1 năm</>
                              )}
                            </button>
                          )}
                          <button
                            disabled={updatingId === user.uid}
                            onClick={() => toggleMembership(user.uid, user.membership)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                              isDiamond 
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' 
                                : 'bg-emerald-600 outline-none hover:bg-emerald-700 text-white border-emerald-600 shadow-sm active:translate-y-0.5'
                            }`}
                          >
                            {updatingId === user.uid ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : isDiamond ? (
                              <span>Hạ xuống thường</span>
                            ) : (
                              <>
                                <Gem size={12} /> Kích hoạt Kim Cương (100k/năm)
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
