import React, { Component, Fragment } from 'react';
import { Checkbox, Radio, Input, Space } from 'antd';
import cx from 'classnames';
import { reportTypes } from 'statistics/Charts/common';

export default class Label extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentReport, onChangeDisplayValue, onUpdateDisplaySetup } = this.props;
    const { reportType, displaySetup, style } = currentReport;
    const { showChartType } = displaySetup;

    if (reportType === reportTypes.PieChart) {
      return (
        <Fragment>
          <div className="flexRow valignWrapper">
            <Checkbox
              className="mLeft0 mBottom16"
              checked={displaySetup.showDimension}
              onChange={() => {
                onChangeDisplayValue('showDimension', !displaySetup.showDimension);
              }}
            >
              {_l('显示维度标签')}
            </Checkbox>
          </div>
          <div className="flexRow valignWrapper">
            <Checkbox
              className="mLeft0 mBottom16"
              checked={displaySetup.showNumber}
              onChange={() => {
                onChangeDisplayValue('showNumber', !displaySetup.showNumber);
              }}
            >
              {_l('显示数值')}
            </Checkbox>
          </div>
          <div className="flexRow valignWrapper">
            <Checkbox
              className="mLeft0 mBottom16"
              checked={displaySetup.showPercent}
              onChange={() => {
                onChangeDisplayValue('showPercent', !displaySetup.showPercent);
              }}
            >
              {_l('显示百分比')}
            </Checkbox>
          </div>
        </Fragment>
      );
    }

    if (reportType === reportTypes.GaugeChart) {
      return (
        <Fragment>
          <div className="flexRow valignWrapper">
            <Checkbox
              className="mLeft0 mBottom16"
              checked={displaySetup.showDimension}
              onChange={() => {
                onChangeDisplayValue('showDimension', !displaySetup.showDimension);
              }}
            >
              {_l('显示维度标签')}
            </Checkbox>
          </div>
          <div className="flexRow valignWrapper">
            <Checkbox
              className="mLeft0 mBottom16"
              checked={displaySetup.showNumber || displaySetup.showPercent}
              onChange={() => {
                onUpdateDisplaySetup({
                  ...displaySetup,
                  showNumber: !displaySetup.showNumber,
                  showPercent: false
                });
              }}
            >
              {_l('显示数值')}
            </Checkbox>
          </div>
          {(displaySetup.showNumber || displaySetup.showPercent) && (
            <div className="chartTypeSelect flexRow valignWrapper mBottom16 mLeft25">
              <div
                className={cx('flex centerAlign pointer Gray_75', { active: displaySetup.showNumber === true && !displaySetup.showPercent })}
                onClick={() => {
                  onUpdateDisplaySetup({
                    ...displaySetup,
                    showNumber: !displaySetup.showNumber,
                    showPercent: false
                  });
                }}
              >
                {_l('数值')}
              </div>
              <div
                className={cx('flex centerAlign pointer Gray_75', { active: displaySetup.showPercent === true })}
                onClick={() => {
                  onUpdateDisplaySetup({
                    ...displaySetup,
                    showNumber: false,
                    showPercent: !displaySetup.showPercent
                  });
                }}
              >
                {_l('百分比')}
              </div>
            </div>
          )}
        </Fragment>
      );
    }

    if (reportType === reportTypes.ProgressChart) {
      const { currentValueName = _l('实际'), targetValueName = _l('目标'), showValueType = 1 } = style;

      if (showChartType === 1) {
        return (
          <Fragment>
            <div className="flexRow valignWrapper mBottom5">
              <Checkbox
                className="mLeft0"
                checked={displaySetup.showNumber}
                onChange={() => {
                  onUpdateDisplaySetup({
                    ...displaySetup,
                    showNumber: !displaySetup.showNumber,
                  });
                }}
              >
                {_l('显示当前值')}
              </Checkbox>
            </div>
            {displaySetup.showNumber && (
              <Input
                className="chartInput mBottom16"
                value={currentValueName}
                onChange={event => {
                  this.props.onChangeStyle({ currentValueName: event.target.value })
                }}
              />
            )}
            <div className="flexRow valignWrapper mBottom5">
              <Checkbox
                className="mLeft0"
                checked={displaySetup.showDimension}
                onChange={() => {
                  onUpdateDisplaySetup({
                    ...displaySetup,
                    showDimension: !displaySetup.showDimension,
                  });
                }}
              >
                {_l('显示目标值')}
              </Checkbox>
            </div>
            {displaySetup.showDimension && (
              <Input
                className="chartInput mBottom16"
                value={targetValueName}
                onChange={event => {
                  this.props.onChangeStyle({ targetValueName: event.target.value })
                }}
              />
            )}
          </Fragment>
        );
      } else {
        return (
          <Fragment>
            <div className="flexRow valignWrapper">
              <Checkbox
                className="mLeft0 mBottom5"
                checked={displaySetup.showNumber}
                onChange={() => {
                  onUpdateDisplaySetup({
                    ...displaySetup,
                    showNumber: !displaySetup.showNumber,
                  });
                }}
              >
                {_l('显示数值')}
              </Checkbox>
            </div>
            {displaySetup.showNumber && (
              <div className="valignWrapper mBottom16 mLeft25">
                <Radio.Group
                  value={showValueType}
                  onChange={(event) => {
                    const { value } = event.target;
                    this.props.onChangeStyle({ showValueType: value })
                  }}
                >
                  <Space direction="vertical">
                    <Radio value={1} className="Font13">{_l('数值')}</Radio>
                    <Radio value={2} className="Font13">{_l('百分比')}</Radio>
                    <Radio value={3} className="Font13">{_l('数值/目标值')}</Radio>
                  </Space>
                </Radio.Group>
              </div>
            )}
          </Fragment>
        );
      }
    }

    return (
      <Fragment>
        <div className="flexRow valignWrapper">
          <Checkbox
            className="flexRow mLeft0 mBottom16"
            checked={displaySetup.showDimension || displaySetup.showNumber || displaySetup.showPercent}
            onChange={() => {
              if (displaySetup.showDimension || displaySetup.showNumber || displaySetup.showPercent) {
                onUpdateDisplaySetup({
                  ...displaySetup,
                  showDimension: false,
                  showNumber: false,
                  showPercent: false,
                });
              } else {
                onUpdateDisplaySetup({
                  ...displaySetup,
                  showDimension: true,
                  showNumber: true,
                  showPercent: true,
                });
              }
            }}
          >
            {_l('显示%0', reportType === reportTypes.FunnelChart ? _l('转化率') : _l('数据'))}
          </Checkbox>
        </div>
        {[reportTypes.BarChart, reportTypes.DualAxes].includes(reportType) && displaySetup.isPile && (
          <div className="flexRow valignWrapper">
            <Checkbox
              className="mLeft0 mBottom16"
              checked={displaySetup.showPileTotal}
              onChange={() => {
                onChangeDisplayValue('showPileTotal', !displaySetup.showPileTotal);
              }}
            >
              {_l('显示堆叠总数')}
            </Checkbox>
          </div>
        )}
        {[reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes, reportTypes.BidirectionalBarChart].includes(reportType) && (
          <div className="flexRow valignWrapper">
            <Checkbox
              className="flexRow mLeft0 mBottom16"
              checked={displaySetup.hideOverlapText}
              onChange={() => {
                onChangeDisplayValue('hideOverlapText', !displaySetup.hideOverlapText);
              }}
            >
              {_l('隐藏重叠的标签文字')}
            </Checkbox>
          </div>
        )}
      </Fragment>
    );
  }
}
