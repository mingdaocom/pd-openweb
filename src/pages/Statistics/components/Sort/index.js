import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Modal, Dropdown, Tooltip, Button, ConfigProvider } from 'antd';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import reportConfig from 'statistics/api/reportConfig';
import { getSortData, isCustomSort, isTimeControl, formatSorts, timeParticleSizeDropdownData } from '../../common';
import { reportTypes } from '../../Charts/common';

const SortContent = styled.div`
  border-radius: 3px;
  background-color: #fff;
  box-shadow: 0 6px 26px 6px #8484845c;
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
    background-color: #fff;
    margin-top: 8px;
    .item {
      width: 80px;
      color: #757575;
      text-align: center;
      font-size: 14px;
      padding: 5px 0;
      cursor: pointer;
      border: 1px solid #e0e0e0;
      border-right: none;
      &:first-child {
        border-radius: 5px 0 0 5px;
      }
      &:last-child {
        border-radius: 0 5px 5px 0;
        border-right: 1px solid #e0e0e0;
      }
      &.active {
        color: #1e88e5;
        border-color: #1e88e5;
        background-color: #fff;
      }
      &.active + .item {
        border-left-color: #1e88e5;
      }
    }
  }
`;

const CustomSortItemContent = styled.div`
  border-radius: 3px;
  padding: 8px 5px;
  &:hover,
  &.sortableCustomSortItem {
    background-color: #f6f6f6;
  }
  &.sortableCustomSortItem {
    z-index: 9999;
  }
`;

