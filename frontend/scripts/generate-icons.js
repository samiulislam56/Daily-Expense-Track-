import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate an SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F766E" />
      <stop offset="50%" stop-color="#0D9488" />
      <stop offset="100%" stop-color="#14B8A6" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#042F2E" flood-opacity="0.35" />
    </filter>
  </defs>
  <!-- Background with subtle squircle -->
  <rect width="512" height="512" rx="112" fill="url(#grad)" />
  
  <!-- Inset subtle border -->
  <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="4" />

  <!-- DailyFlow Brand Symbol: Calm Flow + Precision Down Trend -->
  <g filter="url(#shadow)" transform="translate(106, 116)">
    <!-- Main trending flow stroke -->
    <path d="M 30 70 
             C 90 70, 110 170, 180 170 
             C 220 170, 240 120, 270 120" 
          fill="none" 
          stroke="#FFFFFF" 
          stroke-width="38" 
          stroke-linecap="round" 
          stroke-linejoin="round" />
    
    <!-- Downward expense flow / arrow head -->
    <path d="M 270 50 L 270 130 L 190 130" 
          fill="none" 
          stroke="#FFFFFF" 
          stroke-width="38" 
          stroke-linecap="round" 
          stroke-linejoin="round" />

    <!-- Pulse accent dot -->
    <circle cx="30" cy="70" r="24" fill="#5EEAD4" />
    <circle cx="270" cy="130" r="16" fill="#CCFBF1" />
  </g>

  <!-- Currency Paisa / Node dots -->
  <circle cx="256" cy="380" r="14" fill="#FFFFFF" fill-opacity="0.8" />
  <circle cx="216" cy="380" r="8" fill="#FFFFFF" fill-opacity="0.4" />
  <circle cx="296" cy="380" r="8" fill="#FFFFFF" fill-opacity="0.4" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');

// Function to generate pure RGBA PNG without external packages
function createPng(width, height, drawFn) {
  const rowBytes = width * 4;
  const rawBuffer = Buffer.alloc((rowBytes + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawBuffer[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawBuffer[pixelOffset] = r;
      rawBuffer[pixelOffset + 1] = g;
      rawBuffer[pixelOffset + 2] = b;
      rawBuffer[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawBuffer);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression (deflate)
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // non-interlaced

  const ihdrChunk = chunk('IHDR', ihdrData);
  const idatChunk = chunk('IDAT', deflated);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Draw DailyFlow Icon in RGBA
function drawIconPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const rCorner = isMaskable ? 0 : w * 0.22;

  // Background squircle / rounded rect
  let inBounds = false;
  if (isMaskable) {
    inBounds = true; // maskable fills entire canvas
  } else {
    const dx = Math.max(0, Math.abs(x - cx) - (cx - rCorner));
    const dy = Math.max(0, Math.abs(y - cy) - (cy - rCorner));
    inBounds = (dx * dx + dy * dy) <= (rCorner * rCorner);
  }

  if (!inBounds) {
    return [0, 0, 0, 0];
  }

  // Linear gradient: #0F766E (15, 118, 110) to #14B8A6 (20, 184, 166)
  const t = (x + y) / (w + h);
  let r = Math.round(15 + (20 - 15) * t);
  let g = Math.round(118 + (184 - 118) * t);
  let b = Math.round(110 + (166 - 110) * t);

  // Inset ring border
  if (!isMaskable) {
    const insetDist = Math.min(x, y, w - 1 - x, h - 1 - y);
    if (insetDist >= 2 && insetDist <= 5) {
      r = Math.min(255, r + 40);
      g = Math.min(255, g + 40);
      b = Math.min(255, b + 40);
    }
  }

  // Draw arrow / chart glyph in white
  // Normalized coords [0..1]
  const nx = x / w;
  const ny = y / h;

  // Center symbol area: nx in [0.26, 0.74], ny in [0.26, 0.74]
  // Trend line from (0.30, 0.42) -> (0.50, 0.58) -> (0.68, 0.44) -> arrow head
  const isLine1 = Math.abs((ny - 0.42) - (0.58 - 0.42) * ((nx - 0.30) / 0.20)) < 0.038 && nx >= 0.30 && nx <= 0.50;
  const isLine2 = Math.abs((ny - 0.58) - (0.44 - 0.58) * ((nx - 0.50) / 0.18)) < 0.038 && nx >= 0.50 && nx <= 0.68;
  const isArrow1 = Math.abs(nx - 0.68) < 0.038 && ny >= 0.32 && ny <= 0.46;
  const isArrow2 = Math.abs(ny - 0.32) < 0.038 && nx >= 0.54 && nx <= 0.68;

  // Pulse dots
  const dot1Dist = Math.hypot(nx - 0.30, ny - 0.42);
  const dot2Dist = Math.hypot(nx - 0.50, ny - 0.72);
  const isDot1 = dot1Dist < 0.048;
  const isDot2 = dot2Dist < 0.028;

  if (isLine1 || isLine2 || isArrow1 || isArrow2 || isDot1 || isDot2) {
    return [255, 255, 255, 255];
  }

  return [r, g, b, 255];
}

console.log('Generating PNG app icons for PWA...');
const pwa192 = createPng(192, 192, (x, y, w, h) => drawIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

const pwa512 = createPng(512, 512, (x, y, w, h) => drawIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

const maskable512 = createPng(512, 512, (x, y, w, h) => drawIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), maskable512);

const appleIcon = createPng(180, 180, (x, y, w, h) => drawIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

console.log('Successfully generated all PWA icons in frontend/public:');
console.log(' - pwa-192x192.png');
console.log(' - pwa-512x512.png');
console.log(' - maskable-icon-512x512.png');
console.log(' - apple-touch-icon.png');
console.log(' - icon.svg');
console.log(' - favicon.svg');
