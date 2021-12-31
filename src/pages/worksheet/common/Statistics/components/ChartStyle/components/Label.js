import React, { Component, Fragment } from 'react';
import { Checkbox } from 'antd';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';

export default class Label extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentReport, onChangeDisplayValue, onUpdateDisplaySetup } = this.props;
    const { reportType, displaySetup } = currentReport;
    return (
      <Fragment>
        {reportType === reportTypes.PieChart ? (
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
        ) : (
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
            {[reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes].includes(reportType) && (
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
        )}
      </Fragment>
    );
  }
}
