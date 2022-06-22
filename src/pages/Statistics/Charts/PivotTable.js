import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { formatrChartValue } from './common';
import { timeParticleSizeDropdownData, areaParticleSizeDropdownData, isTimeControl, isAreaControl, isNumberControl } from 'statistics/common';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'statistics/redux/actions';

const PivotTableContent = styled.table`
  border-spacing: 0;
  border-collapse: separate;
  text-align: left;
  font-size: 12px;
  color: #4b4b4b;
  border-top: 1px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
  max-width: 2000px;
  width: 100%;
  tr > th,
  tr > td {
    font-size: 13px;
    min-width: 100px;
    padding: 8px 10px;
    line-height: 18px;
    border-width: 0 1px 1px 0;
    border-style: solid;
    border-color: #e0e0e0;
    font-weight: unset;
  }
  td {
    word-break: break-all;
  }
  thead {
    color: #757575;
    background-color: #fafafa;
  }
  thead th {
    font-weight: bold;
  }
  tbody tr:nth-child(even) {
    background-color: #fafcfd;
  }
  tbody .contentValue:hover {
    color: #2196f3;
    background-color: #e3f2fd;
  }
  &.unilineShow {
    .lineContent,
    .lineContent > div {
      width: 260px;
    }
  }
`;

/**
 * 将连续的单元格合并
 */
const uniqMerge = data => {
  data = data.map((item, index) => item || _l('空'));
  for (let i = data.length - 1; i >= 0; i--) {
    let current = data[i];
    let last = data[i - 1];
    if (current == last) {
      data[i] = null;
      data[i - 1] = {
        value: last,
        length: 2,
      };
    }
    if (_.isObject(current) && current.value === last) {
      data[i - 1] = {
        value: last,
        length: current.length + 1,
      };
      data[i] = null;
    }
  }
  return data;
};

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
};

