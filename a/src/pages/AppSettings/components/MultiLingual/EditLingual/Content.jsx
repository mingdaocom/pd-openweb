import React from 'react';
import App from './App';
import Sheet from './Sheet';
import CustomPage from './CustomPage';
import Gourup from './Gourup';
import Control from './Control';
import View from './View';
import CustomAction from './CustomAction';

export default function Content(props) {
  const { selectNode } = props;

  // 应用
  if (selectNode.type === 'app') {
    return <App {...props} />;
  }

  // 工作表
  if (selectNode.type === 0) {
    return <Sheet {...props} />;
  }

  // 自定义页面
  if (selectNode.type === 1) {
    return <CustomPage {...props} />;
  }

  // 分组
  if (selectNode.type === 2) {
    return <Gourup {...props} />;
  }

  // 字段
  if (selectNode.type === 'control') {
    return <Control {...props} />;
  }

  // 视图
  if (selectNode.type === 'view') {
    return <View {...props} />;
  }

  // 自定义动作
  if (selectNode.type === 'customAction') {
    return <CustomAction {...props} />;
  }

  return null;
}
