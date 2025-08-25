import React, { Component } from 'react';
import { Checkbox, Input } from 'antd';

export default class SubLineCount extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentReport, onChangeCurrentReport } = this.props;
    const { yaxisList = [] } = currentReport;
    const { lines } = currentReport.pivotTable;
    return (
      <div className="mBottom16">
        {lines.slice(1, lines.length).map(data => (
          <div key={data.controlId} className="mBottom16">
            <Checkbox
              className="mBottom10"
              checked={data.subTotal}
              onChange={event => {
                const param = {
                  pivotTable: {
                    ...currentReport.pivotTable,
                  },
                };
                const newLines = lines.map(item => {
                  if (item.controlId === data.controlId) {
                    return {
                      ...item,
                      subTotal: event.target.checked,
                    };
                  }
                  return item;
                });
                if (!newLines.filter(n => n.subTotal).length) {
                  param.yaxisList = yaxisList.map(n => {
                    return {
                      ...n,
                      percent: {
                        ...n.percent,
                        enable: false,
                        type: 2,
                      },
                    };
                  });
                }
                param.pivotTable.lines = newLines;
                onChangeCurrentReport(param, true);
              }}
            >
              {data.controlName}
            </Checkbox>
            <div className="mBottom5">{_l('名称')}</div>
            <Input
              className="chartInput"
              defaultValue={data.subTotalName || _l('总计')}
              onChange={event => {
                onChangeCurrentReport({
                  pivotTable: {
                    ...currentReport.pivotTable,
                    lines: lines.map(item => {
                      if (item.controlId === data.controlId) {
                        return {
                          ...item,
                          subTotalName: event.target.value,
                        };
                      }
                      return item;
                    }),
                  },
                });
              }}
            />
          </div>
        ))}
      </div>
    );
  }
}
