import React, { useState, useEffect } from 'react';
import { Heart, Settings, Battery, BatteryCharging, BatteryWarning, Zap } from 'lucide-react';

export default function CoupleHeader({
  myRole,
  userA,
  userB,
  anniversaryDate,
  myBattery,
  partnerBattery,
  onOpenSettings
}) {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const calc = () => {
      if (!anniversaryDate) {
        setDays(1);
        return;
      }
      const start = new Date(anniversaryDate);
      const now = new Date();
      // Chuẩn hóa về 00:00:00 giờ địa phương để tránh lỗi chênh lệch múi giờ / giờ trong ngày
      const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffMs = nowMidnight.getTime() - startMidnight.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      // Ngày đầu tiên yêu nhau là Ngày 1
      setDays(diffDays >= 0 ? diffDays + 1 : 0);
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, [anniversaryDate]);

  const isMeA = myRole === 'a';
  const me = isMeA ? userA : userB;
  const partner = isMeA ? userB : userA;

  return (
    <header className="w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-md shrink-0 select-none">
      {/* My Profile */}
      <div className="flex items-center gap-2">
        <div className="relative cursor-pointer" onClick={onOpenSettings} title="Cài đặt">
          <img
            src={me?.avatar}
            alt="Me"
            className={`w-9 h-9 rounded-full object-cover border-2 ${isMeA ? 'border-sky-400' : 'border-love-400'}`}
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950"></span>
        </div>
        <div>
          <span className="text-xs font-bold text-white block leading-tight">{me?.name || 'Bạn'}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 block truncate max-w-[65px]">{me?.mood || 'Online'}</span>
            {myBattery && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-400">
                {myBattery.charging ? (
                  <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                ) : (
                  <Battery className="w-2.5 h-2.5 text-slate-400" />
                )}
                <span>{myBattery.level}%</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Love Days Counter (Clickable to open settings) */}
      <button
        onClick={onOpenSettings}
        title="Chạm để cài đặt ngày yêu và thông tin"
        className="flex flex-col items-center hover:scale-105 active:scale-95 transition px-2"
      >
        <div className="flex items-center gap-1 text-love-500 font-extrabold text-sm font-display">
          <Heart className="w-3.5 h-3.5 fill-love-500 animate-heart-beat" />
          <span>{days}</span>
          <span className="text-[11px] font-medium text-slate-300">Ngày</span>
        </div>
        <span className="text-[9px] text-love-300/70 font-mono tracking-wider flex items-center gap-0.5">
          <span>BÊN NHAU</span>
          <Settings className="w-2.5 h-2.5 opacity-60" />
        </span>
      </button>

      {/* Partner Profile with Live % Battery Indicator */}
      <div className="flex items-center gap-2 text-right">
        <div>
          <span className="text-xs font-bold text-white block leading-tight">{partner?.name || 'Người Yêu'}</span>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            {partnerBattery && (
              <span
                className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                  partnerBattery.charging
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : partnerBattery.level <= 20
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
                title={partnerBattery.charging ? 'Đang cắm sạc pin ⚡' : `Mức pin: ${partnerBattery.level}%`}
              >
                {partnerBattery.charging ? (
                  <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                ) : partnerBattery.level <= 20 ? (
                  <BatteryWarning className="w-2.5 h-2.5 text-rose-400" />
                ) : (
                  <Battery className="w-2.5 h-2.5 text-emerald-400" />
                )}
                <span>{partnerBattery.level}%</span>
              </span>
            )}
            <span className={`text-[10px] ${isMeA ? 'text-love-400' : 'text-sky-400'} font-semibold block truncate max-w-[65px]`}>
              {partner?.mood || 'Nhớ bạn'}
            </span>
          </div>
        </div>
        <div className="relative cursor-pointer" onClick={onOpenSettings} title="Cài đặt">
          <img
            src={partner?.avatar}
            alt="Partner"
            className={`w-9 h-9 rounded-full object-cover border-2 ${isMeA ? 'border-love-500' : 'border-sky-400'}`}
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-love-500 rounded-full ring-2 ring-slate-950 animate-ping"></span>
        </div>
      </div>
    </header>
  );
}
