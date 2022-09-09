import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import Tooltip from 'ming-ui/components/Tooltip';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { emitter } from 'worksheet/util';
import sheetAjax from 'src/api/worksheet';
import SaveWorksheetFilter from '../SaveWorksheetFilter';
import FilterItem from './components/FilterItem';
import {
  FILTER_TYPE,
  FILTER_RELATION_TYPE,
  CONTROL_FILTER_WHITELIST,
  FILTER_CONDITION_TYPE,
  getFilterTypeLabel,
} from './enum';
import {
  getTypeKey,
  checkConditionAvailable,
  formatOriginFilterValue,
  getDefaultCondition,
  redefineComplexControl,
  formatConditionForSave,
} from './util';
import './WorkSheetFilter.less';

const ClickAwayable = createDecoratedComponent(withClickAway);
@withClickAway
export default class WorkSheetFilter extends Component {
  static propTypes = {
    onlyUseEditing: PropTypes.bool,
    zIndex: PropTypes.number,
    worksheetId: PropTypes.string,
    viewId: PropTypes.string,
    worksheetFlag: PropTypes.string,
    projectId: PropTypes.string,
    isCharge: PropTypes.bool,
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
    exposeComp: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      showFilter: false,
      showCustomAddCondition: true,
      showSaveWorksheetFilter: false,
      showAddColumnList: false,
      filters: [],
      activeFilter: props.chartId ? { name: _l('来自统计图的筛选'), isChartFilter: true } : null,
      editingFilter: null,
      saveAsFilter: null,
      filterExpandedId: null,
    };
  }
  componentDidMount() {
    if (_.isFunction(this.props.exposeComp)) {
      this.props.exposeComp(this);
    }
    emitter.addListener('FILTER_ADD_FROM_COLUMNHEAD', this.handleWorksheetHeadAddFilter);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.worksheetId !== nextProps.worksheetId || this.props.worksheetFlag !== nextProps.worksheetFlag) {
      this.clearFilter(false);
      this.setState({
        loaded: false,
        showSaveWorksheetFilter: false,
        showAddColumnList: false,
        activeFilter: null,
        editingFilter: null,
        saveAsFilter: null,
        filterExpandedId: null,
        filters: [],
      });
    }
    if (!nextProps.chartId && _.get(this.state, 'activeFilter.isChartFilter')) {
      this.clearFilter();
    }
  }
  componentWillUnmount() {
    emitter.removeListener('FILTER_ADD_FROM_COLUMNHEAD', this.handleWorksheetHeadAddFilter);
  }
  @autobind
  handleShowFilter(cb = () => {}) {
    const { loaded } = this.state;
    const { onlyUseEditing, worksheetId } = this.props;
    this.setState(
      {
        showFilter: true,
      },
      () => {
        if (!loaded && !onlyUseEditing) {
          this.loadWorksheetFilter(worksheetId, cb);
        } else {
          cb();
        }
      },
    );
  }
  @autobind
  loadWorksheetFilter(worksheetId, cb = () => {}) {
    if (!worksheetId) {
      return;
    }
    sheetAjax
      .getWorksheetFilters({ worksheetId })
      .then(data => {
        let filters = data.map(item => formatOriginFilterValue(item));
        if (md.global.Account.isPortal) {
          filters = filters.filter(o => o.type !== 2); //外部门户 排除公共筛选
        }
        this.setState(
          {
            loaded: true,
            showSaveWorksheetFilter: false,
            showAddColumnList: false,
            editingFilter: null,
            saveAsFilter: null,
            filterExpandedId: null,
            filters,
          },
          cb,
        );
      })
      .fail(err => {
        alert(_l('获取筛选列表失败'), 2);
      });
  }
  @autobind
  getFilterTypes(type) {
    let types = [];
    const typeKey = getTypeKey(type);
    if (typeKey) {
      types = CONTROL_FILTER_WHITELIST[typeKey].types.map(filterType => ({
        value: filterType,
        text: getFilterTypeLabel(typeKey, filterType),
      }));
    }
    if (type === 29) {
      types = [
        FILTER_CONDITION_TYPE.LIKE,
        FILTER_CONDITION_TYPE.NCONTAIN,
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ].map(filterType => ({
        value: filterType,
        text: getFilterTypeLabel(typeKey, filterType),
      }));
    }
    return types;
  }
  @autobind
  deleteFilter(filter) {
    const { appId } = this.props;
    const { activeFilter } = this.state;
    sheetAjax
      .deleteWorksheetFilter({
        appId,
        filterId: filter.id,
      })
      .then(() => {
        this.setState({
          filters: this.state.filters.filter(f => f.id !== filter.id),
        });
        if (activeFilter && activeFilter.id === filter.id) {
          this.clearFilter();
        }
      });
  }
  @autobind
  copyFilter(filter) {
    const { isCharge } = this.props;
    const { filters } = this.state;
    const newFilter = Object.assign({}, filter, {
      id: null,
      type: isCharge && filter.type === FILTER_TYPE.PUBLIC ? FILTER_TYPE.PUBLIC : FILTER_TYPE.PERSONAL,
      name: _l('%0-复制', filter.name),
    });
    this.saveFilterFn(newFilter, data => {
      newFilter.id = data.filterId;
      newFilter.createAccountId = md.global.Account.accountId;
      this.setState(
        {
          filters: this.state.filters.concat(newFilter),
          filterExpandedId: newFilter.id,
        },
        () => {
          this.filterWorksheet(newFilter);
          if (this.scroll) {
            if (newFilter.type === FILTER_TYPE.PUBLIC) {
              this.scroll.scrollTop = (filters.filter(f => f.type === FILTER_TYPE.PUBLIC).length + 2) * 36;
            } else {
              this.scroll.scrollTop = this.scroll.scrollHeight;
            }
          }
        },
      );
    });
  }
  @autobind
  addFilter(defaultConditions = [], filterImmediately = false) {
    const newFilter = {
      id: `${new Date().getTime().toString(16)}-${Math.random().toString(16).slice(2)}`,
      name: _l('自定义筛选'),
      type: FILTER_TYPE.TEMP,
      relationType: FILTER_RELATION_TYPE.AND,
      conditions: defaultConditions,
    };
    this.setState(
      {
        filterExpandedId: null,
        editingFilter: newFilter,
      },
      () => {
        if (this.scroll) {
          this.scroll.scrollTop = 0;
        }
        if (filterImmediately) {
          this.filterWorksheet(newFilter);
        }
      },
    );
  }
  @autobind
  handleWorksheetHeadAddFilter(control) {
    const { columns } = this.props;
    const { activeFilter, editingFilter, searchType } = this.state;
    const { filterExpandedId } = this.state;
    const condition = getDefaultCondition(control);
    this.handleShowFilter(() => {
      const newState = {
        filterExpandedId,
        showCustomAddCondition: false,
      };
      if (editingFilter && editingFilter.type === FILTER_TYPE.TEMP) {
        if (!_.find(editingFilter.conditions, c => c.controlId === control.controlId)) {
          this.addCondition(editingFilter, condition, () => {
            this.scroll.scrollTop = 0;
          });
        }
      } else if (activeFilter && searchType === 1) {
        if (!_.find(activeFilter.conditions, c => c.controlId === control.controlId)) {
          this.addCondition(activeFilter, condition);
        }
        newState.filterExpandedId = activeFilter.id;
      } else {
        const defaultConditions = [condition];
        if (searchType === 2) {
          const ownerControl = _.find(columns, c => c.controlId === 'ownerid');
          const ownerCondition = getDefaultCondition(ownerControl);
          ownerCondition.values = [md.global.Account.accountId];
          ownerCondition.originValues = [
            JSON.stringify({
              accountId: md.global.Account.accountId,
              name: md.global.Account.fullname,
              avatar: md.global.Account.avatar,
            }),
          ];
          defaultConditions.push(ownerCondition);
          newState.activeFilter = null;
        }
        newState.filterExpandedId = null;
        this.addFilter(defaultConditions, true);
      }
      this.setState(newState);
    });
  }
  @autobind
  updateFilterName(filter, name, callback = () => {}) {
    const { filters, editingFilter } = this.state;
    const oldFiltr = _.find(filters, f => f.id === filter.id);
    const newFilter = Object.assign({}, oldFiltr, { name });
    if (editingFilter) {
      this.setState({
        editingFilter: Object.assign({}, editingFilter, { name }),
      });
    } else {
      this.setState({
        filters: filters.map(f => (f.id === filter.id ? Object.assign({}, f, { name }) : f)),
      });
    }
    this.saveFilterFn(newFilter, () => {
      alert(_l('已成功重命名！'));
      callback();
    });
  }
  @autobind
  updateFilter(filter, value, callback = () => {}) {
    const newFilter = Object.assign({}, filter, value);
    this.setState(
      {
        editingFilter: newFilter,
      },
      callback,
    );
    if (value && Object.keys(value)[0] === 'name') {
      return;
    }
    this.filterWorksheet(newFilter);
  }
  @autobind
  updateFilterType(filter, type) {
    const newFilter = Object.assign({}, filter, { type });
    this.saveFilterFn(newFilter, () => {
      this.setState({
        filters: this.state.filters.map(f => (f.id === newFilter.id ? newFilter : f)),
      });
    });
  }
  @autobind
  saveNewFilter() {
    this.setState({ showSaveWorksheetFilter: true });
  }
  @autobind
  saveNewFilterFn({ filterName, filterType }) {
    const { editingFilter } = this.state;
    let newFilter = Object.assign({}, editingFilter, {
      name: filterName,
      type: filterType,
    });
    this.saveFilterFn(
      Object.assign({}, newFilter, {
        id: null,
      }),
      data => {
        newFilter = formatOriginFilterValue(data);
        this.setState({
          filters: this.state.filters.concat(newFilter),
          editingFilter: null,
          activeFilter: newFilter,
        });
      },
    );
  }
  @autobind
  saveFilter(filter) {
    this.saveFilterFn(filter, () => {
      this.setState({
        editingFilter: null,
        filters: this.state.filters.map(f => (f.id === filter.id ? filter : f)),
      });
    });
  }
  saveFilterFn(filter, cb) {
    const { worksheetId, appId } = this.props;
    const conditions = (filter.conditions || []).filter(condition => checkConditionAvailable(condition));
    sheetAjax
      .saveWorksheetFilter({
        appId,
        filterId: filter.id,
        name: filter.name,
        type: filter.type,
        worksheetId,
        items: conditions.map(condition => formatConditionForSave(condition, filter.relationType)),
      })
      .then(data => {
        if (cb) {
          cb(data);
          return;
        }
        alert(_l('保存成功！'));
      });
  }
  @autobind
  filterSaveAs(filter) {
    this.setState({
      saveAsFilter: filter,
      showSaveWorksheetFilter: true,
      saveDialogFilterName: filter.name,
      saveDialogFilterType: filter.type,
    });
  }
  @autobind
  filterSaveAsFn({ filterName, filterType }) {
    const { saveAsFilter, filters } = this.state;
    const newFilter = Object.assign({}, saveAsFilter, {
      id: null,
      name: filterName,
      type: filterType,
    });
    this.saveFilterFn(newFilter, data => {
      newFilter.id = data.filterId;
      this.setState(
        {
          filters: this.state.filters.concat(newFilter),
          filterExpandedId: newFilter.id,
          saveAsFilter: null,
          showSaveWorksheetFilter: false,
        },
        () => {
          this.filterWorksheet(newFilter);
          if (this.scroll) {
            if (newFilter.type === FILTER_TYPE.PUBLIC) {
              this.scroll.scrollTop = (filters.filter(f => f.type === FILTER_TYPE.PUBLIC).length + 2) * 36;
            } else {
              this.scroll.scrollTop = this.scroll.scrollHeight;
            }
          }
        },
      );
    });
  }
  @autobind
  addCondition(filter, condition, callback) {
    const newFilter = Object.assign({}, filter, {
      conditions: filter.conditions.concat(condition),
    });
    this.setState(
      {
        editingFilter: newFilter,
      },
      () => {
        if (
          condition.conditionGroupType === CONTROL_FILTER_WHITELIST.BOOL.value ||
          condition.controlType === 29 ||
          condition.conditionGroupType === CONTROL_FILTER_WHITELIST.SUBLIST.value
        ) {
          this.filterWorksheet(newFilter);
        }
        if (callback) {
          callback();
        }
      },
    );
  }
  @autobind
  updateCondition(filter, index, value) {
    const newConditions = filter.conditions.map((c, i) => (index === i ? Object.assign({}, c, value) : c));
    const newFilter = Object.assign({}, filter, {
      conditions: newConditions,
    });
    const availableConditions = newConditions.filter(condition => checkConditionAvailable(condition));
    this.filterWorksheet(newFilter);
    this.setState(
      Object.assign(
        {
          editingFilter: newFilter,
        },
        newFilter.type === FILTER_TYPE.TEMP && !availableConditions.length ? { activeFilter: null } : {},
      ),
    );
  }
  @autobind
  deleteCondition(filter, index) {
    const newFilter = Object.assign({}, filter, {
      conditions: filter.conditions.filter((c, i) => i !== index),
    });
    this.filterWorksheet(newFilter);
    this.setState({
      editingFilter: newFilter,
    });
  }
  @autobind
  filterWorksheet(filter) {
    const { onChange } = this.props;
    const { editingFilter } = this.state;
    const newState = {
      searchType: 1,
    };
    newState.activeFilter = filter;
    if (filter.type === FILTER_TYPE.TEMP) {
      newState.editingFilter = filter;
    }
    if (editingFilter && editingFilter.id !== filter.id) {
      newState.editingFilter = null;
    }
    this.setState(newState, () => {
      const availableConditions = filter.conditions.filter(condition => checkConditionAvailable(condition));
      onChange({
        searchType: 1,
        filterControls: availableConditions.map(condition => formatConditionForSave(condition, filter.relationType)),
      });
    });
  }
  @autobind
  clearFilter(needLoadData = true) {
    const { onChange } = this.props;
    this.setState({
      activeFilter: null,
      editingFilter: null,
      filterExpandedId: null,
      searchType: 1,
    });
    if (needLoadData) {
      onChange({
        searchType: 1,
        filterControls: [],
      });
    }
  }
  @autobind
  filterBySearchType(e) {
    e.stopPropagation();
    const { onChange } = this.props;
    this.setState(
      {
        activeFilter: {
          name: _l('我拥有的'),
        },
        searchType: 2,
        showFilter: false,
      },
      () => {
        onChange({
          searchType: 2,
          filterControls: [],
        });
      },
    );
  }
  renderFilterItem(filter, index) {
    const { onlyUseEditing, projectId, isCharge, appId } = this.props;
    const { showCustomAddCondition } = this.state;
    let { columns } = this.props;
    let unsaved = false;
    const { filterExpandedId, editingFilter, activeFilter } = this.state;
    const filterWhiteKeys = _.flatten(
      Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
    );
    columns = columns.filter(c => (c.controlPermissions || '111')[0] === '1').map(redefineComplexControl);
    columns = columns
      .filter(c => _.includes(filterWhiteKeys, c.type))
      .filter(c => !(c.type === 38 && c.enumDefault === 3));
    if (editingFilter && editingFilter.id === filter.id) {
      filter = editingFilter;
      unsaved = true;
    }
    return (
      <FilterItem
        disableSave={onlyUseEditing}
        projectId={projectId}
        appId={appId}
        key={filter.id}
        isCharge={isCharge}
        expanded={filterExpandedId === filter.id}
        selected={activeFilter && activeFilter.id === filter.id}
        unsaved={unsaved}
        showCustomAddCondition={showCustomAddCondition}
        onExpand={() => {
          this.setState(
            {
              filterExpandedId: filterExpandedId === filter.id ? null : filter.id,
            },
            () => {
              if (filterExpandedId !== filter.id) {
                this.filterWorksheet(activeFilter && activeFilter.id === filter.id ? activeFilter : filter);
              }
            },
          );
        }}
        columns={columns}
        index={index}
        filter={filter}
        hideFilter={() => {
          this.setState({ showFilter: false });
        }}
        updateCondition={this.updateCondition}
        deleteCondition={this.deleteCondition}
        updateFilter={this.updateFilter}
        addCondition={this.addCondition}
        getDefaultCondition={getDefaultCondition}
        onDelete={this.deleteFilter}
        onCopy={this.copyFilter}
        onSave={this.saveFilter}
        onSaveNew={this.saveNewFilter}
        onSaveAs={this.filterSaveAs}
        onRename={name => {
          this.updateFilterName(filter, name);
        }}
        onUpdateFilterType={type => {
          this.updateFilterType(filter, type);
        }}
        onFilter={() => {
          if (filterExpandedId !== filter.id) {
            this.setState({
              filterExpandedId: null,
            });
          }
          this.filterWorksheet(filter);
        }}
      />
    );
  }
  @autobind
  renderFilterHead() {
    const { chartId, clearChartId } = this.props;
    const { editingFilter } = this.state;
    let { activeFilter } = this.state;
    let text = '';
    if (activeFilter) {
      if (activeFilter.type === FILTER_TYPE.TEMP) {
        const conditions =
          editingFilter && editingFilter.conditions
            ? editingFilter.conditions.filter(condition => checkConditionAvailable(condition))
            : [];
        text = _l('%0 项', conditions.length);
        if (!conditions.length) {
          activeFilter = undefined;
          text = undefined;
        }
      } else {
        text = activeFilter.name;
      }
    }
    return (
      <span
        onClick={() => this.handleShowFilter()}
        className={cx('worksheetFilterBtn ThemeColor3 ThemeBGColor6', { active: activeFilter })}
      >
        <Tooltip disable={!_.isEmpty(activeFilter)} popupPlacement="bottom" text={<span>{_l('筛选')}</span>}>
          <i className="icon icon-worksheet_filter" />
        </Tooltip>
        {text ? <span className="selectedFilterName ellipsis">{text}</span> : null}
        {editingFilter && editingFilter.type !== FILTER_TYPE.TEMP && ' *'}
        {activeFilter && (
          <i
            className="icon icon-close resetFilterBtn ThemeHoverColor2"
            onClick={e => {
              e.stopPropagation();
              this.clearFilter();
              if (chartId) {
                clearChartId();
              }
            }}
          />
        )}
      </span>
    );
  }
  render() {
    const { onlyUseEditing, isCharge, zIndex } = this.props;
    const { showFilter, showSaveWorksheetFilter, filters, editingFilter, saveAsFilter } = this.state;
    const publicFilters = filters.filter(f => f.type === FILTER_TYPE.PUBLIC);
    const personalFilters = filters.filter(f => f.type === FILTER_TYPE.PERSONAL);
    const filterBodyMaxHeight = window.innerHeight - 90 - 240 - 50 - 10;
    const filter = (
      <ClickAwayable
        className="workSheetFilter"
        specialFilter={target => {
          const $targetTarget = $(target).closest(
            [
              '.dropdownTrigger',
              '.addFilterPopup',
              '.filterControlOptionsList',
              '.mui-dialog-container',
              '.mdDialog',
              '.mui-datetimepicker',
              '.mui-datetimerangepicker',
              '.selectUserBox',
              '.CityPicker',
              '.worksheetFilterOperateList',
              '.ant-picker-dropdown',
            ].join(','),
          )[0];
          return $targetTarget;
        }}
        onClickAwayExceptions={['.ant-cascader-menus', '.ant-tree-select-dropdown']}
        onClickAway={() => {
          this.setState({
            showFilter: false,
            showAddColumnList: false,
          });
        }}
      >
        {showSaveWorksheetFilter && (
          <SaveWorksheetFilter
            title={saveAsFilter ? _l('另存为筛选器') : _l('保存筛选器')}
            visible={showSaveWorksheetFilter}
            filterName={saveAsFilter && saveAsFilter.name}
            filterType={saveAsFilter && saveAsFilter.type}
            isCharge={isCharge}
            onHide={() => {
              this.setState({
                showSaveWorksheetFilter: false,
                saveAsFilter: null,
              });
            }}
            onSave={(...args) => {
              if (window.isPublicApp) {
                alert(_l('预览模式下，不能操作'), 3);
                return;
              }
              if (saveAsFilter) {
                this.filterSaveAsFn(...args);
              } else {
                this.saveNewFilterFn(...args);
              }
            }}
          />
        )}
        <div className="filterHeader">
          {_l('筛选')}
          {(!editingFilter || editingFilter.type !== FILTER_TYPE.TEMP) && (
            <span
              className="addFilterBtn Hand ThemeHoverColor3"
              data-tip={_l('添加筛选器')}
              onClick={() => this.addFilter()}
            >
              <i className="icon icon-add" />
            </span>
          )}
        </div>
        <div className="filterBody" ref={con => (this.scroll = con)} style={{ maxHeight: filterBodyMaxHeight }}>
          {editingFilter && editingFilter.type === FILTER_TYPE.TEMP && this.renderFilterItem(editingFilter, -1)}
          {!onlyUseEditing && (
            <React.Fragment>
              <div className="filterItem ThemeBGColor3" onClick={this.filterBySearchType}>
                {_l('我拥有的')}
              </div>
              {publicFilters.map((f, i) => this.renderFilterItem(f, i))}
              {!!personalFilters.length && <hr />}
              {!!personalFilters.length && <div className="title">{_l('我的筛选')}</div>}
              {personalFilters.map((f, i) => this.renderFilterItem(f, i))}
            </React.Fragment>
          )}
        </div>
      </ClickAwayable>
    );
    return (
      <Trigger
        zIndex={zIndex || 99}
        action={['click']}
        popup={filter}
        getPopupContainer={() => document.body}
        popupClassName="filterTrigger"
        popupVisible={showFilter}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [162, 6],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        {this.renderFilterHead()}
      </Trigger>
    );
  }
}
