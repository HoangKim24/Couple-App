import React, { useState } from 'react';
import { LayoutGrid, X, Copy, Check, FileCode } from 'lucide-react';

export default function ScriptableModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    fetch('./scriptable-widget.js')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        // Fallback code snippet
        const fallback = `// Scriptable Widget 4x4 cho iPhone
const req = new Request("https://your-couple-app.web.app/api/widget.json");
const data = await req.loadJSON();
const widget = new ListWidget();
widget.addText("❤️ " + data.caption);
Script.setWidget(widget);
Script.complete();`;
        navigator.clipboard.writeText(fallback);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-love-400" />
            Widget 4x4 Cho iPhone
          </span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Cài Widget 4x4 to bản ngoài màn hình chính iPhone thông qua ứng dụng miễn phí <b>Scriptable</b> trên App Store!
        </p>

        <a
          href="./scriptable-widget.js"
          target="_blank"
          rel="noreferrer"
          className="w-full bg-slate-800 hover:bg-slate-700 text-love-300 text-xs font-semibold py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition"
        >
          <FileCode className="w-4 h-4" />
          <span>Xem File scriptable-widget.js</span>
        </a>

        <button
          onClick={handleCopy}
          className="w-full bg-love-600 hover:bg-love-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Đã Sao Chép Thành Công!' : 'Sao Chép Mã Cho Scriptable'}</span>
        </button>
      </div>
    </div>
  );
}
