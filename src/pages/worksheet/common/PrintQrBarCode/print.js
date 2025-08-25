import _ from 'lodash';
import PDFObject from 'pdfobject';
import {
  BAR_LABEL_SIZE,
  BAR_LABEL_SIZES,
  BAR_LAYOUT,
  PRINT_TYPE,
  QR_LABEL_SIZE,
  QR_LABEL_SIZES,
  QR_LAYOUT,
} from './enum';
import genQrDataurl, { QRErrorCorrectLevel } from './genQrDataurl';
import { A4_OPTS, A4_SIZE } from './printConfig';
import { createBarLabeObjectFromConfig, createQrLabeObjectFromConfig } from './util';

function cutString(text, maxWidth, fontSize, maxLine = 3) {
  text = text.slice(0, 300);
  let result;
  let width = 0;
  const lines = [];
  let i, j;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'hanging';
  ctx.font = fontSize + 'px PingFang SC';

  while (text.length) {
    for (i = text.length; ctx.measureText(text.substr(0, i)).width > maxWidth; i--);

    result = text.substr(0, i);

    if (i !== text.length) {
      for (j = 0; result.indexOf(' ', j) !== -1; j = result.indexOf(' ', j) + 1);
    }

    lines.push(result.substr(0, j || result.length));
    width = Math.max(width, ctx.measureText(lines[lines.length - 1]).width);
    text = text.substr(lines[lines.length - 1].length, text.length);
    if (text.length && lines.length + 1 > maxLine) {
      lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1) + '...';
      break;
    }
  }
  return lines;
}

function genTextCanvas({
  text,
  fontSize = 12,
  color = '#151515',
  width = 100,
  isCenter = false,
  lineHeight = 1.2,
  pixelScale = 1,
  firstIsBigger = false,
  bolder = false,
  lineOverEllipsis = false,
}) {
  let texts;
  if (!_.isArray(text)) {
    texts = [text];
  } else {
    texts = text;
  }
  if (!texts[0]) {
    firstIsBigger = false;
  }
  if (pixelScale && pixelScale > 1) {
    width = width * pixelScale;
    fontSize = fontSize * pixelScale;
  }
  texts = texts.filter(t => t);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = fontSize * lineHeight * texts.length;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'hanging';
  if (isCenter) {
    ctx.textAlign = 'center';
  }
  ctx.fillStyle = color;
  ctx.font = `${bolder ? 'bold ' : ''}${fontSize}px PingFang SC`;
  texts.forEach((t, i) => {
    if (lineOverEllipsis && ctx.measureText(t).width > width) {
      t = cutString(t, width, fontSize, 1)[0];
    }
    if (firstIsBigger && i === 0) {
      ctx.fillStyle = '#151515';
      ctx.font = `bold ${fontSize + 1}px PingFang SC`;
      ctx.fillText(t, isCenter ? width / 2 : 0, fontSize * lineHeight * i + 2);
      ctx.fillStyle = color;
      ctx.font = fontSize + 'px PingFang SC';
    } else {
      ctx.fillText(t, isCenter ? width / 2 : 0, fontSize * lineHeight * i + 2);
    }
  });
  if (_.isEmpty(texts)) {
    // canvas 为空时 添加到 pdf 会报错
    canvas.height = 1;
  }
  return canvas;
}
function getQrDataurl(
  url,
  options = {
    correctLevel: QRErrorCorrectLevel.H,
  },
) {
  return genQrDataurl({
    width: 100,
    height: 100,
    value: url,
    ...options,
  });
}

