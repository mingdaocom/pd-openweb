import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { Checkbox } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { EditInfo } from '../../../../styled';
import SliderScaleConfig from '../components/SliderScaleConfig';

export default function NumberConfig(props) {
  const { data, onChange } = props;
  const {
    type,
    enumDefault,
    enumDefault2,
    advancedSetting: { numshow, thousandth, showtype, showinput, numinterval, min, max } = {},
  } = data;
  const isNumShow =
    _.includes([6, 31], type) ||
    (type === 37 && _.includes([1, 2, 3, 5], enumDefault)) ||
    (type === 53 && enumDefault2 === 6);
  const [nameVisible, setNameVisible] = useState(false);

  // 数值进度
  if (type === 6 && showtype === '2') {
    const itemnames = getAdvanceSetting(data, 'itemnames');
    const itemcolor = getAdvanceSetting(data, 'itemcolor') || {};
    return (
      <Fragment>
        <div className="labelWrap">
          <Checkbox
            checked={showinput === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  showinput: !event.target.checked ? '0' : '1',
                }),
              )
            }
            size="small"
          >
            {_l('显示输入框')}
          </Checkbox>
        </div>
        <div className="labelWrap">
          <Checkbox
            checked={itemnames}
            onChange={event => {
              if (!event.target.checked) {
                onChange(
                  handleAdvancedSettingChange(data, {
                    itemnames: '',
                  }),
                );
              } else {
                setNameVisible(true);
              }
            }}
            size="small"
          >
            {_l('显示刻度')}
          </Checkbox>
        </div>
        {itemnames && (
          <EditInfo style={{ marginTop: '8px' }} onClick={() => setNameVisible(true)}>
            <div className="text overflow_ellipsis textPrimary">{itemnames.map(i => i.value).join('、')}</div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </EditInfo>
        )}
        {/* <div className="labelWrap">
          <Checkbox
            size="small"
            checked={thousandth !== '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { thousandth: checked ? '1' : '0' }))}
            text={_l('显示千分位')}
          />
        </div> */}
        <div className="labelWrap">
          <Checkbox
            checked={numshow === '1'}
            onChange={event => {
              const checked = !event.target.checked;
              return onChange(
                handleAdvancedSettingChange(data, {
                  suffix: checked ? '' : '%',
                  prefix: '',
                  numshow: checked ? '0' : '1',
                }),
              );
            }}
            size="small"
          >
            {_l('按百分比显示')}
          </Checkbox>
        </div>
        {nameVisible && (
          <SliderScaleConfig
            itemnames={itemnames}
            itemcolor={itemcolor}
            step={parseFloat(numinterval)}
            min={parseFloat(min)}
            max={parseFloat(max)}
            onCancel={() => setNameVisible(false)}
            onChange={value => {
              onChange(handleAdvancedSettingChange(data, { itemnames: JSON.stringify(value) }));
            }}
          />
        )}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          checked={thousandth !== '1'}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                thousandth: !event.target.checked ? '1' : '0',
              }),
            )
          }
          size="small"
        >
          {_l('显示千分位')}
        </Checkbox>
      </div>
      {isNumShow && (
        <div className="labelWrap">
          <Checkbox
            checked={numshow === '1'}
            onChange={event => {
              const checked = !event.target.checked;
              return onChange(
                handleAdvancedSettingChange(data, {
                  suffix: checked ? '' : '%',
                  prefix: '',
                  numshow: checked ? '0' : '1',
                }),
              );
            }}
            size="small"
          >
            {_l('按百分比显示')}
          </Checkbox>
        </div>
      )}
    </Fragment>
  );
}
