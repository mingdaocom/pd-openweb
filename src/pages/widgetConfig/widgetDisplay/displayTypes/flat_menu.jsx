import React from 'react';
import cx from 'classnames';
import { identity, includes } from 'lodash';
import { Radio } from 'ming-ui/antd-components';
import autoSize from 'ming-ui/components/AutoSize';
import { getItemOptionWidth } from 'src/pages/widgetConfig/util/editorSetting';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { getOptions } from 'src/utils/domain/control/options';
import { isLightColor } from 'src/utils/domain/control/style';
import { OptionsWrap, OptionWrap } from '../../styled';

function FlatMenu({ data, fromType }) {
  const { direction = '2', width = '200', defsource } = getAdvanceSetting(data);
  const checkedValue = safeParse(defsource || '[]')
    .map(item => item.staticValue)
    .filter(identity);
  const params = { $direction: direction, $width: width };

  return (
    <OptionsWrap
      className={cx({
        horizontal: direction !== '1',
      })}
      {...params}
      style={{ paddingLeft: '2px' }}
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
              $color={item.color}
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
