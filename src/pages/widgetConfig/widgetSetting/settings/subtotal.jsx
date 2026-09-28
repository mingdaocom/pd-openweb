import React, { Fragment, useEffect, useState } from 'react';
import _, { get, includes, isEmpty } from 'lodash';
import { Checkbox, Radio, Select, Tooltip } from 'ming-ui/antd-components';
import FilterDialog from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterDialog';
import FilterItemTexts from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterItemTexts';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { resortControlByColRow } from 'src/utils/domain/control/editorLayout';
import { filterByTypeAndSheetFieldType } from 'src/utils/domain/control/editorSetting';
import { filterOnlyShowField } from 'src/utils/domain/control/filters';
import { filterControlsFromAll, getControlByControlId } from 'src/utils/domain/control/filters';
import { getIconByType, isShowUnitConfig, parseDataSource } from 'src/utils/domain/control/metadata';
import { SYSTEM_CONTROL, WORKFLOW_SYSTEM_CONTROL } from 'src/utils/domain/control/widget';
import { useSheetInfo } from '../../hooks';
import { SettingItem } from '../../styled';
import PointerConfig from '../components/PointerConfig';
import PreSuffix from '../components/PreSuffix';

const DATE_FORMULA_UNIT = [_l('分钟'), _l('小时'), _l('天'), _l('月'), _l('年')];

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const COMMON_TYPE = [
  { text: _l('已填计数'), value: 13 },
  { text: _l('未填计数'), value: 14 },
];

const UNIQUE_TYPE = [
  {
    text: _l('去重计数'),
    value: 21,
    tips: _l(
      '去除重复的字段值后计数。对于可以选择多个值的字段（如多选、成员/组织角色/部门多选），则针对多选组合去重后计数。',
    ),
  },
];

const SINGLE_UNIQUE_TYPE = [
  {
    text: _l('单个选项去重计数'),
    value: 22,
    tips: _l(
      '去除重复的选项后计数。对于可以选择多个选项的字段（如多选、成员/组织角色/部门多选、关联记录多条），针对所有选项去重后计数',
    ),
  },
];

const NUMBER_TYPE = [
  ...COMMON_TYPE,
  ...UNIQUE_TYPE,
  { text: _l('求和'), value: 5 },
  { text: _l('平均值'), value: 1 },
  { text: _l('最大值'), value: 2 },
  { text: _l('最小值'), value: 3 },
];

const DATE_TYPE = [...COMMON_TYPE, ...UNIQUE_TYPE, { text: _l('最晚'), value: 2 }, { text: _l('最早'), value: 3 }];

const getOutputType = enumDefault2 => {
  if (enumDefault2 === 15) {
    return [
      { label: _l('年'), value: '5' },
      { label: _l('年-月'), value: '4' },
      { label: _l('年-月-日'), value: '3' },
    ];
  } else if (enumDefault2 === 16) {
    return [
      { label: _l('年-月-日 时'), value: '2' },
      { label: _l('年-月-日 时:分'), value: '1' },
      { label: _l('年-月-日 时:分:秒'), value: '6' },
    ];
  } else {
    return [
      { label: _l('时:分'), value: '8' },
      { label: _l('时:分:秒'), value: '9' },
    ];
  }
};

const getDefaultUnit = selectedControl => {
  if (_.includes([15, 16], selectedControl.type)) {
    return _.get(selectedControl, 'advancedSetting.showtype') || (selectedControl.type === 15 ? '3' : '1');
  } else if (selectedControl.type === 46) {
    return selectedControl.unit === '1' ? '8' : '9';
  }
};

