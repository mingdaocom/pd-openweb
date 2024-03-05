import React from 'react';
import Icon from 'ming-ui/components/Icon';
import './index.less';

export default ({ icon, bgColor, size = 36, iconSize = 20 }) => {
  return (
    <div className="iconWithBg" style={{ width: size, height: size, backgroundColor: bgColor }}>
      <Icon icon={icon} style={{ color: '#fff', fontSize: iconSize }} />
    </div>
  );
};
