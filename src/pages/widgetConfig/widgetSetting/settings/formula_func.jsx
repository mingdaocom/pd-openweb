import React, { Fragment, useEffect, useState } from 'react';
import { get } from 'lodash';
import _ from 'lodash';
import { Checkbox, Select, Tooltip } from 'ming-ui/antd-components';
import { DynamicInputStyle } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/styled.js';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { OUTPUT_FORMULA_FUNC, TIME_DISPLAY_TYPE } from 'src/utils/domain/control/setting';
import { SettingItem } from '../../styled';
import SwitchType from '../components/formula/SwitchType';
import FunctionEditorDialog from '../components/FunctionEditorDialog';
import PointConfig from '../components/PointerConfig';
import PreSuffix from '../components/PreSuffix';
import Date from './date';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

export default function FormulaFunc(props) {
  const { data, allControls, onChange } = props;
  const { controlName, dataSource, enumDefault2, controlId } = data;
  const { numshow, nullzero } = getAdvanceSetting(data);
  const [visible, setVisible] = useState(false);
  const isSaved = controlId && !controlId.includes('-');
  const saveDisabled = isSaved && _.includes([2, 6, 46], enumDefault2);

  const funcObj = safeParse(dataSource || '{}');

  const isFunc = _.get(funcObj, 'expression');

  const filterData =
    !isSaved || saveDisabled ? OUTPUT_FORMULA_FUNC : OUTPUT_FORMULA_FUNC.filter(i => !_.includes([2, 6, 46], i.value));

  const funcControls = allControls.filter(i => {
    if (i.controlId === controlId) return false;
    if (i.type === 29) return false;
    if (i.type === 30 && (i.strDefault || '')[0] === '1') return false;
    if (i.type === 38 && i.enumDefault === 3) return false;
    return true;
  });

  // 子表字段不支持选择，存量表达式仍按 funcControls 正常展示和校验
  const selectableFuncControls = funcControls.filter(i => i.type !== 34);

  useEffect(() => {
    if (window[`${controlId}-handleOpenEditor`]) {
      setVisible(true);
      delete window[`${controlId}-handleOpenEditor`];
    }
  }, []);

  const renderContent = () => {
    if (enumDefault2 === 6) {
      return (
        <Fragment>
          <PointConfig {...props} />
          {numshow !== '1' && (
            <SettingItem>
              <div className="settingItemTitle">{_l('单位')}</div>
              <PreSuffix {...props} />
            </SettingItem>
          )}
        </Fragment>
      );
    } else if (_.includes([15, 16], enumDefault2)) {
      return <Date {...props} />;
    } else if (enumDefault2 === 46) {
      return (
        <Select
          className="mTop20 w100"
          options={TIME_DISPLAY_TYPE}
          fieldNames={SELECT_FIELD_NAMES}
          value={data.unit}
          onChange={value => onChange({ unit: value })}
        />
      );
    }
  };

  let supportDebug = !props.subListData;
  const targetWorksheetInfo = get(props, 'globalSheetInfo', {});
  return (
    <Fragment>
      <SwitchType {...props} />
      <SettingItem>
        <div className="settingItemTitle">{_l('表达式')}</div>
        <DynamicInputStyle style={{ width: '100%' }} onClick={() => setVisible(true)}>
          {isFunc ? (
            <Fragment>
              <div className={`text ${_.get(funcObj, 'status') === -1 ? 'error' : ''}`}>
                <i className="icon-formula Font16 mRight10 textSecondary" />
                <span className="Bold flex overflow_ellipsis">{_l('函数计算')}</span>
              </div>
              <div className="options">
                <Tooltip title={_l('清除')}>
                  <div
                    className="delete"
                    onClick={e => {
                      e.stopPropagation();
                      onChange({ dataSource: '' });
                    }}
                  >
                    <i className="icon-cancel"></i>
                  </div>
                </Tooltip>
                <div className="edit">
                  <i className="icon-edit"></i>
                </div>
              </div>
            </Fragment>
          ) : (
            <span className="textTertiary">{_l('点击输入函数')}</span>
          )}
        </DynamicInputStyle>
      </SettingItem>
      {enumDefault2 === 6 && (
        <div className="labelWrap mTop12">
          <Checkbox
            checked={nullzero === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  nullzero: !event.target.checked ? '0' : '1',
                }),
              )
            }
            size="small"
          >
            {_l('参与计算的字段值为空时，视为0')}
          </Checkbox>
        </div>
      )}
      <SettingItem>
        <div className="settingItemTitle">{_l('输出格式')}</div>
        <Select
          className="w100"
          disabled={saveDisabled}
          value={enumDefault2}
          options={filterData}
          fieldNames={SELECT_FIELD_NAMES}
          onChange={value => {
            if (value === enumDefault2) return;
            let newAdvancedSetting = { nullzero: '0' };

            if (value === 2) {
              newAdvancedSetting = { analysislink: '1', sorttype: 'en' };
            } else if (value === 6) {
              newAdvancedSetting = { showtype: '0', roundtype: '2', thousandth: '0' };
            } else if (value === 15) {
              newAdvancedSetting = { showtype: '3' };
            } else if (value === 16) {
              newAdvancedSetting = { showtype: '1' };
            } else if (value === 46) {
              onChange({ enumDefault2: value, unit: '1' });
              return;
            }

            onChange({ enumDefault2: value, unit: '', advancedSetting: newAdvancedSetting });
          }}
        />
      </SettingItem>

      {renderContent()}

      {visible && (
        <FunctionEditorDialog
          supportDebug={supportDebug}
          worksheetId={targetWorksheetInfo.worksheetId}
          projectId={targetWorksheetInfo.projectId}
          appId={targetWorksheetInfo.appId}
          supportJavaScript={false}
          control={data}
          value={funcObj}
          title={controlName}
          controls={funcControls}
          selectableControls={selectableFuncControls}
          onClose={() => setVisible(false)}
          onSave={value => onChange({ dataSource: JSON.stringify(value) })}
        />
      )}
    </Fragment>
  );
}
