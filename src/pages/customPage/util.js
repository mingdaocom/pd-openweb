import { generate } from '@ant-design/colors';
import { TinyColor } from '@ctrl/tinycolor';
import domtoimage from 'dom-to-image';
import { get } from 'lodash';
import maxBy from 'lodash/maxBy';
import moment from 'moment';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { reportTypes } from 'statistics/Charts/common';
import { SYS_COLOR } from 'src/pages/Admin/settings/config';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import {
  formatConditionForSave,
  getDefaultCondition,
  redefineComplexControl,
} from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { isLightColor as utilsIsLightColor } from 'src/utils/control';
import { MAX_COMPONENT_COUNT } from './config';
import { containerWidgets, widgets } from './enum';

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
`;

const enumObj = obj => {
  _.keys(obj).forEach(key => (obj[obj[key]] = key));
  return obj;
};

export const enumWidgetType = enumObj({
  analysis: 1,
  richText: 2,
  embedUrl: 3,
  button: 4,
  view: 5,
  filter: 6,
  carousel: 7,
  ai: 8,
  tabs: 9,
  card: 10,
  image: 11,
});

export const getEnumType = type => (typeof type === 'number' ? enumWidgetType[type] : type);
export const getIndexById = ({ component, components }) => {
  const id = component.id || component.uuid;
  return _.findIndex(components, item => item.id === id || item.uuid === id);
};
export const getDefaultLayout = ({
  components = [],
  index = components.length,
  layoutType = 'web',
  titleVisible,
  type,
}) => {
  if (layoutType === 'web') {
    if (['view', 'tabs'].includes(type)) {
      return { x: (components.length * 24) % 48, y: Infinity, w: 48, h: 10, minW: 2, minH: 6 };
    } else if (type === 'filter') {
      return { x: (components.length * 24) % 48, y: Infinity, w: 48, h: 4, minW: 2, minH: 2 };
    } else if (type === 'image') {
      return { x: (components.length * 24) % 48, y: Infinity, w: 48, h: 10, minW: 2, minH: 2 };
    } else {
      return { x: (components.length * 24) % 48, y: Infinity, w: 24, h: 12, minW: 2, minH: 2 };
    }
  }
  if (layoutType === 'mobile') {
    const { type } = _.pick(components[index], 'type');
    const { y = 0, h = 6 } = maxBy(components, item => get(item, ['mobile', 'layout', 'y'])) || {};
    const enumType = getEnumType(type);
    const minW = _.includes(['button'], enumType) ? 2 : 1;
    if (['view', 'tabs'].includes(enumType)) {
      return { x: 0, y: y + h, w: 4, h: titleVisible ? 9 : 8, minW, minH: 4 };
    } else if (enumType === 'filter') {
      return { x: 0, y: y + h, w: 4, h: 1, minW, minH: 1 };
    } else if (enumType === 'image') {
      return { x: 0, y: y + h, w: 4, h: titleVisible ? 9 : 8, minW, minH: 2 };
    } else {
      return { x: 0, y: y + h, w: 4, h: titleVisible ? 7 : 6, minW, minH: 2 };
    }
  }
};

// export const formatComponents = components => components.map(item => ({ ...item, layout: JSON.parse(item.layout || '{}') }));

export const componentCountLimit = components => {
  // if (components.length >= MAX_COMPONENT_COUNT) {
  //   alert(_l('自定义页面最多只能添加%0个组件', MAX_COMPONENT_COUNT), 3);
  //   return false;
  // }
  return true;
};

export const getIconByType = type => {
  return _.get({ ...widgets, ...containerWidgets }[getEnumType(type)], 'icon');
};

function filterHTML(input) {
  const div = document.createElement('div');
  div.innerHTML = input;
  const text = div.textContent || div.innerText || '';
  return text.replace(/\u00A0/g, ' ').trim();
}

export const getComponentTitleText = component => {
  const { value = '', type, name, button, config = {}, componentConfig = {} } = component;
  const enumType = getEnumType(type);
  if (enumType === 'analysis') return name || _l('未命名图表');
  if (enumType === 'richText') return filterHTML(value) || _l('文本');
  if (enumType === 'button') return _.get(button, ['buttonList', '0', 'name']);
  if (enumType === 'view') return config.name;
  if (enumType === 'filter') return _l('筛选组件');
  if (enumType === 'carousel') return _l('轮播图');
  if (enumType === 'tabs') return _.get(componentConfig, 'name') || _l('标签页');
  if (enumType === 'card') return _.get(componentConfig, 'name') || _l('卡片');
  if (enumType === 'image') return _.get(componentConfig, 'name') || _l('图片');
  if (_.includes(['embedUrl'], enumType)) return value;
  return value;
};

export const reorderComponents = components => {
  if (_.every(components, item => _.get(item, ['mobile', 'layout']))) return false;

  // 先按y的从小到大排序 再按x的从小到大排序
  const groups = _.groupBy(components, item => _.get(item, ['web', 'layout', 'y']));

  return _.flattenDeep(
    _.sortBy(_.keys(groups), item => +item).map(key => {
      const group = groups[key];
      return _.sortBy(group, item => _.get(item, ['web', 'layout', 'x']));
    }),
  );
};

//  获取layout布局, 如果没有设置好的layout,则生成一个默认的
export const getLayout = (components, layoutType) => {
  return components.map((item = {}, index) => {
    const { id } = item;
    const { layout, titleVisible } = item[layoutType] || {};
    return layout
      ? { ...layout, i: `${id || index}` }
      : { ...getDefaultLayout({ components, index, layoutType, titleVisible }), i: `${id || index}` };
  });
};

export const computeWidth = ({ width, count, margin = 20 }) => {
  return { width: `calc(${100 / count}% - ${margin}px)` };
};

export const genUrl = (url, para, info) => {
  para = para || [];

  if (!url) return url;
  if (para.length < 1) return url;
  const getData = value => {
    const { type, data } = value;
    if (type === 'static') return data;
    const { mobilePhone, accountId, email } = _.get(md, ['global', 'Account']);
    switch (data) {
      case 'userId':
        return accountId;
      case 'phone':
        return mobilePhone;
      case 'email':
        return email;
      case 'language':
        return window.getCurrentLang();
      // case 'workId':
      // return 'a';
      case 'ua':
        return navigator.userAgent;
      case 'timestamp':
        return Date.now();
      default:
        return info[data] || '';
    }
  };
  const paraStr = para.reduce((p, c) => {
    const { key, value } = c;
    const data = encodeURIComponent(getData(value));
    if (!data) return p;
    const searchPara = p ? `&${encodeURIComponent(key)}=${data}` : `${encodeURIComponent(key)}=${data}`;
    if (url.includes(searchPara)) return p;
    return (p += searchPara);
  }, '');
  if (!paraStr) return url;
  return url.includes('?') ? `${url}&${paraStr}` : `${url}?${paraStr}`;
};

const blobToImg = blob => {
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
    const text = _l('不支持打印');
    const ctx = canvas.getContext('2d');
    ctx.font = '40px';
    ctx.fillStyle = '#757575';
    ctx.textAlign = 'center';
    layouts.forEach(({ left, top }) => {
      ctx.fillText(text, left, top);
    });
    resolve(canvas);
    // canvas.toBlob(blob => resolve(blob));
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
    if (!!currentProject.enabledWatermarkTxt) {
      return currentProject.enabledWatermarkTxt.replace(/\$(\w+)\$/g, (_, key) => getValue(key));
    }

    return md.global.Account.fullname + '/' + (getValue('mobilePhone') || getValue('email'));
  };

  const content = getContent();

  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
    const wrap =
      document.querySelector('.componentsWrap .react-grid-layout') || document.querySelector('.customPageContent');
    const { left: wrapLeft, top: wrapTop } = wrap.getBoundingClientRect();
    const embedUrls = wrap.querySelectorAll('.widgetContent.embedUrl');
    const countryLayers = [...wrap.querySelectorAll(`.statisticsCard-${reportTypes.CountryLayer}`)].map(
      item => item.parentNode.parentNode,
    );
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
      });
  });
};

export const parseLink = (link, param) => {
  const url = genUrl(link, param);
  if (!/^https?:\/\//.test(url)) return `https://${url}`;
  return url;
};

