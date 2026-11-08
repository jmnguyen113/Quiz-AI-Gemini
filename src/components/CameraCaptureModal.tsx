import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  Sparkles,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import { playShutterSound, playClickSound } from '../utils/sound';
import { generateSampleExamSheet } from '../utils/sampleSheets';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractionSuccess: (extractedData: {
    quizTitle: string;
    questions: any[];
    imagePreview?: string;
  }) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onExtractionSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [promptHint, setPromptHint] = useState('');
  const [scanningProgressStep, setScanningProgressStep] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start camera stream
  const startCamera = async (facing: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Trình duyệt không hỗ trợ trực tiếp camera. Vui lòng dùng tính năng "Tải ảnh lên".');
        setActiveTab('upload');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(
        'Không thể mở camera. Bạn có thể cấp quyền camera hoặc tải ảnh đề thi từ thư viện máy.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Switch camera when opened
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedImage) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, capturedImage]);

  // Flip rear / front camera
  const handleFlipCamera = () => {
    playClickSound();
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Take photo from video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    playShutterSound();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAnalysisError('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      setAnalysisError(null);
    };
    reader.readAsDataURL(file);
  };

  // Select sample sheet
  const handleSelectSample = (type: 'physics' | 'history' | 'math') => {
    playClickSound();
    const sampleDataUrl = generateSampleExamSheet(type);
    setCapturedImage(sampleDataUrl);
    setAnalysisError(null);
  };

  // Retake / Clear photo
  const handleRetake = () => {
    playClickSound();
    setCapturedImage(null);
    setAnalysisError(null);
    if (activeTab === 'camera') {
      startCamera(facingMode);
    }
  };

  // Progress message sequence during analysis
  useEffect(() => {
    if (!isAnalyzing) {
      setScanningProgressStep(0);
      return;
    }
    const timer1 = setTimeout(() => setScanningProgressStep(1), 1200);
    const timer2 = setTimeout(() => setScanningProgressStep(2), 2600);
    const timer3 = setTimeout(() => setScanningProgressStep(3), 4200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isAnalyzing]);

  // Call Server Gemini API
  const handleAnalyzeImage = async () => {
    if (!capturedImage) return;
    playClickSound();
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/extract-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          mimeType: 'image/jpeg',
          promptHint: promptHint.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Trích xuất thất bại. Vui lòng kiểm tra lại ảnh.');
      }

      const { quizTitle, questions } = result.data;

      if (!questions || questions.length === 0) {
        throw new Error(
          'Không tìm thấy câu hỏi trắc nghiệm nào trong ảnh. Hãy chụp rõ hơn hoặc chọn ảnh có văn bản rõ ràng.'
        );
      }

      onExtractionSuccess({
        quizTitle: quizTitle || 'Đề trắc nghiệm đã quét',
        questions,
        imagePreview: capturedImage,
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Lỗi kết nối máy chủ phân tích đề.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const progressMessages = [
    'Đang tải ảnh và khởi động mô hình Gemini 3.8 AI...',
    'Đang phân tích bố cục đề thi, phát hiện chữ và công thức...',
    'Đang nhận diện các dấu khoanh tròn, dấu tích (✓) đáp án...',
    'Đang hoàn tất trích xuất ngân hàng câu hỏi...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Chụp & Quét Đề Thi</h2>
              <p className="text-xs text-slate-400">
                Tự động nhận diện câu hỏi và đáp án đã đánh dấu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Navigation Tabs (Only when image not yet captured) */}
        {!capturedImage && (
          <div className="flex border-b border-slate-800 px-5 pt-3 gap-2 bg-slate-900/50">
            <button
              onClick={() => {
                setActiveTab('camera');
                setCameraError(null);
              }}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'camera'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Camera trực tiếp
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Tải ảnh lên / Thư viện
            </button>
            <button
              onClick={() => {
                setActiveTab('samples');
                stopCamera();
              }}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'samples'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Đề mẫu có khoanh sẵn
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* STATE 1: Analyzing Screen */}
          {isAnalyzing && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-400 animate-spin [animation-duration:1.8s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ScanLine className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">
                  Đang phân tích đề bằng Gemini AI
                </h3>
                <p className="text-xs text-indigo-300 mt-1 max-w-sm">
                  {progressMessages[scanningProgressStep]}
                </p>
              </div>

              <div className="w-64 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${(scanningProgressStep + 1) * 25}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 italic">
                AI đang nhận diện chữ viết, câu hỏi trắc nghiệm và vị trí khoanh tròn bút...
              </p>
            </div>
          )}

          {/* STATE 2: Image is captured/selected -> Preview & Action */}
          {!isAnalyzing && capturedImage && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-80 flex items-center justify-center group">
                <img
                  src={capturedImage}
                  alt="Ảnh đề thi đã chụp"
                  className="object-contain max-h-80 w-auto"
                />
                <div className="absolute top-2.5 right-2.5">
                  <button
                    onClick={handleRetake}
                    className="px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-medium backdrop-blur-md flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Chụp lại
                  </button>
                </div>
              </div>

              {/* Optional instruction hint */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Ghi chú thêm cho AI (không bắt buộc):</span>
                  <span className="text-[10px] text-slate-400">Ví dụ: "Chỉ lấy câu 1-5" hoặc "Môn Lý"</span>
                </label>
                <input
                  type="text"
                  value={promptHint}
                  onChange={(e) => setPromptHint(e.target.value)}
                  placeholder="Nhập ghi chú hoặc chủ đề đề thi (nếu cần)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {analysisError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-semibold">Lỗi nhận diện: </span>
                    {analysisError}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: Camera Stream Active */}
          {!isAnalyzing && !capturedImage && activeTab === 'camera' && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{cameraError}</p>
                      <p className="text-slate-400 mt-1">
                        Hãy dùng tính năng "Tải ảnh lên" bên cạnh để chụp bằng ứng dụng máy ảnh gốc của điện thoại.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Mở máy ảnh / Chọn ảnh từ máy
                  </button>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-[4/3] flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Viewfinder Overlay */}
                  <div className="absolute inset-4 sm:inset-8 border-2 border-indigo-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between items-start">
                      <div className="w-5 h-5 border-t-2 border-l-2 border-indigo-400" />
                      <div className="w-5 h-5 border-t-2 border-r-2 border-indigo-400" />
                    </div>
                    <div className="text-center">
                      <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white/90">
                        Căn chỉnh đề thi & đáp án khoanh vào trong khung
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-5 h-5 border-b-2 border-l-2 border-indigo-400" />
                      <div className="w-5 h-5 border-b-2 border-r-2 border-indigo-400" />
                    </div>
                  </div>

                  {/* Camera Controls inside stream */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={handleFlipCamera}
                      title="Đổi camera trước / sau"
                      className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition active:rotate-180"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 4: Upload Tab */}
          {!isAnalyzing && !capturedImage && activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition group"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 flex items-center justify-center transition mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Nhấp để chụp ảnh hoặc tải ảnh đề thi
                </h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Hỗ trợ định dạng JPG, PNG, WebP từ điện thoại hoặc máy tính.
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                >
                  Chọn ảnh từ thiết bị
                </button>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-300">
                <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mẹo để quét đề chính xác nhất:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-[11px]">
                  <li>Chụp thẳng góc, đủ ánh sáng, tránh bị bóng tay che khuất.</li>
                  <li>Các dấu khoanh tròn bút đỏ, bút bi hoặc tích ✓ nên nhìn rõ nét.</li>
                  <li>Có thể chụp từng trang một, sau đó các câu hỏi sẽ được gộp vào đề thi.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STATE 5: Samples Tab */}
          {!isAnalyzing && !capturedImage && activeTab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Chưa có sẵn đề thi giấy bên cạnh? Bạn có thể thử nghiệm ngay với đề thi mô phỏng đã được đánh dấu câu trả lời:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectSample('physics')}
                  className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-left transition flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition">
                      Đề kiểm tra Vật Lý 12
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      5 câu hỏi sóng cơ, dao động, kèm đáp án khoanh bút đỏ.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectSample('math')}
                  className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-left transition flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                      Đề Khoa học & Kiến thức chung
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      4 câu hỏi khoa học Trái Đất, sinh học có đánh dấu đáp án.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input for capture */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {!capturedImage && activeTab === 'camera' && !cameraError && (
              <button
                onClick={handleCapturePhoto}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition"
              >
                <Camera className="w-4 h-4" />
                Chụp ảnh này
              </button>
            )}

            {capturedImage && (
              <button
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Quét & Trích xuất câu hỏi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
