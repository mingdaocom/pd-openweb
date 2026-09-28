import React, { Fragment } from 'react';
import _ from 'lodash';
import { Segmented } from 'ming-ui/antd-components';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { CALC_TYPE, OUTPUT_FORMULA_FUNC } from 'src/utils/domain/control/setting';
import { SettingItem } from '../../../styled';

const getFormulaTypeOptions = () => [
  {
    value: 31,
    label: _l('数值'),
  },
  {
    value: 38,
    label: _l('日期'),
  },
  {
    value: 53,
    label: _l('函数'),
  },
];

export default function SwitchType({ data, fromAggregation, onChange }) {
  const { controlId, enumDefault2 } = data;
  const isSaved = controlId && !controlId.includes('-');

  const handleChange = type => {
    const nextData = {
      type,
      sourceControlId: '',
      dataSource: '',
    };

    if (type === 31) {
      onChange(
        handleAdvancedSettingChange(
          { ...nextData, enumDefault: 1, enumDefault2: 0, unit: '', dot: 2 },
          { suffix: '', prefix: '' },
        ),
      );
    } else if (type === 38) {
      onChange(
        handleAdvancedSettingChange(
          { ...nextData, enumDefault: 1, enumDefault2: 0, unit: '3', strDefault: '0', dot: 0 },
          { suffix: '', prefix: '', dot: 0 },
        ),
      );
    } else if (type === 53) {
      onChange({
        ...data,
        ...nextData,
        enumDefault: 0,
        enumDefault2: 2,
        handleOpenEditor: true,
        advancedSetting: { analysislink: '1', sorttype: 'en' },
      });
      window[`${controlId}-handleOpenEditor`] = true;
    }
  };

  const renderSaveContent = () => {
    let calcText;
    let outputText;

    if (data.type === 31) {
      calcText = _l('数值计算');
      outputText = _l('数值');
    } else if (data.type === 38) {
      calcText = _.get(
        _.find(CALC_TYPE, c => c.value === data.enumDefault),
        'text',
      );
      if (data.enumDefault === 2) {
        outputText = _.includes(['8', '9'], data.unit) ? _l('时间') : _l('日期');
      } else {
        outputText = _l('数值');
      }
    } else if (data.type === 53) {
      calcText = _l('函数');
      outputText = _.get(
        _.find(OUTPUT_FORMULA_FUNC, o => o.value === enumDefault2),
        'text',
      );
    }

    return (
      <div className="savedContent">
        <span>
          <span>{_l('计算方式')}</span>
          <span className="mLeft8 Bold">{calcText}</span>
        </span>
        <span className="mTop6">
          <span>{_l('存储类型')}</span>
          <span className="mLeft8 Bold">{outputText}</span>
        </span>
      </div>
    );
  };

  return (
    <SettingItem>
      {isSaved ? (
        renderSaveContent()
      ) : (
        <Fragment>
          <div className="settingItemTitle">{_l('计算方式')}</div>
          <Segmented
            block
            value={data.type}
            options={getFormulaTypeOptions().filter(({ value }) => !fromAggregation || value !== 38)}
            onChange={handleChange}
          />
        </Fragment>
      )}
    </SettingItem>
  );
}
