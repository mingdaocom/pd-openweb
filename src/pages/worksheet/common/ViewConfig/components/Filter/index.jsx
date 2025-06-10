import React, { createRef, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Icon, Menu, MenuItem, Tooltip } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig.jsx';
import { filterUnavailableConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { formatCondition } from './util';

const Wrap = styled.div`
  height: 100%;
  .commonConfigItem,
  .FilterConfigCon,
  .footer {
    padding: 0 40px;
    &.FilterConfigCon {
      overflow: auto;
      max-height: calc(100% - 60px);
    }
  }
  .viewSetTitle {
    padding: 25px 40px 0 !important;
  }
  .saveBtn,
  .cancelBtn {
    line-height: 32px;
    min-height: 32px;
    padding: 0 16px;
    border-radius: 16px;
    min-width: 0;
  }
  .cancelBtn {
    font-size: 14px;
    background: #f5f5f5;
    &:hover {
      background: #eaeaea;
    }
    font-weight: bold;
    display: inline-block;
    box-sizing: border-box;
    text-shadow: none;
    border: none;
    outline: none;
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
    font-weight: bold;
  }
`;

export default function ViewFilter(props) {
  const { view, projectId, appId, sheetSwitchPermit, updateCurrentView, columns = [] } = props;
  const [{ existingFilters, shwoMoreMenu, appearFilters, version }, setState] = useSetState({
    shwoMoreMenu: false,
    existingFilters: [],
    appearFilters: view.filters || [],
    version: 0,
  });

  useEffect(() => {
    const { worksheetId } = props;
    sheetAjax
      .getWorksheetFilters({ worksheetId })
      .then(data => {
        setState({
          existingFilters: existingFilters.concat(data),
        });
      })
      .catch(err => {
        alert(_l('获取筛选列表失败'), 2);
      });
  }, [props.worksheetId]);

  useEffect(() => {
    if (props.saveViewSetLoading) return;
    const { view } = props;
    setState({
      appearFilters: view.filters || [],
    });
  }, [_.get(props, 'view.filters')]);

  const updateView = () => {
    if (props.saveViewSetLoading || _.isEqual(appearFilters, view.filters)) return;
    const data = appearFilters.map(it => formatCondition(it, columns)).filter(_.identity);
    let filters = filterUnavailableConditions(data);
    updateCurrentView(
      Object.assign(view, {
        filters,
        editAttrs: ['filters'],
      }),
      () => {
        setState({
          version: version + 1,
        });
        alert(_l('保存成功'));
      },
    );
  };

  return (
    <Wrap className="flexColumn">
      <div className="viewSetTitle">{_l('过滤')}</div>
      <div className="flexRow commonConfigItem">
        <div className="Gray_75 mTop8 flex">{_l('添加筛选条件，在视图中显示符合筛选条件的记录')}</div>
        {existingFilters.length ? (
          <Trigger
            popupVisible={shwoMoreMenu}
            onPopupVisibleChange={shwoMoreMenu => {
              setState({ shwoMoreMenu });
            }}
            popupClassName="DropdownPanelTrigger"
            action={['click']}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [-140, 0],
            }}
            popup={
              <Menu>
                {existingFilters.map(({ filterId, name, items }, index) => (
                  <MenuItem
                    onClick={() => {
                      setState({
                        appearFilters: items,
                        shwoMoreMenu: false,
                        version: version + 1,
                      });
                    }}
                    key={filterId}
                  >
                    <span className="text">{name || _l('未命名筛选器 %0', index + 1)}</span>
                  </MenuItem>
                ))}
              </Menu>
            }
          >
            <Tooltip disable={shwoMoreMenu} popupPlacement="bottom" text={<span>{_l('已保存的筛选器')}</span>}>
              <div className="valignWrapper more pointer">
                <span>{_l('更多')}</span>
                <Icon icon="arrow-down" />
              </div>
            </Tooltip>
          </Trigger>
        ) : null}
      </div>
      <div className="flex overflowHidden">
        <div className="FilterConfigCon">
          <FilterConfig
            version={version}
            supportGroup
            canEdit
            feOnly
            filterColumnClassName="sheetViewFilterColumnOption"
            projectId={projectId}
            appId={appId}
            viewId={view.viewId}
            sheetSwitchPermit={sheetSwitchPermit}
            filterResigned={false}
            columns={columns}
            conditions={appearFilters}
            urlParams={JSON.parse((view.advancedSetting || {}).urlparams || '[]')}
            onConditionsChange={conditions => {
              setState({
                appearFilters: conditions,
              });
            }}
          />
        </div>
        {(!_.isEqual(appearFilters, view.filters) || appearFilters.length > 0) && (
          <div className="footer pTop12 pBottom12 ">
            <Button
              type="primary"
              onClick={() => updateView()}
              className="saveBtn"
              disabled={props.saveViewSetLoading || _.isEqual(appearFilters, view.filters)}
            >
              {_l('保存')}
            </Button>
            <div
              className="cancelBtn Hand Gray_75 mLeft16"
              onClick={() => {
                if (_.isEqual(appearFilters, view.filters)) {
                  props.onClose()
                  return
                }
                setState({
                  appearFilters: view.filters,
                  version: version + 1,
                });
              }}
            >
              {_l('取消')}
            </div>
          </div>
        )}
      </div>
    </Wrap>
  );
}
