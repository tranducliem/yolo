export async function generateShareImage(
  photoDataUrl: string,
  petName: string,
  aiComment: string,
  score: { smile: number; love: number; rare: number },
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // 1. Background (white)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1080, 1080);

  // 2. Photo centered (780x780 with rounded clip)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = photoDataUrl;
  });

  const photoX = 150, photoY = 80, photoW = 780, photoH = 780;
  ctx.save();
  roundedRect(ctx, photoX, photoY, photoW, photoH, 24);
  ctx.clip();
  ctx.drawImage(img, photoX, photoY, photoW, photoH);
  ctx.restore();

  // 3. Gold frame border (6px)
  ctx.strokeStyle = '#D4A843';
  ctx.lineWidth = 6;
  roundedRect(ctx, photoX, photoY, photoW, photoH, 24);
  ctx.stroke();

  // 4. "1st Best Shot" badge (top-left of photo)
  ctx.fillStyle = 'rgba(212, 168, 67, 0.95)';
  roundedRect(ctx, photoX + 16, photoY + 16, 200, 36, 18);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🥇 1st Best Shot', photoX + 30, photoY + 40);

  // 5. Pet name (below photo)
  ctx.fillStyle = '#0D1B2A';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(petName, 540, photoY + photoH + 45);

  // 6. AI comment (below pet name)
  ctx.fillStyle = '#6B7280';
  ctx.font = '18px sans-serif';
  ctx.fillText(`「${aiComment}」`, 540, photoY + photoH + 80);

  // 7. Star scores
  ctx.font = '16px sans-serif';
  const scoreY = photoY + photoH + 110;
  const starText = `笑顔${'★'.repeat(score.smile)}${'☆'.repeat(5 - score.smile)}  愛情${'★'.repeat(score.love)}${'☆'.repeat(5 - score.love)}  レア${'★'.repeat(score.rare)}${'☆'.repeat(5 - score.rare)}`;
  ctx.fillStyle = '#D4A843';
  ctx.fillText(starText, 540, scoreY);

  // 8. Donation message (bottom)
  ctx.fillStyle = '#059669';
  ctx.font = '14px sans-serif';
  ctx.fillText('🌟 この写真のシェアが保護犬の食事1回分になりました', 540, 1010);

  // 9. YOLO logo + URL (bottom-right)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#2A9D8F';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('🐾 YOLO', 1050, 1060);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '12px sans-serif';
  ctx.fillText('yolo.jp', 1050, 1078);

  ctx.textAlign = 'left';

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
