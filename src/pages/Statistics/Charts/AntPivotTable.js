import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { formatrChartValue } from './common';
import { timeParticleSizeDropdownData, areaParticleSizeDropdownData, isTimeControl, isAreaControl, isFormatNumber, relevanceImageSize } from 'statistics/common';
import { Table } from 'antd';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { browserIsMobile, getClassNameByExt } from 'src/util';
import previewAttachments from 'previewAttachments';

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
  &.hideHeaderLastTr {
    thead tr:last-child {
      display: none;
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
  .ant-table-tbody > tr.ant-table-row:nth-child(even) {
    background-color: #fafcfd;
  }
  .ant-table-tbody tr:not(tr[data-row-key='sum']) .contentValue:hover {
    color: #2196f3 !important;
    background-color: #E3F2FD !important;
  }
  thead {
    th, td {
      text-align: left !important;
    }
  }
  th, td {
    min-width: 100px;
  }
  .ant-table-cell-scrollbar {
    display: none;
  }
  .ant-table-body {
    overflow-y: overlay !important;
    overflow-x: overlay !important;
  }
  .relevanceContent {
    width: 130px;
    display: flex;
    align-items: center;
    padding-right: 10px;
  }
  .otherContent {
    width: 130px;
  }
  .fileContent {
    min-width: 130px;
    flex-wrap: wrap;
    flex: none;
    overflow: hidden;
  }
  .imageWrapper {
    margin: 0 5px 5px 0;
    .fileIcon {
      display: flex;
    }
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
  const length = _.get(_.find(data, { summary_col: false }), ['y', 'length']) || 0;
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
  const result = mergeTableCell(data.map(item => {
    const key = Object.keys(item)[0];
    const res = item[key];
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
  }));

  const parse = (value) => {
    let result = value;
    try {
      let res = JSON.parse(value);
      if (_.isArray(res)) {
        res = res.map(item => {
          return parse(item);
        });
      }
      result = res;
    } catch (err) {}
    return result;
  }

  result.forEach((item) => {
    const control = _.find(lines, { cid: item.key }) || {};
    item.data = item.data.map(n => {
      if (_.isNull(n)) return n;
      if (_.isObject(n)) {
        return {
          ...n,
          value: valueMap[item.key] ? (valueMap[item.key][n.value] || _l('空')) : n.value
        }
      } else {
        return valueMap[item.key] ? (valueMap[item.key][n] || _l('空')) : n;
      }
    });
    if (control.controlType === 29) {
      item.data = item.data.map(item => {
        if (_.isObject(item)) {
          return {
            ...item,
            value: parse(item.value)
          }
        } else {
          return parse(item);
        }
      });
    }
  });

  return result;
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
  handleFilePreview = (res, file) => {
    const index = _.findIndex(res, { fileID: file.fileID });
    previewAttachments({
      attachments: res,
      index,
      callFrom: 'player',
      hideFunctions: ['editFileName']
    });
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
    let { lines, columns, style, yaxisList } = this.props.reportData;
    const { pivotTableUnilineShow, pivotTableLineFreeze } = style ? style : {};
    
    columns = _.cloneDeep(columns);

    if (columns.length && lines.length && yaxisList.length === 1) {
      columns.pop();
    }

    const get = (column) => {
      return {
        title: this.getColumnName(column),
        dataIndex: column.cid,
        children: column.children
      }
    }

    const linesChildren = linesData.map(item => {
      const control = _.find(lines, { controlId: item.key }) || {};
      const { controlType, fields = [] } = control;
      const showControl = controlType === 29 && !_.isEmpty(fields);
      const data = item.data;
      return {
        title: () => {
          if (showControl) {
            return (
              <div className="flexRow valignWrapper">
              {
                fields.map((item, index) => (
                  <div
                    key={item.controlId}
                    className={cx(item.controlType === 14 ? 'fileContent' : 'otherContent')}
                    style={{
                      width: item.controlType === 14 ? this.getMaxFileLength(data, index) * _.find(relevanceImageSize, { value: item.size }).px : null
                    }}
                  >
                    {item.controlName}
                  </div>
                ))
              }
              </div>
            );
          }
          return item.name;
        },
        dataIndex: item.key,
        ellipsis: pivotTableUnilineShow,
        fixed: !isMobile && pivotTableLineFreeze ? 'left' : null,
        width: showControl ? this.getAllMaxFilesWidth(data, fields) : this.columnWidth,
        render: (...args) => {
          return this.renderLineTd(...args, control);
        }
      }
    });

    for(let i = columns.length - 1; i >= 0; i--) {
      const column = columns[i];
      const next = columns[i + 1];
      if (next) {
        column.children = [get(next)];
      } else {
        column.children = linesChildren.length ? linesChildren : [{ title: null, width: this.columnWidth }];
      }
    }

    return columns.length ? [get(columns[0])] : linesChildren;
  }
  getColumnsContent(result) {
    const { reportData, isViewOriginalData } = this.props;
    const { columns, lines, valueMap, yaxisList, pivotTable, data, displaySetup } = reportData;
    const { columnSummary = {} } = pivotTable || reportData;
    const dataList = [];

    const getTitle = (id, data) => {
      if (_.isNull(data)) return;
      if (_.isObject(data)) {
        return valueMap[id] ? valueMap[id][data.value] || _l('空') : data.value;
      } else {
        return valueMap[id] ? valueMap[id][data] || _l('空') : data;
      }
    }

    const getYaxisList = (index) => {
      const yaxisColumn = yaxisList.map((item, i) => {
        const { rename, controlName } = item;
        const name = rename || controlName;
        return {
          title: name,
          dataIndex: `${item.controlId}-${index + i}`,
          colSpan: 1,
          className: cx('TxtRight', displaySetup.showRowList && isViewOriginalData ? 'contentValue' : undefined),
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
                  const isNumber = isFormatNumber(controlType);
                  const value = item[key][record.key];
                  param[key] = isNumber ? Number(value) : value;
                });
                columns.forEach((item, i) => {
                  const isNumber = isFormatNumber(item.controlType);
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
      const res = _.cloneDeep(result).splice(startIndex, endIndex).map((item, index) => {
        const data = item.y[columnIndex];
        const nextIndex = columnIndex + 1;
        const isObject = _.isObject(data);
        const colSpan = isObject ? data.length : 1;
        const id = columns[columnIndex].cid;
        return {
          title: getTitle(id, data),
          key: id,
          colSpan,
          children: nextIndex < columns.length ? getChildren(nextIndex, startIndex + index, colSpan) : getYaxisList(startIndex + index)
        }
      });
      return res.filter(item => item.title);
    }

    if (columns.length) {
      result.forEach((item, index) => {
        const firstItem = item.y.length ? item.y[0] : null;
        if (firstItem) {
          const isObject = _.isObject(firstItem);
          const colSpan = isObject ? firstItem.length : 1;
          const id = columns[0].cid;
          const obj = {
            title: getTitle(id, firstItem),
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
    const sumData = columnSummary.controlList.length === 1 ? columnSummary.controlList[0] : {};

    const data = {
      title: sumData.name ? `${_l('列汇总')} (${sumData.name})` : _l('列汇总'),
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
        const { rename, controlName } =  _.find(yaxisList, { controlId: item.t_id }) || {};
        const name = rename || controlName;
        const sumData = _.find(columnSummary.controlList, { controlId: item.t_id }) || {};
        childrenYaxisList.push({
          title: sumData.name ? `${name} (${sumData.name})` : name,
          dataIndex: `${item.t_id}-${index}`,
          colSpan: 1,
          width: this.columnWidth,
          className: 'TxtRight'
        });
      }
    });

    set(data);

    return data;
  }
  getDataSource(result, linesData) {
    const { reportData } = this.props;
    const { yaxisList, pivotTable } = reportData;
    const { lineSummary, columnSummary, showLineTotal } = pivotTable || reportData;
    const tableLentghData = Array.from({ length: linesData[0] ? linesData[0].data.length : 1 });
    
    const dataSource = tableLentghData.map((__, index) => {
      const obj = { key: index };
      linesData.forEach(item => {
        obj[item.key] = item.data[index];
      });
      result.forEach((item, i) => {
        const value = item.data[index];
        obj[`${item.t_id}-${i}`] = value || '--';
      });
      return obj;
    });

    const summary = {
      key: 'sum'
    };
    const sum = {
      value: _l('行汇总'),
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
      const value = _.isNumber(item.sum) ? formatrChartValue(item.sum, false, yaxisList, item.t_id, false) : '';
      const sumData = _.find(lineSummary.controlList, { controlId: item.t_id }) || {};
      summary[`${item.t_id}-${i}`] = value ? (sumData.name ? `${sumData.name} ${value}` : value) : '';
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
  getMaxFileLength(data, index) {
    const maxValue = 10;
    data = data.map(item => {
      if (item && item.value && _.isArray(item.value[index])) {
        return item.value[index].length;
      }
      if (_.isArray(item)) {
        return item[index].length;
      }
      return null;
    });
    const value = _.max(data);
    return value > maxValue ? maxValue : value;
  }
  getAllMaxFilesWidth(data, fields) {
    let width = 0;
    fields.forEach((field, index) => {
      if (field.controlType === 14) {
        width += this.getMaxFileLength(data, index) * _.find(relevanceImageSize, { value: field.size }).px;
      } else {
        width += 130;
      }
    });
    return width;
  }
  renderFile(file, px, fileIconSize, handleFilePreview) {
    const src = `${file.filepath}${file.filename}?imageView2/2/h/${px}`;
    const isPicture = File.isPicture(file.ext);
    const fileClassName = getClassNameByExt(file.ext);

    if (file.fileID) {
      return (
        <div key={file.fileID} className="imageWrapper" onClick={() => { handleFilePreview(file) }}>
          {isPicture ? (
            <img src={src} />
          ) : (
            <div className={cx('fileIcon', fileClassName)} style={fileIconSize}></div>
          )}
        </div>
      );
    } else {
      return (
        <div style={{ width: px }}>{'--'}</div>
      );
    }
  }
  renderRelevanceContent(relevanceData, parentControl, index) {
    const { fields } = parentControl;
    const control = fields[index];

    if (control.controlType === 14) {
      const { px, fileIconSize } = _.find(relevanceImageSize, { value: control.size || 2 });
      const { data } = _.find(this.linesData, { key: parentControl.controlId });
      const max = this.getMaxFileLength(data, index);
      const handleFilePreview = this.handleFilePreview.bind(this, relevanceData);
      return (
        <div className="relevanceContent fileContent" style={{ width: max * px }} key={control.controlId}>
          {relevanceData.length ? (
            relevanceData.map(file => (
              this.renderFile(file, px, fileIconSize, handleFilePreview)
            ))
          ) : (
            <div style={{ width: px }}>{'--'}</div>
          )}
        </div>
      )
    }

    return (
      <div className="relevanceContent" key={control.controlId}>
        {_.isArray(relevanceData) ? relevanceData.join('、') : relevanceData || '--'}
      </div>
    );
  }
  renderLineTd(data, row, index, control) {
    const { style } = this.props.reportData;
    const { pivotTableUnilineShow, pivotTableLineFreeze } = style ? style : {};
    const { controlType, fields } = control;

    if (data === null) {
      return {
        children: null,
        props: {
          rowSpan: 0
        }
      }
    }

    if (_.isObject(data) && 'value' in data) {
      const props = {};
      if (data.sum) {
        props.colSpan = data.length;
      } else {
        props.rowSpan = data.length;
      }
      if (controlType === 29 && !_.isEmpty(fields) && !data.sum && _.isArray(data.value)) {
        const res = data.value;
        return {
          children: (
            <div className="flexRow w100">
              {
                res.map((item, index) => (
                  this.renderRelevanceContent(item, control, index)
                ))
              }
            </div>
          ),
          props
        }
      } else {
        return {
          children: data.value,
          props
        }
      }
    }

    if (controlType === 29 && !_.isEmpty(fields) && _.isArray(data)) {
      const res = data;
      return (
        <div className="flexRow w100">
          {
            res.map((item, index) => (
              this.renderRelevanceContent(item, control, index)
            ))
          }
        </div>
      );
    }

    if (pivotTableUnilineShow) {
      return data;
    }

    return (
      <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{data}</div>
    );
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
          contentScroll: scrollConfig.y,
          hideHeaderLastTr: columns.length && yaxisList.length === 1
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