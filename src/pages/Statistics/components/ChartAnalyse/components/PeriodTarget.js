import React, { Component } from 'react';
import { Input } from 'antd';

export default class PeriodTarget extends Component {
  constructor(props) {
    super(props);
  }
  handleUpdateLifecycleValue = value => {
    this.props.onChangeDisplaySetup({
      lifecycleValue: Number(value.replace(/[^\d.]/g, '')),
    });
  };
  render() {
    const { currentReport } = this.props;
    const { displaySetup } = currentReport;
    return (
      <div className="mBottom16">
        <div className="mBottom8 Gray_9e">
          {_l('这一个旧的功能，目前已经被的辅助线功能所代替。新创建的图表已不再包含此配置。')}
        </div>
        <Input
          className="chartInput w100"
          value={displaySetup.lifecycleValue ? displaySetup.lifecycleValue.toString() : ''}
          onChange={event => {
            this.handleUpdateLifecycleValue(event.target.value);
          }}
        />
      </div>
    );
  }
}
