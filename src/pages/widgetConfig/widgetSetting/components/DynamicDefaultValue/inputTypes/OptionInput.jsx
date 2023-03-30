import React, { useState, useEffect, createRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Dropdown } from 'antd';
import update from 'immutability-helper';
import { DropdownContent, SettingItem } from '../../../../styled';
import { find, head, includes, isEmpty } from 'lodash';
import { SelectOtherField, OtherField, DynamicInput } from '../components';
import { getOptions } from '../../../../util/setting';

export const DefaultOptionSetting = styled(SettingItem)`
  .holder {
    height: 34px;
  }
  .colorWrap {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 6px;
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
    min-height: 36px;
    flex: 1;
    margin-right: 36px;
    .option {
      display: flex;
      align-items: center;
      height: 24px;
      background: #eee;
      margin: 4px 6px 0 0;
      padding: 0 10px;
      border-radius: 12px;
      &.isDeleted {
        .text,
        i {
          color: #9e9e9e;
        }
      }
      .text {
        margin-right: 4px;
      }
    }
  }
`;

export const DefaultOptionsMenu = styled(DropdownContent)`
  max-height: 500px;
  overflow: auto;
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
      color: #2196f3;
    }
  }
  .colorWrap {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 6px;
  }
`;

export default function DefaultOptions(props) {
  const { data, dynamicValue, onDynamicValueChange, clearOldDefault, onChange, defaultType } = props;
  const { type, default: defaultValue, enumDefault2 } = data;
  const [visible, setVisible] = useState(false);
  const checkedValue = dynamicValue.map(item => item.staticValue);
  const colorful = enumDefault2 === 1;
  const options = getOptions(data);
  const isMulti = data.type === 10;
  const $wrap = createRef(null);

  useEffect(() => {
    if (defaultValue) {
      const defaultOptions = JSON.parse(defaultValue);
      const arr = defaultOptions.map(v => ({ rcid: '', cid: '', staticValue: v })) || [];
      onChange({ default: '' });
      onDynamicValueChange(arr);
      clearOldDefault();
    }
  }, []);

  const switchChecked = key => {
    if (isMulti) {
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
    if (isMulti) {
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
    <DefaultOptionSetting>
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
                  {_l('清除默认值')}
                </div>
                {options.map(({ key, color, value }) => {
                  const checked = includes(checkedValue, key);
                  return (
                    <div className={cx('optionItem', { checked })} key={key} onClick={() => switchChecked(key)}>
                      {colorful && color && <div className="colorWrap" style={{ backgroundColor: color }}></div>}
                      <div className="text">{value}</div>
                      {checked && <i className="icon-done"></i>}
                    </div>
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
                    <div className={cx('option pointer', { isDeleted: isEmpty(option) })}>
                      {colorful && option.color && (
                        <div className="colorWrap" style={{ backgroundColor: option.color }}></div>
                      )}
                      <div className="text">{option.value || _l('已删除')}</div>
                      <i
                        className="icon-close"
                        onClick={e => {
                          e.stopPropagation();
                          removeItem({ cid, rcid, staticValue });
                        }}
                      ></i>
                    </div>
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
