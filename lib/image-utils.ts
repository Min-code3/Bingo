export function resizeImage(dataUrl: string, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = (h / w) * maxSize; w = maxSize; }
        else { w = (w / h) * maxSize; h = maxSize; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Use better image smoothing for quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, w, h);

      // Use WebP if supported, otherwise JPEG with high quality
      const isWebPSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      if (isWebPSupported) {
        resolve(canvas.toDataURL('image/webp', 0.92)); // WebP with 0.92 quality (high quality)
      } else {
        resolve(canvas.toDataURL('image/jpeg', 0.88)); // JPEG with 0.88 quality (high quality)
      }
    };
    img.src = dataUrl;
  });
}

export function generateDummyPhoto(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;
  const cols = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8'];
  const g = ctx.createLinearGradient(0, 0, 400, 400);
  g.addColorStop(0, cols[Math.floor(Math.random() * cols.length)]);
  g.addColorStop(1, cols[Math.floor(Math.random() * cols.length)]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 400, 400);
  ctx.font = '72px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📸', 200, 170);
  ctx.font = '22px serif';
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.fillText('프로토타입', 200, 270);
  return canvas.toDataURL('image/jpeg', 0.7);
}
