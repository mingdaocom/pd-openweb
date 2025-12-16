import React, { Component, createRef, Fragment } from 'react';
import { generate } from '@ant-design/colors';
import { Dropdown, Menu, Table } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, Linkify } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { isFormatNumber, relevanceImageSize } from 'statistics/common';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { isLightColor } from 'src/pages/customPage/util';
import { browserIsMobile, getClassNameByExt } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { formatNumberValue, formatrChartValue, getStyleColor } from '../common';
import PivotTableContent from './styled';
import {
  getBarStyleColor,
  getColumnName,
  getControlMinAndMax,
  getLineSubTotal,
  mergeColumnsCell,
  mergeLinesCell,
  renderValue,
} from './util';

const isMobile = browserIsMobile();
const isPrintPivotTable = location.href.includes('printPivotTable');

export const replaceColor = ({ pivotTableStyle, customPageConfig, themeColor, sourceType }) => {
  const data = _.clone(pivotTableStyle);
  const { columnBgColor, lineBgColor } = data;
  const {
    pivoTableColor,
    pivoTableColorIndex = 1,
    pageStyleType,
    widgetBgColor,
    originWidgetBgColor,
  } = customPageConfig || {};

  if (pivoTableColor && pivoTableColorIndex >= (data.pivoTableColorIndex || 0)) {
    const isLight = isLightColor(pivoTableColor);
    data.columnBgColor = pivoTableColor;
    data.lineBgColor = pivoTableColor;
    data.columnTextColor = isLight ? '#757575' : '#ffffffcc';
    data.lineTextColor = isLight ? '#151515' : '#ffffffcc';
  } else if ([2, 3].includes(sourceType)) {
    if (data.columnBgColor === 'themeColor') {
      data.columnBgColor = '#fafafa';
      data.columnTextColor = '#757575';
    }
    if (data.lineBgColor === 'themeColor') {
      data.columnBgColor = '#ffffffcc';
      data.lineTextColor = '#151515';
    }
  } else {
    const { columnTextColor, lineTextColor } = data;
    const lightColor = themeColor && generate(themeColor)[0];
    if (columnBgColor === 'themeColor' || columnBgColor === 'DARK_COLOR') {
      data.columnBgColor = themeColor;
    }
    if (lineBgColor === 'themeColor' || lineBgColor === 'DARK_COLOR') {
      data.lineBgColor = themeColor;
    }
    if (columnBgColor === 'LIGHT_COLOR') {
      data.columnBgColor = lightColor;
    }
    if (lineBgColor === 'LIGHT_COLOR') {
      data.lineBgColor = lightColor;
    }
    if (columnTextColor === 'DARK_COLOR') {
      data.columnTextColor = themeColor;
    }
    if (lineTextColor === 'DARK_COLOR') {
      data.lineTextColor = themeColor;
    }
    if (columnTextColor === 'LIGHT_COLOR') {
      data.columnTextColor = lightColor;
    }
    if (lineTextColor === 'LIGHT_COLOR') {
      data.lineTextColor = lightColor;
    }
  }
  if (pageStyleType === 'dark') {
    data.evenBgColor = originWidgetBgColor || widgetBgColor;
    data.evenTextColor = '#ffffffcc';
    data.oddBgColor = originWidgetBgColor || widgetBgColor;
    data.oddTextColor = '#ffffffcc';
  }
  // if (!_.isEmpty(linkageMatch)) {
  //   const { columnBgColor, lineBgColor } = data;
  //   const lowAlphaColumnBgColor = new TinyColor(columnBgColor).setAlpha(0.3).toRgbString();
  //   const lowAlphaLineBgColor = new TinyColor(lineBgColor).setAlpha(0.3).toRgbString();
  //   data.originalColumnBgColor = columnBgColor;
  //   data.originalLineBgColor = lineBgColor;
  //   data.columnBgColor = lowAlphaColumnBgColor;
  //   data.lineBgColor = lowAlphaLineBgColor;
  // }
  return data;
};

