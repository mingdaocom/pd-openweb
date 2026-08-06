import React, { Component, Fragment } from 'react';
import { Button, ConfigProvider, Dropdown, Modal } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, SortableList } from 'ming-ui';
import reportConfig from 'statistics/api/reportConfig';
import { reportTypes } from '../../Charts/common';
import { isDisplayModes, isTimeControl, renderFieldStyleValue } from '../../common/controlUtils';
import { formatSorts, getSortData, isCustomSort } from '../../common/reportConfigUtils';
import { timeParticleSizeDropdownData } from '../../common/timeUtils';

const SortContent = styled.div`
  border-radius: 3px;
  background-color: var(--color-background-card);
  box-shadow: var(--shadow-lg);
  width: auto !important;
  padding: 20px !important;
  max-height: 360px;
  overflow-y: auto;
  .sortItem {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .sortSelect {
    border-radius: 5px;
    margin-top: 8px;
    .item {
      width: 80px;
      color: var(--color-text-secondary);
      background-color: var(--color-background-card);
      text-align: center;
      font-size: 14px;
      padding: 5px 0;
      cursor: pointer;
      border: 1px solid var(--color-border-tertiary);
      border-right: none;
      &:first-child {
        border-radius: 5px 0 0 5px;
      }
      &:last-child {
        border-radius: 0 5px 5px 0;
        border-right: 1px solid var(--color-border-tertiary);
      }
      &.active {
        color: var(--color-primary);
        border-color: var(--color-primary);
        background-color: var(--color-background-primary);
      }
      &.active + .item {
        border-left-color: var(--color-primary);
      }
    }
  }
`;

const CustomSortItemContent = styled.div`
  border-radius: 3px;
  padding: 8px 5px;
  &:hover {
    background-color: var(--color-background-hover);
  }
`;

const CustomSortIconWrapper = styled.div`
  &.active,
  &:hover {
    span,
    .icon {
      color: var(--color-primary) !important;
    }
  }
`;

const defaultSort = {
  value: 0,
  text: _l('不排序'),
};

const customSort = {
  value: 3,
  text: _l('自定义'),
};

const Y_AXIS_SORT_SUFFIX = '-yaxis';
const RIGHT_AXIS_SORT_SUFFIX = '-right';
const SAME_AXIS_SORT_SUFFIXES = [RIGHT_AXIS_SORT_SUFFIX, Y_AXIS_SORT_SUFFIX];

// 排序层最大展开宽度预估，用于打开前判断靠左时是否需要向右展开。
const SORT_PANEL_SAFE_WIDTH = 360;
// 排序层与可视边界保留的安全距离，避免贴边或被容器边缘遮挡。
const SORT_PANEL_EDGE_GAP = 12;
// antd bottomLeft/bottomRight 默认水平偏移量，参与展开方向的边界计算。
const SORT_DROPDOWN_OFFSET = 20;
const SORT_DROPDOWN_ALIGN = {
  overflow: {
    adjustX: 1,
    adjustY: 1,
  },
};

const renderSortableItem = ({ item, DragHandle }) => {
  return (
    <CustomSortItemContent className="customSortItem flexRow valignWrapper">
      <DragHandle>
        <Icon icon="drag" className="textTertiary Font15 pointer" />
      </DragHandle>
      <span className="textPrimary Font14 mLeft5">{item.name}</span>
    </CustomSortItemContent>
  );
};

