import React, { Component, Fragment } from 'react';
import { Checkbox, Input, Tooltip } from 'antd';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { reportTypes } from 'statistics/Charts/common';
import { formatNumberFromInput } from 'src/utils/control';

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
            onChange={() => {
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
              {isBarChart ? _l('自动倾斜Y轴文字') : _l('自动倾斜X轴文字')}
            </Checkbox>
            <Tooltip
              title={_l(
                '勾选时，当位置不够，文字会自动倾斜以保证完整显示。未勾选时，将始终水平显示%0文字。',
                isBarChart ? _l('Y轴') : _l('X轴'),
              )}
              autoCloseDelay={0}
              placement="bottom"
            >
              <Icon className="Gray_9e Font17 pointer" icon="info" />
            </Tooltip>
          </div>
        )}
        {([reportTypes.LineChart].includes(reportType) ||
          ([reportTypes.BarChart].includes(reportType) && displaySetup.showChartType === 1)) && (
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
              onChange={() => {
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
