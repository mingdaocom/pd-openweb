import React from 'react';
import cx from 'classnames';
import { get, head } from 'lodash';
import styled from 'styled-components';
import { Steps } from 'ming-ui';
import { isLightColor } from 'src/utils/control';
import { CommonDisplay, OptionWrap } from '../../styled';
import { getAdvanceSetting, getOptions, parseOptionValue } from '../../util/setting';

const ScalePoint = styled.span`
  cursor: pointer;
  position: absolute;
  background: #fff;
  top: -1px;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 8px;
  border: 2px solid #2196f3;
  > span {
    user-select: none;
    white-space: nowrap;
    transform: translateX(calc(-50% + 2px));
    margin-top: 10px;
    display: inline-block;
  }
`;

export default function Dropdown({ data }) {
  const { enumDefault2, options = [], hint } = data;
  const checkedValue = parseOptionValue(data.default);
  const { value, color, key: checkedKey } = _.find(getOptions(data), item => item.key === head(checkedValue)) || {};
  const { direction, showtype } = getAdvanceSetting(data);

  if (showtype === '2') {
    return <Steps disabled={true} data={data} showTip={false} value={checkedKey} />;
  }

  return (
    <CommonDisplay>
      {value ? (
        <OptionWrap
          className={cx({
            light: isLightColor(color),
            withoutColor: enumDefault2 !== 1,
            horizontal: direction !== '1',
          })}
          color={color}
        >
          {value}
        </OptionWrap>
      ) : (
        <span>{hint || _l('请选择')}</span>
      )}
      <i className="icon-arrow-down-border"></i>
    </CommonDisplay>
  );
}
