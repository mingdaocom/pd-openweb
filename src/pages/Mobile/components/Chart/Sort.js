import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { reportTypes } from 'statistics/Charts/common';
import { isTimeControl } from 'statistics/common/controlUtils';
import { formatSorts, getSortData } from 'statistics/common/reportConfigUtils';
import { timeParticleSizeDropdownData } from 'statistics/common/timeUtils';

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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { rightY } = this.props.currentReport;
      this.setState({
        rightYaxisList: rightY ? this.setYaxisList(rightY.yaxisList) : [],
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
    const {
      xaxes = {},
      yaxisList = [],
      rightY,
      split = {},
      reportType,
      lines = [],
      columns = [],
    } = this.props.currentReport;
    const isPivotTable = reportType === reportTypes.PivotTable;

    if (isPivotTable) {
      const formatPivotId = item =>
        isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId;
      return [...lines.map(formatPivotId), ...columns.map(formatPivotId), ...yaxisList.map(item => item.controlId)];
    }

    const xaxesId = this.getAxisSortId(xaxes);
    const yList = yaxisList.map(item => this.getYaxisSortId(item, xaxes));
    const splitId = this.getAxisSortId(split);
    const rightYList = rightY ? this.setYaxisList(rightY.yaxisList).map(item => item.controlId) : [];
    const rightYSplitId = rightY ? this.getAxisSortId(rightY.split) : null;

    return [xaxesId, ...yList, splitId, ...rightYList, rightYSplitId];
  };
  getSorts = () => {
    const { sorts = [] } = this.props.currentReport;

    return this.normalizeSorts(sorts, this.getReportSortIds());
  };
  setYaxisList = (list = []) => {
    const { xaxes = {}, yaxisList = [] } = this.props.currentReport;
    const sameAxisIds = [this.getAxisSortId(xaxes), ...yaxisList.map(item => item.controlId)].filter(id => id);

    return _.cloneDeep(list).map(item => {
      if (sameAxisIds.includes(item.controlId)) {
        item.originalControlId = item.controlId;
        item.controlId = `${item.controlId}${RIGHT_AXIS_SORT_SUFFIX}`;
      }

      return item;
    });
  };
  handleChangeSorts = sorts => {
    const {
      xaxes = {},
      yaxisList = [],
      rightY,
      split = {},
      reportType,
      lines = [],
      columns = [],
    } = this.props.currentReport;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const yList = yaxisList.map(item => this.getYaxisSortId(item, xaxes));

    if (isPivotTable) {
      const linesId = lines.map(item =>
        isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId,
      );
      const columnsId = columns.map(item =>
        isTimeControl(item.controlType) ? `${item.controlId}-${item.particleSizeType}` : item.controlId,
      );
      sorts = formatSorts(sorts, [...linesId, ...columnsId, ...yList]);
    } else {
      const xaxesId = this.getAxisSortId(xaxes);
      const splitId = this.getAxisSortId(split);
      const rightYList = rightY ? this.setYaxisList(rightY.yaxisList).map(item => item.controlId) : [];
      const rightYSplitId = rightY ? this.getAxisSortId(rightY.split) : null;
      sorts = formatSorts(sorts, [xaxesId, ...yList, splitId, ...rightYList, rightYSplitId]);
    }

    this.props.onChangeCurrentReport({
      sorts,
    });
  };
  handleSaveSortList = () => {
    const { xaxes, split, yaxisList = [], rightY, reportType } = this.props.currentReport;
    const { currentCustomSort, sortList } = this.state;
    const sortListKey = sortList.map(item => item.originalName);
    const isPivotTable = reportType === reportTypes.PivotTable;

    if (isPivotTable) {
      this.handleChangePivotTableSort(sortListKey, { controlId: currentCustomSort });
    } else {
      const xaxesId = this.getAxisSortId(xaxes);
      const splitId = this.getAxisSortId(split);
      const yaxisSortIds = yaxisList.map(item => this.getYaxisSortId(item, xaxes));
      const rightYaxisSortIds = rightY ? this.setYaxisList(rightY.yaxisList).map(item => item.controlId) : [];
      const rightYSplitId = rightY ? this.getAxisSortId(rightY.split) : null;

      if (currentCustomSort === xaxesId) {
        this.handleChangeXSort(sortListKey, { controlId: xaxesId });
      } else if ([...yaxisSortIds, splitId, ...rightYaxisSortIds, rightYSplitId].includes(currentCustomSort)) {
        this.handleChangeYSort(sortListKey, { controlId: currentCustomSort });
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
    const { yaxisList, split, displaySetup, reportType } = currentReport;
    const sorts = this.getSorts();
    const isDualAxes = reportType === reportTypes.DualAxes;
    const splitId = _.get(split, ['controlId']);
    const isExclusion = _.isEmpty(splitId) || isDualAxes;

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
    const { currentReport } = this.props;
    const { yaxisList, split, xaxes, displaySetup, reportType } = currentReport;
    const sorts = this.getSorts();
    const isDualAxes = reportType === reportTypes.DualAxes;
    const isPivotTable = reportType === reportTypes.PivotTable;
    const isTopChart = reportType === reportTypes.TopChart;
    const splitId = _.get(split, ['controlId']);
    const isExclusion = _.isEmpty(splitId) || isDualAxes;
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
  renderItem(item, fn) {
    const sorts = this.getSorts();
    const sortData = getSortData(item);
    const sortsItem = _.find(sorts, sort => _.has(sort, item.controlId));
    const value = sortsItem ? sortsItem[item.controlId] : 0;
    return (
      !_.isEmpty(sortData) && (
        <div key={item.controlId}>
          <div className="flexRow valignWrapper Font13 textSecondary mBottom16">
            {item.particleSizeType
              ? `${item.controlName}(${_.find(timeParticleSizeDropdownData, { value: item.particleSizeType }).text})`
              : item.controlName}
          </div>
          <div className="itemWrapper flexRow valignWrapper">
            {[defaultSort, ...sortData].map(data => (
              <div
                key={data.value}
                className={cx('item Font12 textPrimary', {
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
    const { xaxes, yaxisList = [], split, rightY, reportType } = currentReport;
    const splitId = _.get(split, ['controlId']);
    const rightYSplitId = _.get(rightY, ['split', 'controlId']);
    return (
      <div className="sortWrapper pAll15">
        {xaxes &&
          reportType !== reportTypes.PivotTable &&
          this.renderItem(
            {
              ...xaxes,
              originalControlId: xaxes.controlId,
              controlId: this.getAxisSortId(xaxes),
              particleSizeType: xaxes.particleSizeType,
            },
            this.handleChangeXSort,
          )}
        {reportType == reportTypes.PivotTable && (
          <Fragment>
            {currentReport.lines.map(yItem =>
              this.renderItem(
                {
                  ...yItem,
                  originalControlId: yItem.controlId,
                  controlId: isTimeControl(yItem.controlType)
                    ? `${yItem.controlId}-${yItem.particleSizeType}`
                    : yItem.controlId,
                },
                this.handleChangePivotTableSort,
              ),
            )}
            {currentReport.columns.map(yItem =>
              this.renderItem(
                {
                  ...yItem,
                  originalControlId: yItem.controlId,
                  controlId: isTimeControl(yItem.controlType)
                    ? `${yItem.controlId}-${yItem.particleSizeType}`
                    : yItem.controlId,
                },
                this.handleChangePivotTableSort,
              ),
            )}
          </Fragment>
        )}
        {yaxisList.map(yItem => this.renderItem(this.getYaxisSortItem(yItem, xaxes), this.handleChangeYSort))}
        {splitId &&
          this.renderItem(
            {
              ...split,
              originalControlId: splitId,
              controlId: this.getAxisSortId(split),
            },
            this.handleChangeYSort,
          )}
        {rightYaxisList.map(yItem => this.renderItem(yItem, this.handleChangeYSort))}
        {rightYSplitId &&
          this.renderItem(
            {
              ...rightY.split,
              originalControlId: rightYSplitId,
              controlId: this.getAxisSortId(rightY.split),
            },
            this.handleChangeYSort,
          )}
      </div>
    );
  }
}
