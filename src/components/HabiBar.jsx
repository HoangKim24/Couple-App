import React from 'react';
import { Sparkles } from 'lucide-react';

export default function HabiBar({ onTriggerEmotion }) {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex flex-col gap-2 shrink-0 select-none">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-love-400" />
          Chạm Gửi Cảm Xúc Habi
        </span>
        <span className="text-[10px] text-love-400 font-semibold">Tức thì 0.1s</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onTriggerEmotion('kiss')}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-love-950/40 border border-slate-700/60 transition active:scale-90 group"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform">💋</span>
          <span className="text-[10px] text-slate-300 font-medium mt-1">Gửi Hôn</span>
        </button>

        <button
          onClick={() => onTriggerEmotion('heart')}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-love-950/40 border border-slate-700/60 transition active:scale-90 group"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform">❤️</span>
          <span className="text-[10px] text-slate-300 font-medium mt-1">Nhớ Bạn</span>
        </button>

        <button
          onClick={() => onTriggerEmotion('hug')}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-love-950/40 border border-slate-700/60 transition active:scale-90 group"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform">🫂</span>
          <span className="text-[10px] text-slate-300 font-medium mt-1">Ôm Cái</span>
        </button>

        <button
          onClick={() => onTriggerEmotion('pout')}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-love-950/40 border border-slate-700/60 transition active:scale-90 group"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform">😤</span>
          <span className="text-[10px] text-slate-300 font-medium mt-1">Bực Bội</span>
        </button>
      </div>
    </div>
  );
}
