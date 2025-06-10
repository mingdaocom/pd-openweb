import React from 'react';
import cx from 'classnames';
import { includes } from 'lodash';
import { Radio } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import { isLightColor } from 'src/utils/control';
import { OptionsWrap, OptionWrap } from '../../styled';
import { getAdvanceSetting, getItemOptionWidth, getOptions, parseOptionValue } from '../../util/setting';

function FlatMenu({ data, fromType }) {
  const { direction = '2', width = '200' } = getAdvanceSetting(data);
  const checkedValue = parseOptionValue(data.default);
  const params = { direction, width };

  return (
    <OptionsWrap
      className={cx({
        horizontal: direction !== '1',
      })}
      {...params}
    >
      {getOptions(data).map(item => (
        <div
          key={item.key}
          className="option"
          style={direction === '0' ? { width: `${getItemOptionWidth(data, fromType)}%` } : {}}
        >
          <div className="optionItem">
            <Radio checked={includes(checkedValue, item.key)} />
            <OptionWrap
              className={cx({
                light: isLightColor(item.color),
                withoutColor: data.enumDefault2 !== 1,
                horizontal: direction !== '1',
              })}
              color={item.color}
              {...params}
            >
              {item.value}
            </OptionWrap>
          </div>
        </div>
      ))}
    </OptionsWrap>
  );
}

export default autoSize(FlatMenu);
