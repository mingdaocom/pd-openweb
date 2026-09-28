import { generate } from '@ant-design/colors';
import _ from 'lodash';
import styled from 'styled-components';
import { getAppIconColors } from 'src/utils/domain/app/color';
import { getRgbaByColor } from 'src/utils/platform/theme/color';

export const getGreetingText = () => {
  const hours = new Date().getHours();

  switch (true) {
    case hours < 6:
      return _l('凌晨好');
    case hours < 12:
      return _l('上午好');
    case hours < 18:
      return _l('下午好');
    default:
      return _l('晚上好');
  }
};

export const getAppOrItemColor = (appItem, isItem) => {
  const { backgroundColor, iconColor, itemIconColor } = getAppIconColors(appItem, '#1677ff');

  return {
    bg: isItem ? getRgbaByColor(itemIconColor, '0.08') : backgroundColor,
    iconColor: isItem ? itemIconColor : iconColor,
  };
};

export const themeColors = [
  '#1677ff',
  '#2F54EB',
  '#732ED1',
  '#1EBCD5',
  '#4CAF50',
  '#FF0000',
  '#EB2F96',
  '#FD982E',
  '#FADB14',
];

export const getDashboardColor = color => {
  //默认主题
  if (!color || (!_.includes(themeColors, color) && !color.startsWith('#'))) {
    return {
      bgColor: '#f7f8fc',
      themeColor: '#1677ff',
      activeColor: getRgbaByColor('#1677ff', '0.1'),
      hoverColor: getRgbaByColor('#1677ff', '0.16'),
    };
  }

  return {
    bgColor: color !== '#1677ff' ? (color === '#d4b106' ? '#f9f7d7' : generate(color)[0]) : '#f7f8fc',
    themeColor: color,
    activeColor: getRgbaByColor(color, '0.1'),
    hoverColor: getRgbaByColor(color, '0.16'),
  };
};

export const urlToBase64 = url => {
  return fetch(url)
    .then(response => response.blob())
    .then(blob => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
};

export const getUrlWithRandomQuery = (url = '', random = Math.random()) => {
  return `${url}?${random}`;
};

export const getImageBase64UploadData = (base64 = '', ext = 'jpg') => {
  const imageExt = String(ext).replace(/^\./, '').toLowerCase() === 'gif' ? 'gif' : 'jpeg';

  return String(base64).replace(`data:image/${imageExt};base64,`, '');
};

export const coverUrls = [
  'ProjectLogo/bulletin_1.jpg',
  'ProjectLogo/bulletin_2.jpg',
  'ProjectLogo/bulletin_3.jpg',
  'ProjectLogo/bulletin_4.jpg',
  'ProjectLogo/bulletin_5.jpg',
  'ProjectLogo/bulletin_6.jpg',
  'ProjectLogo/bulletin_7.jpg',
  'ProjectLogo/bulletin_8.jpg',
];

export const chartRefreshOptions = [
  { text: _l('关闭'), value: 0 },
  { text: _l('30秒'), value: 30 },
  { text: _l('1分钟'), value: 60 },
  { text: _l('2分钟'), value: 120 },
  { text: _l('3分钟'), value: 180 },
  { text: _l('4分钟'), value: 240 },
  { text: _l('5分钟'), value: 300 },
];

export const MODULE_TYPES = {
  APP_COLLECTION: 0,
  RECENT: 1,
  ROW_COLLECTION: 2,
  CHART_COLLECTION: 3,
  APP: 4,
};

export const DASHBOARD_MODULES = [
  { value: MODULE_TYPES.APP_COLLECTION, text: _l('应用收藏') },
  { value: MODULE_TYPES.RECENT, text: _l('最近使用') },
  { value: MODULE_TYPES.ROW_COLLECTION, text: _l('记录收藏') },
  { value: MODULE_TYPES.CHART_COLLECTION, text: _l('图表收藏') },
  { value: MODULE_TYPES.APP, text: _l('应用') },
];

export const DEFAULT_SORT_MODULE_IDS = DASHBOARD_MODULES.map(item => item.value);

export const normalizeSortModuleIds = sortItems => {
  const moduleIds = sortItems && sortItems.length ? sortItems.map(item => item.moduleType) : DEFAULT_SORT_MODULE_IDS;

  return _.includes(moduleIds, MODULE_TYPES.APP) ? moduleIds : moduleIds.concat(MODULE_TYPES.APP);
};

export const getModuleVisible = (moduleType, data = {}) => {
  const {
    markedApps = [],
    displayCommonApp,
    recentApps = [],
    recentAppItems = [],
    rowCollect,
    recordCollectCount,
    displayChart,
    chartCollectCount,
    displayApp,
  } = data;

  switch (moduleType) {
    case MODULE_TYPES.APP_COLLECTION:
      return !!markedApps.length;
    case MODULE_TYPES.RECENT:
      return !!displayCommonApp && (!!recentApps.length || !!recentAppItems.length);
    case MODULE_TYPES.ROW_COLLECTION:
      return !!rowCollect && recordCollectCount !== 0;
    case MODULE_TYPES.CHART_COLLECTION:
      return !!displayChart && chartCollectCount !== 0;
    case MODULE_TYPES.APP:
      return !!displayApp;
    default:
      return false;
  }
};

export const CardItem = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-background-primary);
  padding-bottom: 12px;
  box-shadow: var(--shadow-sm);
  border-radius: 8px;
  margin-bottom: 20px;

  &.bulletinBoard {
    padding: 0;
  }
  &.appCollectCard {
    min-height: 118px;
    .autosize {
      height: auto !important;
    }
  }
  &.recentCard,
  &.rowCollectCard {
    max-height: 300px;
    &.halfWidth {
      height: 300px;
    }
  }
  &.recentCard {
    min-height: 118px;
  }
  &.rowCollectCard {
    min-height: 100px;
  }
  .cardTitle {
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 8px 0px 20px;
    position: relative;
    .titleText {
      display: flex;
      align-items: center;
      font-size: 17px;
      font-weight: bold;
      img {
        width: 24px;
        height: 24px;
        margin-right: 4px;
      }
    }
    .viewAll {
      display: flex;
      align-items: center;
      padding: 6px 4px 6px 10px;
      margin-top: -4px;
      border-radius: 4px;
      color: var(--color-text-tertiary);
      cursor: pointer;
      &:hover {
        background-color: var(--color-background-hover);
      }
    }
  }
  .emptyWrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--color-text-secondary);
    font-size: 14px;
    margin-top: 36px;
    margin-bottom: 36px;
    img {
      width: 80px;
      height: 80px;
      margin-bottom: 8px;
    }
    .boldText {
      font-weight: bold;
      margin-left: 4px;
      margin-right: 4px;
      color: var(--color-text-title);
    }
  }
`;
