/**
 * Generates realistic exam paper snapshot images with marked/circled answers.
 * Useful for immediate testing when users don't have a paper test sheet nearby.
 */
export function generateSampleExamSheet(type: 'physics' | 'history' | 'math' = 'physics'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - textured paper effect
  ctx.fillStyle = '#fcfbf7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper grain & margins
  ctx.strokeStyle = '#e5e2d9';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  // Header
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';

  if (type === 'physics') {
    ctx.fillText('ĐỀ KIỂM TRA ĐỊNH KỲ VẬT LÝ 12 - HỌC KỲ I', canvas.width / 2, 90);
    ctx.font = 'normal 15px system-ui, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Thời gian làm bài: 15 phút (Đã làm & Đánh dấu đáp án ôn tập)', canvas.width / 2, 120);

    // Question 1
    drawQuestion(
      ctx,
      50,
      170,
      'Câu 1: Một vật dao động điều hòa theo phương trình x = 4cos(2πt + π/3) (cm). Biên độ dao động của vật là:',
      [
        { id: 'A', text: '4 cm' },
        { id: 'B', text: '2 cm' },
        { id: 'C', text: '8 cm' },
        { id: 'D', text: 'π/3 cm' },
      ],
      'A' // circled
    );

    // Question 2
    drawQuestion(
      ctx,
      50,
      350,
      'Câu 2: Sóng cơ học không truyền được trong môi trường nào sau đây?',
      [
        { id: 'A', text: 'Chất rắn' },
        { id: 'B', text: 'Chất lỏng' },
        { id: 'C', text: 'Chân không' },
        { id: 'D', text: 'Chất khí' },
      ],
      'C' // circled
    );

    // Question 3
    drawQuestion(
      ctx,
      50,
      530,
      'Câu 3: Đơn vị đo cường độ âm là:',
      [
        { id: 'A', text: 'Ben (B)' },
        { id: 'B', text: 'Đềxiben (dB)' },
        { id: 'C', text: 'Oát trên mét vuông (W/m²)' },
        { id: 'D', text: 'Niu-tơn trên mét (N/m)' },
      ],
      'C' // circled
    );

    // Question 4
    drawQuestion(
      ctx,
      50,
      710,
      'Câu 4: Hiện tượng cộng hưởng xảy ra trong dao động cưỡng bức khi:',
      [
        { id: 'A', text: 'Tần số của lực cưỡng bức bằng tần số riêng của hệ' },
        { id: 'B', text: 'Lực ma sát của môi trường rất lớn' },
        { id: 'C', text: 'Biên độ của lực cưỡng bức giảm về 0' },
        { id: 'D', text: 'Chu kỳ dao động cưỡng bức tiến đến vô cực' },
      ],
      'A' // circled
    );

    // Question 5
    drawQuestion(
      ctx,
      50,
      890,
      'Câu 5: Trong mạch điện xoay chiều chỉ có tụ điện C, điện áp hai đầu tụ điện:',
      [
        { id: 'A', text: 'Sớm pha π/2 so với cường độ dòng điện' },
        { id: 'B', text: 'Trễ pha π/2 so với cường độ dòng điện' },
        { id: 'C', text: 'Cùng pha với cường độ dòng điện' },
        { id: 'D', text: 'Ngược pha với cường độ dòng điện' },
      ],
      'B' // circled
    );
  } else {
    // General science & math
    ctx.fillText('BÀI TẬP TRẮC NGHIỆM TỔNG HỢP (CÓ ĐÁNH DẤU BÚT ĐỎ)', canvas.width / 2, 90);
    ctx.font = 'normal 15px system-ui, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Tài liệu học tập - Khoanh tròn câu trả lời đúng', canvas.width / 2, 120);

    drawQuestion(
      ctx,
      50,
      170,
      'Câu 1: Nguyên tố hóa học nào phổ biến nhất trong vỏ Trái Đất?',
      [
        { id: 'A', text: 'Sắt (Fe)' },
        { id: 'B', text: 'Oxy (O)' },
        { id: 'C', text: 'Silic (Si)' },
        { id: 'D', text: 'Nhôm (Al)' },
      ],
      'B'
    );

    drawQuestion(
      ctx,
      50,
      350,
      'Câu 2: Thủ đô của Việt Nam là thành phố nào?',
      [
        { id: 'A', text: 'Thành phố Hồ Chí Minh' },
        { id: 'B', text: 'Đà Nẵng' },
        { id: 'C', text: 'Hà Nội' },
        { id: 'D', text: 'Hải Phòng' },
      ],
      'C'
    );

    drawQuestion(
      ctx,
      50,
      530,
      'Câu 3: Đâu là hành tinh lớn nhất trong Hệ Mặt Trời?',
      [
        { id: 'A', text: 'Sao Thổ' },
        { id: 'B', text: 'Sao Mộc' },
        { id: 'C', text: 'Sao Hỏa' },
        { id: 'D', text: 'Sao Hải Vương' },
      ],
      'B'
    );

    drawQuestion(
      ctx,
      50,
      710,
      'Câu 4: Quá trình quang hợp của thực vật chủ yếu hấp thụ khí gì và giải phóng khí gì?',
      [
        { id: 'A', text: 'Hấp thụ CO2, giải phóng O2' },
        { id: 'B', text: 'Hấp thụ O2, giải phóng CO2' },
        { id: 'C', text: 'Hấp thụ N2, giải phóng O2' },
        { id: 'D', text: 'Hấp thụ H2O, giải phóng N2' },
      ],
      'A'
    );
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}

function drawQuestion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  qText: string,
  options: { id: string; text: string }[],
  circledId: string
) {
  // Question title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'left';

  // Simple multi-line text wrapping
  const words = qText.split(' ');
  let line = '';
  let lineY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 780 && n > 0) {
      ctx.fillText(line, x, lineY);
      line = words[n] + ' ';
      lineY += 24;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, lineY);

  // Options layout (2 rows of 2 columns)
  const optYStart = lineY + 32;
  const colWidth = 380;

  options.forEach((opt, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const optX = x + col * colWidth;
    const optY = optYStart + row * 40;

    // Draw option letter and text
    ctx.font = 'normal 16px system-ui, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`${opt.id}. ${opt.text}`, optX, optY);

    // If marked/circled answer: draw hand-drawn pen circle in red/blue
    if (opt.id === circledId) {
      ctx.save();
      ctx.strokeStyle = '#dc2626'; // Red pen marker
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw an imperfect oval around the letter
      const circleCenterX = optX + 8;
      const circleCenterY = optY - 5;
      ctx.beginPath();
      ctx.ellipse(circleCenterX, circleCenterY, 15, 14, Math.PI / 12, 0, 2 * Math.PI);
      ctx.stroke();

      // Add a small checkmark tick mark
      ctx.beginPath();
      ctx.moveTo(optX - 12, optY - 4);
      ctx.lineTo(optX - 7, optY + 1);
      ctx.lineTo(optX - 1, optY - 10);
      ctx.stroke();

      ctx.restore();
    }
  });
}
