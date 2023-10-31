import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Checkbox, Tooltip, Input } from 'antd';
import cx from 'classnames';
import { formatNumberFromInput } from 'src/util';
import { reportTypes } from 'statistics/Charts/common';

export default class XAxis extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentReport, onChangeDisplayValue, onChangeStyle } = this.props;
    const { reportType, displaySetup, style } = currentReport;
    const { xdisplay } = displaySetup;
    const isBarChart = reportType === reportTypes.BarChart && displaySetup.showChartType === 2;
    return (
      <Fragment>
        <div className="flexRow valignWrapper mLeft0 mBottom16">
          <Checkbox
            checked={xdisplay.showDial}
            onChange={event => {
              onChangeDisplayValue('xdisplay', {
                ...xdisplay,
                showDial: !xdisplay.showDial,
              });
            }}
          >
            {_l('显示刻度标签')}
          </Checkbox>
        </div>
        {![reportTypes.ScatterChart].includes(reportType) && xdisplay.showDial && (
          <div className="flexRow valignWrapper mBottom16 mLeft25">
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
        )}
        {[reportTypes.LineChart, reportTypes.BarChart].includes(reportType) && (
          <div className="flexRow valignWrapper mLeft0 mBottom16">
            <Checkbox
              checked={style.showXAxisSlider}
              onChange={event => {
                onChangeStyle({ showXAxisSlider: event.target.checked });
              }}
            >
              {_l('显示横轴滚动条')}
            </Checkbox>
          </div>
        )}
        {![reportTypes.BidirectionalBarChart].includes(reportType) && (
          <div className={cx('flexRow valignWrapper mLeft0', xdisplay.showTitle ? 'mBottom8' : 'mBottom16')}>
            <Checkbox
              checked={xdisplay.showTitle}
              onChange={event => {
                onChangeDisplayValue('xdisplay', {
                  ...xdisplay,
                  showTitle: !xdisplay.showTitle,
                });
              }}
            >
              {_l('显示标题')}
            </Checkbox>
          </div>
        )}
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
        {reportTypes.ScatterChart === reportType && (
          <Fragment>
            <div className="mBottom16 minWrapper">
              <div className="mBottom8">{_l('最小值')}</div>
              <Input
                className="chartInput"
                placeholder={_l('自动')}
                defaultValue={xdisplay.minValue}
                onBlur={event => {
                  let value = event.target.value;
                  let count = Number(formatNumberFromInput(value));
                  onChangeDisplayValue('xdisplay', {
                    ...xdisplay,
                    minValue: value ? count : value,
                  });
                }}
              />
            </div>
            <div className="mBottom16 maxWrapper">
              <div className="mBottom8">{_l('最大值')}</div>
              <Input
                className="chartInput"
                placeholder={_l('自动')}
                defaultValue={xdisplay.maxValue}
                onBlur={event => {
                  let value = event.target.value;
                  let count = Number(formatNumberFromInput(value));
                  onChangeDisplayValue('xdisplay', {
                    ...xdisplay,
                    maxValue: value ? count : value,
                  });
                }}
              />
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
