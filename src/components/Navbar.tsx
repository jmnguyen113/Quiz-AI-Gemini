import React, { useState } from 'react';
import {
  Camera,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { getSoundEnabled, setSoundEnabled, playClickSound } from '../utils/sound';

interface NavbarProps {
  currentView: 'bank' | 'editor' | 'testing' | 'result';
  onNavigateBank: () => void;
  onOpenScanner: () => void;
  quizCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateBank,
  onOpenScanner,
  quizCount,
}) => {
  const [soundOn, setSoundOn] = useState(getSoundEnabled());
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  const handleCopyCommands = () => {
    playClickSound();
    const cmds = `git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/jmnguyen113/snapquiz-ai.git
git push -u origin main`;
    navigator.clipboard.writeText(cmds);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onNavigateBank}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                SnapQuiz
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Quét ảnh đề thi • Trộn đề • Chấm điểm
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {currentView !== 'bank' && currentView !== 'testing' && (
            <button
              onClick={onNavigateBank}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Kho đề ({quizCount})</span>
            </button>
          )}

          {/* Download ZIP / GitHub Helper */}
          <button
            onClick={() => setShowGithubModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
            title="Tải mã nguồn và hướng dẫn đưa lên GitHub"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Tải Code / Up GitHub</span>
            <span className="sm:hidden">GitHub</span>
          </button>

          {currentView !== 'testing' && (
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-indigo-600/25 active:scale-95 transition"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden xs:inline">Chụp / Quét đề</span>
              <span className="xs:hidden">Quét</span>
            </button>
          )}
        </div>
      </div>

      {/* GitHub Export & Download Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tải Mã Nguồn & Đẩy Lên GitHub</h3>
                  <p className="text-[11px] text-slate-400">jmnguyen113 / snapquiz-ai</p>
                </div>
              </div>
              <button
                onClick={() => setShowGithubModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Download button */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-300 block">
                BƯỚC 1: Tải trọn bộ mã nguồn (.zip) về máy tính
              </span>
              <a
                href="/api/download-zip"
                download="snapquiz-ai-source.zip"
                onClick={() => playClickSound()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Nhấp vào đây để tải file snapquiz-ai-source.zip</span>
              </a>
              <p className="text-[11px] text-slate-400 italic">
                (Sau khi tải về, hãy giải nén file zip ra một thư mục trên máy tính của bạn)
              </p>
            </div>

            {/* Step 2: Commands to run */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">
                  BƯỚC 2: Mở Terminal/CMD trong thư mục vừa giải nén và chạy:
                </span>
                <button
                  onClick={handleCopyCommands}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã copy!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép tất cả</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-400 space-y-1 overflow-x-auto select-all">
                <div>git init</div>
                <div>git add .</div>
                <div>git commit -m "first commit"</div>
                <div>git branch -M main</div>
                <div>git remote add origin https://github.com/jmnguyen113/snapquiz-ai.git</div>
                <div>git push -u origin main</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowGithubModal(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
