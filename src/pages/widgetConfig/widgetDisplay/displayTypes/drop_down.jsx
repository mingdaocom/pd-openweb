import React from 'react';
import cx from 'classnames';
import _, { head } from 'lodash';
import { Steps } from 'ming-ui';
import { isLightColor } from 'src/utils/control';
import { CommonDisplay, OptionWrap } from '../../styled';
import { getAdvanceSetting, getOptions } from '../../util/setting';

export default function Dropdown({ data }) {
  const { enumDefault2, hint } = data;
  const { direction, showtype, defsource } = getAdvanceSetting(data);
  const checkedValue = safeParse(defsource || '[]')
    .map(item => item.staticValue)
    .filter(_.identity);
  const { value, color, key: checkedKey } = _.find(getOptions(data), item => item.key === head(checkedValue)) || {};

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
