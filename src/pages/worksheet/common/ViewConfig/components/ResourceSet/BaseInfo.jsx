import React, { useState, useEffect } from 'react';
import DropDownSet from '../DropDownSet';
import NavShow from 'src/pages/worksheet/common/ViewConfig/components/navGroup/NavShow';
import { NAVSHOW_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import DisplayControl from '../DisplayControl';
import _ from 'lodash';
import { useSetState } from 'react-use';
import { SwitchStyle } from '../style';
import { COVER_DISPLAY_MODE } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { Dropdown, Icon } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { getCanDisplayControls } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { isRelateRecordTableControl } from 'worksheet/util';
import { toEditWidgetPage } from 'src/pages/widgetConfig/util';

const WrapNullTxt = styled.div`
  font-weight: 400;
`;

export default function BaseInfo(props) {
  const {
    appId,
    view,
    updateCurrentView,
    worksheetControls = [],
    columns,
    currentSheetInfo,
    sheetSwitchPermit,
  } = props;
  const { advancedSetting = {}, viewControl = '', coverCid, coverType } = view;
  const { navfilters = '[]', opencover = '1' } = advancedSetting;

  const [{ type, coverControls, viewControlInfo, navshow }, setState] = useSetState({
    type: (worksheetControls.find(it => it.controlId === viewControl) || {}).type,
    coverControls: [],
    viewControlInfo: {},
    navshow: (worksheetControls.find(it => it.controlId === viewControl) || {}).type === 26 ? '1' : '0',
  });

  useEffect(() => {
    const { view, worksheetControls = [] } = props;
    const { viewControl = '' } = view;
    const viewControlInfo = worksheetControls.find(it => it.controlId === viewControl) || {};
    const { relationControls = [], type } = viewControlInfo;
    setState({
      type,
      viewControlInfo,
      coverControls: relationControls
        .filter(o => o.type === 14 && _.get(o, 'advancedSetting.hide') !== '1')
        .map(o => {
          return { ...o, value: o.controlId, text: o.controlName };
        }),
      navshow: _.get(view, 'advancedSetting.navshow'),
    });
  }, [props.view]);

  return (
    <React.Fragment>
      <DropDownSet
        {...props}
        handleChange={viewControl => {
          const viewControlInfo = worksheetControls.find(o => o.controlId === viewControl) || {};
          const navshowN = viewControlInfo.type === 26 ? '1' : '0';
          setState({
            navshow: navshowN,
          });
          updateCurrentView({
            ...view,
            appId,
            viewControl,
            advancedSetting: {
              navshow: navshowN,
              navfilters: JSON.stringify([]),
            },
            controlsSorts: [],
            displayControls: [],
            coverCid: '',
            editAdKeys: ['navfilters', 'navshow'],
            editAttrs: ['viewControl', 'advancedSetting', 'displayControls', 'controlsSorts', 'coverCid'],
          });
        }}
        className="mTop6"
        setDataId={viewControl}
        //部门、组织角色、选项、人员、关联（单/多）
        controlList={setSysWorkflowTimeControlFormat(
          worksheetControls.filter(
            item =>
              _.includes([27, 48, 9, 10, 11, 26, 29], item.type) &&
              !['rowid'].includes(item.controlId) &&
              !isRelateRecordTableControl(item),
          ),
          sheetSwitchPermit,
        )}
        key="viewControl"
        addName={'资源'}
        title={_l('资源')}
      />
      {!!viewControl && ![1, 2, 27, 48].includes(type) && (
        <NavShow
          params={{
            types: NAVSHOW_TYPE.filter(o => {
              //选项作为分组，分组没有筛选 成员只有显示有数据的项和指定项
              if ([26].includes(type)) {
                return ['1', '2'].includes(o.value);
              } else {
                if (o.value === '1') {
                  return [9, 10, 11, 29].includes(type);
                }
                if ([9, 10, 11, 27, 48].includes(type)) {
                  return o.value !== '3';
                } else {
                  return true;
                }
              }
            }),
            txt: _l('显示项'),
          }}
          value={navshow}
          onChange={newValue => {
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: newValue,
              editAttrs: ['advancedSetting'],
              editAdKeys: Object.keys(newValue),
            });
          }}
          advancedSetting={view.advancedSetting}
          navfilters={navfilters}
          filterInfo={{
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
            viewControl,
          }}
        />
      )}
      {/* 显示字段 */}
      {[29].includes(type) && (
        <React.Fragment>
          <DisplayControl
            {...props}
            hideShowControlName
            downElement={
              getCanDisplayControls(viewControlInfo.relationControls || []).filter(
                it => _.get(it, 'advancedSetting.hide') !== '1',
              ).length <= 0 ? (
                <WrapNullTxt className="Gray_9e pAll15">
                  {_l('关联的工作表中没有可选字段，请先去添加一个')}
                  <span
                    className="ThemeColor3 Hand"
                    onClick={() => {
                      toEditWidgetPage(
                        {
                          sourceId: viewControlInfo.dataSource,
                          fromURL: `/app/${appId}/${currentSheetInfo.groupId}/${currentSheetInfo.worksheetId}/${view.viewId}`,
                        },
                        false,
                      );
                    }}
                  >
                    {_l('立即前往')}
                  </span>
                </WrapNullTxt>
              ) : null
            }
            worksheetControls={(viewControlInfo.relationControls || []).filter(
              it => _.get(it, 'advancedSetting.hide') !== '1',
            )}
            handleChangeSort={({ newControlSorts, newShowControls }) => {
              updateCurrentView({
                ...view,
                appId,
                controlsSorts: newControlSorts,
                displayControls: newShowControls,
                editAttrs: ['displayControls', 'controlsSorts'],
              });
            }}
          />
          <div className="settingContent mTop24 flexRow">
            <div className="flex">
              <div className="subTitle Font13 bold">{_l('封面')}</div>
              <Dropdown
                data={coverControls.concat({ value: 'notDisplay', text: _l('不显示') })}
                value={!coverCid ? 'notDisplay' : coverCid}
                className={cx('mTop8', { isDelete: !!coverCid && !coverControls.find(o => o.value === coverCid) })}
                border
                style={{ width: '100%' }}
                onChange={value => {
                  updateCurrentView({
                    ...view,
                    appId,
                    coverCid: value === 'notDisplay' ? '' : value,
                    editAttrs: ['coverCid'],
                  });
                }}
                placeholder={
                  !!coverCid && !coverControls.find(o => o.value === coverCid)
                    ? _l('控件已删除，请重新配置')
                    : _l('不显示')
                }
              />
              <div className="configSwitch mTop10">
                <SwitchStyle className="flexRow alignItemsCenter">
                  <Icon
                    icon={opencover === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
                    className="Font28 Hand"
                    onClick={() => {
                      updateCurrentView({
                        ...view,
                        appId,
                        advancedSetting: { opencover: opencover === '2' ? '1' : '2' },
                        editAdKeys: ['opencover'],
                        editAttrs: ['advancedSetting'],
                      });
                    }}
                  />
                  <div className="switchText InlineBlock Normal mLeft10">{_l('允许点击查看')}</div>
                </SwitchStyle>
              </div>
            </div>
            <div className="flex mLeft12">
              <div className="bold">{_l('显示方式')}</div>
              <Dropdown
                className="mTop8"
                disabled={!coverCid}
                style={{ width: '100%' }}
                data={COVER_DISPLAY_MODE.filter(o => [0, 1].includes(o.value))}
                value={coverType}
                border
                onChange={value => {
                  if (coverType !== value) {
                    updateCurrentView({
                      ...view,
                      appId,
                      coverType: value,
                      editAttrs: ['coverType'],
                    });
                  }
                }}
              />
            </div>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
