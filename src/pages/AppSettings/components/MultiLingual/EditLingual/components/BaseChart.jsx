import React, { Fragment } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import { reportTypes } from 'statistics/Charts/common';
import EditInput from '../EditInput';

export default function BaseChart(props) {
  const { item, translateInfo, onSave } = props;
  const { reportInfo = {} } = item;
  const style = reportInfo.style || {};

  const renderCount = () => {
    const { summary = {}, config = {} } = reportInfo;
    const { controlList = [] } = summary;
    const rightYSummary = _.get(config, 'summary') || {};
    const rightYControlList = _.get(config, 'summary.controlList') || [];
    if ([reportTypes.GaugeChart, reportTypes.ProgressChart].includes(item.reportType)) {
      return null;
    }
    if (item.reportType === reportTypes.PivotTable) {
      const { lineSummary = {}, columnSummary = {} } = config;
      const lineSummaryControlList = lineSummary.controlList.filter(n => n.name);
      const columnSummaryControlList = columnSummary.controlList.filter(n => n.name);

      if (
        !lineSummary.rename ||
        !columnSummary.rename ||
        !lineSummaryControlList.length ||
        !columnSummaryControlList.length
      ) {
        return null;
      }

      return (
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('总计')}</div>
          <div className="flex">
            <div className="flexRow alignItemsCenter mBottom15">
              <Input className="flex mRight20" value={lineSummary.rename} disabled={true} />
              <EditInput
                className="flex"
                value={translateInfo.lineSummaryName}
                onChange={value => onSave({ lineSummaryName: value })}
              />
            </div>
            {lineSummaryControlList.map(item => (
              <div className="flexRow alignItemsCenter mBottom15" key={item.controlId}>
                <Input className="flex mRight20" value={item.name} disabled={true} />
                <EditInput
                  className="flex"
                  value={translateInfo[`lineSummaryControl-${item.controlId}-name`]}
                  onChange={value => onSave({ [`lineSummaryControl-${item.controlId}-name`]: value })}
                />
              </div>
            ))}
            <div className="flexRow alignItemsCenter mBottom15">
              <Input className="flex mRight20" value={columnSummary.rename} disabled={true} />
              <EditInput
                className="flex"
                value={translateInfo.columnSummaryName}
                onChange={value => onSave({ columnSummaryName: value })}
              />
            </div>
            {columnSummaryControlList.map(item => (
              <div className="flexRow alignItemsCenter mBottom15" key={item.controlId}>
                <Input className="flex mRight20" value={item.name} disabled={true} />
                <EditInput
                  className="flex"
                  value={translateInfo[`columnSummaryControl-${item.controlId}-name`]}
                  onChange={value => onSave({ [`columnSummaryControl-${item.controlId}-name`]: value })}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
    if ([reportTypes.ScatterChart, reportTypes.FunnelChart].includes(item.reportType)) {
      return (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('总计')}</div>
          <Input className="flex mRight20" value={summary.name} disabled={true} />
          <EditInput
            className="flex"
            value={translateInfo.summaryName}
            onChange={value => onSave({ summaryName: value })}
          />
        </div>
      );
    }
    return (
      <div className="flexRow nodeItem">
        <div className="Font13 mRight20 label">{_l('总计')}</div>
        <div className="flex">
          <div className="flexRow alignItemsCenter mBottom15">
            <Input className="flex mRight20" value={summary.name} disabled={true} />
            <EditInput
              className="flex"
              value={translateInfo.summaryName}
              onChange={value => onSave({ summaryName: value })}
            />
          </div>
          {controlList.map(item => (
            <div className="flexRow alignItemsCenter mBottom15" key={item.controlId}>
              <Input className="flex mRight20" value={item.name} disabled={true} />
              <EditInput
                className="flex"
                value={translateInfo[`summaryControl-${item.controlId}-name`]}
                onChange={value => onSave({ [`summaryControl-${item.controlId}-name`]: value })}
              />
            </div>
          ))}
          {item.reportType === reportTypes.DualAxes && (
            <Fragment>
              <div className="flexRow alignItemsCenter mBottom15">
                <Input className="flex mRight20" value={rightYSummary.name} disabled={true} />
                <EditInput
                  className="flex"
                  value={translateInfo.rightYSummaryName}
                  onChange={value => onSave({ rightYSummaryName: value })}
                />
              </div>
              {rightYControlList.map(item => (
                <div className="flexRow alignItemsCenter mBottom15" key={item.controlId}>
                  <Input className="flex mRight20" value={item.name} disabled={true} />
                  <EditInput
                    className="flex"
                    value={translateInfo[`rightYSummaryControl-${item.controlId}-name`]}
                    onChange={value => onSave({ [`rightYSummaryControl-${item.controlId}-name`]: value })}
                  />
                </div>
              ))}
            </Fragment>
          )}
        </div>
      </div>
    );
  };

  const renderXAxes = () => {
    if ([reportTypes.GaugeChart, reportTypes.ProgressChart].includes(item.reportType)) {
      return null;
    }
    if (item.reportType === reportTypes.PivotTable) {
      const { config = {} } = reportInfo;
      const lines = config.lines.filter(item => item.rename);
      const columns = config.columns.filter(item => item.rename);

      if (!lines.length || !columns.length) {
        return null;
      }

      return (
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('维度')}</div>
          <div className="flex">
            {lines.map(item => (
              <div className="flexRow alignItemsCenter mBottom15" key={item.controlId}>
                <Input className="flex mRight20" value={item.rename} disabled={true} />
                <EditInput
                  className="flex"
                  value={translateInfo[`line-${item.controlId}-name`]}
                  onChange={value => onSave({ [`line-${item.controlId}-name`]: value })}
                />
              </div>
            ))}
            {columns.map(item => (
              <div className="flexRow alignItemsCenter mBottom15" key={item.controlId}>
                <Input className="flex mRight20" value={item.rename} disabled={true} />
                <EditInput
                  className="flex"
                  value={translateInfo[`column-${item.controlId}-name`]}
                  onChange={value => onSave({ [`column-${item.controlId}-name`]: value })}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
    const { xaxes = {} } = reportInfo;
    if (xaxes.rename) {
      return (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('维度')}</div>
          <Input className="flex mRight20" value={xaxes.rename} disabled={true} />
          <EditInput
            className="flex"
            value={translateInfo[`xaxes-${xaxes.controlId}-name`]}
            onChange={value => onSave({ [`xaxes-${xaxes.controlId}-name`]: value })}
          />
        </div>
      );
    } else {
      return null;
    }
  };

  const renderYAxisList = () => {
    const yaxisList = reportInfo.yaxisList.filter(item => item.rename);

    if (!yaxisList.length) {
      return null;
    }

    return (
      <div className="flexRow nodeItem">
        <div className="Font13 mRight20 label">{_l('值')}</div>
        <div className="flex">
          {yaxisList.map(item => (
            <div className="flexRow alignItemsCenter mBottom15" key={item.controlId}>
              <Input className="flex mRight20" value={item.rename} disabled={true} />
              <EditInput
                className="flex"
                value={translateInfo[`yaxis-${item.controlId}-name`]}
                onChange={value => onSave({ [`yaxis-${item.controlId}-name`]: value })}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRightYAxisList = () => {
    if (item.reportType === reportTypes.DualAxes) {
      const { config = {} } = reportInfo;
      const yaxisList = config.yaxisList.filter(item => item.rename);

      if (!yaxisList.length) {
        return null;
      }

      return (
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('值')}</div>
          <div className="flex">
            {yaxisList.map(item => (
              <div className="flexRow alignItemsCenter mBottom15" key={item.controlId}>
                <Input className="flex mRight20" value={item.rename} disabled={true} />
                <EditInput
                  className="flex"
                  value={translateInfo[`rightYaxis-${item.controlId}-name`]}
                  onChange={value => onSave({ [`rightYaxis-${item.controlId}-name`]: value })}
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  const renderScatterChartConfig = () => {
    if (item.reportType === reportTypes.ScatterChart) {
      const { quadrant = {} } = style;
      return (
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('其他')}</div>
          <div className="flex">
            <div className="flexRow alignItemsCenter mBottom15">
              <Input className="flex mRight20" value={quadrant.topRightText} disabled={true} />
              <EditInput
                className="flex"
                value={translateInfo.quadrantTopRightText}
                onChange={value => onSave({ quadrantTopRightText: value })}
              />
            </div>
            <div className="flexRow alignItemsCenter mBottom15">
              <Input className="flex mRight20" value={quadrant.topLeftText} disabled={true} />
              <EditInput
                className="flex"
                value={translateInfo.quadrantTopLeftText}
                onChange={value => onSave({ quadrantTopLeftText: value })}
              />
            </div>
            <div className="flexRow alignItemsCenter mBottom15">
              <Input className="flex mRight20" value={quadrant.bottomLeftText} disabled={true} />
              <EditInput
                className="flex"
                value={translateInfo.quadrantBottomLeftText}
                onChange={value => onSave({ quadrantBottomLeftText: value })}
              />
            </div>
            <div className="flexRow alignItemsCenter mBottom15">
              <Input className="flex mRight20" value={quadrant.bottomRightText} disabled={true} />
              <EditInput
                className="flex"
                value={translateInfo.quadrantBottomRightText}
                onChange={value => onSave({ quadrantBottomRightText: value })}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  const renderFunnelChartConfig = () => {
    if (item.reportType === reportTypes.FunnelChart && style.funnelConversionText) {
      return (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('其他')}</div>
          <Input className="flex mRight20" value={style.funnelConversionText} disabled={true} />
          <EditInput
            className="flex"
            value={translateInfo.funnelConversionText}
            onChange={value => onSave({ funnelConversionText: value })}
          />
        </div>
      );
    } else {
      return null;
    }
  };

  const renderProgressChartConfig = () => {
    if (item.reportType === reportTypes.ProgressChart && (style.currentValueName || style.targetValueName)) {
      return (
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('其他')}</div>
          <div className="flex">
            {style.currentValueName && (
              <div className="flexRow alignItemsCenter mBottom15">
                <Input className="flex mRight20" value={style.currentValueName} disabled={true} />
                <EditInput
                  className="flex"
                  value={translateInfo.currentValueName}
                  onChange={value => onSave({ currentValueName: value })}
                />
              </div>
            )}
            {style.targetValueName && (
              <div className="flexRow alignItemsCenter mBottom15">
                <Input className="flex mRight20" value={style.targetValueName} disabled={true} />
                <EditInput
                  className="flex"
                  value={translateInfo.targetValueName}
                  onChange={value => onSave({ targetValueName: value })}
                />
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  const renderYAxisShowTitleConfig = () => {
    const { displaySetup = {} } = reportInfo;
    const { ydisplay } = displaySetup;
    if (
      [reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes, reportTypes.ScatterChart].includes(
        item.reportType,
      ) &&
      ydisplay.title
    ) {
      return (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('Y轴显示标题')}</div>
          <Input className="flex mRight20" value={ydisplay.title} disabled={true} />
          <EditInput
            className="flex"
            value={translateInfo.ydisplayTitle}
            onChange={value => onSave({ ydisplayTitle: value })}
          />
        </div>
      );
    } else {
      return null;
    }
  };

  const renderRightYAxisShowTitleConfig = () => {
    const { ydisplay } = _.get(reportInfo, 'config.display') || {};
    if ([reportTypes.DualAxes].includes(item.reportType) && ydisplay.title) {
      return (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('辅助Y轴显示标题')}</div>
          <Input className="flex mRight20" value={ydisplay.title} disabled={true} />
          <EditInput
            className="flex"
            value={translateInfo.rightYdisplayTitle}
            onChange={value => onSave({ rightYdisplayTitle: value })}
          />
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <Fragment>
      <Fragment>
        {renderCount()}
        {renderXAxes()}
        {renderYAxisList()}
        {renderRightYAxisList()}
        {renderScatterChartConfig()}
        {renderFunnelChartConfig()}
        {renderProgressChartConfig()}
        {renderYAxisShowTitleConfig()}
        {renderRightYAxisShowTitleConfig()}
      </Fragment>
    </Fragment>
  );
}
