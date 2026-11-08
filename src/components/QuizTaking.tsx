import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  List,
  Send,
  AlertTriangle,
  BookOpen,
  Award,
  X,
} from 'lucide-react';
import { SessionQuestion, TestConfig, TestResult } from '../types/quiz';
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playFinishSound,
} from '../utils/sound';

interface QuizTakingProps {
  quizSetId: string;
  quizTitle: string;
  questions: SessionQuestion[];
  config: TestConfig;
  onFinishTest: (result: TestResult) => void;
  onExitTest: () => void;
}

export const QuizTaking: React.FC<QuizTakingProps> = ({
  quizSetId,
  quizTitle,
  questions,
  config,
  onFinishTest,
  onExitTest,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(
    config.timeLimitMinutes > 0 ? config.timeLimitMinutes * 60 : 0
  );
  const [showQuestionsDrawer, setShowQuestionsDrawer] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const currentQ = questions[currentIndex];
  const total = questions.length;

  // Calculate stats
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = total - answeredCount;

  // Timer countdown
  useEffect(() => {
    if (config.timeLimitMinutes <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config.timeLimitMinutes]);

  // Select an option
  const handleSelectOption = (optionId: string) => {
    playClickSound();

    setUserAnswers((prev) => {
      const updated = { ...prev, [currentIndex]: optionId };
      return updated;
    });

    if (config.mode === 'practice') {
      if (optionId === currentQ.correctOptionId) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }
  };

  // Toggle flag for review
  const handleToggleFlag = () => {
    playClickSound();
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < total - 1) {
      playClickSound();
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      playClickSound();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation & option selection
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showSubmitConfirm || showExitConfirm || showQuestionsDrawer) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else {
        const key = e.key.toUpperCase();
        if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
          const matchOpt = currentQ.options.find((opt) => opt.id === key);
          if (matchOpt) {
            handleSelectOption(matchOpt.id);
          }
        } else if (['1', '2', '3', '4'].includes(e.key)) {
          const optIdx = parseInt(e.key, 10) - 1;
          if (currentQ.options[optIdx]) {
            handleSelectOption(currentQ.options[optIdx].id);
          }
        }
      }
    },
    [currentIndex, total, currentQ, showSubmitConfirm, showExitConfirm, showQuestionsDrawer]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Submit test and calculate final scores
  const handleSubmitTest = () => {
    playFinishSound();

    let correctCount = 0;
    let wrongCount = 0;
    let notAnsweredCount = 0;

    const details = questions.map((q, idx) => {
      const choice = userAnswers[idx];
      const isAnswered = choice !== undefined && choice !== '';
      const isCorrect = choice === q.correctOptionId;

      if (isCorrect) correctCount++;
      else if (isAnswered) wrongCount++;
      else notAnsweredCount++;

      return {
        questionIndex: idx,
        questionNumber: idx + 1,
        question: q.question,
        options: q.options,
        userChoice: choice,
        correctChoice: q.correctOptionId,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    const scorePercentage = Math.round((correctCount / total) * 100);

    const result: TestResult = {
      quizSetId,
      quizTitle,
      totalQuestions: total,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: notAnsweredCount,
      scorePercentage,
      timeSpentSeconds,
      answersDetail: details,
      date: Date.now(),
      mode: config.mode,
    };

    onFinishTest(result);
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = config.timeLimitMinutes > 0 && timeRemaining <= 120; // < 2 mins

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between max-w-4xl mx-auto px-4 py-5 select-none">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg mb-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Thoát bài test"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white line-clamp-1">{quizTitle}</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                {config.mode === 'exam' ? (
                  <span className="flex items-center gap-1 text-indigo-400">
                    <Award className="w-3 h-3" /> Thi cử
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <BookOpen className="w-3 h-3" /> Luyện tập
                  </span>
                )}
                <span>•</span>
                <span>
                  Đã làm: <strong className="text-white">{answeredCount}</strong>/{total}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer */}
            {config.timeLimitMinutes > 0 && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition ${
                  isTimeCritical
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            {/* Questions Grid Drawer Trigger */}
            <button
              onClick={() => {
                playClickSound();
                setShowQuestionsDrawer(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between mb-4">
        <div className="space-y-6">
          {/* Question Index & Flag */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs tracking-wider uppercase">
              Câu {currentIndex + 1} / {total}
            </span>

            <button
              onClick={handleToggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                flaggedQuestions[currentIndex]
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              <Flag
                className={`w-3.5 h-3.5 ${
                  flaggedQuestions[currentIndex] ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
              <span>
                {flaggedQuestions[currentIndex] ? 'Đã đánh dấu xem lại' : 'Đánh dấu câu này'}
              </span>
            </button>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
            {currentQ.question}
          </div>

          {/* Options List */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = userAnswers[currentIndex] === opt.id;
              const isCorrect = opt.id === currentQ.correctOptionId;

              // Style calculation depending on mode
              let cardStyle =
                'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600 text-slate-200';
              let badgeStyle = 'bg-slate-700 text-slate-300';

              if (config.mode === 'practice' && userAnswers[currentIndex]) {
                if (isCorrect) {
                  cardStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200';
                  badgeStyle = 'bg-emerald-500 text-slate-950 font-bold';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                  badgeStyle = 'bg-rose-500 text-white font-bold';
                }
              } else if (isSelected) {
                cardStyle =
                  'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-600/15';
                badgeStyle = 'bg-indigo-600 text-white font-bold';
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition group active:scale-[0.99] ${cardStyle}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 transition-transform group-hover:scale-105 ${badgeStyle}`}
                  >
                    {opt.id}
                  </div>

                  <div className="flex-1 pt-1 text-sm font-medium leading-relaxed">
                    {opt.text}
                  </div>

                  {config.mode === 'practice' && userAnswers[currentIndex] && (
                    <div className="pt-1 shrink-0">
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                  )}

                  {config.mode === 'exam' && isSelected && (
                    <div className="pt-1 shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate explanation in Practice Mode */}
          {config.mode === 'practice' && userAnswers[currentIndex] && currentQ.explanation && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Giải thích đáp án:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Keyboard shortcut tips on desktop */}
        <div className="pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-500 hidden sm:flex items-center justify-between">
          <span>Phím tắt: Bấm [A], [B], [C], [D] để chọn • [←] [→] để chuyển câu</span>
          {flaggedQuestions[currentIndex] && (
            <span className="text-amber-400 font-medium">★ Đang gắn cờ xem lại</span>
          )}
        </div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <div className="text-xs text-slate-400 font-medium">
          Câu <span className="text-white font-bold">{currentIndex + 1}</span> / {total}
        </div>

        {currentIndex === total - 1 ? (
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Nộp bài thi</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <span>Câu tiếp theo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question Grid Drawer / Modal */}
      {showQuestionsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <List className="w-4 h-4 text-indigo-400" />
                Danh Sách Câu Hỏi ({answeredCount}/{total})
              </h3>
              <button
                onClick={() => setShowQuestionsDrawer(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-800/60 p-2.5 rounded-xl">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" /> Đã làm
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" /> Đánh dấu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-700" /> Chưa làm
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
              {questions.map((_, idx) => {
                const isAnswered = userAnswers[idx] !== undefined;
                const isFlagged = flaggedQuestions[idx];
                const isCurrent = idx === currentIndex;

                let btnColor = 'bg-slate-800 border-slate-700 text-slate-300';
                if (isFlagged) {
                  btnColor = 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold';
                } else if (isAnswered) {
                  btnColor = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                }

                if (isCurrent) {
                  btnColor += ' ring-2 ring-indigo-400';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      playClickSound();
                      setCurrentIndex(idx);
                      setShowQuestionsDrawer(false);
                    }}
                    className={`h-10 rounded-xl border flex flex-col items-center justify-center text-xs transition ${btnColor}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && <span className="text-[9px] -mt-1 text-amber-400">★</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowQuestionsDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Quay lại làm bài
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Nộp bài thi & Chấm điểm?</h3>
              {unansweredCount > 0 ? (
                <p className="text-xs text-amber-300 mt-2 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  Bạn còn <strong>{unansweredCount}</strong> câu chưa chọn đáp án!
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  Bạn đã hoàn thành đủ {total}/{total} câu hỏi.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Làm tiếp
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmitTest();
                }}
                className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Thoát bài thi?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tiến trình làm bài hiện tại sẽ không được lưu nếu bạn rời khỏi bài thi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Ở lại làm tiếp
              </button>
              <button
                onClick={onExitTest}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Thoát bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
