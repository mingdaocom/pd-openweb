import React, { Fragment } from 'react';
import cx from 'classnames';
import { find } from 'lodash';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import { isLightColor } from 'src/utils/control';
import { CommonDisplay, OptionsWrap, OptionWrap } from '../../styled';
import { getAdvanceSetting, getItemOptionWidth, getOptions, parseOptionValue } from '../../util/setting';

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

function MultiSelect({ data, fromType }) {
  const { options, hint } = data;
  const { direction = '2', checktype = '0', width = '200' } = getAdvanceSetting(data);
  const checkedValue = parseOptionValue(data.default);
  const params = { direction, width };

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
                    color={item.color}
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
            <Checkbox checked={checkedValue.includes(item.key)} />
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

export default autoSize(MultiSelect);
