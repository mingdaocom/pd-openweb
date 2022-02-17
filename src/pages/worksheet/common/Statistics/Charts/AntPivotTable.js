import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { formatrChartValue } from './common';
import { timeParticleSizeDropdownData, areaParticleSizeDropdownData, isTimeControl, isAreaControl, isNumberControl } from 'src/pages/worksheet/common/Statistics/common';
import { Table } from 'antd';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { browserIsMobile } from 'src/util';

const isMobile = browserIsMobile();

const PivotTableContent = styled.div`
  &.contentYAuto {
    overflow-y: auto;
  }
  &.contentAutoHeight {
    overflow: hidden;
    .ant-table-wrapper,
    .ant-spin-nested-loading,
    .ant-spin-container,
    .ant-table,
    .ant-table-container,
    .ant-table-content {
      height: 100%;
    }
    .ant-table-content {
      overflow: auto !important;
    }
  }
  &.contentXAuto {
    .ant-table-container {
      width: fit-content;
      min-width: 100%;
    }
  }
  &.contentScroll {
    .ant-table-header colgroup col:last-child {
      display: none;
    }
    thead th {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .ant-table-container {
    th.ant-table-cell-ellipsis {
      white-space: initial;
      overflow: initial;
    }
    thead {
      background-color: #fafafa;
    }
    thead th {
      color: #757575;
      font-weight: bold;
    }
  }
  .ant-table-container, table, tr>th, tr>td {
    border-color: #E0E0E0 !important;
  }
  // .ant-table-tbody > tr.ant-table-row:hover > td {
  //   background-color: transparent;
  // }
  .ant-table-tbody > tr.ant-table-row:nth-child(even) {
    background-color: #fafcfd;
  }
  .ant-table-tbody tr:not(tr[data-row-key='sum']) .contentValue:hover {
    color: #2196f3 !important;
    background-color: #E3F2FD !important;
  }
  th, td {
    min-width: 100px;
    text-align: left !important;
  }
  .ant-table-cell-scrollbar {
    display: none;
  }
  .ant-table-body {
    overflow-y: overlay !important;
    overflow-x: overlay !important;
  }
`;

/**
 * 将连续的单元格合并
 */
const uniqMerge = data => {
  data = data.map((item, index) => item || _l('空'));
  for(let i = data.length - 1; i >= 0; i--) {
    let current = data[i];
    let last = data[i - 1];
    if (current == last) {
      data[i] = null;
      data[i - 1] = {
        value: last,
        length: 2,
      }
    }
    if (_.isObject(current) && current.value === last) {
      data[i - 1] = {
        value: last,
        length: current.length + 1,
      }
      data[i] = null;
    }
  }
  return data;
}

/**
 * 多维度单元格合并
 */
const mergeTableCell = list => {
  list.map((item, index) => {
    const last = list[index - 1];
    if (last) {
      let data = last.data.map((n, i) => {
        if (_.isObject(n)) {
          let end = i + n.length;
          return uniqMerge(item.data.slice(i, end));
        } else if (_.isString(n)) {
          return item.data[i] || _l('空');
        } else {
          return false;
        }
      });
      item.data = _.flatten(data.filter(item => item));
    } else {
      item.data = uniqMerge(item.data);
    }
    return item;
  });
  return list;
}

const mergeColumnsCell = (data, yaxisList) => {
  data = _.cloneDeep(data);
  const length = _.find(data, { summary_col: false }).y.length;
  const result = [];

  for(let i = 0; i < length; i++) {
    result.push({
      index: i,
      data: [],
    });
    data.filter(item => !item.summary_col).forEach(item => {
      if (item.y && item.y.length) {
        result[i].data.push(item.y[i]);
      }
    });
  }

  mergeTableCell(result).forEach((item, index) => {
    item.data.forEach((n, i) => {
      data.filter(item => !item.summary_col)[i].y[index] = n;
    });
  });

  data.forEach(item => {
    const { t_id, data } = item;
    item.data = data.map(n => {
      if (_.isNumber(n)) {
        const current = _.find(yaxisList, { controlId: t_id });
        return formatrChartValue(n, false, yaxisList, t_id, false);
      } else {
        return n;
      }
    });
  });

  return data;
}

