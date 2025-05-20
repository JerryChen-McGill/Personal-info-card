// utils/canvasHelper.js

function drawRoundRectWithCompat(ctx, x, y, width, height, radius, fill = true, stroke = false) {
  const supportsRoundRect = typeof ctx.roundRect === 'function';
  if (supportsRoundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawDivider(ctx, x, y) {
  const gradient = ctx.createLinearGradient(x - 240, y, x + 240, y);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.5, '#4A90E2');
  gradient.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1;
  ctx.moveTo(x - 240, y);
  ctx.lineTo(x + 240, y);
  ctx.stroke();
}

/**
 * 通用多行文本绘制，支持自动换行和段落分割
 * @param {CanvasRenderingContext2D} ctx
 * @param {string|string[]} text 文本或段落数组
 * @param {number} x 起始x
 * @param {number} y 起始y
 * @param {number} maxWidth 最大宽度
 * @param {number} lineHeight 行高
 * @param {object} options 可选：{font, fillStyle, textAlign}
 * @returns {number} 最后一行的y坐标
 */
function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
  if (options.font) ctx.font = options.font;
  if (options.fillStyle) ctx.fillStyle = options.fillStyle;
  if (options.textAlign) ctx.textAlign = options.textAlign;

  // 支持传入字符串或段落数组
  const paragraphs = Array.isArray(text) ? text : String(text).split('\n');
  let lines = [];
  paragraphs.forEach(paragraph => {
    if (paragraph === '') {
      lines.push('');
    } else {
      const words = paragraph.split('');
      let currentLine = '';
      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
    }
  });

  let currentY = y;
  lines.forEach(line => {
    if (line !== '') ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  });
  return currentY;
}

/**
 * 加载图片并绘制到canvas，失败时绘制占位符
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} canvas canvas对象（用于createImage）
 * @param {string} imgSrc 图片路径
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} placeholderSrc 占位符图片路径
 * @returns {Promise<void>}
 */
function drawImageWithPlaceholder(ctx, canvas, imgSrc, x, y, w, h, placeholderSrc) {
  return new Promise(resolve => {
    const img = canvas.createImage();
    img.onload = () => {
      ctx.drawImage(img, x, y, w, h);
      resolve();
    };
    img.onerror = () => {
      if (placeholderSrc) {
        const placeholderImg = canvas.createImage();
        placeholderImg.onload = () => {
          ctx.drawImage(placeholderImg, x, y, w, h);
          resolve();
        };
        placeholderImg.onerror = () => resolve();
        placeholderImg.src = placeholderSrc;
      } else {
        resolve();
      }
    };
    img.src = imgSrc;
  });
}

module.exports = {
  drawRoundRectWithCompat,
  drawDivider,
  drawMultilineText,
  drawImageWithPlaceholder
}; 