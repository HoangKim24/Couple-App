import React, { useState } from 'react';
import { HeartHandshake, KeyRound } from 'lucide-react';
import { PASSCODE_BOY, PASSCODE_GIRL } from '../services/storage';
import { sound } from '../services/audio';

export default function PasscodeGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const checkCode = (val) => {
    const clean = val.trim();
    if (clean === PASSCODE_BOY) {
      sound.play('heart');
      onUnlock('a'); // Con Trai
      return true;
    } else if (clean === PASSCODE_GIRL) {
      sound.play('heart');
      onUnlock('b'); // Con Gái
      return true;
    }
    return false;
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCode(val);
    if (val.length >= 2) {
      if (!checkCode(val)) {
        // If 2 characters entered and doesn't match either 00 or 01
        sound.play('pout');
        setError(true);
        setTimeout(() => setError(false), 800);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkCode(code)) {
      sound.play('pout');
      setError(true);
      setTimeout(() => setError(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-center items-center px-6 text-center select-none">
      <div className="w-20 h-20 rounded-3xl bg-love-500/20 text-love-400 flex items-center justify-center mb-5 border border-love-500/30 shadow-2xl shadow-love-500/20">
        <HeartHandshake className="w-10 h-10 text-love-500 animate-pulse" />
      </div>

      <h1 className="text-2xl font-bold font-display text-white tracking-tight">Mã Số Bí Mật</h1>
      <p className="text-xs text-slate-400 mt-1.5 mb-6 max-w-[280px]">
        Nhập mã bí mật để mở khóa app:
        <br />
        <span className="text-sky-400 font-mono font-bold">00</span> hoặc <span className="text-love-400 font-mono font-bold">01</span>
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[260px] flex flex-col gap-3.5">
        <input
          type="password"
          maxLength={2}
          autoFocus
          value={code}
          onChange={handleInputChange}
          placeholder="••"
          className={`w-full bg-slate-900 border ${
            error ? 'border-red-500 animate-bounce' : 'border-slate-800'
          } text-center tracking-widest text-3xl font-mono text-love-400 rounded-2xl py-3 focus:outline-none focus:border-love-500 shadow-inner`}
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-love-600 to-rose-500 hover:from-love-500 hover:to-rose-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-love-500/30 transition transform active:scale-95 flex items-center justify-center gap-2 text-sm mt-1"
        >
          <KeyRound className="w-4 h-4" />
          <span>Vào App Ngay 💕</span>
        </button>
      </form>

      <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-6">
        <span className="flex items-center gap-1">📱 Máy 1: <b className="text-sky-400 font-mono">00</b></span>
        <span>•</span>
        <span className="flex items-center gap-1">📱 Máy 2: <b className="text-love-400 font-mono">01</b></span>
      </div>
      <span className="text-[10px] text-slate-600 mt-2">Chỉ cần nhập 1 lần duy nhất trên máy!</span>
    </div>
  );
}
