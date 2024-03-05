import React, { Component, Fragment } from 'react';
import { Checkbox, Input } from 'antd';

export default class SubLineCount extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentReport, onChangeCurrentReport } = this.props;
    const { lines } = currentReport.pivotTable;
    return (
      <div className="mBottom16">
        {lines.slice(1, lines.length).map(data => (
          <div key={data.controlId} className="mBottom16">
            <Checkbox
              className="mBottom10"
              checked={data.subTotal}
              onChange={(event) => {
                onChangeCurrentReport({
                  pivotTable: {
                    ...currentReport.pivotTable,
                    lines: lines.map(item => {
                      if (item.controlId === data.controlId) {
                        return {
                          ...item,
                          subTotal: event.target.checked
                        }
                      }
                      return item;
                    })
                  }
                }, true);
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
                          subTotalName: event.target.value
                        }
                      }
                      return item;
                    })
                  }
                });
              }}
            />
          </div>
        ))}
      </div>
    );
  }
}
