import React, { Component, Fragment, createRef } from 'react';
import cx from 'classnames';
import { formatrChartValue, getStyleColor } from '../common';
import { isFormatNumber, relevanceImageSize } from 'statistics/common';
import { Table } from 'antd';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { browserIsMobile, getClassNameByExt } from 'src/util';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { uniqMerge, mergeTableCell, mergeColumnsCell, mergeLinesCell, getColumnName, renderValue, getControlMinAndMax, getBarStyleColor } from './util';
import PivotTableContent from './styled';
import tinycolor from '@ctrl/tinycolor';
import _ from 'lodash';

const isMobile = browserIsMobile();
const isPrintPivotTable = location.href.includes('printPivotTable');
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

const replaceColor = (data, customPageConfig, themeColor) => {
  const { columnBgColor, lineBgColor } = data;
  const { pivoTableColor } = customPageConfig || {};
  if (pivoTableColor) {
    const isLight = tinycolor(pivoTableColor).isLight();
    return {
      ...data,
      columnBgColor: pivoTableColor,
      lineBgColor: pivoTableColor,
      columnTextColor: isLight ? '#757575' : '#fff',
      lineTextColor: isLight ? '#333' : '#fff',
    }
  }
  if (columnBgColor === 'themeColor' || lineBgColor === 'themeColor') {
    return {
      ...data,
      columnBgColor: columnBgColor === 'themeColor' ? themeColor : columnBgColor,
      lineBgColor: lineBgColor === 'themeColor' ? themeColor : lineBgColor,
    };
  }
  return data;
}

