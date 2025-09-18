import React, { createRef, useEffect, useState } from 'react';
import { Dropdown } from 'antd';
import cx from 'classnames';
import update from 'immutability-helper';
import { find, head, includes, isEmpty } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import { DropdownContent, SettingItem } from '../../../../styled';
import { getOptions, handleAdvancedSettingChange } from '../../../../util/setting';
import { DynamicInput, OtherField, SelectOtherField } from '../components';
import { OptionControl } from '../styled';

export const DefaultOptionSetting = styled(SettingItem)`
  .holder {
    height: 34px;
  }
  .colorWrap {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 6px;
    flex-shrink: 0;
  }
  .content {
    display: flex;
  }
  .defaultOptionsWrap {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 0 12px 5px 12px;
    border: 1px solid #ddd;
    border-radius: 3px;
    min-height: 36px;
    flex: 1;
    margin-right: 36px;
    width: 264px;
  }
`;

export const DefaultOptionsMenu = styled(DropdownContent)`
  max-height: 500px;
  overflow: auto;
  width: 300px;
  .clearDefault {
    line-height: 36px;
    padding: 0 12px;
    color: #9e9e9e;
  }
  .optionItem {
    display: flex;
    align-items: center;
    line-height: 36px;
    padding: 0 12px;
    cursor: pointer;
    transition: background-color 0.25s;
    &:hover {
      background-color: #f5f5f5;
    }

    &.checked {
      background-color: #e8f5ff;
    }
    .text {
      flex: 1;
    }
    i {
      font-size: 18px;
      color: #1677ff;
    }
  }
  .colorWrap {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 6px;
  }
  .emptyOption {
    border-top: 1px solid rgba(0, 0, 0, 0.09);
    height: 0;
    margin: 6px 0;
  }
`;

