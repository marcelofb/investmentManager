import zlib from 'zlib';
import fs from 'fs';

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, typeB, data, crcB]);
}

function createPNG(width, height, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  // bytes 10-12 remain 0 (compression, filter, interlace)

  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 3);
    row[0] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      row[1 + x * 3] = r;
      row[2 + x * 3] = g;
      row[3 + x * 3] = b;
    }
    rows.push(row);
  }

  const compressed = zlib.deflateSync(Buffer.concat(rows));

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.mkdirSync('public', { recursive: true });

// Primary blue: #2563eb = rgb(37, 99, 235)
fs.writeFileSync('public/icon-192.png', createPNG(192, 192, 37, 99, 235));
fs.writeFileSync('public/icon-512.png', createPNG(512, 512, 37, 99, 235));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 37, 99, 235));

console.log('Icons generated: public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png');
