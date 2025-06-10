import React, { Component, Fragment } from 'react';
import { Checkbox, Collapse, Input, Radio, Select, Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { numberLevel, reportTypes, roundTypes } from 'statistics/Charts/common';
import { formatNumberFromInput } from 'src/utils/control';

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

    if (value) {
      count = _.isNumber(value) ? value : Number(formatNumberFromInput(value));
      count = count > 9 ? 9 : count;
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
      dot,
      suffix,
      fixType,
      controlType,
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
                className="chartSelect w100"
                value={magnitude}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={value => {
                  this.handleChangeMagnitude(value, data);
                }}
              >
                {numberLevel.map(item => (
                  <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                    {item.text}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="mBottom15">
              <div className="mBottom8">{_l('保留小数')}</div>
              <Input
                className="chartInput"
                value={sheetDot ? undefined : ydot}
                placeholder={sheetDot && _l('按工作表字段配置显示')}
                onChange={event => {
                  this.handleChangeYdot(event.target.value.replace(/-/g, ''), data);
                }}
                suffix={
                  <div className="flexColumn">
                    <Icon
                      icon="expand_less"
                      className="Gray_9e Font20 pointer mBottom2"
                      onClick={() => {
                        let newYdot = Number(ydot);
                        this.handleChangeYdot(newYdot + 1, data);
                      }}
                    />
                    <Icon
                      icon="expand_more"
                      className="Gray_9e Font20 pointer mTop2"
                      onClick={() => {
                        let newYdot = Number(ydot);
                        this.handleChangeYdot(newYdot ? newYdot - 1 : 0, data);
                      }}
                    />
                  </div>
                }
              />
              <Select
                className="chartSelect w100 mTop10"
                value={roundType}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={value => {
                  this.handleChangeYaxis('roundType', value, data);
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
                  arrowPointAtCenter
                >
                  <Icon className="Gray_9e Font18 pointer" icon="knowledge-message" />
                </Tooltip>
              </div>
            </div>
          </Fragment>
        )}
        <div className="mBottom15">
          <div className="mBottom8">{_l('单位')}</div>
          <div className="addonBeforeWrapper valignWrapper">
            <Select
              className="chartSelect"
              disabled={[0].includes(magnitude)}
              value={fixType || 0}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                this.handleChangeYaxis('fixType', value, data);
              }}
            >
              <Select.Option className="selectOptionWrapper" key={1} value={1}>
                {_l('前缀')}
              </Select.Option>
              <Select.Option className="selectOptionWrapper" key={0} value={0}>
                {_l('后缀')}
              </Select.Option>
            </Select>
            <Input
              className="chartInput flex"
              style={{ paddingLeft: 90 }}
              value={suffix}
              disabled={[0].includes(magnitude)}
              onChange={event => {
                this.handleChangeYaxis('suffix', event.target.value.slice(0, 10), data);
              }}
            />
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
                  <Input
                    className="chartInput"
                    value={percent.dot}
                    onChange={event => {
                      const count = Number(event.target.value.replace(/-/g, ''));
                      this.handleChangeYaxis(
                        'percent',
                        {
                          ...percent,
                          dot: count >= 9 ? 9 : count,
                        },
                        data,
                      );
                    }}
                    suffix={
                      <div className="flexColumn">
                        <Icon
                          icon="expand_less"
                          className="Gray_9e Font20 pointer mBottom2"
                          onClick={() => {
                            let newYdot = Number(percent.dot);
                            this.handleChangeYaxis(
                              'percent',
                              {
                                ...percent,
                                dot: newYdot >= 9 ? 9 : newYdot + 1,
                              },
                              data,
                            );
                          }}
                        />
                        <Icon
                          icon="expand_more"
                          className="Gray_9e Font20 pointer mTop2"
                          onClick={() => {
                            let newYdot = Number(percent.dot);
                            this.handleChangeYaxis(
                              'percent',
                              {
                                ...percent,
                                dot: newYdot ? newYdot - 1 : 0,
                              },
                              data,
                            );
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
                      this.handleChangeYaxis(
                        'percent',
                        {
                          ...percent,
                          roundType: value,
                        },
                        data,
                      );
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
                      arrowPointAtCenter
                    >
                      <Icon className="Gray_9e Font18 pointer" icon="knowledge-message" />
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
  const { currentReport, changeCurrentReport, onChangeStyle, ...collapseProps } = props;
  const { reportType, yaxisList, rightY, style } = currentReport;
  const isDualAxes = reportType === reportTypes.DualAxes;
  const rightYaxisList = rightY ? rightY.yaxisList : [];
  const firstYaxis = yaxisList[0];
  const firstRightYaxis = rightYaxisList[0];
  const { tooltipValueType = 0 } = style;
  return (
    <Fragment>
      {[reportTypes.PivotTable, reportTypes.NumberChart, reportTypes.TopChart].includes(reportType) ? (
        <Collapse.Panel header={_l('值')} key="pivotTableUnit" {...collapseProps}>
          {yaxisList
            .filter(data => data.normType !== 7)
            .map(item => (
              <Fragment>
                <div className="mBottom12 Bold Gray_75">{item.controlName}</div>
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
        </Collapse.Panel>
      ) : (
        <Collapse.Panel header={_l('值')} key="leftUnit" {...collapseProps}>
          {firstYaxis && (
            <Fragment>
              {isDualAxes && <div className="mBottom12 Bold Gray_75">{_l('Y轴')}</div>}
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
              <div className="mBottom12 Bold Gray_75">{isDualAxes ? _l('辅助Y轴') : _l('数值(2)')}</div>
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
              <div className="chartTypeSelect flexRow valignWrapper">
                <div
                  className={cx('flex centerAlign pointer Gray_75', { active: tooltipValueType === 0 })}
                  onClick={() => onChangeStyle({ tooltipValueType: 0 })}
                >
                  {_l('原值')}
                </div>
                <div
                  className={cx('flex centerAlign pointer Gray_75', { active: tooltipValueType === 1 })}
                  onClick={() => onChangeStyle({ tooltipValueType: 1 })}
                >
                  {_l('显示单位')}
                </div>
              </div>
            </div>
          )}
        </Collapse.Panel>
      )}
    </Fragment>
  );
}
