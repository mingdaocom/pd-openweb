import React, { Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Dropdown, Input } from 'ming-ui/antd-components';
import { getLimitMode, getSizeByLimitMode } from '../utils';

/** 通用限额编辑器，组合数值输入框与不限/限量模式下拉菜单。 */
export default function LimitValue({ businessType, clickSubmit, limitSize, size, unit, onChange, onBlur }) {
  const limitMode = getLimitMode(size);
  const limitModeMenu = {
    items: [
      { key: 'unlimited', label: _l('不限'), disabled: limitMode === 'unlimited' },
      { key: 'limited', label: _l('限制上限'), disabled: limitMode === 'limited' },
    ],
    style: { minWidth: 180 },
    onClick: ({ key }) => onChange(getSizeByLimitMode({ mode: key, size, businessType })),
  };

  if (limitMode === 'unlimited') {
    return (
      <Dropdown trigger={['click']} menu={limitModeMenu}>
        <div className="limitModeTrigger unlimited">
          {_l('不限')}
          <Icon icon="arrow-down-border" className="Font12" />
        </div>
      </Dropdown>
    );
  }

  return (
    <Fragment>
      <Input
        className={cx('mRight10', { overLimit: clickSubmit && size > limitSize })}
        value={size}
        onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
        onBlur={event => onBlur(event, onChange)}
      />
      <Dropdown trigger={['click']} menu={limitModeMenu}>
        <div className="limitModeTrigger">
          {unit}
          <Icon icon="arrow-down-border" className="Font12" />
        </div>
      </Dropdown>
    </Fragment>
  );
}
