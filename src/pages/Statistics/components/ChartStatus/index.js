import React from 'react';
import { Icon } from 'ming-ui';
import loading from './loading.svg';

const style = {
  justifyContent: 'center',
};

export const Loading = () => {
  return (
    <div className="flex flexColumn valignWrapper" style={style}>
      <img className="chartLoading" src={loading} />
      <div className="Gray_9e mTop10">{_l('正在加载数据...')}</div>
    </div>
  );
};

export const WithoutData = () => {
  return (
    <div className="flex flexColumn valignWrapper Gray_9e Font16 h100" style={style}>
      {_l('没有记录')}
    </div>
  );
};

export const Overload = () => {
  return (
    <div className="flex flexColumn valignWrapper Gray_9e Font16 h100 centerAlign" style={style}>
      {_l('数据量过大，无法绘制可查看的图表如需查看，请选择范围、添加筛选条件或联系应用管理员')}
    </div>
  );
};

export const Abnormal = props => {
  const { isEdit, status } = props;
  const withoutPermission = (
    <div className="flex flexColumn valignWrapper Gray_c" style={style}>
      <Icon icon="password" className="Font64 Gray_c mBottom10" />
      <div className="Gray_9e Font20 mBottom2">{_l('无法形成图表')}</div>
      <div className="Gray_9e Font16">{_l('无权限')}</div>
    </div>
  );
  const dataSizeOverload = (
    <div className="flex flexColumn valignWrapper Gray_c" style={style}>
      <Icon icon="password" className="Font64 Gray_c mBottom10" />
      <div className="Gray_9e Font20 mBottom2">{_l('无法形成图表')}</div>
      <div className="Gray_9e Font16">{_l('数据量过大，请添加时间范围或添加筛选条件减少数据量')}</div>
    </div>
  );
  if (isEdit) {
    if (status === -1) {
      return withoutPermission;
    } else if (status === -2) {
      return dataSizeOverload;
    } else if (status === -3) {
      return (
        <div className="flex flexColumn valignWrapper Gray_9e Font16 h100" style={style}>
          {_l('服务异常，请稍后重试')}
        </div>
      );
    } else {
      return (
        <div className="flex flexColumn valignWrapper Gray_9e Font16 h100" style={style}>
          {_l('选择或将字段拖拽到右侧维度、数值栏添加数据')}
        </div>
      );
    }
  } else {
    if (status === -1) {
      return withoutPermission;
    } else if (status === -2) {
      return dataSizeOverload;
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
};