export default class Sort extends Component {
  constructor(props) {
    super(props);
    const { rightY } = props.currentReport;
    this.state = {
      visible: false,
      currentCustomSort: null,
      sortList: [],
      customSortLoading: false,
      customSortControl: null,
      customSortValue: null,
      dropdownPlacement: 'bottomRight',
      rightYaxisList: rightY ? this.setYaxisList(props) : [],
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { rightY } = this.props.currentReport;
      this.setState({
        rightYaxisList: rightY ? this.setYaxisList(this.props) : [],
      });
    }
  }
  getAxisSortId = axis => {
    if (!axis || !axis.controlId) return null;

    return axis.particleSizeType ? `${axis.controlId}-${axis.particleSizeType}` : axis.controlId;
  };
  getOriginalSortId = id => {
    if (!_.isString(id)) return id;

    const suffix = _.find(SAME_AXIS_SORT_SUFFIXES, suffix => id.endsWith(suffix));
    return suffix ? id.slice(0, -suffix.length) : id;
  };
  getYaxisSortId = (item, xaxes) => {
    const controlId = _.get(item, 'controlId');

    if (!controlId) return controlId;

    return this.getAxisSortId(xaxes) === controlId ? `${controlId}${Y_AXIS_SORT_SUFFIX}` : controlId;
  };
  getYaxisSortItem = (item, xaxes) => {
    const controlId = this.getYaxisSortId(item, xaxes);

    return controlId === item.controlId
      ? item
      : {
          ...item,
          originalControlId: item.controlId,
          controlId,
        };
  };
  getSortKey = item => Object.keys(item || {})[0];
  hasSortValue = value => !!value || _.isArray(value);
  normalizeSorts = (sorts, ids) => {
    const sortQueues = {};

    (sorts || []).forEach(item => {
      const key = this.getSortKey(item);
      if (!key) return;

      if (!sortQueues[key]) {
        sortQueues[key] = [];
      }

      sortQueues[key].push(item);
    });

    return ids
      .filter(id => id)
      .map(id => {
        const originalId = this.getOriginalSortId(id);
        let item = sortQueues[id] && sortQueues[id].shift();

        if (!item && originalId !== id) {
          item = sortQueues[originalId] && sortQueues[originalId].shift();
        }

        if (!item) return null;

        const key = this.getSortKey(item);
        const value = item[key];

        return this.hasSortValue(value)
          ? {
              [id]: value,
            }
          : null;
      })
      .filter(item => item);
  };
  getReportSortIds = () => {
    const { reportType, currentReport } = this.props;
    const { xaxes = {}, yaxisList = [], split = {}, rightY, pivotTable } = currentReport;
    const isPivotTable = reportType === reportTypes.PivotTable;

    if (isPivotTable) {
      const { lines = [], columns = [] } = pivotTable || {};
      const formatPivotId = item =>
        isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId;
      return [...lines.map(formatPivotId), ...columns.map(formatPivotId), ...yaxisList.map(item => item.controlId)];
    }

    const xaxesId = this.getAxisSortId(xaxes);
    const yList = yaxisList.map(item => this.getYaxisSortId(item, xaxes));
    const splitId = this.getAxisSortId(split);
    const rightYList = rightY ? this.setYaxisList(this.props).map(item => item.controlId) : [];
    const rightYSplitId = rightY ? this.getAxisSortId(rightY.split) : null;

    return [xaxesId, ...yList, splitId, ...rightYList, rightYSplitId];
  };
  getSorts = () => {
    const { sorts = [] } = this.props.currentReport;

    return this.normalizeSorts(sorts, this.getReportSortIds());
  };
  setYaxisList = props => {
    const { xaxes = {}, yaxisList = [], rightY } = props.currentReport;
    const sameAxisIds = [this.getAxisSortId(xaxes), ...yaxisList.map(item => item.controlId)].filter(id => id);

    return _.cloneDeep(rightY.yaxisList).map(item => {
      if (sameAxisIds.includes(item.controlId)) {
        item.originalControlId = item.controlId;
        item.controlId = `${item.controlId}${RIGHT_AXIS_SORT_SUFFIX}`;
      }

      return item;
    });
  };
  handleChangeSorts = sorts => {
    const { reportType, currentReport } = this.props;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const { xaxes, yaxisList, rightY, split = {} } = currentReport;

    const yList = yaxisList.map(item => this.getYaxisSortId(item, xaxes));

    if (isPivotTable) {
      const { pivotTable = { lines: [], columns: [] } } = currentReport;
      const lines = pivotTable.lines.map(item =>
        isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId,
      );
      const columns = pivotTable.columns.map(item =>
        isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId,
      );
      sorts = formatSorts(sorts, [...lines, ...columns, ...yList]);
    } else {
      const xaxesId = this.getAxisSortId(xaxes);
      const splitId = this.getAxisSortId(split);
      const rightYList = rightY ? this.setYaxisList(this.props).map(item => item.controlId) : [];
      const rightYSplitId = rightY ? this.getAxisSortId(rightY.split) : null;
      sorts = formatSorts(sorts, [xaxesId, ...yList, splitId, ...rightYList, rightYSplitId]);
    }

    this.props.onChangeCurrentReport({
      sorts,
    });
  };
  handleSaveSortList = () => {
    const { reportType, currentReport } = this.props;
    const { xaxes, split = {}, yaxisList, rightY } = currentReport;
    const { currentCustomSort, sortList, customSortValue } = this.state;
    const sortListKey = _.isNumber(customSortValue) ? customSortValue : sortList.map(item => item.originalName);
    const isPivotTable = reportType === reportTypes.PivotTable;

    if (isPivotTable) {
      this.handleChangePivotTableSort(sortListKey, { controlId: currentCustomSort });
    } else {
      const xaxesId = this.getAxisSortId(xaxes);
      const splitId = this.getAxisSortId(split);
      const yaxisSortIds = yaxisList.map(item => this.getYaxisSortId(item, xaxes));
      const rightYaxisSortIds = rightY ? this.setYaxisList(this.props).map(item => item.controlId) : [];
      const rightYSplitId = rightY ? this.getAxisSortId(rightY.split) : null;

      if (currentCustomSort === xaxesId) {
        this.handleChangeXSort(sortListKey, { controlId: xaxesId });
      } else if ([...yaxisSortIds, splitId, ...rightYaxisSortIds, rightYSplitId].includes(currentCustomSort)) {
        this.handleChangeYSort(sortListKey, { controlId: currentCustomSort });
      }
    }

    this.setState({ currentCustomSort: null, visible: true });
  };
  handleChangeVisible = visible => {
    this.setState({
      visible,
    });
  };
  getDropdownBoundaryLeft = triggerNode => {
    const boundaryNode = triggerNode.closest('.StatisticsPanel, .GlobalStatisticsPanel, .chartModal, .statisticsCard');

    if (!boundaryNode) {
      return 0;
    }

    return Math.max(boundaryNode.getBoundingClientRect().left, 0);
  };
  updateDropdownPlacement = triggerNode => {
    if (!triggerNode || !triggerNode.getBoundingClientRect) {
      return;
    }

    const rect = triggerNode.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const triggerCenterX = rect.left + rect.width / 2;
    const boundaryLeft = this.getDropdownBoundaryLeft(triggerNode);
    const bottomRightLeft = triggerCenterX + SORT_DROPDOWN_OFFSET - SORT_PANEL_SAFE_WIDTH;
    const bottomLeftRight = triggerCenterX - SORT_DROPDOWN_OFFSET + SORT_PANEL_SAFE_WIDTH;
    const dropdownPlacement =
      bottomRightLeft < boundaryLeft + SORT_PANEL_EDGE_GAP && bottomLeftRight <= viewportWidth - SORT_PANEL_EDGE_GAP
        ? 'bottomLeft'
        : 'bottomRight';

    if (dropdownPlacement !== this.state.dropdownPlacement) {
      this.setState({ dropdownPlacement });
    }
  };
  renderTrigger = () => {
    const child = React.Children.only(this.props.children);

    return React.cloneElement(child, {
      onClick: event => {
        this.updateDropdownPlacement(event.currentTarget);

        if (_.isFunction(child.props.onClick)) {
          child.props.onClick(event);
        }
      },
    });
  };
  handleChangeCustomSortValue = () => {
    const { customSortControl, customSortValue } = this.state;

    if (customSortValue === 1) {
      this.getCustomSort({ [customSortControl.controlId]: 2 });
    } else if (customSortValue === 2) {
      this.getCustomSort(null);
    } else {
      this.getCustomSort({ [customSortControl.controlId]: 1 });
    }
  };
  getCustomSort = value => {
    const { reportId, pageId, sourceType, currentReport, reportData } = this.props;
    const { controlId, sortControlId = controlId, controlType, displayMode } = this.state.customSortControl;
    const sortValue = value && (_.has(value, sortControlId) ? value[sortControlId] : value[controlId]);
    const isFieldStyle = isDisplayModes(controlType) && displayMode === 'fieldStyle';

    this.setState({
      customSortLoading: true,
      customSortValue: _.isNumber(sortValue) ? sortValue : null,
    });

    reportConfig
      .customSort({
        reportId,
        pageId,
        appId: currentReport.appId,
        controlId,
        auth: reportData.auth,
        owner: reportData.owner,
        sourceType,
        filter: currentReport.filter,
        sort: value ? { [controlId]: sortValue } : value,
      })
      .then(result => {
        const { valueMap } = reportData;
        const controlValueMap = valueMap[controlId] || {};
        this.setState({
          sortList: result.map((item, index) => {
            const key = _.findKey(item);
            const value = controlValueMap[key] || item[key];
            return {
              name: isFieldStyle ? renderFieldStyleValue(controlType, value) : value,
              originalName: key,
              id: index,
            };
          }),
          customSortLoading: false,
        });
      });
  };
  createSortItem = (id, value) => {
    const obj = {
      [id]: value,
    };
    this.handleChangeSorts([obj]);
  };
  handleChangeXSort = (value, { controlId }) => {
    const { currentReport } = this.props;
    const { yaxisList, split = {}, displaySetup } = currentReport;
    const sorts = this.getSorts();
    const isExclusion = _.isEmpty(split.controlId);

    if (sorts.length) {
      const currentEmpty = _.isEmpty(_.find(sorts, item => _.has(item, controlId)));

      if (currentEmpty) {
        sorts.push({
          [controlId]: value,
        });
      }

      const newSorts = sorts
        .map(n => {
          if (_.has(n, controlId)) {
            if (value) {
              n[controlId] = value;
              return n;
            } else {
              return null;
            }
          } else {
            if (displaySetup.isPile && yaxisList[0].controlId == this.getOriginalSortId(this.getSortKey(n))) {
              return isExclusion || displaySetup.isPile ? null : n;
            } else {
              return isExclusion ? null : n;
            }
          }
        })
        .filter(item => item);
      this.handleChangeSorts(newSorts);
    } else {
      value && this.createSortItem(controlId, value);
    }
  };
  handleChangeYSort = (value, { controlId }) => {
    const { reportType, currentReport } = this.props;
    const { yaxisList, split, xaxes, displaySetup } = currentReport;
    const sorts = this.getSorts();
    const isPivotTable = reportType === reportTypes.PivotTable;
    const isTopChart = reportType === reportTypes.TopChart;
    const isExclusion = _.isEmpty(split && split.controlId);
    const xaxesId = this.getAxisSortId(xaxes);

    if (sorts.length) {
      const currentEmpty = _.isEmpty(_.find(sorts, item => _.has(item, controlId)));

      if (currentEmpty) {
        sorts.push({
          [controlId]: value,
        });
      }

      const newSorts = sorts.map(n => {
        if (_.has(n, controlId)) {
          if (value) {
            n[controlId] = value;
            return n;
          } else {
            return null;
          }
        } else if (_.has(n, xaxesId)) {
          if (displaySetup.isPile && yaxisList[0].controlId == this.getOriginalSortId(controlId)) {
            return isExclusion || displaySetup.isPile ? null : n;
          } else {
            return isExclusion ? null : n;
          }
        } else {
          if (isPivotTable) {
            const key = this.getOriginalSortId(this.getSortKey(n));
            return _.find(yaxisList, { controlId: key }) ? null : n;
          } else {
            if (displaySetup.isPile || isTopChart) {
              return n;
            } else {
              return null;
            }
          }
        }
      });
      this.handleChangeSorts(newSorts.filter(item => item));
    } else {
      value && this.createSortItem(controlId, value);
    }
  };
  handleChangePivotTableSort = (value, { controlId }) => {
    const sorts = this.getSorts();

    if (sorts.length) {
      const currentEmpty = _.isEmpty(_.find(sorts, item => _.has(item, controlId)));

      if (currentEmpty) {
        sorts.push({
          [controlId]: value,
        });
      }

      const newSorts = sorts.map(n => {
        if (_.has(n, controlId)) {
          if (value) {
            n[controlId] = value;
            return n;
          } else {
            return null;
          }
        } else {
          return n;
        }
      });
      this.handleChangeSorts(newSorts.filter(item => item));
    } else {
      value && this.createSortItem(controlId, value);
    }
  };
  handleSortEnd = newSortList => {
    this.setState({ sortList: newSortList, customSortValue: null });
  };
  renderItem(item, fn, index) {
    const sorts = this.getSorts();
    const sortData = isCustomSort(item) && index !== 3 ? [...getSortData(item), customSort] : getSortData(item);
    const sortsItem = _.find(sorts, sort => _.has(sort, item.controlId));
    const value = sortsItem ? sortsItem[item.controlId] : 0;

    if (_.isEmpty(sortData)) {
      return null;
    }

    this.isRenderSort = true;
    return (
      <div className="sortItem" key={`${item.controlId}-${index}`}>
        <div className="textPrimary Font14 ellipsis">
          {item.particleSizeType
            ? `${item.controlName}(${_.find(timeParticleSizeDropdownData, { value: item.particleSizeType }).text})`
            : item.controlName}
        </div>
        <div className="sortSelect flexRow">
          {[defaultSort, ...sortData].map(data => (
            <div
              key={data.value}
              className={cx('item', { active: (_.isArray(value) ? customSort.value : value) === data.value })}
              onClick={() => {
                if (data.value == customSort.value) {
                  this.setState(
                    {
                      currentCustomSort: item.controlId,
                      visible: false,
                      customSortControl: {
                        ...item,
                        controlId: item.originalControlId || this.getOriginalSortId(item.controlId),
                        sortControlId: item.controlId,
                      },
                    },
                    () => {
                      this.getCustomSort(sortsItem);
                    },
                  );
                } else {
                  fn(data.value, item);
                }
              }}
            >
              {data.text}
              {data.value == customSort.value && (_.isArray(value) ? customSort.value : value) === data.value && (
                <Icon icon="arrow-down" className="Font12 mLeft2" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderFooter() {
    return (
      <div className="mTop20 mBottom10 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={() => {
              this.setState({ currentCustomSort: null, visible: true });
            }}
          >
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={this.handleSaveSortList}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  renderContent() {
    const { rightYaxisList } = this.state;
    const { reportType, currentReport } = this.props;
    const { xaxes = {}, yaxisList = [], split, rightY, pivotTable } = currentReport;
    return (
      <SortContent className="displaySetupPanel">
        {xaxes.controlId &&
          ![reportTypes.PivotTable, reportTypes.TopChart].includes(reportType) &&
          this.renderItem(
            {
              ...xaxes,
              originalControlId: xaxes.controlId,
              controlId: this.getAxisSortId(xaxes),
            },
            this.handleChangeXSort,
            0,
          )}
        {reportType == reportTypes.PivotTable && pivotTable && (
          <Fragment>
            {pivotTable.lines.map(yItem =>
              this.renderItem(
                {
                  ...yItem,
                  originalControlId: yItem.controlId,
                  controlId: isTimeControl(yItem.controlType)
                    ? `${yItem.controlId}-${yItem.particleSizeType}`
                    : yItem.controlId,
                },
                this.handleChangePivotTableSort,
                1,
              ),
            )}
            {pivotTable.columns.map(yItem =>
              this.renderItem(
                {
                  ...yItem,
                  originalControlId: yItem.controlId,
                  controlId: isTimeControl(yItem.controlType)
                    ? `${yItem.controlId}-${yItem.particleSizeType}`
                    : yItem.controlId,
                },
                this.handleChangePivotTableSort,
                2,
              ),
            )}
          </Fragment>
        )}
        {yaxisList.map(yItem => this.renderItem(this.getYaxisSortItem(yItem, xaxes), this.handleChangeYSort, 3))}
        {split &&
          split.controlId &&
          this.renderItem(
            {
              ...split,
              originalControlId: split.controlId,
              controlId: this.getAxisSortId(split),
            },
            this.handleChangeYSort,
            4,
          )}
        {rightYaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort, 5))}
        {rightY &&
          rightY.split.controlId &&
          this.renderItem(
            {
              ...rightY.split,
              originalControlId: rightY.split.controlId,
              controlId: this.getAxisSortId(rightY.split),
            },
            this.handleChangeYSort,
            6,
          )}
      </SortContent>
    );
  }
  getIsSort = () => {
    const { reportType, currentReport } = this.props;
    const { yaxisList = [], xaxes = {} } = currentReport;

    if (reportTypes.NumberChart === reportType) {
      return yaxisList.length > 1 || xaxes.cid;
    }

    return [
      reportTypes.LineChart,
      reportTypes.BarChart,
      reportTypes.PieChart,
      reportTypes.RadarChart,
      reportTypes.FunnelChart,
      reportTypes.DualAxes,
      reportTypes.PivotTable,
      reportTypes.BidirectionalBarChart,
      reportTypes.TopChart,
      reportTypes.CountryLayer,
    ].includes(reportType);
  };
  render() {
    const { visible, currentCustomSort, customSortValue, sortList, customSortLoading, dropdownPlacement } = this.state;
    const sortListHeight = sortList.length * 38;
    const Content = this.renderContent();
    if (!this.isRenderSort) return null;
    return (
      <Fragment>
        {this.getIsSort() && (
          <Dropdown
            visible={visible}
            onVisibleChange={this.handleChangeVisible}
            overlay={Content}
            trigger={['click']}
            placement={dropdownPlacement}
            align={SORT_DROPDOWN_ALIGN}
            getPopupContainer={() => document.body}
          >
            {this.renderTrigger()}
          </Dropdown>
        )}
        <Modal
          title={
            <div className="valignWrapper">
              <div className="flex">{_l('自定义排序')}</div>
              <CustomSortIconWrapper
                className={cx('valignWrapper pointer', { active: customSortValue })}
                onClick={this.handleChangeCustomSortValue}
              >
                <Icon className="mRight5 textTertiary Font20" icon="import_export" />
                <span className="textPrimary Font13 Normal">
                  {customSortValue ? (customSortValue === 2 ? 'Z → A' : 'A → Z') : _l('自定义')}
                </span>
              </CustomSortIconWrapper>
            </div>
          }
          className="chartModal"
          visible={!!currentCustomSort}
          centered={true}
          width={400}
          footer={this.renderFooter()}
          closable={false}
        >
          <div className="valignWrapper" style={{ height: sortListHeight > 520 ? 520 : sortListHeight }}>
            <ScrollView>
              {customSortLoading ? (
                <LoadDiv />
              ) : (
                currentCustomSort && (
                  <SortableList
                    useDragHandle
                    items={sortList || []}
                    itemKey="id"
                    renderItem={options => renderSortableItem({ ...options })}
                    onSortEnd={this.handleSortEnd}
                  />
                )
              )}
            </ScrollView>
          </div>
        </Modal>
      </Fragment>
    );
  }
}
