import React from 'react';
import App from './App';
import Sheet from './Sheet';
import CustomPage from './CustomPage';
import Gourup from './Gourup';
import Control from './Control';
import View from './View';
import CustomAction from './CustomAction';
import StatisticsChart from './StatisticsChart';
import Collections from './Collections';
import CustomPageChart from './CustomPageChart';
import CustomPageButton from './CustomPageButton';
import CustomPageFilter from './CustomPageFilter';
import CustomPageView from './CustomPageView';
import CustomPageRichText from './CustomPageRichText';

const Components = {
  // 应用
  'app': App,
  // 工作表
  0: Sheet,
  // 自定义页面
  1: CustomPage,
  // 分组
  2: Gourup,
  // 字段
  'control': Control,
  // 视图
  'view': View,
  // 自定义动作
  'customAction': CustomAction,
  // 统计图表
  'statisticsChart': StatisticsChart,
  // 选项集
  'collections': Collections,
  // 自定义页面、统计图
  'pageStatisticsChart': CustomPageChart,
  // 自定义页面、按钮
  'pageButton': CustomPageButton,
  // 自定义页面、筛选器
  'pageFilter': CustomPageFilter,
  // 自定义页面、视图
  'pageView': CustomPageView,
  // 自定义页面、富文本
  'pageRichText': CustomPageRichText
}

export default function Content(props) {
  const { selectNode } = props;
  const Component = Components[selectNode.type]
  return Component ? <Component {...props} /> : null;
}
