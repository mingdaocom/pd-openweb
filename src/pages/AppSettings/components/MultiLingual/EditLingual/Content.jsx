import React from 'react';
import App from './App';
import Collections from './Collections';
import Control from './Control';
import ControlRules from './ControlRules';
import CustomAction from './CustomAction';
import CustomPage from './CustomPage';
import CustomPageButton from './CustomPageButton';
import CustomPageChart from './CustomPageChart';
import CustomPageFilter from './CustomPageFilter';
import CustomPageRichText from './CustomPageRichText';
import CustomPageView from './CustomPageView';
import Gourup from './Gourup';
import Sheet from './Sheet';
import StatisticsChart from './StatisticsChart';
import View from './View';
import Workflow from './Workflow';
import WorkflowNode from './WorkflowNode';

const Components = {
  // 应用
  app: App,
  // 工作表
  0: Sheet,
  // 自定义页面
  1: CustomPage,
  // 分组
  2: Gourup,
  // 字段
  control: Control,
  // 视图
  view: View,
  // 自定义动作
  customAction: CustomAction,
  // 统计图表
  statisticsChart: StatisticsChart,
  // 业务规则
  controlRules: ControlRules,
  // 选项集
  collections: Collections,
  // 自定义页面、统计图
  pageStatisticsChart: CustomPageChart,
  // 自定义页面、按钮
  pageButton: CustomPageButton,
  // 自定义页面、筛选器
  pageFilter: CustomPageFilter,
  // 自定义页面、视图
  pageView: CustomPageView,
  // 自定义页面、富文本
  pageRichText: CustomPageRichText,
  // 工作流
  workflow: Workflow,
  // 工作流、节点
  workflowNode: WorkflowNode,
};

export default function Content(props) {
  const { selectNode } = props;
  const Component = Components[selectNode.type];
  return Component ? <Component {...props} /> : null;
}
