import React, { Fragment } from 'react';
import _ from 'lodash';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget';
import { enumWidgetType } from 'src/pages/widgetConfig/util';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue.jsx';
import { SetConfig, SettingItem } from '../../../styled';
import { openDevelopWithAI } from '../DevelopWithAI';
import CustomReference from './CustomReference';

export default function WidgetCustom(props) {
  const { data, globalSheetInfo, onChange, from } = props;
  const { customtype, custom_js, height } = getAdvanceSetting(data);
  const reference = getAdvanceSetting(data, 'reference') || [];
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">
          {customtype === '1' ? (
            <span>
              {_l('存储数据为')}
              <span className="mLeft8">{_.get(DEFAULT_DATA[enumWidgetType[data.type]], 'controlName')}</span>
            </span>
          ) : (
            <span>{_l('不存储数据，仅引用其他字段值')}</span>
          )}
        </div>
        <SetConfig
          className="mTop20"
          hasSet={!!custom_js}
          onClick={() =>
            openDevelopWithAI({
              worksheetId: globalSheetInfo.worksheetId,
              control: data,
              defaultCode: custom_js,
              rest: {
                ...props,
                ...(from === 'subList' ? { allControls: props.queryControls || [] } : {}),
              },
            })
          }
        >
          <span>
            <i className="icon-custom-01 Font16"></i>
            {_l('进入AI辅助开发')}
          </span>
        </SetConfig>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('引用字段')}</div>
        <CustomReference
          {...props}
          className="mTop0"
          reference={reference}
          handleChange={value =>
            onChange(handleAdvancedSettingChange(data, { reference: _.isEmpty(value) ? '' : JSON.stringify(value) }))
          }
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('默认高度')}</div>
        <div className="labelWrap flexCenter">
          <InputValue
            value={height}
            type={2}
            className="Width90 mRight12"
            onChange={value => onChange(handleAdvancedSettingChange(data, { height: value }))}
            onBlur={value => {
              let tempValue = value;
              if (tempValue < 36) {
                tempValue = 36;
              }
              if (tempValue > 10000) {
                tempValue = 10000;
              }
              onChange(handleAdvancedSettingChange(data, { height: tempValue.toString() }));
            }}
          />
          <span>px</span>
        </div>
      </SettingItem>
      {/* <Checkbox
        size="small"
        className="mTop16"
        checked={allowfull === '1'}
        text={_l('允许全屏查看')}
        onClick={checked => onChange(handleAdvancedSettingChange(data, { allowfull: String(+!checked) }))}
      /> */}
    </Fragment>
  );
}