@errorBoundary
export default class extends Component {
  constructor(props) {
    super(props);
    const { style } = props.reportData;
    const { paginationSize = 20 } = style || {};
    this.state = {
      dragValue: 0,
      pageSize: paginationSize
    }
    this.$ref = createRef(null);
  }
  componentWillReceiveProps(nextProps) {
    const { style } = nextProps.reportData;
    const { style: oldStyle } = this.props.reportData;
    if (style.paginationSize !== oldStyle.paginationSize) {
      this.setState({ pageSize: style.paginationSize });
    }
  }
  get result() {
    const { data, yaxisList } = this.props.reportData;
    return mergeColumnsCell(data.data, yaxisList);
  }
  get linesData() {
    const { data, lines, valueMap, style } = this.props.reportData;
    const {
      pivotTableLineFreeze,
      pivotTableLineFreezeIndex,
      mobilePivotTableLineFreeze,
      mobilePivotTableLineFreezeIndex,
      paginationVisible
    } = style || {};
    const freeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const freezeIndex = isMobile ? mobilePivotTableLineFreezeIndex : pivotTableLineFreezeIndex;
    const config = {
      pageSize: paginationVisible ? this.state.pageSize : 0,
      freeze,
      freezeIndex
    }
    return mergeLinesCell(data.x, lines, valueMap, config);
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
    const { reportId } = reportData;
    const style = reportData.style || {};
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
    const { data, lines, reportId, style } = this.props.reportData;
    const config = this.getColumnWidthConfig();
    const width = config[index];
    const { pivotTableUnilineShow, pivotTableColumnFreeze, pivotTableLineFreeze, pcWidthModel = 1, mobileWidthModel = 1 } = style || {};
    const widthModel = isMobile ? mobileWidthModel : pcWidthModel;

    if (widthModel === 3) {
      return undefined;
    }
    if (width) {
      return Number(width);
    } else {
      if (widthModel === 2) {
        return index < lines.length ? 150 : 100;
      }
      if (pivotTableColumnFreeze || pivotTableLineFreeze) {
        return 130;
      } else if (!_.isEmpty(config)) {
        const parent = this.getParentNode();
        const parentWidth = parent.clientWidth - 2;
        // const configKeys = Object.keys(config);
        // const occupyWidth = configKeys.map(key => config[key]).reduce((count, item) => item + count, 0);
        const columnCount = (data.data.length + lines.length);
        const width = parentWidth / columnCount;
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
    const {
      pivotTableUnilineShow,
      pivotTableLineFreeze,
      pivotTableLineFreezeIndex,
      mobilePivotTableLineFreeze,
      mobilePivotTableLineFreezeIndex
    } = style || {};
    const freeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const freezeIndex = isMobile ? mobilePivotTableLineFreezeIndex : pivotTableLineFreezeIndex;
    const fIndex = freezeIndex + 1;

    columns = _.cloneDeep(columns);

    if (columns.length && lines.length && yaxisList.length === 1) {
      columns.pop();
    }

    const get = (column) => {
      return {
        title: getColumnName(column),
        dataIndex: column.cid,
        children: column.children,
        colSpan: freeze && _.isNumber(freezeIndex) && fIndex <= linesData.length ? fIndex : (linesData.length || undefined)
      }
    }

    const linesChildren = linesData.map((item, index) => {
      const control = _.find(lines, { controlId: item.key }) || {};
      const { controlType, fields = [] } = control;
      const showControl = controlType === 29 && !_.isEmpty(fields);
      const data = item.data;
      const columnWidth = this.getColumnWidth(index);
      const maxFilesWidth = showControl && this.getAllMaxFilesWidth(data, fields);
      const diffWidth = _.isUndefined(columnWidth) ? 0 : columnWidth - maxFilesWidth;
      return {
        title: () => {
          if (showControl) {
            return (
              <Fragment>
                <div className="flexRow valignWrapper">
                  {
                    fields.map((item, index) => (
                      <div
                        key={item.controlId}
                        className={cx(item.controlType === 14 ? 'fileContent' : 'otherContent')}
                        style={{
                          width: item.controlType === 14 ? (this.getMaxFileLength(data, index) * _.find(relevanceImageSize, { value: item.size }).px) + (diffWidth / fields.length) : null
                        }}
                      >
                        {item.controlName}
                      </div>
                    ))
                  }
                </div>
                {this.renderDrag(index)}
              </Fragment>
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
        fixed: freeze && (_.isNumber(freezeIndex) ? index <= freezeIndex : true) ? 'left' : null,
        width: showControl ? columnWidth || maxFilesWidth : columnWidth,
        className: 'line-content',
        render: (...args) => {
          return this.renderLineTd(...args, control, diffWidth / fields.length);
        }
      }
    });

    for(let i = columns.length - 1; i >= 0; i--) {
      const column = columns[i];
      const next = columns[i + 1];
      if (next) {
        column.children = [get(next)];
      } else {
        const defaultChildren = yaxisList.length ? [{ title: null, width: undefined }] : [];
        column.children = linesChildren.length ? linesChildren : defaultChildren;
      }
    }

    if (columns.length) {
      if (freeze && _.isNumber(freezeIndex) && fIndex <= linesData.length) {
        const data = get(columns[0]);
        const freezeChildren = linesChildren.filter(n => n.fixed);
        const noFreezeChildren = linesChildren.filter(n => !n.fixed);
        const getFreeze = (data) => {
          if (data.children.length === linesChildren.length) {
            return {
              ...data,
              colSpan: freezeChildren.length,
              children: freezeChildren
            }
          } else {
            return {
              ...data,
              colSpan: freezeChildren.length,
              children: [getFreeze(data.children[0])]
            };
          }
        }
        const getNoFreeze = (data) => {
          if (data.children.length === linesChildren.length) {
            return {
              title: '',
              dataIndex: 'emptyFreeze',
              colSpan: noFreezeChildren.length,
              children: noFreezeChildren
            }
          } else {
            return {
              title: '',
              dataIndex: 'emptyFreeze',
              colSpan: noFreezeChildren.length,
              children: [getNoFreeze(data.children[0])]
            };
          }
        }
        return [
          getFreeze(data),
          getNoFreeze(data)
        ];
      }
      return [get(columns[0])];
    } else {
      return linesChildren;
    }
  }
  getColumnsContent(result) {
    const { reportData, isViewOriginalData } = this.props;
    const { columns, lines, valueMap, yaxisList, pivotTable, data, displaySetup } = reportData;
    const { columnSummary = {}, showColumnTotal } = pivotTable || reportData;
    const dataList = [];
    const controlMinAndMax = getControlMinAndMax(yaxisList, result);

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
                if (record.key === 'sum' || record.isSubTotal) {
                  return;
                }
                const param = {};
                data.x.forEach(item => {
                  const key = _.findKey(item);
                  const { controlType } = _.find(lines, { controlId: key }) || {};
                  const isNumber = isFormatNumber(controlType);
                  const value = item[key][record.key];
                  param[key] = isNumber && value ? Number(value) : value;
                });
                columns.forEach((item, i) => {
                  const isNumber = isFormatNumber(item.controlType);
                  const value = data.data[index].y[i];
                  param[item.cid] = isNumber && value ? Number(value) : value;
                });
                this.handleOpenSheet(param);
              }
            };
          },
          render: (value, record) => this.renderBodyTd(value, record, item.controlId, controlMinAndMax)
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
                {this.renderDrag(startIndex + 1)}
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

    const columnTotal = yaxisList.length && this.getColumnTotal(result, controlMinAndMax);

    if (columnSummary.location === 3 && columnTotal) {
      dataList.unshift(columnTotal);
    }
    if (columnSummary.location === 4 && columnTotal) {
      dataList.push(columnTotal);
    }

    return dataList;
  }
  getColumnTotal(result, controlMinAndMax) {
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
          className: 'cell-content',
          render: (value, record) => this.renderBodyTd(value, {
            ...record,
            key: 'sum',
            type: record.type || 'columns',
            sumCount: item.sum,
            sumData,
          }, item.t_id, controlMinAndMax)
        });
      }
    });

    set(data);

    return data;
  }
  getDataSource(result, linesData) {
    const { reportData } = this.props;
    const { yaxisList, pivotTable, lines, valueMap, style } = reportData;
    const { lineSummary, columnSummary, showLineTotal } = pivotTable || reportData;
    const tableLentghData = Array.from({ length: linesData[0] ? linesData[0].data.length : 1 });
    const { mobilePivotTableLineFreeze, pivotTableLineFreeze, mobilePivotTableLineFreezeIndex, pivotTableLineFreezeIndex } = style || {};
    const freeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const freezeIndex = isMobile ? mobilePivotTableLineFreezeIndex : pivotTableLineFreezeIndex;
    const fIndex = freezeIndex + 1;
    const isFreeze = freeze && _.isNumber(freezeIndex) && fIndex <= linesData.length;
    const subTotalIds = lines.filter(item => item.subTotal).map(item => item.cid);

    const matchingValue = (value, valueKey) => {
      if (valueKey) {
        const isSubTotal = _.isString(value) ? value.includes('subTotal') : false;
        const data = valueKey[value];
        return data && isSubTotal ? Number(data) : (data || value);
      } else {
        return value;
      }
    }

    const dataSource = tableLentghData.map((__, index) => {
      const obj = { key: index };
      linesData.forEach(item => {
        const value = item.data[index];
        obj[item.key] = value;
        if (!('isSubTotal' in obj) && subTotalIds.includes(item.key) && (_.isObject(value) ? value.value : value || '').includes('subTotal')) {
          obj.isSubTotal = true;
        }
      });
      result.forEach((item, i) => {
        const value = item.data[index];
        const valueKey = valueMap[item.t_id] || null;
        if (_.isArray(value)) {
          obj[`${item.t_id}-${i}`] = value.map(data => {
            return valueKey ? valueKey[data] || data : data;
          }).join(', ');
        } else {
          obj[`${item.t_id}-${i}`] = matchingValue(value, valueKey);
        }
      });
      return obj;
    });

    const summary = {
      key: 'sum',
      type: 'line'
    };
    const sum = {
      value: lineSummary.rename || _l('行汇总'),
      length: isFreeze ? fIndex : linesData.length,
      sum: true
    };

    linesData.forEach((item, index) => {
      if (index === 0) {
        summary[item.key] = sum;
      } else if (isFreeze && index === fIndex) {
        summary[item.key] = {
          value: '',
          length: linesData.length - fIndex,
          sum: true
        };
      } else {
        summary[item.key] = null;
      }
    });

    result.forEach((item, i) => {
      const value = _.isNumber(item.sum) ? item.sum : '';
      const sumData = _.find(lineSummary.controlList, { controlId: item.t_id }) || {};
      const sumSuffix = sumData.name && !item.summary_col ? sumData.name : undefined;
      if (sumSuffix) {
        summary[`${item.t_id}-${i}`] = {
          value,
          sumSuffix
        };
      } else {
        summary[`${item.t_id}-${i}`] = value;
      }
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
  getScrollConfig(dataSource) {
    const { reportData, isHorizontal } = this.props;
    const { style, columns, yaxisList } = reportData;
    const { pivotTableColumnFreeze, pivotTableLineFreeze, mobilePivotTableColumnFreeze, mobilePivotTableLineFreeze, paginationVisible } = style ? style : {};
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
      const columnsLength = (columns.length || 1) + (yaxisList.length === 1 ? 0 : 1);
      const headerHeight = columnsLength * lineHeight;
      const offsetHeight = isMobile && isHorizontal ? (document.body.clientWidth - 80) : parent.offsetHeight;
      const paginationHeight = paginationVisible && dataSource.length > this.state.pageSize ? 45 : 0;
      if (!lineFreeze) {
        config.x = '100%';
      }
      config.y = offsetHeight - headerHeight - paginationHeight;
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
  renderRelevanceContent(relevanceData, parentControl, index, diffWidth) {
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
        <div className="relevanceContent fileContent" style={{ width: (max * px) + diffWidth }} key={control.controlId}>
          {relevanceData.length ? (
            relevanceData.map(file => (
              this.renderFile(file, px, fileIconSize, handleFilePreview)
            ))
          ) : (
            <div style={{ width: px + diffWidth }}>{'--'}</div>
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
  renderLineTd(data, row, index, control, diffWidth) {
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
                  this.renderRelevanceContent(item, control, index, diffWidth)
                ))
              }
            </div>
          ),
          props
        }
      } else if (_.isString(data.value) && data.value.includes('subTotal')) {
        return {
          children: data.subTotalName,
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
              this.renderRelevanceContent(item, control, index, diffWidth)
            ))
          }
        </div>
      );
    }

    if (_.isString(data) && data.includes('subTotalEmpty')) {
      return {
        children: null,
        props: {
          rowSpan: 0
        }
      }
    }

    if (_.isString(data) && data.includes('subTotalFreezeEmpty')) {
      return '';
    }

    if (pivotTableUnilineShow) {
      return data;
    }

    return (
      <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{data}</div>
    );
  }
  renderBodyTd(value, record, controlId, controlMinAndMax) {
    const { yaxisList, displaySetup } = this.props.reportData;
    const { colorRules = [] } = displaySetup;
    const style = {};
    const barStyle = {};
    const axisStyle = {};
    const emptyShowType = _.get(_.find(yaxisList, { controlId }), 'emptyShowType');
    let onlyShowBar = false;
    let sumSuffix = '';

    if (_.isObject(value)) {
      sumSuffix = value.sumSuffix;
      value = value.value;
    }
    
    if (_.isNumber(value) || _.isEmpty(value) || emptyShowType === 1) {
      const colorRule = _.find(colorRules, { controlId: controlId }) || {};
      const textColorRule = colorRule.textColorRule || {};
      const bgColorRule = colorRule.bgColorRule || {};
      const dataBarRule = colorRule.dataBarRule;
      const data = {
        value, controlMinAndMax, controlId, record
      }
      if (textColorRule.model) {
        style.color = getStyleColor(Object.assign(data, { rule: textColorRule, emptyShowType }));
      }
      if (bgColorRule.model) {
        style.backgroundColor = getStyleColor(Object.assign(data, { rule: bgColorRule, emptyShowType }));
      }
      if (dataBarRule && record.key !== 'sum') {
        Object.assign(barStyle, getBarStyleColor({
          value,
          controlMinAndMax: controlMinAndMax[controlId],
          rule: dataBarRule
        }));
        axisStyle[dataBarRule.direction === 1 ? 'left' : 'right'] = 0;
        axisStyle.borderColor = dataBarRule.axisColor;
        onlyShowBar = dataBarRule.onlyShowBar;
      }
      // value = formatrChartValue(value, false, yaxisList, controlId, record.key !== 'sum');
      if (record.key === 'sum' && record.type === 'columns') {
        value = value || 0;
        const { sumCount, sumData } = record;
        const percent = `${((value / sumCount) * 100).toFixed(2)}%`;
        if (sumData.number) {
          value = formatrChartValue(value, false, yaxisList, controlId);
          if (sumSuffix) {
            value = `${sumSuffix} ${value}`;
          }
        }
        if (sumData.percent) {
          if (sumData.number) {
            value = `${value} (${percent})`
          } else {
            value = percent;
          }
        }
      } else {
        value = formatrChartValue(value, false, yaxisList, controlId);
        if (sumSuffix) {
          value = `${sumSuffix} ${value}`;
        }
      }
    }
    return (
      <Fragment>
        {!onlyShowBar && <div className="cell-value" style={{ color: style.color }}>{value}</div>}
        {style.backgroundColor && <div className="data-bg" style={{ backgroundColor: style.backgroundColor }}></div>}
        {barStyle.width && <div className="data-bar" style={barStyle}></div>}
        {axisStyle.borderColor && <div className="data-axis" style={axisStyle}></div>}
      </Fragment>
    );
  }
  render() {
    const { dragValue, pageSize } = this.state;
    const { themeColor, customPageConfig, reportData } = this.props;
    const { reportId, data, yaxisList, columns, lines, valueMap, style, pivotTable } = reportData;
    const showLineTotal = pivotTable ? pivotTable.showLineTotal : reportData.showLineTotal;
    const {
      pivotTableStyle = {},
      pivotTableColumnWidthConfig,
      mobilePivotTableColumnFreeze,
      mobilePivotTableLineFreeze,
      pivotTableColumnFreeze,
      pivotTableLineFreeze,
      paginationVisible,
      pcWidthModel = 1,
      mobileWidthModel = 1
    } = style || {};
    const { result, linesData } = this;
    const controlName = this.getColumnsHeader(linesData);
    const controlContent = this.getColumnsContent(result);
    const dataSource = this.getDataSource(result, linesData);
    const scrollConfig = this.getScrollConfig(dataSource);
    const columnFreeze = isMobile ? mobilePivotTableColumnFreeze : pivotTableColumnFreeze;
    const lineFreeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const widthModel = isMobile ? mobileWidthModel : pcWidthModel;

    const tableColumns = [
      ...controlName,
      ...controlContent
    ];

    const widthConfig = sessionStorage.getItem(`pivotTableColumnWidthConfig-${reportId}`) || pivotTableColumnWidthConfig || [2, 3].includes(widthModel);

    return (
      <PivotTableContent
        ref={this.$ref}
        isMobile={isMobile}
        pivotTableStyle={replaceColor(pivotTableStyle, customPageConfig, themeColor)}
        isFreeze={columnFreeze || lineFreeze}
        paginationVisible={paginationVisible && dataSource.length > pageSize}
        className={
          cx('flex flexColumn chartWrapper Relative', {
            contentXAuto: _.isUndefined(scrollConfig.x),
            contentYAuto: _.isUndefined(scrollConfig.y),
            contentAutoHeight: scrollConfig.x && _.isUndefined(scrollConfig.y),
            contentScroll: scrollConfig.y,
            hideHeaderLastTr: columns.length && yaxisList.length === 1,
            hideBody: _.isEmpty(lines) && _.isEmpty(yaxisList),
            hideDrag: widthModel === 3,
            noSelect: dragValue,
            safariScroll: scrollConfig.y
          })
        }
      >
        <Table
          bordered
          size="small"
          tableLayout={widthConfig ? 'fixed' : undefined}
          rowClassName={(record, index) => {
            return record.key === 'sum' || record.isSubTotal ? 'sum-content' : undefined;
          }}
          pagination={paginationVisible ? {
            showTotal: total => _l('共 %0 条', showLineTotal ? total - 1 : total),
            hideOnSinglePage: true,
            showSizeChanger: true,
            pageSize,
            pageSizeOptions: [20, 25, 30, 50, 100],
            onShowSizeChange: (current, size) => {
              this.setState({ pageSize: size });
            },
            locale: { items_per_page: _l('条/页') }
          } : false}
          columns={tableColumns}
          dataSource={dataSource}
          scroll={scrollConfig}
        />
        {!!dragValue && <div style={{ left: dragValue }} className="dragLine" />}
      </PivotTableContent>
    );
  }
}
