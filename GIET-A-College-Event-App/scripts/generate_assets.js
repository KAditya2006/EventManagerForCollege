const { PNG } = require('../mobile/node_modules/pngjs');
const fs = require('fs');
const path = require('path');

// 1. Read source icon.png
const srcPath = path.join(__dirname, '..', 'mobile', 'assets', 'icon.png');
const src = PNG.sync.read(fs.readFileSync(srcPath));
const w = src.width, h = src.height;

// 2. Flood-fill from outer corners to find outer white background
const visited = new Uint8Array(w * h);
const queue = [];

// Seed all border pixels if they are white
for (let x = 0; x < w; x++) {
  queue.push(x); // top edge
  queue.push((h - 1) * w + x); // bottom edge
  visited[x] = 1;
  visited[(h - 1) * w + x] = 1;
}
for (let y = 0; y < h; y++) {
  queue.push(y * w); // left edge
  queue.push(y * w + (w - 1)); // right edge
  visited[y * w] = 1;
  visited[y * w + (w - 1)] = 1;
}

while (queue.length > 0) {
  const p = queue.pop();
  const x = p % w;
  const y = Math.floor(p / w);

  const neighbors = [
    [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
  ];
  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
      const np = ny * w + nx;
      if (!visited[np]) {
        const idx = np * 4;
        const r = src.data[idx];
        const g = src.data[idx + 1];
        const b = src.data[idx + 2];
        if (r > 230 && g > 230 && b > 230) {
          visited[np] = 1;
          queue.push(np);
        }
      }
    }
  }
}

// 3. Create transparent emblem image (1024x1024)
const transparentLogo = new PNG({ width: w, height: h });
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const p = y * w + x;
    const idx = p * 4;
    const r = src.data[idx];
    const g = src.data[idx + 1];
    const b = src.data[idx + 2];

    if (visited[p]) {
      transparentLogo.data[idx] = 0;
      transparentLogo.data[idx + 1] = 0;
      transparentLogo.data[idx + 2] = 0;
      transparentLogo.data[idx + 3] = 0;
    } else {
      // Check if neighboring any visited pixel for soft anti-aliasing
      let hasVisitedNeighbor = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            if (visited[ny * w + nx]) {
              hasVisitedNeighbor = true;
              break;
            }
          }
        }
        if (hasVisitedNeighbor) break;
      }

      transparentLogo.data[idx] = r;
      transparentLogo.data[idx + 1] = g;
      transparentLogo.data[idx + 2] = b;
      
      if (hasVisitedNeighbor) {
        // Calculate lightness to feather smoothly
        const lightness = (r + g + b) / (3 * 255);
        // Darker edge pixels get higher alpha, whitish edge pixels get lower alpha
        const alpha = Math.max(0, Math.min(255, Math.round((1 - lightness * 0.7) * 255)));
        transparentLogo.data[idx + 3] = alpha;
      } else {
        transparentLogo.data[idx + 3] = 255;
      }
    }
  }
}

// 4. Find tight bounding box of emblem
let minX = w, maxX = 0, minY = h, maxY = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4;
    if (transparentLogo.data[idx + 3] > 20) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const emblemWidth = maxX - minX + 1;
const emblemHeight = maxY - minY + 1;
console.log(`Emblem bounds: [${minX}, ${minY}] to [${maxX}, ${maxY}], size: ${emblemWidth}x${emblemHeight}`);

// Helper: Bilinear resize into a target PNG
function drawResized(srcPng, srcBox, dstPng, dstBox) {
  const { x: sx0, y: sy0, w: sw, h: sh } = srcBox;
  const { x: dx0, y: dy0, w: dw, h: dh } = dstBox;

  for (let dy = 0; dy < dh; dy++) {
    const sy = sy0 + (dy / dh) * sh;
    const sy_floor = Math.floor(sy);
    const sy_ceil = Math.min(sy0 + sh - 1, sy_floor + 1);
    const fy = sy - sy_floor;

    for (let dx = 0; dx < dw; dx++) {
      const sx = sx0 + (dx / dw) * sw;
      const sx_floor = Math.floor(sx);
      const sx_ceil = Math.min(sx0 + sw - 1, sx_floor + 1);
      const fx = sx - sx_floor;

      const p00 = (sy_floor * srcPng.width + sx_floor) * 4;
      const p10 = (sy_floor * srcPng.width + sx_ceil) * 4;
      const p01 = (sy_ceil * srcPng.width + sx_floor) * 4;
      const p11 = (sy_ceil * srcPng.width + sx_ceil) * 4;

      const dIdx = ((dy0 + dy) * dstPng.width + (dx0 + dx)) * 4;

      for (let c = 0; c < 4; c++) {
        const top = srcPng.data[p00 + c] * (1 - fx) + srcPng.data[p10 + c] * fx;
        const bottom = srcPng.data[p01 + c] * (1 - fx) + srcPng.data[p11 + c] * fx;
        const val = top * (1 - fy) + bottom * fy;
        dstPng.data[dIdx + c] = Math.round(val);
      }
    }
  }
}