export class QrPdf {
  constructor({ worksheetName, printType, layout, printData, correctLevel, config } = {}) {
    this.worksheetName = worksheetName;
    this.worksheetName = worksheetName;
    this.correctLevel = correctLevel;
    this.printType = printType;
    this.printData = printData;
    this.layout = layout;
    this.config = config;
  }
  async render() {
    return new Promise(async resolve => {
      import('jspdf').then(jsPDF => {
        this.jsPDF = jsPDF.default;
        if (this.printType === PRINT_TYPE.A4) {
          resolve(this.renderA4());
        } else if (this.printType === PRINT_TYPE.QR) {
          resolve(this.renderQr());
        } else if (this.printType === PRINT_TYPE.BAR) {
          resolve(this.renderBar());
        }
      });
    });
  }
  async renderQr() {
    const config = this.config;
    let width, height;
    if (config.labelSize === QR_LABEL_SIZE.CUSTOM) {
      width = config.labelCustomWidth;
      height = config.labelCustomHeight;
    } else {
      width = QR_LABEL_SIZES[config.labelSize].width;
      height = QR_LABEL_SIZES[config.labelSize].height;
    }
    this.doc = new this.jsPDF(this.config.layout === QR_LAYOUT.PORTRAIT ? 'p' : 'l', 'mm', [width, height], true);
    this.doc.setProperties({
      title: '打印二维码',
    });
    let isFirst = true;
    while (this.printData.length) {
      const qrData = this.printData.shift();
      if (!isFirst) {
        this.doc.addPage();
      }
      const labelObject = createQrLabeObjectFromConfig(this.config, qrData.value, qrData.texts, { pixelRadio: 1.5 });
      await labelObject.render();
      this.doc.addImage(
        labelObject.canvas.toDataURL(),
        'PNG',
        0,
        0,
        this.doc.internal.pageSize.getWidth(),
        this.doc.internal.pageSize.getHeight(),
        '',
        'FAST',
      );
      isFirst = false;
    }
  }
  async renderBar() {
    const config = this.config;
    let width, height;
    if (config.labelSize === BAR_LABEL_SIZE.CUSTOM) {
      width = config.labelCustomWidth;
      height = config.labelCustomHeight;
    } else {
      width = BAR_LABEL_SIZES[config.labelSize].width;
      height = BAR_LABEL_SIZES[config.labelSize].height;
    }
    this.doc = new this.jsPDF(this.config.layout === BAR_LAYOUT.PORTRAIT ? 'p' : 'l', 'mm', [width, height], true);
    this.doc.setProperties({
      title: '打印条形码',
    });
    let isFirst = true;
    while (this.printData.length) {
      const barData = this.printData.shift();
      if (!isFirst) {
        this.doc.addPage();
      }
      const labelObject = createBarLabeObjectFromConfig(this.config, barData.value, barData.texts, { pixelRadio: 1.5 });
      await labelObject.render();
      this.doc.addImage(
        labelObject.canvas.toDataURL(),
        'PNG',
        0,
        0,
        this.doc.internal.pageSize.getWidth(),
        this.doc.internal.pageSize.getHeight(),
        '',
        'FAST',
      );
      isFirst = false;
    }
  }
  async renderA4() {
    const options = A4_OPTS;
    this.size = A4_SIZE;
    this.option = options[this.layout];
    this.doc = new this.jsPDF('p', 'mm', 'a4', true);
    this.doc.setProperties({
      title: '打印二维码',
    });
    const { col, row } = this.option;
    const qrPages = _.chunk(this.printData, col && row ? col * row : 1);
    for (let pageIndex = 0; pageIndex < qrPages.length; pageIndex++) {
      if (pageIndex) {
        this.doc.addPage();
      }
      if (this.layout === 1) {
        this.render1x1(qrPages[pageIndex]);
      } else {
        this.renderPage(qrPages[pageIndex]);
      }
    }
  }
  renderPage(printData) {
    let textCanvas;
    const { col, row, secFontSize, textLeft, width, topLines } = this.option;
    let { textWidth } = this.option;
    const pixelScale = 2;
    const is2x2 = this.layout === 3;
    textWidth = textWidth || width;
    for (let rowIndex = 0; rowIndex < row; rowIndex++) {
      for (let colIndex = 0; colIndex < col; colIndex++) {
        const qrindex = rowIndex * col + colIndex;
        if (!printData[qrindex]) {
          return;
        }
        const texts = printData[qrindex].texts.map(t => t.text);
        const qrdataurl = getQrDataurl(printData[qrindex].value, {
          correctLevel: this.correctLevel || QRErrorCorrectLevel.H,
        });
        const titleTextCanvas = genTextCanvas({
          text: texts[0] ? cutString(texts[0], (textWidth || width) - 5, secFontSize, topLines) : _l('未命名'),
          fontSize: secFontSize,
          color: '#151515',
          width: textWidth,
          lineHeight: 1.5,
          pixelScale,
          bolder: true,
        });
        if (texts.length > 1) {
          textCanvas = genTextCanvas({
            text: texts.slice(1),
            fontSize: secFontSize,
            color: '#151515',
            width: textWidth,
            lineHeight: 1.5,
            pixelScale,
            lineOverEllipsis: true,
          });
        }
        const colgap = is2x2
          ? (A4_SIZE.px.width - col * width) / (col + 1)
          : (A4_SIZE.px.width - col * (width + textLeft + textWidth)) / (col + 1);
        const rowgap = is2x2
          ? (A4_SIZE.px.height - row * (width + textLeft + textWidth)) / (row + 1)
          : (A4_SIZE.px.height - row * width) / (row + 1);
        const qrLeft = is2x2
          ? colgap + (colgap + width) * colIndex
          : colgap + (colgap + width + textLeft + textWidth) * colIndex;
        const qrTop = is2x2
          ? rowgap + (rowgap + width + textLeft + textWidth) * rowIndex
          : rowgap + (rowgap + width) * rowIndex;
        this.doc.addImage(
          qrdataurl,
          'JPEG',
          (qrLeft / A4_SIZE.px.width) * A4_SIZE.mm.width,
          (qrTop / A4_SIZE.px.width) * A4_SIZE.mm.width,
          (width / A4_SIZE.px.width) * A4_SIZE.mm.width,
          (width / A4_SIZE.px.width) * A4_SIZE.mm.width,
          '',
          'FAST',
        );
        this.doc.addImage(
          titleTextCanvas.toDataURL(),
          'JPEG',
          ((is2x2
            ? qrLeft + width / 2 - (titleTextCanvas.height - (textCanvas ? textCanvas.height : 0)) / pixelScale / 2
            : qrLeft + width + textLeft) /
            A4_SIZE.px.width) *
            A4_SIZE.mm.width,
          ((is2x2
            ? qrTop + width + textLeft - titleTextCanvas.height / pixelScale
            : qrTop + width / 2 - (titleTextCanvas.height + (textCanvas ? textCanvas.height : 0)) / pixelScale / 2) /
            A4_SIZE.px.width) *
            A4_SIZE.mm.width,
          (titleTextCanvas.width / pixelScale / A4_SIZE.px.width) * A4_SIZE.mm.width,
          (titleTextCanvas.height / pixelScale / A4_SIZE.px.width) * A4_SIZE.mm.width,
          '',
          'FAST',
          is2x2 ? 270 : 0,
        );
        if (textCanvas) {
          this.doc.addImage(
            textCanvas.toDataURL(),
            'JPEG',
            ((is2x2
              ? qrLeft +
                width / 2 -
                (titleTextCanvas.height - (textCanvas ? textCanvas.height : 0)) / pixelScale / 2 -
                textCanvas.height / pixelScale
              : qrLeft + width + textLeft) /
              A4_SIZE.px.width) *
              A4_SIZE.mm.width,
            ((is2x2
              ? qrTop + width + textLeft - textCanvas.height / pixelScale
              : qrTop +
                width / 2 -
                (titleTextCanvas.height + (textCanvas ? textCanvas.height : 0)) / pixelScale / 2 +
                titleTextCanvas.height / pixelScale) /
              A4_SIZE.px.width) *
              A4_SIZE.mm.width,
            (textCanvas.width / pixelScale / A4_SIZE.px.width) * A4_SIZE.mm.width,
            (textCanvas.height / pixelScale / A4_SIZE.px.width) * A4_SIZE.mm.width,
            '',
            'FAST',
            is2x2 ? 270 : 0,
          );
        }
      }
    }
  }
  render1x1(printData) {
    let textCanvas, textCanvasWidth, textCanvasHeight;
    const { secFontSize, textWidth, width } = this.option;
    const pixelScale = 2;
    const qrdataurl = getQrDataurl(printData[0].value, { correctLevel: this.correctLevel || QRErrorCorrectLevel.H });
    const texts = printData[0].texts.map(t => t.text);
    const titleTextCanvas = genTextCanvas({
      text: texts[0] ? cutString(texts[0], textWidth || width, secFontSize) : _l('未命名'),
      fontSize: secFontSize,
      color: '#151515',
      width: textWidth || width,
      isCenter: true,
      lineHeight: 1.5,
      pixelScale,
      bolder: true,
    });
    const titleTextCanvasWidth = titleTextCanvas.width / pixelScale;
    const titleTextCanvasHeight = titleTextCanvas.height / pixelScale;
    if (texts.length > 1) {
      textCanvas = genTextCanvas({
        text: texts.slice(1),
        fontSize: secFontSize,
        color: '#151515',
        width: textWidth || width,
        isCenter: true,
        lineHeight: 1.5,
        pixelScale,
        lineOverEllipsis: true,
      });
      textCanvasWidth = textCanvas.width / pixelScale;
      textCanvasHeight = textCanvas.height / pixelScale;
    }
    this.doc.addImage(
      qrdataurl,
      'JPEG',
      ((A4_SIZE.px.width - width) / 2 / A4_SIZE.px.width) * A4_SIZE.mm.width,
      ((A4_SIZE.px.height - width - 220) / 2 / A4_SIZE.px.height) * A4_SIZE.mm.height,
      (width / A4_SIZE.px.width) * A4_SIZE.mm.width,
      (width / A4_SIZE.px.width) * A4_SIZE.mm.width,
      '',
      'FAST',
    );
    this.doc.addImage(
      titleTextCanvas.toDataURL(),
      'JPEG',
      ((A4_SIZE.px.width - width) / 2 / A4_SIZE.px.width) * A4_SIZE.mm.width,
      (((A4_SIZE.px.height - width - 220) / 2 + 43 + width) / A4_SIZE.px.height) * A4_SIZE.mm.height,
      (titleTextCanvasWidth / A4_SIZE.px.width) * A4_SIZE.mm.width,
      (titleTextCanvasHeight / A4_SIZE.px.width) * A4_SIZE.mm.width,
      '',
      'FAST',
    );
    if (textCanvas) {
      this.doc.addImage(
        textCanvas.toDataURL(),
        'JPEG',
        ((A4_SIZE.px.width - width) / 2 / A4_SIZE.px.width) * A4_SIZE.mm.width,
        (((A4_SIZE.px.height - width - 220) / 2 + 43 + width + titleTextCanvasHeight) / A4_SIZE.px.height) *
          A4_SIZE.mm.height,
        (textCanvasWidth / A4_SIZE.px.width) * A4_SIZE.mm.width,
        (textCanvasHeight / A4_SIZE.px.width) * A4_SIZE.mm.width,
        '',
        'FAST',
      );
    }
  }
  openDialog() {
    this.$dialog = document.createElement('div');
    this.$dialog.innerHTML = `
      <div class="previewHeader">
          ${this.worksheetName ? `<div class="worksheetName">${this.worksheetName}</div>` : ''}
        <i class="icon icon-delete closeDialog"></i>
      </div>
      <div class="previewBody flex">
      </div>
    `;
    this.$dialog.classList.add('worksheetRowsQrPreview');
    this.$dialog.querySelector('.closeDialog').addEventListener('click', this.closeDialog);
    document.body.appendChild(this.$dialog);
    setTimeout(() => {
      this.$dialog.classList.add('visible');
    }, 100);
    PDFObject.embed(this.doc.output('bloburl'), this.$dialog.querySelector('.previewBody'));
  }

  closeDialog = () => {
    this.$dialog.classList.remove('visible');
    setTimeout(() => {
      this.$dialog.remove();
    }, 400);
  };
}

export default async function (
  { worksheetName, printType, layout, printData, correctLevel, config } = {},
  cb = () => {},
) {
  console.time('render qr');
  const pdf = new QrPdf({ worksheetName, printType, layout, printData, correctLevel, config });
  if (pdf.isPdfKit) {
    this.doc.end();
    this.stream.on('finish', function () {
      console.log('finish');
      const url = this.stream.toBlobURL('application/pdf');
      // document.querySelector('iframe').src = url;
      window.open(url);
    });
  } else {
    await pdf.render();
  }
  console.timeEnd('render qr');
  pdf.openDialog();
  cb();
}