const mergeLinesCell = (data, lines, valueMap) => {
  const result = data.map(item => {
    const key = Object.keys(item)[0];
    const res = item[key].map(item => {
      return valueMap[key] ? (valueMap[key][item] || item) : item;
    });
    const target = _.find(lines, { cid: key }) || {};
    const isTime = isTimeControl(target.controlType);
    const isArea = isAreaControl(target.controlType);
    const name = target.rename || target.controlName;
    if (isTime) {
      return {
        key,
        name: target.particleSizeType ? `${name}(${ _.find(timeParticleSizeDropdownData, { value: target.particleSizeType }).text })` : name,
        data: res,
      }
    }
    if (isArea) {
      return {
        key,
        name: target.particleSizeType ? `${name}(${ _.find(areaParticleSizeDropdownData, { value: target.particleSizeType }).text })` : name,
        data: res,
      }
    }
    return {
      key,
      name,
      data: res,
    }
  });
  return mergeTableCell(result);
}

const getColumnTotal = (result, yaxisList, columns, showColumnTotal) => {
}

@errorBoundary
export default class extends Component {
  constructor(props) {
    super(props);
    this.columnWidth = 130;
  }
  get result() {
    const { data, yaxisList } = this.props.reportData;
    return mergeColumnsCell(data.data, yaxisList);
  }
  get linesData() {
    const { data, lines, valueMap } = this.props.reportData;
    return mergeLinesCell(data.x, lines, valueMap);
  }
  handleOpenSheet = (data) => {
    const { reportData, isViewOriginalData, isThumbnail } = this.props;
    const { displaySetup } = reportData;
    if (displaySetup.showRowList && isViewOriginalData) {
      if (isThumbnail) {
        this.props.onOpenChartDialog({
          isPersonal: false,
          match: data
        });
      } else {
        this.props.requestOriginalData({
          isPersonal: false,
          match: data
        });
      }
    }
  }
  getColumnName(column) {
    const { rename, controlName, controlType, particleSizeType } = column;
    const name = rename || controlName;
    const isTime = isTimeControl(controlType);
    const isArea = isAreaControl(controlType);
    if (isTime) {
      return particleSizeType ? `${name}(${ _.find(timeParticleSizeDropdownData, { value: particleSizeType }).text })` : name;
    }
    if (isArea) {
      return particleSizeType ? `${name}(${ _.find(areaParticleSizeDropdownData, { value: particleSizeType }).text })` : name;
    }
    return name;
  }
  getColumnsHeader(linesData) {
    let { columns, style } = this.props.reportData;
    const { pivotTableUnilineShow, pivotTableLineFreeze } = style ? style : {};
    
    columns = _.cloneDeep(columns);

    const get = (column) => {
      return {
        title: this.getColumnName(column),
        dataIndex: column.cid,
        children: column.children
      }
    }

    const render = (data, row, index) => {
      if (data === null) {
        return {
          children: null,
          props: {
            rowSpan: 0
          }
        }
      }
      if (_.isObject(data)) {
        const props = {};
        if (data.sum) {
          props.colSpan = data.length;
        } else {
          props.rowSpan = data.length;
        }
        return {
          children: data.value,
          props
        }
      }

      if (pivotTableUnilineShow) {
        return data;
      }

      return (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{data}</div>
      );
    }

    const linesChildren = linesData.map(item => {
      return {
        title: item.name,
        dataIndex: item.key,
        ellipsis: pivotTableUnilineShow,
        fixed: !isMobile && pivotTableLineFreeze ? 'left' : null,
        width: this.columnWidth,
        render
      }
    });

    for(let i = columns.length - 1; i >= 0; i--) {
      const column = columns[i];
      const next = columns[i + 1];
      if (next) {
        column.children = [get(next)];
      } else {
        column.children = linesChildren.length ? linesChildren : [{ title: null }];
      }
    }

    return columns.length ? [get(columns[0])] : linesChildren;
  }
  getColumnsContent(result) {
    const { reportData, isViewOriginalData } = this.props;
    const { columns, lines, valueMap, yaxisList, pivotTable, data, displaySetup } = reportData;
    const { columnSummary = {} } = pivotTable || reportData;
    const dataList = [];

    const getTitle = (id, value) => {
      return valueMap[id] ? valueMap[id][value] : value;
    }

    const getYaxisList = (index) => {
      const yaxisColumn = yaxisList.map((item, i) => {
        const { rename, controlName } = item;
        const name = rename || controlName;
        return {
          title: name,
          dataIndex: `${item.controlId}-${index + i}`,
          colSpan: 1,
          className: displaySetup.showRowList && isViewOriginalData ? 'contentValue' : undefined,
          width: this.columnWidth,
          onCell: (record) => {
            return {
              onClick: (event) => {
                if (record.key === 'sum') {
                  return;
                }
                const param = {};
                data.x.forEach(item => {
                  const key = _.findKey(item);
                  const { controlType } = _.find(lines, { controlId: key }) || {};
                  const isNumber = isNumberControl(controlType);
                  const value = item[key][record.key];
                  param[key] = isNumber ? Number(value) : value;
                });
                columns.forEach((item, i) => {
                  const isNumber = isNumberControl(item.controlType);
                  const value = data.data[index].y[i];
                  param[item.cid] = isNumber ? Number(value) : value;
                });
                this.handleOpenSheet(param);
              }
            };
          }
        }
      });
      return yaxisColumn;
    }

    const getChildren = (columnIndex, startIndex, endIndex) => {
      const res = result.map((item, index) => {
        const data = item.y[columnIndex];
        const nextIndex = columnIndex + 1;
        const isObject = _.isObject(data);
        const colSpan = isObject ? data.length : 1;
        const id = columns[columnIndex].cid;
        return {
          title: getTitle(id, isObject ? data.value : data),
          key: id,
          colSpan,
          children: nextIndex < columns.length ? getChildren(nextIndex, index, colSpan) : getYaxisList(index)
        }
      });
      return res.splice(startIndex, endIndex).filter(item => item.title);
    }

    if (columns.length) {
      result.forEach((item, index) => {
        const firstItem = item.y.length ? item.y[0] : null;
        if (firstItem) {
          const isObject = _.isObject(firstItem);
          const colSpan = isObject ? firstItem.length : 1;
          const id = columns[0].cid;
          const obj = {
            title: getTitle(id, isObject ? firstItem.value : firstItem),
            key: id,
            colSpan,
            children: item.y.length > 1 ? getChildren(1, index, colSpan) : getYaxisList(index)
          }
          dataList.push(obj);
        }
      });
    } else {
      dataList.push(...getYaxisList(0));
    }

    const columnTotal = this.getColumnTotal(result);

    if (columnSummary.location === 3 && columnTotal) {
      dataList.unshift(columnTotal);
    }
    if (columnSummary.location === 4 && columnTotal) {
      dataList.push(columnTotal);
    }

    return dataList;
  }
  getColumnTotal(result) {
    const { reportData } = this.props;
    const { yaxisList, columns, pivotTable } = reportData;
    const { showColumnTotal, columnSummary } = pivotTable || reportData;
    
    if (!(showColumnTotal && columns.length)) return null;

    let index = 0;

    const children = [];
    const childrenYaxisList = [];

    const data = {
      title: `${_l('列汇总')} ${columnSummary.name ? `(${columnSummary.name})` : null}`,
      children: [],
      rowSpan: columns.length,
      colSpan: yaxisList.length
    }

    const set = (data) => {
      index = index + 1;
      if (index === columns.length) {
        data.children = childrenYaxisList;
      } else {
        data.children = [{
          title: null,
          rowSpan: 0
        }];
        set(data.children[0]);
      }
    }

    result.forEach((item, index) => {
      if (item.summary_col) {
        const { rename, controlName } =  _.find(yaxisList, { controlId: item.t_id });
        const name = rename || controlName;
        childrenYaxisList.push({
          title: name,
          dataIndex: `${item.t_id}-${index}`,
          colSpan: 1,
          width: this.columnWidth
        });
      }
    });

    set(data);

    return data;
  }
  getDataSource(result, linesData) {
    const { reportData } = this.props;
    const { yaxisList, pivotTable } = reportData;
    const { lineSummary, showLineTotal } = pivotTable || reportData;
    const tableLentghData = Array.from({ length: linesData[0] ? linesData[0].data.length : 1 });
    
    const dataSource = tableLentghData.map((_, index) => {
      const obj = { key: index };
      linesData.forEach(item => {
        obj[item.key] = item.data[index];
      });
      result.forEach((item, i) => {
        obj[`${item.t_id}-${i}`] = item.data[index] || '--';
      });
      return obj;
    });

    const summary = {
      key: 'sum'
    };
    const sum = {
      value: `${_l('行汇总')} ${lineSummary.name ? `(${lineSummary.name})` : null}`,
      length: linesData.length,
      sum: true
    };

    linesData.forEach((item, index) => {
      if (index) {
        summary[item.key] = null;
      } else {
        summary[item.key] = sum;
      }
    });

    result.forEach((item, i) => {
      const value = _.isNumber(item.sum) ? formatrChartValue(item.sum, false, yaxisList, item.t_id, false) : '--'
      summary[`${item.t_id}-${i}`] = value;
    });

    if (showLineTotal && lineSummary.location == 1) {
      dataSource.unshift(summary);
    }
    if (showLineTotal && lineSummary.location == 2) {
      dataSource.push(summary);
    }

    return dataSource;
  }
  getScrollConfig() {
    const { isThumbnail, reportData } = this.props;
    const { reportId, style, columns } = reportData;
    const { pivotTableColumnFreeze, pivotTableLineFreeze } = style ? style : {};
    const parent = isThumbnail ? document.querySelector(`.statisticsCard-${reportId} .content`) : document.querySelector(`.ChartDialog .chart .flex`);
    const config = {};
    if (isMobile) {
      return config;
    }
    // 行
    if (pivotTableLineFreeze) {
      config.x = '100%';
    }
    // 列
    if (pivotTableColumnFreeze && parent) {
      const headerHeight = (columns.length + 1) * 39;
      const scrollbarsHeight = 10;
      if (!pivotTableLineFreeze) {
        config.x = '100%';
      }
      config.y = parent.offsetHeight - headerHeight - scrollbarsHeight;
    }
    return config;
  }
  render() {
    const { data, yaxisList, columns, lines, valueMap } = this.props.reportData;
    const { result, linesData } = this;

    const controlName = this.getColumnsHeader(linesData);
    const controlContent = this.getColumnsContent(result);
    const dataSource = this.getDataSource(result, linesData);
    const scrollConfig = this.getScrollConfig();

    const tableColumns = [
      ...controlName,
      ...controlContent
    ];

    return (
      <PivotTableContent
        className={cx('flex flexColumn chartWrapper', {
          contentXAuto: _.isUndefined(scrollConfig.x),
          contentYAuto: _.isUndefined(scrollConfig.y),
          contentAutoHeight: scrollConfig.x && _.isUndefined(scrollConfig.y),
          contentScroll: scrollConfig.y
        })}
      >
        <Table
          bordered
          size="small"
          pagination={false}
          columns={tableColumns}
          dataSource={dataSource}
          scroll={scrollConfig}
        />
      </PivotTableContent>
    );
  }
}