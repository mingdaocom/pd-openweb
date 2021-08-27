import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Modal, Dropdown, Tooltip, Button, ConfigProvider } from 'antd';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import reportConfig from 'src/pages/worksheet/common/Statistics/api/reportConfig';
import { getSortData, isCustomSort, formatSorts } from '../../common';
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
    <ScrollView style={{ maxHeight: 520 }}>
      {list.map((item, index) => (
        <SortableItem key={index} index={index} sortIndex={index} item={item} />
      ))}
    </ScrollView>
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
    const { xaxes, yaxisList, rightY, pivotTable, splitId } = currentReport;

    const yList = yaxisList.map(item => item.controlId);
    if (isPivotTable) {
      const lines = pivotTable.lines.map(item => item.controlId);
      const columns = pivotTable.columns.map(item => item.controlId);
      sorts = formatSorts(sorts, [...lines, ...columns, ...yList]);
    } else {
      const rightYList = rightY ? rightY.yaxisList.map(item => item.controlId) : [];
      const rightYSplitId = rightY ? rightY.splitId : null;
      const ySameList = _.filter(yList, id => rightYList.includes(id)).map(item => item);
      const newRightYList = rightYList.map(id => {
        return ySameList.includes(id) ? `${id}-right` : id;
      });
      sorts = formatSorts(sorts, [xaxes.controlId, ...yList, splitId, ...newRightYList, rightYSplitId], ySameList);
    }

    this.props.onChangeCurrentReport({
      sorts,
    });
  };
  handleSaveSortList = () => {
    const { reportType, currentReport } = this.props;
    const { xaxes, splitId, sorts, yaxisList, rightY } = currentReport;
    const { currentCustomSort, sortList } = this.state;
    const sortListKey = sortList.map(item => item.originalName);
    const isPivotTable = reportType === reportTypes.PivotTable;

    if (isPivotTable) {
      this.handleChangePivotTableSort(sortListKey, { controlId: currentCustomSort });
    } else {
      if (currentCustomSort === xaxes.controlId) {
        this.handleChangeXSort(sortListKey);
      }
      if (currentCustomSort === splitId) {
        this.handleChangeYSort(sortListKey, { controlId: splitId });
      }
      if (rightY && rightY.splitId) {
        const ySameList = _.filter(yaxisList, item => _.find(rightY.yaxisList, { controlId: item.controlId })).map(
          item => item.controlId,
        );
        this.handleChangeYSort(sortListKey, {
          controlId: ySameList.includes(rightY.splitId) ? `${rightY.splitId}-right` : rightY.splitId,
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
  getCustomSort = (controlId, value) => {
    const { currentReport } = this.props;

    this.setState({ customSortLoading: true });

    reportConfig
      .customSort({
        appId: currentReport.appId,
        controlId,
        customSort: _.isArray(value) ? value : [],
        filter: currentReport.filter,
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
  handleChangeXSort = value => {
    const { reportType, currentReport } = this.props;
    const { xaxes, yaxisList, splitId, sorts, displaySetup } = currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const isExclusion = _.isEmpty(splitId) || isDualAxes;

    if (sorts.length) {
      const currentEmpty = _.isEmpty(_.find(sorts, xaxes.controlId));

      if (currentEmpty) {
        sorts.push({
          [xaxes.controlId]: value,
        });
      }

      const newSorts = sorts
        .map((n, index) => {
          if (n[xaxes.controlId]) {
            if (value) {
              n[xaxes.controlId] = value;
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
      value && this.createSortItem(xaxes.controlId, value);
    }
  };
  handleChangeYSort = (value, { controlId }) => {
    const { reportType, currentReport } = this.props;
    const { yaxisList, splitId, pivotTable, sorts, xaxes, displaySetup } = currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const isExclusion = _.isEmpty(splitId) || isDualAxes;

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
        } else if (n[xaxes.controlId]) {
          if (displaySetup.isPile && yaxisList[0].controlId == controlId) {
            return isExclusion || displaySetup.isPile ? null : n;
          } else {
            return isExclusion ? null : n;
            // return splitId && !isDualAxes ? n : null;
          }
        } else {
          if (isPivotTable) {
            const lineItem = _.findLast(pivotTable.lines) || _.object();
            const columnItem = _.findLast(pivotTable.columns) || _.object();
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
      const lineItem = _.findLast(pivotTable.lines) || _.object();
      const columnItem = _.findLast(pivotTable.columns) || _.object();
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
    this.setState({ sortList: newSortList });
  };
  renderItem(item, fn) {
    const { controls, currentReport } = this.props;
    const { sorts } = currentReport;
    const control = _.find(controls, { controlId: item.originalControlId || item.controlId }) || _.object();
    const sortData = isCustomSort(control) ? [...getSortData(control), customSort] : getSortData(control);
    const sortsItem = _.find(sorts, item.controlId);
    const value = sortsItem ? sortsItem[item.controlId] : 0;
    return (
      !_.isEmpty(sortData) && (
        <div className="sortItem" key={item.controlId}>
          <div className="Gray Font14 ellipsis">{control.controlName}</div>
          <div className="sortSelect flexRow">
            {[defaultSort, ...sortData].map(data => (
              <div
                key={data.value}
                className={cx('item', { active: (_.isArray(value) ? customSort.value : value) === data.value })}
                onClick={() => {
                  if (data.value == customSort.value) {
                    this.getCustomSort(item.originalControlId || item.controlId, value);
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
    const { reportType, currentReport, controls } = this.props;
    const { xaxes, yaxisList, splitId, rightY, pivotTable } = currentReport;
    const xItem = _.find(controls, { controlId: xaxes.controlId });
    return (
      <SortContent className="displaySetupPanel">
        {xItem && reportType !== reportTypes.PivotTable && this.renderItem(xItem, this.handleChangeXSort)}
        {reportType == reportTypes.PivotTable && pivotTable && (
          <Fragment>
            {pivotTable.lines.map(yItem => this.renderItem(yItem, this.handleChangePivotTableSort))}
            {pivotTable.columns.map(yItem => this.renderItem(yItem, this.handleChangePivotTableSort))}
          </Fragment>
        )}
        {yaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort))}
        {splitId && this.renderItem({ controlId: splitId }, this.handleChangeYSort)}
        {rightYaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort))}
        {rightY && rightY.splitId && this.renderItem({ controlId: rightY.splitId }, this.handleChangeYSort)}
      </SortContent>
    );
  }
  render() {
    const { visible, currentCustomSort, sortList, customSortLoading } = this.state;
    const { reportType } = this.props;
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
              <div className="displaySetup flexRow valignWrapper">
                <div className="item h100 pAll5">
                  <Icon icon="swap_vert" className="Font20" />
                </div>
              </div>
            </Tooltip>
          </Dropdown>
        )}
        <Modal
          title={_l('自定义排序')}
          className="chartModal"
          visible={!!currentCustomSort}
          centered={true}
          width={400}
          footer={this.renderFooter()}
          closable={false}
        >
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
        </Modal>
      </Fragment>
    );
  }
}
