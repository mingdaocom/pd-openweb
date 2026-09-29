import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Select, Switch } from 'ming-ui/antd-components';
import { toEditWidgetPage } from 'src/pages/widgetConfig/navigation';
import NavShow from 'src/pages/worksheet/common/ViewConfig/components/navGroup/NavShow';
import { NAVSHOW_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import { COVER_DISPLAY_MODE } from 'src/pages/worksheet/common/ViewConfig/config.js';
import { getCanDisplayControls } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import { setSysWorkflowTimeControlFormat } from 'src/utils/services/worksheet/calendar';
import DisplayControl from '../DisplayControl';
import DropDownSet from '../DropDownSet';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

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
    type:
      (worksheetControls.find(it => it.controlId === viewControl) || {}).type === 30
        ? (worksheetControls.find(it => it.controlId === viewControl) || {}).sourceControlType
        : (worksheetControls.find(it => it.controlId === viewControl) || {}).type,
    coverControls: [],
    viewControlInfo: {},
    navshow:
      [26, 27, 48].includes((worksheetControls.find(it => it.controlId === viewControl) || {}).type) ||
      [26, 27, 48].includes((worksheetControls.find(it => it.controlId === viewControl) || {}).sourceControlType)
        ? '1'
        : '0',
  });

  useEffect(() => {
    const { viewControl = '' } = view;
    const viewControlInfo = worksheetControls.find(it => it.controlId === viewControl) || {};
    const { relationControls = [], type, sourceControlType } = viewControlInfo;
    setState({
      type: type === 30 ? sourceControlType : type,
      viewControlInfo,
      coverControls: relationControls
        .filter(o => o.type === 14 && _.get(o, 'advancedSetting.hide') !== '1')
        .map(o => {
          // 附件字段的 options 不是 Select 的分组选项。
          return { value: o.controlId, label: o.controlName };
        }),
      navshow: _.get(view, 'advancedSetting.navshow'),
    });
  }, [view, worksheetControls, setState]);

  const isCoverDeleted = !!coverCid && !coverControls.find(o => o.value === coverCid);

  return (
    <React.Fragment>
      <DropDownSet
        {...props}
        handleChange={viewControl => {
          const viewControlInfo = worksheetControls.find(o => o.controlId === viewControl) || {};
          const navshowN =
            [26, 27, 48].includes(viewControlInfo.type) || [26, 27, 48].includes(viewControlInfo.sourceControlType)
              ? '1'
              : '0';
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
              (_.includes([27, 48, 9, 10, 11, 26, 29, 28], item.type) ||
                (item.type === 30 &&
                  _.includes([27, 48, 9, 10, 11, 26, 29, 28], item.sourceControlType) &&
                  (item.strDefault || '').split('')[0] !== '1')) &&
              !['rowid'].includes(item.controlId) &&
              !isRelateRecordTableControl(item),
          ),
          sheetSwitchPermit,
        )}
        key="viewControl"
        addName={_l('资源')}
        title={_l('资源')}
      />
      {!!viewControl && ![1, 2].includes(type) && (
        <NavShow
          params={{
            types: NAVSHOW_TYPE.filter(o => {
              //选项作为分组，分组没有筛选 成员、部门、组织角色只有显示有数据的项和指定项
              if ([26, 27, 48].includes(type)) {
                return ['1', '2'].includes(o.value);
              } else {
                if (o.value === '1') {
                  return [9, 10, 11, 29, 28].includes(type);
                }

                if ([9, 10, 11, 28].includes(type)) {
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
            navGroupId: viewControl,
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
                <WrapNullTxt className="textTertiary pAll15">
                  {_l('关联的工作表中没有可选字段，请先去添加一个')}
                  <span
                    className="colorPrimary Hand"
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
              <Select
                options={coverControls.concat({ value: 'notDisplay', label: _l('不显示') })}
                value={isCoverDeleted ? undefined : !coverCid ? 'notDisplay' : coverCid}
                className="mTop8"
                status={isCoverDeleted ? 'error' : undefined}
                style={{ width: '100%' }}
                onChange={value => {
                  updateCurrentView({
                    ...view,
                    appId,
                    coverCid: value === 'notDisplay' ? '' : value,
                    editAttrs: ['coverCid'],
                  });
                }}
                placeholder={isCoverDeleted ? _l('控件已删除，请重新配置') : _l('不显示')}
              />
              <div className="configSwitch mTop10">
                <div className="flexRow alignItemsCenter viewConfigSwitchRow">
                  <Switch
                    size="mini"
                    checked={opencover === '1'}
                    onChange={() => {
                      updateCurrentView({
                        ...view,
                        appId,
                        advancedSetting: { opencover: opencover === '2' ? '1' : '2' },
                        editAdKeys: ['opencover'],
                        editAttrs: ['advancedSetting'],
                      });
                    }}
                  />
                  <div className="InlineBlock Normal mLeft12">{_l('允许点击查看')}</div>
                </div>
              </div>
            </div>
            <div className="flex mLeft12">
              <div className="bold">{_l('显示方式')}</div>
              <Select
                className="mTop8"
                disabled={!coverCid}
                style={{ width: '100%' }}
                options={COVER_DISPLAY_MODE.filter(o => [0, 1].includes(o.value))}
                fieldNames={SELECT_FIELD_NAMES}
                value={coverType}
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
