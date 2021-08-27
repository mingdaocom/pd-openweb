import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { Radio } from 'ming-ui';
import { isLightColor } from 'src/util';
import cx from 'classnames';
import { OptionsWrap, OptionWrap } from '../../styled';
import { getOptions, getAdvanceSetting, parseOptionValue } from '../../util/setting';
import { includes } from 'lodash';

export default function FlatMenu({ data }) {
  const { direction = '0' } = getAdvanceSetting(data);
  const checkedValue = parseOptionValue(data.default);
  return (
    <OptionsWrap
      className={cx({
        horizontal: direction !== '1',
      })}>
      {getOptions(data).map(item => (
        <div key={item.key} className="option">
          <Radio checked={includes(checkedValue, item.key)} />
          <OptionWrap
            className={cx({
              light: isLightColor(item.color),
              withoutColor: data.enumDefault2 !== 1,
              horizontal: direction !== '1',
            })}
            color={item.color}>
            {item.value}
          </OptionWrap>
        </div>
      ))}
    </OptionsWrap>
  );
}
