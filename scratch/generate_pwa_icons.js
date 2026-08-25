const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create PNG file in Node without external packages
function createPngBuffer(width, height, drawPixelFn) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT (Raw RGBA pixels with 0 filter byte per scanline)
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// CRC32 calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

// Draw Emerald App Icon with Shopping Bag / Truck Symbol & Rounded Corners
function drawAppIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w * 0.44;

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Rounded squircle background
  const cornerRadius = w * 0.22;
  const inBoxX = Math.max(0, Math.abs(dx) - (cx - cornerRadius));
  const inBoxY = Math.max(0, Math.abs(dy) - (cy - cornerRadius));
  const cornerDist = Math.sqrt(inBoxX * inBoxX + inBoxY * inBoxY);

  if (cornerDist > cornerRadius) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Gradient Background (Emerald 800 #065f46 to Emerald 600 #059669)
  const t = (y / h);
  const bgR = Math.round(6 + t * (5 - 6));
  const bgG = Math.round(95 + t * (150 - 95));
  const bgB = Math.round(70 + t * (105 - 70));

  // Draw Logo Symbol (Shopping Bag & Cart body)
  // Bag body rect
  const bagW = w * 0.44;
  const bagH = h * 0.38;
  const bagTop = cy - bagH * 0.3;
  const bagBottom = bagTop + bagH;
  const bagLeft = cx - bagW / 2;
  const bagRight = cx + bagW / 2;

  // Check if pixel inside Shopping Bag / Truck body
  const isInsideBag = x >= bagLeft && x <= bagRight && y >= bagTop && y <= bagBottom;

  // Handle loop (Top curve)
  const handleR = bagW * 0.26;
  const handleCy = bagTop;
  const handleDist = Math.sqrt((x - cx) ** 2 + (y - handleCy) ** 2);
  const isInsideHandle = y < bagTop && handleDist <= handleR && handleDist >= handleR * 0.6;

  // Wheels at bottom
  const wheelR = w * 0.06;
  const wheelY = bagBottom + wheelR * 0.5;
  const wheel1X = cx - bagW * 0.3;
  const wheel2X = cx + bagW * 0.3;
  const isWheel1 = Math.sqrt((x - wheel1X) ** 2 + (y - wheelY) ** 2) <= wheelR;
  const isWheel2 = Math.sqrt((x - wheel2X) ** 2 + (y - wheelY) ** 2) <= wheelR;

  if (isInsideBag || isInsideHandle || isWheel1 || isWheel2) {
    // Crisp White logo icon
    return [255, 255, 255, 255];
  }

  // Gold star accent
  const starDist = Math.sqrt((x - (cx + bagW * 0.2)) ** 2 + (y - (bagTop + bagH * 0.3)) ** 2);
  if (starDist <= w * 0.05) {
    return [251, 191, 36, 255]; // Amber accent
  }

  return [bgR, bgG, bgB, 255];
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA Icons...');
const sizes = [192, 512];
for (const s of sizes) {
  const buf = createPngBuffer(s, s, drawAppIcon);
  const outPath = path.join(iconsDir, `icon-${s}x${s}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`Saved: ${outPath} (${buf.length} bytes)`);
}

// Apple touch icon (180x180)
const appleBuf = createPngBuffer(180, 180, drawAppIcon);
const applePath = path.join(iconsDir, 'apple-touch-icon.png');
fs.writeFileSync(applePath, appleBuf);
console.log(`Saved: ${applePath}`);

console.log('PWA Icons Generated Successfully!');
