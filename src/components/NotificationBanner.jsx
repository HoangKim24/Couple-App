import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

export default function NotificationBanner({ notification, onClose, onClick }) {
  const [visible, setVisible] = useState(false);
  const touchStartY = useRef(null);

  useEffect(() => {
    if (notification) {
      // Trigger enter transition on next tick
      const timer = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification]);

  if (!notification) return null;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 250);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current !== null) {
      const deltaY = e.touches[0].clientY - touchStartY.current;
      // If user swipes up more than 20px, dismiss
      if (deltaY < -20) {
        touchStartY.current = null;
        handleDismiss();
      }
    }
  };

  const getStyleByType = (type) => {
    switch (type) {
      case 'locket':
        return {
          glow: 'shadow-amber-500/25 border-amber-400/50 ring-1 ring-amber-400/30',
          badgeBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950',
          defaultIcon: '📸',
          accentColor: 'text-amber-300'
        };
      case 'kiss':
        return {
          glow: 'shadow-love-500/35 border-love-500/60 ring-1 ring-love-500/30',
          badgeBg: 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white',
          defaultIcon: '💋',
          accentColor: 'text-pink-300'
        };
      case 'heart':
        return {
          glow: 'shadow-rose-500/35 border-rose-500/60 ring-1 ring-rose-500/30',
          badgeBg: 'bg-gradient-to-tr from-rose-500 to-love-600 text-white',
          defaultIcon: '❤️',
          accentColor: 'text-rose-300'
        };
      case 'pout':
        return {
          glow: 'shadow-violet-500/25 border-violet-400/50 ring-1 ring-violet-400/30',
          badgeBg: 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white',
          defaultIcon: '😤',
          accentColor: 'text-violet-300'
        };
      case 'hug':
        return {
          glow: 'shadow-orange-500/25 border-orange-400/50 ring-1 ring-orange-400/30',
          badgeBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white',
          defaultIcon: '🫂',
          accentColor: 'text-orange-300'
        };
      case 'battery':
        return {
          glow: 'shadow-yellow-500/25 border-yellow-400/50 ring-1 ring-yellow-400/30',
          badgeBg: 'bg-gradient-to-tr from-yellow-500 to-amber-600 text-white',
          defaultIcon: '⚡',
          accentColor: 'text-yellow-300'
        };
      default:
        return {
          glow: 'shadow-love-500/25 border-love-500/40 ring-1 ring-love-500/20',
          badgeBg: 'bg-gradient-to-tr from-love-600 to-rose-500 text-white',
          defaultIcon: '✨',
          accentColor: 'text-love-300'
        };
    }
  };

  const currentStyle = getStyleByType(notification.type);

  return (
    <aside
      aria-label="Thông báo tương tác"
      className="fixed top-2 sm:top-5 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-[200] flex justify-center pointer-events-none"
    >
      <div
        role="alert"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={() => {
          if (onClick) onClick(notification);
        }}
        className={`pointer-events-auto w-full max-w-sm bg-slate-950/92 border backdrop-blur-2xl rounded-[26px] p-2.5 sm:p-3 shadow-2xl flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.98] transition-all duration-300 ease-out select-none overflow-hidden relative ${
          currentStyle.glow
        } ${visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-90'}`}
      >
        {/* Left: Icon or Partner Avatar with pulsating badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {notification.avatar ? (
              <img
                src={notification.avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md ${currentStyle.badgeBg}`}
              >
                <span>{notification.icon || currentStyle.defaultIcon}</span>
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-[10px]">
              {notification.icon || currentStyle.defaultIcon}
            </span>
          </div>

          {/* Center: Title & Description */}
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight truncate">
              <span>{notification.title || 'Thông báo mới'}</span>
            </span>
            <p className="text-[11px] text-slate-300 font-medium leading-snug line-clamp-2 mt-0.5">
              {notification.message}
            </p>
          </div>
        </div>

        {/* Right: Photo thumbnail if available + Close button */}
        <div className="flex items-center gap-2 shrink-0">
          {notification.photoUrl && (
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-slate-800">
              <img
                src={notification.photoUrl}
                alt="Locket preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition active:scale-90"
            aria-label="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom animated progress indicator */}
        <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-love-500 via-amber-400 to-pink-500 notification-progress-anim" />
        </div>
      </div>
    </aside>
  );
}
