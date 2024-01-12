import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Menu, MenuItem, LoadDiv } from 'ming-ui';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import cx from 'classnames';
import worksheetAjax from 'src/api/worksheet';
import appManagementAjax from 'src/api/appManagement';
import styled from 'styled-components';
import { getSortData } from 'src/pages/worksheet/util';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { EditInfo, SettingItem, WidgetIntroWrap } from '../../styled';
import { getControlsSorts, getDefaultShowControls, handleAdvancedSettingChange } from '../../util/setting';
import Components from '../components';
import {
  canSetAsTitle,
  getAdvanceSetting,
  resortControlByColRow,
  dealControlData,
  formatSearchConfigs,
} from '../../util';
import subListComponents from '../components/sublist';
import _, { isEmpty, find, filter, findIndex } from 'lodash';
import { DEFAULT_INTRO_LINK } from '../../config';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import WidgetVerify from '../components/WidgetVerify';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
const { AddSubList, ConfigureControls, Sort } = subListComponents;

const SettingModelWrap = styled.div`
  .transferToRelate {
    position: absolute;
    top: 0;
    right: 0;
  }
  .targetEle .Dropdown--input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #ccc;
    line-height: 34px;
    padding: 0 12px;
    border-radius: 3px;
  }
`;

export default function SubListSetting(props) {
  const { status, allControls, data, onChange } = props;
  const { controlId, dataSource, relationControls = [], showControls = [], needUpdate } = data;
  const [sheetInfo, setInfo] = useState({});
  const [subQueryConfigs, setSubQueryConfigs] = useState([]);
  const [subListMode, setMode] = useState('new');
  const [loading, setLoading] = useState(false);

  const [{ sortVisible }, setConfig] = useSetState({
    sortVisible: false,
  });
  const sorts = _.isArray(getAdvanceSetting(data, 'sorts')) ? getAdvanceSetting(data, 'sorts') : [];

  useEffect(() => {
    if (dataSource && window.subListSheetConfig[controlId]) {
      const { sheetInfo, subQueryConfigs = [] } = window.subListSheetConfig[controlId] || {};
      setInfo(sheetInfo);
      setSubQueryConfigs(subQueryConfigs);
    }
  }, [controlId]);

  useEffect(() => {
    const { saveIndex } = status;
    if ((window.subListSheetConfig[controlId] || {}).saveIndex === saveIndex) {
      return;
    }
    if (saveIndex && dataSource && !dataSource.includes('-')) {
      setLoading(true);
      worksheetAjax
        .getWorksheetInfo({ worksheetId: dataSource, getTemplate: true, getControlType: 11 })
        .then(res => {
          const controls = _.get(res, ['template', 'controls']);
          const saveData = _.find(allControls, i => i.controlId === data.controlId);

          // 关联表子表因为无法新增字段 所以不需要更新relationControls
          if (res.type !== 2) return;
          const { showControls } = allControls.find(item => item.controlId === controlId);
          onChange({
            ...saveData,
            relationControls: dealControlData(controls),
            showControls,
          });
          window.subListSheetConfig = {
            [controlId]: {
              status: true,
              mode: res.type === 2 ? 'new' : 'relate',
              saveIndex,
              sheetInfo: res,
            },
          };
          getQueryConfigs(res);
        })
        .always(() => {
          setLoading(false);
        });
    }
  }, [status.saveIndex]);

  const getQueryConfigs = ({ isWorksheetQuery, worksheetId }) => {
    if (isWorksheetQuery) {
      worksheetAjax.getQueryBySheetId({ worksheetId }).then(res => {
        const formatSearchData = formatSearchConfigs(res);
        setSubQueryConfigs(formatSearchData);
        window.subListSheetConfig[controlId] = {
          ...(window.subListSheetConfig[controlId] || {}),
          subQueryConfigs: formatSearchData || [],
        };
      });
    }
  };

  const updateSubQueryConfigs = (value = {}, mode) => {
    const index = findIndex(subQueryConfigs, item => item.controlId === value.controlId);
    let newQueryConfigs = subQueryConfigs.slice();
    if (mode) {
      index > -1 && newQueryConfigs.splice(index, 1);
    } else {
      index > -1 ? newQueryConfigs.splice(index, 1, value) : newQueryConfigs.push(value);
    }
    setSubQueryConfigs(newQueryConfigs);
  };

  const filterRelationControls = info => {
    const reControls = _.get(info, ['template', 'controls']) || _.get(info, 'relationControls') || [];
    const needShow = (showControls || []).some(i => {
      const c = _.find(reControls || [], a => a.controlId === i) || {};
      return (
        c.type === 34 ||
        (c.type === 29 && String(c.enumDefault) === '2' && _.get(c, 'advancedSetting.showtype') === '2')
      );
    });
    return reControls.filter(item =>
      needShow
        ? !_.includes([22, 43, 45, 47, 49, 51, 52, 10010], item.type)
        : !(
            _.includes([22, 34, 43, 45, 47, 49, 51, 52, 10010], item.type) ||
            (item.type === 29 && String(item.enumDefault) === '2' && _.get(item, 'advancedSetting.showtype') === '2')
          ),
    );
  };

  useEffect(() => {
    if (!dataSource) return;
    // 从空白创建的子表
    if (dataSource.includes('-')) {
      setMode('new');
      return;
    }
    if ((window.subListSheetConfig[controlId] || {}).status && !needUpdate) {
      setMode(_.get(window.subListSheetConfig[controlId], 'mode'));
      return;
    }
    setLoading(true);
    worksheetAjax
      .getWorksheetInfo({ worksheetId: dataSource, getTemplate: true, getControlType: 11 })
      .then(res => {
        const controls = filterRelationControls(res);
        const defaultShowControls = getDefaultShowControls(controls);
        setInfo(res);
        window.subListSheetConfig[controlId] = {
          status: true,
          mode: res.type === 2 ? 'new' : 'relate',
          saveIndex: status.saveIndex,
          sheetInfo: res,
        };
        setMode(res.type === 2 ? 'new' : 'relate');
        let oriShowControls = isEmpty(showControls)
          ? defaultShowControls
          : _.isEmpty(showControls.filter(s => find(controls, c => c.controlId === s)))
          ? defaultShowControls.slice(0, (showControls || []).length)
          : showControls;
        let nextData = {
          showControls:
            res.type === 2 ? oriShowControls.filter(i => !_.includes(['caid', 'utime', 'ctime'], i)) : oriShowControls,
        };
        nextData = { ...nextData, relationControls: dealControlData(controls) };
        // 子表工作表查询
        getQueryConfigs(res);
        onChange(nextData);
      })
      .always(() => {
        setLoading(false);
      });
  }, [dataSource, needUpdate]);

  const onOk = ({ createType, sheetId, appId, controlName }) => {
    // 从空白创建时,创建一个占位dataSource
    if (createType === '1') {
      onChange({ dataSource: uuidv4() });
    } else {
      onChange({ appId, dataSource: sheetId, controlName });
    }
  };

  const getConfigContent = () => {
    if (loading) return <LoadDiv />;
    if (subListMode === 'new') {
      return (
        <Fragment>
          <div className="settingItemTitle">{_l('字段')}</div>
          {dataSource ? (
            <ConfigureControls
              {...props}
              subQueryConfigs={subQueryConfigs}
              updateSubQueryConfigs={updateSubQueryConfigs}
              controls={filter(
                showControls.map(id => find(relationControls, item => item.controlId === id)),
                item => !isEmpty(item),
              )}
            />
          ) : (
            <LoadDiv />
          )}
        </Fragment>
      );
    }
    const sortedControls = resortControlByColRow(dealControlData(filterRelationControls(sheetInfo)));
    return (
      <Fragment>
        <div className="settingItemTitle">{_l('显示字段')}</div>
        {!_.isEmpty(relationControls) && (
          <SortColumns
            min1msg={_l('至少显示一列')}
            showControls={showControls}
            columns={sortedControls}
            maxSelectedNum={100}
            controlsSorts={getControlsSorts(data, sortedControls)}
            onChange={({ newShowControls, newControlSorts }) => {
              const nextShowControls = newControlSorts.filter(item => _.includes(newShowControls, item));
              onChange({
                ...handleAdvancedSettingChange(data, {
                  controlssorts: JSON.stringify(newControlSorts),
                }),
                showControls: nextShowControls,
              });
            }}
          />
        )}
      </Fragment>
    );
  };

  return (
    <SettingModelWrap>
      {!dataSource && <AddSubList {...props} onOk={onOk} />}
      {subListMode !== 'new' && <Components.RelateSheetInfo name={sheetInfo.name} id={sheetInfo.worksheetId} />}
      <SettingItem>{getConfigContent()}</SettingItem>
      <WidgetVerify {...props} />
      {relationControls.length > 0 && (
        <SettingItem>
          <div className="settingItemTitle">{_l('排序')}</div>
          <EditInfo className="pointer subListSortInput" onClick={() => setConfig({ sortVisible: true })}>
            <div className="overflow_ellipsis Gray">
              {sorts.length > 0
                ? sorts.reduce((p, item) => {
                    const sortsRelationControls = relationControls
                      .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
                      .concat(SYSTEM_CONTROLS);
                    const control = sortsRelationControls.find(({ controlId }) => item.controlId === controlId) || {};
                    const flag = item.isAsc === true ? 2 : 1;
                    const { text } = getSortData(control.type, control).find(item => item.value === flag);
                    const value = control.controlId ? _l('%0: %1', control.controlName, text) : '';
                    return p ? `${p}；${value}` : value;
                  }, '')
                : _l('创建时间-最旧的在前')}
            </div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </EditInfo>
          {sortVisible && (
            <Sort {...props} controls={relationControls} onClose={() => setConfig({ sortVisible: false })} />
          )}
        </SettingItem>
      )}
      <DynamicDefaultValue
        {...props}
        data={{ ...data, relationControls: relationControls || [] }}
        appId={sheetInfo.appId}
      />
    </SettingModelWrap>
  );
}
