
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const outDir = '/root/meetly/public/icons';

fs.mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - indigo gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#4f46e5');
  grad.addColorStop(1, '#7c3aed');
  ctx.fillStyle = grad;

  // Rounded rect
  const r = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.arc(size, 0, r, -Math.PI / 2, 0);
  ctx.lineTo(size, size - r);
  ctx.arc(size, size, r, 0, Math.PI / 2);
  ctx.lineTo(r, size);
  ctx.arc(0, size, r, Math.PI / 2, Math.PI);
  ctx.lineTo(0, r);
  ctx.arc(0, 0, r, Math.PI, Math.PI * 1.5);
  ctx.closePath();
  ctx.fill();

  // White calendar box
  const cx = size / 2;
  const cy = size / 2;
  const boxW = size * 0.42;
  const boxH = size * 0.38;
  const bx = cx - boxW / 2;
  const by = cy - boxH / 2 + size * 0.04;

  ctx.fillStyle = '#ffffff';
  const br = size * 0.04;
  ctx.beginPath();
  ctx.roundRect(bx, by + boxH * 0.15, boxW, boxH * 0.85, br);
  ctx.fill();

  // Top bar
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH * 0.25, [br, br, 0, 0]);
  ctx.fill();

  // Rings
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = size * 0.025;
  ctx.lineCap = 'round';
  const ringY = by + boxH * 0.11;
  ctx.beginPath();
  ctx.moveTo(bx + boxW * 0.25, ringY);
  ctx.lineTo(bx + boxW * 0.25, ringY + size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + boxW * 0.75, ringY);
  ctx.lineTo(bx + boxW * 0.75, ringY + size * 0.08);
  ctx.stroke();

  // Lines
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = size * 0.012;
  for (let i = 0; i < 4; i++) {
    const ly = by + boxH * 0.35 + i * boxH * 0.14;
    ctx.beginPath();
    ctx.moveTo(bx + boxW * 0.18, ly);
    ctx.lineTo(bx + boxW * 0.82, ly);
    ctx.stroke();
  }

  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outDir, 'icon-' + size + '.png'), buf);
  console.log('icon-' + size + '.png created');
}
