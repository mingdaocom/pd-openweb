import QRCode from '@mdfe/qrcode-base';

export const QRErrorCorrectLevel = {
  L: 1, // 7%
  M: 0, // 15%
  Q: 3, // 25%
  H: 2, // 30%
};

const DEFAULT_OPTIONS = {
  gap: 0,
  render: 'canvas',
  width: 256,
  height: 256,
  typeNumber: -1,
  correctLevel: QRErrorCorrectLevel.M,
  background: '#ffffff',
  foreground: '#000000',
};

/**
 * 在 Canvas 中生成二维码并返回 data URL。
 */
export function generateQrDataUrl(options) {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const qrcode = new QRCode(finalOptions.typeNumber, finalOptions.correctLevel);
  qrcode.addData(finalOptions.value);
  qrcode.make();

  const canvas = document.createElement('canvas');
  canvas.width = finalOptions.width;
  canvas.height = finalOptions.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = finalOptions.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tileW = (finalOptions.width - finalOptions.gap * 2) / qrcode.getModuleCount();
  const tileH = (finalOptions.height - finalOptions.gap * 2) / qrcode.getModuleCount();

  for (let row = 0; row < qrcode.getModuleCount(); row++) {
    for (let col = 0; col < qrcode.getModuleCount(); col++) {
      ctx.fillStyle = qrcode.isDark(row, col) ? finalOptions.foreground : finalOptions.background;
      const width = Math.ceil((col + 1) * tileW) - Math.floor(col * tileW);
      const height = Math.ceil((row + 1) * tileH) - Math.floor(row * tileH);
      ctx.fillRect(
        Math.round(col * tileW) + finalOptions.gap,
        Math.round(row * tileH) + finalOptions.gap,
        width,
        height,
      );
    }
  }

  return canvas.toDataURL();
}
