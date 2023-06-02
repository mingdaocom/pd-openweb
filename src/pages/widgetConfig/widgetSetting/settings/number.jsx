import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import components from '../components';
import NumberUtil from 'src/util/number';
import { Dropdown, Checkbox } from 'ming-ui';
import { EditInfo, SettingItem } from '../../styled';
import WidgetVerify from '../components/WidgetVerify';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import NumberConfig from '../components/ControlSetting/NumberConfig';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue.jsx';
import _ from 'lodash';
const { PointerConfig, PreSuffix, WidgetColor, NumberDynamicColor, SliderScaleConfig } = components;

const NUMBER_TYPES = [
  {
    value: '0',
    text: _l('数值'),
  },
  {
    value: '2',
    text: _l('进度'),
  },
];

const NUMBER_COLOR_TYPE = [
  { text: _l('固定颜色'), value: 1 },
  { text: _l('动态颜色'), value: 2 },
];

const defaultItemColor = {
  type: 1,
  color: '#2196f3',
  colors: [],
};

const NumberRange = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    margin: 0 8px;
    color: #9e9e9e;
  }
  input {
    width: 100%;
  }
`;

export default function Number(props) {
  const { data, onChange, fromPortal, fromExcel } = props;
  const [visible, setVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [numValue, setNumValue] = useState();
  const { numshow, thousandth, showtype = '0', numinterval, min, max, showinput } = getAdvanceSetting(data);
  const itemcolor = getAdvanceSetting(data, 'itemcolor') || {};
  const itemnames = getAdvanceSetting(data, 'itemnames');
  const isNumber = showtype === '0';
  const FILTER_NUMBER_TYPES = fromPortal ? NUMBER_TYPES.filter(i => i.value !== '2') : NUMBER_TYPES;

  useEffect(() => {
    // 初始化用老数据unit覆盖suffix
    if (data.unit) {
      onChange(handleAdvancedSettingChange({ ...data, unit: '' }, { suffix: data.unit }));
    }
    if (_.isUndefined(thousandth)) {
      onChange(handleAdvancedSettingChange(data, { thousandth: data.enumDefault === 1 ? '1' : '0' }));
    }
    setNumValue(numinterval);
  }, [data.controlId]);

  const handleBlur = () => {
    function isEmpty(v) {
      return _.isUndefined(v) || v === '';
    }
    let changes = {};
    if (isEmpty(min) && isEmpty(max)) {
      return;
    }
    let minValue = NumberUtil.parseFloat(min) || 0;
    let maxValue =
      typeof NumberUtil.parseFloat(max) === 'number' ? NumberUtil.parseFloat(max) : numshow === '1' ? 1 : 100;
    if (maxValue < minValue) {
      changes.minValue = maxValue;
      changes.maxValue = minValue;
    } else {
      changes.maxValue = maxValue;
      changes.minValue = minValue;
    }
    if (minValue !== min || maxValue !== max) {
      onChange(handleAdvancedSettingChange(data, { min: `${changes.minValue}`, max: `${changes.maxValue}` }));
    }
  };

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('输入方式')}</div>
        <Dropdown
          border
          isAppendToBody
          data={FILTER_NUMBER_TYPES}
          value={showtype}
          onChange={type => {
            let newOptions = { showtype: type };
            if (type === '2') {
              newOptions.numinterval = '1';
              newOptions.min = '0';
              newOptions.max = '100';
              newOptions.itemcolor = JSON.stringify(_.isEmpty(itemcolor) ? defaultItemColor : itemcolor);
              newOptions.showinput = '1';
              newOptions.datamask = '';
              setNumValue(newOptions.numinterval);
            }
            onChange(handleAdvancedSettingChange(data, newOptions));
          }}
        />
      </SettingItem>

      {isNumber ? (
        <PointerConfig {...props} />
      ) : (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('区间')}</div>
            <NumberRange>
              <InputValue
                value={min}
                type={data.type}
                placeholder={_l('最小')}
                onChange={value => {
                  onChange(handleAdvancedSettingChange(data, { min: value }));
                }}
                onBlur={handleBlur}
              />
              <span>-</span>
              <InputValue
                value={max}
                type={data.type}
                placeholder={_l('最大')}
                onChange={value => {
                  onChange(handleAdvancedSettingChange(data, { max: value }));
                }}
                onBlur={handleBlur}
              />
            </NumberRange>
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('间隔')}</div>
            <InputValue
              type={data.type}
              value={numValue}
              onChange={value => {
                setNumValue(value);
              }}
              onBlur={() => {
                let tempValue = numValue || '1';
                if (numValue && NumberUtil.parseFloat(numValue) > NumberUtil.parseFloat(max)) {
                  tempValue = numinterval;
                }
                setNumValue(tempValue);
                onChange(handleAdvancedSettingChange(data, { numinterval: tempValue }));
              }}
            />
            <div className="labelWrap mTop12">
              <Checkbox
                size="small"
                checked={numshow === '1'}
                onClick={checked => {
                  let tempData = { numshow: checked ? '0' : '1' };
                  if (!checked) {
                    tempData = {
                      ...tempData,
                      min: '0',
                      max: '1',
                      numinterval: '0.1',
                    };
                    setNumValue(tempData.numinterval);
                  }
                  onChange(handleAdvancedSettingChange(data, tempData));
                }}
                text={_l('按百分比显示')}
              />
            </div>
          </SettingItem>
        </Fragment>
      )}

      {fromExcel ? null : (
        <Fragment>
          <DynamicDefaultValue {...props} />
          <WidgetVerify {...props} />

          {isNumber && <NumberConfig {...props} />}

          {numshow !== '1' && isNumber && (
            <SettingItem>
              <div className="settingItemTitle">{_l('单位')}</div>
              <PreSuffix {...props} />
            </SettingItem>
          )}

          {!isNumber && (
            <Fragment>
              <SettingItem>
                <div className="settingItemTitle">{_l('颜色')}</div>
                <div className="labelWrap">
                  <Dropdown
                    border
                    isAppendToBody
                    style={{ width: '120px', marginRight: '10px' }}
                    data={NUMBER_COLOR_TYPE}
                    value={_.get(itemcolor, 'type') || 1}
                    onChange={type => {
                      onChange(
                        handleAdvancedSettingChange(data, {
                          itemcolor: JSON.stringify({
                            ...itemcolor,
                            type,
                          }),
                        }),
                      );
                    }}
                  />
                  {itemcolor.type === 1 ? (
                    <WidgetColor
                      type="normal"
                      color={itemcolor.color}
                      handleChange={color => {
                        onChange(
                          handleAdvancedSettingChange(data, { itemcolor: JSON.stringify({ ...itemcolor, color }) }),
                        );
                      }}
                    />
                  ) : (
                    <span
                      className="ThemeColor3 ThemeHoverColor2 pointer LineHeight36"
                      onClick={() => setVisible(true)}
                    >
                      {_l('设置')}
                    </span>
                  )}
                </div>
              </SettingItem>
              <SettingItem>
                <div className="settingItemTitle">{_l('设置')}</div>
                <div className="labelWrap mTop12">
                  <Checkbox
                    size="small"
                    checked={showinput === '1'}
                    onClick={checked => onChange(handleAdvancedSettingChange(data, { showinput: checked ? '0' : '1' }))}
                    text={_l('显示输入框')}
                  />
                </div>
                <div className="labelWrap mTop12">
                  <Checkbox
                    size="small"
                    checked={itemnames}
                    onClick={checked => {
                      if (checked) {
                        onChange(handleAdvancedSettingChange(data, { itemnames: '' }));
                      } else {
                        setNameVisible(true);
                      }
                    }}
                    text={_l('显示刻度')}
                  />
                </div>
                {itemnames && (
                  <EditInfo style={{ margin: '12px 0' }} onClick={() => setNameVisible(true)}>
                    <div className="text overflow_ellipsis Gray">{itemnames.map(i => i.value).join('、')}</div>
                    <div className="edit">
                      <i className="icon-edit"></i>
                    </div>
                  </EditInfo>
                )}
              </SettingItem>
            </Fragment>
          )}
        </Fragment>
      )}

      {visible && (
        <NumberDynamicColor
          max={max}
          colors={itemcolor.colors}
          onClose={() => setVisible(false)}
          handleChange={colors => {
            onChange(handleAdvancedSettingChange(data, { itemcolor: JSON.stringify({ ...itemcolor, colors }) }));
          }}
        />
      )}

      {nameVisible && (
        <SliderScaleConfig
          itemnames={itemnames}
          itemcolor={itemcolor}
          step={NumberUtil.parseFloat(numinterval)}
          min={NumberUtil.parseFloat(min)}
          max={NumberUtil.parseFloat(max)}
          onCancel={() => setNameVisible(false)}
          onChange={value => {
            onChange(handleAdvancedSettingChange(data, { itemnames: JSON.stringify(value) }));
          }}
        />
      )}
    </Fragment>
  );
}