// 图表和视图组件补充 objectId，便于搜索组件搜索
export const fillObjectId = components => {
  return components.map(c => {
    if ([enumWidgetType.analysis, enumWidgetType.view].includes(c.type)) {
      const config = _.get(c, 'config') || {};
      if (config.objectId) {
        return c;
      } else {
        return {
          ...c,
          config: {
            ...config,
            objectId: uuidv4(),
          },
        };
      }
    }
    return c;
  });
};

export const formatNavfilters = data => {
  const { advancedSetting } = data;
  const { navshow, navfilters, showNavfilters } = advancedSetting;
  if (['2'].includes(navshow) && navfilters && !showNavfilters) {
    const res = JSON.parse(navfilters);
    const { values } = handleCondition({
      ...data,
      values: res,
    });
    return JSON.stringify(values);
  }
  if (['3'].includes(navshow) && navfilters && !showNavfilters) {
    const res = JSON.parse(navfilters);
    return JSON.stringify(res.map(handleCondition));
  }
  return navfilters;
};

export const replaceColor = (config, iconColor) => {
  const iconColors = iconColor ? generate(iconColor) : [];
  const lightColor = iconColors[0];
  const data = { ...config };
  if (config.pageStyleType === 'dark') {
    if (data.pageBgColor === 'iconColor10') {
      data.widgetBgColor = iconColors[8];
    } else {
      data.widgetBgColor = '#2A2D2F';
    }
  } else {
    data.widgetBgColor = '#fff';
  }
  if (data.pageBgColor === 'iconColor10') {
    data.pageBgColor = iconColors[9];
  }
  if (data.widgetBgColor === data.pageBgColor) {
    data.widgetBgColor = iconColors[7];
    data.pageBgColor = iconColors[8];
  }
  if (data.pageBgColor === 'iconColor') {
    data.pageBgColor = iconColor;
    data.darkenPageBgColor = new TinyColor(iconColor).darken(6).toRgbString();
  }
  if (data.pageBgColor === 'lightColor') {
    data.pageBgColor = lightColor;
  }
  if (data.pivoTableColor === 'iconColor') {
    data.pivoTableColor = iconColor;
  }
  if (data.pivoTableColor === 'lightColor') {
    data.pivoTableColor = lightColor;
  }
  if (data.numberChartColor === 'iconColor') {
    data.numberChartColor = iconColor;
  }
  if (data.numberChartColor === 'lightColor') {
    data.numberChartColor = lightColor;
  }
  return data;
};

