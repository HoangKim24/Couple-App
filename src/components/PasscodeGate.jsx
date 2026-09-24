import React, { useState } from 'react';
import { Lock, HeartHandshake, KeyRound } from 'lucide-react';
import { SECRET_PASSCODE } from '../services/storage';
import { sound } from '../services/audio';

export default function PasscodeGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [role, setRole] = useState('a');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim() === SECRET_PASSCODE) {
      sound.play('heart');
      onUnlock(role);
    } else {
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

      <h1 className="text-2xl font-bold font-display text-white tracking-tight">Không Gian Riêng Tư</h1>
      <p className="text-xs text-slate-400 mt-1.5 mb-8 max-w-[280px]">
        Nhập mã số bí mật của 2 bạn để mở khóa (Gợi ý: <span className="text-love-400 font-mono font-bold">{SECRET_PASSCODE}</span>)
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[260px] flex flex-col gap-3.5">
        <input
          type="password"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Mã bí mật..."
          className={`w-full bg-slate-900 border ${
            error ? 'border-red-500 animate-bounce' : 'border-slate-800'
          } text-center tracking-widest text-xl font-mono text-love-400 rounded-2xl py-3.5 focus:outline-none focus:border-love-500 shadow-inner`}
        />

        <div className="flex items-center justify-center gap-2 pt-1 text-xs">
          <label className={`flex-1 border rounded-xl p-2.5 flex items-center justify-center gap-1.5 cursor-pointer transition ${
            role === 'a' ? 'border-sky-400 bg-sky-950/40 text-sky-200' : 'border-slate-800 bg-slate-900 text-slate-400'
          }`}>
            <input type="radio" name="role" value="a" checked={role === 'a'} onChange={() => setRole('a')} className="hidden" />
            <span>👦 Bạn Trai</span>
          </label>
          <label className={`flex-1 border rounded-xl p-2.5 flex items-center justify-center gap-1.5 cursor-pointer transition ${
            role === 'b' ? 'border-love-500 bg-love-950/40 text-love-200' : 'border-slate-800 bg-slate-900 text-slate-400'
          }`}>
            <input type="radio" name="role" value="b" checked={role === 'b'} onChange={() => setRole('b')} className="hidden" />
            <span>👧 Bạn Gái</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-love-600 to-rose-500 hover:from-love-500 hover:to-rose-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-love-500/30 transition transform active:scale-95 flex items-center justify-center gap-2 text-sm mt-1"
        >
          <KeyRound className="w-4 h-4" />
          <span>Vào App Ngay 💕</span>
        </button>
      </form>

      <span className="text-[11px] text-slate-500 mt-8">Nhập 1 lần duy nhất, mở app là vào thẳng!</span>
    </div>
  );
}
