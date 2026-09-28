import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Input, Radio, Tooltip } from 'ming-ui/antd-components';
import { getMinLimit } from '../utils';

const Wrap = styled.div`
  padding-left: 1px;
`;

/** 全局额度配置区域，支持在“不限”和“限制上限”之间切换。 */
export default function GlobalSetting({
  globalDesc,
  globalUnit,
  businessType,
  size,
  clickSubmit,
  limitRowTotal,
  hapLimitSize,
  onChange,
  onBlur,
}) {
  const limitSize = window.platformENV.isHap
    ? hapLimitSize
    : businessType === 1
      ? md.global.SysSettings.fileUploadLimitSize || 4 * 1024
      : businessType === 2
        ? limitRowTotal * 10
        : 0;

  return (
    <Wrap className="mBottom32">
      <div className="mBottom16 bold">{globalDesc}</div>
      <div className="flexRow mBottom20 alignItemsCenter">
        <Radio className="mRight8" checked={size === -1} onChange={() => onChange(-1)} />
        <span>{_l('不限')}</span>
        <Tooltip title={_l('设置为“不限”，实际使用不得超过系统限制')}>
          <Icon icon="info_outline" className="Font16 textTertiary mLeft5 Hand Relative" />
        </Tooltip>
      </div>
      <div className="flexRow alignItemsCenter">
        <Radio className="mRight8" checked={size !== -1} onChange={() => onChange(getMinLimit(businessType))} />
        <span className="mRight10">{_l('限制上限')}</span>
        <Input
          disabled={size === -1}
          className={cx('mLeft10 mRight10', { overLimit: clickSubmit && size > limitSize })}
          value={size === -1 ? '' : size}
          onChange={e => onChange(+e.target.value.replace(/\D/g, ''))}
          onBlur={event => onBlur(event, onChange)}
        />
        <div>{globalUnit}</div>
      </div>
    </Wrap>
  );
}
