import React, { Fragment, useEffect, useState } from 'react';
import { LoadDiv } from 'ming-ui';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import worksheetAjax from 'src/api/worksheet';
import styled from 'styled-components';
import { getSortData } from 'src/pages/worksheet/util';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { EditInfo, SettingItem } from '../../styled';
import {
  getControlsSorts,
  getDefaultShowControls,
  handleAdvancedSettingChange,
  canAsUniqueWidget,
} from '../../util/setting';
import {
  getAdvanceSetting,
  resortControlByColRow,
  dealControlData,
  formatSearchConfigs,
  toEditWidgetPage,
} from '../../util';
import subListComponents from '../components/sublist';
import _, { isEmpty, find, filter, findIndex } from 'lodash';
import DynamicDefaultValue from '../components/DynamicDefaultValue';
import WidgetVerify from '../components/WidgetVerify';
import RelateDetailInfo from '../components/RelateDetailInfo';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { ALL_SYS } from '../../config/widget';
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
  .globalDetail {
    width: 100%;
    min-height: 36px;
    background: #f5f5f5;
    line-height: 1.5;
    padding: 8px 12px;
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
  const uniqueControls = getAdvanceSetting(data, 'uniquecontrols') || [];

  // 支持配置不允许重复
  const supportControls = relationControls.filter(i => canAsUniqueWidget(i) && !_.includes(ALL_SYS, i.controlId));
  // 支持配置不允许重复并且已被设为可见的字段
  const supportUniqControls = supportControls.filter(i => _.includes(showControls, i.controlId));
  // 全局不重复id合集
  const globalUniqControlIds = subListMode === 'new' ? [] : supportControls.filter(i => i.unique).map(i => i.controlId);
  // 本记录不重复controls
  const recordUniqControls = supportUniqControls.filter(i => !_.includes(globalUniqControlIds, i.controlId));
  // 本记录不重复id合集
  const showUniqueControls = recordUniqControls
    .filter(r => _.includes(uniqueControls, r.controlId))
    .map(i => i.controlId)
    .filter(_.identity);

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
          if (res.resultCode === 4) return;
          const controls = _.get(res, ['template', 'controls']);
          const saveData = _.find(allControls, i => i.controlId === data.controlId) || {};

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
        ? !_.includes([43, 45, 47, 49, 51, 52, 10010], item.type)
        : !(
            _.includes([34, 43, 45, 47, 49, 51, 52, 10010], item.type) ||
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
        if (res.resultCode === 4) return;
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
        nextData = { ...nextData, relationControls: dealControlData(controls), needUpdate: false };

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

  const renderUniqText = isGlobal => {
    const textControls = isGlobal ? globalUniqControlIds : showUniqueControls;
    const textArr = textControls
      .map(i => {
        return _.get(
          _.find(relationControls, r => r.controlId === i),
          'controlName',
        );
      })
      .filter(_.identity)
      .join('、');

    if (isGlobal) {
      if (!textControls.length) {
        return <span className="Gray_9e">{_l('未设置')}</span>;
      } else {
        return <span>{textArr}</span>;
      }
    }

    return (
      <div className="Dropdown--input Dropdown--border Hand">
        <span>{textArr}</span>
        <div className="ming Icon icon icon-arrow-down-border mLeft8 Gray_9e" />
      </div>
    );
  };

  const renderUniqControls = () => {
    return (
      <SortColumns
        noempty={false}
        showControls={showUniqueControls}
        columns={recordUniqControls}
        children={renderUniqText()}
        showOperate={false}
        onChange={({ newShowControls }) => {
          onChange(handleAdvancedSettingChange(data, { uniquecontrols: JSON.stringify(newShowControls) }));
        }}
      />
    );
  };

  return (
    <SettingModelWrap>
      {!dataSource && <AddSubList {...props} onOk={onOk} />}
      {subListMode !== 'new' && <RelateDetailInfo {...props} sheetInfo={sheetInfo} />}
      <SettingItem>{getConfigContent()}</SettingItem>
      <WidgetVerify {...props} />

      {/**子表不允许重复 */}
      {subListMode !== 'new' && (
        <SettingItem>
          <div className="settingItemTitle Normal">
            {_l('全局不允许重复输入')}
            <Tooltip
              placement={'bottom'}
              title={_l(
                '以下字段在关联表中设为不允许重复。除了在本记录中不能重复输入外，也不能与关联表中的所有数据重复。',
              )}
            >
              <i className="icon-help tipsIcon Gray_9e Font16 pointer" />
            </Tooltip>
          </div>
          <div className="globalDetail">{renderUniqText(true)}</div>
        </SettingItem>
      )}
      <SettingItem>
        <div className="settingItemTitle Normal">
          {_l('本记录内不允许重复输入')}
          <Tooltip placement={'bottom'} title={_l('以下字段不允许在当前主记录内重复输入')}>
            <i className="icon-help tipsIcon Gray_9e Font16 pointer" />
          </Tooltip>
        </div>
        {renderUniqControls()}
      </SettingItem>

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
                    const value = control.controlId ? `${control.controlName}：${text}` : '';
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
