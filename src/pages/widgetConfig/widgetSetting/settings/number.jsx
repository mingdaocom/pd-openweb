import React, { Fragment, useEffect, useState } from 'react';
import { Dropdown, Checkbox } from 'ming-ui';
import { SettingItem, NumberRange } from '../../styled';
import PointerConfig from '../components/PointerConfig';
import WidgetColor from '../components/WidgetColor';
import NumberDynamicColor from '../components/NumberDynamicColor';
import WidgetVerify from '../components/WidgetVerify';
import PreSuffix from '../components/PreSuffix';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue.jsx';
import _ from 'lodash';
import { isCustomWidget } from '../../util';

const NUMBER_TYPES = [
  {
    value: '0',
    text: _l('数值'),
  },
  {
    value: '2',
    text: _l('进度'),
  },
  {
    value: '3',
    text: _l('计步器'),
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

export default function Number(props) {
  const { data, onChange, fromPortal, fromExcel } = props;
  const [visible, setVisible] = useState(false);
  const [numValue, setNumValue] = useState();
  const { numshow, thousandth, showtype = '0', numinterval, min, max } = getAdvanceSetting(data);
  const itemcolor = getAdvanceSetting(data, 'itemcolor') || {};
  const isSlider = showtype === '2';
  const FILTER_NUMBER_TYPES = fromPortal ? NUMBER_TYPES.filter(i => !_.includes(['2', '3'], i.value)) : NUMBER_TYPES;

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
    if (isEmpty(min)) {
      onChange(handleAdvancedSettingChange(data, { min: '0' }));
      return;
    }
    if (isEmpty(max)) {
      onChange(handleAdvancedSettingChange(data, { max: '100' }));
      return;
    }
    let minValue = parseFloat(min) || 0;
    let maxValue = typeof parseFloat(max) === 'number' ? parseFloat(max) : numshow === '1' ? 1 : 100;
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

  const renderContent = () => {
    if (showtype === '2') {
      return (
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
            <div className="settingItemTitle">{_l('步长')}</div>
            <InputValue
              className="w100"
              type={data.type}
              value={numValue}
              onChange={value => {
                setNumValue(value);
              }}
              onBlur={() => {
                let tempValue = numValue || '1';
                if (numValue && parseFloat(numValue) > parseFloat(max)) {
                  tempValue = numinterval;
                }
                if (!parseFloat(tempValue)) {
                  tempValue = '1';
                }
                setNumValue(tempValue);
                const pointIndex = String(tempValue).indexOf('.') + 1;
                onChange({
                  ...handleAdvancedSettingChange(data, { numinterval: tempValue }),
                  dot: pointIndex > 0 ? String(tempValue).length - pointIndex : 0,
                });
              }}
            />
            {/* <div className="labelWrap mTop12">
              <Checkbox
                size="small"
                checked={numshow === '1'}
                onClick={checked => {
                  let tempData = { numshow: checked ? '0' : '1' };
                  onChange(handleAdvancedSettingChange(data, tempData));
                }}
                text={_l('按百分比显示')}
              />
            </div> */}
          </SettingItem>
          {/* {numshow !== '1' && (
            <SettingItem>
              <div className="settingItemTitle">{_l('单位')}</div>
              <PreSuffix data={data} onChange={onChange} />
            </SettingItem>
          )} */}
        </Fragment>
      );
    }

    return (
      <Fragment>
        {showtype === '3' && (
          <SettingItem>
            <div className="settingItemTitle">{_l('步长')}</div>
            <InputValue
              className="w100"
              value={numinterval}
              type={data.type}
              placeholder={_l('请输入步长')}
              onChange={value => {
                onChange(handleAdvancedSettingChange(data, { numinterval: value }));
              }}
              onBlur={value => {
                const tempValue = (value || '1').toString().substring(0, 10);
                onChange(handleAdvancedSettingChange(data, { numinterval: tempValue }));
              }}
            />
          </SettingItem>
        )}
        <PointerConfig {...props} />
        {numshow !== '1' && (
          <SettingItem>
            <div className="settingItemTitle">{_l('单位')}</div>
            <PreSuffix data={data} onChange={onChange} />
          </SettingItem>
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      <SettingItem hide={isCustomWidget(data)}>
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
              newOptions.min = min || '0';
              newOptions.max = max || '100';
              newOptions.itemcolor = JSON.stringify(_.isEmpty(itemcolor) ? defaultItemColor : itemcolor);
              newOptions.showinput = '1';
              newOptions.datamask = '';
              newOptions.checkrange = '0';
              setNumValue(newOptions.numinterval);
              onChange({ ...handleAdvancedSettingChange(data, newOptions), dot: 0 });
              return;
            }
            if (type === '3') {
              newOptions.numinterval = '1';
              newOptions.min = '';
              newOptions.max = '';
              setNumValue(newOptions.numinterval);
            }
            onChange(handleAdvancedSettingChange(data, newOptions));
          }}
        />
      </SettingItem>

      {renderContent()}

      {fromExcel ? null : (
        <Fragment>
          <DynamicDefaultValue {...props} />
          <WidgetVerify {...props} />

          {isSlider && (
            <Fragment>
              <SettingItem>
                <div className="settingItemTitle">{_l('颜色')}</div>
                <div className="labelWrap flexRow">
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
    </Fragment>
  );
}
