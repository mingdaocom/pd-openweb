import JsBarcode from 'jsbarcode';
import _ from 'lodash';
import { getCompressedFontSize } from './util';

const BAR_FONT_SIZE = 15;

function parseToCode128(value) {
  const parsed = JsBarcode({}, value, {
    format: 'CODE128',
  });
  return _.get(parsed, '_encodings.0.0');
}

function getBarcodeBase64(value, { width = 100, height = 100 } = {}) {
  const canvas = document.createElement('canvas');
  const fontSize = Math.max((height / 100) * 7, BAR_FONT_SIZE);
  const code128 = parseToCode128(value);
  JsBarcode(canvas, value, {
    format: 'CODE128',
    width: width / (code128.data.length < 90 ? 90 : code128.data.length),
    height: height - fontSize - 4,
    displayValue: false,
    margin: 0,
    lineColor: '#000000',
  });
  return {
    dataUrl: canvas.toDataURL(),
    width: canvas.width,
  };
}
export class BarLabel {
  constructor({
    isDebug = false,
    isPreview = false,
    // isDebug = true,
    pixelRadio = 2,
    width = 100,
    height = 100,
    fontSize = 1,
    firstIsTitle = false,
    showBarValue = true,
    codePosition = 'top',
    size = 'm',
    value,
    texts = [],
  } = {}) {
    this.setOptions({
      isDebug,
      isPreview,
      pixelRadio,
      width,
      height,
      fontSize: fontSize || 1,
      size,
      firstIsTitle,
      codePosition,
      value,
      texts,
      showBarValue,
    });
    this.setLayoutParams();
    this.init();
  }
  setOptions(values) {
    this.options = Object.assign({}, this.options, values);
  }
  setLayoutParams() {
    const { size, width, height } = this.options;
    const codeSizes =
      width > height
        ? {
            l: 18,
            m: 14,
            s: 9,
          }
        : {
            l: 19,
            m: 14,
            s: 9,
          };
    this.layout = {
      paddingX: 3,
      paddingY: 2,
      height: codeSizes[size],
      fontSize: 5,
    };
  }
  init() {
    const { width, height, pixelRadio } = this.options;
    const _width = width * pixelRadio;
    this._width = _width;
    const _height = height * pixelRadio;
    this._height = _height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = _width;
    this.canvas.height = _height;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, _width, _height);
    this.unitSize = _width > _height ? _height / 30 : _width / 30;
    this.maxLineNumber = Math.floor(
      (_height - (this.layout.paddingY + this.layout.height + 2) * this.unitSize) /
        (this.layout.fontSize * this.unitSize),
    );
  }
  async render() {
    const { isDebug, showBarValue } = this.options;
    if (isDebug) {
      this.drawPadding();
      this.drawGrid();
    }
    await this.drawBar();
    if (showBarValue) {
      this.drawBarText();
    }
    this.drawTexts();
  }
  // 处理文字换行
  cutTextByWidth(fontSize, context, maxWidth) {
    let result = [];
    this.ctx.font = fontSize + 'px sans-serif';
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
  // 绘制参考网格
  drawGrid() {
    const colNum = Math.floor(this._width / this.unitSize);
    const rowNum = Math.floor(this._height / this.unitSize);
    this.ctx.setLineDash([]);
    this.ctx.strokeStyle = '#ccc';
    for (let colIndex = 1; colIndex < colNum + 1; colIndex++) {
      this.ctx.beginPath();
      this.ctx.moveTo(colIndex * this.unitSize, 0);
      this.ctx.lineTo(colIndex * this.unitSize, this._height);
      this.ctx.stroke();
    }
    for (let rowIndex = 1; rowIndex < rowNum + 1; rowIndex++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, rowIndex * this.unitSize);
      this.ctx.lineTo(this._width, rowIndex * this.unitSize);
      this.ctx.stroke();
    }
  }
  // 绘制参考 padding
  drawPadding() {
    const { paddingX, paddingY } = this.layout;
    this.ctx.fillStyle = '#caccfe';
    this.ctx.fillRect(0, 0, this._width, this._height);
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(
      3 * this.unitSize,
      2 * this.unitSize,
      this._width - 2 * paddingX * this.unitSize,
      this._height - 2 * paddingY * this.unitSize,
    );
  }
  drawImageUrl(url, { x, y, width, height } = {}) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => {
        this.ctx.drawImage(image, x, y, width, height);
        resolve();
      };
      image.src = url;
    });
  }
  async drawBar() {
    const { value, codePosition } = this.options;
    const { paddingX, paddingY, height } = this.layout;
    let dataUrl;
    const barWidth = this._width - 2 * paddingX * this.unitSize;
    const codeSize = height * this.unitSize * 0.9;
    if (_.isUndefined(value) || value === '') {
      return;
    }
    const code128 = parseToCode128(value);
    const barObj = getBarcodeBase64(value, { height: height * this.unitSize, width: barWidth });
    dataUrl = value && barObj.dataUrl;
    const top = codePosition === 'top' ? paddingY * this.unitSize : this._height - paddingY * this.unitSize - codeSize;
    if (value && dataUrl) {
      await this.drawImageUrl(dataUrl, {
        x:
          code128.data.length < 90
            ? paddingX * this.unitSize + (barWidth - barObj.width) / 2
            : paddingX * this.unitSize,
        y: top,
        width: code128.data.length < 90 ? barObj.width : barWidth,
        height: codeSize,
      });
    }
    if (this.options.isDebug) {
      this.ctx.fillStyle = '#ddd';
      this.ctx.fillRect(
        paddingX * this.unitSize,
        top,
        this._width - 2 * paddingX * this.unitSize,
        height * this.unitSize,
      );
    }
  }
  drawBarText() {
    const { value, codePosition } = this.options;
    const { paddingX, paddingY, height } = this.layout;
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#151515';
    const text =
      this.cutTextByWidth(2 * this.unitSize, value, this._width - paddingX * 2 * this.unitSize).slice(0, 1)[0] || '';
    this.ctx.font = 2 * this.unitSize + 'px "Times New Roman"';
    this.ctx.fillText(
      text,
      this._width / 2,
      codePosition === 'top'
        ? (paddingY + height * 0.95) * this.unitSize
        : this._height - (paddingY + height * 1.08) * this.unitSize,
    );
  }
  measureTextWidth(value, fontSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = fontSize + 'px sans-serif';
    return ctx.measureText(value).width;
  }
  drawTexts() {
    let { isPreview, firstIsTitle, codePosition, texts, showBarValue } = this.options;
    const { paddingX, paddingY, height, fontSize } = this.layout;
    const textX = paddingX * this.unitSize;
    const textY =
      codePosition === 'top' ? (paddingY + height + (showBarValue ? 2 : 0)) * this.unitSize : paddingY * this.unitSize;
    const textWidth = this._width - 2 * paddingX * this.unitSize;
    const textHeight = fontSize * this.unitSize;
    texts = _.flatten(
      texts.map(({ text, forceInLine } = {}, i) =>
        forceInLine
          ? {
              text,
              forceInLine,
              isBold: firstIsTitle && i === 0,
            }
          : this.cutTextByWidth(
              textHeight * 0.6 * (firstIsTitle && i === 0 ? 1 : this.options.fontSize),
              text,
              this._width - paddingX * 2 * this.unitSize,
            ).map(t => ({
              text: t,
              isBold: firstIsTitle && i === 0,
            })),
      ),
    ).slice(0, this.maxLineNumber);
    this.ctx.textBaseline = 'top';
    this.ctx.strokeStyle = '#ccc';
    this.ctx.fillStyle = '#000';
    this.ctx.setLineDash([4, 8]);
    const titleIsSplitted = texts.filter(t => t.isBold).length > 1;
    texts.forEach(({ text, isBold, forceInLine } = {}, i) => {
      if (!text) {
        return;
      }
      let textFontSize = textHeight * 0.6 * this.options.fontSize;
      const isCenter = !titleIsSplitted && isBold && i === 0;
      if (forceInLine) {
        const contentWidth = this.measureTextWidth(text, textFontSize);
        if (contentWidth > textWidth) {
          textFontSize = getCompressedFontSize(text, textWidth);
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
      if (isPreview) {
        this.ctx.strokeRect(0 - 1, textY + i * textHeight, this._width + 2, textHeight);
      }
      this.ctx.fillText(
        text,
        isCenter && !forceInLine ? textX + textWidth / 2 : textX,
        textY + i * textHeight + (textHeight - textFontSize) / 2,
      );
    });
  }
}
