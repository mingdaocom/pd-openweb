import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Checkbox, Input, InputNumber, Radio, Segmented, Select, Space, Tooltip } from 'ming-ui/antd-components';
import { numberLevel, roundTypes } from 'statistics/Charts/common';
import { formatNumberFromInput } from 'src/utils/domain/control/number';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';

class Unit extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleChangeYaxis = (key, value, current) => {
    const { changeAllYaxis, yaxisList, onChangeYaxisList } = this.props;
    const data = yaxisList.map(item => {
      if (changeAllYaxis ? true : item.controlId === current.controlId) {
        return {
          ...item,
          [key]: value,
        };
      }

      return item;
    });
    onChangeYaxisList(
      {
        yaxisList: data,
      },
      true,
    );
  };
  handleChangeMagnitude = (value, current) => {
    const { changeAllYaxis, yaxisList, onChangeYaxisList } = this.props;
    const data = yaxisList.map(item => {
      if (changeAllYaxis ? true : item.controlId === current.controlId) {
        const { suffix } = _.find(numberLevel, { value });
        let ydot = 0;

        if (value === 0) {
          ydot = 2;
        } else if (value === 1) {
          ydot = item.controlType === 10000001 ? 2 : '';
        }

        return {
          ...item,
          magnitude: value,
          suffix,
          ydot,
        };
      }

      return item;
    });
    onChangeYaxisList(
      {
        yaxisList: data,
      },
      true,
    );
  };
  handleChangeYdot = (value, current) => {
    const { changeAllYaxis, yaxisList, onChangeYaxisList } = this.props;
    let count = '';

    if (!_.isNil(value) && value !== '') {
      count = _.isNumber(value) ? value : Number(formatNumberFromInput(value));
      count = _.clamp(count, 0, 9);
    }

    const data = yaxisList.map(item => {
      if (changeAllYaxis ? true : item.controlId === current.controlId) {
        return {
          ...item,
          ydot: count,
        };
      }

      return item;
    });

    onChangeYaxisList(
      {
        yaxisList: data,
      },
      true,
    );
  };
  render() {
    const { data, currentReport = {} } = this.props;
    const { reportType, pivotTable = {} } = currentReport;
    const {
      magnitude,
      roundType,
      dotFormat,
      ydot,
      thousandth = true,
      suffix,
      fixType,
      showNumber = true,
      percent = {},
    } = data;
    const sheetDot = magnitude === 1 && ydot === '';
    const isPivotTable = reportTypes.PivotTable === reportType;
    const { lines = [] } = pivotTable;
    const subTotalSwitchChecked = !lines.slice(1, lines.length).filter(n => n.subTotal).length;
    return (
      <Fragment>
        {isPivotTable && (
          <div className="flexRow valignWrapper mBottom12">
            <Checkbox
              className="flexRow"
              checked={showNumber}
              onChange={e => {
                const { checked } = e.target;
                this.handleChangeYaxis('showNumber', checked, data);
              }}
            >
              {_l('数值')}
            </Checkbox>
          </div>
        )}
        {(isPivotTable ? showNumber : true) && (
          <Fragment>
            <div className="mBottom15">
              <div className="mBottom8">{_l('数值数量级')}</div>
              <Select
                className="w100"
                value={magnitude}
                suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                options={numberLevel.map(item => ({
                  value: item.value,
                  label: item.text,
                }))}
                onChange={value => {
                  this.handleChangeMagnitude(value, data);
                }}
              />
            </div>
            <div className="flexRow valignWrapper mBottom15">
              <Checkbox
                className="flexRow"
                checked={thousandth}
                onChange={e => {
                  const { checked } = e.target;
                  this.handleChangeYaxis('thousandth', checked, data);
                }}
              >
                {_l('显示千分位')}
              </Checkbox>
            </div>
            <div className="mBottom15">
              <div className="mBottom8">{_l('保留小数')}</div>
              <InputNumber
                className="w100"
                min={0}
                max={9}
                precision={0}
                value={sheetDot ? undefined : ydot}
                placeholder={sheetDot && _l('按工作表字段配置显示')}
                onChange={value => {
                  this.handleChangeYdot(value, data);
                }}
              />
              <Select
                className="w100 mTop10"
                value={roundType}
                suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                options={roundTypes.map(item => ({
                  value: item.value,
                  label: item.text,
                }))}
                onChange={value => {
                  this.handleChangeYaxis('roundType', value, data);
                }}
              />
              <div className="flexRow valignWrapper mTop10">
                <Checkbox
                  className="flexRow"
                  checked={dotFormat === '1'}
                  onChange={() => {
                    const value = dotFormat === '1' ? '0' : '1';
                    this.handleChangeYaxis('dotFormat', value, data);
                  }}
                >
                  {_l('省略末尾的 0')}
                </Checkbox>
                <Tooltip
                  title={_l(
                    '勾选后，不足小数位数时省略末尾的0。如设置4位小数时，默认显示完整精度2.800，勾选后显示为2.8',
                  )}
                  placement="bottom"
                  arrow={{ pointAtCenter: true }}
                >
                  <Icon className="textTertiary Font18 pointer" icon="info" />
                </Tooltip>
              </div>
            </div>
          </Fragment>
        )}
        <div className="mBottom15">
          <div className="mBottom8">{_l('单位')}</div>
          <div className="valignWrapper">
            <Space.Compact>
              <Select
                disabled={[0].includes(magnitude)}
                value={fixType || 0}
                suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                options={[
                  {
                    value: 1,
                    label: _l('前缀'),
                  },
                  {
                    value: 0,
                    label: _l('后缀'),
                  },
                ]}
                onChange={value => {
                  this.handleChangeYaxis('fixType', value, data);
                }}
              />
              <Input
                key={`${data.controlId}-${magnitude}`}
                className="flex"
                defaultValue={suffix}
                maxLength={10}
                disabled={[0].includes(magnitude)}
                onPressEnter={event => event.currentTarget.blur()}
                onBlur={event => {
                  this.handleChangeYaxis('suffix', event.target.value, data);
                }}
              />
            </Space.Compact>
          </div>
        </div>
        {isPivotTable && (
          <div className="mBottom15">
            <div className="flexRow valignWrapper mTop10">
              <Checkbox
                className="flexRow"
                checked={percent.enable}
                onChange={event => {
                  this.handleChangeYaxis(
                    'percent',
                    {
                      ...percent,
                      enable: event.target.checked,
                    },
                    data,
                  );
                }}
              >
                {_l('显示百分比')}
              </Checkbox>
            </div>
            {percent.enable && (
              <Fragment>
                <div className="flexRow valignWrapper mTop10">
                  <Radio.Group
                    value={percent.type}
                    onChange={e => {
                      const { value } = e.target;
                      this.handleChangeYaxis(
                        'percent',
                        {
                          ...percent,
                          type: value,
                        },
                        data,
                      );
                    }}
                  >
                    <Radio className="Font13" disabled={subTotalSwitchChecked} value={1}>
                      {_l('按小计')}
                    </Radio>
                    <Radio className="Font13" value={2}>
                      {_l('按总计')}
                    </Radio>
                  </Radio.Group>
                </div>
                <div className="mTop15 mBottom15">
                  <div className="mBottom8">{_l('保留小数')}</div>
                  <InputNumber
                    className="w100"
                    min={0}
                    max={9}
                    precision={0}
                    value={percent.dot}
                    onChange={value => {
                      this.handleChangeYaxis(
                        'percent',
                        {
                          ...percent,
                          dot: _.clamp(value || 0, 0, 9),
                        },
                        data,
                      );
                    }}
                  />
                  <Select
                    className="w100 mTop10"
                    value={percent.roundType}
                    suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                    options={roundTypes.map(item => ({
                      value: item.value,
                      label: item.text,
                    }))}
                    onChange={value => {
                      this.handleChangeYaxis(
                        'percent',
                        {
                          ...percent,
                          roundType: value,
                        },
                        data,
                      );
                    }}
                  />
                  <div className="flexRow valignWrapper mTop10">
                    <Checkbox
                      className="flexRow"
                      checked={percent.dotFormat === '1'}
                      onChange={() => {
                        const value = percent.dotFormat === '1' ? '0' : '1';
                        this.handleChangeYaxis(
                          'percent',
                          {
                            ...percent,
                            dotFormat: value,
                          },
                          data,
                        );
                      }}
                    >
                      {_l('省略末尾的 0')}
                    </Checkbox>
                    <Tooltip
                      title={_l(
                        '勾选后，不足小数位数时省略末尾的0。如设置4位小数时，默认显示完整精度2.800，勾选后显示为2.8',
                      )}
                      placement="bottom"
                      arrow={{ pointAtCenter: true }}
                    >
                      <Icon className="textTertiary Font18 pointer" icon="info" />
                    </Tooltip>
                  </div>
                </div>
              </Fragment>
            )}
          </div>
        )}
      </Fragment>
    );
  }
}

