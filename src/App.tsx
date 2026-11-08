import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { QuizBank } from './components/QuizBank';
import { QuizReviewEditor } from './components/QuizReviewEditor';
import { QuizConfigModal } from './components/QuizConfigModal';
import { QuizTaking } from './components/QuizTaking';
import { QuizResult } from './components/QuizResult';
import {
  QuizSet,
  TestConfig,
  SessionQuestion,
  TestResult,
  Question,
} from './types/quiz';
import {
  getSavedQuizSets,
  saveSingleQuizSet,
  deleteQuizSet,
  updateQuizBestScore,
  buildTestSession,
  saveQuizSets,
} from './utils/storage';

export default function App() {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [currentView, setCurrentView] = useState<'bank' | 'editor' | 'testing' | 'result'>('bank');

  // Modal states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Active quiz contexts
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSet | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Partial<QuizSet> | null>(null);
  const [lastImagePreview, setLastImagePreview] = useState<string | undefined>(undefined);

  // Active test session states
  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestion[]>([]);
  const [activeConfig, setActiveConfig] = useState<TestConfig | null>(null);
  const [lastTestResult, setLastTestResult] = useState<TestResult | null>(null);

  // Load saved quizzes on mount
  useEffect(() => {
    const loaded = getSavedQuizSets();
    setQuizSets(loaded);
  }, []);

  // Handler: When AI extracts questions from camera/photo
  const handleExtractionSuccess = (data: {
    quizTitle: string;
    questions: any[];
    imagePreview?: string;
  }) => {
    setLastImagePreview(data.imagePreview);

    const formattedQuestions: Question[] = data.questions.map((q, idx) => ({
      id: 'q-' + Date.now() + '-' + idx,
      questionNumber: idx + 1,
      question: q.question,
      options: q.options || [],
      correctOptionId: q.correctOptionId || 'A',
      explanation: q.explanation || '',
      markedConfidence: q.markedConfidence || 'detected_mark',
    }));

    if (currentView === 'editor' && editingQuiz) {
      // Append scanned questions to existing draft
      const mergedQuestions = [...(editingQuiz.questions || []), ...formattedQuestions];
      setEditingQuiz({
        ...editingQuiz,
        questions: mergedQuestions,
      });
    } else {
      // Create new draft
      const newDraft: Partial<QuizSet> = {
        id: 'quiz-' + Date.now(),
        title: data.quizTitle || 'Đề trắc nghiệm đã quét',
        description: 'Được trích xuất từ camera chụp ảnh tài liệu',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        questions: formattedQuestions,
        thumbnail: data.imagePreview,
      };
      setEditingQuiz(newDraft);
      setCurrentView('editor');
    }
  };

  // Handler: Save quiz set to library
  const handleSaveQuiz = (quiz: QuizSet) => {
    const updated = saveSingleQuizSet(quiz);
    setQuizSets(updated);
    setSelectedQuiz(quiz);
  };

  // Handler: Launch test configuration modal
  const handleOpenTestConfig = (quiz: QuizSet) => {
    setSelectedQuiz(quiz);
    setIsConfigModalOpen(true);
  };

  // Handler: Confirm test start and shuffle questions/options
  const handleConfirmStartTest = (config: TestConfig) => {
    if (!selectedQuiz) return;
    setIsConfigModalOpen(false);
    setActiveConfig(config);

    // Build shuffled test session
    const shuffledQuestions = buildTestSession(selectedQuiz, config);
    setSessionQuestions(shuffledQuestions);
    setCurrentView('testing');
  };

  // Handler: Test completed and graded
  const handleFinishTest = (result: TestResult) => {
    setLastTestResult(result);
    // Update best score in storage
    updateQuizBestScore(
      result.quizSetId,
      result.correctAnswers,
      result.totalQuestions,
      result.scorePercentage
    );
    // Refresh list
    setQuizSets(getSavedQuizSets());
    setCurrentView('result');
  };

  // Handler: Retake with fresh shuffle
  const handleRetakeShuffled = () => {
    if (!selectedQuiz || !activeConfig) {
      setCurrentView('bank');
      return;
    }
    const shuffled = buildTestSession(selectedQuiz, activeConfig);
    setSessionQuestions(shuffled);
    setCurrentView('testing');
  };

  // Handler: Retake only wrong answers
  const handleRetakeWrongOnly = () => {
    if (!selectedQuiz || !lastTestResult) return;

    // Filter original questions that user got wrong or skipped
    const wrongOriginalIds = new Set(
      lastTestResult.answersDetail
        .filter((item) => !item.isCorrect)
        .map((item) => selectedQuiz.questions[item.questionIndex]?.id)
        .filter(Boolean)
    );

    const wrongSubsetQuestions = selectedQuiz.questions.filter((q) =>
      wrongOriginalIds.has(q.id)
    );

    if (wrongSubsetQuestions.length === 0) {
      handleRetakeShuffled();
      return;
    }

    const tempQuiz: QuizSet = {
      ...selectedQuiz,
      questions: wrongSubsetQuestions,
    };

    const config = activeConfig || {
      shuffleQuestions: true,
      shuffleOptions: true,
      questionCount: 0,
      timeLimitMinutes: 10,
      mode: 'practice',
    };

    const shuffled = buildTestSession(tempQuiz, config);
    setSessionQuestions(shuffled);
    setCurrentView('testing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigateBank={() => setCurrentView('bank')}
        onOpenScanner={() => setIsScannerOpen(true)}
        quizCount={quizSets.length}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'bank' && (
          <QuizBank
            quizSets={quizSets}
            onStartQuiz={handleOpenTestConfig}
            onEditQuiz={(quiz) => {
              setEditingQuiz(quiz);
              setCurrentView('editor');
            }}
            onDeleteQuiz={(id) => {
              const updated = deleteQuizSet(id);
              setQuizSets(updated);
            }}
            onImportQuiz={(quiz) => {
              const updated = saveSingleQuizSet(quiz);
              setQuizSets(updated);
            }}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {currentView === 'editor' && editingQuiz && (
          <QuizReviewEditor
            initialQuiz={editingQuiz}
            imagePreview={lastImagePreview}
            onSave={(quiz) => {
              handleSaveQuiz(quiz);
              setCurrentView('bank');
            }}
            onStartTest={(quiz) => {
              handleSaveQuiz(quiz);
              handleOpenTestConfig(quiz);
            }}
            onScanMore={() => setIsScannerOpen(true)}
            onBack={() => setCurrentView('bank')}
          />
        )}

        {currentView === 'testing' && selectedQuiz && activeConfig && (
          <QuizTaking
            quizSetId={selectedQuiz.id}
            quizTitle={selectedQuiz.title}
            questions={sessionQuestions}
            config={activeConfig}
            onFinishTest={handleFinishTest}
            onExitTest={() => setCurrentView('bank')}
          />
        )}

        {currentView === 'result' && lastTestResult && (
          <QuizResult
            result={lastTestResult}
            onRetakeShuffled={handleRetakeShuffled}
            onRetakeWrongOnly={handleRetakeWrongOnly}
            onScanNew={() => {
              setIsScannerOpen(true);
            }}
            onGoToBank={() => setCurrentView('bank')}
          />
        )}
      </main>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onExtractionSuccess={handleExtractionSuccess}
      />

      {/* Test Configuration & Shuffle Modal */}
      <QuizConfigModal
        isOpen={isConfigModalOpen}
        quizSet={selectedQuiz}
        onClose={() => setIsConfigModalOpen(false)}
        onConfirmStart={handleConfirmStartTest}
      />
    </div>
  );
}
