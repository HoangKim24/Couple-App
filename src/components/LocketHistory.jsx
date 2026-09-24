import React, { useState } from 'react';
import { X, Grid, LayoutList, Download, Trash2, Heart, ChevronLeft, ChevronRight, Sparkles, Camera, Calendar } from 'lucide-react';
import { sound } from '../services/audio';

export default function LocketHistory({
  isOpen,
  onClose,
  photos = [],
  onDeletePhoto,
  onReactPhoto,
  onOpenCamera
}) {
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'grid'
  const [activePhotoIndex, setActivePhotoIndex] = useState(null); // Khi mở xem từng ảnh full-screen

  if (!isOpen) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Gần đây';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Hôm nay lúc ${timeStr}`;
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hôm qua lúc ${timeStr}`;
    }

    return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} • ${timeStr}`;
  };

  const handleDownload = (photoUrl, id) => {
    sound.play('tap');
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `locket-moment-${id || Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = (id) => {
    sound.play('tap');
    if (window.confirm('Bạn có chắc muốn xóa khoảnh khắc kỷ niệm này?')) {
      onDeletePhoto(id);
      if (activePhotoIndex !== null) {
        if (photos.length <= 1) {
          setActivePhotoIndex(null);
        } else if (activePhotoIndex >= photos.length - 1) {
          setActivePhotoIndex(photos.length - 2);
        }
      }
    }
  };

  const handleNextPhoto = () => {
    if (activePhotoIndex < photos.length - 1) {
      sound.play('tap');
      setActivePhotoIndex(activePhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (activePhotoIndex > 0) {
      sound.play('tap');
      setActivePhotoIndex(activePhotoIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden select-none safe-pt safe-pb">
      
      {/* TOP HEADER */}
      <div className="w-full max-w-lg mx-auto px-4 py-3 flex items-center justify-between border-b border-white/10 z-20">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 flex items-center justify-center active:scale-90 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-white tracking-wider font-display">CUỘN PHIM LOCKET</h2>
          <span className="text-[11px] text-amber-300 font-semibold">{photos.length} khoảnh khắc</span>
        </div>

        {/* View Switcher: Feed / Grid */}
        <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
          <button
            onClick={() => { sound.play('tap'); setViewMode('feed'); }}
            className={`p-1.5 rounded-xl transition ${viewMode === 'feed' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            title="Dạng cuộn thẻ Locket"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => { sound.play('tap'); setViewMode('grid'); }}
            className={`p-1.5 rounded-xl transition ${viewMode === 'grid' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
            title="Dạng lưới ảnh"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto hide-scrollbar w-full max-w-lg mx-auto p-4">
        {photos.length === 0 ? (
          /* Empty State khi chưa có ảnh nào */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
            <div className="w-20 h-20 rounded-3xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center shadow-lg">
              <Camera className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Chưa Có Kỷ Niệm Nào</h3>
            <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
              Các bức ảnh Locket chụp và gửi cho nhau sẽ được lưu trữ tự động tại cuộn phim này!
            </p>
            <button
              onClick={() => { onClose(); onOpenCamera?.(); }}
              className="mt-3 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-extrabold text-xs shadow-xl active:scale-95 transition flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Chụp Bức Ảnh Đầu Tiên</span>
            </button>
          </div>
        ) : viewMode === 'feed' ? (
          /* FEED VIEW (Cuộn thẻ Locket chuẩn 1:1) */
          <div className="flex flex-col gap-6 pb-8">
            {photos.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-slate-950/80 border border-white/10 rounded-[36px] overflow-hidden p-3.5 shadow-2xl flex flex-col gap-3"
              >
                {/* Header card: Sender & Date */}
                <div className="flex items-center justify-between px-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-bold text-white font-display tracking-wide">
                      {item.senderName ? `${item.senderName} gửi` : 'Khoảnh khắc Locket'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                {/* 1:1 Square Locket Photo Frame */}
                <div
                  onClick={() => setActivePhotoIndex(index)}
                  className="relative w-full aspect-square bg-slate-900 rounded-[28px] overflow-hidden cursor-pointer group shadow-lg"
                >
                  <img
                    src={item.photoUrl}
                    alt="Locket moment"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Locket Caption Bar */}
                  {item.caption && (
                    <div className="absolute bottom-3.5 inset-x-3.5 flex justify-center pointer-events-none">
                      <div className="bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-full border border-white/20 text-center max-w-[95%] shadow-lg">
                        "{item.caption}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Card Controls: Quick Reactions & Download/Delete */}
                <div className="flex items-center justify-between px-2 pt-1">
                  {/* Quick Reactions */}
                  <div className="flex items-center gap-1.5">
                    {['❤️', '💋', '🥰', '🫂'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          sound.play('heart');
                          onReactPhoto?.(item.id, emoji);
                        }}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition flex items-center justify-center text-sm border border-white/10"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Download & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(item.photoUrl, item.id)}
                      title="Tải ảnh về máy"
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white active:scale-90 transition flex items-center justify-center border border-white/10"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Xóa khoảnh khắc"
                      className="w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 active:scale-90 transition flex items-center justify-center border border-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* GRID VIEW (Lưới ảnh 3x3) */
          <div className="grid grid-cols-3 gap-2 pb-8">
            {photos.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => setActivePhotoIndex(index)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-slate-900 border border-white/10 shadow-md"
              >
                <img
                  src={item.photoUrl}
                  alt="Locket thumbnail"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                  <span className="text-[9px] text-white font-medium truncate block">
                    {item.caption || formatDate(item.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL-SCREEN CAROUSEL / STORY VIEWER */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[70] flex flex-col justify-between items-center p-4 select-none">
          {/* Top Bar of Viewer */}
          <div className="w-full max-w-sm flex items-center justify-between pt-2">
            <button
              onClick={() => setActivePhotoIndex(null)}
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center active:scale-90 transition border border-white/15"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-amber-300 tracking-wider">
              {activePhotoIndex + 1} / {photos.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(photos[activePhotoIndex].photoUrl, photos[activePhotoIndex].id)}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center active:scale-90 transition border border-white/15"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(photos[activePhotoIndex].id)}
                className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center active:scale-90 transition border border-rose-500/30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Square 1:1 Moment */}
          <div className="relative w-full max-w-sm aspect-square bg-slate-950 rounded-[40px] overflow-hidden border-2 border-white/20 shadow-2xl flex items-center justify-center my-auto">
            <img
              src={photos[activePhotoIndex].photoUrl}
              alt="Moment full"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

            {/* Top Date Tag on Photo */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15">
                {photos[activePhotoIndex].senderName ? `${photos[activePhotoIndex].senderName} gửi` : 'Locket'}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-300 text-[10px]">
                {formatDate(photos[activePhotoIndex].timestamp)}
              </span>
            </div>

            {/* Caption Bar */}
            {photos[activePhotoIndex].caption && (
              <div className="absolute bottom-4 inset-x-4 flex justify-center">
                <div className="bg-black/65 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full border border-white/25 text-center max-w-[95%] shadow-lg">
                  "{photos[activePhotoIndex].caption}"
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation Arrows & Reactions */}
          <div className="w-full max-w-sm pb-4 flex flex-col items-center gap-3">
            <div className="flex items-center justify-between w-full px-6">
              <button
                disabled={activePhotoIndex === 0}
                onClick={handlePrevPhoto}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white flex items-center justify-center active:scale-90 transition border border-white/15"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Heart reaction button */}
              <button
                onClick={() => {
                  sound.play('kiss');
                  onReactPhoto?.(photos[activePhotoIndex].id, '❤️');
                }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-extrabold text-xs shadow-lg active:scale-95 transition flex items-center gap-2"
              >
                <Heart className="w-4 h-4 fill-slate-950" />
                <span>Thả Tim Khoảnh Khắc</span>
              </button>

              <button
                disabled={activePhotoIndex === photos.length - 1}
                onClick={handleNextPhoto}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white flex items-center justify-center active:scale-90 transition border border-white/15"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
