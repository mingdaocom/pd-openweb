import React, { useState, useEffect, Fragment, useRef } from 'react';
import { RadioGroup, Dropdown, Checkbox, Tooltip } from 'ming-ui';
import styled from 'styled-components';
import _, { get, includes, isEmpty } from 'lodash';
import { SettingItem } from '../../styled';
import {
  filterControlsFromAll,
  getControlByControlId,
  getIconByType,
  resortControlByColRow,
  isShowUnitConfig,
} from '../../util';
import {
  parseDataSource,
  filterByTypeAndSheetFieldType,
  handleAdvancedSettingChange,
  getAdvanceSetting,
} from '../../util/setting';
import { useSheetInfo } from '../../hooks';
import { FilterItemTexts, FilterDialog } from '../components/FilterData';
import WidgetDropdown from '../../components/Dropdown';
import PointerConfig from '../components/PointerConfig';
import PreSuffix from '../components/PreSuffix';
import { SYSTEM_CONTROL } from '../../config/widget';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import cx from 'classnames';

const DATE_FORMULA_UNIT = [_l('分钟'), _l('小时'), _l('天'), _l('月'), _l('年')];

const COMMON_TYPE = [
  { text: _l('已填计数'), value: 13 },
  { text: _l('未填计数'), value: 14 },
];

const NUMBER_TYPE = [
  ...COMMON_TYPE,
  { text: _l('求和'), value: 5 },
  { text: _l('平均值'), value: 1 },
  { text: _l('最大值'), value: 2 },
  { text: _l('最小值'), value: 3 },
];

const DATE_TYPE = [...COMMON_TYPE, { text: _l('最晚'), value: 2 }, { text: _l('最早'), value: 3 }];

const getOutputType = enumDefault2 => {
  if (enumDefault2 === 15) {
    return [
      { text: _l('年'), value: '5' },
      { text: _l('年-月'), value: '4' },
      { text: _l('年-月-日'), value: '3' },
    ];
  } else if (enumDefault2 === 16) {
    return [
      { text: _l('年-月-日 时'), value: '2' },
      { text: _l('年-月-日 时:分'), value: '1' },
      { text: _l('年-月-日 时:分:秒'), value: '6' },
    ];
  } else {
    return [
      { text: _l('时:分'), value: '8' },
      { text: _l('时:分:秒'), value: '9' },
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
  return COMMON_TYPE;
};

const RecordCount = styled.div`
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 6px;
`;

export default function Subtotal(props) {
  const { data, onChange, allControls, globalSheetInfo = {} } = props;
  const { sourceControlId, dataSource, enumDefault, enumDefault2, unit } = data;
  const { summaryresult = '0', numshow } = getAdvanceSetting(data);
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
  const { dataSource: worksheetId, relationControls } = getControlByControlId(allControls, parsedDataSource);
  const { loading, data: sheetData } = useSheetInfo({ worksheetId, relationWorksheetId: globalSheetInfo.worksheetId });
  // 空白子表手动取值
  const availableControls = (
    (sheetData.info || {}).worksheetId ? sheetData.controls || [] : (relationControls || []).concat(SYSTEM_CONTROL)
  ).filter(
    i =>
      !_.includes(
        ['wfname', 'wfcuaids', 'wfcaid', 'wfctime', 'wfrtime', 'wfftime', 'wfstatus', , 'rowid'],
        i.controlId,
      ),
  );
  const filterColumns = (sheetData.info || {}).worksheetId ? sheetData.controls || [] : relationControls || [];

  const selectedControl = getControlByControlId(availableControls, sourceControlId);
  const totalType = getTotalType(selectedControl);

  const filters = getAdvanceSetting(data, 'filters');

  const filterControls = filterByTypeAndSheetFieldType(
    resortControlByColRow(filterOnlyShowField(availableControls) || []),
    type => !includes([22, 25, 29, 30, 43, 45, 47, 49, 50, 51, 52, 10010], type),
  ).map(item => ({ value: item.controlId, text: item.controlName, icon: getIconByType(item.type) }));

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
        <div className="settingItemTitle">{_l('关联表')}</div>
        <Dropdown
          placeholder={_l('请选择已添加的关联记录字段')}
          border
          value={parsedDataSource || undefined}
          data={controls}
          onChange={value => onChange({ dataSource: `$${value}$`, dot: 0 })}
        />
      </SettingItem>
      {dataSource && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('汇总')}</div>
            <WidgetDropdown
              searchable
              value={sourceControlId || 'count'}
              data={[
                {
                  value: 'count',
                  text: _l('记录数量'),
                  icon: 'calculate',
                  className: 'recordCount',
                  children: (
                    <RecordCount>
                      <div className="item">
                        <i className={'icon-calculate Font16'}></i>
                        <div className="text">{_l('记录数量')}</div>
                      </div>
                    </RecordCount>
                  ),
                },
              ].concat(filterControls)}
              renderDisplay={value => {
                const originControl = availableControls.find(item => item.controlId === value);
                const controlName = value === 'count' ? _l('记录数量') : get(originControl, 'controlName');
                const invalidError =
                  originControl && originControl.type === 30 && (originControl.strDefault || '')[0] === '1';

                // 数据没回不显示已删除
                if (
                  loading ||
                  ((sheetData.info || {}).worksheetId && (sheetData.info || {}).worksheetId !== worksheetId)
                ) {
                  return <div className="text"></div>;
                }

                return (
                  <div className={cx('text', { Red: !controlName || invalidError })}>
                    {controlName ? (
                      invalidError ? (
                        _l('%0(无效类型)', controlName)
                      ) : (
                        controlName
                      )
                    ) : (
                      <Tooltip text={<span>{_l('ID: %0', value)}</span>} popupPlacement="bottom">
                        <span>{_l('字段已删除')}</span>
                      </Tooltip>
                    )}
                  </div>
                );
              }}
              onChange={handleChange}
            />
          </SettingItem>
          {sourceControlId && (
            <SettingItem>
              <Dropdown
                border
                value={enumDefault}
                data={totalType}
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
            </SettingItem>
          )}
          <SettingItem>
            <div className="settingItemTitle">{_l('汇总范围')}</div>
            <div className="labelWrap">
              <Checkbox
                checked={!isEmpty(filters)}
                size="small"
                text={_l('设置筛选条件')}
                onClick={checked => {
                  if (checked) {
                    onChange(handleAdvancedSettingChange(data, { filters: '' }));
                    return;
                  }
                  setVisible(true);
                }}
              />
            </div>
            {visible && (
              <FilterDialog
                {...props}
                sheetSwitchPermit={_.get(sheetData, 'info.switches')}
                relationControls={filterColumns}
                fromCondition={'subTotal'}
                helpHref={getHelpUrl('worksheet', 'rollup')}
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
              <RadioGroup
                size="small"
                checkedValue={summaryresult === '1' ? '1' : '0'}
                data={[
                  { text: _l('数值'), value: '0' },
                  {
                    text: _l('百分比'),
                    value: '1',
                  },
                ]}
                onChange={value => onChange(handleAdvancedSettingChange(data, { summaryresult: value }))}
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
              <Dropdown
                border
                value={unit}
                data={getOutputType(enumDefault2)}
                onChange={value => onChange({ unit: value })}
              />
            </SettingItem>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
