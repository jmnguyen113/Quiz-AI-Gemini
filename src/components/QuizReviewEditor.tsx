import React, { useState } from 'react';
import {
  CheckCircle2,
  Trash2,
  Plus,
  Play,
  Save,
  ArrowLeft,
  Sparkles,
  Camera,
  Edit2,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { Question, QuizSet } from '../types/quiz';
import { playClickSound } from '../utils/sound';

interface QuizReviewEditorProps {
  initialQuiz: Partial<QuizSet>;
  imagePreview?: string;
  onSave: (quiz: QuizSet) => void;
  onStartTest: (quiz: QuizSet) => void;
  onScanMore: () => void;
  onBack: () => void;
}

export const QuizReviewEditor: React.FC<QuizReviewEditorProps> = ({
  initialQuiz,
  imagePreview,
  onSave,
  onStartTest,
  onScanMore,
  onBack,
}) => {
  const [title, setTitle] = useState(initialQuiz.title || 'Đề trắc nghiệm mới quét');
  const [description, setDescription] = useState(
    initialQuiz.description || 'Được trích xuất từ camera chụp ảnh tài liệu'
  );
  const [questions, setQuestions] = useState<Question[]>(
    initialQuiz.questions && initialQuiz.questions.length > 0
      ? initialQuiz.questions
      : []
  );

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    questions[0]?.id || null
  );

  // Toggle or select correct option for a question
  const handleSelectCorrectOption = (questionId: string, optionId: string) => {
    playClickSound();
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, correctOptionId: optionId } : q
      )
    );
  };

  // Update question text
  const handleUpdateQuestionText = (questionId: string, newText: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, question: newText } : q))
    );
  };

  // Update option text
  const handleUpdateOptionText = (
    questionId: string,
    optId: string,
    newText: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = q.options.map((opt) =>
          opt.id === optId ? { ...opt, text: newText } : opt
        );
        return { ...q, options: newOptions };
      })
    );
  };

  // Update explanation
  const handleUpdateExplanation = (questionId: string, explanation: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, explanation } : q))
    );
  };

  // Delete question
  const handleDeleteQuestion = (questionId: string) => {
    playClickSound();
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  // Add new blank question
  const handleAddQuestion = () => {
    playClickSound();
    const newId = 'custom-' + Date.now();
    const newQ: Question = {
      id: newId,
      questionNumber: questions.length + 1,
      question: 'Nội dung câu hỏi mới...',
      options: [
        { id: 'A', text: 'Lựa chọn A' },
        { id: 'B', text: 'Lựa chọn B' },
        { id: 'C', text: 'Lựa chọn C' },
        { id: 'D', text: 'Lựa chọn D' },
      ],
      correctOptionId: 'A',
      explanation: 'Giải thích cho câu hỏi...',
      markedConfidence: 'custom',
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionId(newId);
  };

  // Package current quiz
  const getCompiledQuiz = (): QuizSet => {
    return {
      id: initialQuiz.id || 'quiz-' + Date.now(),
      title: title.trim() || 'Đề trắc nghiệm không tên',
      description: description.trim(),
      createdAt: initialQuiz.createdAt || Date.now(),
      updatedAt: Date.now(),
      questions,
      thumbnail: imagePreview || initialQuiz.thumbnail,
      bestScore: initialQuiz.bestScore,
    };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onScanMore}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Camera className="w-4 h-4 text-indigo-400" />
            <span>Chụp thêm trang nữa</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onSave(getCompiledQuiz());
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Lưu kho đề</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onStartTest(getCompiledQuiz());
            }}
            disabled={questions.length === 0}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Trộn đề & Làm bài test ({questions.length} câu)</span>
          </button>
        </div>
      </div>

      {/* Quiz metadata details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                TÊN BỘ ĐỀ TRẮC NGHIỆM:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-base font-semibold focus:outline-none focus:border-indigo-500"
                placeholder="Nhập tên đề thi..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                MÔ TẢ / NGUỒN TÀI LIỆU:
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                placeholder="Ví dụ: Đề thi thử THPT Quốc gia, Chương 1..."
              />
            </div>
          </div>

          {/* Scanned Image thumbnail if exists */}
          {imagePreview && (
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-medium block mb-1">
                Ảnh đề gốc vừa quét
              </span>
              <img
                src={imagePreview}
                alt="Bản chụp"
                className="h-28 mx-auto rounded-lg object-contain"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã nhận diện {questions.length} câu hỏi
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Nhấp vào đáp án A, B, C, D để đổi đáp án đúng nếu cần
            </span>
          </div>
          <button
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm câu hỏi thủ công
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <p className="text-sm font-semibold text-white">Chưa có câu hỏi nào</p>
            <p className="text-xs text-slate-400">
              Hãy chụp ảnh đề thi bằng camera hoặc thêm câu hỏi thủ công.
            </p>
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Thêm câu hỏi đầu tiên
            </button>
          </div>
        ) : (
          questions.map((q, qIndex) => {
            return (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition"
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                      Câu {qIndex + 1}
                    </span>
                    {q.markedConfidence === 'detected_mark' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Sparkles className="w-3 h-3" />
                        Đã nhận diện đáp án khoanh: {q.correctOptionId}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        Đáp án chọn: {q.correctOptionId}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Question content input */}
                <div>
                  <textarea
                    rows={2}
                    value={q.question}
                    onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                    placeholder="Nội dung câu hỏi..."
                  />
                </div>

                {/* Options selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt) => {
                    const isCorrect = q.correctOptionId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectCorrectOption(q.id, opt.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition select-none ${
                          isCorrect
                            ? 'bg-emerald-500/15 border-emerald-500/60 shadow-sm shadow-emerald-500/10'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                            isCorrect
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <input
                          type="text"
                          value={opt.text}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleUpdateOptionText(q.id, opt.id, e.target.value)
                          }
                          className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none"
                          placeholder={`Nội dung phương án ${opt.id}...`}
                        />
                        {isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation text */}
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Giải thích / Ghi chú đáp án:</span>
                  </div>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateExplanation(q.id, e.target.value)}
                    placeholder="Giải thích vì sao đáp án này đúng..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      {questions.length > 0 && (
        <div className="sticky bottom-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Tổng cộng: <span className="font-bold text-white">{questions.length}</span> câu hỏi
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddQuestion}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <Plus className="w-4 h-4" />
              Thêm câu
            </button>
            <button
              onClick={() => {
                playClickSound();
                onStartTest(getCompiledQuiz());
              }}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              Làm bài test ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
