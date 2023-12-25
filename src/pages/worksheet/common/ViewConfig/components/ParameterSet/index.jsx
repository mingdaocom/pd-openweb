import _ from 'lodash';
import React, { createRef, useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import CustomFields from 'src/components/newCustomFields';
import { Icon, Dropdown } from 'ming-ui';
import cx from 'classnames';
import { getIconByType } from 'src/pages/widgetConfig/util';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { UN_TEXT_TYPE } from 'src/components/newCustomFields/tools/config.js';
const Wrap = styled.div`
  .emptyCon {
    width: 130px;
    height: 130px;
    background: #f5f5f5;
    border-radius: 50%;
    text-align: center;
    margin: 170px auto 0;
    i {
      font-size: 70px;
      color: #bdbdbd;
    }
  }
  .customFormLine {
    display: none !important;
  }
  .customFieldsContainer .customFormItemControl .customFormControlBox {
    background: #fff;
    border-color: #ddd;
    &:not(.controlDisabled):hover {
      background: #fff;
      border-color: #ccc;
    }
  }
  .customAntSelect:not(.ant-select-open):not(.ant-select-disabled) .ant-select-selector {
    background: #fff !important;
    border-color: #ddd !important;
    &:hover {
      border-color: #ccc !important;
      background: #fff !important;
    }
  }
  .customFieldsContainer .customFormItemControl > .ming.Dropdown .Dropdown--border:not(:hover):not(.active),
  .customFieldsContainer .customFormItemControl .sortColumnWrap .Dropdown--input,
  .customFieldsContainer .customFormItemControl > .ming.Dropdown .Dropdown--border:hover,
  .customFieldsContainer .customFormItemControl > .ming.Dropdown .Dropdown--border.active {
    border-color: #ddd !important;
    &:hover {
      border-color: #ccc !important;
    }
  }
  .conCustomFields {
    .customFieldsContainer .customFormItem {
      padding: 0px 12px;
    }
    padding-top: 10px;
    &.conCustomFields_boolean {
      padding-top: 16px;
    }
    &.conCustomFields_enum {
      .RadioGroupCon .Radio {
        word-break: break-all;
      }
    }
    .customFieldsContainer .customFormItemControl .customFormControlBox.customFormControlSwitch .Checkbox {
      margin-top: 0px;
    }
  }
`;

const CustomControlDrop = props => {
  let { value, advancedSetting = {}, controls = [], worksheetControls = [] } = props;
  const { max } = advancedSetting;
  let allTypes = [];
  controls.map(o => {
    switch (o) {
      // case 'DROP_DOWN':
      case '11': //单选
        allTypes = [...allTypes, 9, 11];
        break;
      case '15': //日期
        allTypes = [...allTypes, 15, 16];
        break;
      case '3': //电话
        allTypes = [...allTypes, 3, 4];
        break;
      case '24': //地区
        allTypes = [...allTypes, 19, 23, 24];
        break;
      case '31': //公式
        allTypes = [...allTypes, 31, 38];
        break;
      default:
        allTypes = [...allTypes, Number(o)];
        break;
    }
  });
  const allColumns = worksheetControls.filter(o => allTypes.includes(o.type));
  //多选
  if (_.get(props, 'advancedSetting.allowitem') === '1') {
    return (
      <div className="">
        <SortColumns
          //关联表的设置 可拖拽排序
          noempty={false} //不需要至少显示一列
          controlsSorts={value}
          showControls={value}
          columns={allColumns}
          empty={<div className="Gray_9e">{_l('请选择')}</div>}
          placeholder={_l('搜索')}
          onChange={({ newControlSorts, newShowControls }) => {
            let data = [];
            newControlSorts.map(it => {
              data = data.concat(allColumns.find(o => it === o.controlId));
            });
            let showControls = max ? newShowControls.slice(0, max) : newShowControls;
            data = data.filter(o => showControls.includes(o.controlId));
            props.onChange(data.map(o => o.controlId));
            if (max && newShowControls.length > max) {
              alert(_l('显示字段最多只能设置%0个', max), 3);
            }
          }}
        />
      </div>
    );
  }
  return (
    <Dropdown
      placeholder={_l('请选择')}
      className={cx('w100 paramControlDropdown')}
      renderItem={(item = {}) => {
        return (
          <div className={cx('itemText', { isCur: allColumns.find(it => it.controlId === item.controlId) })}>
            <Icon icon={getIconByType(item.type, false)} className="Font18" />
            <span className="mLeft20">{item.controlName}</span>
          </div>
        );
      }}
      noData={_l('当前工作表中没有可选字段，请先去添加一个')}
      value={!value || value.length <= 0 ? undefined : value[0]}
      onChange={value => {
        let data = [];
        if (!value) {
          data = [];
        } else {
          data = [value];
        }
        props.onChange(data);
      }}
      renderTitle={() => {
        let data = (value || [])[0];
        let item = allColumns.find(it => it.controlId === data);
        return (
          <div className="flexRow alignItemsCenter">
            <Icon icon={getIconByType((item || {}).type, false)} className="Font16 Gray_9e" />
            <span className="mLeft5">{(item || {}).controlName}</span>
          </div>
        );
      }}
      border
      menuClass={'paramControlDropdownMenu'}
      cancelAble
      isAppendToBody
      openSearch
      data={allColumns.map(o => {
        return { ..._.omit(o, ['icon']), value: o.controlId, text: o.controlName };
      })}
    />
  );
};
export default function ParameterSet(params) {
  const { view = {}, onChangeView, worksheetControls } = params;
  const [{ paramSettings }, setState] = useSetState({
    paramSettings: [],
  });
  useEffect(() => {
    const paramSettings = _.get(params, 'view.pluginInfo.paramSettings') || [];
    let data = paramSettings.map((o, i) => {
      const plugin_map = _.get(params, 'view.advancedSetting.plugin_map');
      const pluginMapValue = safeParse(plugin_map)[o.fieldId];
      let d = {
        ...o,
        controlId: o.fieldId,
        advancedSetting: {
          ...o.advancedSetting,
          hinttype: '2',
          titlecolor: '#333333ff',
          titlestyle: '1000',
          hidetitle: !o.controlName ? '1' : '',
        },
        value: pluginMapValue,
        row: i + 1,
      };
      if (d.type === 36) {
        let staticValue = (safeParse(_.get(o, 'advancedSetting.defsource') || '[]')[0] || {}).staticValue;
        d = {
          ...d,
          hint: d.des,
          switchSize: d.advancedSetting.showtype !== '1' ? 'default' : 'small',
          advancedSetting: {
            ...d.advancedSetting,
            defsource: JSON.stringify([
              {
                ...(safeParse(_.get(d, 'advancedSetting.defsource') || '[]')[0] || {}),
                staticValue: staticValue ? '1' : '0',
              },
            ]),
          },
        };
        if ([true, false].includes(d.value)) {
          d = { ...d, value: d.value ? '1' : '0' };
        }
        if (d.advancedSetting.showtype === '1') {
          d = {
            ...d,
            advancedSetting: {
              ...d.advancedSetting,
              itemnames: JSON.stringify([
                { key: '1', value: o.des },
                { key: '0', value: o.des },
              ]),
            },
          };
        }
      }
      //数值
      if (d.type === 6) {
        d = {
          ...d,
          advancedSetting: {
            ...d.advancedSetting,
            roundtype: '2',
          },
        };
      }
      if ([9, 10, 11].includes(d.type)) {
        d = {
          ...d,
          advancedSetting: {
            ...d.advancedSetting,
            showtype: d.advancedSetting.checktype,
          },
          type: d.advancedSetting.checktype === '1' ? 9 : 11,
          value: _.isEmpty(d.value) ? '' : JSON.stringify(d.value),
        };
      }
      if (d.type === 200) {
        d.worksheetControls = worksheetControls;
      }
      return { ...d, size: 12 }; //全部按整行显示
    });
    setState({
      paramSettings: data,
    });
  }, [_.get(params, 'view.advancedSetting.plugin_map'), _.get(params, 'view.pluginInfo.paramSettings')]);

  const handleUpdate = data => {
    let newData = {};
    (data || paramSettings).map(item => {
      newData[item.fieldId] =
        item.type === 36 ? item.value === '1' : [9, 10, 11].includes(item.type) ? safeParse(item.value) : item.value;
    });
    onChangeView(
      {
        plugin_map: JSON.stringify(newData),
      },
      false,
      { pluginId: _.get(view, 'pluginInfo.id'), editAttrs: ['advancedSetting', 'pluginId'] },
    );
  };
  const renderCon = () => {
    if (paramSettings.length <= 0) {
      return (
        <React.Fragment>
          <div className="emptyCon flexRow alignItemsCenter justifyContentCenter">
            <Icon icon={'configure'} />
          </div>
          <div className="Gray_9e Font16 TxtCenter mTop30">{_l('暂未添加参数')}</div>
        </React.Fragment>
      );
    }
    return (
      <CustomFields
        disableRules
        data={paramSettings}
        isCreate={true}
        onChange={(data, ids, { controlId }) => {
          if (!controlId) {
            return;
          }
          setState({
            paramSettings: data,
          });
          const info = data.find(o => o.controlId === controlId);
          if (info && [...UN_TEXT_TYPE, 200].includes(info.type)) {
            handleUpdate(data);
          }
        }}
        onBlur={() => {
          handleUpdate();
        }}
        customWidgets={{
          200: CustomControlDrop,
        }}
      />
    );
  };

  return <Wrap className={'mTop16'}>{renderCon()}</Wrap>;
}
