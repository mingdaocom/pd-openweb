import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Checkbox, Input, Select, Switch, Collapse } from 'antd';
import cx from 'classnames';
import { reportTypes } from 'statistics/Charts/common';

class YAxis extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { ydisplay, onChangeDisplayValue, onChangeCurrentReport, isRight, reportType, yreportType, isDualAxes } = this.props;
    return (
      <Fragment>
        {isDualAxes && !isRight && (
          <div className="mBottom16">
            <div className="mBottom8">{_l('图表类型')}</div>
            <div className="chartTypeSelect flexRow valignWrapper">
              <div
                className={cx('flex centerAlign pointer Gray_75', { active: yreportType == reportTypes.BarChart })}
                onClick={() => {
                  onChangeCurrentReport(
                    {
                      yreportType: reportTypes.BarChart,
                    },
                    true,
                  );
                }}
              >
                {_l('柱图')}
              </div>
              <div
                className={cx('flex centerAlign pointer Gray_75', { active: yreportType == reportTypes.LineChart })}
                onClick={() => {
                  onChangeCurrentReport(
                    {
                      yreportType: reportTypes.LineChart,
                    },
                    true,
                  );
                }}
              >
                {_l('折线图')}
              </div>
            </div>
          </div>
        )}
        <div className="flexRow valignWrapper">
          <Checkbox
            className="mLeft0 mBottom16"
            checked={ydisplay.showDial}
            onChange={() => {
              const showDial = !ydisplay.showDial;
              const param = {
                ...ydisplay,
                showDial,
              };
              onChangeDisplayValue(param);
            }}
          >
            {_l('显示刻度标签')}
          </Checkbox>
        </div>
        {reportType !== reportTypes.ScatterChart && ydisplay.showDial && !isRight && (
          <div className="mBottom16">
            <div className="mBottom8">{_l('线条样式')}</div>
            <Select
              className="chartSelect w100"
              value={ydisplay.lineStyle}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                onChangeDisplayValue({
                  ...ydisplay,
                  lineStyle: value,
                });
              }}
            >
              <Select.Option className="selectOptionWrapper" value={1}>
                {_l('实线')}
              </Select.Option>
              <Select.Option className="selectOptionWrapper" value={2}>
                {_l('虚线')}
              </Select.Option>
            </Select>
          </div>
        )}
        {reportType !== reportTypes.BidirectionalBarChart && (
          <Fragment>
            <div className="flexRow valignWrapper">
              <Checkbox
                className="mLeft0 mBottom16"
                checked={ydisplay.showTitle}
                onChange={checked => {
                  onChangeDisplayValue({
                    ...ydisplay,
                    showTitle: !ydisplay.showTitle,
                  });
                }}
              >
                {_l('显示标题')}
              </Checkbox>
            </div>
            {ydisplay.showTitle && (
              <Input
                className="chartInput mBottom16"
                defaultValue={ydisplay.title}
                onBlur={event => {
                  onChangeDisplayValue({
                    ...ydisplay,
                    title: event.target.value,
                  });
                }}
              />
            )}
          </Fragment>
        )}
        <Fragment>
          <div className="mBottom16 minWrapper">
            <div className="mBottom8">{_l('最小值')}</div>
            <Input
              className="chartInput"
              placeholder={_l('自动')}
              defaultValue={ydisplay.minValue}
              onBlur={event => {
                let value = event.target.value;
                let count = Number(value || 0);
                onChangeDisplayValue({
                  ...ydisplay,
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
              defaultValue={ydisplay.maxValue}
              onBlur={event => {
                let value = event.target.value;
                let count = Number(value || 0);
                onChangeDisplayValue({
                  ...ydisplay,
                  maxValue: value ? count : value,
                });
              }}
            />
          </div>
        </Fragment>
      </Fragment>
    );
  }
}

export default function yAxisPanelGenerator(props) {
  const { currentReport, changeCurrentReport, ...collapseProps } = props;
  const { displaySetup, rightY, reportType, yreportType } = currentReport;
  const isMultiaxis = [reportTypes.DualAxes, reportTypes.BidirectionalBarChart].includes(reportType);
  const isDualAxes = reportType === reportTypes.DualAxes;
  const isBarChart = reportType === reportTypes.BarChart;
  const isVertical = isBarChart && displaySetup.showChartType === 2;
  const switchChecked = displaySetup.ydisplay.showDial || displaySetup.ydisplay.showTitle;
  const rightYSwitchChecked = isMultiaxis
    ? rightY.display.ydisplay.showDial || rightY.display.ydisplay.showTitle
    : false;
  return (
    <Fragment>
      <Collapse.Panel
        key="yAxis"
        header={isMultiaxis ? (
          isDualAxes ? _l('Y轴') : _l('数值(1)')
        ) : (
          isVertical ? _l('X轴') : _l('Y轴')
        )}
        className={cx({ yAxisCollapsible: !switchChecked })}
        {...collapseProps}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              changeCurrentReport({
                displaySetup: {
                  ...displaySetup,
                  ydisplay: {
                    ...displaySetup.ydisplay,
                    showDial: checked,
                    showTitle: checked,
                  },
                },
              });
            }}
          />
        }
      >
        <YAxis
          yreportType={yreportType}
          reportType={reportType}
          isDualAxes={isDualAxes}
          ydisplay={displaySetup.ydisplay}
          onChangeCurrentReport={changeCurrentReport}
          onChangeDisplayValue={data => {
            changeCurrentReport({
              displaySetup: {
                ...displaySetup,
                ydisplay: data,
              },
            });
          }}
        />
      </Collapse.Panel>
      {isMultiaxis && (
        <Collapse.Panel
          key="rightyAxis"
          header={isDualAxes ? _l('辅助Y轴') : _l('数值(2)')}
          className={cx({ yAxisCollapsible: !rightYSwitchChecked })}
          {...collapseProps}
          extra={
            <Switch
              size="small"
              checked={rightYSwitchChecked}
              onClick={(checked, event) => {
                event.stopPropagation();
              }}
              onChange={checked => {
                changeCurrentReport({
                  rightY: {
                    ...rightY,
                    display: {
                      ...rightY.display,
                      ydisplay: {
                        ...rightY.display.ydisplay,
                        showDial: checked,
                        showTitle: checked,
                      },
                    },
                  },
                });
              }}
            />
          }
        >
          <YAxis
            isRight={true}
            reportType={reportType}
            ydisplay={rightY.display.ydisplay}
            onChangeDisplayValue={data => {
              changeCurrentReport({
                rightY: {
                  ...rightY,
                  display: {
                    ...rightY.display,
                    ydisplay: data,
                  },
                },
              });
            }}
          />
        </Collapse.Panel>
      )}
    </Fragment>
  );
}