const CustomSortIconWrapper = styled.div`
  &.active, &:hover {
    span, .icon {
      color: #2196F3 !important;
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

const SortableItem = SortableElement(props => {
  const { item, sortIndex } = props;
  return (
    <CustomSortItemContent className="customSortItem flexRow valignWrapper" key={sortIndex}>
      <Icon icon="drag" className="Gray_9e Font15 pointer" />
      <span className="Gray Font14 mLeft5">{item.name}</span>
    </CustomSortItemContent>
  );
});

const SortableList = SortableContainer(({ list }) => {
  return (
    <div>
      {list.map((item, index) => (
        <SortableItem key={index} index={index} sortIndex={index} item={item} />
      ))}
    </div>
  );
});

export default class Sort extends Component {
  constructor(props) {
    super(props);
    const { rightY } = props.currentReport;
    this.state = {
      visible: false,
      currentCustomSort: null,
      sortList: [],
      customSortLoading: false,
      customSortId: null,
      customSortValue: null,
      rightYaxisList: rightY ? this.setYaxisList(props) : [],
    };
  }
  componentWillReceiveProps(nextProps) {
    const { rightY } = nextProps.currentReport;
    this.setState({
      rightYaxisList: rightY ? this.setYaxisList(nextProps) : [],
    });
  }
  setYaxisList = props => {
    const { yaxisList, rightY } = props.currentReport;
    const ySameList = _.filter(yaxisList, item => _.find(rightY.yaxisList, { controlId: item.controlId })).map(
      item => item.controlId,
    );
    return _.cloneDeep(rightY.yaxisList).map(item => {
      if (ySameList.includes(item.controlId)) {
        item.originalControlId = item.controlId;
        item.controlId = `${item.controlId}-right`;
      }
      return item;
    });
  };
  handleChangeSorts = sorts => {
    const { reportType, currentReport } = this.props;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const { xaxes, yaxisList, rightY, split = {} } = currentReport;

    const yList = yaxisList.map(item => item.controlId);
    if (isPivotTable) {
      const { pivotTable = { lines: [], columns: [] } } = currentReport;
      const lines = pivotTable.lines.map(item => isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId);
      const columns = pivotTable.columns.map(item => isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId);
      sorts = formatSorts(sorts, [...lines, ...columns, ...yList]);
    } else {
      const xaxesId = xaxes.particleSizeType ? `${xaxes.controlId}-${xaxes.particleSizeType}` : xaxes.controlId;
      const rightYList = rightY ? rightY.yaxisList.map(item => item.controlId) : [];
      const splitId = split.particleSizeType ? `${split.controlId}-${split.particleSizeType}` : split.controlId;
      const rightYSplitId = rightY ? (rightY.split.particleSizeType ? `${rightY.split.controlId}-${rightY.split.particleSizeType}` : rightY.split.controlId) : null;
      const ySameList = _.filter(yList, id => rightYList.includes(id)).map(item => item);
      const newRightYList = rightYList.map(id => {
        return ySameList.includes(id) ? `${id}-right` : id;
      });
      sorts = formatSorts(sorts, [xaxesId, ...yList, splitId, ...newRightYList, rightYSplitId], ySameList);
    }

    this.props.onChangeCurrentReport({
      sorts,
    });
  };
  handleSaveSortList = () => {
    const { reportType, currentReport } = this.props;
    const { xaxes, split = {}, sorts, yaxisList, rightY } = currentReport;
    const { currentCustomSort, sortList, customSortValue } = this.state;
    const sortListKey = _.isNumber(customSortValue) ? customSortValue : sortList.map(item => item.originalName);
    const isPivotTable = reportType === reportTypes.PivotTable;

    if (isPivotTable) {
      this.handleChangePivotTableSort(sortListKey, { controlId: currentCustomSort });
    } else {
      if (currentCustomSort === xaxes.controlId) {
        this.handleChangeXSort(sortListKey, { controlId: xaxes.controlId });
      }
      if (currentCustomSort === split.controlId) {
        this.handleChangeYSort(sortListKey, { controlId: split.controlId });
      }
      if (rightY && rightY.split.controlId) {
        const ySameList = _.filter(yaxisList, item => _.find(rightY.yaxisList, { controlId: item.controlId })).map(
          item => item.controlId,
        );
        this.handleChangeYSort(sortListKey, {
          controlId: ySameList.includes(rightY.split.controlId) ? `${rightY.split.controlId}-right` : rightY.split.controlId,
        });
      }
    }

    this.setState({ currentCustomSort: null, visible: true });
  };
  handleChangeVisible = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };
  handleChangeCustomSortValue = () => {
    const { customSortId, customSortValue } = this.state;
    if (customSortValue === 1) {
      this.getCustomSort(customSortId, { [customSortId]: 2 });
    } else if (customSortValue === 2) {
      this.getCustomSort(customSortId, null);
    } else {
      this.getCustomSort(customSortId, { [customSortId]: 1 });
    }
  }
  getCustomSort = (controlId, value) => {
    const { currentReport } = this.props;

    this.setState({
      customSortLoading: true,
      customSortId: controlId,
      customSortValue: value && _.isNumber(value[controlId]) ? value[controlId] : null
    });

    reportConfig
      .customSort({
        appId: currentReport.appId,
        controlId,
        filter: currentReport.filter,
        sort: value
      })
      .then(result => {
        this.setState({
          sortList: result.map(item => {
            const key = _.findKey(item);
            return {
              name: item[key],
              originalName: key,
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
    const { reportType, currentReport } = this.props;
    const { xaxes, yaxisList, split = {}, sorts, displaySetup } = currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const isExclusion = _.isEmpty(split.controlId) || isDualAxes;

    if (sorts.length) {
      const currentEmpty = _.isEmpty(_.find(sorts, controlId));

      if (currentEmpty) {
        sorts.push({
          [controlId]: value,
        });
      }

      const newSorts = sorts
        .map((n, index) => {
          if (n[controlId]) {
            if (value) {
              n[controlId] = value;
              return n;
            } else {
              return null;
            }
          } else {
            if (displaySetup.isPile && yaxisList[0].controlId == _.findKey(n)) {
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
    const { yaxisList, split, pivotTable, sorts, xaxes, displaySetup } = currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const isExclusion = _.isEmpty(split && split.controlId) || isDualAxes;
    const xaxesId = xaxes.particleSizeType ? `${xaxes.controlId}-${xaxes.particleSizeType}` : xaxes.controlId;

    if (sorts.length) {
      const currentEmpty = _.isEmpty(_.find(sorts, controlId));

      if (currentEmpty) {
        sorts.push({
          [controlId]: value,
        });
      }

      const newSorts = sorts.map(n => {
        if (n[controlId]) {
          if (value) {
            n[controlId] = value;
            return n;
          } else {
            return null;
          }
        } else if (n[xaxesId]) {
          if (displaySetup.isPile && yaxisList[0].controlId == controlId) {
            return isExclusion || displaySetup.isPile ? null : n;
          } else {
            return isExclusion ? null : n;
          }
        } else {
          if (isPivotTable) {
            const lineItem = _.findLast(pivotTable.lines) || {};
            const columnItem = _.findLast(pivotTable.columns) || {};
            const key = _.findKey(n);
            return _.find(yaxisList, { controlId: key }) || [lineItem.controlId, columnItem.controlId].includes(key)
              ? null
              : n;
          } else {
            if (displaySetup.isPile) {
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
    const { pivotTable, yaxisList, sorts } = this.props.currentReport;
    const { lines } = pivotTable;

    if (sorts.length) {
      const lineItem = _.findLast(pivotTable.lines) || {};
      const columnItem = _.findLast(pivotTable.columns) || {};
      const currentEmpty = _.isEmpty(_.find(sorts, controlId));

      if (currentEmpty) {
        sorts.push({
          [controlId]: value,
        });
      }

      const newSorts = sorts.map(n => {
        if (n[controlId]) {
          if (value) {
            n[controlId] = value;
            return n;
          } else {
            return null;
          }
        } else {
          const key = _.findKey(n);
          return [lineItem.controlId, columnItem.controlId].includes(controlId) && _.find(yaxisList, { controlId: key })
            ? null
            : n;
        }
      });
      this.handleChangeSorts(newSorts.filter(item => item));
    } else {
      value && this.createSortItem(controlId, value);
    }
  };
  handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) {
      return;
    }
    const { currentCustomSort, sortList } = this.state;
    const newSortList = arrayMove(sortList, oldIndex, newIndex);
    this.setState({ sortList: newSortList, customSortValue: null });
  };
  renderItem(item, fn) {
    const { currentReport } = this.props;
    const { sorts } = currentReport;
    const sortData = isCustomSort(item.controlType) ? [...getSortData(item.controlType), customSort] : getSortData(item.controlType);
    const sortsItem = _.find(sorts, item.controlId);
    const value = sortsItem ? sortsItem[item.controlId] : 0;
    return (
      !_.isEmpty(sortData) && (
        <div className="sortItem" key={item.controlId}>
          <div className="Gray Font14 ellipsis">
            {item.particleSizeType ? `${item.controlName}(${ _.find(timeParticleSizeDropdownData, { value: item.particleSizeType }).text })` : item.controlName}
          </div>
          <div className="sortSelect flexRow">
            {[defaultSort, ...sortData].map(data => (
              <div
                key={data.value}
                className={cx('item', { active: (_.isArray(value) ? customSort.value : value) === data.value })}
                onClick={() => {
                  if (data.value == customSort.value) {
                    this.getCustomSort(item.originalControlId || item.controlId, sortsItem);
                    this.setState({ currentCustomSort: item.controlId, visible: false });
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
      )
    );
  }
  renderFooter() {
    return (
      <div className="mTop15 mBottom20 pRight8">
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
        {xaxes.controlId && reportType !== reportTypes.PivotTable && this.renderItem({
          ...xaxes,
          originalControlId: xaxes.controlId,
          controlId: xaxes.particleSizeType ? `${xaxes.controlId}-${xaxes.particleSizeType}` : xaxes.controlId,
        }, this.handleChangeXSort)}
        {reportType == reportTypes.PivotTable && pivotTable && (
          <Fragment>
            {pivotTable.lines.map(yItem => this.renderItem({
              ...yItem,
              originalControlId: yItem.controlId,
              controlId: isTimeControl(yItem.controlType) ? `${yItem.controlId}-${yItem.particleSizeType}` : yItem.controlId
            }, this.handleChangePivotTableSort))}
            {pivotTable.columns.map(yItem => this.renderItem({
              ...yItem,
              originalControlId: yItem.controlId,
              controlId: isTimeControl(yItem.controlType) ? `${yItem.controlId}-${yItem.particleSizeType}` : yItem.controlId
            }, this.handleChangePivotTableSort))}
          </Fragment>
        )}
        {yaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort))}
        {split && split.controlId && this.renderItem({
          ...split,
          originalControlId: split.controlId,
          controlId: split.particleSizeType ? `${split.controlId}-${split.particleSizeType}` : split.controlId
        }, this.handleChangeYSort)}
        {rightYaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort))}
        {rightY && rightY.split.controlId && this.renderItem({
          ...rightY.split,
          originalControlId: rightY.split.controlId,
          controlId: rightY.split.particleSizeType ? `${rightY.split.controlId}-${rightY.split.particleSizeType}` : rightY.split.controlId
        }, this.handleChangeYSort)}
      </SortContent>
    );
  }
  render() {
    const { visible, currentCustomSort, customSortValue, sortList, customSortLoading } = this.state;
    const { reportType } = this.props;
    const sortListHeight = sortList.length * 38;
    return (
      <Fragment>
        {[
          reportTypes.LineChart,
          reportTypes.BarChart,
          reportTypes.PieChart,
          reportTypes.RadarChart,
          reportTypes.FunnelChart,
          reportTypes.DualAxes,
          reportTypes.PivotTable,
        ].includes(reportType) && (
          <Dropdown
            visible={visible}
            onVisibleChange={this.handleChangeVisible}
            overlay={this.renderContent()}
            trigger={['click']}
            placement="bottomRight"
          >
            <Tooltip title={_l('排序')} placement="bottom">
              <Icon icon="swap_vert" className="Font20 pointer Gray_9e Bold mLeft16 hoverHighlight" />
            </Tooltip>
          </Dropdown>
        )}
        <Modal
          title={(
            <div className="valignWrapper">
              <div className="flex">{_l('自定义排序')}</div>
              <CustomSortIconWrapper
                className={cx('valignWrapper pointer', { active: customSortValue })}
                onClick={this.handleChangeCustomSortValue}
              >
                <Icon className="mRight5 Gray_9e Font20" icon="swap_vert" />
                <span className="Gray Font13 Normal">{customSortValue ? (customSortValue === 2 ? 'Z → A' : 'A → Z') : _l('自定义')}</span>
              </CustomSortIconWrapper>
            </div>
          )}
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
                    axis="y"
                    helperClass="sortableCustomSortItem"
                    list={sortList}
                    shouldCancelStart={({ target }) => !target.classList.contains('icon-drag')}
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
