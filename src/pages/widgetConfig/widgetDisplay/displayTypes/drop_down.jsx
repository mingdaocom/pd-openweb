import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import cx from 'classnames';
import { isLightColor } from 'src/util';
import { CommonDisplay, OptionWrap } from '../../styled';
import { getAdvanceSetting, getOptions, parseOptionValue } from '../../util/setting';
import { head } from 'lodash';

export default function Dropdown({ data }) {
  const { enumDefault2 } = data;
  const checkedValue = parseOptionValue(data.default);
  const { value, color } = _.find(getOptions(data), item => item.key === head(checkedValue)) || {};
  const { direction } = getAdvanceSetting(data);
  return (
    <CommonDisplay>
      {value ? (
        <OptionWrap
          className={cx({
            light: isLightColor(color),
            withoutColor: enumDefault2 !== 1,
            horizontal: direction !== '1',
          })}
          color={color}>
          {value}
        </OptionWrap>
      ) : (
        <span>{_l('请选择')}</span>
      )}
      <i className="icon-arrow-down-border"></i>
    </CommonDisplay>
  );
}
