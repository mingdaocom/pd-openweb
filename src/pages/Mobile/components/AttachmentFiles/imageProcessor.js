import _ from 'lodash';
import moment from 'moment';
import { getDynamicValue } from 'src/components/Form/core/formUtils';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';

const WATERMARK_TEXT_LIMIT = 200;
const IMAGE_COMPRESS_MAX_SIDE = 2048;
// 仅用于 iOS H5 超大图 canvas 保护，不替代 webcompress 配置。
const IOS_CANVAS_SAFE_MAX_PIXELS = 16 * 1000 * 1000;

function isIOSH5() {
  const ua = _.get(window, 'navigator.userAgent', '');
  const platform = _.get(window, 'navigator.platform', '');
  const maxTouchPoints = _.get(window, 'navigator.maxTouchPoints', 0);

  return !window.isMingDaoApp && (/iP(ad|hone|od)/i.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1));
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const urlCreator = window.URL || window.webkitURL;

    if (!urlCreator || !urlCreator.createObjectURL) {
      const reader = new FileReader();

      reader.onload = event => {
        const image = new Image();

        image.onload = () => resolve({ image });
        image.onerror = reject;
        image.src = event.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = urlCreator.createObjectURL(file);
    const image = new Image();

    image.onload = () => resolve({ image, objectUrl });
    image.onerror = error => {
      releaseImageResource(image, objectUrl);
      reject(error);
    };

    image.src = objectUrl;
  });
}

function getResizeSize(width, height, maxSide) {
  if (!maxSide || Math.max(width, height) <= maxSide) {
    return { width, height };
  }

  const ratio = maxSide / Math.max(width, height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function getCanvasSafeMaxSide(width, height, needCompress) {
  if (needCompress) {
    return IMAGE_COMPRESS_MAX_SIDE;
  }

  if (!isIOSH5() || width * height <= IOS_CANVAS_SAFE_MAX_PIXELS) {
    return;
  }

  return Math.floor(Math.max(width, height) * Math.sqrt(IOS_CANVAS_SAFE_MAX_PIXELS / (width * height)));
}

function getCanvasOutputType(fileType, needCompress) {
  if (!needCompress) {
    return;
  }

  return /^image\/(jpeg|jpg|png|webp)$/i.test(fileType) ? fileType : 'image/jpeg';
}

function canvasToBlob(canvas, type, quality) {
  return new Promise(resolve => {
    try {
      canvas.toBlob(blob => resolve(blob), type, quality);
    } catch (error) {
      console.error(error);
      resolve(null);
    }
  });
}

function releaseImageResource(image, objectUrl, canvas) {
  const urlCreator = window.URL || window.webkitURL;

  if (objectUrl && urlCreator && urlCreator.revokeObjectURL) {
    urlCreator.revokeObjectURL(objectUrl);
  }

  if (image) {
    image.onload = null;
    image.onerror = null;
    image.src = '';
  }

  if (canvas) {
    canvas.width = 0;
    canvas.height = 0;
  }
}

function getLimitedWatermarkText(text) {
  if (!text) return '';

  const chars = Array.from(text);
  return chars.length > WATERMARK_TEXT_LIMIT ? `${chars.slice(0, WATERMARK_TEXT_LIMIT).join('')}...` : text;
}

function getDynamicWrapTxt(dynamicTxt, canvasWidth, ctx, fontSize) {
  if (!dynamicTxt) return [];

  ctx.font = `${fontSize}px 'Fira Sans'`;
  var paragraphs = dynamicTxt.split('\n');
  const txtList = [];
  paragraphs.forEach(function (paragraph) {
    paragraph = paragraph.trim();

    var words = paragraph.split('');
    var line = '';

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n];
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > canvasWidth && n > 0) {
        txtList.push(line);
        line = words[n];
      } else {
        line = testLine;
      }
    }

    txtList.push(line);
  });

  return txtList;
}

function getWatermarkTextLayouts(
  watermark,
  { dynamicControls, advancedSetting, currentLocation, ctx, fontSize, textMaxWidth },
) {
  const isNew = !!_.get(advancedSetting, 'h5watermark');

  if (isNew) {
    const dynamicTxt = getDynamicValue(dynamicControls, {
      controlId: 'temp',
      type: 2,
      advancedSetting: {
        defsource: JSON.stringify(transferValue(advancedSetting.h5watermark)),
      },
    });

    return getDynamicWrapTxt(getLimitedWatermarkText(dynamicTxt), textMaxWidth, ctx, fontSize);
  }

  const textLayouts = [];
  const { formattedAddress, position } = currentLocation || {};

  if (md.global.Account.fullname && watermark.includes('user')) {
    textLayouts.push(md.global.Account.fullname);
  }

  if (watermark.includes('time')) {
    textLayouts.push(moment().format('YYYY-MM-DD HH:mm:ss'));
  }

  if (formattedAddress && watermark.includes('address')) {
    textLayouts.push(formattedAddress);
  }

  if (position && watermark.includes('xy')) {
    textLayouts.push(`${_l('经度')}：${position.lng}  ${_l('纬度')}：${position.lat}`);
  }

  return textLayouts;
}

function drawWatermark(canvas, ctx, watermark, { dynamicControls, advancedSetting, currentLocation }) {
  const fontSize = Math.min(canvas.width, canvas.height) * 0.03;
  const lineSpacing = 6;
  const xOffset = 20;
  const textMaxWidth = canvas.width - xOffset * 2;
  const textLayouts = getWatermarkTextLayouts(watermark, {
    dynamicControls,
    advancedSetting,
    currentLocation,
    ctx,
    fontSize,
    textMaxWidth,
  });

  // 绘制背景
  const bgColoryOffset = fontSize * textLayouts.length + lineSpacing * textLayouts.length;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, canvas.height - bgColoryOffset - fontSize, canvas.width, bgColoryOffset + fontSize);

  // 绘制文字
  ctx.font = `${fontSize}px 'Fira Sans'`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.backgroundColor = 'var(--color-border-tertiary)';

  textLayouts.forEach((text, index) => {
    const i = textLayouts.length - index;
    const yOffset = canvas.height - fontSize * i - lineSpacing * i;
    ctx.fillText(text, xOffset, yOffset + 10);
  });
}

export function processImageFile(
  file,
  { needWatermark, watermark, dynamicControls, advancedSetting, currentLocation, needCompress, quality },
) {
  return loadImageFromFile(file)
    .then(async ({ image, objectUrl }) => {
      let canvas;

      try {
        canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return file;
        }

        const outputType = getCanvasOutputType(file.type, needCompress);
        const maxSide = getCanvasSafeMaxSide(image.width, image.height, needCompress);
        const size = getResizeSize(image.width, image.height, maxSide);

        canvas.width = size.width;
        canvas.height = size.height;
        ctx.drawImage(image, 0, 0, size.width, size.height);

        if (needWatermark) {
          drawWatermark(canvas, ctx, watermark, { dynamicControls, advancedSetting, currentLocation });
        }

        const blob = await canvasToBlob(canvas, outputType, needCompress ? quality : undefined);

        if (!blob) {
          return file;
        }

        const processedFile = new File([blob], file.name, {
          type: needCompress ? blob.type || outputType || file.type : file.type,
          lastModified: Date.now(),
        });

        return needWatermark || processedFile.size < file.size ? processedFile : file;
      } catch (error) {
        console.error(error);
        return file;
      } finally {
        releaseImageResource(image, objectUrl, canvas);
      }
    })
    .catch(error => {
      console.error(error);
      return file;
    });
}