export default function DefaultOptions(props) {
  const { data, dynamicValue, onDynamicValueChange, onChange, defaultType, from } = props;
  const { type, default: defaultValue, enumDefault2, controlId } = data;
  const [visible, setVisible] = useState(false);
  const checkedValue = dynamicValue.map(item => item.staticValue);
  const colorful = enumDefault2 === 1;
  let options = getOptions(data);

  if (from === DYNAMIC_FROM_MODE.FAST_FILTER && _.get(data, 'advancedSetting.shownullitem') === '1') {
    options = [
      {
        // color: '#C9E6FC',
        hide: false,
        index: 0,
        isDeleted: false,
        key: 'isEmpty',
        score: 0,
        value: _.get(data, 'advancedSetting.nullitemname') || _l('为空'),
      },
    ].concat(options);
  }
  const isMulti = data.type === 10;
  const $wrap = createRef(null);

  useEffect(() => {
    // 有default老配置的
    if (defaultValue) {
      const defaultOptions = safeParse(defaultValue);
      const arr = defaultOptions.map(v => ({ rcid: '', cid: '', staticValue: v })) || [];
      onChange({
        ...handleAdvancedSettingChange(data, {
          defsource: JSON.stringify(arr),
          defaulttype: '',
          defaultfunc: '',
          dynamicsrc: '',
        }),
        default: '',
      });
    }
  }, [controlId]);

  const switchChecked = key => {
    if (isMulti) {
      if (from === DYNAMIC_FROM_MODE.FAST_FILTER) {
        if (key === 'isEmpty') {
          onDynamicValueChange([{ rcid: '', cid: '', staticValue: key }]);
          return;
        }
        if (checkedValue.includes('isEmpty')) {
          if (checkedValue.includes(key)) {
            const values = dynamicValue.filter(item => ['isEmpty', key].includes(item.staticValue));
            onDynamicValueChange(values);
            return;
          } else {
            const filteredValue = dynamicValue.filter(item => item.staticValue !== 'isEmpty');
            onDynamicValueChange(filteredValue.concat({ rcid: '', cid: '', staticValue: key }));
            return;
          }
        }
      }
      if (checkedValue.includes(key)) {
        const index = dynamicValue.findIndex(item => item.staticValue === key);
        onDynamicValueChange(update(dynamicValue, { $splice: [[index, 1]] }));
      } else {
        onDynamicValueChange(dynamicValue.concat({ rcid: '', cid: '', staticValue: key }));
      }
    } else {
      onDynamicValueChange([{ rcid: '', cid: '', staticValue: key }]);
      setVisible(false);
    }
  };

  const removeItem = ({ cid, rcid, staticValue }) => {
    const index = dynamicValue.findIndex(
      item => item.cid === cid && item.rcid === rcid && item.staticValue === staticValue,
    );
    if (index > -1) {
      onDynamicValueChange(update(dynamicValue, { $splice: [[index, 1]] }));
    }
  };

  const handleFieldClick = data => {
    if (isMulti && _.get(data, '[0].rcid') !== 'url') {
      const value = head(data) || {};
      if (value.cid) {
        const isExist = dynamicValue.some(item => item.cid === value.cid && item.rcid === value.rcid);
        if (isExist) return;
      }
      onDynamicValueChange(dynamicValue.concat(data));
    } else {
      onDynamicValueChange(data);
    }
  };

  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };

  return (
    <DefaultOptionSetting className="mTop0">
      {defaultType ? (
        <DynamicInput {...props} onTriggerClick={onTriggerClick} />
      ) : (
        <div className="content">
          <Dropdown
            trigger={['click']}
            visible={visible}
            onVisibleChange={setVisible}
            getPopupContainer={() => document.querySelector('.defaultOptionsWrap') || document.body}
            overlay={
              <DefaultOptionsMenu onClick={e => e.stopPropagation()}>
                <div
                  className="clearDefault hoverText"
                  onClick={() => {
                    onChange({ default: '' });
                    onDynamicValueChange([]);
                    setVisible(false);
                  }}
                >
                  {_l('清除')}
                </div>
                {options.map(({ key, color, value }) => {
                  const checked = includes(checkedValue, key);
                  const isEmpty = key === 'isEmpty' && from === DYNAMIC_FROM_MODE.FAST_FILTER;
                  return (
                    <>
                      {isEmpty && <div className="emptyOption" />}
                      <div className={cx('optionItem', { checked })} key={key} onClick={() => switchChecked(key)}>
                        {colorful && color && <div className="colorWrap" style={{ backgroundColor: color }}></div>}
                        <div className="text overflow_ellipsis">{value}</div>
                        {checked && <i className="icon-done"></i>}
                      </div>
                      {isEmpty && <div className="emptyOption" />}
                    </>
                  );
                })}
              </DefaultOptionsMenu>
            }
          >
            <div className="defaultOptionsWrap">
              {dynamicValue.map(({ cid, rcid, staticValue }) => {
                if (cid) {
                  return (
                    <OtherField
                      {...props}
                      item={{ cid, rcid }}
                      className={cx({ singleOption: includes([9, 11], type) })}
                    />
                  );
                }
                if (staticValue) {
                  const option = find(options, item => item.key === staticValue) || {};
                  return (
                    <OptionControl className={cx('option pointer overflow_ellipsis', { isDeleted: isEmpty(option) })}>
                      {colorful && option.color && (
                        <div className="colorWrap" style={{ backgroundColor: option.color }}></div>
                      )}
                      <div className="text overflow_ellipsis">{option.value || _l('已删除')}</div>
                      <i
                        className="icon-close"
                        onClick={e => {
                          e.stopPropagation();
                          removeItem({ cid, rcid, staticValue });
                        }}
                      ></i>
                    </OptionControl>
                  );
                }
                return null;
              })}
            </div>
          </Dropdown>
        </div>
      )}
      <SelectOtherField {...props} onDynamicValueChange={handleFieldClick} ref={$wrap} />
    </DefaultOptionSetting>
  );
}
