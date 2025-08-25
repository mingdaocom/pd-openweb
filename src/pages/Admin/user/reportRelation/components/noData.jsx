import React from 'react';
import Icon from 'ming-ui/components/Icon';

export default function () {
  return (
    <div className="noData TxtCenter">
      <div>
        <Icon icon="manage" className="icon InlineBlock" />
      </div>
      <div className="pTop20 Font17 Gray_9e">{_l('暂无下属')}</div>
      <div className="mTop10 Font15 Gray_9e">{_l('点击上方 + 添加下属')}</div>
    </div>
  );
}
