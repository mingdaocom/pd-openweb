import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { Modal, Radio, Select, Tooltip } from 'ming-ui/antd-components';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { CAN_NOT_AS_OTHER_FIELD } from 'src/utils/domain/control/config';
import { isFullLineControl, resortControlByColRow } from 'src/utils/domain/control/editorLayout';
import { isSingleRelateSheet, updateConfig } from 'src/utils/domain/control/editorSetting';
import { filterControlsFromAll, filterOnlyShowField } from 'src/utils/domain/control/filters';
import { WHOLE_SIZE } from 'src/utils/domain/control/layout';
import { getIconByType, parseDataSource } from 'src/utils/domain/control/metadata';
import { SYS_CONTROLS } from 'src/utils/domain/control/widget';
import { SYSTEM_CONTROLS } from 'src/utils/domain/worksheet/constants';
import { useSheetInfo } from '../../hooks';
import { SettingItem } from '../../styled';
import WorksheetReference from '../components/WorksheetReference';

const SHEET_FIELD_TYPES = [
  {
    value: '1',
    text: _l('仅显示'),
  },
  {
    value: '0',
    text: _l('存储数据'),
  },
];

const getFieldsByControls = (controls = []) => {
  return resortControlByColRow(controls.filter(i => !_.includes(SYS_CONTROLS, i.controlId))).filter(
    ({ type, enumDefault }) => !(_.includes(CAN_NOT_AS_OTHER_FIELD, type) || (type === 38 && enumDefault === 3)),
  );
};