@errorBoundary
export default class extends Component {
  constructor(props) {
    super(props);
    const { style } = props.reportData;
    const { paginationSize = 20 } = style || {};
    this.state = {
      dragValue: 0,
      pageSize: paginationSize,
      pageIndex: 1,
      dropdownVisible: false,
      offset: {},
      match: null,
      linkageMatch: null,
    };
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
    const { data, columns, yaxisList } = this.props.reportData;
    return mergeColumnsCell(data.data, columns, yaxisList);
  }
  get linesData() {
    const { data, lines, valueMap, style, displaySetup } = this.props.reportData;
    const {
      pivotTableLineFreeze,
      pivotTableLineFreezeIndex,
      mobilePivotTableLineFreeze,
      mobilePivotTableLineFreezeIndex,
      paginationVisible,
    } = style || {};
    const freeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const freezeIndex = isMobile ? mobilePivotTableLineFreezeIndex : pivotTableLineFreezeIndex;
    const config = {
      pageSize: paginationVisible ? this.state.pageSize : 0,
      freeze,
      freezeIndex,
      mergeCell: displaySetup.mergeCell,
    };
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
    return null;
  }
  handleMouseDown = (event, index) => {
    const { target } = event;
    const { scrollTableBody } = this;
    const scrollLeft = scrollTableBody ? scrollTableBody.scrollLeft : 0;
    const startClientX = event.clientX;
    const startDragValue =
      (index ? target.parentElement.offsetLeft - 1 : 0) + target.parentElement.clientWidth - (index ? scrollLeft : 0);
    this.setState({
      dragValue: startDragValue,
    });
    document.onmousemove = event => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;
      if (width >= 80) {
        this.setState({
          dragValue: startDragValue + x,
        });
      }
    };
    document.onmouseup = event => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;
      this.setColumnWidth(index, width >= 80 ? width : 80);
      this.setState({
        dragValue: 0,
      });
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  getColumnWidthConfig = () => {
    const { reportData } = this.props;
    const { reportId, style } = reportData;
    const { pivotTableColumnWidthConfig = {} } = style || {};
    const key = `pivotTableColumnWidthConfig-${reportId}`;
    if (sessionStorage.getItem(key)) {
      return JSON.parse(sessionStorage.getItem(key)) || {};
    } else {
      return pivotTableColumnWidthConfig;
    }
  };
  setColumnWidth = (index, width) => {
    const { settingVisible, reportData, onChangeCurrentReport } = this.props;
    const { reportId } = reportData;
    const style = reportData.style || {};
    const key = `pivotTableColumnWidthConfig-${reportId}`;
    const data = JSON.parse(sessionStorage.getItem(key)) || {};
    const config = {
      ...data,
      [index]: width,
    };
    if (settingVisible) {
      onChangeCurrentReport({
        style: {
          ...style,
          pivotTableColumnWidthConfig: config,
        },
      });
    }
    sessionStorage.setItem(key, JSON.stringify(config));
  };
  getColumnWidth = index => {
    const { data, lines, style } = this.props.reportData;
    const config = this.getColumnWidthConfig();
    const width = config[index];
    const {
      pivotTableUnilineShow,
      pivotTableColumnFreeze,
      pivotTableLineFreeze,
      pcWidthModel = 1,
      mobileWidthModel = 1,
    } = style || {};
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
        const parentWidth = parent ? parent.clientWidth - 2 : 0;
        // const configKeys = Object.keys(config);
        // const occupyWidth = configKeys.map(key => config[key]).reduce((count, item) => item + count, 0);
        const columnCount = data.data.length + lines.length;
        const width = parentWidth / columnCount;
        return width < 80 ? 80 : width;
      } else {
        return pivotTableUnilineShow ? 130 : undefined;
      }
    }
  };
  handleClick = ({ event, index, record }) => {
    const { columns, lines, data, appId, reportId, name, reportType, displaySetup, style, valueMap } =
      this.props.reportData;
    const param = {};
    const linkageMatch = {
      sheetId: appId,
      reportId,
      reportName: name,
      reportType,
      filters: [],
    };
    this.isViewOriginalData = displaySetup.showRowList && this.props.isViewOriginalData && !isPrintPivotTable;
    this.isLinkageData =
      this.props.isLinkageData &&
      !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) &&
      !isPrintPivotTable &&
      (columns.length || lines.length);
    data.x.forEach(item => {
      const key = _.findKey(item);
      const control = _.find(lines, { cid: key }) || {};
      const { controlId, controlType, controlName } = control;
      const isNumber = isFormatNumber(controlType);
      const value = item[key][record.key];
      const controlValue = valueMap[key] ? valueMap[key][value] : value;
      param[key] = isNumber && value ? Number(value) : value;
      linkageMatch.lineValue = value;
      linkageMatch.filters.push({
        controlId: controlId,
        values: [param[key]],
        controlName,
        controlValue: controlType === 29 ? _l('关联表') : controlValue || '--',
        type: controlType,
        control,
      });
    });
    columns.forEach((item, i) => {
      const isNumber = isFormatNumber(item.controlType);
      const value = data.data[index].y[i];
      const controlValue = valueMap[item.cid] ? valueMap[item.cid][value] : value;
      param[item.cid] = isNumber && value ? Number(value) : value;
      linkageMatch.columnValue = value;
      linkageMatch.filters.push({
        controlId: item.controlId,
        values: [param[item.cid]],
        controlName: item.controlName,
        controlValue: controlValue || '--',
        type: item.controlType,
        control: item,
      });
    });
    if (_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length) {
      linkageMatch.onlyChartIds = style.autoLinkageChartObjectIds;
    }
    const isAll = this.isViewOriginalData && this.isLinkageData;
    const { x, y } = this.getParentNode().getBoundingClientRect();
    this.setState(
      {
        dropdownVisible: isAll,
        offset: {
          x: event.pageX - x + 20,
          y: event.pageY - y,
        },
        match: param,
        linkageMatch,
      },
      () => {
        if (!isAll && this.isViewOriginalData) {
          this.handleRequestOriginalData();
        }
        if (!isAll && this.isLinkageData) {
          this.handleAutoLinkage();
        }
      },
    );
  };
  handleAutoLinkage = () => {
    const { linkageMatch } = this.state;
    this.props.onUpdateLinkageFiltersGroup(linkageMatch);
    this.setState({ dropdownVisible: false });
  };
  handleRequestOriginalData = () => {
    const { isThumbnail } = this.props;
    const { match } = this.state;
    const data = {
      isPersonal: false,
      match,
    };
    this.setState({ dropdownVisible: false });
    if (isThumbnail) {
      this.props.onOpenChartDialog(data);
    } else {
      this.props.requestOriginalData(data);
    }
  };
  handleFilePreview = (control, res, file) => {
    if (_.get(window.shareState, 'isPublicChart') && ['.docx', '.xlsx'].includes(file.ext)) {
      alert(_l('暂不支持预览'), 3);
      return;
    }
    const index = _.findIndex(res, { fileID: file.fileID });
    const allowDownload = (_.get(control, 'advancedSetting.allowdownload') || '1') === '1';
    const hideFunctions = ['editFileName', 'saveToKnowlege'].concat(allowDownload ? [] : ['download', 'share']);
    previewAttachments({
      attachments: res,
      index,
      callFrom: 'player',
      hideFunctions,
    });
  };
  getColumnsHeader(linesData) {
    let { lines, columns, style, yaxisList } = this.props.reportData;
    const {
      pivotTableUnilineShow,
      pivotTableLineFreeze,
      pivotTableLineFreezeIndex,
      mobilePivotTableLineFreeze,
      mobilePivotTableLineFreezeIndex,
    } = style || {};
    const freeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const freezeIndex = isMobile ? mobilePivotTableLineFreezeIndex : pivotTableLineFreezeIndex;
    const fIndex = freezeIndex + 1;
    const isHideHeaderLastTr = columns.length && !lines.length && yaxisList.length === 1;

    columns = _.cloneDeep(columns);

    if (columns.length && lines.length && yaxisList.length === 1) {
      columns.pop();
    }

    const get = column => {
      return {
        title: () => {
          return (
            <Fragment>
              {getColumnName(column)}
              {isHideHeaderLastTr && this.renderDrag(0)}
            </Fragment>
          );
        },
        dataIndex: column.cid,
        children: column.children,
        colSpan:
          freeze && _.isNumber(freezeIndex) && fIndex <= linesData.length ? fIndex : linesData.length || undefined,
      };
    };

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
                  {fields.map((item, index) => (
                    <div
                      key={item.controlId}
                      className={cx(item.controlType === 14 ? 'fileContent' : 'otherContent')}
                      style={{
                        width:
                          item.controlType === 14
                            ? this.getMaxFileLength(data, index) * _.find(relevanceImageSize, { value: item.size }).px +
                              diffWidth / fields.length
                            : null,
                      }}
                    >
                      {item.controlName}
                    </div>
                  ))}
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
          );
        },
        dataIndex: item.key,
        ellipsis: pivotTableUnilineShow,
        fixed: freeze && (_.isNumber(freezeIndex) ? index <= freezeIndex : true) ? 'left' : null,
        width: showControl ? columnWidth || maxFilesWidth : columnWidth,
        className: 'line-content',
        render: (...args) => {
          return this.renderLineTd(...args, control, diffWidth / fields.length);
        },
      };
    });

    for (let i = columns.length - 1; i >= 0; i--) {
      const column = columns[i];
      const next = columns[i + 1];
      if (next) {
        column.children = [get(next)];
      } else {
        const defaultChildren = yaxisList.length
          ? [{ title: null, width: isHideHeaderLastTr ? this.getColumnWidth(0) : undefined }]
          : [];
        column.children = linesChildren.length ? linesChildren : defaultChildren;
      }
    }

    if (columns.length) {
      if (freeze && _.isNumber(freezeIndex) && fIndex <= linesData.length) {
        const data = get(columns[0]);
        const freezeChildren = linesChildren.filter(n => n.fixed);
        const noFreezeChildren = linesChildren.filter(n => !n.fixed);
        const getFreeze = data => {
          if (data.children.length === linesChildren.length) {
            return {
              ...data,
              colSpan: freezeChildren.length,
              children: freezeChildren,
            };
          } else {
            return {
              ...data,
              colSpan: freezeChildren.length,
              children: [getFreeze(data.children[0])],
            };
          }
        };
        const getNoFreeze = data => {
          if (data.children.length === linesChildren.length) {
            return {
              title: '',
              dataIndex: 'emptyFreeze',
              colSpan: noFreezeChildren.length,
              children: noFreezeChildren,
            };
          } else {
            return {
              title: '',
              dataIndex: 'emptyFreeze',
              colSpan: noFreezeChildren.length,
              children: [getNoFreeze(data.children[0])],
            };
          }
        };
        return [getFreeze(data), getNoFreeze(data)];
      }
      return [get(columns[0])];
    } else {
      return linesChildren;
    }
  }
  getColumnsContent(result) {
    const { reportData, isViewOriginalData } = this.props;
    const { columns, lines, valueMap, yvalueMap, yaxisList, pivotTable, displaySetup } = reportData;
    const { columnSummary = {} } = pivotTable || reportData;
    const dataList = [];
    const controlMinAndMax = getControlMinAndMax(yaxisList, result);
    const isHideHeaderLastTr = columns.length && !lines.length && yaxisList.length === 1;

    const getTitle = (id, data) => {
      if (_.isNull(data)) return;
      const control = _.find(columns, { cid: id }) || {};
      const defaultEmpty = control.xaxisEmptyType ? '--' : ' ';
      const advancedSetting = control.advancedSetting || {};
      const valueKey = valueMap[id];
      if (_.isObject(data)) {
        return valueKey
          ? renderValue(valueKey[data.value], advancedSetting) || defaultEmpty
          : renderValue(data.value, advancedSetting);
      } else {
        return valueKey
          ? renderValue(valueKey[data], advancedSetting) || defaultEmpty
          : renderValue(data, advancedSetting);
      }
    };

    const getYaxisList = index => {
      const yaxisColumn = yaxisList.map((item, i) => {
        const { rename, controlName, showNumber = true, percent = {} } = item;
        const name = rename || controlName;
        const dragIndex = index + i + lines.length;
        return {
          title: () => {
            return (
              <Fragment>
                {name}
                {this.renderDrag(isHideHeaderLastTr ? dragIndex + 1 : dragIndex)}
              </Fragment>
            );
          },
          dataIndex: `${item.controlId}-${index + i}`,
          colSpan: 1,
          className: cx('cell-content', displaySetup.showRowList && isViewOriginalData ? 'contentValue' : undefined),
          width: this.getColumnWidth(isHideHeaderLastTr ? dragIndex + 1 : dragIndex),
          onCell: record => {
            return {
              onClick: event => {
                if (record.key === 'sum' || record.isSubTotal) {
                  return;
                }
                this.handleClick({ event, index, record });
              },
            };
          },
          render: (value, record, recordIndex) => {
            const columnData = result[index + i] || {};
            const subTotal = !record.isSubTotal && getLineSubTotal(columnData.data, recordIndex);
            record.showNumber = record.key == 'sum' || record.isSubTotal ? true : showNumber;
            record.showPercent =
              (subTotal || (record.key !== 'sum' && !record.isSubTotal)) && percent.enable && percent.type;
            if (value && subTotal) {
              record.lineSubTotal = Number(yvalueMap[item.controlId][subTotal]);
            }
            record.sumCount = columnData.sum;
            return this.renderBodyTd(value, record, item.controlId, controlMinAndMax);
          },
        };
      });
      return yaxisColumn;
    };

    const getChildren = (columnIndex, startIndex, endIndex) => {
      const res = _.cloneDeep(result)
        .splice(startIndex, endIndex)
        .map((item, index) => {
          const data = item.y[columnIndex];
          const nextIndex = columnIndex + 1;
          const isObject = _.isObject(data);
          const colSpan = isObject ? data.length : 1;
          const id = columns[columnIndex].cid;
          const title = getTitle(id, data);
          return {
            title: title
              ? () => {
                  return (
                    <Fragment>
                      {title}
                      {this.renderDrag(startIndex + 1)}
                    </Fragment>
                  );
                }
              : title,
            key: id,
            colSpan,
            children:
              nextIndex < columns.length
                ? getChildren(nextIndex, startIndex + index, colSpan)
                : getYaxisList(startIndex + index),
          };
        });
      return res.filter(item => item.title);
    };

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
                  {columns.length === 1 && yaxisList.length === 1 && this.renderDrag(index + lines.length)}
                </Fragment>
              );
            },
            width: children.length ? undefined : this.getColumnWidth(index + lines.length),
            key: id,
            colSpan,
            children,
          };
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
    const { yaxisList, columns, pivotTable, valueMap } = reportData;
    const { showColumnTotal, columnSummary } = pivotTable || reportData;

    if (!(showColumnTotal && columns.length)) return null;

    let index = 0;

    const childrenYaxisList = [];
    const sumData = columnSummary.controlList.length === 1 ? columnSummary.controlList[0] : {};

    const data = {
      title: () => {
        return (
          <Fragment>
            {sumData.name
              ? `${columnSummary.rename || _l('列汇总')} (${sumData.name})`
              : columnSummary.rename || _l('列汇总')}
            {yaxisList.length === 1 && this.renderDrag(result.length + 1)}
          </Fragment>
        );
      },
      children: [],
      width: yaxisList.length === 1 && this.getColumnWidth(result.length + 1),
      rowSpan: columns.length,
      colSpan: yaxisList.length,
    };

    const set = data => {
      index = index + 1;
      if (index === columns.length) {
        data.children = childrenYaxisList;
      } else {
        data.children = [
          {
            title: null,
            rowSpan: 0,
          },
        ];
        set(data.children[0]);
      }
    };

    result.forEach((item, index) => {
      if (item.summary_col) {
        const { rename, controlName, showNumber = true } = _.find(yaxisList, { controlId: item.t_id }) || {};
        const name = rename || controlName;
        const sumData = _.find(columnSummary.controlList, { controlId: item.t_id }) || {};
        if (sumData.number || sumData.percent) {
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
            render: (value, record, recordIndex) => {
              const newRecord = {
                ...record,
                key: 'sum',
                type: record.type || 'columns',
                sumCount: item.sum,
                sumData,
              };
              const subTotal = !record.isSubTotal && getLineSubTotal(item.data, recordIndex);
              if (subTotal && valueMap[item.t_id]) {
                newRecord.lineSubTotal = Number(valueMap[item.t_id][subTotal]);
              }
              newRecord.showNumber = record.isSubTotal && newRecord.type === 'columns' ? true : showNumber;
              // newRecord.showPercent = (subTotal || newRecord.key === 'sum' && !record.isSubTotal && newRecord.type === 'columns') && percent.enable && percent.type;
              newRecord.showPercent = false;
              return this.renderBodyTd(value, newRecord, item.t_id, controlMinAndMax);
            },
          });
        }
      }
    });

    set(data);

    return data;
  }
  getDataSource(result, linesData) {
    const { pageIndex } = this.state;
    const { reportData } = this.props;
    const { pivotTable, lines, yvalueMap, style } = reportData;
    const { lineSummary, showLineTotal } = pivotTable || reportData;
    const tableLentghData = Array.from({ length: linesData[0] ? linesData[0].data.length : 1 });
    const {
      mobilePivotTableLineFreeze,
      pivotTableLineFreeze,
      mobilePivotTableLineFreezeIndex,
      pivotTableLineFreezeIndex,
    } = style || {};
    const freeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const freezeIndex = isMobile ? mobilePivotTableLineFreezeIndex : pivotTableLineFreezeIndex;
    const fIndex = freezeIndex + 1;
    const isFreeze = freeze && _.isNumber(freezeIndex) && fIndex <= linesData.length;
    const subTotalIds = lines.filter(item => item.subTotal).map(item => item.cid);

    const matchingValue = (value, valueKey) => {
      if (valueKey) {
        const isSubTotal = _.isString(value) ? value.includes('subTotal') : false;
        const data = valueKey[value];
        return data && isSubTotal ? Number(data) : data || value;
      } else {
        return value;
      }
    };

    const dataSource = tableLentghData.map((__, index) => {
      const obj = { key: index };
      linesData.forEach(item => {
        const value = item.data[index];
        obj[item.key] = value;
        if (
          !('isSubTotal' in obj) &&
          subTotalIds.includes(item.key) &&
          (_.isObject(value) ? _.toString(value.value) || '' : _.toString(value) || '').includes('subTotal')
        ) {
          obj.isSubTotal = true;
        }
      });
      result.forEach((item, i) => {
        const value = item.data[index];
        const valueKey = yvalueMap[item.t_id] || null;
        if (_.isArray(value)) {
          obj[`${item.t_id}-${i}`] = value
            .map(data => {
              return valueKey ? valueKey[data] || data : data;
            })
            .join(', ');
        } else {
          obj[`${item.t_id}-${i}`] = matchingValue(value, valueKey);
        }
      });
      return obj;
    });

    const summary = {
      key: 'sum',
      type: 'line',
    };
    const sum = {
      value: lineSummary.rename || _l('行汇总'),
      length: isFreeze ? fIndex : linesData.length,
      sum: true,
    };

    linesData.forEach((item, index) => {
      if (index === 0) {
        summary[item.key] = sum;
      } else if (isFreeze && index === fIndex) {
        summary[item.key] = {
          value: '',
          length: linesData.length - fIndex,
          sum: true,
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
          sumSuffix,
        };
      } else {
        summary[`${item.t_id}-${i}`] = value;
      }
    });

    if (showLineTotal && lineSummary.location == 1 && pageIndex === 1) {
      dataSource.unshift(summary);
    }
    if (showLineTotal && lineSummary.location == 2) {
      dataSource.push(summary);
    }

    return dataSource;
  }
  getParentNode() {
    const { isThumbnail, reportData, isHorizontal } = this.props;
    const { reportId } = reportData;
    if (isHorizontal) {
      return document.querySelector(`.adm-popup-body`);
    }
    return isThumbnail
      ? document.querySelector(isMobile ? `.statisticsCard-${reportId}` : `.statisticsCard-${reportId} .content`)
      : document.querySelector(`.ChartDialog .chart .flex`);
  }
  getScrollConfig(dataSource) {
    const { reportData, isHorizontal } = this.props;
    const { style, columns, yaxisList } = reportData;
    const {
      pivotTableColumnFreeze,
      pivotTableLineFreeze,
      mobilePivotTableColumnFreeze,
      mobilePivotTableLineFreeze,
      paginationVisible,
    } = style ? style : {};
    const columnFreeze = isMobile ? mobilePivotTableColumnFreeze : pivotTableColumnFreeze;
    const lineFreeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const parent = this.getParentNode();
    const config = {};
    if (isPrintPivotTable) {
      return config;
    }
    if (lineFreeze) {
      config.x = '100%';
    }
    if (columnFreeze && parent) {
      const lineHeight = 39;
      const columnsLength = (columns.length || 1) + (yaxisList.length === 1 ? 0 : 1);
      const headerHeight = columnsLength * lineHeight;
      const offsetHeight = isMobile && isHorizontal ? document.body.clientWidth - 80 : parent.offsetHeight - 15;
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
      <div
        onMouseDown={event => {
          this.handleMouseDown(event, index);
        }}
        className="drag"
      />
    );
  }
  renderFile(file, px, fileIconSize, handleFilePreview) {
    const src = file.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, `imageView2/2/h/${px}`);
    const isPicture = RegExpValidator.fileIsPicture(file.ext);
    const fileClassName = getClassNameByExt(file.ext);

    if (file.fileID) {
      return (
        <div
          key={file.fileID}
          className="imageWrapper"
          onClick={() => {
            handleFilePreview(file);
          }}
        >
          {isPicture ? <img src={src} /> : <div className={cx('fileIcon', fileClassName)} style={fileIconSize}></div>}
        </div>
      );
    } else {
      return <div style={{ width: px }}>{'--'}</div>;
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
      const handleFilePreview = this.handleFilePreview.bind(this, control, relevanceData);
      return (
        <div className="relevanceContent fileContent" style={{ width: max * px + diffWidth }} key={control.controlId}>
          {relevanceData.length ? (
            relevanceData.map(file => this.renderFile(file, px, fileIconSize, handleFilePreview))
          ) : (
            <div style={{ width: px + diffWidth }}>{'--'}</div>
          )}
        </div>
      );
    }

    if (_.isArray(relevanceData)) {
      return (
        <div className="relevanceContent" key={control.controlId}>
          {relevanceData.join('、')}
        </div>
      );
    }

    if (_.isObject(relevanceData)) {
      return (
        <div className="relevanceContent" key={control.controlId}>
          {JSON.stringify(relevanceData)}
        </div>
      );
    }

    return (
      <div className="relevanceContent" key={control.controlId}>
        <span className={cx({ ellipsis: pivotTableUnilineShow })}>{relevanceData || '--'}</span>
      </div>
    );
  }
  renderLineTd(data, row, index, control, diffWidth) {
    const { style } = this.props.reportData;
    const { pivotTableUnilineShow } = style ? style : {};
    const { controlType, fields } = control;

    if (data === null) {
      return {
        children: null,
        props: {
          rowSpan: 0,
        },
      };
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
              {res.map((item, index) => this.renderRelevanceContent(item, control, index, diffWidth))}
            </div>
          ),
          props,
        };
      } else if (_.isString(data.value) && data.value.includes('subTotal')) {
        return {
          children: data.subTotalName,
          props,
        };
      } else {
        return {
          children: data.value,
          props,
        };
      }
    }

    if (controlType === 29 && !_.isEmpty(fields) && _.isArray(data)) {
      const res = data;
      return (
        <div className="flexRow w100">
          {res.map((item, index) => this.renderRelevanceContent(item, control, index, diffWidth))}
        </div>
      );
    }

    if (_.isString(data) && data.includes('subTotalEmpty')) {
      return {
        children: null,
        props: {
          rowSpan: 0,
        },
      };
    }

    if (_.isString(data) && data.includes('subTotalFreezeEmpty')) {
      return '';
    }

    if (pivotTableUnilineShow) {
      return data;
    }

    const textStyle = { wordWrap: 'break-word', wordBreak: 'break-word' };

    if (controlType === 2) {
      return (
        <div style={textStyle}>
          <Linkify properties={{ target: '_blank' }} unLimit={true}>
            {data}
          </Linkify>
        </div>
      );
    }

    return <div style={textStyle}>{data}</div>;
  }
  renderBodyTd(value, record, controlId, controlMinAndMax) {
    const { yaxisList, displaySetup } = this.props.reportData;
    const { colorRules = [] } = displaySetup;
    const style = {};
    const barStyle = {};
    const axisStyle = {};
    const { controlType, normType, emptyShowType, percent: percentConfig } = _.find(yaxisList, { controlId }) || {};
    const isNumberValue = _.isNumber(value);
    const originalValue = value;
    let onlyShowBar = false;
    let sumSuffix = '';
    let percent = '';

    if (_.isObject(value)) {
      sumSuffix = value.sumSuffix;
      value = value.value;
    }

    if (isNumberValue || _.isEmpty(value) || emptyShowType === 1) {
      const colorRule = _.find(colorRules, { controlId: controlId }) || {};
      const textColorRule = colorRule.textColorRule || {};
      const bgColorRule = colorRule.bgColorRule || {};
      const dataBarRule = colorRule.dataBarRule;
      const data = {
        value,
        controlMinAndMax,
        controlId,
        record,
      };
      if (textColorRule.model) {
        style.color = getStyleColor(Object.assign(data, { rule: textColorRule, emptyShowType }));
      }
      if (bgColorRule.model) {
        style.backgroundColor = getStyleColor(Object.assign(data, { rule: bgColorRule, emptyShowType }));
      }
      if (dataBarRule && record.key !== 'sum') {
        Object.assign(
          barStyle,
          getBarStyleColor({
            value,
            controlMinAndMax: controlMinAndMax[controlId],
            rule: dataBarRule,
          }),
        );
        axisStyle[dataBarRule.direction === 1 ? 'left' : 'right'] = 0;
        axisStyle.borderColor = dataBarRule.axisColor;
        onlyShowBar = dataBarRule.onlyShowBar;
      }
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
            value = `${value} (${percent})`;
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

    if (isNumberValue) {
      if (record.showPercent === 1) {
        const count = record.lineSubTotal || 0;
        const percentValue = formatNumberValue((originalValue / count) * 100, percentConfig);
        percent = count ? `${percentValue}%` : '0%';
      }
      if (record.showPercent === 2) {
        const count = record.sumCount || 0;
        const percentValue = formatNumberValue((originalValue / count) * 100, percentConfig);
        percent = count ? `${percentValue}%` : '0%';
      }
      if ([1, 2].includes(record.showPercent) && record.showNumber) {
        percent = `(${percent})`;
      }
    }

    const renderValue = () => {
      if (isNumberValue) {
        return record.showNumber && value;
      } else if (controlType === 2 && normType === 7) {
        return (
          <Linkify properties={{ target: '_blank' }} unLimit={true}>
            {value}
          </Linkify>
        );
      } else {
        return value;
      }
    };

    return (
      <Fragment>
        {!onlyShowBar && (
          <div className="cell-value" style={{ color: style.color }}>
            {renderValue()}
            {percent}
          </div>
        )}
        {style.backgroundColor && <div className="data-bg" style={{ backgroundColor: style.backgroundColor }}></div>}
        {barStyle.width && <div className="data-bar" style={barStyle}></div>}
        {axisStyle.borderColor && <div className="data-axis" style={axisStyle}></div>}
      </Fragment>
    );
  }
  renderOverlay() {
    return (
      <Menu className="chartMenu" style={{ width: 160 }}>
        <Menu.Item onClick={this.handleAutoLinkage} key="autoLinkage">
          <div className="flexRow valignWrapper">
            <Icon icon="link1" className="mRight8 Gray_9e Font20 autoLinkageIcon" />
            <span>{_l('联动')}</span>
          </div>
        </Menu.Item>
        <Menu.Item onClick={this.handleRequestOriginalData} key="viewOriginalData">
          <div className="flexRow valignWrapper">
            <Icon icon="table" className="mRight8 Gray_9e Font18" />
            <span>{_l('查看原始数据')}</span>
          </div>
        </Menu.Item>
      </Menu>
    );
  }
  render() {
    const { dragValue, pageSize, dropdownVisible, offset, pageIndex } = this.state;
    const { themeColor, customPageConfig, reportData, linkageMatch = {}, sourceType } = this.props;
    const { reportId, yaxisList, columns, lines, style, pivotTable } = reportData;
    const showLineTotal = pivotTable ? pivotTable.showLineTotal : reportData.showLineTotal;
    const lineSummary = pivotTable ? pivotTable.lineSummary : reportData.lineSummary;
    const {
      pivotTableStyle = {},
      pivotTableColumnWidthConfig,
      mobilePivotTableColumnFreeze,
      mobilePivotTableLineFreeze,
      pivotTableColumnFreeze,
      pivotTableLineFreeze,
      paginationVisible,
      pcWidthModel = 1,
      mobileWidthModel = 1,
    } = style || {};
    const { result, linesData } = this;
    const controlName = this.getColumnsHeader(linesData);
    const controlContent = this.getColumnsContent(result);
    const dataSource = this.getDataSource(result, linesData);
    const scrollConfig = this.getScrollConfig(dataSource);
    const columnFreeze = isMobile ? mobilePivotTableColumnFreeze : pivotTableColumnFreeze;
    const lineFreeze = isMobile ? mobilePivotTableLineFreeze : pivotTableLineFreeze;
    const widthModel = isMobile ? mobileWidthModel : pcWidthModel;
    const showTopLineTotal = showLineTotal && (lineSummary.location == 1 ? pageIndex === 1 : false);
    const tableColumns = [...controlName, ...controlContent];

    const widthConfig =
      sessionStorage.getItem(`pivotTableColumnWidthConfig-${reportId}`) ||
      pivotTableColumnWidthConfig ||
      [2, 3].includes(widthModel);

    return (
      <Fragment>
        <PivotTableContent
          ref={this.$ref}
          isMobile={isMobile}
          pivotTableStyle={replaceColor({ pivotTableStyle, customPageConfig, themeColor, sourceType, linkageMatch })}
          isFreeze={columnFreeze || lineFreeze}
          paginationVisible={paginationVisible && !isPrintPivotTable && dataSource.length > pageSize}
          className={cx('flex flexColumn chartWrapper Relative', {
            contentXAuto: _.isUndefined(scrollConfig.x),
            contentYAuto: _.isUndefined(scrollConfig.y),
            contentAutoHeight: scrollConfig.x && _.isUndefined(scrollConfig.y),
            contentScroll: scrollConfig.y,
            hideHeaderLastTr: columns.length && yaxisList.length === 1,
            hideBody: _.isEmpty(lines) && _.isEmpty(yaxisList),
            hideDrag: widthModel === 3,
            noSelect: dragValue,
            safariScroll: scrollConfig.y,
            firefoxScroll: scrollConfig.y && window.isWindows && window.isFirefox,
          })}
        >
          <Table
            bordered
            size="small"
            tableLayout={widthConfig ? 'fixed' : undefined}
            rowClassName={record => {
              return record.key === 'sum' || record.isSubTotal ? 'sum-content' : undefined;
            }}
            pagination={
              paginationVisible && !isPrintPivotTable
                ? {
                    showTotal: total => _l('共 %0 条', showTopLineTotal ? total - 1 : total),
                    hideOnSinglePage: true,
                    showSizeChanger: true,
                    pageSize: showTopLineTotal ? pageSize + 1 : pageSize,
                    pageSizeOptions: [20, 25, 30, 50, 100],
                    onChange: pageIndex => {
                      this.setState({ pageIndex });
                    },
                    onShowSizeChange: (current, size) => {
                      this.setState({ pageSize: size });
                    },
                    locale: { items_per_page: _l('条/页') },
                  }
                : false
            }
            columns={tableColumns}
            dataSource={dataSource}
            scroll={scrollConfig}
          />
          {!!dragValue && <div style={{ left: dragValue }} className="dragLine" />}
        </PivotTableContent>
        <Dropdown
          visible={dropdownVisible}
          onVisibleChange={dropdownVisible => {
            this.setState({ dropdownVisible });
          }}
          trigger={['click']}
          placement="bottomLeft"
          overlay={this.renderOverlay()}
        >
          <div className="Absolute" style={{ left: offset.x, top: offset.y }}></div>
        </Dropdown>
      </Fragment>
    );
  }
}
