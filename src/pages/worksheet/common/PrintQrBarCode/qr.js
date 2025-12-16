import _ from 'lodash';
import genQrDataURL from 'src/pages/worksheet/common/PrintQrBarCode/genQrDataurl';
import { getCompressedFontSize } from './util';

export class QrLabel {
  // portrait 肖像 高度大
  // landscape 风景 宽度大
  constructor(options = {}) {
    this.options = options;
    this.setOptions();
    this.setLayout();
    this.init();
  }
  async render() {
    if (this.options.type === 'p') {
      await this.renderPortrait();
    } else {
      await this.renderLandscape();
    }
  }
  setOptions() {
    const { pixelRadio = 2, width = 100, height = 100, fontSize = 1, firstIsTitle } = this.options;
    this.pixelRadio = pixelRadio;
    this.width = width * pixelRadio;
    this.height = height * pixelRadio;
    this.firstIsTitle = firstIsTitle;
    this.fontSize = fontSize || 1;
  }
  setLayout() {
    const { size } = this.options;
    this.layout = {
      paddingX: 3,
      paddingY: 2,
      fontSize: 5,
    };
    if (this.options.type === 'p') {
      this.layout.codeSize = {
        s: 11,
        m: 16,
        l: 20,
        h: 24,
      }[size];
    } else {
      this.layout.codeSize = {
        s: 13,
        m: 16,
        l: 20,
        h: 24,
      }[size];
    }
  }
  init() {
    const { type } = this.options;
    const { paddingY, codeSize, fontSize } = this.layout;
    const canvas = this.canvas || document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.ctx = ctx;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, this.width, this.height);
    this.unitSize = Math.min(this.width, this.height) / 30;
    this.maxLineNumber =
      type === 'p'
        ? Math.floor((this.height - (paddingY + codeSize + 2) * this.unitSize) / (fontSize * this.unitSize))
        : 5;
  }
  // 处理文字换行
  cutTextByWidth(fontSize, context, maxWidth, isBold) {
    let result = [];
    this.ctx.font = (isBold ? 'bold ' : '') + fontSize * this.fontSize + 'px sans-serif';
    if (this.ctx.measureText(context).width < maxWidth) {
      return [context];
    }
    let text = '';
    for (let i = 0; i < context.length; i++) {
      text += context[i];
      const width = this.ctx.measureText(text).width;
      if (width > maxWidth) {
        result.push(text.slice(0, -1));
        text = text.slice(-1);
      }
    }
    if (text) {
      result.push(text);
    }
    return result;
  }
  measureTextWidth(value, fontSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = fontSize + 'px sans-serif';
    return ctx.measureText(value).width;
  }
  renderText({ x = 0, y = 0, fontSize, content, width, isCenter, forceInLine, isBold, color = '#222' }) {
    this.ctx.textBaseline = 'top';
    let textFontSize = fontSize * 0.55 * this.fontSize;
    if (forceInLine) {
      const textWidth = this.measureTextWidth(content, textFontSize);
      if (textWidth > width) {
        textFontSize = getCompressedFontSize(content, width);
      } else {
        forceInLine = false;
      }
    }
    if (isBold) {
      this.ctx.font = 'bold ' + textFontSize + 'px sans-serif';
    } else {
      this.ctx.font = textFontSize + 'px sans-serif';
    }
    this.ctx.textAlign = isCenter && !forceInLine ? 'center' : 'left';
    this.ctx.fillStyle = color;
    this.ctx.fillText(content, isCenter && !forceInLine ? x + width / 2 : x, y + (fontSize - textFontSize) / 2);
  }
  renderVerticalTexts({ x = 0, y = 0, fontSize, textList, color = '#222', width, firstIsBold }) {
    const { isPreview } = this.options;
    let textTop = y;
    const texts = _.flatten(
      textList.map(({ text, forceInLine } = {}, i) =>
        forceInLine
          ? { text, forceInLine, isBold: this.firstIsTitle && i === 0 }
          : this.cutTextByWidth(fontSize * 0.55, text, width, firstIsBold && this.firstIsTitle && i === 0).map(t => ({
              text: t,
              isBold: this.firstIsTitle && i === 0,
            })),
      ),
    ).slice(0, this.maxLineNumber);
    const titleIsSplitted = texts.filter(t => t.isBold).length > 1;
    texts.forEach(({ text, forceInLine, isBold } = {}, i) => {
      const textIsBold = firstIsBold && isBold;
      if (text === '' || _.isUndefined(text)) {
        textTop += fontSize;
        return;
      }
      this.renderText({
        x,
        y: textTop,
        fontSize,
        content: text,
        width,
        forceInLine,
        isBold: textIsBold,
        isCenter: this.options.type === 'p' && textIsBold && i === 0 && !titleIsSplitted,
        color,
      });
      if (isPreview) {
        const lineWidth = fontSize / 40;
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash([lineWidth * 2, lineWidth * 4]);
        this.ctx.strokeRect(-1 * lineWidth, textTop, this.width + 2 * lineWidth, fontSize);
      }
      textTop += fontSize;
    });
  }
  drawImageUrl(url, { x, y, width, height } = {}) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => {
        const renderWidth = (image.width * height) / image.height;
        if (renderWidth < width) {
          x += (width - renderWidth) / 2;
        }
        this.ctx.drawImage(image, x, y, renderWidth, height);
        resolve();
      };
      image.src = url;
    });
  }
  async renderPortrait() {
    const { qrPos = 'top', texts = [], url, correctLevel } = this.options;
    const { paddingX, paddingY, codeSize, fontSize } = this.layout;
    this.renderVerticalTexts({
      textList: texts,
      x: paddingX * this.unitSize,
      y: qrPos === 'top' ? (paddingY + codeSize + 2) * this.unitSize : paddingY * this.unitSize,
      width: this.width - paddingX * 2 * this.unitSize,
      fontSize: fontSize * this.unitSize,
      firstIsBold: true,
    });
    const qrDataUrl = url && genQrDataURL({ value: url, correctLevel });
    if (qrDataUrl) {
      await this.drawImageUrl(qrDataUrl, {
        x: (this.width - codeSize * this.unitSize) / 2,
        y: qrPos === 'top' ? paddingY * this.unitSize : this.height - (paddingY + codeSize) * this.unitSize,
        width: codeSize * this.unitSize,
        height: codeSize * this.unitSize,
      });
    }
  }
  async renderLandscape() {
    const { size, texts, qrPos, url, correctLevel } = this.options;
    const { paddingX, paddingY, fontSize, codeSize } = this.layout;
    let topTextNum = {
      s: 2,
      m: 1,
      l: 0,
      h: 0,
    }[size];
    this.renderVerticalTexts({
      textList: texts.slice(0, topTextNum).slice(0, this.maxLineNumber),
      x: paddingX * this.unitSize,
      y: paddingY * this.unitSize,
      width: this.width - paddingX * 2 * this.unitSize,
      fontSize: fontSize * this.unitSize,
      firstIsBold: true,
    });
    this.renderVerticalTexts({
      textList: texts.slice(topTextNum).slice(0, this.maxLineNumber),
      x: qrPos === 'left' ? (paddingX + codeSize + 2) * this.unitSize : paddingX * this.unitSize,
      y: (paddingY + fontSize * topTextNum) * this.unitSize,
      width: this.width - paddingX * 2 * this.unitSize - (codeSize + 2) * this.unitSize,
      fontSize: fontSize * this.unitSize,
      firstIsBold: topTextNum === 0,
    });
    const qrDataUrl = genQrDataURL({ value: url, correctLevel });
    if (qrDataUrl) {
      await this.drawImageUrl(qrDataUrl, {
        x: qrPos === 'left' ? paddingX * this.unitSize : this.width - (paddingX + codeSize) * this.unitSize,
        y:
          size === 'l'
            ? (this.height - codeSize * this.unitSize) / 2
            : (paddingY + fontSize * topTextNum + 2) * this.unitSize,
        width: codeSize * this.unitSize,
        height: codeSize * this.unitSize,
      });
    }
  }
}

window.QrLabel = QrLabel;
