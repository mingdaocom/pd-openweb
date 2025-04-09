import QRCode from '@mdfe/qrcode-base';
import JsBarcode from 'jsbarcode';
import loadScript from 'load-script';
import localForage from 'localforage';
import { get } from 'lodash';
import {
  BAR_POSITION,
  LANDSCAPE_QR_CODE_SIZE,
  PORTRAIT_QR_CODE_SIZE,
  PRINT_TYPE,
  QR_LABEL_SIZE,
  QR_LABEL_SIZES,
  QR_LAYOUT,
  QR_POSITION,
} from 'worksheet/common/PrintQrBarCode/enum';

export const QRErrorCorrectLevel = {
  L: 1, // 7%
  M: 0, // 15%
  Q: 3, // 25%
  H: 2, // 30%
};

const defaultOptions = {
  gap: 0,
  render: 'canvas',
  width: 256,
  height: 256,
  typeNumber: -1,
  correctLevel: QRErrorCorrectLevel.M,
  background: '#ffffff',
  foreground: '#000000',
  setFillColor: () => {},
  rect: () => {},
  renderCell: () => {},
};

const renderQr = function (options) {
  options = Object.assign({}, defaultOptions, options);
  const qrcode = new QRCode(options.typeNumber, options.correctLevel);
  qrcode.addData(options.value);
  qrcode.make();
  const tileW = (options.width - options.gap * 2) / qrcode.getModuleCount();
  const tileH = (options.height - options.gap * 2) / qrcode.getModuleCount();
  for (let row = 0; row < qrcode.getModuleCount(); row++) {
    for (let col = 0; col < qrcode.getModuleCount(); col++) {
      // const w = Math.ceil((col + 1) * tileW) - Math.floor(col * tileW);
      // const h = Math.ceil((row + 1) * tileH) - Math.floor(row * tileH);
      // const w = tileW;
      // const h = tileH;
      options.renderCell({
        x: Math.round(col * tileW * 100) / 100 + options.gap,
        y: Math.round(row * tileH * 100) / 100 + options.gap,
        w: Math.round(tileW * 100) / 100,
        h: Math.round(tileH * 100) / 100,
        isDark: qrcode.isDark(row, col),
        color: qrcode.isDark(row, col) ? options.foreground : options.background,
      });
    }
  }
};

function mmToPt(mm) {
  return mm * 2.83464567;
}

function getHeightOfText(text, { fontSize = 12, width = 100, lineHeight = 1.5 } = {}) {
  let result;
  const div = document.createElement('div');
  div.style.width = width + 'px';
  div.style.fontSize = fontSize + 'px';
  div.style.fontFamily = 'sans-serif';
  div.style.lineHeight = lineHeight;
  div.style.wordBreak = 'break-all';
  div.style.position = 'absolute';
  div.style.top = '100px';
  div.style.left = '100px';
  div.style.zIndex = '9999999';
  div.innerText = text;
  document.body.appendChild(div);
  result = div.clientHeight;
  document.body.removeChild(div);
  return result;
}
function getWidthOfText(text, fontSize = 12) {
  let result;
  const div = document.createElement('div');
  div.style.display = 'inline-block';
  div.style.fontSize = fontSize + 'px';
  div.style.fontFamily = 'sans-serif';
  div.innerText = text;
  div.style.wordBreak = 'break-all';
  div.style.position = 'absolute';
  div.style.top = '100px';
  div.style.left = '100px';
  div.style.zIndex = '9999999';
  document.body.appendChild(div);
  result = div.clientWidth;
  document.body.removeChild(div);
  return result;
}
function getLineNumOfText(text = '', { fontSize = 12, width = 100 } = {}) {
  const height = getHeightOfText(text, { fontSize, width });
  const lineHeight = getHeightOfText(text.trim()[0] || 'o', { fontSize, width });
  if (lineHeight === 0) return fontSize;
  return Math.round(height / lineHeight);
}
function cutTextByWidth(text, fontSize, maxWidth) {
  let result = [];
  let tempText = '';
  for (let i = 0; i < text.length; i++) {
    tempText += text[i];
    const width = getWidthOfText(tempText, fontSize);
    if (width > maxWidth) {
      result.push(tempText.slice(0, -1));
      tempText = tempText.slice(-1);
    }
  }
  result.push(tempText);
  return result;
}

