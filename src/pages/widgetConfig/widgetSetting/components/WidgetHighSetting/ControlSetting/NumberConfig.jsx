import React, { Fragment, useState } from 'react';
import { Checkbox } from 'ming-ui';
import NumberUtil from 'src/util/number';
import { EditInfo } from '../../../../styled';
import SliderScaleConfig from '../components/SliderScaleConfig';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import _ from 'lodash';

export default function NumberConfig(props) {
  const { data, onChange } = props;
  const {
    type,
    enumDefault,
    advancedSetting: { numshow, thousandth, showtype, showinput, numinterval, min, max } = {},
  } = data;
  const isNumShow = _.includes([6, 31], type) || (type === 37 && _.includes([1, 2, 3, 5], enumDefault));
  const [nameVisible, setNameVisible] = useState(false);

  // 数值进度
  if (type === 6 && showtype === '2') {
    const itemnames = getAdvanceSetting(data, 'itemnames');
    const itemcolor = getAdvanceSetting(data, 'itemcolor') || {};
    return (
      <Fragment>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={showinput === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { showinput: checked ? '0' : '1' }))}
            text={_l('显示输入框')}
          />
        </div>
        <div className="labelWrap">
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
          <EditInfo style={{ marginTop: '8px' }} onClick={() => setNameVisible(true)}>
            <div className="text overflow_ellipsis Gray">{itemnames.map(i => i.value).join('、')}</div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </EditInfo>
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

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={thousandth !== '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { thousandth: checked ? '1' : '0' }))}
          text={_l('显示千分位')}
        />
      </div>
      {isNumShow && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={numshow === '1'}
            onClick={checked =>
              onChange(
                handleAdvancedSettingChange(data, {
                  suffix: checked ? '' : '%',
                  prefix: '',
                  numshow: checked ? '0' : '1',
                }),
              )
            }
            text={_l('按百分比显示')}
          />
        </div>
      )}
    </Fragment>
  );
}
