import {
  BAR_LAYOUT,
  BAR_POSITION,
  BAR_LABEL_SIZE,
  BAR_LABEL_SIZES,
  PRINT_TYPE,
  QR_LAYOUT,
  QR_POSITION,
  QR_LABEL_SIZE,
  QR_LABEL_SIZES,
  SOURCE_TYPE,
} from './enum';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { QrLabel } from './qr';
import { BarLabel } from './bar';
import _ from 'lodash';

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

const DPI_MM = 6;

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
    size: ['l', 'm', 's'][Number(config.codeSize) - 1],
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

export function getCodeTexts({ showTexts, firstIsBold, showControlName, controls, emptySetAsSample } = {}, data = {}) {
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
    codePosition: {
      [BAR_POSITION.TOP]: 'top',
      [BAR_POSITION.BOTTOM]: 'bottom',
    }[config.position],
    size: ['l', 'm', 's'][Number(config.codeSize) - 1],
    texts,
  });
  return barLabel;
}