export const isLightColor = color => {
  if (_.find(SYS_COLOR, { color: color.toLocaleUpperCase() })) {
    return false;
  }
  return utilsIsLightColor(color);
};

function getQuarterDateRange(year, quarter) {
  let startMonth, endMonth;
  switch (quarter) {
    case 1:
      startMonth = 1;
      endMonth = 3;
      break;
    case 2:
      startMonth = 4;
      endMonth = 6;
      break;
    case 3:
      startMonth = 7;
      endMonth = 9;
      break;
    case 4:
      startMonth = 10;
      endMonth = 12;
      break;
    default:
      throw new Error('Invalid quarter');
  }

  const startOfQuarter = moment()
    .year(year)
    .month(startMonth - 1)
    .startOf('month');
  const endOfQuarter = moment()
    .year(year)
    .month(endMonth - 1)
    .endOf('month');

  return [startOfQuarter, endOfQuarter];
}

export const formatLinkageFiltersGroup = ({ sheetId, reportId, objectId }, linkageFiltersGroup) => {
  const result = [];
  for (let key in linkageFiltersGroup) {
    const data = linkageFiltersGroup[key];
    const { onlyChartIds = [] } = data;
    if (
      data.sheetId === sheetId &&
      reportId !== data.reportId &&
      (onlyChartIds.length ? onlyChartIds.includes(objectId) : true)
    ) {
      result.push({
        ...data,
        filters: data.filters.map(item => {
          const { control } = item;
          const { dataType, filterType } = formatConditionForSave(getDefaultCondition(redefineComplexControl(item)));
          const data = {
            ...item,
            type: undefined,
            controlName: undefined,
            controlValue: undefined,
            control: undefined,
            spliceType: 1,
            dataType,
            filterType,
          };
          // 如果内容为空，按照为空查找
          if (_.isNull(data.values[0]) || _.isUndefined(data.values[0]) || data.values[0] === '') {
            data.filterType = FILTER_CONDITION_TYPE.ISNULL;
            data.values = [];
            return data;
          }
          // 处理维度作为数值字段查找
          if (
            item.type === WIDGETS_TO_API_TYPE_ENUM.NUMBER ||
            item.type === WIDGETS_TO_API_TYPE_ENUM.MONEY ||
            item.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER
          ) {
            data.filterType = FILTER_CONDITION_TYPE.EQ;
            data.value = data.values[0];
            data.values = [];
            return data;
          }
          // 子表和关联表按照关联表查找
          if (item.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST || item.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET) {
            data.dataType = WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET;
            data.filterType = FILTER_CONDITION_TYPE.RCEQ;
            return data;
          }
          // 处理日期格式字段
          if (
            item.type === WIDGETS_TO_API_TYPE_ENUM.DATE ||
            (item.type === WIDGETS_TO_API_TYPE_ENUM.DATE_TIME && control)
          ) {
            const { particleSizeType = 1 } = control;
            const value = data.values[0];
            // 日、分、秒
            if ([1, 7, 13].includes(particleSizeType)) {
              data.dateRangeType = 1;
              data.filterType = FILTER_CONDITION_TYPE.DATE_EQ;
              data.value = moment(value).format('YYYY-MM-DD');
              data.values = [];
            }
            // 周
            if (particleSizeType === 2) {
              const [year, week] = value.split('W');
              const start = moment().year(year).week(week).startOf('week');
              const end = moment().year(year).week(week).endOf('week');
              data.filterType = FILTER_CONDITION_TYPE.DATE_BETWEEN;
              data.minValue = start.format('YYYY-MM-DD');
              data.maxValue = end.format('YYYY-MM-DD');
              data.values = [];
            }
            // 月
            if (particleSizeType === 3) {
              const [year, month] = value.split('/');
              const start = moment()
                .year(year)
                .month(month - 1)
                .startOf('month');
              const end = moment()
                .year(year)
                .month(month - 1)
                .endOf('month');
              data.filterType = FILTER_CONDITION_TYPE.DATE_BETWEEN;
              data.minValue = start.format('YYYY-MM-DD');
              data.maxValue = end.format('YYYY-MM-DD');
              data.values = [];
            }
            // 季度
            if (particleSizeType === 4) {
              const [year, quarter] = value.split('Q');
              const [start, end] = getQuarterDateRange(year, Number(quarter));
              data.filterType = FILTER_CONDITION_TYPE.DATE_BETWEEN;
              data.minValue = start.format('YYYY-MM-DD');
              data.maxValue = end.format('YYYY-MM-DD');
              data.values = [];
            }
            // 年
            if (particleSizeType === 5) {
              const year = value;
              const start = moment().year(year).startOf('year');
              const end = moment().year(year).endOf('year');
              data.filterType = FILTER_CONDITION_TYPE.DATE_BETWEEN;
              data.minValue = start.format('YYYY-MM-DD');
              data.maxValue = end.format('YYYY-MM-DD');
              data.values = [];
            }
            // 时
            if (particleSizeType === 6) {
              data.dateRangeType = 1;
              data.filterType = FILTER_CONDITION_TYPE.DATE_EQ;
              data.value = moment(`${value}:00`).format('YYYY-MM-DD');
              data.values = [];
            }
            return data;
          }
          // 处理时间格式字段
          if (item.type === WIDGETS_TO_API_TYPE_ENUM.TIME) {
            const value = data.values[0];
            data.filterType = FILTER_CONDITION_TYPE.DATEENUM;
            data.value = value;
            data.values = [];
          }
          // 地区改为在范围内
          if (
            item.type === WIDGETS_TO_API_TYPE_ENUM.AREA_CITY ||
            item.type === WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY ||
            item.type === WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE
          ) {
            data.filterType = FILTER_CONDITION_TYPE.BETWEEN;
          }
          // 级联选择改为在范围内
          if (item.type === WIDGETS_TO_API_TYPE_ENUM.CASCADER) {
            data.filterType = FILTER_CONDITION_TYPE.BETWEEN;
          }
          return data;
        }),
      });
    }
  }
  const filters = _.flatten(
    result.map(item => {
      return item.filters;
    }),
  );
  const initiateChartIds = result.map(item => item.widgetId);
  return {
    linkageFiltersGroup: filters,
    initiateChartIds,
  };
};

export const updateLayout = (components, config) => {
  const oldCols = 12;
  const newCols = 48;
  if (_.get(config, 'webNewCols') === 48) {
    return components;
  }
  return components.map(c => {
    const { web = {} } = c;
    const { layout } = web;
    return {
      ...c,
      web: {
        ...web,
        layout: layout
          ? {
              ...layout,
              w: Math.round((layout.w / oldCols) * newCols),
              x: Math.round((layout.x / oldCols) * newCols),
              h: Math.round((layout.h / oldCols) * 24),
              y: Math.round((layout.y / oldCols) * 24),
            }
          : layout,
      },
    };
  });
};
