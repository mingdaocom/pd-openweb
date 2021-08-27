import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { Checkbox } from 'ming-ui';
import { isLightColor } from 'src/util';
import cx from 'classnames';
import styled from 'styled-components';
import { OptionsWrap, OptionWrap, CommonDisplay } from '../../styled';
import { getAdvanceSetting, getOptions, parseOptionValue } from '../../util/setting';
import { find } from 'lodash';

const MultiSelectDrop = styled(CommonDisplay)`
  min-height: 34px;
  height: auto;
  .optionsWrap {
    display: flex;
    flex-wrap: wrap;
    max-height: 100%;
    overflow: hidden;
    padding-bottom: 4px;
  }
  .optionItem {
    margin: 4px 6px 0 0;
  }
`;

export default function MultiSelect({ data }) {
  const { options } = data;
  const { direction, checktype = '0' } = getAdvanceSetting(data);
  const checkedValue = parseOptionValue(data.default);
  if (checktype === '1') {
    return (
      <MultiSelectDrop>
        <div className="optionsWrap">
          {checkedValue.map(id => {
            const item = find(options, option => option.key === id) || {};
            return (
              <OptionWrap
                className={cx('optionItem', {
                  light: isLightColor(item.color),
                  withoutColor: data.enumDefault2 !== 1,
                })}
                color={item.color}>
                {item.value}
              </OptionWrap>
            );
          })}
        </div>
        <i className="icon-expand_more"></i>
      </MultiSelectDrop>
    );
  }
  return (
    <OptionsWrap
      className={cx({
        horizontal: direction !== '1',
      })}>
      {getOptions(data).map(item => (
        <div key={item.key} className="option">
          <Checkbox checked={checkedValue.includes(item.key)} />
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
