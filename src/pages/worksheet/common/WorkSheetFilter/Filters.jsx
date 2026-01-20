import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react';
import _, { get, includes } from 'lodash';
import styled from 'styled-components';
import { Skeleton } from 'ming-ui';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import Empty from './components/Empty';
import FilterDetail from './components/FilterDetail';
import SavedFilters from './components/SavedFilters';
import { CONTROL_FILTER_WHITELIST } from './enum';
import { formatForSave } from './model';
import { filterUnavailableConditions, getDefaultCondition, redefineComplexControl } from './util';

const Con = styled.div`
  width: 480px;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  padding: 16px 0 0;
`;

const SwitchTab = styled.div`
  margin-bottom: 28px;
  padding: 4px;
  font-weight: bold;
  background: #ebebeb;
  margin: 0 auto;
  border-radius: 32px;
  width: 187px;
  > span {
    cursor: pointer;
    height: 24px;
    line-height: 24px;
    border-radius: 24px;
    color: #757575;
    width: 50%;
    text-align: center;
    display: inline-block;
    &.active {
      color: #1677ff;
      background: #ffffff;
    }
    &:hover {
      color: #1677ff;
    }
  }
`;

const tabs = [
  {
    name: _l('新的筛选'),
    type: 1,
  },
  {
    name: _l('已保存'),
    type: 2,
  },
];

