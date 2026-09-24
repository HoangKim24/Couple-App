import React from 'react';
import { sound } from '../services/audio';

export default function LocketWidget({ locket, myRole, onReaction }) {
  const isSenderMe = locket.senderId === myRole;

  const handleQuickReact = (emoji) => {
    sound.play('heart');
    if (onReaction) onReaction(emoji);
  };

  return (
    <div className="relative w-full aspect-square my-auto bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-end group select-none">
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
          Vừa xong
        </span>
      </div>

      {/* Caption on photo */}
      <div className="relative z-10 p-4 flex flex-col items-center gap-2">
        <div className="bg-black/60 backdrop-blur-md text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-2xl border border-white/20 text-center max-w-[95%] shadow-lg">
          "{locket.caption}"
        </div>

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
