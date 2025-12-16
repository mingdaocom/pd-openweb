import _ from 'lodash';
import { renderText as renderCellText } from 'src/utils/control';
import { BarLabel } from './bar';
import {
  BAR_LABEL_SIZE,
  BAR_LABEL_SIZES,
  BAR_LAYOUT,
  BAR_POSITION,
  LANDSCAPE_QR_CODE_SIZE,
  PORTRAIT_QR_CODE_SIZE,
  PRINT_TYPE,
  QR_LABEL_SIZE,
  QR_LABEL_SIZES,
  QR_LAYOUT,
  QR_POSITION,
  SOURCE_TYPE,
} from './enum';
import { QrLabel } from './qr';

export function getDefaultText({ printType, sourceType, sourceControlId, controls = [] } = {}) {
  if (sourceType === SOURCE_TYPE.URL) {
    return {
      type: 1,
      value: (_.find(controls, { attribute: 1 }) || {}).controlId,
      forceInLine: false,
      name: '',
    };
  } else if (sourceType === SOURCE_TYPE.CONTROL && sourceControlId && printType === PRINT_TYPE.BAR) {
    return {
      type: 2,
      value: (_.find(controls, { controlId: sourceControlId }) || {}).controlName,
      forceInLine: false,
      name: '',
    };
  } else if (sourceType === SOURCE_TYPE.CONTROL && sourceControlId) {
    return {
      type: 1,
      value: sourceControlId,
      forceInLine: false,
      name: '',
    };
  }
  return;
}

const DPI_MM = 8;

export function createQrLabeObjectFromConfig(config = {}, url, texts = [], options = {}) {
  let width, height;
  if (config.labelSize === QR_LABEL_SIZE.CUSTOM) {
    width = config.labelCustomWidth * DPI_MM;
    height = config.labelCustomHeight * DPI_MM;
  } else {
    const configWidth = QR_LABEL_SIZES[config.labelSize].width * DPI_MM;
    const configHeight = QR_LABEL_SIZES[config.labelSize].height * DPI_MM;
    width = config.layout === QR_LAYOUT.LANDSCAPE ? configWidth : configHeight;
    height = config.layout === QR_LAYOUT.LANDSCAPE ? configHeight : configWidth;
  }
  let layout;
  if (config.labelSize === QR_LABEL_SIZE.CUSTOM) {
    layout = width > height ? 'l' : 'p';
  } else {
    layout = config.layout === QR_LAYOUT.PORTRAIT ? 'p' : 'l';
  }
  const labelObject = new QrLabel({
    type: layout,
    size: (config.layout === QR_LAYOUT.PORTRAIT ? PORTRAIT_QR_CODE_SIZE : LANDSCAPE_QR_CODE_SIZE).shorts[
      Number(config.codeSize)
    ],
    fontSize: config.fontSize,
    width,
    height,
    firstIsTitle: config.firstIsBold,
    correctLevel: config.codeFaultTolerance || 1,
    qrPos: {
      [QR_POSITION.TOP]: 'top',
      [QR_POSITION.BOTTOM]: 'bottom',
      [QR_POSITION.LEFT]: 'left',
      [QR_POSITION.RIGHT]: 'right',
    }[config.position],
    url,
    texts: texts,
    ...options,
  });
  return labelObject;
}

function sliceByByteLength(str = '', length = 0) {
  let result = '';
  let size = 0;
  for (let i = 0; i < str.length; i++) {
    const charSize = new Blob([str[i]]).size;
    if (size + charSize <= length) {
      result += str[i];
      size += charSize;
    } else {
      break;
    }
  }
  return result;
}

export function getCodeTexts({ showTexts, firstIsBold, showControlName, controls } = {}, data = {}) {
  return (
    showTexts
      .map((item, i) => {
        if (!item) {
          return undefined;
        }
        const newItem = {
          forceInLine: item.forceInLine,
        };
        if (item.type === 2) {
          return { ...newItem, text: item.value };
        } else {
          const matchedControl = _.find(controls, { controlId: item.value });
          if (!matchedControl) {
            return { ...newItem, text: '' };
          }
          const controlText = renderCellText({ ...matchedControl, value: data[item.value] });
          return {
            ...newItem,
            text:
              showControlName && !(firstIsBold && i === 0)
                ? `${item.name || matchedControl.controlName}: ${controlText}`
                : controlText,
          };
        }
      })
      // .map(t => (t || (emptySetAsSample ? 'SAMPLE' : ''))
      .slice(0, 100)
  );
}
export function getCodeContent({ printType, sourceType, sourceControlId, row = {}, urls = {}, index, controls }) {
  let content = '';
  if (sourceType === SOURCE_TYPE.URL) {
    content = urls[row.rowid] || urls[index];
  } else if (sourceType === SOURCE_TYPE.CONTROL) {
    const matchedControl = _.find(controls, { controlId: sourceControlId });
    if (matchedControl && row[sourceControlId]) {
      content = renderCellText({ ...matchedControl, value: row[sourceControlId] });
    }
  }
  if (printType === PRINT_TYPE.BAR) {
    content = sliceByByteLength(content.replace(/[^\x00-\x7F]/g, ''), 30);
  } else {
    content = sliceByByteLength(content, 150 * 3);
  }
  return content;
}

export function createBarLabeObjectFromConfig(config = {}, value, texts = [], { isPreview = false } = {}) {
  let width, height;
  if (config.labelSize === BAR_LABEL_SIZE.CUSTOM) {
    width = config.labelCustomWidth * DPI_MM;
    height = config.labelCustomHeight * DPI_MM;
  } else {
    const configWidth = BAR_LABEL_SIZES[config.labelSize].width * DPI_MM;
    const configHeight = BAR_LABEL_SIZES[config.labelSize].height * DPI_MM;
    width = config.layout === BAR_LAYOUT.LANDSCAPE ? configWidth : configHeight;
    height = config.layout === BAR_LAYOUT.LANDSCAPE ? configHeight : configWidth;
  }
  const barLabel = new BarLabel({
    isPreview,
    value,
    width,
    height,
    firstIsTitle: config.firstIsBold,
    fontSize: config.fontSize,
    showBarValue: config.showBarValue,
    codePosition: {
      [BAR_POSITION.TOP]: 'top',
      [BAR_POSITION.BOTTOM]: 'bottom',
    }[config.position],
    size: ['l', 'm', 's'][Number(config.codeSize) - 1],
    texts,
  });
  return barLabel;
}

class TextMeasure {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // 隐藏但不添加到 DOM
    this.canvas.style.cssText = `
      position: absolute;
      visibility: hidden;
    `;
  }

  measureText(text, fontSize, fontFamily) {
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    return this.ctx.measureText(text).width;
  }

  findOptimalFontSize(text, containerWidth, options = {}) {
    const { minFontSize = 2, maxFontSize = 72, fontFamily = 'sans-serif', precision = 0.2 } = options;

    let low = minFontSize;
    let high = maxFontSize;
    let bestSize = minFontSize;

    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      const textWidth = this.measureText(text, mid, fontFamily);

      if (textWidth <= containerWidth) {
        bestSize = mid;
        low = mid;
      } else {
        high = mid;
      }

      if (high - low < precision) break;
    }

    return Math.floor(bestSize * 10) / 10;
  }
}

export function getCompressedFontSize(value, width, options = {}) {
  const textMeasure = new TextMeasure();
  return textMeasure.findOptimalFontSize(value, width, options);
}
