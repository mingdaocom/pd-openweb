import React, { useState, useEffect, createRef } from 'react';
import TimePicker from 'ming-ui/components/TimePicker';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap, WrapMaxOrMin } from '../styled';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import moment from 'moment';
import { TimePicker as TimeRangePicker } from 'antd';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {}, defaultType, withMaxOrMin, from } = props;
  const { staticValue = '', cid = '' } = dynamicValue[0] || {};
  const [value, setValue] = useState(staticValue);
  // 静态值+此刻，此刻渲染走动态格式组件
  const [isDynamic, setDynamic] = useState(staticValue === '2' || !!cid);
  const $wrap = createRef(null);

  useEffect(() => {
    setDynamic(staticValue === '2' || !!cid);
    setValue(staticValue);
  }, [data.controlId, cid, staticValue]);

  const setDynamicValue = newValue => {
    setValue('');
    onDynamicValueChange(newValue || []);
  };

  const handleTimeChange = time => {
    const newTime = time ? time.format(data.unit === '6' ? 'HH:mm:ss' : 'HH:mm') : '';
    setValue(newTime);
    const newValue = [{ rcid: '', cid: '', staticValue: newTime }];
    onDynamicValueChange(newValue);
  };

  const clearTime = () => {
    onDynamicValueChange([]);
  };

  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };

  const onChangeMaxOrMin = result => {
    if (result.length <= 0) {
      setValue('');
      return onDynamicValueChange([]);
    }
    const timeFormat = data.unit === '6' ? 'HH:mm:ss' : 'HH:mm';
    const max = result[1] ? moment(result[1]).format(timeFormat) : undefined;
    const min = result[0] ? moment(result[0]).format(timeFormat) : undefined;
    setValue(`${min}-${max}`);
    return onDynamicValueChange([
      {
        cid: '',
        rcid: '',
        staticValue: `${min}-${max}`,
      },
    ]);
  };
  const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;

  return (
    <DynamicValueInputWrap hasHoverBg={!!value}>
      {defaultType ? (
        <DynamicInput {...props} onTriggerClick={onTriggerClick} />
      ) : isDynamic ? (
        <OtherFieldList {...props} />
      ) : withMaxOrMin && from === DYNAMIC_FROM_MODE.FAST_FILTER ? (
        <WrapMaxOrMin className="flexRow alignItemsCenter">
          <TimeRangePicker.RangePicker
            className="timeMaxOrMinCon"
            format={data.unit === '6' ? 'HH:mm:ss' : 'HH:mm'}
            onChange={moments => {
              if (!moments || !_.isArray(moments)) {
                moments = [];
              }
              onChangeMaxOrMin(moments);
            }}
            showNow
            locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
            allowClear={true}
            placeholder={[_l('开始时间'), _l('结束时间')]}
            value={
              !value
                ? []
                : [
                    value.split('-')[0]
                      ? moment(`${moment().format('YYYY-MM-DD')} ${value.split('-')[0]}`, 'YYYY-MM-DD HH:mm:ss')
                      : null,
                    value.split('-')[1]
                      ? moment(`${moment().format('YYYY-MM-DD')} ${value.split('-')[1]}`, 'YYYY-MM-DD HH:mm:ss')
                      : null,
                  ]
            }
          />
        </WrapMaxOrMin>
      ) : (
        <div className="dynamicCityContainer">
          {value && (
            <div
              className="clearOp pointer"
              onClick={e => {
                e.stopPropagation();
                onDynamicValueChange([]);
              }}
            >
              <span className="icon icon-closeelement-bg-circle Font15"></span>
            </div>
          )}
          <TimePicker
            panelCls="dynamicTimePanel"
            showSecond={data.unit === '6'}
            onChange={value => handleTimeChange(value)}
            onClear={clearTime}
          >
            <input readOnly value={value} />
          </TimePicker>
        </div>
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
