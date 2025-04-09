import _ from 'lodash';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import { generate } from '@ant-design/colors';
import styled from 'styled-components';

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
  const iconColor = appItem.iconColor || '#2196f3';
  const navColor = appItem.navColor || iconColor;
  const black = '#1b2025' === navColor;
  const light = [appItem.lightColor, '#ffffff', '#f5f6f7'].includes(navColor);

  const appBgColor = light ? appItem.lightColor : navColor || iconColor;
  const appIconColor = black || light ? iconColor : '#fff';
  const itemIconColor = black || light ? iconColor : appBgColor;
  return {
    bg: isItem ? getRgbaByColor(itemIconColor, '0.08') : appBgColor,
    iconColor: isItem ? itemIconColor : appIconColor,
  };
};

export const themeColors = [
  '#2196F3',
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
      themeColor: '#2196F3',
      activeColor: getRgbaByColor('#2196f3', '0.1'),
      hoverColor: getRgbaByColor('#2196f3', '0.16'),
    };
  }

  return {
    bgColor: color !== '#2196F3' ? (color === '#d4b106' ? '#f9f7d7' : generate(color)[0]) : '#f7f8fc',
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
};

export const CardItem = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  padding-bottom: 12px;
  box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.08);
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
      color: #9e9e9e;
      cursor: pointer;
      &:hover {
        background-color: #f8f8f8;
      }
    }
  }
  .emptyWrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #868686;
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
      color: #151515;
    }
  }
`;
