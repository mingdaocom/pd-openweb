import React, { Fragment } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Checkbox, Segmented, Select, Tooltip } from 'ming-ui/antd-components';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { DISPLAY_FROZEN_LIST } from 'src/utils/domain/control/setting';
import AttachmentConfig from '../AttachmentConfig';
import TableConfig from './component/TableConfig';
import TitleWrapConfig from './component/TitleWrapConfig';
import TreeTableLevel from './component/TreeTableLevel';

const DISPLAY_FROZEN_OPTIONS = DISPLAY_FROZEN_LIST.map(({ text: label, ...option }) => ({ ...option, label }));

const getDisplayOptions = layerControlId => [
  {
    label: _l('滚动'),
    value: '1',
  },
  {
    label: _l('分页'),
    value: '2',
    disabled: !!layerControlId,
  },
];

export default function SubListStyle(props) {
  const { data, onChange } = props;
  const {
    showtype = '1',
    blankrow = '1',
    rownum = '15',
    hidenumber,
    layercontrolid,
    detailworksheettype,
    direction = '0',
    openstatistics,
    rcsorttype = '2',
  } = getAdvanceSetting(data);
  const freezeIds = getAdvanceSetting(data, 'freezeids') || [];

  const { mode, sheetInfo } = window.subListSheetConfig[data.controlId] || {};
  const isRelateTable = mode === 'relate' || detailworksheettype !== '2';
  const tableControls =
    _.get(sheetInfo, ['template', 'controls']) || _.get(sheetInfo, 'relationControls') || data.relationControls || [];
  const tableData = tableControls
    .filter(c => c.type === 29 && c.dataSource === data.dataSource && c.enumDefault === 1)
    .map(i => ({ value: i.controlId, label: i.controlName }));

  const isDelete = layercontrolid && !_.find(tableControls, t => t.controlId === layercontrolid);
  const isUnSupport =
    layercontrolid &&
    !_.find(tableData, t => t.value === layercontrolid) &&
    _.find(tableControls, t => t.controlId === layercontrolid);

  return (
    <Fragment>
      <TableConfig {...props} />
      <SettingItem hidden={direction === '1'}>
        <div className="settingItemTitle">{_l('冻结列')}</div>
        <Select
          className="w100"
          value={freezeIds[0] || '0'}
          listHeight={250}
          options={DISPLAY_FROZEN_OPTIONS}
          onChange={value => {
            onChange(handleAdvancedSettingChange(data, { freezeids: value === '0' ? '' : JSON.stringify([value]) }));
          }}
        />
      </SettingItem>
      {isRelateTable && direction !== '1' && (
        <SettingItem>
          <div className="settingItemTitle">
            {_l('树形表格')}
            {isUnSupport && (
              <Tooltip placement="bottom" title={_l('该关联记录字段不是一对多关系')}>
                <Icon className="Font20 mLeft8 Red" icon="error1" />
              </Tooltip>
            )}
          </div>
          <Select
            className="w100"
            status={isUnSupport ? 'error' : undefined}
            allowClear
            placeholder={_l('选择子表中的关联本表字段')}
            value={layercontrolid || undefined}
            labelRender={() => {
              if (isDelete) return <span className="Red">{_l('已删除')}</span>;
              return _.get(
                _.find(tableControls, t => t.controlId === layercontrolid),
                'controlName',
              );
            }}
            options={tableData}
            notFoundContent={_l('未添加关联本表字段')}
            onChange={value => {
              if (layercontrolid === value) return;
              onChange(
                handleAdvancedSettingChange(data, {
                  layercontrolid: value || '',
                  ...(value
                    ? {
                        showcount: '1',
                        showtype: '1',
                        defaultlayer: '5',
                        ...(openstatistics === '1' ? { openstatistics: '0' } : {}),
                        ...(rcsorttype === '1' ? { rcsorttype: '2' } : {}),
                      }
                    : {}),
                }),
              );
            }}
          />
          <div className="mTop10 textTertiary">
            {_l('选择一个一对多关系的本表关联字段，数据将按此字段的父级（单条）、子级（多条）关系构成树形表格')}
          </div>
        </SettingItem>
      )}
      {layercontrolid && <TreeTableLevel {...props} />}
      <SettingItem hidden={direction === '1'}>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <Segmented
          block
          value={showtype}
          options={getDisplayOptions(layercontrolid)}
          onChange={value => onChange(handleAdvancedSettingChange(data, { showtype: value }))}
        />
      </SettingItem>
      <SettingItem hidden={direction === '1'}>
        <div className="settingItemTitle">
          {_l('默认空行')}
          <Tooltip
            placement="bottom"
            title={_l('开启后无论子表中是否存在记录，都会显示固定数量的行数。当子表没有记录时，将显示空白行。')}
          >
            <i className="icon-help tipsIcon textTertiary Font16 pointer"></i>
          </Tooltip>
        </div>
        <div className="flexCenter">
          <AttachmentConfig
            data={handleAdvancedSettingChange(data, { blankrow })}
            attr="blankrow"
            maxNum={Number(rownum) || 15}
            minCount={0}
            onChange={value => {
              let tempRow = getAdvanceSetting(value, 'blankrow');

              if (tempRow > Number(rownum)) {
                tempRow = Number(rownum) || 0;
              }

              onChange(handleAdvancedSettingChange(data, { blankrow: tempRow.toString() }));
            }}
          />
          <span className="mLeft12">{_l('行')}</span>
        </div>
      </SettingItem>
      <SettingItem hidden={direction === '1'}>
        <div className="settingItemTitle">
          {showtype === '1' ? _l('最大高度（滚动方式）') : _l('最大高度（每页行数）')}
        </div>
        <div className="flexCenter">
          <AttachmentConfig
            data={handleAdvancedSettingChange(data, { rownum })}
            attr="rownum"
            maxNum={200}
            onChange={value => {
              let tempRowNum = getAdvanceSetting(value, 'rownum');

              if (tempRowNum < Number(blankrow)) {
                tempRowNum = Number(blankrow) || 15;
              }

              onChange(handleAdvancedSettingChange(data, { rownum: tempRowNum.toString() }));
            }}
          />
          <span className="mLeft12">{_l('行')}</span>
        </div>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('其他')}</div>
        <div className="labelWrap">
          <Checkbox
            checked={hidenumber !== '1'}
            onChange={event => {
              onChange(
                handleAdvancedSettingChange(data, {
                  hidenumber: !event.target.checked ? '1' : '0',
                }),
              );
            }}
            size="small"
          >
            {_l('显示序号')}
          </Checkbox>
        </div>
        {direction !== '1' && <TitleWrapConfig {...props} />}
      </SettingItem>
    </Fragment>
  );
}