export default function unitPanelGenerator(props) {
  const { currentReport, changeCurrentReport, onChangeStyle } = props;
  const { reportType, yaxisList, rightY, style } = currentReport;
  const isDualAxes = reportType === reportTypes.DualAxes;
  const rightYaxisList = rightY ? rightY.yaxisList : [];
  const firstYaxis = yaxisList[0];
  const firstRightYaxis = rightYaxisList[0];
  const { tooltipValueType = 0 } = style;
  return [reportTypes.PivotTable, reportTypes.NumberChart, reportTypes.TopChart].includes(reportType)
    ? {
        key: 'pivotTableUnit',
        label: _l('值'),
        children: (
          <Fragment>
            {yaxisList
              .filter(data => data.normType !== 7)
              .map(item => (
                <Fragment>
                  <div className="mBottom12 Bold textSecondary">{item.controlName}</div>
                  <Unit
                    currentReport={currentReport}
                    data={item}
                    yaxisList={yaxisList}
                    onChangeYaxisList={(data, isRequest = false) => {
                      changeCurrentReport(
                        {
                          ...data,
                          displaySetup: {
                            ...currentReport.displaySetup,
                            magnitudeUpdateFlag: Date.now(),
                          },
                        },
                        isRequest,
                      );
                    }}
                  />
                </Fragment>
              ))}
          </Fragment>
        ),
      }
    : {
        key: 'leftUnit',
        label: _l('值'),
        children: (
          <Fragment>
            {firstYaxis && (
              <Fragment>
                {isDualAxes && <div className="mBottom12 Bold textSecondary">{_l('Y轴')}</div>}
                <Unit
                  changeAllYaxis={true}
                  data={firstYaxis}
                  yaxisList={yaxisList}
                  onChangeYaxisList={(data, isRequest = false) => {
                    changeCurrentReport(
                      {
                        ...data,
                        displaySetup: {
                          ...currentReport.displaySetup,
                          magnitudeUpdateFlag: Date.now(),
                        },
                      },
                      isRequest,
                    );
                  }}
                />
              </Fragment>
            )}
            {firstRightYaxis && (
              <Fragment>
                <div className="mBottom12 Bold textSecondary">{isDualAxes ? _l('辅助Y轴') : _l('数值(2)')}</div>
                <Unit
                  changeAllYaxis={true}
                  data={firstRightYaxis}
                  yaxisList={rightYaxisList}
                  onChangeYaxisList={(data, isRequest = false) => {
                    changeCurrentReport(
                      {
                        displaySetup: {
                          ...currentReport.displaySetup,
                          magnitudeUpdateFlag: Date.now(),
                        },
                        rightY: {
                          ...currentReport.rightY,
                          ...data,
                        },
                      },
                      isRequest,
                    );
                  }}
                />
              </Fragment>
            )}
            {[
              reportTypes.BarChart,
              reportTypes.LineChart,
              reportTypes.DualAxes,
              reportTypes.BidirectionalBarChart,
              reportTypes.PieChart,
              reportTypes.RadarChart,
              reportTypes.FunnelChart,
              reportTypes.ScatterChart,
            ].includes(reportType) && (
              <div className="mBottom15 mTop5">
                <div className="mBottom8">{_l('卡片内容')}</div>
                <Segmented
                  block
                  className="bgDisabled"
                  value={tooltipValueType}
                  options={[
                    { label: _l('原值'), value: 0 },
                    { label: _l('显示单位'), value: 1 },
                  ]}
                  onChange={value => onChangeStyle({ tooltipValueType: value })}
                />
              </div>
            )}
          </Fragment>
        ),
      };
}
