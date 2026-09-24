import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { ANNIVERSARY_DATE } from '../services/storage';

export default function CoupleHeader({ myRole, userA, userB }) {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.floor(Math.abs(new Date() - ANNIVERSARY_DATE) / (1000 * 60 * 60 * 24));
      setDays(diff);
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, []);

  const isMeA = myRole === 'a';
  const me = isMeA ? userA : userB;
  const partner = isMeA ? userB : userA;

  return (
    <header className="w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between shadow-md shrink-0 select-none">
      {/* My Profile */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <img src={me.avatar} alt="Me" className={`w-9 h-9 rounded-full object-cover border-2 ${isMeA ? 'border-sky-400' : 'border-love-400'}`} />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950"></span>
        </div>
        <div>
          <span className="text-xs font-bold text-white block leading-tight">{me.name}</span>
          <span className="text-[10px] text-slate-400 block truncate max-w-[70px]">{me.mood}</span>
        </div>
      </div>

      {/* Love Days Counter */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 text-love-500 font-extrabold text-sm font-display">
          <Heart className="w-3.5 h-3.5 fill-love-500 animate-heart-beat" />
          <span>{days}</span>
          <span className="text-[11px] font-medium text-slate-300">Ngày</span>
        </div>
        <span className="text-[9px] text-love-300/70 font-mono tracking-wider">BÊN NHAU</span>
      </div>

      {/* Partner Profile */}
      <div className="flex items-center gap-2 text-right">
        <div>
          <span className="text-xs font-bold text-white block leading-tight">{partner.name}</span>
          <span className={`text-[10px] ${isMeA ? 'text-love-400' : 'text-sky-400'} font-semibold block truncate max-w-[70px]`}>{partner.mood}</span>
        </div>
        <div className="relative">
          <img src={partner.avatar} alt="Partner" className={`w-9 h-9 rounded-full object-cover border-2 ${isMeA ? 'border-love-500' : 'border-sky-400'}`} />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-love-500 rounded-full ring-2 ring-slate-950 animate-ping"></span>
        </div>
      </div>
    </header>
  );
}
