import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { getSortData, isCustomSort, formatSorts, isTimeControl, timeParticleSizeDropdownData } from 'statistics/common';
import { reportTypes } from 'statistics/Charts/common';

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
    const { xaxes, yaxisList, rightY, split, reportType, lines, columns } = this.props.currentReport;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const yList = yaxisList.map(item => item.controlId);
    if (isPivotTable) {
      const linesId = lines.map(item => isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId);
      const columnsId = columns.map(item => isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId);
      sorts = formatSorts(sorts, [...linesId, ...columnsId, ...yList]);
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
    const { xaxes, sorts, split, yaxisList, rightY, reportType } = this.props.currentReport;
    const { currentCustomSort, sortList } = this.state;
    const sortListKey = sortList.map(item => item.originalName);
    const isPivotTable = reportType === reportTypes.PivotTable;
    const splitId = _.get(split, ['controlId']);
    const rightYSplitId = _.get(rightY, ['split', 'controlId']);

    if (isPivotTable) {
      this.handleChangePivotTableSort(sortListKey, { controlId: currentCustomSort });
    } else {
      if (currentCustomSort === xaxes.controlId) {
        this.handleChangeXSort(sortListKey, { controlId: xaxes.controlId });
      }
      if (currentCustomSort === splitId) {
        this.handleChangeYSort(sortListKey, { controlId: splitId });
      }
      if (rightYSplitId) {
        const ySameList = _.filter(yaxisList, item => _.find(rightY.yaxisList, { controlId: item.controlId })).map(
          item => item.controlId,
        );
        this.handleChangeYSort(sortListKey, {
          controlId: ySameList.includes(rightYSplitId) ? `${rightYSplitId}-right` : rightYSplitId,
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
  handleChangeXSort = (value, { controlId }) => {
    const { currentReport } = this.props;
    const { xaxes, yaxisList, split, sorts, displaySetup, reportType } = currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const splitId = _.get(split, ['controlId']);
    const isExclusion = _.isEmpty(splitId) || isDualAxes;

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
    const { currentReport } = this.props;
    const { yaxisList, split, sorts, xaxes, displaySetup, reportType } = currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const splitId = _.get(split, ['controlId']);
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
            const lineItem = _.findLast(currentReport.lines) || {};
            const columnItem = _.findLast(currentReport.columns) || {};
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
      const lineItem = _.findLast(lines) || {};
      const columnItem = _.findLast(columns) || {};
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
    const { currentReport } = this.props;
    const { sorts } = currentReport;
    const sortData = getSortData(item.controlType);
    const sortsItem = _.find(sorts, item.controlId);
    const value = sortsItem ? sortsItem[item.controlId] : 0;
    return (
      !_.isEmpty(sortData) && (
        <div key={item.controlId}>
          <div className="flexRow valignWrapper Font13 Gray_75 mBottom16">
            {item.particleSizeType ? `${item.controlName}(${ _.find(timeParticleSizeDropdownData, { value: item.particleSizeType }).text })` : item.controlName}
          </div>
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
    const { currentReport } = this.props;
    const { xaxes, yaxisList, split, rightY, reportType } = currentReport;
    const splitId = _.get(split, ['controlId']);
    const rightYSplitId = _.get(rightY, ['split', 'controlId']);
    return (
      <div className="sortWrapper pAll15">
        {xaxes && reportType !== reportTypes.PivotTable && (
          this.renderItem({
            ...xaxes,
            originalControlId: xaxes.controlId,
            controlId: xaxes.particleSizeType ? `${xaxes.controlId}-${xaxes.particleSizeType}` : xaxes.controlId,
            particleSizeType: xaxes.particleSizeType
          }, this.handleChangeXSort)
        )}
        {reportType == reportTypes.PivotTable && (
          <Fragment>
            {currentReport.lines.map(yItem => this.renderItem({
              ...yItem,
              originalControlId: yItem.controlId,
              controlId: isTimeControl(yItem.controlType) ? `${yItem.controlId}-${yItem.particleSizeType}` : yItem.controlId
            }, this.handleChangePivotTableSort))}
            {currentReport.columns.map(yItem => this.renderItem({
              ...yItem,
              originalControlId: yItem.controlId,
              controlId: isTimeControl(yItem.controlType) ? `${yItem.controlId}-${yItem.particleSizeType}` : yItem.controlId
            }, this.handleChangePivotTableSort))}
          </Fragment>
        )}
        {yaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort))}
        {splitId && this.renderItem({
          ...split,
          originalControlId: splitId,
          controlId: split.particleSizeType ? `${splitId}-${split.particleSizeType}` : splitId
        }, this.handleChangeYSort)}
        {rightYaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort))}
        {rightYSplitId && this.renderItem({
          ...rightY.split,
          originalControlId: rightYSplitId,
          controlId: rightY.split.particleSizeType ? `${rightYSplitId}-${rightY.split.particleSizeType}` : rightYSplitId
        }, this.handleChangeYSort)}
      </div>
    );
  }
}
