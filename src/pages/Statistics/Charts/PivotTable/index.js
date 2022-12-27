import React, { Component, Fragment, createRef } from 'react';
import cx from 'classnames';
import { formatrChartValue } from '../common';
import { isFormatNumber, relevanceImageSize } from 'statistics/common';
import { Table } from 'antd';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { browserIsMobile, getClassNameByExt } from 'src/util';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { uniqMerge, mergeTableCell, mergeColumnsCell, mergeLinesCell, getColumnName, renderValue } from './util';
import PivotTableContent from './styled';
import _ from 'lodash';

const isMobile = browserIsMobile();
const isPrintPivotTable = location.href.includes('printPivotTable');

@errorBoundary
export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragValue: 0
    }
    this.$ref = createRef(null);
  }
  get result() {
    const { data, yaxisList } = this.props.reportData;
    return mergeColumnsCell(data.data, yaxisList);
  }
  get linesData() {
    const { data, lines, valueMap } = this.props.reportData;
    return mergeLinesCell(data.x, lines, valueMap);
  }
  get scrollTableBody() {
    const { reportData } = this.props;
    const { style } = reportData;
    const { pivotTableColumnFreeze, pivotTableLineFreeze } = style ? style : {};
    if (pivotTableColumnFreeze) {
      return this.$ref.current.querySelector('.ant-table-body');
    }
    if (pivotTableLineFreeze) {
      return this.$ref.current.querySelector('.ant-table-content');
    }
  }
  handleMouseDown = (event, index) => {
    const { target } = event;
    const { scrollTableBody } = this;
    const scrollLeft = scrollTableBody ? scrollTableBody.scrollLeft : 0;
    const startClientX = event.clientX;
    const startDragValue = ((index ? target.parentElement.offsetLeft - 1 : 0) + target.parentElement.clientWidth) - (index ? scrollLeft : 0);
    this.setState({
      dragValue: startDragValue
    });
    document.onmousemove = event => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;
      if (width >= 80) {
        this.setState({
          dragValue: startDragValue + x
        });
      }
    }
    document.onmouseup = (event) => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;
      this.setColumnWidth(index, width >= 80 ? width : 80);
      this.setState({
        dragValue: 0
      });
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }
  getColumnWidthConfig = () => {
    const { settingVisible, reportData } = this.props;
    const { reportId, style } = reportData;
    const { pivotTableColumnWidthConfig = {} } = style || {};
    const key = `pivotTableColumnWidthConfig-${reportId}`;
    if (sessionStorage.getItem(key)) {
      return JSON.parse(sessionStorage.getItem(key)) || {};
    } else {
      return pivotTableColumnWidthConfig;
    }
  }
  setColumnWidth = (index, width) => {
    const { settingVisible, reportData, onChangeCurrentReport } = this.props;
    const { reportId, style } = reportData;
    const key = `pivotTableColumnWidthConfig-${reportId}`;
    const data = JSON.parse(sessionStorage.getItem(key)) || {};
    const config = {
      ...data,
      [index]: width
    };
    if (settingVisible) {
      onChangeCurrentReport({
        style: {
          ...style,
          pivotTableColumnWidthConfig: config
        }
      });
    };
    sessionStorage.setItem(key, JSON.stringify(config));
  }
  getColumnWidth = (index) => {
    const { data, reportId, style } = this.props.reportData;
    const config = this.getColumnWidthConfig();
    const width = config[index];

    if (width) {
      return Number(width);
    } else {
      const { pivotTableUnilineShow, pivotTableColumnFreeze, pivotTableLineFreeze } = style || {};
      if (pivotTableColumnFreeze || pivotTableLineFreeze) {
        return 130;
      } else if (!_.isEmpty(config)) {
        const parent = this.getParentNode();
        const parentWidth = parent.clientWidth - 2;
        const configKeys = Object.keys(config);
        const occupyWidth = configKeys.map(key => config[key]).reduce((count, item) => item + count, 0);
        const columnCount = (data.data.length + 1) - configKeys.length;
        const width = (parentWidth - occupyWidth) / columnCount;
        return width < 80 ? 80 : width;
      } else {
        return pivotTableUnilineShow ? 130 : undefined;
      }
    }
  }
  handleOpenSheet = (data) => {
    const { reportData, isViewOriginalData, isThumbnail } = this.props;
    const { displaySetup } = reportData;
    if (displaySetup.showRowList && isViewOriginalData && !isPrintPivotTable) {
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
  getColumnsHeader(linesData) {
    let { lines, columns, style, yaxisList } = this.props.reportData;
    const { pivotTableUnilineShow, pivotTableLineFreeze, mobilePivotTableLineFreeze } = style ? style : {};

    columns = _.cloneDeep(columns);

    if (columns.length && lines.length && yaxisList.length === 1) {
      columns.pop();
    }

    const get = (column) => {
      return {
        title: getColumnName(column),
        dataIndex: column.cid,
        children: column.children
      }
    }

    const linesChildren = linesData.map((item, index) => {
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
          return (
            <Fragment>
              {item.name}
              {this.renderDrag(index)}
            </Fragment>
          )
        },
        dataIndex: item.key,
        ellipsis: pivotTableUnilineShow,
        fixed: (isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze) ? 'left' : null,
        width: showControl ? this.getAllMaxFilesWidth(data, fields) : this.getColumnWidth(index),
        className: 'line-content',
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
        column.children = linesChildren.length ? linesChildren : [{ title: null, width: undefined }];
      }
    }

    return columns.length ? [get(columns[0])] : linesChildren;
  }
  getColumnsContent(result) {
    const { reportData, isViewOriginalData } = this.props;
    const { columns, lines, valueMap, yaxisList, pivotTable, data, displaySetup } = reportData;
    const { columnSummary = {}, showColumnTotal } = pivotTable || reportData;
    const dataList = [];

    const getTitle = (id, data) => {
      if (_.isNull(data)) return;
      const control = _.find(columns, { cid: id }) || {};
      const advancedSetting = control.advancedSetting || {};
      const valueKey = valueMap[id];
      if (_.isObject(data)) {
        return valueKey ? renderValue(valueKey[data.value], advancedSetting) || _l('空') : renderValue(data.value, advancedSetting);
      } else {
        return valueKey ? renderValue(valueKey[data], advancedSetting) || _l('空') : renderValue(data, advancedSetting);
      }
    }

    const getYaxisList = (index) => {
      const yaxisColumn = yaxisList.map((item, i) => {
        const { rename, controlName } = item;
        const name = rename || controlName;
        const dragIndex = index + i + lines.length;

        return {
          title: () => {
            return (
              <Fragment>
                {name}
                {this.renderDrag(dragIndex)}
              </Fragment>
            );
          },
          dataIndex: `${item.controlId}-${index + i}`,
          colSpan: 1,
          className: cx('cell-content', displaySetup.showRowList && isViewOriginalData ? 'contentValue' : undefined),
          width: this.getColumnWidth(dragIndex),
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
        const title = getTitle(id, data);
        return {
          title: title ? () => {
            return (
              <Fragment>
                {title}
                {this.renderDrag(index + 1)}
              </Fragment>
            );
          } : title,
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
          const children = item.y.length > 1 ? getChildren(1, index, colSpan) : getYaxisList(index);
          const obj = {
            title: () => {
              return (
                <Fragment>
                  {getTitle(id, firstItem)}
                  {columns.length === 1 && yaxisList.length === 1 && (
                    this.renderDrag(index + 1)
                  )}
                </Fragment>
              )
            },
            width: children.length ? undefined : this.getColumnWidth(index + 1),
            key: id,
            colSpan,
            children
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
      title: () => {
        return (
          <Fragment>
            {sumData.name ? `${columnSummary.rename || _l('列汇总')} (${sumData.name})` : columnSummary.rename || _l('列汇总')}
            {yaxisList.length === 1 && this.renderDrag(result.length + 1)}
          </Fragment>
        );
      },
      children: [],
      width: yaxisList.length === 1 && this.getColumnWidth(result.length + 1),
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
          title: () => {
            index = index + 1;
            return (
              <Fragment>
                {sumData.name ? `${name} (${sumData.name})` : name}
                {this.renderDrag(index)}
              </Fragment>
            );
          },
          dataIndex: `${item.t_id}-${index}`,
          colSpan: 1,
          width: yaxisList.length === 1 ? this.getColumnWidth(result.length + 1) : this.getColumnWidth(index + 1),
          className: 'cell-content'
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
      value: lineSummary.rename || _l('行汇总'),
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
      summary[`${item.t_id}-${i}`] = value ? (sumData.name && !item.summary_col ? `${sumData.name} ${value}` : value) : '';
    });

    if (showLineTotal && lineSummary.location == 1) {
      dataSource.unshift(summary);
    }
    if (showLineTotal && lineSummary.location == 2) {
      dataSource.push(summary);
    }

    return dataSource;
  }
  getParentNode() {
    const { isThumbnail, reportData } = this.props;
    const { reportId } = reportData;
    return isThumbnail ? document.querySelector(isMobile ? `.statisticsCard-${reportId}` : `.statisticsCard-${reportId} .content`) : document.querySelector(`.ChartDialog .chart .flex`);
  }
  getScrollConfig() {
    const { reportData } = this.props;
    const { style, columns, yaxisList } = reportData;
    const { pivotTableColumnFreeze, pivotTableLineFreeze, mobilePivotTableColumnFreeze, mobilePivotTableLineFreeze } = style ? style : {};
    const columnFreeze = isMobile ? mobilePivotTableColumnFreeze : pivotTableColumnFreeze;
    const lineFreeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const parent = this.getParentNode();
    const config = {};
    if (location.href.includes('printPivotTable')) {
      return config;
    }
    if (lineFreeze) {
      config.x = '100%';
    }
    if (columnFreeze && parent) {
      const lineHeight = 39;
      const columnsLength = columns.length + (yaxisList.length === 1 ? 0 : 1);
      const headerHeight = columnsLength * lineHeight;
      if (!lineFreeze) {
        config.x = '100%';
      }
      config.y = parent.offsetHeight - headerHeight;
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
  renderDrag(index) {
    return (
      <div onMouseDown={(event) => { this.handleMouseDown(event, index) }} className="drag" />
    );
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
    const { style } = this.props.reportData;
    const { pivotTableUnilineShow } = style || {};

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
        {_.isArray(relevanceData) ? (
          relevanceData.join('、')
        ) : (
          <span className={cx({ ellipsis: pivotTableUnilineShow })}>
            {relevanceData || '--'}
          </span>
        )}
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
    const { dragValue } = this.state;
    const { reportId, data, yaxisList, columns, lines, valueMap, style } = this.props.reportData;
    const { pivotTableStyle = {}, pivotTableColumnWidthConfig, mobilePivotTableColumnFreeze, mobilePivotTableLineFreeze, pivotTableColumnFreeze, pivotTableLineFreeze } = style || {};
    const { result, linesData } = this;
    const controlName = this.getColumnsHeader(linesData);
    const controlContent = this.getColumnsContent(result);
    const dataSource = this.getDataSource(result, linesData);
    const scrollConfig = this.getScrollConfig();
    const columnFreeze = isMobile ? mobilePivotTableColumnFreeze : pivotTableColumnFreeze;
    const lineFreeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;

    const tableColumns = [
      ...controlName,
      ...controlContent
    ];

    const widthConfig = sessionStorage.getItem(`pivotTableColumnWidthConfig-${reportId}`) || pivotTableColumnWidthConfig;

    return (
      <PivotTableContent
        ref={this.$ref}
        pivotTableStyle={pivotTableStyle}
        isFreeze={columnFreeze || lineFreeze}
        className={
          cx('flex flexColumn chartWrapper Relative', {
            contentXAuto: _.isUndefined(scrollConfig.x),
            contentYAuto: _.isUndefined(scrollConfig.y),
            contentAutoHeight: scrollConfig.x && _.isUndefined(scrollConfig.y),
            contentScroll: scrollConfig.y,
            hideHeaderLastTr: columns.length && yaxisList.length === 1,
            noSelect: dragValue
          })
        }
      >
        <Table
          bordered
          size="small"
          tableLayout={widthConfig ? 'fixed' : undefined}
          pagination={false}
          columns={tableColumns}
          dataSource={dataSource}
          scroll={scrollConfig}
        />
        {!!dragValue && <div style={{ left: dragValue }} className="dragLine" />}
      </PivotTableContent>
    );
  }
}
