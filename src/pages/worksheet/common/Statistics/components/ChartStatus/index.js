import React from 'react';
import { Icon } from 'ming-ui';
import loading from './loading.svg';

const style = {
  justifyContent: 'center'
}

export const Loading = (props) => {
  return (
    <div className="flex flexColumn valignWrapper" style={style}>
      <img className="chartLoading" src={loading} />
      <div className="Gray_9e mTop10">{_l('正在加载数据...')}</div>
    </div>
  );
}

export const WithoutData = (props) => {
  return (
    <div className="flex flexColumn valignWrapper Gray_9e Font16 h100" style={style}>
      {_l('没有记录')}
    </div>
  );
}

export const Abnormal = (props) => {
  const { isEdit } = props;
  if (isEdit) {
    return (
      <div className="flex flexColumn valignWrapper Gray_9e Font16 h100" style={style}>
        {_l('拖拽中间字段到右侧维度、数值栏添加数据')}
      </div>
    );
  } else {
    return (
      <div className="flex flexColumn valignWrapper Gray_c" style={style}>
        <Icon icon="workflow_failure" className="Font64 Gray_c mBottom10" />
        <div className="Gray_9e Font20 mBottom2">{_l('无法形成图表')}</div>
        <div className="Gray_9e Font16">{_l('构成要素不存在或已删除')}</div>
      </div>
    );
  }
}