const getTotalType = control => {
  if (isEmpty(control)) return COMMON_TYPE;

  // 汇总选择汇总字段
  if (control.type === 37) {
    if (includes([0, 6, 8], control.enumDefault2)) return NUMBER_TYPE;
    if (includes([15, 16, 46], control.enumDefault2)) return DATE_TYPE;
  }

  // 汇总选择公式日期字段
  if (control.type === 38 && control.enumDefault2 === 0 && control.enumDefault === 1) return NUMBER_TYPE;

  // 汇总选择公式函数字段
  if (control.type === 53 && includes([6], control.enumDefault2)) return NUMBER_TYPE;

  const type = control.type === 30 ? control.sourceControlType : control.type;
  if (includes([6, 8, 31, 28], type)) return NUMBER_TYPE;
  if (includes([15, 16, 46], type)) return DATE_TYPE;

  if (includes([9, 10, 11, 26, 27, 29, 48], type)) return [...COMMON_TYPE, ...UNIQUE_TYPE, ...SINGLE_UNIQUE_TYPE];
  return includes([14, 34, 42], type) ? COMMON_TYPE : [...COMMON_TYPE, ...UNIQUE_TYPE];
};

const renderTotalTypeOption = ({ data: item }) => (
  <span>
    {item.label}
    {item.tips && (
      <Tooltip title={item.tips} placement="bottom">
        <span className="icon-help Font14 textTertiary mLeft4" />
      </Tooltip>
    )}
  </span>
);

