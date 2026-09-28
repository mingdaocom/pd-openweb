import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Dropdown, Tooltip } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig.jsx';
import { filterUnavailableConditions } from 'src/utils/domain/worksheet/filterCondition';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { formatCondition } from './util';

const EMPTY_FILTERS = [];

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
  .cancelBtn {
    line-height: 32px;
    min-height: 32px;
    padding: 0 16px;
    border-radius: 16px;
    min-width: 0;
  }
  .cancelBtn {
    font-size: 14px;
    background: var(--color-background-secondary);
    &:hover {
      background: var(--color-border-secondary);
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
  const {
    view,
    worksheetId,
    projectId,
    appId,
    sheetSwitchPermit,
    saveViewSetLoading,
    updateCurrentView,
    columns = [],
  } = props;
  const viewId = view.viewId;
  const viewFilters = view.filters || EMPTY_FILTERS;
  const filterSource = useRef({ worksheetId, viewId, filters: viewFilters });
  const [{ existingFilters, showMoreMenu, draftFilters, version }, setState] = useSetState({
    showMoreMenu: false,
    existingFilters: [],
    draftFilters: null,
    version: 0,
  });
  const appearFilters = draftFilters ?? viewFilters;

  useEffect(() => {
    if (!worksheetId) return;
    let active = true;

    sheetAjax
      .getWorksheetFilters({ worksheetId })
      .then(data => {
        if (active) setState({ existingFilters: data });
      })
      .catch(_requestError => {
        if (active) alertIfNotUnauthorized(_requestError, _l('获取筛选列表失败'), 2);
      });

    return () => {
      active = false;
    };
  }, [worksheetId, setState]);

  useEffect(() => {
    const previous = filterSource.current;
    const worksheetChanged = previous.worksheetId !== worksheetId;
    const viewChanged = worksheetChanged || previous.viewId !== viewId;

    // 自动刷新会深拷贝 view；引用变化不能作为丢弃未保存草稿的依据。
    if (!viewChanged && _.isEqual(previous.filters, viewFilters)) return;

    filterSource.current = { worksheetId, viewId, filters: viewFilters };
    setState(state => {
      if (!viewChanged && state.draftFilters !== null) return {};

      return {
        ...(worksheetChanged ? { existingFilters: [], showMoreMenu: false } : {}),
        draftFilters: null,
        version: state.version + 1,
      };
    });
  }, [setState, viewFilters, viewId, worksheetId]);

  const updateView = () => {
    if (saveViewSetLoading || _.isEqual(appearFilters, viewFilters)) return;
    const data = appearFilters.map(it => formatCondition(it, columns)).filter(_.identity);
    let filters = filterUnavailableConditions(data);
    updateCurrentView(
      Object.assign({}, view, {
        filters,
        editAttrs: ['filters'],
      }),
      () => {
        if (filterSource.current.worksheetId !== worksheetId || filterSource.current.viewId !== viewId) return;

        setState(state => {
          // 请求期间仍可编辑，成功回调只确认本次提交的草稿。
          if (!_.isEqual(state.draftFilters, appearFilters)) return {};

          return {
            draftFilters: null,
            version: state.version + 1,
          };
        });
        alert(_l('保存成功'));
      },
    );
  };

  return (
    <Wrap className="flexColumn">
      <div className="viewSetTitle">{_l('过滤')}</div>
      <div className="flexRow commonConfigItem">
        <div className="textSecondary mTop8 flex">{_l('添加筛选条件，在视图中显示符合筛选条件的记录')}</div>
        {existingFilters.length ? (
          <Dropdown
            open={showMoreMenu}
            onOpenChange={showMoreMenu => {
              setState({ showMoreMenu });
            }}
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: existingFilters.map(({ filterId, name, items }, index) => ({
                key: filterId,
                label: <span className="text">{name || _l('未命名筛选器 %0', index + 1)}</span>,
                onClick: () => {
                  setState({
                    draftFilters: items,
                    showMoreMenu: false,
                    version: version + 1,
                  });
                },
              })),
            }}
          >
            <div>
              <Tooltip placement="bottom" title={showMoreMenu ? '' : <span>{_l('已保存的筛选器')}</span>}>
                <div className="valignWrapper more pointer">
                  <span>{_l('更多')}</span>
                  <Icon icon="arrow-down" />
                </div>
              </Tooltip>
            </div>
          </Dropdown>
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
            urlParams={safeParse(view?.advancedSetting?.urlparams, 'array')}
            onConditionsChange={conditions => {
              setState({
                draftFilters: conditions,
              });
            }}
          />
        </div>
        {(!_.isEqual(appearFilters, viewFilters) || appearFilters.length > 0) && (
          <div className="footer pTop12 pBottom12 ">
            <Button
              type="primary"
              shape="round"
              onClick={() => updateView()}
              loading={saveViewSetLoading}
              disabled={_.isEqual(appearFilters, viewFilters)}
            >
              {_l('保存')}
            </Button>
            <div
              className="cancelBtn Hand textSecondary mLeft16"
              onClick={() => {
                if (_.isEqual(appearFilters, viewFilters)) {
                  props.onClose();
                  return;
                }

                setState({
                  draftFilters: null,
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
