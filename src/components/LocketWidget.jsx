import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Heart, Play, Square, Volume2 } from 'lucide-react';
import { sound } from '../services/audio';

function formatLocketTime(timestamp) {
  if (!timestamp) return 'Vừa xong';
  const now = Date.now();
  const diffSec = Math.floor((now - Number(timestamp)) / 1000);
  if (diffSec < 60) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return new Date(timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

export default function LocketWidget({ locket, myRole, onReaction, onOpenCapture, onOpenHistory }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);
  const isSenderMe = locket && locket.senderId === myRole;

  const togglePlayAudio = (e) => {
    e.stopPropagation();
    if (!locket?.audioUrl) return;
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          setIsPlayingAudio(true);
        }).catch((err) => console.log('Audio play err', err));
      }
    }
  };

  const handleQuickReact = (emoji, e) => {
    if (e) e.stopPropagation();
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
          {formatLocketTime(locket.timestamp)}
        </span>
      </div>

      {/* Caption & Voice Note on photo */}
      <div className="relative z-10 p-4 flex flex-col items-center gap-2">
        {/* Voice Note Pill on Photo */}
        {locket.audioUrl && (
          <button
            onClick={togglePlayAudio}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-xl transition-all active:scale-95 ${
              isPlayingAudio
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/40'
                : 'bg-black/70 text-amber-300 border-white/20 hover:bg-black/85'
            }`}
          >
            {isPlayingAudio ? (
              <Square className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
            )}

            {/* Pulsing soundwaves */}
            <div className="flex items-center gap-0.5 h-3">
              {[40, 80, 100, 60, 90, 50, 75].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 rounded-full transition-all ${
                    isPlayingAudio ? 'bg-slate-950 animate-pulse' : 'bg-amber-400'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <span className="text-[11px] font-bold font-mono">
              {isPlayingAudio ? 'Đang phát...' : locket.audioDuration ? `0:0${locket.audioDuration}s` : 'Nghe lời nhắn'}
            </span>

            <audio
              ref={audioRef}
              src={locket.audioUrl}
              onEnded={() => setIsPlayingAudio(false)}
              className="hidden"
            />
          </button>
        )}

        {locket.caption && (
          <div className="bg-black/65 backdrop-blur-md text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-2xl border border-white/20 text-center max-w-[95%] shadow-lg">
            "{locket.caption}"
          </div>
        )}

        {/* Quick Reactions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={(e) => handleQuickReact('❤️', e)}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs transition active:scale-90 flex items-center gap-1"
          >
            <span>❤️</span> <span className="text-[10px] text-white">Yêu</span>
          </button>
          <button
            onClick={(e) => handleQuickReact('💋', e)}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs transition active:scale-90 flex items-center gap-1"
          >
            <span>💋</span> <span className="text-[10px] text-white">Hôn</span>
          </button>
          <button
            onClick={(e) => handleQuickReact('🥰', e)}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs transition active:scale-90 flex items-center gap-1"
          >
            <span>🥰</span> <span className="text-[10px] text-white">Thích</span>
          </button>
        </div>
      </div>
    </div>
  );
}
