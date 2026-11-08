import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Camera,
  BookOpen,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { TestResult } from '../types/quiz';
import { playClickSound } from '../utils/sound';

interface QuizResultProps {
  result: TestResult;
  onRetakeShuffled: () => void;
  onRetakeWrongOnly: () => void;
  onScanNew: () => void;
  onGoToBank: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  result,
  onRetakeShuffled,
  onRetakeWrongOnly,
  onScanNew,
  onGoToBank,
}) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'unanswered'>('all');

  // Trigger confetti for good scores
  useEffect(() => {
    if (result.scorePercentage >= 65) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [result.scorePercentage]);

  // Performance assessment
  let badgeTitle = 'Cần cố gắng thêm';
  let badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (result.scorePercentage === 100) {
    badgeTitle = 'Xuất sắc tuyệt đối! 🏆';
    badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (result.scorePercentage >= 80) {
    badgeTitle = 'Rất giỏi! 🎉';
    badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (result.scorePercentage >= 65) {
    badgeTitle = 'Đạt yêu cầu 👍';
    badgeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  }

  // Filtered review list
  const filteredDetails = result.answersDetail.filter((item) => {
    if (filter === 'wrong') return !item.isCorrect && item.userChoice;
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'unanswered') return !item.userChoice;
    return true;
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s} giây`;
    return `${m} phút ${s} giây`;
  };

  // 10-point scale grade
  const score10 = ((result.correctAnswers / result.totalQuestions) * 10).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Score Summary Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-indigo-600/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative space-y-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${badgeColor}`}
          >
            <Award className="w-3.5 h-3.5" />
            {badgeTitle}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Kết Quả Chấm Điểm
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {result.quizTitle}
          </p>
        </div>

        {/* Big Score Gauge */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex flex-col items-center justify-center rounded-full bg-slate-950 border-4 border-indigo-500/40 shadow-xl shadow-indigo-600/10">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-emerald-300">
              {score10}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 10 điểm</span>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              ({result.scorePercentage}%)
            </div>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" /> Đúng
            </div>
            <div className="text-xl font-bold text-white">
              {result.correctAnswers} <span className="text-xs text-slate-400 font-normal">câu</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold mb-1">
              <XCircle className="w-4 h-4" /> Sai
            </div>
            <div className="text-xl font-bold text-white">
              {result.wrongAnswers} <span className="text-xs text-slate-400 font-normal">câu</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <AlertCircle className="w-4 h-4" /> Bỏ qua
            </div>
            <div className="text-xl font-bold text-white">
              {result.unanswered} <span className="text-xs text-slate-400 font-normal">câu</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
              <Clock className="w-4 h-4" /> Thời gian
            </div>
            <div className="text-sm sm:text-base font-bold text-white pt-1">
              {formatSeconds(result.timeSpentSeconds)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              playClickSound();
              onRetakeShuffled();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại bài (Trộn ngẫu nhiên mới)</span>
          </button>

          {result.wrongAnswers > 0 && (
            <button
              onClick={() => {
                playClickSound();
                onRetakeWrongOnly();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center gap-2 border border-rose-500/40 active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Chỉ ôn lại {result.wrongAnswers} câu làm sai</span>
            </button>
          )}

          <button
            onClick={() => {
              playClickSound();
              onScanNew();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Quét đề mới</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onGoToBank();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Về kho đề</span>
          </button>
        </div>
      </div>

      {/* Detailed Question Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Chi Tiết Từng Câu Hỏi
            </h2>
            <span className="text-xs text-slate-400">({result.totalQuestions} câu)</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({result.totalQuestions})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'wrong'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-rose-300'
              }`}
            >
              Sai ({result.wrongAnswers})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'correct'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-emerald-300'
              }`}
            >
              Đúng ({result.correctAnswers})
            </button>
            <button
              onClick={() => setFilter('unanswered')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'unanswered'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-amber-300'
              }`}
            >
              Bỏ qua ({result.unanswered})
            </button>
          </div>
        </div>

        {/* List of reviewed questions */}
        <div className="space-y-4">
          {filteredDetails.map((item) => {
            const isCorrect = item.isCorrect;
            const hasChosen = !!item.userChoice;

            return (
              <div
                key={item.questionIndex}
                className={`p-5 rounded-2xl border bg-slate-900 space-y-4 transition ${
                  isCorrect
                    ? 'border-emerald-500/30'
                    : hasChosen
                    ? 'border-rose-500/30'
                    : 'border-slate-800'
                }`}
              >
                {/* Header: Question number & status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">
                      Câu {item.questionNumber}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Làm đúng
                      </span>
                    ) : hasChosen ? (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Làm sai (Bạn chọn: {item.userChoice})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <AlertCircle className="w-3.5 h-3.5" /> Chưa làm
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    Đáp án đúng: <strong className="text-emerald-400 font-bold">{item.correctChoice}</strong>
                  </span>
                </div>

                {/* Question text */}
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {item.question}
                </p>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.options.map((opt) => {
                    const isUserChoice = item.userChoice === opt.id;
                    const isTargetCorrect = item.correctChoice === opt.id;

                    let optBg = 'bg-slate-800/40 border-slate-800 text-slate-300';
                    let badgeBg = 'bg-slate-700 text-slate-300';

                    if (isTargetCorrect) {
                      optBg = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200';
                      badgeBg = 'bg-emerald-500 text-slate-950 font-bold';
                    } else if (isUserChoice && !isCorrect) {
                      optBg = 'bg-rose-500/15 border-rose-500/60 text-rose-200';
                      badgeBg = 'bg-rose-500 text-white font-bold';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 text-xs transition ${optBg}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${badgeBg}`}
                          >
                            {opt.id}
                          </span>
                          <span className="font-medium">{opt.text}</span>
                        </div>

                        {isTargetCorrect && (
                          <span className="shrink-0 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                            Đáp án chuẩn
                          </span>
                        )}
                        {isUserChoice && !isTargetCorrect && (
                          <span className="shrink-0 text-[10px] uppercase font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
                            Lựa chọn của bạn
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                    <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      Giải thích:
                    </span>
                    <p className="text-slate-300 leading-relaxed pl-5">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
