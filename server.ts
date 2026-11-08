import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Allow large image uploads (phone photos in base64)
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Shared Gemini AI instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Extract quiz questions and marked answers from camera photo
app.post('/api/extract-quiz', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', promptHint = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp dữ liệu hình ảnh (imageBase64).',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Chưa cấu hình GEMINI_API_KEY trên hệ thống.',
      });
    }

    // Clean base64 string if data URL prefix exists
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const systemPrompt = `Bạn là một trợ lý AI chuyên gia số hóa đề thi và bài tập trắc nghiệm.
Nhiệm vụ của bạn là phân tích hình ảnh đề thi hoặc phiếu bài tập do người dùng chụp bằng camera điện thoại.
Đặc biệt chú ý:
1. TRÍCH XUẤT ĐẦY ĐỦ TẤT CẢ CÁC CÂU HỎI TRẮC NGHIỆM có trong ảnh.
2. Với mỗi câu hỏi, nhận diện nội dung câu hỏi và tất cả các phương án lựa chọn (A, B, C, D,...).
3. PHÁT HIỆN ĐÁP ÁN ĐÃ ĐÁNH DẤU:
   - Hãy quan sát kỹ trên ảnh xem người làm đã khoanh tròn, đánh dấu tích (✓), tô đậm, gạch chân hoặc ghi đáp án cho câu nào.
   - Nếu có đáp án được đánh dấu, hãy gán đúng đáp án đó vào 'correctOptionId' (ví dụ: "A", "B", "C" hoặc "D").
   - Nếu ảnh không có dấu khoanh/tích hoặc dấu không rõ, hãy dựa vào kiến thức để xác định đáp án đúng chuẩn xác nhất và nêu rõ trong explanation.
4. Trích xuất chính xác công thức, ký hiệu toán/lý/hóa hoặc tiếng Anh nếu có.
5. Cung cấp lời giải thích ngắn gọn, súc tích (explanation) cho đáp án đúng bằng tiếng Việt.
${promptHint ? `Yêu cầu thêm từ người dùng: ${promptHint}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: 'Hãy đọc và trích xuất tất cả các câu hỏi trắc nghiệm cùng đáp án đã được đánh dấu/khoanh tròn trong bức ảnh này.',
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: {
              type: Type.STRING,
              description: 'Tiêu đề đề thi hoặc chủ đề nhận diện được từ ảnh (ví dụ: Đề kiểm tra Toán 12, Trắc nghiệm Tiếng Anh...).',
            },
            questions: {
              type: Type.ARRAY,
              description: 'Danh sách các câu hỏi trắc nghiệm trích xuất được.',
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: {
                    type: Type.INTEGER,
                    description: 'Số thứ tự câu hỏi như trên đề (ví dụ 1, 2, 3...)',
                  },
                  question: {
                    type: Type.STRING,
                    description: 'Nội dung câu hỏi đầy đủ',
                  },
                  options: {
                    type: Type.ARRAY,
                    description: 'Các lựa chọn A, B, C, D...',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: {
                          type: Type.STRING,
                          description: 'Ký tự đại diện lựa chọn: A, B, C, D...',
                        },
                        text: {
                          type: Type.STRING,
                          description: 'Nội dung của lựa chọn',
                        },
                      },
                      required: ['id', 'text'],
                    },
                  },
                  correctOptionId: {
                    type: Type.STRING,
                    description: 'Lựa chọn được đánh dấu/khoanh tròn hoặc đáp án đúng (ví dụ: "A", "B", "C" hoặc "D")',
                  },
                  markedConfidence: {
                    type: Type.STRING,
                    description: 'Xác định: "detected_mark" (phát hiện có dấu khoanh/tích), "inferred_correct" (suy luận theo kiến thức vì không có dấu)',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Lời giải thích ngắn gọn tại sao đáp án này đúng hoặc thông tin dấu khoanh phát hiện',
                  },
                },
                required: ['question', 'options', 'correctOptionId'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const rawText = response.text || '{}';
    const parsedData = JSON.parse(rawText);

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Lỗi trích xuất quiz:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Không thể trích xuất câu hỏi từ ảnh. Vui lòng thử lại với ảnh rõ nét hơn.',
    });
  }
});

// Endpoint: Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Endpoint: Download entire project source code as a .zip file
app.get('/api/download-zip', async (_req, res) => {
  try {
    const { ZipArchive } = archiver;
    const archive = new ZipArchive({ zlib: { level: 9 } });

    res.attachment('snapquiz-ai-source.zip');
    res.setHeader('Content-Type', 'application/zip');

    archive.on('error', (err: any) => {
      console.error('Archive error:', err);
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Add all files except node_modules, dist, .git, and .env secrets
    archive.glob('**/*', {
      cwd: __dirname,
      ignore: ['node_modules/**', 'dist/**', '.git/**', '.env', '.env.local', 'coverage/**', '*.log', 'server.js'],
      dot: true, // include .gitignore, .env.example, etc.
    });

    archive.finalize();
  } catch (error: any) {
    console.error('Error generating zip:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || String(error) });
    }
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
  });
}

startServer();
