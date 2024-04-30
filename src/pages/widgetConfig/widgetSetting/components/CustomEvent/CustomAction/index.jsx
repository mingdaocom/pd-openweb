import _ from 'lodash';
import React from 'react';
import { ACTION_VALUE_ENUM } from '../config';
import ShowOrHide from './actionTypes/ShowOrHide';
import SetReadOnly from './actionTypes/SetReadOnly';
import SetValue from './actionTypes/SetValue';
import RefreshValue from './actionTypes/RefreshValue';
import PromptError from './actionTypes/PromptError';
import OpenLink from './actionTypes/OpenLink';
import PromptMessage from './actionTypes/PromptMessage';
import CreateRecord from './actionTypes/CreateRecord';
import IntegratedApi from './actionTypes/IntegratedApi';
import PlayVoice from './actionTypes/PlayVoice';
import functionWrap from 'ming-ui/components/FunctionWrap';

const CustomActionConfig = props => {
  const { actionData = {} } = props;

  switch (actionData.actionType) {
    // 显示/隐藏
    case ACTION_VALUE_ENUM.SHOW:
    case ACTION_VALUE_ENUM.HIDE:
      return <ShowOrHide {...props} />;
    // 只读/可编辑
    case ACTION_VALUE_ENUM.READONLY:
    case ACTION_VALUE_ENUM.EDIT:
      return <SetReadOnly {...props} />;
    // 设置字段值
    case ACTION_VALUE_ENUM.SET_VALUE:
      return <SetValue {...props} />;
    // 刷新字段值
    case ACTION_VALUE_ENUM.REFRESH_VALUE:
      return <RefreshValue {...props} />;
    // 提示错误
    case ACTION_VALUE_ENUM.ERROR:
      return <PromptError {...props} />;
    // // 调用已集成api
    case ACTION_VALUE_ENUM.API:
      return <IntegratedApi {...props} />;
    // 提示消息
    case ACTION_VALUE_ENUM.MESSAGE:
      return <PromptMessage {...props} />;
    // 播放声音
    case ACTION_VALUE_ENUM.VOICE:
      return <PlayVoice {...props} />;
    // 打开链接
    case ACTION_VALUE_ENUM.LINK:
      return <OpenLink {...props} />;
    // 创建新纪录
    case ACTION_VALUE_ENUM.CREATE:
      return <CreateRecord {...props} />;
  }
};

export default props => functionWrap(CustomActionConfig, { ...props });
