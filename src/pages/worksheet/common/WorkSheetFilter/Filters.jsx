import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react';
import _, { get, includes } from 'lodash';
import styled from 'styled-components';
import { Segmented, Select, Skeleton } from 'ming-ui/antd-components';
import { filterOnlyShowField } from 'src/utils/domain/control/filters';
import { permitList } from 'src/utils/domain/control/formEnum';
import { redefineComplexControl } from 'src/utils/domain/control/normalization';
import { WORKFLOW_SYSTEM_CONTROL } from 'src/utils/domain/control/widget';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { filterUnavailableConditions, getDefaultCondition } from 'src/utils/domain/worksheet/filterCondition';
import { CONTROL_FILTER_WHITELIST } from 'src/utils/domain/worksheet/filterConstants';
import Empty from './components/Empty';
import FilterDetail from './components/FilterDetail';
import SavedFilters from './components/SavedFilters';
import { formatForSave } from './model';

const Con = styled.div`
  width: 480px;
  padding: 16px 0 0;
  .queryTypeSelectWrapper {
    margin-top: 12px;
    display: flex;
    align-items: center;
    padding: 0 25px;
    .label {
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
    .clearButton {
      font-size: 13px;
      cursor: pointer;
    }
  }
`;

const FILTER_TABS_STYLE = {
  width: 188,
  margin: '0 auto',
  padding: 4,
  '--hap-segmented-track-bg': 'var(--color-background-disabled)',
  '--hap-segmented-item-hover-bg': 'var(--color-background-disabled)',
  '--hap-segmented-item-active-bg': 'var(--color-background-disabled)',
};
const NEW_FILTER_QUERY_TYPE = {
  IMMEDIATELY: 1,
  CLICK: 2,
};
const QUERY_TYPE_OPTIONS = [
  {
    label: _l('即时生效'),
    value: NEW_FILTER_QUERY_TYPE.IMMEDIATELY,
  },
  {
    label: _l('点击查询后生效'),
    value: NEW_FILTER_QUERY_TYPE.CLICK,
  },
];

function getFilterTabOptions() {
  return [
    {
      label: _l('新的筛选'),
      value: 1,
    },
    {
      label: _l('已保存'),
      value: 2,
    },
  ];
}

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
  const base = {
    projectId,
    appId,
    worksheetId,
    isCharge,
  };
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
  const [queryType, setQueryType] = useState(NEW_FILTER_QUERY_TYPE.IMMEDIATELY);
  const [queryFlag, setQueryFlag] = useState();
  const [queryButtonDisabled, setQueryButtonDisabled] = useState(false);
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
    const filterControls = filter && formatForSave(filter);
    const isClear = !filter || _.isEmpty(filter.conditionsGroups.filter(g => g.conditions.length));

    if ((filterControls && !_.isEmpty(filterControls)) || isClear) {
      onChange({
        filterControls,
      });
      setQueryButtonDisabled(true);
    }

    if (filter && filter.id.startsWith('new')) {
      setActiveFilter();
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
    if (
      state.editingFilter &&
      (queryType !== NEW_FILTER_QUERY_TYPE.CLICK || cache.current.queryFlag !== queryFlag || conditionsIsEmpty)
    ) {
      filterWorksheet(state.editingFilter);
      cache.current.queryFlag = queryFlag;
    }
  }, [state.editingFilterVersion, queryFlag]);

  useEffect(() => {
    setQueryButtonDisabled(false);
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
        addFilter({
          defaultCondition: getDefaultCondition(newControl),
        });
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
        <Segmented
          block
          shape="round"
          value={activeTab}
          options={getFilterTabOptions()}
          style={FILTER_TABS_STYLE}
          onChange={updateActiveTab}
        />
      )}
      {loading ? (
        <div
          style={{
            padding: 10,
          }}
        >
          <Skeleton
            className="pAll20"
            style={{
              flex: 1,
            }}
            active
            paragraph={{
              rows: 4,
              width: ['30%', '40%', '90%', '60%'],
            }}
          />
        </div>
      ) : (
        <Fragment>
          {activeTab === 1 && (
            <Fragment>
              {conditionsIsEmpty === false && (
                <div className="queryTypeSelectWrapper">
                  <div className="label">{_l('筛选模式:')}</div>
                  <Select
                    value={queryType}
                    options={QUERY_TYPE_OPTIONS}
                    popupMatchSelectWidth={false}
                    showSearch={false}
                    size="small"
                    variant="borderless"
                    onChange={value => {
                      setQueryType(value);
                      if (value === NEW_FILTER_QUERY_TYPE.IMMEDIATELY) {
                        filterWorksheet(state.editingFilter);
                      }
                    }}
                  />
                  <div className="flex"></div>
                  <div className="clearButton colorPrimary" onClick={() => actions.clearConditions()}>
                    {_l('清空')}
                  </div>
                </div>
              )}
              {isNewEditing && !conditionsIsEmpty && (
                <FilterDetail
                  maxHeight={maxHeight}
                  canEdit
                  supportGroup
                  showQueryButton={queryType === NEW_FILTER_QUERY_TYPE.CLICK}
                  queryButtonDisabled={queryButtonDisabled || conditionsIsEmpty}
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
                  onQuery={() => setQueryFlag(Math.random())}
                />
              )}
              {(!editingFilter || conditionsIsEmpty) && (
                <Empty
                  isNew
                  maxHeight={maxHeight}
                  controls={filterAddConditionControls(controls)}
                  onAdd={selectedControl => {
                    const defaultCondition = getDefaultCondition(selectedControl);
                    addFilter({
                      defaultCondition,
                    });
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
                  onCopy={filter =>
                    copyFilter({
                      appId,
                      worksheetId,
                      filter,
                      isCharge,
                    })
                  }
                  onDelete={filter => {
                    deleteFilter({
                      appId,
                      filter,
                    });
                    if (activeFilter && activeFilter.id === filter.id) {
                      handleTriggerFilter(undefined);
                    }
                  }}
                  onToggleFilterType={filter =>
                    toggleFilterType({
                      appId,
                      worksheetId,
                      filter,
                      isCharge,
                    })
                  }
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
