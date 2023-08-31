import React from 'react';
import { string } from 'prop-types';
import { Radio } from 'ming-ui';
import { isLightColor } from 'src/util';
import cx from 'classnames';
import { OptionsWrap, OptionWrap } from '../../styled';
import { getOptions, getAdvanceSetting, parseOptionValue, getItemOptionWidth } from '../../util/setting';
import { includes } from 'lodash';
import autoSize from 'ming-ui/decorators/autoSize';

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
