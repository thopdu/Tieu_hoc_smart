import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, User, Crown } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export const Leaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data() as UserProfile);
        });
        setTopUsers(users);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
          <Trophy size={48} className="text-yellow-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 font-display">Bảng Vàng Danh Dự</h1>
        <p className="text-slate-500 mt-2">Nơi vinh danh những "Chiến binh hiếu học" xuất sắc nhất</p>
      </div>

      <div className="grid gap-4">
        {topUsers.map((user, index) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all ${
              index === 0 ? 'bg-yellow-50 border-yellow-200' : 
              index === 1 ? 'bg-slate-50 border-slate-200' :
              index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'
            }`}
          >
            <div className="w-12 text-center font-black text-xl text-slate-400">
              {index === 0 ? <Crown className="text-yellow-500 mx-auto" /> : index + 1}
            </div>
            
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              <img 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800">{user.displayName}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Lớp {user.grade}</span>
                <span className="text-slate-400 text-sm">{user.badges.length} Huy hiệu</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black text-blue-600">{user.totalPoints.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP Tổng cộng</p>
            </div>
          </motion.div>
        ))}

        {topUsers.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400">Chưa có dữ liệu xếp hạng. Hãy là người đầu tiên!</p>
          </div>
        )}
      </div>
    </div>
  );
};
