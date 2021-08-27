import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Checkbox, Tooltip, Input } from 'antd';
import cx from 'classnames';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';

export default class XAxis extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentReport, onChangeDisplayValue } = this.props;
    const { reportType, displaySetup } = currentReport;
    const { xdisplay } = displaySetup;
    const isBarChart = reportType === reportTypes.BarChart && displaySetup.showChartType === 2;
    return (
      <Fragment>
        <Checkbox
          className="mLeft0 mBottom16"
          checked={xdisplay.showDial}
          onChange={checked => {
            onChangeDisplayValue('xdisplay', {
              ...xdisplay,
              showDial: !xdisplay.showDial,
            });
          }}
        >
          {_l('显示刻度标签')}
        </Checkbox>
        <div className="flexRow valignWrapper mBottom16">
          <Checkbox
            className="mLeft0"
            checked={!!displaySetup.fontStyle}
            onChange={() => {
              onChangeDisplayValue('fontStyle', displaySetup.fontStyle ? 0 : 1);
            }}
          >
            {_l('自动倾斜%0文字', isBarChart ? _l('Y轴') : _l('X轴'))}
          </Checkbox>
          <Tooltip
            title={_l(
              '勾选时，当位置不够，文字会自动倾斜以保证完整显示。未勾选时，将始终水平显示%0文字。',
              isBarChart ? _l('Y轴') : _l('X轴'),
            )}
            placement="bottom"
          >
            <Icon className="Gray_9e Font17 pointer" icon="info1" />
          </Tooltip>
        </div>
        <Checkbox
          className={cx('mLeft0', xdisplay.showTitle ? 'mBottom8' : 'mBottom16')}
          checked={xdisplay.showTitle}
          onChange={checked => {
            onChangeDisplayValue('xdisplay', {
              ...xdisplay,
              showTitle: !xdisplay.showTitle,
            });
          }}
        >
          {_l('显示标题')}
        </Checkbox>
        {xdisplay.showTitle && (
          <Input
            defaultValue={xdisplay.title}
            className="chartInput mBottom16"
            onBlur={event => {
              onChangeDisplayValue('xdisplay', {
                ...xdisplay,
                title: event.target.value,
              });
            }}
          />
        )}
      </Fragment>
    );
  }
}
