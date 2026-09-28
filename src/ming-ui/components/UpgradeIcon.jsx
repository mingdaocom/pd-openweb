import React, { forwardRef } from 'react';
import { Tooltip } from 'ming-ui/antd-components';

const UpgradeIcon = forwardRef((props, ref) => {
  const { className, onClick, ...triggerProps } = props;

  return (
    <Tooltip {...triggerProps} ref={ref} placement="right" title={_l('当前版本无法使用此功能，请购买或者升级')}>
      <i
        className={`icon-auto_awesome Font16 mLeft6 Hand ${className}`}
        style={{ color: 'var(--color-warning)' }}
        onClick={onClick}
      />
    </Tooltip>
  );
});

UpgradeIcon.displayName = 'UpgradeIcon';

export default UpgradeIcon;
