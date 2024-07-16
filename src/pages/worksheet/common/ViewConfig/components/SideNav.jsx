import React, { createRef, useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
import _ from 'lodash';
import { viewTypeConfig, viewTypeGroup, viewTypeCustomList, baseSetList } from '../config';

const RecordColorSign = styled.div`
  display: inline-block;
  float: right;
  i {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 14px;
    border: 2px solid #fff;
    margin-left: -6px;
    transform: translateY(2px);
    &:nth-child(1) {
      background: #f44336;
    }
    &:nth-child(2) {
      background: #fad714;
    }
    &:nth-child(3) {
      background: #00c345;
    }
  }
`;

export default function SideNav(props) {
  const {
    view = {},
    viewSetting = baseSetList[VIEW_DISPLAY_TYPE[view.viewType]][0],
    columns,
    currentSheetInfo,
    formatColumnsListForControlsWithoutHide,
    onChangeType,
    btnList = [],
  } = props;
  const { filters = [], controls = [], moreSort = [], fastFilters = [] } = view;
  const { icon, text } = VIEW_TYPE_ICON.find(it => it.id === VIEW_DISPLAY_TYPE[view.viewType]) || {};
  const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];
  const columnsList = formatColumnsListForControlsWithoutHide(columns);
  const controlsList = formatColumnsListForControlsWithoutHide(controls);
  let daConfig = [
    {
      type: 'Filter',
      data: filters,
    },
    {
      type: 'FastFilter',
      data: fastFilters,
    },
    {
      type: 'Sort',
      data: moreSort,
    },
  ];
  const getHtml = type => {
    let btnCount = 0;
    if (type === 'ActionSet') {
      const listBtns = btnList.filter(
        o => safeParse(_.get(o, 'advancedSetting.listviews'), 'array').includes(props.viewId) || o.isAllView === 1,
      );
      const detailBtns = btnList.filter(
        o => safeParse(_.get(o, 'advancedSetting.detailviews'), 'array').includes(props.viewId) || o.isAllView === 1,
      );
      const isSheetView = viewTypeText === 'sheet';
      btnCount = (isSheetView ? listBtns.length : 0) + detailBtns.length;
    }
    let d = viewTypeConfig.find(o => o.type === type) || {};
    let da = (daConfig.find(o => o.type === type) || {}).data;
    if (type === 'FastFilter') {
      da = (da || []).filter(o => {
        if (!isOpenPermit(permitList.sysControlSwitch, currentSheetInfo.switches || [])) {
          return !SYS_CONTROLS_WORKFLOW.includes(o.controlId);
        } else {
          return true;
        }
      });
    }
    if (type === 'Filter') {
      let data = [];
      da = (da || []).map(o => {
        if (!!o.isGroup) {
          data = [...data, ...o.groupFilters];
        } else {
          data = [...data, o];
        }
      });
      da = data.filter(o => !!o);
    }
    return (
      <React.Fragment>
        <div className="titleTxt flex flexShrink0 flexRow">
          <div className="w100 overflow_ellipsis WordBreak">{d.name}</div>
        </div>
        {((da && da.length > 0) || type === 'Sort') && (
          <span className="Gray_9e InlineBlock mLeft5 numText">{type === 'Sort' && da.length < 1 ? 1 : da.length}</span>
        )}
        {btnCount > 0 && type === 'ActionSet' && <span className="Gray_9e InlineBlock mLeft5 numText">{btnCount}</span>}
        {type === 'RecordColor' && !!_.get(view, 'advancedSetting.colorid') && (
          <RecordColorSign>
            <i />
            <i />
            <i />
          </RecordColorSign>
        )}
      </React.Fragment>
    );
  };
  let hideLengthStr = (
    <React.Fragment>
      <div className="titleTxt flex flexShrink0 flexRow">
        <div className="w100 overflow_ellipsis WordBreak">{_l('字段')}</div>
      </div>
      {columnsList.length - controlsList.length > 0 && (
        <span className="Gray_9e InlineBlock mLeft5 numText">{`${columnsList.length - controlsList.length}/${
          columnsList.length
        }`}</span>
      )}
    </React.Fragment>
  );
  // 多表关联层级视图
  const isRelateMultiSheetHierarchyView = viewTypeText === 'structure' && String(view.childType) === '2';
  return (
    <div className="viewBtns pTop7">
      {viewTypeGroup.map((it, i) => {
        let actionList = it.list;
        const isDevCustomView = (_.get(view, 'pluginInfo') || {}).source === 0; //是否可以开发状态的自定义视图

        if (it.name === 'base') {
          actionList = baseSetList[viewTypeText];
          if (viewTypeText === 'customize' && isDevCustomView) {
            actionList = viewTypeCustomList;
          }
          if (viewTypeText === 'structure') {
            actionList = baseSetList[viewTypeText].filter(o =>
              _.get(view, 'advancedSetting.hierarchyViewType') === '3'
                ? o !== 'CardSet'
                : !['TableSet', 'Show'].includes(o),
            );
          }
          if (viewTypeText === 'detail' && _.get(view, 'childType') === 1) {
            actionList = baseSetList[viewTypeText].filter(o => o !== 'CardSet');
          }
        }

        return (
          <div className="viewBtnsLi" key={`viewTypeGroup_${it.name}`}>
            {actionList.map((o, n) => {
              let item = viewTypeConfig.find(d => d.type === o);
              //地图、表格和画廊、看板视图、日历视图、甘特图、详情视图(多条)有快速筛选 层级视图关联本表
              let hasFastFilter =
                ['sheet', 'gallery', 'board', 'calendar', 'gunter', 'resource', 'map'].includes(viewTypeText) ||
                (viewTypeText === 'detail' && view.childType === 2) ||
                (viewTypeText === 'structure' && view.childType !== 2);
              //地图 层级本表 画廊  表格 // 看板'board'先不支持 与看板的显示项配置参数重合了
              let hasNavGroup =
                ['sheet', 'gallery', 'map'].includes(viewTypeText) ||
                (viewTypeText === 'structure' && view.childType !== 2);
              if (viewTypeText === 'customize') {
                //插件视图的快速筛选和筛选列表根据视图配置展示
                const { pluginInfo = {} } = view;
                const { switchSettings = {} } = pluginInfo;
                hasFastFilter = switchSettings.showFastFilter === '1';
                hasNavGroup = switchSettings.showNav === '1';
              }
              if (
                (!hasFastFilter && ['FastFilter'].includes(item.type)) ||
                (!hasNavGroup && ['NavGroup'].includes(item.type)) ||
                (!['sheet', 'gallery'].includes(viewTypeText) && _.includes(['MobileSet'], o)) || //移动端设置=>表 画廊
                (item.type === 'RecordColor' && viewTypeText === 'detail' && view.childType === 1)
              ) {
                return '';
              }
              return (
                <React.Fragment key={`viewBtnsLiItem_${o}_${n}`}>
                  {item.type === 'PluginSettings' && <p className="titileP"> {_l('开发')}</p>}
                  {(_.includes(['MobileSet', 'urlParams'], item.type) ||
                    (hasFastFilter && ['FastFilter'].includes(item.type)) ||
                    (hasNavGroup && ['NavGroup'].includes(item.type)) ||
                    (!hasFastFilter && item.type === 'ActionSet') ||
                    item.type === 'Filter') && (
                    <React.Fragment>
                      {item.type === 'Filter' ? (
                        <p className="titileP"> {_l('记录设置')}</p>
                      ) : (hasFastFilter && item.type === 'FastFilter') ||
                        (!hasFastFilter &&
                          ((hasNavGroup && item.type === 'NavGroup') ||
                            (!hasNavGroup && item.type === 'ActionSet'))) ? (
                        <p className="titileP">{_l('用户操作')}</p>
                      ) : item.type === 'MobileSet' ||
                        (!['sheet', 'gallery'].includes(viewTypeText) && item.type === 'urlParams') ? (
                        <p className="titileP">{_l('其他')}</p>
                      ) : (
                        ''
                      )}
                    </React.Fragment>
                  )}
                  <div
                    className={cx('viewBtn flexRow alignItemsCenter', { active: viewSetting === item.type })}
                    onClick={() => {
                      onChangeType(item.type);
                    }}
                  >
                    <Icon className="mRight15 Font18 icon" icon={item.icon || icon} />
                    <div className="fontText flexRow alignItemsCenter">
                      {['Filter', 'FastFilter', 'Sort', 'RecordColor', 'ActionSet'].includes(item.type)
                        ? getHtml(item.type)
                        : item.type === 'Controls'
                        ? hideLengthStr
                        : item.type === 'Setting'
                        ? VIEW_TYPE_ICON.find(o => o.id === VIEW_DISPLAY_TYPE[view.viewType]).txt
                        : item.name}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {/* 多表关联层级视图 =》筛选、排序、字段的设置仅作用于本表（第一层级）中的记录。 */}
            {isRelateMultiSheetHierarchyView && it.name === 'other' && (
              <div
                className="Font13 pTop16 pBottom16 pLeft12 pRight12 mTop8 descCon"
                style={{
                  color: '#8E8E8E',
                  backgroundColor: '#EDEDED',
                  borderRadius: '3px',
                }}
              >
                {_l('筛选、排序、字段的设置仅作用于本表（第一层级）中的记录。')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
