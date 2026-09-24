import React from 'react';
import { Camera, Sparkles, Heart } from 'lucide-react';
import { sound } from '../services/audio';

export default function LocketWidget({ locket, myRole, onReaction, onOpenCapture, onOpenHistory }) {
  const isSenderMe = locket && locket.senderId === myRole;

  const handleQuickReact = (emoji) => {
    sound.play('heart');
    if (onReaction) onReaction(emoji);
  };

  // Trạng thái khi chưa có ảnh nào được gửi
  if (!locket || !locket.photoUrl) {
    return (
      <div
        onClick={onOpenCapture}
        className="relative w-full aspect-square my-auto bg-slate-900/80 rounded-[36px] overflow-hidden border-2 border-dashed border-slate-700/80 hover:border-love-500/50 shadow-2xl flex flex-col items-center justify-center p-6 text-center group cursor-pointer transition select-none"
      >
        <div className="w-16 h-16 rounded-3xl bg-love-500/10 text-love-400 border border-love-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-lg shadow-love-500/10">
          <Camera className="w-8 h-8 text-love-500" />
        </div>
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
          <span>Chưa Có Khoảnh Khắc Nào</span>
          <Sparkles className="w-3.5 h-3.5 text-love-400" />
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[240px] leading-relaxed">
          Chạm vào đây hoặc nút camera bên dưới để chụp và gửi tấm ảnh Locket đầu tiên cho người yêu!
        </p>

        <span className="mt-4 px-4 py-1.5 rounded-full bg-love-600/30 text-love-300 border border-love-500/30 text-[11px] font-semibold flex items-center gap-1">
          <Camera className="w-3 h-3" />
          <span>Bấm Để Chụp Ngay</span>
        </span>
      </div>
    );
  }

  // Khi đã có ảnh thật do 1 trong 2 người gửi -> Chạm để xem lại ảnh chuẩn Locket
  return (
    <div
      onClick={(e) => {
        if (e.target.closest('button')) return;
        if (onOpenHistory) onOpenHistory();
      }}
      title="Chạm để xem lại cuộn phim Locket"
      className="relative w-full aspect-square my-auto bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-end group select-none cursor-pointer"
    >
      <img
        src={locket.photoUrl}
        alt="Locket Moment"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />

      {/* Top photo status badge */}
      <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isSenderMe ? 'bg-sky-400' : 'bg-love-500'}`} />
          {isSenderMe ? 'Bạn vừa gửi' : 'Người yêu vừa gửi'}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-slate-300 text-[10px]">
          {locket.timestamp ? new Date(locket.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
        </span>
      </div>

      {/* Caption on photo */}
      <div className="relative z-10 p-4 flex flex-col items-center gap-2">
        {locket.caption && (
          <div className="bg-black/65 backdrop-blur-md text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-2xl border border-white/20 text-center max-w-[95%] shadow-lg">
            "{locket.caption}"
          </div>
        )}

        {/* Quick Reactions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleQuickReact('❤️')}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs transition active:scale-90 flex items-center gap-1"
          >
            <span>❤️</span> <span className="text-[10px] text-white">Yêu</span>
          </button>
          <button
            onClick={() => handleQuickReact('💋')}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs transition active:scale-90 flex items-center gap-1"
          >
            <span>💋</span> <span className="text-[10px] text-white">Hôn</span>
          </button>
          <button
            onClick={() => handleQuickReact('🥰')}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs transition active:scale-90 flex items-center gap-1"
          >
            <span>🥰</span> <span className="text-[10px] text-white">Thích</span>
          </button>
        </div>
      </div>
    </div>
  );
}
