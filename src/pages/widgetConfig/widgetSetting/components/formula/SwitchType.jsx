import React, { Fragment } from 'react';
import { SettingItem, AnimationWrap } from '../../../styled';
import { handleAdvancedSettingChange } from '../../../util/setting';
import { CALC_TYPE, OUTPUT_FORMULA_FUNC } from 'src/pages/widgetConfig/config/setting';
import cx from 'classnames';

const FORMULA_TYPES = [
  {
    value: 31,
    text: _l('数值'),
  },
  {
    value: 38,
    text: _l('日期'),
  },
  {
    value: 53,
    text: _l('函数'),
  },
];
export default function SwitchType({ data, onChange }) {
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
        advancedSetting: { analysislink: '1', sorttype: 'en' },
      });
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
          <AnimationWrap>
            {FORMULA_TYPES.map(({ text, value }) => {
              const isActive = data.type === value;
              return (
                <div
                  className={cx('animaItem overflow_ellipsis', { active: isActive })}
                  onClick={() => {
                    if (isActive) return;
                    handleChange(value);
                  }}
                >
                  {text}
                </div>
              );
            })}
          </AnimationWrap>
        </Fragment>
      )}
    </SettingItem>
  );
}
