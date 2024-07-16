import React, { createRef, useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, Textarea, Dropdown, Input, RadioGroup } from 'ming-ui';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import withClickAway from 'ming-ui/decorators/withClickAway';
import {
  controlKeys,
  PARAM_TYPES,
  ALLOW_ITEM_TYPES,
  SHOW_ITEM_TYPES,
  controlKeyNames,
  BOOLEAN_SHOW_ITEM_TYPES,
  BOOLEAN_ITEM_DEFAULT,
  MULTI_SELECT_DISPLAY,
  controlTypeList,
} from './config';
import cx from 'classnames';
import _ from 'lodash';
import { OPTION_COLORS_LIST } from 'src/pages/widgetConfig/config/index.js';
import { ALL_WIDGETS_TYPE, WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

const Wrap = styled.div`
  .w120 {
    width: 120px !important;
  }
  input[type='number'] {
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      margin: 0;
      -webkit-appearance: none !important;
    }
  }
  .fieldIdCon {
    border: 1px solid #ddd;
    box-sizing: border-box;
    height: 36px;
    line-height: 36px;
    border-radius: 3px;
    padding: 0 12px;
    font-size: 14px;
    cursor: no-drop;
    background: #f5f5f5;
  }
  width: 400px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  box-shadow: 0px 8px 36px 1px rgba(0, 0, 0, 0.24);
  background: #fff;
  .con {
    height: 100%;
    .headerCon {
      border-bottom: 1px solid #ededed;
      padding: 0 24px;
      height: 55px;
      line-height: 55px;
    }
    .editCon {
      overflow: auto;
      padding: 0 24px 24px;
    }
  }
  .title {
    font-weight: 600;
  }
  .ming.Radio {
    flex: 1;
  }

  .paramControlDropdown {
    height: auto;
    min-height: 36px;
    .itemT {
      background: #f5f5f5;
      border-radius: 4px 4px 4px 4px;
      padding: 3px 8px 3px 10px;
      border: 1px solid #e0e0e0;
      i {
        color: #9e9e9e;
        &:hover {
          color: #757575;
        }
      }
    }
    .Dropdown--border,
    .dropdownTrigger .Dropdown--border {
      min-height: 36px !important;
      height: auto !important;
    }
    .Dropdown--input .value {
      display: flex !important;
      & > div {
        flex: 1 !important;
        display: flex !important;
        flex-flow: row wrap !important;
        gap: 5px;
      }
    }
  }
  .ming.Input,
  .Textarea {
    font-size: 13px;
    border: 1px solid #ddd;
    &:hover {
      border-color: #bbb;
    }
    &:focus {
      border-color: #2196f3;
    }
  }
  .cover {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
`;
const setOptions = values => {
  return values
    .split(/[\r\n]/)
    .filter(o => o.trim())
    .map((o, index) => {
      const item = o.split('=');
      return {
        key: item[0].trim(),
        value: (item[1] || '').trim() ? item[1].replace(/\[|\]/g, '').trim() || item[0].trim() : item[0].trim(),
        checked: false,
        isDeleted: false,
        index: index + 1,
        color: OPTION_COLORS_LIST[(index + 1) % OPTION_COLORS_LIST.length],
      };
    });
};
const getValue = (info, o) => {
  let staticValue = ['dot'].includes(o) ? _.get(info, [o]) : _.get(info, ['advancedSetting', o]);
  if (['defsource'].includes(o)) {
    staticValue = (safeParse(staticValue || '[]')[0] || {}).staticValue;
  }
  return staticValue;
};
function Edit(params) {
  const { onClose, onChange } = params;
  const [{ info, dropDownVisible }, setState] = useSetState({
    info: params.info,
    dropDownVisible: false,
  });
  const WIDGETS_TO_API_TYPE_ENUM_KEYS = Object.keys(ALL_WIDGETS_TYPE).filter(o =>
    controlTypeList.includes(WIDGETS_TO_API_TYPE_ENUM[o]),
  );
  let WIDGETS_TO_API_TYPE_ENUM_VALUESKEY = {};
  _.forEach(WIDGETS_TO_API_TYPE_ENUM, function (value, key) {
    WIDGETS_TO_API_TYPE_ENUM_VALUESKEY[value] = key;
  });
  useEffect(() => {
    setState({
      info: params.info || {},
    });
  }, [params]);
  const onUpdate = data => {
    onChange({ ...info, ...data });
  };
  const keys = controlKeys[(PARAM_TYPES.find(o => o.type === info.type) || {}).fieldId] || [];
  const renderContent = o => {
    switch (o) {
      case 'controlName':
      case 'desc':
      case 'des':
      case 'suffix':
      case 'defsource':
      case 'max':
      case 'dot':
        let staticValue = getValue(info, o);
        const changeDef = value => {
          setState({
            info: {
              ...info,
              advancedSetting: {
                ...info.advancedSetting,
                [o]: JSON.stringify([{ cid: '', rcid: '', staticValue: value }]),
              },
            },
          });
        };
        if (['max'].includes(o) && info.type === 200 && _.get(info, 'advancedSetting.allowitem') != '1') {
          return;
        }
        if (info.type === 6 && ['defsource'].includes(o)) {
          return (
            <Input
              type="number"
              className="w120 mTop8 placeholderColor"
              placeholder={_l('请输入数值')}
              value={(staticValue || '').toString()}
              onChange={value => {
                changeDef(value);
              }}
              onBlur={() => {
                onUpdate();
              }}
            />
          );
        }
        if (['max', 'dot'].includes(o)) {
          return (
            <InputValue
              className="w120 mTop8 placeholderColor"
              type={2}
              placeholder={_l('请输入数值')}
              value={(staticValue || '').toString()}
              onChange={value => {
                if (['max'].includes(o)) {
                  setState({
                    info: {
                      ...info,
                      advancedSetting: {
                        ...info.advancedSetting,
                        [o]: value,
                      },
                    },
                  });
                } else if (['dot'].includes(o)) {
                  setState({
                    info: {
                      ...info,
                      [o]: value,
                    },
                  });
                }
              }}
              onBlur={value => {
                if (['max'].includes(o)) {
                  onUpdate();
                } else if (['dot'].includes(o)) {
                  let dot = Number(value) > 12 ? 12 : value;
                  onUpdate({
                    dot,
                  });
                  setState({
                    info: {
                      ...info,
                      dot,
                    },
                  });
                }
              }}
            />
          );
        }
        if (info.type === 36 && ['defsource'].includes(o)) {
          return (
            <RadioGroup
              checkedValue={staticValue}
              className="mTop8"
              data={BOOLEAN_ITEM_DEFAULT}
              onChange={value => {
                changeDef(value);
              }}
            />
          );
        }
        return (
          <Input
            className="w100 mTop8 placeholderColor"
            defaultValue={['controlName', 'desc', 'des'].includes(o) ? info[o] : staticValue}
            placeholder={'desc' === o ? _l('请输入说明') : _l('请输入')}
            onChange={value => {
              if (['controlName', 'desc', 'des'].includes(o)) {
                setState({
                  info: { ...info, [o]: value },
                });
              } else if (['defsource'].includes(o)) {
                setState({
                  info: {
                    ...info,
                    advancedSetting: {
                      ...info.advancedSetting,
                      [o]: JSON.stringify([{ cid: '', rcid: '', staticValue: value }]),
                    },
                  },
                });
              } else {
                setState({
                  info: {
                    ...info,
                    advancedSetting: {
                      ...info.advancedSetting,
                      [o]: value,
                    },
                  },
                });
              }
            }}
            onBlur={e => {
              let value = (['controlName', 'desc', 'des'].includes(o) ? info[o] || '' : staticValue).trim();
              if (['controlName', 'desc', 'des'].includes(o)) {
                onUpdate({
                  [o]: value,
                });
              } else if (['defsource'].includes(o)) {
                changeDef(value);
              } else {
                onUpdate({
                  advancedSetting: {
                    ...info.advancedSetting,
                    [o]: value,
                  },
                });
              }
              e.stopPropagation();
            }}
          />
        );

      case 'fieldId':
        return <div className="fieldIdCon mTop8">{info.fieldId}</div>;
      case 'allowitem':
      case 'checktype':
      case 'direction':
      case 'showtype':
        if (info.type === 11 && ['direction'].includes(o) && _.get(info, 'advancedSetting.checktype') !== '1') {
          //枚举值  显示方式非平铺 不显示排列方式
          return;
        }
        let dataList = ALLOW_ITEM_TYPES;
        if (o === 'checktype') {
          dataList = SHOW_ITEM_TYPES;
        }
        if (o === 'direction') {
          dataList = MULTI_SELECT_DISPLAY;
        }
        if (info.type === 36) {
          dataList = BOOLEAN_SHOW_ITEM_TYPES;
        }
        return (
          <RadioGroup
            checkedValue={_.get(info, ['advancedSetting', o]) === '1' ? '1' : dataList.find(a => a.value !== '1').value}
            className="mTop8"
            data={dataList}
            onChange={value => {
              onUpdate({
                advancedSetting: {
                  ...info.advancedSetting,
                  [o]: value,
                },
              });
            }}
          />
        );
      case 'controls':
        let values = _.get(info, [o]) || [];
        return (
          <div className="">
            <Dropdown
              selectClose={false}
              placeholder={_l('请选择')}
              className={cx('w100 mTop8 paramControlDropdown', {
                hs: values.length > 0,
              })}
              renderItem={item => {
                if (item.value === 'all') {
                  return <div className={'itemText Hand forAll flexRow alignItemsCenter'}>{item.text}</div>;
                }
                const isCur = !!values.includes(WIDGETS_TO_API_TYPE_ENUM[item.value] + '');
                return (
                  <div
                    className={cx('itemText flexRow alignItemsCenter', {
                      isCur,
                    })}
                  >
                    <Icon icon={ALL_WIDGETS_TYPE[item.value].icon} className="Font18 Relative" />
                    <span className="mLeft10 flex Gray">{item.text}</span>
                    {isCur && <Icon icon="done_2" className="Relative ThemeColor3 Font18" />}
                  </div>
                );
              }}
              popupVisible={dropDownVisible}
              onVisibleChange={visible => setState({ dropDownVisible: visible })}
              value={values.length <= 0 ? undefined : values}
              onChange={value => {
                let data = [];
                if (!value) {
                  data = [];
                } else if (value == 'all') {
                  data = WIDGETS_TO_API_TYPE_ENUM_KEYS.map(o => WIDGETS_TO_API_TYPE_ENUM[o] + '');
                } else if (values.includes(WIDGETS_TO_API_TYPE_ENUM[value] + '')) {
                  data = values.filter(o => o !== WIDGETS_TO_API_TYPE_ENUM[value] + '');
                } else {
                  data = [...values, WIDGETS_TO_API_TYPE_ENUM[value] + ''];
                }
                onUpdate({
                  [o]: data,
                });
              }}
              renderTitle={() => {
                return (
                  <div className="">
                    {(values || []).map(it => {
                      return (
                        <div className="itemT InlineBlock">
                          {ALL_WIDGETS_TYPE[WIDGETS_TO_API_TYPE_ENUM_VALUESKEY[it]].widgetName}
                          <Icon
                            icon={'close'}
                            className="Hand mLeft3"
                            onClick={e => {
                              e.stopPropagation();
                              let data = values.filter(a => a !== it);
                              onUpdate({
                                [o]: data,
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              }}
              border
              menuClass={'paramControlDropdownMenu paramControlDropdownMenuSet'}
              cancelAble
              isAppendToBody
              openSearch
              data={[
                { value: 'all', text: _l('全部') },
                ...WIDGETS_TO_API_TYPE_ENUM_KEYS.map(o => {
                  return { ...o, value: o, text: (ALL_WIDGETS_TYPE[o] || {}).widgetName };
                }),
              ]}
            />
          </div>
        );

      case 'options':
        let options = info[o];
        return (
          <React.Fragment>
            <Textarea
              className="mTop8 Font13"
              name="textarea"
              style={{ maxHeight: '108px', maxHeight: '108px' }}
              defaultValue={options.reduce(
                (p, c, i) => (i === options.length - 1 ? `${p}${c.key}=[${c.value}]` : `${p}${c.key}=[${c.value}]\n`),
                '',
              )}
              onBlur={e => {
                onUpdate();
                e.stopPropagation();
              }}
              onChange={values => {
                setState({
                  info: {
                    ...info,
                    [o]: setOptions(values),
                    advancedSetting: {
                      ...info.advancedSetting,
                      defsource: JSON.stringify([
                        { cid: '', rcid: '', staticValue: (setOptions(values)[0] || {}).key },
                      ]),
                    },
                  },
                });
              }}
            />
            <p className="Gray_75 mAll0">
              {_l(
                '输入选项值（每行一个），第一个作为默认值。可设置选项显示名，使用 选项值=[显示名] 表示，如：0=[填充]；1=[完整显示]',
              )}
            </p>
          </React.Fragment>
        );
      // case 'norange':
      //   return (
      //     <Checkbox
      //       size="small"
      //       checked={info[o]}
      //       onClick={() => {}}
      //       className="InlineBlock mLeft16 LineHeight36 TxtMiddle"
      //     >
      //       <span>{_l('不限')}</span>
      //     </Checkbox>
      //   );
      default:
        break;
    }
  };
  return (
    <Wrap className="">
      <div className="con flexColumn">
        <div className="headerCon Bold flexRow alignItemsCenter">
          <span className="flex Font16 Bold">{PARAM_TYPES.find(o => o.type === info.type).paramName} </span>
          <Icon icon={'close'} className="Font20 Hand Gray_9e ThemeHoverColor3" onClick={() => onClose()} />
        </div>
        <div className="flex editCon">
          {keys.map(o => {
            return (
              <React.Fragment>
                {['norange'].includes(o) ||
                (['max'].includes(o) && info.type === 200 && _.get(info, 'advancedSetting.allowitem') != '1') ||
                (info.type === 11 &&
                  ['direction'].includes(o) &&
                  _.get(info, 'advancedSetting.checktype') !== '1') ? null : (
                  <div className="title mTop24">
                    {o === 'fieldId' ? (
                      <React.Fragment>
                        {_l('变量 id ')}
                        <span className="Red">*</span>
                      </React.Fragment>
                    ) : (
                      controlKeyNames[o]
                    )}
                  </div>
                )}
                {renderContent(o)}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Wrap>
  );
}

export default withClickAway(Edit);
