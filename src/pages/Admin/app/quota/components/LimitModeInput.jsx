import React, { Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Dropdown, InputNumber } from 'ming-ui/antd-components';
import { getLimitMode, getSizeByLimitMode } from '../utils';

/** 带“不限/限制上限”切换的数值输入，批量弹层和添加弹层复用同一交互。 */
export default function LimitModeInput({ businessType, value, min, max, unit, className, onChange }) {
  const limitMode = getLimitMode(value);
  const limitModeMenu = {
    items: [
      { key: 'unlimited', label: _l('不限'), disabled: limitMode === 'unlimited' },
      { key: 'limited', label: _l('限制上限'), disabled: limitMode === 'limited' },
    ],
    style: { minWidth: 180 },
    onClick: ({ key }) => onChange(getSizeByLimitMode({ mode: key, size: value, businessType })),
  };

  if (limitMode === 'unlimited') {
    return (
      <Dropdown trigger={['click']} menu={limitModeMenu}>
        <div className={`${className || ''} limitModeTrigger unlimited`}>
          {_l('不限')}
          <Icon icon="arrow-down-border" className="Font12" />
        </div>
      </Dropdown>
    );
  }

  return (
    <Fragment>
      <InputNumber
        className={className}
        value={value}
        min={min}
        max={typeof max === 'number' ? max : undefined}
        precision={0}
        onChange={onChange}
      />
      <Dropdown trigger={['click']} menu={limitModeMenu}>
        <div className="limitModeTrigger mLeft8">
          {unit}
          <Icon icon="arrow-down-border" className="Font12" />
        </div>
      </Dropdown>
    </Fragment>
  );
}