export default function SheetField(props) {
  const {
    data,
    allControls,
    onChange,
    globalSheetInfo = {},
    status: { saveIndex },
  } = props;
  const { controlId, dataSource, strDefault = '10' } = data;

  const showType = strDefault.split('')[0] || '0';

  const parsedDataSource = parseDataSource(dataSource);
  const [{ sheetDel, controlDel, dataSourceDisabled, sheetFieldDisabled }, setInfo] = useSetState({
    sheetDel: false,
    controlDel: false,
    dataSourceDisabled: false,
    sheetFieldDisabled: false,
  });
  const saveControlId =
    _.get(
      _.find(allControls, i => i.controlId === controlId),
      'controlId',
    ) || '';
  const isSaved = controlId && saveControlId && !saveControlId.includes('-');
  // 取关联单条
  const sheetList = filterControlsFromAll(allControls, item => isSingleRelateSheet(item) || item.type === 35);
  const relateControl = allControls.find(item => item.controlId === parsedDataSource);
  const isLightweightRelate = _.get(relateControl, 'advancedSetting.notautopassive') === '1';

  const worksheetId = _.get(relateControl, 'dataSource');

  const {
    loading,
    data: { controls },
  } = useSheetInfo({ worksheetId, relationWorksheetId: globalSheetInfo.worksheetId });

  const fields = getFieldsByControls(controls);
  const filteredFields = filterOnlyShowField(fields);

  const updateDisabledInfo = () => {
    const sheetObj = _.find(sheetList, item => item.value === parsedDataSource);
    const relationControls = _.get(
      allControls.find(item => _.get(item, 'controlId') === parsedDataSource),
      'relationControls',
    );
    const controlObj = _.find(
      (relationControls || []).concat(SYSTEM_CONTROLS),
      i => i.controlId === data.sourceControlId,
    );
    const sheetDel = parsedDataSource && !sheetObj;
    const controlDel = data.sourceControlId && !controlObj;
    const oneDelete = sheetDel || controlDel;
    const tempSaved = isSaved && parsedDataSource && data.sourceControlId;
    setInfo({
      sheetDel,
      controlDel,
      dataSourceDisabled: tempSaved ? !oneDelete : false,
      sheetFieldDisabled: tempSaved ? !oneDelete : !parsedDataSource,
    });
  };

  useEffect(updateDisabledInfo, [controlId]);
  useEffect(() => {
    // 关联记录被删除
    if (_.isUndefined(worksheetId) && parsedDataSource && isSaved) {
      updateDisabledInfo();
    }

    if (saveIndex) {
      setTimeout(updateDisabledInfo, 50);
    }
  }, [worksheetId, saveIndex]);

  const sureChangeToOnlyShow = () => {
    Modal.confirm({
      title: <span className="Font16">{_l('修改他表字段类型为：仅显示')}</span>,
      content: (
        <span className="textTertiary">
          {_l(
            '修改后将清除此字段存储的数据。此字段将不能在用于搜索、筛选、公式、文本组合、统计。请确认以上位置都不再需要此字段的数据后执行操作。',
          )}
        </span>
      ),
      footerLeftElement: <WorksheetReference {...props} />,
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        updateValue('1');
      },
    });
  };

  const updateValue = value => {
    onChange({ strDefault: updateConfig({ config: strDefault || '00', value, index: 0 }) });
  };

  return (
    <div className="settingItemWrap">
      <SettingItem>
        <div className="settingItemTitle">{_l('关联记录')}</div>
        {loading ? (
          <LoadDiv />
        ) : (
          <Select
            className="w100"
            value={parsedDataSource || undefined}
            disabled={dataSourceDisabled}
            status={parsedDataSource && !worksheetId ? 'error' : undefined}
            placeholder={_l('选择配置的 “关联记录” 字段')}
            options={sheetList.map(({ value, text }) => ({ value, label: text }))}
            notFoundContent={_l('请先添加一个 ”关联记录“ 字段')}
            labelRender={({ label }) => (sheetDel ? <span className="textError">{_l('关联记录已删除')}</span> : label)}
            onChange={value => {
              if (parsedDataSource === value) return;
              onChange({ dataSource: `$${value}$`, sourceControlId: '', sourceControl: '' });
              setInfo({
                sheetDel: false,
                sheetFieldDisabled: !isSaved ? false : sheetFieldDisabled,
              });
            }}
          />
        )}
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示字段')}</div>
        <Select
          className="w100"
          value={data.sourceControlId || undefined}
          disabled={sheetFieldDisabled}
          status={data.sourceControlId && (controlDel || (!loading && !worksheetId)) ? 'error' : undefined}
          placeholder={_l('请选择')}
          showPopupSearch
          optionFilterProp="label"
          options={filteredFields.map(item => ({ value: item.controlId, label: item.controlName, control: item }))}
          notFoundContent={_l('搜索结果为空')}
          labelRender={({ label }) =>
            controlDel ? (
              <Tooltip title={<span>{_l('ID: %0', data.sourceControlId)}</span>} placement="bottom">
                <span className="textError">{_l('字段已删除')}</span>
              </Tooltip>
            ) : (
              label
            )
          }
          optionRender={({ data: { control: item } }) => (
            <div className="flexRow alignItemsCenter">
              <i className={`Font16 mRight8 textTertiary icon-${getIconByType(item.type)}`} />
              <span className="overflow_ellipsis">{item.controlName}</span>
            </div>
          )}
          onChange={(controlId, { control: item }) => {
            onChange({
              ...handleAdvancedSettingChange(data, { datamask: '0' }),
              sourceControlId: controlId,
              sourceControl: item,
              controlName: item.controlName,
              size: isFullLineControl(item) ? WHOLE_SIZE : data.size,
            });
            setInfo({ controlDel: false });
          }}
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <Radio.Group
          size="middle"
          value={showType}
          options={(SHEET_FIELD_TYPES || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={event => {
            const type = event.target.value;

            if (type === '1') {
              if (isSaved) {
                sureChangeToOnlyShow();
              } else {
                updateValue('1');
              }
            } else {
              updateValue('0');
            }
          }}
        />
      </SettingItem>
      {showType === '1' ? (
        <div className="textTertiary mTop10">{_l('在加载记录时实时获取数据。适合只需要显示字段的场景。')}</div>
      ) : (
        <div>
          <div className="textTertiary mTop10">
            {isLightweightRelate
              ? _l('在当前表中存储数据，存储后他表字段可用于工作表搜索、筛选、排序、统计，或被公式、文本组合字段使用。')
              : _l(
                  '在当前表中存储数据并保持同步，存储后他表字段可用于工作表搜索、筛选、排序、统计，或被公式、文本组合字段使用。',
                )}
          </div>
          {isLightweightRelate ? (
            <div className="mTop10">
              <span className="Bold">{_l('注意：')}</span>
              {_l('当前关联记录已开启【轻量级单向关联】：当引用的数据源的字段变更后，不会同步更新本表的他表字段数据。')}
            </div>
          ) : (
            <div className="mTop10">
              <span>
                {_l(
                  '注意：1.存储的数据与实际数据存在一定延时；2.当显示字段的数据变更后，最大支持更新与之关联的1000行数据。',
                )}
              </span>
              <span className="textTertiary">
                {_l('所以此方式适合显示字段的值不会变更，或虽然变更但关联的记录数量较少（不超过1000行）的场景。')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
