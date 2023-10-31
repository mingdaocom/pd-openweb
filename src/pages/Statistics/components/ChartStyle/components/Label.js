import React, { Component, Fragment } from 'react';
import { Checkbox, Radio, Input, Space } from 'antd';
import { Icon, ColorPicker } from 'ming-ui';
import cx from 'classnames';
import { reportTypes } from 'statistics/Charts/common';
import RuleColor from './Color/RuleColor';

export default class Label extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ruleColorModalVisible: false
    }
  }
  render() {
    const { currentReport, onChangeDisplayValue, onUpdateDisplaySetup, onChangeStyle } = this.props;
    const { reportType, yaxisList, displaySetup, summary, rightY, style } = currentReport;

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
      const { ruleColorModalVisible } = this.state;
      const { fontColor = 'rgba(0, 0, 0, 1)', isApplyGaugeColor = false } = currentReport.style;
      const { colorRules } = currentReport.displaySetup;
      const colorRule = _.get(colorRules[0], 'dataBarRule');
      const onCancel = () => this.setState({ ruleColorModalVisible: false });
      return (
        <Fragment>
          <div className="mBottom10">
            <div className="flexRow valignWrapper mBottom13">
              <Checkbox
                className="mLeft0"
                checked={displaySetup.showDimension}
                onChange={() => {
                  onChangeDisplayValue('showDimension', !displaySetup.showDimension);
                }}
              >
                {_l('显示维度标签')}
              </Checkbox>
            </div>
            <div className="flexRow valignWrapper mBottom13">
              <Checkbox
                className="mLeft0"
                checked={displaySetup.showNumber}
                onChange={() => {
                  onChangeDisplayValue('showNumber', !displaySetup.showNumber);
                }}
              >
                {_l('显示数值')}
              </Checkbox>
            </div>
            <div className="flexRow valignWrapper mBottom13">
              <Checkbox
                className="mLeft0"
                checked={displaySetup.showPercent}
                onChange={() => {
                  onChangeDisplayValue('showPercent', !displaySetup.showPercent);
                }}
              >
                {_l('显示百分比')}
              </Checkbox>
            </div>
            <div className="flexRow valignWrapper mBottom13">
              <Checkbox
                checked={isApplyGaugeColor}
                onChange={() => {
                  onChangeStyle({ isApplyGaugeColor: event.target.checked });
                }}
              >
                {_l('使用仪表盘颜色')}
              </Checkbox>
            </div>
            <div className="flexRow valignWrapper" style={isApplyGaugeColor ? { filter: 'opacity(0.5)', pointerEvents: 'none' } : undefined}>
              <div>{_l('颜色')}</div>
              {_.isEmpty(colorRule) && (
                <ColorPicker
                  isPopupBody
                  className="mLeft10"
                  value={fontColor}
                  onChange={value => {
                    onChangeStyle({ fontColor: value });
                  }}
                >
                  <div className="colorWrap pointer">
                    <div className="colorBlock" style={{ backgroundColor: fontColor }}>
                    </div>
                  </div>
                </ColorPicker>
              )}
              <div
                className="entranceWrap ruleIcon flexRow valignWrapper pointer"
                onClick={() => {
                  this.setState({ ruleColorModalVisible: true });
                }}
              >
                <Icon className="Font16 Gray_9e" icon="formula" />
              </div>
              {!_.isEmpty(colorRule) && (
                <div
                  className="entranceWrap ruleIcon flexRow valignWrapper pointer"
                  onClick={() => {
                    const newColorRules = colorRules.map((item, index) => index === 0 ? {} : item);
                    onChangeDisplayValue('colorRules', newColorRules);
                  }}
                >
                  <Icon className="Font16 Gray_9e" icon="delete2" />
                </div>
              )}
            </div>
          </div>
          <RuleColor
            visible={ruleColorModalVisible}
            yaxisList={currentReport.yaxisList}
            reportType={currentReport.reportType}
            colorRule={colorRule || {}}
            onSave={(data) => {
              const rule = {
                controlId: '',
                dataBarRule: data
              }
              if (colorRules.length) {
                onChangeDisplayValue('colorRules', [rule, colorRules[1]]);
              } else {
                onChangeDisplayValue('colorRules', [rule, {}]);
              }
              onCancel();
            }}
            onCancel={onCancel}
          />
        </Fragment>
      );
    }

    if (reportType === reportTypes.ProgressChart) {
      const { currentValueName = _l('实际'), targetValueName = _l('目标'), showValueType = 1 } = style;

      if (displaySetup.showChartType === 1) {
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
                  onChangeStyle({ currentValueName: event.target.value })
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
                  onChangeStyle({ targetValueName: event.target.value })
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
                    onChangeStyle({ showValueType: value })
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

    const getShowLabelPercent = () => {
      if ([reportTypes.BarChart].includes(reportType)) {
        return yaxisList.length > 1 ? true : displaySetup.showTotal;
      }
      if ([reportTypes.BidirectionalBarChart].includes(reportType)) {
        return summary.showTotal || _.get(rightY, 'summary.showTotal');
      }
      return false;
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
        {getShowLabelPercent() && (
          <div className="flexRow valignWrapper">
            <Checkbox
              className="mLeft0 mBottom16"
              checked={style.showLabelPercent}
              onChange={() => {
                onChangeStyle({ showLabelPercent: !style.showLabelPercent });
              }}
            >
              {_l('显示百分比')}
            </Checkbox>
          </div>
        )}
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
