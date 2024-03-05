import React, { Fragment } from 'react';
import { string } from 'prop-types';
import { Checkbox } from 'ming-ui';
import { isLightColor } from 'src/util';
import cx from 'classnames';
import styled from 'styled-components';
import { OptionsWrap, OptionWrap, CommonDisplay } from '../../styled';
import { getAdvanceSetting, getOptions, parseOptionValue, getItemOptionWidth } from '../../util/setting';
import { find } from 'lodash';
import autoSize from 'ming-ui/decorators/autoSize';

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