const mergeColumnsCell = (data, yaxisList) => {
  const length = _.find(data, { summary_col: false }).y.length;
  const result = [];

  for (let i = 0; i < length; i++) {
    result.push({
      index: i,
      data: [],
    });
    data
      .filter(item => !item.summary_col)
      .forEach(item => {
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
    const { rename, controlName, suffix, magnitude } = _.find(yaxisList, { controlId: t_id }) || {};
    const name = rename || controlName;
    item.name = suffix && magnitude ? `${name} (${suffix})` : name;
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
};

const mergeLinesCell = (data, lines, valueMap) => {
  const result = data.map(item => {
    const key = Object.keys(item)[0];
    const res = item[key].map(item => {
      return valueMap[key] ? valueMap[key][item] || item : item;
    });
    const target = _.find(lines, { cid: key }) || {};
    const isTime = isTimeControl(target.controlType);
    const isArea = isAreaControl(target.controlType);
    const name = target.rename || target.controlName;
    if (isTime) {
      return {
        key,
        name: target.particleSizeType
          ? `${name}(${_.find(timeParticleSizeDropdownData, { value: target.particleSizeType }).text})`
          : name,
        data: res,
      };
    }
    if (isArea) {
      return {
        key,
        name: target.particleSizeType
          ? `${name}(${_.find(areaParticleSizeDropdownData, { value: target.particleSizeType }).text})`
          : name,
        data: res,
      };
    }
    return {
      key,
      name,
      data: res,
    };
  });
  return mergeTableCell(result);
};

/*
@connect(
  state => ({}),
  dispatch => bindActionCreators(actions, dispatch),
)
*/
export default class extends Component {
  constructor(props) {
    super(props);
  }
  handleOpenSheet = data => {
    const { reportData, isThumbnail, isViewOriginalData } = this.props;
    const { displaySetup } = reportData;
    if (displaySetup.showRowList && isViewOriginalData) {
      if (isThumbnail) {
        this.props.onOpenChartDialog({
          isPersonal: false,
          match: data,
        });
      } else {
        this.props.requestOriginalData({
          isPersonal: false,
          match: data,
        });
      }
    }
  };
  rendercolumnName(columnItem) {
    const { rename, controlName, controlType, particleSizeType } = columnItem;
    const name = rename || controlName;
    const isTime = isTimeControl(controlType);
    const isArea = isAreaControl(controlType);
    if (isTime) {
      return particleSizeType
        ? `${name}(${_.find(timeParticleSizeDropdownData, { value: particleSizeType }).text})`
        : name;
    }
    if (isArea) {
      return particleSizeType
        ? `${name}(${_.find(areaParticleSizeDropdownData, { value: particleSizeType }).text})`
        : name;
    }
    return name;
  }
  renderColumnTotal() {
    const { columns, pivotTable, yaxisList } = this.props.reportData;
    const { showColumnTotal, columnSummary } = pivotTable || this.props.reportData;
    return showColumnTotal && columns.length ? (
      <th rowSpan={columns.length} colSpan={yaxisList.length}>
        {_l('列汇总')}
        {columnSummary.name ? `(${columnSummary.name})` : null}
      </th>
    ) : null;
  }
  renderLineTotal(xFieldsLength) {
    const { data, lines, pivotTable, yaxisList } = this.props.reportData;
    const { showLineTotal, lineSummary } = pivotTable || this.props.reportData;
    const rowCountList = data.data;
    return showLineTotal ? (
      <tr>
        <th className="Bold Gray_75" colSpan={xFieldsLength}>
          {_l('行汇总')}
          {lineSummary.name ? `(${lineSummary.name})` : null}
        </th>
        {rowCountList.map((item, index) => (
          <td key={index}>
            {_.isNumber(item.sum) ? formatrChartValue(item.sum, false, yaxisList, item.t_id, false) : '--'}
          </td>
        ))}
      </tr>
    ) : null;
  }
  renderThead(xFields, result) {
    const { pivotTable, columns, valueMap } = this.props.reportData;
    const { columnSummary } = pivotTable || this.props.reportData;
    return (
      <thead>
        {columns.map((columnItem, index) => (
          <tr key={index}>
            <th colSpan={xFields.length}>{this.rendercolumnName(columnItem)}</th>
            {index == 0 && columnSummary.location === 3 && this.renderColumnTotal()}
            {result.map((item, i) =>
              item.y && item.y[index] ? (
                _.isObject(item.y[index]) ? (
                  <th className={cx({ hide: !item.y[index].value })} key={i} colSpan={item.y[index].length}>
                    {valueMap[columnItem.cid] ? valueMap[columnItem.cid][item.y[index].value] : item.y[index].value}
                  </th>
                ) : (
                  <th key={i}>
                    {valueMap[columnItem.cid]
                      ? valueMap[columnItem.cid][item.y[index]] || item.y[index]
                      : item.y[index]}
                  </th>
                )
              ) : null,
            )}
            {index == 0 && columnSummary.location === 4 && this.renderColumnTotal()}
          </tr>
        ))}
        <tr>
          {xFields.length ? xFields.map((item, index) => <th key={index}>{item.name}</th>) : <th></th>}
          {result.map((item, index) => (
            <th key={index}>{item.name}</th>
          ))}
        </tr>
      </thead>
    );
  }
  render() {
    const { data, pivotTable, yaxisList, columns, lines, valueMap, style, displaySetup } = this.props.reportData;
    const { lineSummary = {} } = pivotTable || this.props.reportData;
    const { isViewOriginalData } = this.props;
    const result = mergeColumnsCell(_.cloneDeep(data.data), yaxisList);
    const xFields = mergeLinesCell(data.x, lines, valueMap);
    const tableLentghData = Array.from({ length: xFields[0] ? xFields[0].data.length : 1 });
    const { pivotTableUnilineShow } = style ? style : {};
    return (
      <div className="flex overflowHidden">
        <div className="h100 flexColumn" style={{ overflowX: 'auto' }}>
          <PivotTableContent className={cx({ unilineShow: pivotTableUnilineShow })}>
            {this.renderThead(xFields, result)}
            <tbody>
              { lineSummary.location == 1 && this.renderLineTotal(xFields.length) }
              {
                tableLentghData.map((n, lengthIndex) => (
                  <tr key={lengthIndex}>
                    {
                      xFields.length ? (
                        xFields.map((item, index) => (
                          item.data[lengthIndex] ? (
                            _.isObject(item.data[lengthIndex]) ? (
                              <th key={index} rowSpan={item.data[lengthIndex].length}>{item.data[lengthIndex].value}</th>
                            ) : (
                              <th key={index}>{item.data[lengthIndex]}</th>
                            )
                          ) : null
                        ))
                      ) : (
                        <th></th>
                      )
                    }
                    {
                      result.map((item, index) => (
                        <td
                          key={index}
                          className={cx({contentValue: displaySetup.showRowList && isViewOriginalData })}
                          onClick={() => {
                            if (item.summary_col || _.isEmpty(item.data[lengthIndex])) return;
                            const param = {};
                            data.x.forEach(item => {
                              const key = _.findKey(item);
                              const { controlType } = _.find(lines, { controlId: key }) || {};
                              const isNumber = isNumberControl(controlType);
                              const value = item[key][lengthIndex];
                              param[key] = isNumber ? Number(value) : value;
                            });
                            columns.forEach((item, i) => {
                              const isNumber = isNumberControl(item.controlType);
                              const value = data.data[index].y[i];
                              param[item.cid] = isNumber ? Number(value) : value;
                            })
                            this.handleOpenSheet(param);
                          }}
                        >
                          {_.isNull(item.data[lengthIndex]) ? '--' : item.data[lengthIndex]}
                        </td>
                      ))
                    }
                  </tr>
                ))
              }
              { lineSummary.location == 2 && this.renderLineTotal(xFields.length) }
            </tbody>
          </PivotTableContent>
        </div>
      </div>
    );
  }
}
