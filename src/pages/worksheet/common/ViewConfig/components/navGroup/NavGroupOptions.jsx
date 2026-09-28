import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import NavSort from '../NavSort';
import NavShow from './NavShow';
import { WrapDrop } from './styles';
import { getSetHtmlData } from './util';

const SORT_CONTROL_TYPES = [29, 26, 9, 10, 11, 28, 27, 48];
const OPTION_SORT_CONTROL_TYPES = [9, 10, 11, 28];
const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

export default function NavGroupOptions({
  data,
  navGroup,
  view,
  relateSheetInfo,
  relateControls,
  worksheetControls,
  currentSheetInfo,
  columns,
  navshow,
  navfilters,
  updateView,
  updateCurrentView,
}) {
  const selectedControl = worksheetControls.find(control => control.controlId === navGroup.controlId) || {};
  const canSort = [selectedControl.type, selectedControl.sourceControlType].some(type =>
    SORT_CONTROL_TYPES.includes(type),
  );
  const isOptionSort = [selectedControl.type, selectedControl.sourceControlType].some(type =>
    OPTION_SORT_CONTROL_TYPES.includes(type),
  );

  const handleNavSortChange = newValue => {
    const editAdKeys = Object.keys(newValue);
    const editAttrs = ['advancedSetting'];
    let navGroupData = {};

    if (editAdKeys.includes('navsorts') && isOptionSort) {
      navGroupData = { navGroup: [{ ...navGroup, isAsc: String(newValue.navsorts) !== '1' }] };
      editAttrs.push('navGroup');
    }

    updateCurrentView({
      ...view,
      ...navGroupData,
      appId: currentSheetInfo.appId,
      advancedSetting: newValue,
      editAttrs,
      editAdKeys,
    });
  };

  return getSetHtmlData(data.type).map(item => {
    let optionTypes = item.types;

    if (item.key === 'viewId' && data.type === 29) {
      optionTypes = relateSheetInfo.length
        ? relateSheetInfo
        : [
            {
              text: <span className="textSecondary">{_l('关联表中没有本表关联类型的层级视图，请先去添加一个')}</span>,
              isTip: true,
            },
          ];
    }

    if (
      (data.type === 29 && !navGroup.viewId && item.key === 'filterType') ||
      (data.type === 29 && navGroup.viewId && item.key === 'navshow') ||
      item.key === 'isAsc'
    ) {
      return null;
    }

    let value = !navGroup[item.key] && data.type === 29 ? null : navGroup[item.key];
    const optionTip = optionTypes.find(option => option.isTip);
    const selectOptions = optionTypes.filter(option => !option.isTip);

    if (item.key === 'filterType' && [29, 35].includes(data.type)) {
      value = value === 11 ? value : 24;
    }

    if (item.key === 'navshow') {
      return (
        <WrapDrop key={item.key}>
          <NavShow
            canShowAll
            canShowNull
            canShowAllNavLayer={data.type === 27 && navshow === '2'}
            params={item}
            value={navshow}
            onChange={newValue => {
              const advancedSetting =
                newValue.navshow === '2' ? { ...newValue, navsorts: '', customnavs: '' } : newValue;
              updateCurrentView({
                ...view,
                advancedSetting,
                editAttrs: ['advancedSetting'],
                editAdKeys: Object.keys(advancedSetting),
              });
            }}
            advancedSetting={view.advancedSetting}
            navfilters={navfilters}
            filterInfo={{
              relateControls,
              allControls: worksheetControls,
              globalSheetInfo: _.pick(currentSheetInfo, [
                'appId',
                'groupId',
                'name',
                'projectId',
                'roleType',
                'worksheetId',
                'switches',
              ]),
              columns,
              navGroupId: data.controlId,
            }}
          />
          {canSort && navshow !== '2' && (
            <NavSort
              view={view}
              customitemsKey="customnavs"
              viewControlData={selectedControl}
              appId={currentSheetInfo.appId}
              projectId={currentSheetInfo.projectId}
              controls={worksheetControls}
              advancedSetting={view.advancedSetting}
              onChange={handleNavSortChange}
            />
          )}
        </WrapDrop>
      );
    }

    return (
      <React.Fragment key={item.key}>
        {item.txt && <div className="title mTop30 textPrimary Bold">{item.txt}</div>}
        {item.des && <div className="des mTop5 textSecondary">{item.des}</div>}
        <Select
          options={selectOptions}
          fieldNames={SELECT_FIELD_NAMES}
          notFoundContent={optionTip ? optionTip.text : undefined}
          value={value}
          className="w100 mTop8"
          onChange={newValue => {
            updateView(
              { ...navGroup, [item.key]: newValue },
              item.key === 'viewId' && data.type === 29
                ? { navshow: '0', navfilters: JSON.stringify([]), navsorts: '', customnavs: '' }
                : null,
            );
          }}
          labelRender={({ label }) =>
            data.type === 29 && value && item.key === 'viewId' && !selectOptions.find(o => o.value === value) ? (
              <span className="Red TxtMiddle">
                <Icon icon="error1" className={cx('mRight12 Font16')} />
                <span>{_l('该视图已删除')}</span>
              </span>
            ) : (
              label
            )
          }
        />
      </React.Fragment>
    );
  });
}
