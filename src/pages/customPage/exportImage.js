import domtoimage from 'dom-to-image';
import _ from 'lodash';
import { reportTypes } from 'statistics/Charts/reportTypes';

const blobToImg = blob => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const img = new Image();
      img.src = reader.result;
      img.addEventListener('load', () => resolve(img));
    });
    reader.readAsDataURL(blob);
  });
};

const imgToCanvas = img => {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas;
};

const addHintWatermark = (canvas, layouts) => {
  return new Promise(resolve => {
    const text = _l('不支持打印');
    const ctx = canvas.getContext('2d');
    ctx.font = '40px';
    ctx.fillStyle = '#757575';
    ctx.textAlign = 'center';
    layouts.forEach(({ left, top }) => {
      ctx.fillText(text, left, top);
    });
    resolve(canvas);
  });
};

const addUserWatermark = (canvas, currentProject) => {
  const getValue = key => {
    switch (key) {
      case 'mobilePhone':
        return (_.get(md, 'global.Account.mobilePhone') || '').substr(-4, 4);
      case 'email':
        return (_.get(md, 'global.Account.email') || '').replace(/@.*/g, '');
      case 'companyName':
        return currentProject.companyName || '';
      default:
        return _.get(md, `global.Account.${key}`) || '';
    }
  };

  const getContent = () => {
    if (currentProject.enabledWatermarkTxt) {
      return currentProject.enabledWatermarkTxt.replace(/\$(\w+)\$/g, (_, key) => getValue(key));
    }

    return md.global.Account.fullname + '/' + (getValue('mobilePhone') || getValue('email'));
  };

  const content = getContent();

  return new Promise(resolve => {
    const ctx = canvas.getContext('2d');

    ctx.font = '18px normal';
    ctx.fillStyle = 'rgba(0, 0, 0, .06)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const angle = (50 * Math.PI) / 180;
    const horizontalGap = 212;
    const verticalGap = 222;

    for (let y = 0; y < canvas.height; y += verticalGap) {
      for (let x = 0; x < canvas.width; x += horizontalGap) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(content, 0, 0);
        ctx.restore();
      }
    }

    resolve(canvas);
  });
};

export const createFontLink = () => {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.onload = resolve;
    link.setAttribute('class', 'fontlinksheet');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', '/staticfiles/iconfont/iconfont.css');
    document.head.appendChild(link);
  });
};

export const exportImage = ({ pageBgColor, isUserWatermark, currentProject }) => {
  return new Promise(resolve => {
    const wrap =
      document.querySelector('.componentsWrap .react-grid-layout') || document.querySelector('.customPageContent');
    const { left: wrapLeft, top: wrapTop } = wrap.getBoundingClientRect();
    const embedUrls = wrap.querySelectorAll('.widgetContent.embedUrl');
    const countryLayers = [
      ...wrap.querySelectorAll(`.statisticsCard-${reportTypes.CountryLayer}`),
      ...wrap.querySelectorAll(`.statisticsCard-${reportTypes.WorldMap}`),
    ].map(item => item.parentNode.parentNode);
    const { offsetWidth, offsetHeight } = wrap;
    const fontlinksheet = document.querySelector('.fontlinksheet');
    document.querySelectorAll('.mapboxgl-ctrl').forEach(item => {
      item.remove();
    });
    domtoimage
      .toBlob(wrap, {
        bgcolor: pageBgColor || '#f5f5f5',
        width: offsetWidth,
        height: offsetHeight,
      })
      .then(async blob => {
        const newImage = await blobToImg(blob);
        const canvas = imgToCanvas(newImage);
        const layouts = [...embedUrls, ...countryLayers].map(el => {
          const { left, width, top, height } = el.getBoundingClientRect();
          return {
            left: left - wrapLeft + width / 2,
            top: top - wrapTop + height / 2,
          };
        });
        let newCanvas = null;
        newCanvas = await addHintWatermark(canvas, layouts);
        if (isUserWatermark) {
          newCanvas = await addUserWatermark(newCanvas, currentProject);
        }

        fontlinksheet && fontlinksheet.remove();
        newCanvas.toBlob(blob => resolve(blob));
      })
      .catch((error, data) => {
        fontlinksheet && fontlinksheet.remove();
        console.log(error, data);
        resolve();
      });
  });
};
