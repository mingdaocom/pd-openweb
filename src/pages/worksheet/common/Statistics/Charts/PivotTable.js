import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { formatrChartValue } from './common';
import { timeParticleSizeDropdownData, areaParticleSizeDropdownData, isTimeControl, isAreaControl } from 'src/pages/worksheet/common/Statistics/common';
import errorBoundary from 'ming-ui/decorators/errorBoundary';

const PivotTableContent = styled.table`
  border-spacing: 0;
  text-align: left;
  font-size: 12px;
  color: #4b4b4b;
  border-top: 1px solid #E0E0E0;
  border-left: 1px solid #E0E0E0;
  max-width: 2000px;
  width: 100%;
  tr>th, tr>td {
    font-size: 13px;
    min-width: 100px;
    padding: 8px 10px;
    line-height: 18px;
    border-width: 0 1px 1px 0;
    border-style: solid;
    border-color: #E0E0E0;
    font-weight: unset;
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
  tbody tr:hover {
    background-color: #fafafa;
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
    const { rename, controlName } = _.find(yaxisList, { controlId: t_id }) || {};
    item.name = rename || controlName;
    item.data = data.map(n => {
      if (_.isNumber(n)) {
        const current = _.find(yaxisList, { controlId: t_id });
        // if (current && [0, 1].includes(current.magnitude)) {
        //   const newYaxisList = yaxisList.map(item => {
        //     return {
        //       ...item,
        //       magnitude: 1,
        //       ydot: '',
        //     };
        //   });
        //   return formatrChartValue(current.dot ? Number(n.toFixed(current.dot)) : n, false, newYaxisList, t_id, false);
        // } else {
          return formatrChartValue(n, false, yaxisList, t_id, false);
        // }
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
        name: target.particleSizeType ? `${name}(${ _.find(timeParticleSizeDropdownData, { value: target.particleSizeType }).text })` : name,
        data: res,
      }
    }
    if (isArea) {
      return {
        name: target.particleSizeType ? `${name}(${ _.find(areaParticleSizeDropdownData, { value: target.particleSizeType }).text })` : name,
        data: res,
      }
    }
    return {
      name,
      data: res,
    }
  });
  return mergeTableCell(result);
}

@errorBoundary
export default class extends Component {
  constructor(props) {
    super(props);
  }
  rendercolumnName(columnItem) {
    const { rename, controlName, controlType, particleSizeType } = columnItem;
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
  renderColumnTotal() {
    const { columns, pivotTable, yaxisList } = this.props.reportData;
    const { showColumnTotal, columnSummary } = pivotTable || this.props.reportData;
    return (
      showColumnTotal && columns.length ? (
        <th
          rowSpan={columns.length}
          colSpan={yaxisList.length}
        >
          {_l('列汇总')}
          {columnSummary.name ? `(${columnSummary.name})` : null}
        </th>
      ) : null
    )
  }
  renderLineTotal(xFieldsLength) {
    const { data, lines, pivotTable, yaxisList } = this.props.reportData;
    const { showLineTotal, lineSummary } = pivotTable || this.props.reportData;
    const rowCountList = data.data;
    return (
      showLineTotal ? (
       <tr>
          <th
            className="Bold Gray_75"
            colSpan={xFieldsLength}
          >
            {_l('行汇总')}
            {lineSummary.name ? `(${lineSummary.name})` : null}
          </th>
          {
            rowCountList.map((item, index) => (
              <td key={index}>{_.isNumber(item.sum) ? formatrChartValue(item.sum, false, yaxisList, item.t_id, false) : '--'}</td>
            ))
          }
        </tr>
      ) : null
    )
  }
  render() {
    const { data, columns, pivotTable, yaxisList, lines, valueMap } = this.props.reportData;
    const { columnSummary, lineSummary } = pivotTable || this.props.reportData;
    const result = mergeColumnsCell(_.cloneDeep(data.data), yaxisList);
    const xFields = mergeLinesCell(data.x, lines, valueMap);
    const tableLentghData = Array.from({ length: xFields[0] ? xFields[0].data.length : 1 });
    return (
      <div className="h100 flexColumn" style={{ overflowX: 'auto' }}>
        <PivotTableContent>
          <thead>
            {
              columns.map((columnItem, index) => (
                <tr key={index}>
                  <th colSpan={xFields.length}>{this.rendercolumnName(columnItem)}</th>
                  { (index == 0 && columnSummary.location === 3) && this.renderColumnTotal() }
                  {
                    result.map((item, i) => (
                      item.y && item.y[index] ? (
                        _.isObject(item.y[index]) ? (
                          <th
                            className={cx({hide: !item.y[index].value})}
                            key={i}
                            colSpan={item.y[index].length}
                          >
                            {valueMap[columnItem.cid] ? valueMap[columnItem.cid][item.y[index].value] : item.y[index].value}
                          </th>
                        ) : (
                          <th key={i}>{valueMap[columnItem.cid] ? (valueMap[columnItem.cid][item.y[index]] || item.y[index]) : item.y[index]}</th>
                        )
                      ) : null
                    ))
                  }
                  { (index == 0 && columnSummary.location === 4) && this.renderColumnTotal() }
                </tr>
              ))
            }
            <tr>
              {
                xFields.length ? (
                  xFields.map((item, index) => (
                    <th key={index}>{item.name}</th>
                  ))
                ) : (
                  <th></th>
                )
              }
              {
                result.map((item, index) => (
                  <th key={index}>{item.name}</th>
                ))
              }
            </tr>
          </thead>
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
                      <td key={index}>{_.isNull(item.data[lengthIndex]) ? '--' : item.data[lengthIndex]}</td>
                    ))
                  }
                </tr>
              ))
            }
            { lineSummary.location == 2 && this.renderLineTotal(xFields.length) }
          </tbody>
        </PivotTableContent>
      </div>
    );
  }
}
