import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown, Icon, Input, RadioGroup, Textarea } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { OPTION_COLORS_LIST } from 'src/pages/widgetConfig/config/index.js';
import { ALL_WIDGETS_TYPE, WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import {
  ALLOW_ITEM_TYPES,
  BOOLEAN_ITEM_DEFAULT,
  BOOLEAN_SHOW_ITEM_TYPES,
  controlKeyNames,
  controlKeys,
  controlTypeList,
  MULTI_SELECT_DISPLAY,
  PARAM_TYPES,
  SHOW_ITEM_TYPES,
} from './config';
import { Wrap } from './editStyle';

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
  const keys =
    controlKeys[
      (
        PARAM_TYPES.find(
          o => o.type === info.type && (!info.sourceControlType || o.sourceControlType === info.sourceControlType),
        ) || {}
      ).fieldId
    ] || [];
  const renderContent = o => {
    const renderTitle = o => {
      return <div className="title mTop24">{controlKeyNames[o]}</div>;
    };
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
        if (
          ['max'].includes(o) &&
          info.type === 200 &&
          info.sourceControlType !== 29 &&
          _.get(info, 'advancedSetting.allowitem') != '1'
        ) {
          return;
        }
        if (info.type === 6 && ['defsource'].includes(o)) {
          return (
            <React.Fragment>
              {renderTitle(o)}
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
            </React.Fragment>
          );
        }
        if (['max', 'dot'].includes(o)) {
          return (
            <React.Fragment>
              {renderTitle(o)}
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
            </React.Fragment>
          );
        }
        if (info.type === 36 && ['defsource'].includes(o)) {
          return (
            <React.Fragment>
              {renderTitle(o)}
              <RadioGroup
                checkedValue={staticValue}
                className="mTop8"
                data={BOOLEAN_ITEM_DEFAULT}
                onChange={value => {
                  changeDef(value);
                }}
              />
            </React.Fragment>
          );
        }
        return (
          <React.Fragment>
            {renderTitle(o)}
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
                let value = ((['controlName', 'desc', 'des'].includes(o) ? info[o] : staticValue) || '').trim();
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
          </React.Fragment>
        );

      case 'fieldId':
        return (
          <React.Fragment>
            <div className="title mTop24">
              {_l('变量 id')}
              <span className="Red">*</span>
            </div>
            <div className="fieldIdCon mTop8">{info.fieldId}</div>
          </React.Fragment>
        );
      case 'allowitem':
      case 'checktype':
      case 'direction':
      case 'showtype':
        if (info.type === 11 && ['direction'].includes(o) && _.get(info, 'advancedSetting.checktype') !== '1') {
          //枚举值  显示方式非平铺 不显示排列方式
          return;
        }
        if (info.type === 200 && info.sourceControlType === 29) {
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
          <React.Fragment>
            {renderTitle(o)}
            <RadioGroup
              checkedValue={
                _.get(info, ['advancedSetting', o]) === '1' ? '1' : dataList.find(a => a.value !== '1').value
              }
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
          </React.Fragment>
        );
      case 'controls':
      case 'showControls':
        if (info.type === 200 && info.sourceControlType === 29 && o === 'controls') return;
        let values = _.get(info, [o]) || [];
        return (
          <React.Fragment>
            {renderTitle(o)}
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
                      {isCur && <Icon icon="done" className="Relative ThemeColor3 Font18" />}
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
          </React.Fragment>
        );

      case 'options':
        let options = info[o];
        return (
          <React.Fragment>
            {renderTitle(o)}
            <React.Fragment>
              <Textarea
                className="mTop8 Font13"
                name="textarea"
                style={{ maxHeight: '108px' }}
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
          <span className="flex Font16 Bold">
            {
              PARAM_TYPES.find(
                o =>
                  o.type === info.type && (!info.sourceControlType || info.sourceControlType === o.sourceControlType),
              ).paramName
            }
          </span>
          <Icon icon={'close'} className="Font20 Hand Gray_9e ThemeHoverColor3" onClick={() => onClose()} />
        </div>
        <div className="flex editCon">
          {keys.map(o => {
            return <React.Fragment>{renderContent(o)}</React.Fragment>;
          })}
        </div>
      </div>
    </Wrap>
  );
}

export default withClickAway(Edit);
