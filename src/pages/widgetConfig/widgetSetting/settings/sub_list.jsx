import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Menu, MenuItem, LoadDiv, Support } from 'ming-ui';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import update from 'immutability-helper';
import uuid from 'uuid/v4';
import cx from 'classnames';
import { getWorksheetInfo } from 'src/api/worksheet';
import { changeSheet } from 'src/api/appManagement';
import styled from 'styled-components';
import { getSortData } from 'src/pages/worksheet/util';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import SheetComponents from '../components/relateSheet';
import { EditInfo, InfoWrap, SettingItem, WidgetIntroWrap } from '../../styled';
import { getControlsSorts, getDefaultShowControls, handleAdvancedSettingChange } from '../../util/setting';
import Components from '../components';
import { canSetAsTitle, getAdvanceSetting, resortControlByColRow, dealControlData } from '../../util';
import subListComponents from '../components/sublist';
import { isEmpty, find, filter } from 'lodash';
import { DEFAULT_INTRO_LINK } from '../../config';
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
  const { status, allControls, info, data, globalSheetInfo, onChange } = props;
  const { widgetName, icon, intro, moreIntroLink } = info;
  const { worksheetId: currentWorksheetId } = globalSheetInfo;
  const { controlId, dataSource, relationControls = [], showControls = [] } = data;
  const [sheetInfo, setInfo] = useState({});
  const [subListMode, setMode] = useState('new');
  const [loading, setLoading] = useState(false);

  const [{ setTitleVisible, switchVisible, sortVisible }, setConfig] = useSetState({
    setTitleVisible: false,
    switchVisible: false,
    sortVisible: false,
  });
  const sorts = _.isArray(getAdvanceSetting(data, 'sorts')) ? getAdvanceSetting(data, 'sorts') : [];

  useEffect(() => {
    const { saveIndex } = status;
    if (saveIndex) {
      setLoading(true);
      getWorksheetInfo({ worksheetId: dataSource, getTemplate: true })
        .then(res => {
          const controls = _.get(res, ['template', 'controls']);
          // 关联表子表因为无法新增字段 所以不需要更新relationControls
          if (res.type !== 2) return;
          const { showControls } = allControls.find(item => item.controlId === controlId);
          onChange({
            relationControls: dealControlData(controls),
            showControls,
          });
        })
        .always(() => {
          setLoading(false);
        });
    }
  }, [status.saveIndex]);

  useEffect(() => {
    if (!dataSource) return;
    // 从空白创建的子表
    if (dataSource.includes('-')) {
      setMode('new');
      return;
    }
    setLoading(true);
    getWorksheetInfo({ worksheetId: dataSource, getTemplate: true })
      .then(res => {
        const controls = _.get(res, ['template', 'controls']).filter(item => item.controlId !== 'ownerid');
        const defaultShowControls = getDefaultShowControls(controls);
        setInfo(res);
        setMode(res.type === 2 ? 'new' : 'relate');
        let nextData = {
          showControls: isEmpty(showControls) ? defaultShowControls : showControls,
        };
        // if ([0, 1].includes(res.type)) {
        nextData = { ...nextData, relationControls: dealControlData(controls) };
        // }
        onChange(nextData);
      })
      .always(() => {
        setLoading(false);
      });
  }, [dataSource]);

  const onOk = ({ createType, sheetId, appId, controlName }) => {
    // 从空白创建时,创建一个占位dataSource
    if (createType === '1') {
      onChange({ dataSource: uuid() });
    } else {
      onChange({ appId, dataSource: sheetId, controlName });
    }
  };

  const switchType = type => {
    if (type === 'relate') {
      Dialog.confirm({
        title: _l('将子表转为关联记录'),
        description: _l('将子表字段转为关联记录字段'),
        okText: _l('确定'),
        onOk: () => {
          onChange({
            type: 29,
          });
        },
      });
      return;
    }
    const isHaveCanSetAsTitle = _.some(relationControls, canSetAsTitle);
    if (isHaveCanSetAsTitle) {
      Dialog.confirm({
        title: _l('将子表转为工作表'),
        description: _l(
          '将从空白创建的子表转为一个实体工作表。此工作表将成为当前表单的一个关联子表，并可以在应用配置、流程、权限中被使用',
        ),
        okText: _l('确定'),
        onOk: () => {
          setMode('relate');
          changeSheet({
            sourceWorksheetId: currentWorksheetId,
            worksheetId: dataSource,
            name: data.controlName,
          }).then(res => {
            if (res) {
              alert(_l('转换成功'));
            }
          });
        },
      });
    } else {
      setConfig({ setTitleVisible: true });
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
    const sortedControls = resortControlByColRow(relationControls);
    return (
      <Fragment>
        <div className="settingItemTitle">{_l('显示字段')}</div>
        {!_.isEmpty(relationControls) && (
          <SortColumns
            min1msg={_l('至少显示一列')}
            showControls={showControls}
            columns={sortedControls}
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
      <WidgetIntroWrap>
        {subListMode === 'new' ? (
          <div className="title relative">
            <i className={cx('icon Font20', `icon-${icon}`)} />
            <span>{widgetName}</span>
            <Tooltip placement={'bottom'} title={intro}>
              <span
                className="iconWrap pointer"
                onClick={() => {
                  window.open(moreIntroLink || DEFAULT_INTRO_LINK);
                }}
              >
                <i className="icon-help Gray_9e Font16"></i>
              </span>
            </Tooltip>
            <div className="transferToSheet" onClick={() => switchType('new')}>
              {_l('转为工作表')}
            </div>
          </div>
        ) : (
          <div className="title relative">
            <i className={cx('icon Font20', `icon-${icon}`)} />
            <span>{widgetName}</span>
            <Tooltip placement={'bottom'} title={intro}>
              <span
                className="iconWrap pointer"
                onClick={() => {
                  window.open(moreIntroLink || DEFAULT_INTRO_LINK);
                }}
              >
                <i className="icon-help Gray_9e Font16"></i>
              </span>
            </Tooltip>
            <div className="transferToRelate">
              <span data-tip={_l('变更类型')} onClick={() => setConfig({ switchVisible: true })}>
                <i className="icon icon-swap_horiz pointer Font22" />
              </span>
              {switchVisible && (
                <Menu className={cx('introSwitchMenu')} onClickAway={() => setConfig({ switchVisible: false })}>
                  <MenuItem onClick={() => switchType('relate')} icon={<i className="icon-link-worksheet" />}>
                    {_l('关联记录')}
                  </MenuItem>
                </Menu>
              )}
            </div>
          </div>
        )}
      </WidgetIntroWrap>
      <Components.WidgetName {...props} />
      {!dataSource && <AddSubList {...props} onOk={onOk} />}
      {subListMode !== 'new' && <Components.RelateSheetInfo name={sheetInfo.name} id={sheetInfo.worksheetId} />}
      <SettingItem>{getConfigContent()}</SettingItem>
      {relationControls.length > 0 && (
        <SettingItem>
          <div className="settingItemTitle">{_l('排序')}</div>
          <EditInfo className="pointer subListSortInput" onClick={() => setConfig({ sortVisible: true })}>
            <div className="overflow_ellipsis Gray">
              {sorts.length > 0
                ? sorts.reduce((p, item) => {
                    const control = relationControls.find(({ controlId }) => item.controlId === controlId) || {};
                    const flag = item.isAsc === true ? 2 : 1;
                    const { text } = getSortData(control.type, control).find(item => item.value === flag);
                    const value = _l('%0: %1', control.controlName, text);
                    return p ? `${p}；${value}` : value;
                  }, '')
                : _l('创建时间-旧的在前')}
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
      {subListMode !== 'new' && dataSource !== currentWorksheetId && (
        <SheetComponents.BothWayRelate
          worksheetInfo={sheetInfo}
          onOk={obj => {
            onChange(update(data, { sourceControl: { $set: { ...obj, type: 29 } } }));
          }}
          {...props}
        />
      )}
      {setTitleVisible && <Components.NoTitleControlDialog onClose={() => setConfig({ setTitleVisible: false })} />}
    </SettingModelWrap>
  );
}
