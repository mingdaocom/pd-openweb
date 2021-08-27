import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import reportConfig from 'src/pages/worksheet/common/Statistics/api/reportConfig';
import { getSortData, isCustomSort, formatSorts } from 'src/pages/worksheet/common/Statistics/common';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';

const defaultSort = {
  value: 0,
  text: _l('不排序'),
};

const customSort = {
  value: 3,
  text: _l('自定义'),
};

export default class ChartSort extends Component {
  constructor(props) {
    super(props);
    const { rightY } = props.currentReport;
    this.state = {
      visible: false,
      currentCustomSort: null,
      sortList: [],
      customSortLoading: false,
      rightYaxisList: rightY ? this.setYaxisList(rightY.yaxisList) : [],
    };
  }
  componentWillReceiveProps(nextProps) {
    const { rightY } = nextProps.currentReport;
    this.setState({
      rightYaxisList: rightY ? this.setYaxisList(rightY.yaxisList) : [],
    });
  }
  setYaxisList = list => {
    const { yaxisList, rightY } = this.props.currentReport;
    const ySameList = _.filter(yaxisList, item => _.find(rightY.yaxisList, { controlId: item.controlId })).map(
      item => item.controlId,
    );
    return _.cloneDeep(list).map(item => {
      if (ySameList.includes(item.controlId)) {
        item.originalControlId = item.controlId;
        item.controlId = `${item.controlId}-right`;
      }
      return item;
    });
  };
  handleChangeSorts = sorts => {
    const { xaxes, yaxisList, rightY, splitId, reportType, lines, columns } = this.props.currentReport;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const yList = yaxisList.map(item => item.controlId);
    if (isPivotTable) {
      const linesId = lines.map(item => item.controlId);
      const columnsId = columns.map(item => item.controlId);
      sorts = formatSorts(sorts, [...linesId, ...columnsId, ...yList]);
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
    const { xaxes, splitId, sorts, yaxisList, rightY, reportType } = this.props.currentReport;
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
  createSortItem = (id, value) => {
    const obj = {
      [id]: value,
    };
    this.handleChangeSorts([obj]);
  };
  handleChangeXSort = value => {
    const { currentReport } = this.props;
    const { xaxes, yaxisList, splitId, sorts, displaySetup, reportType } = currentReport;
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
    const { currentReport } = this.props;
    const { yaxisList, splitId, sorts, xaxes, displaySetup, reportType } = currentReport;
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
          }
        } else {
          if (isPivotTable) {
            const lineItem = _.findLast(currentReport.lines) || _.object();
            const columnItem = _.findLast(currentReport.columns) || _.object();
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
    const { yaxisList, sorts, lines, columns } = this.props.currentReport;

    if (sorts.length) {
      const lineItem = _.findLast(lines) || _.object();
      const columnItem = _.findLast(columns) || _.object();
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
  renderItem(item, fn) {
    const { controls, currentReport } = this.props;
    const { sorts } = currentReport;
    const control = _.find(controls, { controlId: item.originalControlId || item.controlId }) || _.object();
    // const sortData = isCustomSort(type) ? [...getSortData(type, controls), customSort] : getSortData(type, controls);
    const sortData = getSortData(control);
    const sortsItem = _.find(sorts, item.controlId);
    const value = sortsItem ? sortsItem[item.controlId] : 0;
    return (
      !_.isEmpty(sortData) && (
        <div key={item.controlId}>
          <div className="flexRow valignWrapper Font13 Gray_75 mBottom16">{control.controlName}</div>
          <div className="itemWrapper flexRow valignWrapper">
            {[defaultSort, ...sortData].map(data => (
              <div
                key={data.value}
                className={cx('item Font12 Gray', {
                  active: (_.isArray(value) ? customSort.value : value) === data.value,
                })}
                onClick={() => {
                  if (data.value == customSort.value) {
                    this.setState({ currentCustomSort: item.controlId, visible: false });
                  } else {
                    fn(data.value, item);
                  }
                }}
              >
                {data.text}
              </div>
            ))}
          </div>
        </div>
      )
    );
  }
  render() {
    const { rightYaxisList } = this.state;
    const { currentReport, controls } = this.props;
    const { xaxes, yaxisList, splitId, rightY, reportType } = currentReport;
    const xItem = _.find(controls, { controlId: xaxes.controlId });
    return (
      <div className="sortWrapper pAll15">
        {xItem && reportType !== reportTypes.PivotTable && this.renderItem(xItem, this.handleChangeXSort)}
        {reportType == reportTypes.PivotTable && (
          <Fragment>
            {currentReport.lines.map(yItem => this.renderItem(yItem, this.handleChangePivotTableSort))}
            {currentReport.columns.map(yItem => this.renderItem(yItem, this.handleChangePivotTableSort))}
          </Fragment>
        )}
        {yaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort))}
        {splitId && this.renderItem({ controlId: splitId }, this.handleChangeYSort)}
        {rightYaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort))}
        {rightY && rightY.splitId && this.renderItem({ controlId: rightY.splitId }, this.handleChangeYSort)}
      </div>
    );
  }
}
