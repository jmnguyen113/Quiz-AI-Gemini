import React, { useState } from 'react';
import {
  Shuffle,
  Clock,
  BookOpen,
  Award,
  Sliders,
  X,
  Play,
  CheckCircle,
} from 'lucide-react';
import { TestConfig, QuizSet } from '../types/quiz';
import { playClickSound } from '../utils/sound';

interface QuizConfigModalProps {
  isOpen: boolean;
  quizSet: QuizSet | null;
  onClose: () => void;
  onConfirmStart: (config: TestConfig) => void;
}

export const QuizConfigModal: React.FC<QuizConfigModalProps> = ({
  isOpen,
  quizSet,
  onClose,
  onConfirmStart,
}) => {
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [questionCount, setQuestionCount] = useState(0); // 0 = all
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [mode, setMode] = useState<'exam' | 'practice'>('exam');

  if (!isOpen || !quizSet) return null;

  const totalQuestions = quizSet.questions.length;

  const handleStart = () => {
    playClickSound();
    onConfirmStart({
      shuffleQuestions,
      shuffleOptions,
      questionCount: questionCount > totalQuestions ? totalQuestions : questionCount,
      timeLimitMinutes,
      mode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Thiết Lập Đề Thi</h2>
              <p className="text-xs text-slate-400 truncate max-w-[260px] sm:max-w-xs">
                {quizSet.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              CHẾ ĐỘ LÀM BÀI:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setMode('exam');
                }}
                className={`p-3 rounded-xl border text-left transition select-none flex flex-col justify-between ${
                  mode === 'exam'
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-400">
                    <Award className="w-4 h-4" />
                    Thi cử chính thức
                  </div>
                  {mode === 'exam' && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tính giờ nghiêm túc, chấm điểm và xem giải thích sau khi nộp bài.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setMode('practice');
                }}
                className={`p-3 rounded-xl border text-left transition select-none flex flex-col justify-between ${
                  mode === 'practice'
                    ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                    Luyện tập nhanh
                  </div>
                  {mode === 'practice' && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hiện ngay đáp án đúng và lời giải thích sau mỗi câu chọn.
                </p>
              </button>
            </div>
          </div>

          {/* Shuffle settings */}
          <div className="space-y-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
              <Shuffle className="w-4 h-4" />
              <span>TRỘN ĐỀ VÀ ĐÁP ÁN (SHUFFLE)</span>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer select-none">
                <div>
                  <span className="text-xs font-medium text-white block">
                    Xáo trộn thứ tự các câu hỏi
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Mỗi lần làm bài sẽ có một thứ tự câu hỏi ngẫu nhiên khác nhau.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer select-none">
                <div>
                  <span className="text-xs font-medium text-white block">
                    Xáo trộn vị trí các đáp án (A, B, C, D)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Thay đổi vị trí lựa chọn, tránh học vẹt theo mặt chữ cái.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Number of questions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                SỐ LƯỢNG CÂU HỎI LÀM:
              </label>
              <span className="text-xs text-indigo-400 font-bold">
                {questionCount === 0 || questionCount >= totalQuestions
                  ? `Toàn bộ (${totalQuestions} câu)`
                  : `${questionCount} câu ngẫu nhiên`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, 5, 10, 15, 20].map((count) => {
                const label = count === 0 ? `Tất cả (${totalQuestions})` : `${count} câu`;
                const isSelected =
                  (count === 0 && questionCount === 0) || questionCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setQuestionCount(count);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Limit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                THỜI GIAN LÀM BÀI:
              </label>
              <span className="text-xs text-indigo-400 font-bold">
                {timeLimitMinutes === 0 ? 'Không giới hạn thời gian' : `${timeLimitMinutes} phút`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, 5, 10, 15, 30, 45, 60].map((mins) => {
                const label = mins === 0 ? 'Không giới hạn' : `${mins} phút`;
                const isSelected = timeLimitMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setTimeLimitMinutes(mins);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            Bắt đầu làm bài thi ngay
          </button>
        </div>
      </div>
    </div>
  );
};
