// Renders a channeled message as a beautiful shareable PNG (1080x1350, Instagram portrait)
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function createMessageImage({ from, subject, message, songSign }) {
  await document.fonts.ready;

  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Deep cosmic background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b0820');
  bg.addColorStop(0.5, '#120a2e');
  bg.addColorStop(1, '#070512');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft violet + teal glows
  let glow = ctx.createRadialGradient(180, 160, 0, 180, 160, 500);
  glow.addColorStop(0, 'rgba(168,85,247,0.22)');
  glow.addColorStop(1, 'rgba(168,85,247,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  glow = ctx.createRadialGradient(920, 1200, 0, 920, 1200, 500);
  glow.addColorStop(0, 'rgba(34,211,238,0.16)');
  glow.addColorStop(1, 'rgba(34,211,238,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 1.6 + 0.4;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'center';

  // Header
  ctx.fillStyle = '#FBBF24';
  ctx.font = '600 34px Cinzel, serif';
  ctx.fillText('✦  A  CHANNELED  MESSAGE  ✦', W / 2, 150);

  // From
  ctx.fillStyle = '#C084FC';
  ctx.font = '700 52px Cinzel, serif';
  ctx.fillText(`From ${from}`, W / 2, 240);

  // Subject
  ctx.fillStyle = 'rgba(230,230,245,0.5)';
  ctx.font = '400 30px Inter, sans-serif';
  ctx.fillText(`re: ${subject}`, W / 2, 295);

  // Divider
  ctx.strokeStyle = 'rgba(168,85,247,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, 340);
  ctx.lineTo(W / 2 + 120, 340);
  ctx.stroke();

  // Message body — auto-size to fit
  let fontSize = 44;
  let lines;
  do {
    ctx.font = `italic 400 ${fontSize}px Inter, sans-serif`;
    lines = wrapText(ctx, `"${message}"`, W - 200);
    if (lines.length * (fontSize * 1.55) > 700) fontSize -= 3;
    else break;
  } while (fontSize > 26);

  ctx.fillStyle = 'rgba(240,238,250,0.94)';
  const lineHeight = fontSize * 1.55;
  const blockHeight = lines.length * lineHeight;
  let y = 340 + (760 - blockHeight) / 2 + lineHeight;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  // Song sign
  if (songSign) {
    ctx.fillStyle = 'rgba(34,211,238,0.85)';
    ctx.font = '400 28px Inter, sans-serif';
    const songLines = wrapText(ctx, `♪  ${songSign}`, W - 240);
    let sy = 1170;
    for (const line of songLines.slice(0, 2)) {
      ctx.fillText(line, W / 2, sy);
      sy += 40;
    }
  }

  // Footer
  ctx.fillStyle = 'rgba(251,191,36,0.7)';
  ctx.font = '600 30px Cinzel, serif';
  ctx.fillText('🔮 Cosmic Encounters', W / 2, 1290);

  return await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}