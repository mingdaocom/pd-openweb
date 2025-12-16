import React, { Component, Fragment } from 'react';
import { Checkbox, Input, Radio, Select, Space, Tag } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { ColorPicker, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { reportTypes, roundTypes } from 'statistics/Charts/common';
import RuleColor from './Color/RuleColor';

export default class Label extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ruleColorModalVisible: false,
    };
  }
  render() {
    const { currentReport, onChangeDisplayValue, onChangeDisplaySetup, onChangeYDisplaySetup, onChangeStyle } =
      this.props;
    const { reportType, yaxisList, displaySetup, summary, rightY, style } = currentReport;
    const { percent } = displaySetup;
    const rightYDisplaySetup = _.get(rightY, 'display.ydisplay') || {};
    const rightYShowNumber = rightYDisplaySetup.showNumber ?? true;

    const labelPercent = (
      <Fragment>
        <div className="flexRow valignWrapper">
          <Checkbox
            className="mLeft0 mBottom16"
            checked={percent.enable}
            onChange={event => {
              onChangeDisplayValue('percent', {
                ...percent,
                enable: event.target.checked,
              });
            }}
          >
            {_l('显示百分比')}
          </Checkbox>
        </div>
        {percent.enable && (
          <div className="mBottom15 mLeft25">
            <div className="mBottom8">{_l('保留小数')}</div>
            <Input
              className="chartInput"
              value={percent.dot}
              onChange={event => {
                const count = Number(event.target.value.replace(/-/g, ''));
                onChangeDisplayValue('percent', {
                  ...percent,
                  dot: count >= 9 ? 9 : count,
                });
              }}
              suffix={
                <div className="flexColumn">
                  <Icon
                    icon="expand_less"
                    className="Gray_9e Font20 pointer mBottom2"
                    onClick={() => {
                      let newYdot = Number(percent.dot);
                      onChangeDisplayValue('percent', {
                        ...percent,
                        dot: newYdot >= 9 ? 9 : newYdot + 1,
                      });
                    }}
                  />
                  <Icon
                    icon="expand_more"
                    className="Gray_9e Font20 pointer mTop2"
                    onClick={() => {
                      let newYdot = Number(percent.dot);
                      onChangeDisplayValue('percent', {
                        ...percent,
                        dot: newYdot ? newYdot - 1 : 0,
                      });
                    }}
                  />
                </div>
              }
            />
            <Select
              className="chartSelect w100 mTop10"
              value={percent.roundType}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                onChangeDisplayValue('percent', {
                  ...percent,
                  roundType: value,
                });
              }}
            >
              {roundTypes.map(item => (
                <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
            <div className="flexRow valignWrapper mTop10">
              <Checkbox
                className="flexRow"
                checked={percent.dotFormat === '1'}
                onChange={() => {
                  const value = percent.dotFormat === '1' ? '0' : '1';
                  onChangeDisplayValue('percent', {
                    ...percent,
                    dotFormat: value,
                  });
                }}
              >
                {_l('省略末尾的 0')}
              </Checkbox>
              <Tooltip
                title={_l('勾选后，不足小数位数时省略末尾的0。如设置4位小数时，默认显示完整精度2.800，勾选后显示为2.8')}
                placement="bottom"
                arrowPointAtCenter
              >
                <Icon className="Gray_9e Font18 pointer" icon="info" />
              </Tooltip>
            </div>
          </div>
        )}
      </Fragment>
    );

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
          {labelPercent}
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
            {labelPercent}
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
            <div
              className="flexRow valignWrapper"
              style={isApplyGaugeColor ? { filter: 'opacity(0.5)', pointerEvents: 'none' } : undefined}
            >
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
                    <div className="colorBlock" style={{ backgroundColor: fontColor }}></div>
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
                    const newColorRules = colorRules.map((item, index) => (index === 0 ? {} : item));
                    onChangeDisplayValue('colorRules', newColorRules);
                  }}
                >
                  <Icon className="Font16 Gray_9e" icon="trash" />
                </div>
              )}
            </div>
          </div>
          <RuleColor
            visible={ruleColorModalVisible}
            yaxisList={currentReport.yaxisList}
            reportType={currentReport.reportType}
            colorRule={colorRule || {}}
            onSave={data => {
              const rule = {
                controlId: '',
                dataBarRule: data,
              };
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
                  onChangeDisplaySetup({
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
                  onChangeStyle({ currentValueName: event.target.value });
                }}
              />
            )}
            <div className="flexRow valignWrapper mBottom5">
              <Checkbox
                className="mLeft0"
                checked={displaySetup.showDimension}
                onChange={() => {
                  onChangeDisplaySetup({
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
                  onChangeStyle({ targetValueName: event.target.value });
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
                  onChangeDisplaySetup({
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
                  onChange={event => {
                    const { value } = event.target;
                    onChangeStyle({ showValueType: value });
                  }}
                >
                  <Space direction="vertical">
                    <Radio value={1} className="Font13">
                      {_l('数值')}
                    </Radio>
                    <Radio value={2} className="Font13">
                      {_l('百分比')}
                    </Radio>
                    <Radio value={3} className="Font13">
                      {_l('数值/目标值')}
                    </Radio>
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
        if (yaxisList.length > 1) {
          return true;
        }
        return displaySetup.showTotal;
      }
      if ([reportTypes.BidirectionalBarChart].includes(reportType)) {
        return summary.showTotal || _.get(rightY, 'summary.showTotal');
      }
      return false;
    };

    const showMultiple = reportType === reportTypes.LineChart && displaySetup.showNumber;

    return (
      <Fragment>
        {reportType === reportTypes.DualAxes ? (
          <Fragment>
            <div className="flexRow valignWrapper mBottom16">
              <Checkbox
                className="flexRow mLeft0"
                checked={displaySetup.showNumber}
                onChange={() => {
                  if (displaySetup.showNumber) {
                    onChangeDisplaySetup({
                      showDimension: false,
                      showNumber: false,
                    });
                  } else {
                    onChangeDisplaySetup({
                      showDimension: true,
                      showNumber: true,
                    });
                  }
                }}
              >
                {_l('显示Y轴数据')}
              </Checkbox>
            </div>
            <div className="flexRow valignWrapper mBottom16">
              <Checkbox
                className="flexRow mLeft0"
                checked={rightYShowNumber}
                onChange={() => {
                  onChangeYDisplaySetup({
                    showNumber: rightYShowNumber ? false : true,
                  });
                }}
              >
                {_l('显示辅助Y轴数据')}
              </Checkbox>
            </div>
          </Fragment>
        ) : (
          <div className={cx('flexRow valignWrapper', showMultiple ? 'mBottom10' : 'mBottom16')}>
            <Checkbox
              className="flexRow mLeft0"
              checked={displaySetup.showDimension || displaySetup.showNumber}
              onChange={() => {
                if (displaySetup.showDimension || displaySetup.showNumber) {
                  onChangeDisplaySetup({
                    showDimension: false,
                    showNumber: false,
                  });
                } else {
                  onChangeDisplaySetup({
                    showDimension: true,
                    showNumber: true,
                  });
                }
              }}
            >
              {reportType === reportTypes.FunnelChart ? _l('显示转化率') : _l('显示数据')}
            </Checkbox>
          </div>
        )}
        {reportType === reportTypes.FunnelChart && (
          <div className="mLeft20 mBottom12">
            {(displaySetup.showDimension || displaySetup.showNumber) && (
              <Input
                className="chartInput"
                defaultValue={style.funnelConversionText || _l('转化率')}
                onBlur={event => {
                  onChangeStyle({ funnelConversionText: event.target.value.slice(0, 10) });
                }}
              />
            )}
          </div>
        )}
        {reportType === reportTypes.LineChart && displaySetup.showNumber && (
          <Select
            mode="multiple"
            className="chartSelect mBottom16 w100"
            value={_.isEmpty(style.chartShowLabelIds) ? ['all'] : style.chartShowLabelIds}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            tagRender={props => {
              const { label, value, closable, onClose } = props;
              const isExist = value == 'all' ? true : _.find(yaxisList, { controlId: value });
              const onPreventMouseDown = event => {
                event.preventDefault();
                event.stopPropagation();
              };
              return (
                <Tag
                  color={isExist ? undefined : 'error'}
                  onMouseDown={onPreventMouseDown}
                  closable={closable}
                  onClose={onClose}
                >
                  {isExist ? label : _l('字段已删除')}
                </Tag>
              );
            }}
            onDeselect={value => {
              const chartShowLabelIds = style.chartShowLabelIds || [];
              onChangeStyle({ chartShowLabelIds: chartShowLabelIds.filter(n => n !== value) });
            }}
            onSelect={value => {
              if (value === 'all') {
                onChangeStyle({ chartShowLabelIds: ['all'] });
              } else {
                const chartShowLabelIds = style.chartShowLabelIds || [];
                onChangeStyle({ chartShowLabelIds: chartShowLabelIds.filter(n => n !== 'all').concat(value) });
              }
            }}
          >
            <Select.Option value="all">{_l('全部')}</Select.Option>
            {yaxisList.map(item => (
              <Select.Option key={item.controlId} value={item.controlId}>
                {item.controlName}
              </Select.Option>
            ))}
          </Select>
        )}
        {getShowLabelPercent() && labelPercent}
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
        {[
          reportTypes.BarChart,
          reportTypes.LineChart,
          reportTypes.DualAxes,
          reportTypes.BidirectionalBarChart,
        ].includes(reportType) && (
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
