import React, { Fragment } from 'react';
import cx from 'classnames';
import { find } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui/antd-components';
import autoSize from 'ming-ui/components/AutoSize';
import { getItemOptionWidth } from 'src/pages/widgetConfig/util/editorSetting';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { getOptions } from 'src/utils/domain/control/options';
import { isLightColor } from 'src/utils/domain/control/style';
import { CommonDisplay, OptionsWrap, OptionWrap } from '../../styled';

const CHECKBOX_LABEL_STYLES = {
  label: {
    paddingInlineEnd: 0,
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: '24px',
  },
};

const MultiSelectDrop = styled(CommonDisplay)`
  min-height: 34px;
  height: auto;
  .optionsWrap {
    display: flex;
    flex-wrap: wrap;
    max-height: 100%;
    overflow: hidden;
  }
  .optionItem {
    margin: 4px 6px 0 0;
  }
`;

function MultiSelect({ data, fromType }) {
  const { options, hint } = data;
  const { direction = '2', checktype = '0', width = '200', defsource } = getAdvanceSetting(data);
  const checkedValue = safeParse(defsource || '[]')
    .map(item => item.staticValue)
    .filter(_.identity);
  const params = { $direction: direction, $width: width };

  if (checktype === '1') {
    return (
      <MultiSelectDrop>
        <div className="optionsWrap">
          {_.isEmpty(checkedValue) ? (
            <span>{hint || _l('请选择')}</span>
          ) : (
            <Fragment>
              {checkedValue.map(id => {
                const item = find(options, option => option.key === id) || {};
                return (
                  <OptionWrap
                    className={cx('optionItem', {
                      light: isLightColor(item.color),
                      withoutColor: data.enumDefault2 !== 1,
                    })}
                    $color={item.color}
                  >
                    {item.value}
                  </OptionWrap>
                );
              })}
            </Fragment>
          )}
        </div>
        <i className="icon-expand_more"></i>
      </MultiSelectDrop>
    );
  }

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
            <Checkbox checked={checkedValue.includes(item.key)} styles={CHECKBOX_LABEL_STYLES}>
              <OptionWrap
                as="span"
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
            </Checkbox>
          </div>
        </div>
      ))}
    </OptionsWrap>
  );
}

export default autoSize(MultiSelect);
