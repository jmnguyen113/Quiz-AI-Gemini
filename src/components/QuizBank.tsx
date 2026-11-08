import React, { useState } from 'react';
import {
  Camera,
  Play,
  Edit,
  Trash2,
  Download,
  Upload,
  Sparkles,
  BookOpen,
  Search,
  Award,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { QuizSet } from '../types/quiz';
import { playClickSound } from '../utils/sound';

interface QuizBankProps {
  quizSets: QuizSet[];
  onStartQuiz: (quiz: QuizSet) => void;
  onEditQuiz: (quiz: QuizSet) => void;
  onDeleteQuiz: (id: string) => void;
  onImportQuiz: (quiz: QuizSet) => void;
  onOpenScanner: () => void;
}

export const QuizBank: React.FC<QuizBankProps> = ({
  quizSets,
  onStartQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onImportQuiz,
  onOpenScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter quizzes by search query
  const filteredQuizzes = quizSets.filter((q) => {
    const qLower = searchQuery.toLowerCase();
    const matchTitle = q.title.toLowerCase().includes(qLower);
    const matchDesc = (q.description || '').toLowerCase().includes(qLower);
    const matchQuestions = q.questions.some((item) =>
      item.question.toLowerCase().includes(qLower)
    );
    return matchTitle || matchDesc || matchQuestions;
  });

  // Export a quiz set to JSON file
  const handleExportJson = (quiz: QuizSet) => {
    playClickSound();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quiz, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${quiz.title.replace(/[^a-z0-9]/gi, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.title && Array.isArray(parsed.questions)) {
          const newQuiz: QuizSet = {
            ...parsed,
            id: 'imported-' + Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          onImportQuiz(newQuiz);
          alert(`Đã nhập thành công bộ đề "${newQuiz.title}" với ${newQuiz.questions.length} câu hỏi!`);
        } else {
          alert('Tệp JSON không đúng định dạng bộ đề SnapQuiz.');
        }
      } catch (err) {
        alert('Lỗi đọc tệp JSON. Vui lòng kiểm tra lại.');
      }
    };
    reader.readAsText(file);
  };

  const totalQuestionsAll = quizSets.reduce((acc, q) => acc + q.questions.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Vision Gemini 3.8 • Trích xuất câu hỏi từ ảnh</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Số Hóa Đề Thi Bằng Camera & Trộn Đề Trắc Nghiệm
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Chụp ảnh các đề thi hoặc phiếu bài tập có khoanh sẵn đáp án. Hệ thống tự động
            nhận diện câu hỏi, phát hiện đáp án đã đánh dấu, xáo trộn câu hỏi và chấm điểm làm bài test.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenScanner}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Chụp / Quét đề thi mới</span>
            </button>

            <label className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 cursor-pointer flex items-center gap-2 transition">
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Nhập đề từ JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Stats counter badge on side */}
        <div className="mt-6 sm:mt-0 sm:absolute sm:right-8 sm:bottom-8 flex items-center gap-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl backdrop-blur-md">
          <div className="text-center px-2 border-r border-slate-800">
            <div className="text-lg font-bold text-white">{quizSets.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Bộ đề</div>
          </div>
          <div className="text-center px-2">
            <div className="text-lg font-bold text-indigo-400">{totalQuestionsAll}</div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Câu hỏi</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm đề thi, từ khóa câu hỏi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 self-end sm:self-center">
          Hiển thị <strong>{filteredQuizzes.length}</strong> / {quizSets.length} bộ đề
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Không tìm thấy bộ đề phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Hãy thử tìm bằng từ khóa khác hoặc quét thêm một đề thi mới bằng camera điện thoại.
          </p>
          <button
            onClick={onOpenScanner}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-md"
          >
            <Camera className="w-4 h-4" />
            Quét đề thi mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => {
            const hasBestScore = !!quiz.bestScore;
            return (
              <div
                key={quiz.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group hover:shadow-indigo-500/5"
              >
                <div className="space-y-3">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold text-xs border border-indigo-500/20">
                      <Layers className="w-3.5 h-3.5" />
                      {quiz.questions.length} câu hỏi
                    </span>

                    {hasBestScore ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-bold text-xs border border-emerald-500/20">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        {quiz.bestScore?.percentage}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Chưa làm</span>
                    )}
                  </div>

                  {/* Title & description */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {quiz.description || 'Không có mô tả thêm.'}
                    </p>
                  </div>

                  {quiz.sourceNote && (
                    <div className="text-[11px] text-slate-500 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                      Nguồn: {quiz.sourceNote}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                    </span>

                    {/* Secondary icon buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleExportJson(quiz)}
                        title="Tải về file JSON"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          playClickSound();
                          onEditQuiz(quiz);
                        }}
                        title="Chỉnh sửa câu hỏi"
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(quiz.id)}
                        title="Xóa đề này"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Start test CTA */}
                  <button
                    onClick={() => {
                      playClickSound();
                      onStartQuiz(quiz);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Trộn đề & Làm bài thi</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Xác nhận xóa bộ đề?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bộ đề này sẽ bị xóa khỏi bộ nhớ thiết bị và không thể khôi phục.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDeleteQuiz(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