// 5. Generate high-res `giet-logo-transparent.png` (512x512)
const logo512 = new PNG({ width: 512, height: 512 });
// Keep aspect ratio
const scale512 = 460 / Math.max(emblemWidth, emblemHeight);
const dw512 = Math.round(emblemWidth * scale512);
const dh512 = Math.round(emblemHeight * scale512);
const dx512 = Math.round((512 - dw512) / 2);
const dy512 = Math.round((512 - dh512) / 2);
drawResized(transparentLogo, { x: minX, y: minY, w: emblemWidth, h: emblemHeight }, logo512, { x: dx512, y: dy512, w: dw512, h: dh512 });
fs.writeFileSync(path.join(__dirname, '..', 'mobile', 'assets', 'giet-logo-transparent.png'), PNG.sync.write(logo512));
console.log('Saved high-res giet-logo-transparent.png');

// 6. Generate `splash-icon.png` (512x512 transparent)
fs.writeFileSync(path.join(__dirname, '..', 'mobile', 'assets', 'splash-icon.png'), PNG.sync.write(logo512));
console.log('Saved splash-icon.png');

// 7. Generate `android-icon-foreground.png` (432x432, safe zone = 288x288 circle)
const foreground = new PNG({ width: 432, height: 432 });
const safeDim = 250; // comfortably inside 288 safe circle
const scaleFg = safeDim / Math.max(emblemWidth, emblemHeight);
const dwFg = Math.round(emblemWidth * scaleFg);
const dhFg = Math.round(emblemHeight * scaleFg);
const dxFg = Math.round((432 - dwFg) / 2);
const dyFg = Math.round((432 - dhFg) / 2);
drawResized(transparentLogo, { x: minX, y: minY, w: emblemWidth, h: emblemHeight }, foreground, { x: dxFg, y: dyFg, w: dwFg, h: dhFg });
fs.writeFileSync(path.join(__dirname, '..', 'mobile', 'assets', 'android-icon-foreground.png'), PNG.sync.write(foreground));
console.log('Saved android-icon-foreground.png');

// 8. Generate `icon.png` (1024x1024) - clean, premium institutional design
const appIcon = new PNG({ width: 1024, height: 1024 });
// Subtle premium background: crisp white with clean subtle gradient
for (let y = 0; y < 1024; y++) {
  for (let x = 0; x < 1024; x++) {
    const idx = (y * 1024 + x) * 4;
    // Pure clean white background
    appIcon.data[idx] = 255;
    appIcon.data[idx + 1] = 255;
    appIcon.data[idx + 2] = 255;
    appIcon.data[idx + 3] = 255;
  }
}
const iconDim = 720;
const scaleIcon = iconDim / Math.max(emblemWidth, emblemHeight);
const dwIcon = Math.round(emblemWidth * scaleIcon);
const dhIcon = Math.round(emblemHeight * scaleIcon);
const dxIcon = Math.round((1024 - dwIcon) / 2);
const dyIcon = Math.round((1024 - dhIcon) / 2);

// Alpha composite onto white appIcon
for (let dy = 0; dy < dhIcon; dy++) {
  const sy = minY + (dy / dhIcon) * emblemHeight;
  const sy_f = Math.floor(sy);
  const sy_c = Math.min(minY + emblemHeight - 1, sy_f + 1);
  const fy = sy - sy_f;

  for (let dx = 0; dx < dwIcon; dx++) {
    const sx = minX + (dx / dwIcon) * emblemWidth;
    const sx_f = Math.floor(sx);
    const sx_c = Math.min(minX + emblemWidth - 1, sx_f + 1);
    const fx = sx - sx_f;

    const p00 = (sy_f * w + sx_f) * 4;
    const p10 = (sy_f * w + sx_c) * 4;
    const p01 = (sy_c * w + sx_f) * 4;
    const p11 = (sy_c * w + sx_c) * 4;

    const srcA = transparentLogo.data[p00 + 3] * (1 - fx) * (1 - fy) +
                 transparentLogo.data[p10 + 3] * fx * (1 - fy) +
                 transparentLogo.data[p01 + 3] * (1 - fx) * fy +
                 transparentLogo.data[p11 + 3] * fx * fy;
    const aNorm = srcA / 255;

    if (aNorm > 0.01) {
      const srcR = transparentLogo.data[p00] * (1 - fx) * (1 - fy) +
                   transparentLogo.data[p10] * fx * (1 - fy) +
                   transparentLogo.data[p01] * (1 - fx) * fy +
                   transparentLogo.data[p11] * fx * fy;
      const srcG = transparentLogo.data[p00 + 1] * (1 - fx) * (1 - fy) +
                   transparentLogo.data[p10 + 1] * fx * (1 - fy) +
                   transparentLogo.data[p01 + 1] * (1 - fx) * fy +
                   transparentLogo.data[p11 + 1] * fx * fy;
      const srcB = transparentLogo.data[p00 + 2] * (1 - fx) * (1 - fy) +
                   transparentLogo.data[p10 + 2] * fx * (1 - fy) +
                   transparentLogo.data[p01 + 2] * (1 - fx) * fy +
                   transparentLogo.data[p11 + 2] * fx * fy;

      const dIdx = ((dyIcon + dy) * 1024 + (dxIcon + dx)) * 4;
      // Over white:
      appIcon.data[dIdx] = Math.round(srcR * aNorm + 255 * (1 - aNorm));
      appIcon.data[dIdx + 1] = Math.round(srcG * aNorm + 255 * (1 - aNorm));
      appIcon.data[dIdx + 2] = Math.round(srcB * aNorm + 255 * (1 - aNorm));
      appIcon.data[dIdx + 3] = 255;
    }
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'mobile', 'assets', 'icon.png'), PNG.sync.write(appIcon));
console.log('Saved clean 1024x1024 icon.png');
