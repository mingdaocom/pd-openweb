import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Checkbox, Tooltip, Input } from 'antd';
import cx from 'classnames';
import { reportTypes } from 'statistics/Charts/common';

export default class MeasureAxis extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentReport, onChangeDisplayValue } = this.props;
    const { displaySetup } = currentReport;
    const { ydisplay } = displaySetup;
    return (
      <Fragment>
        <div className="mBottom16 flexRow valignWrapper minWrapper">
          <div className="mRight8">{_l('最小值')}</div>
          <div className="flex">
            <Input
              className="chartInput"
              placeholder={_l('自动')}
              defaultValue={ydisplay.minValue}
              onBlur={event => {
                let value = event.target.value;
                let count = Number(value || 0);
                onChangeDisplayValue('ydisplay', {
                  ...ydisplay,
                  minValue: value ? count : value,
                });
              }}
            />
          </div>
        </div>
        <div className="mBottom16 flexRow valignWrapper maxWrapper">
          <div className="mRight8">{_l('最大值')}</div>
          <div className="flex">
            <Input
              className="chartInput"
              placeholder={_l('自动')}
              defaultValue={ydisplay.maxValue}
              onBlur={event => {
                let value = event.target.value;
                let count = Number(value || 0);
                onChangeDisplayValue('ydisplay', {
                  ...ydisplay,
                  maxValue: value ? count : value,
                });
              }}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}
