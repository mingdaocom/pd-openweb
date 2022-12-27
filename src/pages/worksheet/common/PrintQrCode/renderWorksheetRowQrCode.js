import PDFObject from 'pdfobject';
import { autobind } from 'core-decorators';
import genQrDataurl, { QRErrorCorrectLevel } from './genQrDataurl';
import { A4_OPTS, QRPRINT_OPTS, A4_SIZE, QRPRINT_SIZES } from './printConfig';
import jsPDF from 'jspdf';
import _ from 'lodash';

function cutText(text, fontSize, width) {
  fontSize = fontSize || 12;
  width = width || 100;
  const $text = document.createElement('span');
  $text.style.fontSize = fontSize + 'px';
  $text.innerText = text;
  document.body.appendChild($text);
  const textwidth = $text.offsetWidth;
  $text.remove();
  if (textwidth <= width) {
    return text;
  } else {
    return text.slice(0, Math.floor(width / fontSize));
  }
}

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
  color = '#333',
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
      ctx.fillStyle = '#333';
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
class QrPdf {
  constructor(printType, layoutType, qrs, extra) {
    this.printType = printType;
    this.layoutType = layoutType;
    this.qrs = qrs;
    this.extra = extra;
    this.init();
  }
  init() {
    const layoutType = this.layoutType;
    const options = this.printType === 1 ? A4_OPTS : QRPRINT_OPTS;
    this.size = this.printType === 1 ? A4_SIZE : QRPRINT_SIZES[layoutType];
    this.option = options[layoutType];
    if (this.printType === 1) {
      this.doc = new jsPDF('p', 'mm', 'a4', true);
    } else {
      this.doc = new jsPDF(
        layoutType === 0 || layoutType === 1 ? 'p' : 'l',
        'mm',
        [this.size.mm.width, this.size.mm.height],
        true,
      );
    }
    this.doc.setProperties({
      title: '打印二维码',
    });
  }
  render() {
    const { col, row } = this.option;
    const qrPages = _.chunk(this.qrs, col && row ? col * row : 1);
    for (let pageIndex = 0; pageIndex < qrPages.length; pageIndex++) {
      if (pageIndex) {
        this.doc.addPage();
      }
      if (this.printType === 2) {
        if (this.layoutType === 0 || this.layoutType === 1) {
          this.renderQrPrint30x20(qrPages[pageIndex][0]);
        } else {
          this.renderQrPrint(qrPages[pageIndex][0]);
        }
      } else {
        this.renderA4(qrPages, pageIndex);
      }
    }
  }
  renderA4(qrPages, pageIndex) {
    if (this.layoutType === 1) {
      this.render1x1(qrPages[pageIndex]);
    } else {
      this.renderPage(qrPages[pageIndex]);
    }
  }
  renderQrPrint30x20(data) {
    const { width, padding, fontSize } = this.option;
    const size = this.size;
    const qrdataurl = getQrDataurl(data.url, {
      correctLevel: QRErrorCorrectLevel.M,
    });
    const textPixelScale = 4;
    const titleTextCanvas = genTextCanvas({
      text: cutString(data.texts[0] || ' ', size.px.width - padding * 2, fontSize, 1),
      fontSize,
      color: '#333',
      width: size.px.width - padding * 2,
      lineHeight: 1,
      isCenter: true,
      pixelScale: textPixelScale,
      bolder: true,
    });
    const textCanvas = genTextCanvas({
      text: cutString(data.texts[1] || ' ', size.px.width - padding * 2 + 6, fontSize, 1),
      fontSize,
      color: '#333',
      width: size.px.width - padding * 2,
      lineHeight: 1,
      isCenter: true,
      pixelScale: textPixelScale,
    });
    this.doc.addImage(
      qrdataurl,
      'JPEG',
      (padding / size.px.width) * size.mm.width,
      (padding / size.px.width) * size.mm.width,
      (width / size.px.width) * size.mm.width,
      (width / size.px.width) * size.mm.width,
      '',
      'FAST',
    );
    this.doc.addImage(
      titleTextCanvas.toDataURL(),
      'JPEG',
      (padding / size.px.width) * size.mm.width,
      ((padding + width + (this.layoutType === 0 ? 12 : 10)) / size.px.width) * size.mm.width,
      (titleTextCanvas.width / textPixelScale / size.px.width) * size.mm.width,
      (titleTextCanvas.height / textPixelScale / size.px.width) * size.mm.width,
      '',
      'FAST',
    );
    this.doc.addImage(
      textCanvas.toDataURL(),
      'JPEG',
      (padding / size.px.width) * size.mm.width,
      ((padding + width + (this.layoutType === 0 ? 12 : 10) + titleTextCanvas.height / textPixelScale + 6) /
        size.px.width) *
        size.mm.width,
      (textCanvas.width / textPixelScale / size.px.width) * size.mm.width,
      (textCanvas.height / textPixelScale / size.px.width) * size.mm.width,
      '',
      'FAST',
    );
  }
  renderQrPrint(data) {
    let rightTextCanvas;
    const { width, padding, textWidth, textLeft, fontSize, secFontSize, topLines } = this.option;
    const size = this.size;
    const qrdataurl = getQrDataurl(data.url, {
      correctLevel: this.layoutType > 2 ? QRErrorCorrectLevel.H : QRErrorCorrectLevel.M,
    });
    const textPixelScale = 4;
    const topTextCanvas = genTextCanvas({
      text: data.texts[0] ? cutString(data.texts[0], size.px.width - padding * 2 - 5, fontSize, topLines) : ' ',
      fontSize,
      width: size.px.width - padding * 2,
      pixelScale: textPixelScale,
      bolder: true,
    });
    if (data.texts && data.texts.length > 1) {
      rightTextCanvas = genTextCanvas({
        text: data.texts.slice(1),
        fontSize: secFontSize,
        color: '#333',
        width: textWidth,
        lineHeight: 1.5,
        pixelScale: textPixelScale,
        lineOverEllipsis: true,
      });
    }
    this.doc.addImage(
      qrdataurl,
      'JPEG',
      (padding / size.px.width) * size.mm.width,
      ((size.px.height - padding - width) / size.px.width) * size.mm.width,
      (width / size.px.width) * size.mm.width,
      (width / size.px.width) * size.mm.width,
      '',
      'FAST',
    );
    if (topTextCanvas) {
      this.doc.addImage(
        topTextCanvas.toDataURL(),
        'JPEG',
        (padding / size.px.width) * size.mm.width,
        (padding / size.px.width) * size.mm.width,
        (topTextCanvas.width / textPixelScale / size.px.width) * size.mm.width,
        (topTextCanvas.height / textPixelScale / size.px.width) * size.mm.width,
        '',
        'FAST',
      );
    }
    if (rightTextCanvas) {
      this.doc.addImage(
        rightTextCanvas.toDataURL(),
        'JPEG',
        ((padding + width + textLeft) / size.px.width) * size.mm.width,
        ((size.px.height - padding - width + textLeft) / size.px.width) * size.mm.width,
        (rightTextCanvas.width / textPixelScale / size.px.width) * size.mm.width,
        (rightTextCanvas.height / textPixelScale / size.px.width) * size.mm.width,
        '',
        'FAST',
      );
    }
  }
  renderPage(qrs) {
    let textCanvas;
    const { col, row, secFontSize, textLeft, width, topLines } = this.option;
    let { textWidth } = this.option;
    const pixelScale = 2;
    const is2x2 = this.layoutType === 3;
    textWidth = textWidth || width;
    for (let rowIndex = 0; rowIndex < row; rowIndex++) {
      for (let colIndex = 0; colIndex < col; colIndex++) {
        const qrindex = rowIndex * col + colIndex;
        if (!qrs[qrindex]) {
          return;
        }
        const qrdataurl = getQrDataurl(qrs[qrindex].url, { correctLevel: QRErrorCorrectLevel.H });
        const titleTextCanvas = genTextCanvas({
          text: qrs[qrindex].texts[0]
            ? cutString(qrs[qrindex].texts[0], (textWidth || width) - 5, secFontSize, topLines)
            : _l('未命名'),
          fontSize: secFontSize,
          color: '#333',
          width: textWidth,
          lineHeight: 1.5,
          pixelScale,
          bolder: true,
        });
        if (qrs[0].texts.length > 1) {
          textCanvas = genTextCanvas({
            text: qrs[qrindex].texts.slice(1),
            fontSize: secFontSize,
            color: '#333',
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
  render1x1(qrs) {
    let textCanvas, textCanvasWidth, textCanvasHeight;
    const { secFontSize, textWidth, width } = this.option;
    const pixelScale = 2;
    const qrdataurl = getQrDataurl(qrs[0].url);
    const titleTextCanvas = genTextCanvas({
      text: qrs[0].texts[0] ? cutString(qrs[0].texts[0], textWidth || width, secFontSize) : _l('未命名'),
      fontSize: secFontSize,
      color: '#333',
      width: textWidth || width,
      isCenter: true,
      lineHeight: 1.5,
      pixelScale,
      bolder: true,
    });
    const titleTextCanvasWidth = titleTextCanvas.width / pixelScale;
    const titleTextCanvasHeight = titleTextCanvas.height / pixelScale;
    if (qrs[0].texts.length > 1) {
      textCanvas = genTextCanvas({
        text: qrs[0].texts.slice(1),
        fontSize: secFontSize,
        color: '#333',
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
          ${this.extra.worksheetName ? `<div class="worksheetName">${this.extra.worksheetName}</div>` : ''}
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
  @autobind
  closeDialog() {
    this.$dialog.classList.remove('visible');
    setTimeout(() => {
      this.$dialog.remove();
    }, 400);
  }
}

export default function (printType, layoutType, qrs, options = { cb: () => {} }) {
  const pdf = new QrPdf(printType, layoutType, qrs, options);
  pdf.render();
  pdf.openDialog();
  options.cb();
}
