import { QuizSet, TestConfig, SessionQuestion } from '../types/quiz';

const STORAGE_KEY = 'snapquiz_data_sets_v1';
const RECENT_RESULTS_KEY = 'snapquiz_recent_results_v1';

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate demo quizzes with marked answers to explore right away
export const INITIAL_DEMO_QUIZZES: QuizSet[] = [
  {
    id: 'demo-english-1',
    title: 'Đề Trắc Nghiệm Tiếng Anh - Ôn Thi THPT (Có Đánh Dấu Đáp Án)',
    description: 'Đề cương tổng hợp ngữ pháp, từ vựng và câu giao tiếp đã được khoanh dấu đáp án chuẩn.',
    createdAt: Date.now() - 3600000 * 24 * 2,
    updatedAt: Date.now() - 3600000 * 24 * 2,
    sourceNote: 'Ảnh chụp từ Đề kiểm tra 45 phút - THPT Chuyên',
    bestScore: {
      score: 9,
      total: 10,
      percentage: 90,
      date: Date.now() - 3600000 * 12,
    },
    questions: [
      {
        id: 'eng-q1',
        questionNumber: 1,
        question: 'If she _______ hard, she would have passed the final university entrance examination.',
        options: [
          { id: 'A', text: 'studied' },
          { id: 'B', text: 'had studied' },
          { id: 'C', text: 'studies' },
          { id: 'D', text: 'would study' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: 'Câu điều kiện loại 3 diễn tả điều kiện trái với quá khứ: If + S + had + PII, S + would have + PII. Phương án B được khoanh tròn trên đề.',
      },
      {
        id: 'eng-q2',
        questionNumber: 2,
        question: 'The new scientific breakthrough will provide a significant _______ to cancer treatment.',
        options: [
          { id: 'A', text: 'contribution' },
          { id: 'B', text: 'destruction' },
          { id: 'C', text: 'hesitation' },
          { id: 'D', text: 'limitation' },
        ],
        correctOptionId: 'A',
        markedConfidence: 'detected_mark',
        explanation: 'Cụm từ "make/provide a significant contribution to something" nghĩa là đóng góp to lớn vào điều gì. Khoanh tròn phương án A.',
      },
      {
        id: 'eng-q3',
        questionNumber: 3,
        question: 'Nam: "Would you like me to give you a lift home?" - Mai: "_______"',
        options: [
          { id: 'A', text: 'Yes, I like lifts very much.' },
          { id: 'B', text: 'That is very kind of you. Thanks!' },
          { id: 'C', text: 'No, you cannot do that.' },
          { id: 'D', text: 'Never mind, I am busy.' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: 'Khi nhận được lời đề nghị giúp đỡ hoặc cho đi nhờ xe, câu đáp lịch sự nhất là "That is very kind of you. Thanks!". Dấu tích ở phương án B.',
      },
      {
        id: 'eng-q4',
        questionNumber: 4,
        question: 'Neither the teacher nor the students _______ present at the conference hall yesterday.',
        options: [
          { id: 'A', text: 'is' },
          { id: 'B', text: 'are' },
          { id: 'C', text: 'was' },
          { id: 'D', text: 'were' },
        ],
        correctOptionId: 'D',
        markedConfidence: 'detected_mark',
        explanation: 'Cấu trúc "Neither... nor..." chia động từ theo chủ ngữ gần nhất (the students - số nhiều) và thì quá khứ (yesterday) nên dùng "were". Khoanh phương án D.',
      },
      {
        id: 'eng-q5',
        questionNumber: 5,
        question: 'Despite _______ exhausted after the long marathon, she managed to smile happily.',
        options: [
          { id: 'A', text: 'being' },
          { id: 'B', text: 'be' },
          { id: 'C', text: 'was' },
          { id: 'D', text: 'been' },
        ],
        correctOptionId: 'A',
        markedConfidence: 'detected_mark',
        explanation: 'Sau giới từ "Despite" ta dùng V-ing hoặc danh từ. Do đó dùng "being".',
      },
      {
        id: 'eng-q6',
        questionNumber: 6,
        question: 'Find the word that has the CLOSEST meaning to "abundant":',
        options: [
          { id: 'A', text: 'scarce' },
          { id: 'B', text: 'plentiful' },
          { id: 'C', text: 'insufficient' },
          { id: 'D', text: 'restricted' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: '"Abundant" có nghĩa là dồi dào, phong phú, đồng nghĩa với "plentiful". Dấu khoanh đậm tại B.',
      },
      {
        id: 'eng-q7',
        questionNumber: 7,
        question: 'It was _______ difficult exam that very few candidates managed to get high scores.',
        options: [
          { id: 'A', text: 'so' },
          { id: 'B', text: 'such a' },
          { id: 'C', text: 'such' },
          { id: 'D', text: 'too' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: 'Cấu trúc "such + a/an + adj + N (đếm được số ít) + that": such a difficult exam that...',
      },
      {
        id: 'eng-q8',
        questionNumber: 8,
        question: 'She asked him where he _______ his vacation the following summer.',
        options: [
          { id: 'A', text: 'will spend' },
          { id: 'B', text: 'would spend' },
          { id: 'C', text: 'spent' },
          { id: 'D', text: 'had spent' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: 'Câu gián tiếp tường thuật tương lai ("the following summer"), lùi thì từ "will" thành "would spend".',
      },
      {
        id: 'eng-q9',
        questionNumber: 9,
        question: 'The book _______ by Nguyen Nhat Anh has become an all-time best seller in Vietnam.',
        options: [
          { id: 'A', text: 'writing' },
          { id: 'B', text: 'written' },
          { id: 'C', text: 'which wrote' },
          { id: 'D', text: 'was written' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: 'Mệnh đề quan hệ rút gọn ở thể bị động: "which was written by..." rút gọn thành "written by...". Khoanh B.',
      },
      {
        id: 'eng-q10',
        questionNumber: 10,
        question: 'He is accustomed _______ getting up at 5 AM every morning to practice running.',
        options: [
          { id: 'A', text: 'to' },
          { id: 'B', text: 'with' },
          { id: 'C', text: 'for' },
          { id: 'D', text: 'at' },
        ],
        correctOptionId: 'A',
        markedConfidence: 'detected_mark',
        explanation: 'Cụm thành ngữ cố định "be accustomed to + V-ing" (quen với việc gì). Khoanh tròn đáp án A.',
      },
    ],
  },
  {
    id: 'demo-traffic-safety',
    title: 'Bộ Đề Trắc Nghiệm Quy Tắc Giao Thông & An Toàn Đường Bộ',
    description: 'Tổng hợp các câu hỏi điểm liệt và quy tắc nhường đường có tích đáp án chuẩn.',
    createdAt: Date.now() - 3600000 * 24 * 5,
    updatedAt: Date.now() - 3600000 * 24 * 5,
    sourceNote: 'Tài liệu hướng dẫn sát hạch lái xe đường bộ',
    bestScore: {
      score: 7,
      total: 7,
      percentage: 100,
      date: Date.now() - 3600000 * 8,
    },
    questions: [
      {
        id: 'trf-q1',
        questionNumber: 1,
        question: 'Hành vi điều khiển xe cơ giới chạy quá tốc độ quy định, giành đường, vượt ẩu có bị nghiêm cấm không?',
        options: [
          { id: 'A', text: 'Bị nghiêm cấm tùy từng trường hợp.' },
          { id: 'B', text: 'Không bị nghiêm cấm.' },
          { id: 'C', text: 'Bị nghiêm cấm tuyệt đối.' },
          { id: 'D', text: 'Chỉ bị cấm vào ban đêm.' },
        ],
        correctOptionId: 'C',
        markedConfidence: 'detected_mark',
        explanation: 'Hành vi chạy quá tốc độ, giành đường, vượt ẩu là hành vi bị nghiêm cấm tuyệt đối theo Luật Giao thông đường bộ. Khoanh C.',
      },
      {
        id: 'trf-q2',
        questionNumber: 2,
        question: 'Khi gặp hiệu lệnh của người điều khiển giao thông giang hai tay hoặc một tay thì người tham gia giao thông phải đi như thế nào?',
        options: [
          { id: 'A', text: 'Người ở phía trước và phía sau dừng lại; người ở bên phải và bên trái được đi.' },
          { id: 'B', text: 'Tất cả các hướng đều phải dừng lại ngay lập tức.' },
          { id: 'C', text: 'Người ở phía trước và sau được đi; hai bên phải dừng lại.' },
          { id: 'D', text: 'Người tham gia giao thông được rẽ phải ở tất cả các nhánh.' },
        ],
        correctOptionId: 'A',
        markedConfidence: 'detected_mark',
        explanation: 'Cảnh sát giao thông giang hai tay hoặc một tay: Người ở phía trước và phía sau phải dừng lại; người tham gia giao thông ở phía bên phải và bên trái được đi tất cả các hướng.',
      },
      {
        id: 'trf-q3',
        questionNumber: 3,
        question: 'Tại nơi đường bộ giao nhau cùng mức với đường sắt không có rào chắn, người lái xe phải dừng lại cách đường ray gần nhất tối thiểu bao nhiêu mét?',
        options: [
          { id: 'A', text: 'Tối thiểu 3 mét' },
          { id: 'B', text: 'Tối thiểu 5 mét' },
          { id: 'C', text: 'Tối thiểu 7 mét' },
          { id: 'D', text: 'Tối thiểu 10 mét' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: 'Theo quy định, phải dừng lại cách đường ray gần nhất tối thiểu 5 mét khi có tín hiệu tàu hỏa hoặc tại giao cắt không có chắn.',
      },
      {
        id: 'trf-q4',
        questionNumber: 4,
        question: 'Người lái xe phải giảm tốc độ thấp hơn tốc độ tối đa cho phép (có thể dừng lại một cách an toàn) trong trường hợp nào?',
        options: [
          { id: 'A', text: 'Khi có biển cảnh báo nguy hiểm hoặc có chướng ngại vật trên đường.' },
          { id: 'B', text: 'Khi chuyển hướng xe chạy hoặc tầm nhìn bị hạn chế.' },
          { id: 'C', text: 'Khi qua nơi đường bộ giao nhau; nơi đường sắt giao cắt đường bộ.' },
          { id: 'D', text: 'Tất cả các trường hợp nêu trên.' },
        ],
        correctOptionId: 'D',
        markedConfidence: 'detected_mark',
        explanation: 'Cả 3 trường hợp A, B, C đều bắt buộc người lái xe phải chủ động giảm tốc độ.',
      },
      {
        id: 'trf-q5',
        questionNumber: 5,
        question: 'Khi lái xe trên đường cao tốc, người lái xe phải chuyển làn đường như thế nào để đảm bảo an toàn?',
        options: [
          { id: 'A', text: 'Chuyển làn tại bất kỳ vị trí nào khi thấy đường vắng.' },
          { id: 'B', text: 'Chỉ được chuyển làn ở nơi cho phép; có tín hiệu báo trước và đảm bảo khoảng cách an toàn.' },
          { id: 'C', text: 'Bấm còi liên tục và chuyển làn thật nhanh.' },
          { id: 'D', text: 'Chuyển làn sang làn khẩn cấp để vượt xe khác.' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: 'Chỉ được chuyển làn ở nơi quy định cho phép (vạch đứt), bật xi-nhan và giữ khoảng cách an toàn.',
      },
      {
        id: 'trf-q6',
        questionNumber: 6,
        question: 'Biển báo hiệu hình tròn có viền đỏ, nền trắng, trên nền có hình vẽ hoặc chữ số màu đen là loại biển báo gì?',
        options: [
          { id: 'A', text: 'Biển báo nguy hiểm' },
          { id: 'B', text: 'Biển báo cấm' },
          { id: 'C', text: 'Biển báo hiệu lệnh' },
          { id: 'D', text: 'Biển chỉ dẫn' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: 'Biển tròn viền đỏ nền trắng là nhóm biển báo cấm. Khoanh B.',
      },
      {
        id: 'trf-q7',
        questionNumber: 7,
        question: 'Người ngồi trên xe mô tô hai bánh, xe gắn máy phải đội mũ bảo hiểm có cài quai đúng quy cách khi nào?',
        options: [
          { id: 'A', text: 'Chỉ khi đi trên đường cao tốc hoặc quốc lộ.' },
          { id: 'B', text: 'Khi tham gia giao thông đường bộ.' },
          { id: 'C', text: 'Chỉ khi trời mưa hoặc thời tiết xấu.' },
          { id: 'D', text: 'Chỉ khi ra ngoài khu vực nội thị.' },
        ],
        correctOptionId: 'B',
        markedConfidence: 'detected_mark',
        explanation: 'Người điều khiển và ngồi trên xe mô tô, xe gắn máy phải đội mũ bảo hiểm cài quai đúng quy cách khi tham gia giao thông đường bộ.',
      },
    ],
  },
];

export function getSavedQuizSets(): QuizSet[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_QUIZZES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveQuizSets(INITIAL_DEMO_QUIZZES);
      return INITIAL_DEMO_QUIZZES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveQuizSets(INITIAL_DEMO_QUIZZES);
    return INITIAL_DEMO_QUIZZES;
  } catch (err) {
    console.error('Error loading quiz sets:', err);
    return INITIAL_DEMO_QUIZZES;
  }
}

export function saveQuizSets(sets: QuizSet[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch (err) {
    console.error('Error saving quiz sets:', err);
  }
}

export function saveSingleQuizSet(quizSet: QuizSet): QuizSet[] {
  const all = getSavedQuizSets();
  const index = all.findIndex((q) => q.id === quizSet.id);
  let updated: QuizSet[];
  if (index >= 0) {
    updated = [...all];
    updated[index] = { ...quizSet, updatedAt: Date.now() };
  } else {
    updated = [quizSet, ...all];
  }
  saveQuizSets(updated);
  return updated;
}

export function deleteQuizSet(id: string): QuizSet[] {
  const all = getSavedQuizSets();
  const updated = all.filter((q) => q.id !== id);
  saveQuizSets(updated);
  return updated;
}

export function updateQuizBestScore(
  quizSetId: string,
  score: number,
  total: number,
  percentage: number
) {
  const all = getSavedQuizSets();
  const quiz = all.find((q) => q.id === quizSetId);
  if (!quiz) return;

  const currentBest = quiz.bestScore?.percentage ?? -1;
  if (percentage >= currentBest) {
    quiz.bestScore = {
      score,
      total,
      percentage,
      date: Date.now(),
    };
    saveQuizSets(all);
  }
}

/**
 * Prepares the session questions for test taking by shuffling questions and options
 * according to user configuration!
 */
export function buildTestSession(
  quizSet: QuizSet,
  config: TestConfig
): SessionQuestion[] {
  let questions = [...quizSet.questions];

  // 1. Shuffle questions if requested
  if (config.shuffleQuestions) {
    questions = shuffleArray(questions);
  }

  // 2. Limit count if specified
  if (config.questionCount > 0 && config.questionCount < questions.length) {
    questions = questions.slice(0, config.questionCount);
  }

  // 3. Process options & shuffle choices A, B, C, D if requested
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const sessionQuestions: SessionQuestion[] = questions.map((q, idx) => {
    let finalOptions = [...q.options];
    let correctId = q.correctOptionId;

    if (config.shuffleOptions && finalOptions.length > 1) {
      // Find the text of the correct answer first
      const correctOptionObj = finalOptions.find((opt) => opt.id === q.correctOptionId);
      const correctText = correctOptionObj ? correctOptionObj.text : '';

      // Shuffle the option items
      const shuffled = shuffleArray(finalOptions);

      // Re-label options with A, B, C, D sequentially so they look clean
      finalOptions = shuffled.map((opt, optIdx) => ({
        id: letters[optIdx] || String.fromCharCode(65 + optIdx),
        text: opt.text,
      }));

      // Find where the correct text ended up
      const newCorrectOpt = finalOptions.find((opt) => opt.text === correctText);
      if (newCorrectOpt) {
        correctId = newCorrectOpt.id;
      }
    }

    return {
      originalQuestionId: q.id,
      index: idx,
      questionNumber: idx + 1,
      question: q.question,
      options: finalOptions,
      correctOptionId: correctId,
      explanation: q.explanation,
    };
  });

  return sessionQuestions;
}