export default class Label {
  constructor(options = {}) {
    this.options = Object.assign(
      {
        width: 80,
        height: 100,
      },
      options,
    );
    // this.isDebug = true;
  }
  async loadScript(src) {
    return new Promise(resolve => {
      loadScript(src, {}, resolve);
    });
  }
  async init() {
    const { width, height, printType } = this.options;
    this.setLayout();
    this.unitSize = Math.min(width, height) / 30;
    await this.loadScript('/staticfiles/pdf/pdfkit.standalone.min.js');
    await this.loadScript('/staticfiles/pdf/blob-stream.js');
    this.PDFDocument = window.PDFDocument;
    this.doc = new this.PDFDocument({
      size: [mmToPt(width), mmToPt(height)], // width, height
      font: null,
      info: {
        Title: printType === PRINT_TYPE.QR ? _l('打印二维码') : _l('打印条形码'),
        Author: _l('HAP'),
      },
    });
    this.stream = this.doc.pipe(blobStream());
    await this.loadFont();
  }
  setLayout() {
    const { labelSize, width, height } = this.options;
    if (labelSize === QR_LABEL_SIZE.CUSTOM) {
      this.options.layout = width > height ? QR_LAYOUT.LANDSCAPE : QR_LAYOUT.PORTRAIT;
    }
    const { layout } = this.options;
    this.size = (layout === QR_LAYOUT.PORTRAIT ? PORTRAIT_QR_CODE_SIZE : LANDSCAPE_QR_CODE_SIZE).shorts[
      Number(this.options.codeSize)
    ];
    this.paddingX = 3;
    this.paddingY = 2;
    this.fontSize = 5 * (this.options.fontSize || 1);
    if (layout === QR_LAYOUT.PORTRAIT) {
      this.codeSize = {
        s: 11,
        m: 16,
        l: 20,
        h: 24,
      }[this.size];
    } else {
      this.codeSize = {
        s: 13,
        m: 16,
        l: 20,
        h: 24,
      }[this.size];
    }
    this.topTextNum = {
      s: 2,
      m: 1,
      l: 0,
      h: 0,
    }[this.size];
    this.barHeight =
      (width > height
        ? {
            l: 18,
            m: 14,

            s: 9,
          }
        : {
            l: 19,
            m: 14,
            s: 9,
          })[['l', 'm', 's'][Number(this.options.codeSize) - 1]] * 0.9;
  }
  async loadFont() {
    const { onProgress = () => {} } = this.options;
    const { doc } = this;
    async function load(fontKey, fontName, fontUrl) {
      const savedFont = await localForage.getItem(fontKey);
      if (savedFont) {
        doc.registerFont(fontName, savedFont);
      } else {
        onProgress(_l('正在加载字体，同一个浏览器只需要加载一次'));
        const font = await fetch(fontUrl);
        const fontArrayBuffer = await font.arrayBuffer();
        localForage.setItem(fontKey, fontArrayBuffer);
        doc.registerFont(fontName, fontArrayBuffer);
      }
    }
    await load('regular_font', 'alibaba', '/staticfiles/fonts/regular.ttf');
    await load('bold_font', 'alibabaBold', '/staticfiles/fonts/bold.ttf');
    onProgress(undefined);
  }
  drawLine(top, width, color = 'red') {
    if (!this.isDebug) return;
    this.doc.strokeColor(color).lineWidth(0.1).moveTo(0, top).lineTo(width, top).stroke();
  }
  drawRect(left, top, width, height, color = 'green', lineWidth = 0.1) {
    if (!this.isDebug) return;
    this.doc.strokeColor(color).lineWidth(lineWidth).rect(left, top, width, height).stroke();
  }
  async render() {
    const { printType, printData } = this.options;
    await this.init();
    let isFirstPage = true;
    const printDataForPrint = [...printData];
    while (printDataForPrint.length) {
      const labelData = printDataForPrint.shift();
      if (!isFirstPage) {
        this.doc.addPage();
      }
      if (printType === PRINT_TYPE.QR) {
        this.renderQrLabel(labelData);
      } else if (printType === PRINT_TYPE.BAR) {
        this.renderBarLabel(labelData);
      }
      isFirstPage = false;
    }
  }
  renderQrLabel(labelData) {
    if (!labelData) return;
    const { width, position, layout, firstIsBold } = this.options;
    if (layout === QR_LAYOUT.PORTRAIT) {
      this.renderTexts(
        labelData.texts.map((item, i) => ({
          value: item.text,
          align: firstIsBold && i === 0 ? 'center' : 'left',
          isBold: firstIsBold && i === 0,
          ...item,
        })),
        {
          fontSize: mmToPt(this.fontSize * this.unitSize * 0.59),
          width: Math.ceil(mmToPt(width - this.paddingX * 2 * this.unitSize)),
          left: mmToPt(this.paddingX * this.unitSize),
          top: mmToPt(
            position === QR_POSITION.TOP
              ? (this.paddingY + this.codeSize + 2) * this.unitSize
              : this.paddingY * this.unitSize,
          ),
        },
      );
    } else {
      // maxLineNumber
      this.renderTexts(
        labelData.texts.slice(0, this.topTextNum).map((item, i) => ({
          value: item.text,
          isBold: firstIsBold && i === 0,
          ...item,
        })),
        {
          left: mmToPt(this.paddingX * this.unitSize),
          top: mmToPt(this.paddingY * this.unitSize),
          width: mmToPt(width - this.paddingX * 2 * this.unitSize),
          fontSize: mmToPt(this.fontSize * this.unitSize * 0.59),
        },
      );
      this.renderTexts(
        labelData.texts.slice(this.topTextNum).map((item, i) => ({
          value: item.text,
          isBold: firstIsBold && i === 0 && this.topTextNum === 0,
          ...item,
        })),
        {
          left: mmToPt(
            position === QR_POSITION.LEFT
              ? (this.paddingX + this.codeSize + 2) * this.unitSize
              : this.paddingX * this.unitSize,
          ),
          top: mmToPt((this.paddingY + 5 * this.topTextNum) * this.unitSize),
          width: mmToPt(width - this.paddingX * 2 * this.unitSize - (this.codeSize + 2) * this.unitSize),
          fontSize: mmToPt(this.fontSize * this.unitSize * 0.59),
        },
      );
    }
    this.renderQrCode(labelData.value);
  }
  renderBarCode(barValue) {
    if (!barValue) return;
    const { width, height, showBarValue, position } = this.options;
    let barFontSize = 1.8 * this.unitSize;
    let barTextHeight = 1.5 * barFontSize;
    let barHeight = this.barHeight * this.unitSize;
    function parseToCode128(value) {
      const parsed = JsBarcode({}, value, {
        format: 'CODE128',
      });
      return _.get(parsed, '_encodings.0.0');
    }
    if (barValue && barValue.trim()) {
      const code128 = parseToCode128(barValue);
      const barWidth = width - this.paddingX * this.unitSize * 2;
      let realBarWidth = barWidth;
      let leftOffset = 0;
      let barColumnWidth = barWidth / code128.data.length;
      if (barColumnWidth > 0.5 * this.unitSize) {
        barColumnWidth = 0.5 * this.unitSize;
        realBarWidth = barColumnWidth * code128.data.length;
        leftOffset = (barWidth - realBarWidth) / 2;
      }
      code128.data.split('').forEach((char, i) => {
        const fillColor = char === '1' ? '#151515' : '#ffffff';
        this.doc
          .fillColor(fillColor)
          .rect(
            mmToPt(this.paddingX * this.unitSize + leftOffset + barColumnWidth * i),
            mmToPt(
              position === BAR_POSITION.TOP
                ? this.paddingY * this.unitSize
                : height - this.paddingY * this.unitSize - barHeight,
            ),
            mmToPt(barColumnWidth),
            mmToPt(barHeight),
          )
          .fill();
      });
      if (showBarValue) {
        const barTop =
          position === BAR_POSITION.TOP
            ? this.paddingY * this.unitSize + barHeight
            : height - this.paddingY * this.unitSize - barHeight - barTextHeight;
        this.doc
          .fillColor('#fff')
          .rect(mmToPt(this.paddingX * this.unitSize), mmToPt(barTop), mmToPt(barWidth), mmToPt(barTextHeight))
          .fill();
        this.doc
          .font('alibaba')
          .fontSize(mmToPt(barFontSize))
          .fillColor('#151515')
          .text(barValue, mmToPt(this.paddingX * this.unitSize), mmToPt(barTop), {
            width: mmToPt(barWidth),
            height: mmToPt(barTextHeight),
            align: 'center',
            lineBreak: true,
          });
      }
    }
  }
  renderBarLabel(labelData) {
    if (!labelData) return;
    const { position, width, showBarValue, firstIsBold } = this.options;
    // maxLineNumber
    let barFontSize = 1.8 * this.unitSize * 1.5;
    const textTop =
      position === BAR_POSITION.TOP
        ? this.paddingY * this.unitSize + this.barHeight * this.unitSize + (showBarValue ? barFontSize : 0)
        : this.paddingY * this.unitSize;
    this.drawLine(mmToPt(this.paddingY * this.unitSize), mmToPt(width));
    this.drawLine(mmToPt(this.paddingY * this.unitSize + this.barHeight * this.unitSize), mmToPt(width));
    this.renderTexts(
      labelData.texts.map((item, i) => ({
        value: item.text,
        align: firstIsBold && i === 0 ? 'center' : 'left',
        isBold: firstIsBold && i === 0,
        ...item,
      })),
      {
        left: mmToPt(this.paddingX * this.unitSize),
        top: mmToPt(textTop),
        width: mmToPt(width - this.paddingX * 2 * this.unitSize),
        fontSize: mmToPt(this.fontSize * this.unitSize * 0.59),
      },
    );
    this.renderBarCode(labelData.value);
  }
  getCompressedFontSize(value, width) {
    let count = 0;
    value.split('').forEach(char => {
      count += /[\x00-\x7F]/.test(char) ? 1.2 : 2;
    });
    return (width / count) * 2;
  }
  renderTexts(texts = [], { left = 0, top = 0, fontSize = 10, color = '#151515', width = 100 } = {}) {
    const _this = this;
    this.drawLine(top, width);
    if (!texts.length) return;
    texts = texts.map(text => ({
      ...text,
      value: _.replace(text.value, /\n/g, ''),
    }));
    const { doc, getCompressedFontSize } = this;
    doc.fillColor(color);
    let textTop = top;
    function render(textsForRender) {
      textsForRender.forEach(text => {
        const { value, align = 'left', forceInLine, isBold } = text;
        let textFontSize = fontSize;
        const linesNum = !forceInLine
          ? getLineNumOfText(value, {
              fontSize: textFontSize,
              width,
            }) || 1
          : 1;
        if (forceInLine) {
          const newFontSize = getCompressedFontSize(value, width);
          if (newFontSize < textFontSize) {
            textFontSize = newFontSize;
          }
        }
        const normalTextHeight = mmToPt((_this.fontSize * _this.unitSize) / (get(_this, 'options.fontSize') || 1));
        const textHeight = textFontSize * 1.5 * linesNum;
        _this.drawRect(left, textTop, width, normalTextHeight);
        doc
          .font(isBold ? 'alibabaBold' : 'alibaba')
          .fontSize(textFontSize)
          .text(value, left, textTop + (normalTextHeight > textHeight ? (normalTextHeight - textHeight) / 2 : 0), {
            lineBreak: true,
            width,
            height: textHeight,
            align,
          });
        textTop += normalTextHeight;
      });
    }
    texts.forEach(text => {
      const cutTexts = text.forceInLine
        ? [text]
        : cutTextByWidth(text.value, fontSize, width).map(t => ({
            ...text,
            value: t,
          }));
      render(
        cutTexts.map(item => ({
          ...item,
          ...(cutTexts.length > 1 ? { align: 'left' } : {}),
        })),
      );
    });
  }
  getQrCodePosition() {
    const { layout, position, width, height } = this.options;
    let left, top;
    if (layout === QR_LAYOUT.PORTRAIT) {
      left = (width - this.codeSize * this.unitSize) / 2;
      top =
        position === QR_POSITION.TOP
          ? this.paddingY * this.unitSize
          : height - (this.paddingY + this.codeSize) * this.unitSize;
    } else {
      left =
        position === QR_POSITION.LEFT
          ? this.paddingX * this.unitSize
          : width - (this.paddingX + this.codeSize) * this.unitSize;
      top =
        this.size === 'l'
          ? (height - this.codeSize * this.unitSize) / 2
          : (this.paddingY + 5 * this.topTextNum + 2) * this.unitSize;
    }
    return {
      left,
      top,
      width: this.codeSize * this.unitSize,
      height: this.codeSize * this.unitSize,
    };
  }
  renderQrCode(qrValue) {
    if (!qrValue) return;
    const { codeFaultTolerance, layout } = this.options;
    const { left, top, width, height } = this.getQrCodePosition();
    // this.doc
    //   .fillColor('#FFFFFF')
    //   .rect(
    //     mmToPt(left - this.paddingX * this.unitSize),
    //     mmToPt(top - this.paddingY * this.unitSize),
    //     layout === QR_LAYOUT.LANDSCAPE
    //       ? mmToPt(width + this.paddingX * this.unitSize)
    //       : mmToPt(width + this.paddingX * 2 * this.unitSize),
    //     mmToPt(height + this.paddingY * 2 * this.unitSize),
    //   )
    //   .fill();
    renderQr({
      value: qrValue,
      width: mmToPt(width),
      height: mmToPt(height),
      correctLevel: codeFaultTolerance || 1,
      renderCell: ({ x, y, w, h, isDark, color }) => {
        this.doc.rect(mmToPt(left) + x, mmToPt(top) + y, w, h);
        if (isDark) {
          this.doc.fill('#151515');
        } else {
          this.doc.fill('#fff');
        }
      },
    });
  }
  getBlobUrl() {
    const stream = this.stream;
    return new Promise((resolve, reject) => {
      this.doc.end();
      stream.on('finish', function () {
        resolve(stream.toBlobURL('application/pdf'));
      });
    });
  }
}

export async function generateLabelPdf(config = {}) {
  const {} = config;
  let width, height;
  if (config.labelSize === QR_LABEL_SIZE.CUSTOM) {
    width = config.labelCustomWidth;
    height = config.labelCustomHeight;
  } else {
    const configWidth = QR_LABEL_SIZES[config.labelSize].width;
    const configHeight = QR_LABEL_SIZES[config.labelSize].height;
    width = config.layout === QR_LAYOUT.LANDSCAPE ? configWidth : configHeight;
    height = config.layout === QR_LAYOUT.LANDSCAPE ? configHeight : configWidth;
  }
  const label = new Label({
    ...config,
    width,
    height,
  });
  await label.render();
  const blobUrl = await label.getBlobUrl();
  return blobUrl;
}
