import React from 'react';
import SourceListSettings from './components/SourceListSettings';

const Resource = props => {
  return (
    <div className="privateCardWrap flexColumn h100 mBottom20">
      <div className="Font17 bold mBottom8">{_l('资源')}</div>
      <div className="Gray_9e mBottom28">{_l('可自定义工作台显示的资源列表项')}</div>
      <SourceListSettings />
    </div>
  );
}

export default Resource;
