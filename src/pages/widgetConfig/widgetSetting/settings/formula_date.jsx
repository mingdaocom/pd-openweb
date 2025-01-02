import React, { useRef, useState, Fragment, useLayoutEffect } from 'react';
import { Dropdown, TagTextarea } from 'ming-ui';
import { Tooltip } from 'antd';
import InputSuffix from '../components/formula/InputSuffix';
import SwitchType from '../components/formula/SwitchType';
import ToTodaySetting from '../components/formula/toTodaySetting';
import DynamicSelectDateControl from '../components/DynamicSelectDateControl';
import SelectControl from '../components/SelectControl';
import PreSuffix from '../components/PreSuffix';
import PointerConfig from '../components/PointerConfig';
import { SettingItem, ControlTag } from '../../styled';
import { getAdvanceSetting, getControlByControlId } from '../../util';
import { getFormulaControls } from '../../util/data';
import { parseDataSource, handleAdvancedSettingChange } from '../../util/setting';
import { CALC_TYPE, OUTPUT_FORMULA_DATE } from '../../config/setting';

import _ from 'lodash';

const FORMAT_TYPE = [
  { text: _l('开始日期 00:00，结束日期 24:00'), value: '1' },
  { text: _l('开始日期 00:00，结束日期 00:00'), value: '0' },
];

export default function FormulaDate(props) {
  const { allControls, data, onChange, ...rest } = props;
  const { strDefault, enumDefault, unit, controlId } = data;
  const isSaved = controlId && !controlId.includes('-');
  const { autocarry = '0' } = getAdvanceSetting(data);
  const sourceControlId = parseDataSource(data.sourceControlId);
  const dataSource = parseDataSource(data.dataSource);
  const [selectControlVisible, setVisible] = useState(false);
  const $ref = useRef(null);

  useLayoutEffect(() => {
    if ($ref.current) {
      $ref.current.setValue(data.dataSource || '');
    }
  }, []);

  const getCalcDetail = () => {
    if (enumDefault === 1) {
      return (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('开始')}</div>
            <DynamicSelectDateControl
              {...props}
              value={sourceControlId}
              onChange={value => onChange({ sourceControlId: value })}
            />
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('结束')}</div>
            <DynamicSelectDateControl
              {...props}
              value={dataSource}
              onChange={value => onChange({ dataSource: value })}
            />
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('格式化')}</div>
            <div className="subTitle Font12 Gray_9e">{_l('参与计算的日期未设置时间时，格式化方式为:')}</div>
            <Dropdown
              border
              value={strDefault}
              data={FORMAT_TYPE}
              onChange={value => onChange({ strDefault: value })}
            />
          </SettingItem>
          <PointerConfig
            data={data}
            onChange={value => {
              if (value.advancedSetting) {
                onChange(value);
              } else {
                let newVal = value || {};
                if (!Number(value.dot)) {
                  newVal.dotformat = '0';
                }
                onChange({ ...handleAdvancedSettingChange(data, newVal), ...value });
              }
            }}
          />
          <InputSuffix data={data} onChange={onChange} />
          {autocarry !== '1' && (
            <SettingItem>
              <div className="settingItemTitle">{_l('显示单位')}</div>
              <PreSuffix data={data} onChange={onChange} />
            </SettingItem>
          )}
        </Fragment>
      );
    }
    if (enumDefault === 2) {
      const isDateFn = val => _.includes(['1', '3'], val);
      const saveData = isSaved
        ? isDateFn(unit)
          ? _.filter(OUTPUT_FORMULA_DATE, o => isDateFn(o.value))
          : _.filter(OUTPUT_FORMULA_DATE, o => !isDateFn(o.value))
        : OUTPUT_FORMULA_DATE;
      return (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('选择日期')}</div>
            <DynamicSelectDateControl
              {...props}
              disableTimeControl={true}
              value={sourceControlId}
              onChange={value => onChange({ sourceControlId: value })}
            />
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('计算')}</div>
            <p className="Font12 Gray_9e">
              {_l('输入你想要 添加/减去 的时间。如：+8h+1m，-1d+8h。当使用数值类型的字段运算时，请不要忘记输入单位。')}
              <Tooltip
                title={
                  <Fragment>
                    <div>{_l('年：Y（大写)')}</div>
                    <div>{_l('月：M（大写)')}</div>
                    <div>{_l('天：d')}</div>
                    <div>{_l('小时：h')}</div>
                    <div>{_l('分：m')}</div>
                  </Fragment>
                }
              >
                <span className="pointer" style={{ color: '#2196f3' }}>
                  {_l('查看时间单位')}
                </span>
              </Tooltip>
            </p>
            <TagTextarea
              rightIcon
              mode={4}
              defaultValue={data.dataSource}
              maxHeight={140}
              getRef={tagtextarea => {
                $ref.current = tagtextarea;
              }}
              renderTag={(id, options) => {
                return <ControlTag>{getControlByControlId(allControls, id).controlName}</ControlTag>;
              }}
              onAddClick={() => setVisible(true)}
              onChange={(err, value, obj) => {
                if (err) {
                  return;
                }
                onChange({ dataSource: value });
              }}
              onFocus={() => {
                setVisible(true);
              }}
            />
            {selectControlVisible && (
              <SelectControl
                searchable={false}
                className={'isolate'}
                list={getFormulaControls(allControls, data)}
                onClickAway={() => setVisible(false)}
                onClick={item => {
                  $ref.current.insertColumnTag(item.controlId);
                  setVisible(false);
                }}
              />
            )}
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('输出格式')}</div>
            <Dropdown border value={unit || '3'} data={saveData} onChange={value => onChange({ unit: value })} />
          </SettingItem>
        </Fragment>
      );
    }
    if (enumDefault === 3) {
      return <ToTodaySetting {...props} />;
    }
  };

  return (
    <Fragment>
      <SwitchType {...props} />
      {!isSaved && (
        <SettingItem>
          <Dropdown
            border
            value={enumDefault}
            data={CALC_TYPE}
            onChange={value => {
              if (value === enumDefault) return;
              if (value === 3) {
                onChange({ enumDefault: value, dataSource: '', sourceControlId: '', unit: '3' });
                return;
              }
              onChange({
                enumDefault: value,
                dataSource: '',
                sourceControlId: '',
                ...(value === '2' ? { unit: !_.includes(['1', '3', '8', '9'], unit) ? '3' : unit, dot: 0 } : {}),
              });
            }}
          />
        </SettingItem>
      )}
      {getCalcDetail()}
    </Fragment>
  );
}