function Filters(props, ref) {
  const {
    style = {},
    maxHeight = 543,
    projectId,
    appId,
    viewId,
    worksheetId,
    isCharge,
    popupVisible,
    columns,
    showSavedFilters = true,
    sheetSwitchPermit = {},
    state = {},
    actions = {},
    onHideFilterPopup = () => {},
    onChange = () => {},
    filterResigned = true,
  } = props;
  const conRef = useRef();
  const cache = useRef({});
  const base = { projectId, appId, worksheetId, isCharge };
  const filterWhiteKeys = _.flatten(
    Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
  );
  const showWorkflowControl = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit, viewId);
  const controls = columns
    .filter(o => (md.global.Account.isPortal ? !_.includes(['ownerid', 'caid', 'uaid'], o.controlId) : true))
    .filter(c => (c.controlPermissions || '111')[0] === '1')
    .map(redefineComplexControl)
    .filter(c => _.includes(filterWhiteKeys, c.type))
    .filter(c => !(c.type === 38 && c.enumDefault === 3))
    .sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1));
  const { loading, filters, editingFilter, activeFilter, needSave, nameIsUpdated } = state;
  const {
    editFilter,
    copyFilter,
    loadFilters,
    addFilter,
    addCondition,
    deleteFilter,
    toggleFilterType,
    setActiveFilter,
    sortFilters,
  } = actions;
  const [activeTab, setActiveTab] = useState(
    (() => {
      const newType = localStorage.getItem('worksheetFilters_activeTab');
      return newType === '2' && showSavedFilters ? 2 : 1;
    })(),
  );
  const isSavedEditing = !!editingFilter && !/^new/.test(editingFilter.id);
  const isNewEditing = !!editingFilter && /^new/.test(editingFilter.id);
  const conditionsIsEmpty =
    editingFilter &&
    _.isEmpty(editingFilter.conditions) &&
    !_.some(editingFilter.conditionsGroups.map(g => g.conditions.length));
  function updateActiveTab(newType) {
    setActiveTab(newType);
    localStorage.setItem('worksheetFilters_activeTab', newType);
  }
  function filterAddConditionControls(controls) {
    return filterOnlyShowField(
      showWorkflowControl
        ? controls
        : controls.filter(
            c =>
              !_.includes(
                WORKFLOW_SYSTEM_CONTROL.map(c => c.controlId),
                c.controlId,
              ),
          ),
    );
  }
  function filterWorksheet(filter) {
    const filterControls = formatForSave(filter);
    const isClear = _.isEmpty(filter.conditionsGroups.filter(g => g.conditions.length));
    if ((filterControls && !_.isEmpty(filterControls)) || isClear) {
      onChange({
        filterControls,
      });
    }
  }
  function handleTriggerFilter(filter) {
    setActiveFilter(filter);
    filterWorksheet(filter);
  }
  function handleAddNewFilter() {
    addFilter();
    setTimeout(() => {
      if (conRef.current) {
        conRef.current.querySelector('.addFilterCondition > span').click();
      }
    }, 80);
  }
  useEffect(() => {
    if (!showSavedFilters) {
      return;
    }
    loadFilters(worksheetId, data => {
      if (!_.isEmpty(data) && !cache.current.callFromColumn) {
        updateActiveTab(2);
      }
    });
  }, []);
  useEffect(() => {
    if (state.editingFilter) {
      filterWorksheet(state.editingFilter);
    }
  }, [state.editingFilterVersion]);
  useEffect(() => {
    if (
      isNewEditing &&
      !get(cache, 'current.editingFilter') &&
      state.editingFilter &&
      includes([14, 34, 36, 40, 41], _.get(state, 'editingFilter.conditionsGroups.0.conditions.0.control.type'))
    ) {
      filterWorksheet(state.editingFilter);
    }
    cache.current.editingFilter = state.editingFilter;
  }, [state.editingFilter]);
  useEffect(() => {
    if (popupVisible && state.editingFilter) {
      const filteredConditions = filterUnavailableConditions(
        get(state, 'editingFilter.conditionsGroups', []).map(c => ({
          ...c,
          isGroup: true,
        })),
        'conditions',
      );
      editFilter(
        filteredConditions.length
          ? {
              ...state.editingFilter,
              conditionsGroups: filteredConditions,
            }
          : undefined,
      );
    }
    if (popupVisible && !loading && String(activeTab) === '2' && !filters.length) {
      setActiveTab(1);
    }
  }, [popupVisible]);
  useImperativeHandle(ref, () => ({
    addFilterByControl: control => {
      cache.current.callFromColumn = true;
      const newControl = redefineComplexControl(control);
      updateActiveTab(1);
      if (isNewEditing) {
        addCondition(newControl, editingFilter.conditionsGroups.length - 1);
      } else {
        addFilter({ defaultCondition: getDefaultCondition(newControl) });
      }
    },
  }));
  useEffect(() => {
    if (!loading && String(activeTab) === '2' && !filters.length) {
      setActiveTab(1);
    }
  }, [loading]);
  return (
    <Con ref={conRef} style={style}>
      {!isSavedEditing && showSavedFilters && (
        <SwitchTab>
          {tabs.map(tab => (
            <span
              className={activeTab === tab.type ? 'active' : ''}
              onClick={() => {
                updateActiveTab(tab.type);
              }}
            >
              {tab.name}
            </span>
          ))}
        </SwitchTab>
      )}
      {loading ? (
        <div style={{ padding: 10 }}>
          <Skeleton
            style={{ flex: 1 }}
            direction="column"
            widths={['30%', '40%', '90%', '60%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
        </div>
      ) : (
        <Fragment>
          {activeTab === 1 && (
            <Fragment>
              {isNewEditing && !conditionsIsEmpty && (
                <FilterDetail
                  maxHeight={maxHeight}
                  canEdit
                  supportGroup
                  hideSave={!formatForSave(editingFilter).length || !showSavedFilters}
                  base={base}
                  filter={editingFilter}
                  actions={actions}
                  controls={controls}
                  setActiveTab={updateActiveTab}
                  onBack={() => editFilter(undefined)}
                  onAddCondition={() => {
                    setActiveFilter(editingFilter);
                  }}
                  handleTriggerFilter={handleTriggerFilter}
                  filterResigned={filterResigned}
                  filterAddConditionControls={filterAddConditionControls}
                />
              )}
              {(!editingFilter || conditionsIsEmpty) && (
                <Empty
                  isNew
                  maxHeight={maxHeight}
                  controls={filterAddConditionControls(controls)}
                  onAdd={selectedControl => {
                    const defaultCondition = getDefaultCondition(selectedControl);
                    setTimeout(() => {
                      const dom = document.querySelector(
                        '.keyStr_' + defaultCondition.keyStr + ' .ant-select-selector',
                      );
                      if (dom) {
                        dom.click();
                      }
                    }, 100);
                    addFilter({ defaultCondition });
                  }}
                />
              )}
            </Fragment>
          )}
          {activeTab === 2 && (
            <Fragment>
              {!isSavedEditing && (
                <SavedFilters
                  maxHeight={maxHeight}
                  isCharge={isCharge}
                  controls={controls}
                  filters={filters}
                  activeFilter={activeFilter}
                  filterAddConditionControls={filterAddConditionControls}
                  triggerFilter={f => {
                    editFilter(undefined);
                    handleTriggerFilter(f);
                  }}
                  addFilter={() => {
                    updateActiveTab(1);
                    handleAddNewFilter();
                  }}
                  onEditFilter={filter => {
                    editFilter(filter);
                    if (!activeFilter || activeFilter.id !== filter.id) {
                      handleTriggerFilter(filter);
                    }
                  }}
                  onCopy={filter => copyFilter({ appId, worksheetId, filter, isCharge })}
                  onDelete={filter => deleteFilter({ appId, filter })}
                  onToggleFilterType={filter => toggleFilterType({ appId, worksheetId, filter, isCharge })}
                  onHideFilterPopup={onHideFilterPopup}
                  onSortEnd={sortedIds => {
                    sortFilters(appId, worksheetId, sortedIds);
                  }}
                />
              )}
              {isSavedEditing && (
                <FilterDetail
                  maxHeight={maxHeight}
                  supportGroup
                  nameIsUpdated={nameIsUpdated}
                  needSave={needSave}
                  base={base}
                  filter={editingFilter}
                  actions={actions}
                  controls={controls}
                  setActiveTab={updateActiveTab}
                  onBack={needSetOriginFilter => {
                    if (needSetOriginFilter) {
                      const originFilter = _.find(filters, f => f.id === editingFilter.id);
                      if (originFilter) {
                        handleTriggerFilter(originFilter);
                      }
                    }
                    editFilter(undefined);
                  }}
                  handleTriggerFilter={handleTriggerFilter}
                  filterResigned={filterResigned}
                  filterAddConditionControls={filterAddConditionControls}
                />
              )}
            </Fragment>
          )}
        </Fragment>
      )}
    </Con>
  );
}

export default forwardRef(Filters);