export default function Subtotal(props) {
  const { data, onChange, allControls, globalSheetInfo = {} } = props;
  const { sourceControlId, dataSource, enumDefault, enumDefault2, unit } = data;
  const { summaryresult = '0', numshow, reportempty } = getAdvanceSetting(data);
  const [visible, setVisible] = useState(false);
  const parsedDataSource = parseDataSource(dataSource);

  const controls = filterControlsFromAll(
    allControls,
    ({ type, enumDefault }) => (type === 29 && enumDefault === 2) || type === 34,
  );

  useEffect(() => {
    // 初始化用老数据unit覆盖suffix
    if (data.unit && !_.includes([15, 16, 46], enumDefault2)) {
      onChange(handleAdvancedSettingChange({ ...data, unit: '' }, { suffix: data.unit }));
    }
  }, [data.controlId]);

  // 获取汇总关联表控件的表id
  const relateControl = getControlByControlId(allControls, parsedDataSource);
  const { dataSource: worksheetId, relationControls } = relateControl;
  const isLightweightRelate = _.get(relateControl, 'advancedSetting.notautopassive') === '1';
  const { loading, data: sheetData } = useSheetInfo({ worksheetId, relationWorksheetId: globalSheetInfo.worksheetId });
  // 空白子表手动取值
  const availableControls = (
    (sheetData.info || {}).worksheetId ? sheetData.controls || [] : (relationControls || []).concat(SYSTEM_CONTROL)
  ).filter(
    i =>
      !_.includes(
        WORKFLOW_SYSTEM_CONTROL.map(o => o.controlId),
        i.controlId,
      ),
  );
  const filterColumns = ((sheetData.info || {}).worksheetId ? sheetData.controls || [] : relationControls || []).filter(
    (i = {}) => {
      if (i.type === 38 && i.enumDefault === 3) return false;
      return true;
    },
  );

  const selectedControl = getControlByControlId(availableControls, sourceControlId);
  const totalType = getTotalType(selectedControl);

  const filters = getAdvanceSetting(data, 'filters');

  const filterControls = filterByTypeAndSheetFieldType(
    resortControlByColRow(filterOnlyShowField(availableControls) || []),
    type => !includes([22, 25, 30, 43, 45, 47, 49, 50, 51, 52, 10010], type),
  ).map(item => ({ value: item.controlId, label: item.controlName, icon: getIconByType(item.type) }));
  const summaryOptions = [{ value: 'count', label: _l('记录数量'), icon: 'calculate' }, ...filterControls];
  const summaryValue = sourceControlId || 'count';
  const summaryControl = availableControls.find(item => item.controlId === summaryValue);
  const summaryControlName = summaryValue === 'count' ? _l('记录数量') : get(summaryControl, 'controlName');
  const summaryControlInvalid =
    summaryControl && summaryControl.type === 30 && (summaryControl.strDefault || '')[0] === '1';
  const summaryLoading =
    loading || ((sheetData.info || {}).worksheetId && (sheetData.info || {}).worksheetId !== worksheetId);

  const handleChange = value => {
    let nextData = {
      ...handleAdvancedSettingChange(data, { summaryresult: '' }),
      enumDefault: 6,
      enumDefault2: 6,
      dot: 0,
      unit: '',
    };

    if (value === 'count') {
      onChange({ ...nextData, sourceControlId: '' });
      return;
    }

    if (value === sourceControlId) return;
    const nextControl = getControlByControlId(availableControls, value);
    nextData = { ...nextData, enumDefault: _.get(_.head(getTotalType(nextControl)), 'value') };

    if (nextControl.dot) {
      nextData = { ...nextData, dot: nextControl.dot || 2 };
    }

    // 数值或金额，单位同步
    if (_.includes([6, 8], nextControl.type)) {
      const { suffix, prefix } = nextControl.advancedSetting || {};
      suffix &&
        (nextData = {
          ...handleAdvancedSettingChange(nextData, { suffix: suffix || nextControl.unit || '', prefix: '' }),
        });
      prefix && (nextData = { ...handleAdvancedSettingChange(nextData, { prefix: prefix || '', suffix: '' }) });
    } else {
      nextData = { ...handleAdvancedSettingChange(nextData, { suffix: '', prefix: '' }) };
    }

    if (nextControl.type === 38) {
      // 日期公式单位处理
      if (nextControl.enumDefault === 1) {
        const unitToNumber = parseInt(nextControl.unit, 10);
        const unit = _.isNumber(unitToNumber) ? DATE_FORMULA_UNIT[unitToNumber - 1] || '' : '';
        nextData = { ...nextData, unit };
      }

      if (nextControl.enumDefault === 2) {
        nextData = { ...nextData, enumDefault2: 16 };
      }
    }

    onChange({ ...nextData, sourceControlId: value });
  };

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('关联记录')}</div>
        <Select
          className="w100"
          placeholder={_l('请选择已添加的关联记录字段')}
          value={parsedDataSource || undefined}
          options={controls}
          fieldNames={SELECT_FIELD_NAMES}
          onChange={value => onChange({ dataSource: `$${value}$`, dot: 0 })}
        />
      </SettingItem>
      {dataSource && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('汇总')}</div>
            <Select
              className="w100"
              showPopupSearch
              optionFilterProp="label"
              value={summaryValue}
              options={summaryOptions}
              status={!summaryLoading && (!summaryControlName || summaryControlInvalid) ? 'error' : undefined}
              labelRender={() => {
                // 数据没回不显示已删除
                if (summaryLoading) return null;

                if (summaryControlInvalid) {
                  return <span className="textError">{_l('%0(无效类型)', summaryControlName)}</span>;
                }

                if (summaryControlName) return summaryControlName;

                return (
                  <Tooltip title={_l('ID: %0', summaryValue)} placement="bottom">
                    <span className="textError">{_l('字段已删除')}</span>
                  </Tooltip>
                );
              }}
              optionRender={({ data: item }) => (
                <div className="flexRow alignItemsCenter">
                  <i className={`icon-${item.icon} Font16 textTertiary mRight8`} />
                  <span className="overflow_ellipsis" title={item.label}>
                    {item.label}
                  </span>
                </div>
              )}
              notFoundContent={_l('暂无搜索结果')}
              onChange={handleChange}
            />
          </SettingItem>
          {sourceControlId && (
            <SettingItem>
              <Select
                className="w100"
                value={enumDefault}
                options={totalType.map(({ text: label, ...option }) => ({ ...option, label }))}
                optionRender={renderTotalTypeOption}
                onChange={value => {
                  const nextData = {
                    ...handleAdvancedSettingChange(data, { summaryresult: '' }),
                    enumDefault: value,
                    enumDefault2: 6,
                    dot: 0,
                  };

                  // 如果选择的是时间类型的汇总控件 则将enumDefault2设为时间类型
                  if (
                    selectedControl.type === 37 &&
                    _.includes([15, 16, 46], selectedControl.enumDefault2) &&
                    _.includes([2, 3], value)
                  ) {
                    onChange({
                      ...nextData,
                      enumDefault2: selectedControl.enumDefault2,
                      unit: '',
                    });
                    return;
                  }

                  // 他表字段关联的是时间
                  if (selectedControl.type === 30 && includes([2, 3], value)) {
                    onChange({
                      ...nextData,
                      enumDefault2: get(selectedControl, ['sourceControl', 'type']),
                      unit: '',
                    });
                    return;
                  }

                  if (_.includes([2, 3], value) && _.includes([15, 16, 46], selectedControl.type)) {
                    onChange({
                      ...nextData,
                      enumDefault2: selectedControl.type,
                      unit: getDefaultUnit(selectedControl),
                    });
                  } else {
                    onChange(nextData);
                  }
                }}
              />

              {_.includes([21, 22], enumDefault) && (
                <div className="labelWrap mTop16">
                  <Checkbox
                    checked={reportempty === '1'}
                    onChange={event => {
                      onChange(
                        handleAdvancedSettingChange(data, {
                          reportempty: String(+event.target.checked),
                        }),
                      );
                    }}
                    size="small"
                  >
                    {_l('包含空值')}
                  </Checkbox>
                </div>
              )}
            </SettingItem>
          )}
          {isLightweightRelate && (
            <div className="mTop16">
              <span className="Bold">{_l('注意：')}</span>
              {_l('当前关联记录已开启【轻量级单向关联】，当引用的数据源字段变更后，不会同步更新本表的汇总字段数据')}
            </div>
          )}
          <SettingItem>
            <div className="settingItemTitle">{_l('汇总范围')}</div>
            <div className="labelWrap">
              <Checkbox
                checked={!isEmpty(filters)}
                onChange={event => {
                  if (!event.target.checked) {
                    onChange(
                      handleAdvancedSettingChange(data, {
                        filters: '',
                      }),
                    );
                    return;
                  }

                  setVisible(true);
                }}
                size="small"
              >
                {_l('设置筛选条件')}
              </Checkbox>
            </div>
            {visible && (
              <FilterDialog
                {...props}
                sheetSwitchPermit={_.get(sheetData, 'info.switches')}
                relationControls={filterColumns}
                fromCondition={'subTotal'}
                helpHref="https://help.mingdao.com/worksheet/control-rollup"
                onChange={({ filters }) => {
                  onChange(handleAdvancedSettingChange(data, { filters: JSON.stringify(filters) }));
                  setVisible(false);
                }}
                onClose={() => setVisible(false)}
              />
            )}
            {!isEmpty(filters) && (
              <FilterItemTexts {...props} loading={loading} controls={filterColumns} editFn={() => setVisible(true)} />
            )}
          </SettingItem>
          {dataSource && !isEmpty(filters) && (includes([0, 5], enumDefault) || !sourceControlId) && (
            <SettingItem>
              <div className="settingItemTitle">{_l('显示')}</div>
              <Radio.Group
                size="small"
                value={summaryresult === '1' ? '1' : '0'}
                options={[
                  { text: _l('数值'), value: '0' },
                  {
                    text: _l('百分比'),
                    value: '1',
                  },
                ].map(({ text, ...option }) => ({ ...option, label: text }))}
                onChange={event =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      summaryresult: event.target.value,
                    }),
                  )
                }
              />
            </SettingItem>
          )}
          {isShowUnitConfig() && (
            <Fragment>
              <PointerConfig {...props} />
              {numshow !== '1' && (
                <SettingItem>
                  <div className="settingItemTitle">{_l('单位')}</div>
                  <PreSuffix {...props} />
                </SettingItem>
              )}
            </Fragment>
          )}

          {_.includes([15, 16, 46], enumDefault2) && _.includes([2, 3], enumDefault) && (
            <SettingItem>
              <div className="settingItemTitle">{_l('输出格式')}</div>
              <Select
                className="w100"
                value={unit}
                options={getOutputType(enumDefault2)}
                onChange={value => onChange({ unit: value })}
              />
            </SettingItem>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
