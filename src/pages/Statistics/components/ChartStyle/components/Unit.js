import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Collapse, Select, Input } from 'antd';
import { reportTypes, numberLevel } from 'statistics/Charts/common';
import styled from 'styled-components';
import _ from 'lodash';

const FixTypeWrapper = styled.div`
  position: relative;
  .ant-select {
    position: absolute;
    z-index: 1;
    border-right: 1px solid #d9d9d9;
  }
  .ant-select-selector {
    width: 80px !important;
    border: none !important;
    background-color: transparent !important;
    height: 28px !important;
    &:hover {
      border-color: #d9d9d9;
    }
  }
  .ant-select-arrow {
    right: 4px;
  }
  .ant-input {
    padding-left: 90px;
  }
`;

class Unit extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleChangeMagnitude = (value, current) => {
    const { yaxisList, onChangeYaxisList } = this.props;
    const data = _.cloneDeep(yaxisList).map(item => {
      if (item.controlId === current.controlId) {
        const { suffix } = _.find(numberLevel, { value });
        item.magnitude = value;
        item.suffix = suffix;
        if (value === 0) {
          item.ydot = 2;
        } else if (value === 1) {
          item.ydot = item.controlType === 10000001 ? 2 : (item.dot || 2);
        } else {
          item.ydot = 0;
        }
      }
      return item;
    });
    onChangeYaxisList({
      yaxisList: data,
    });
  };
  handleChangeYdot = (value, current) => {
    const { yaxisList, onChangeYaxisList } = this.props;
    let count = '';

    if (value) {
      count = parseInt(value);
      count = isNaN(count) ? 0 : count;
      count = count > 9 ? 9 : count;
    } else {
      count = 0;
    }

    const data = _.cloneDeep(yaxisList).map(item => {
      if (item.controlId === current.controlId) {
        item.ydot = item.magnitude ? count || 0 : count;
      }
      return item;
    });

    onChangeYaxisList({
      yaxisList: data,
    });
  };
  handleChangeSuffix = (value, current) => {
    const { yaxisList, onChangeYaxisList } = this.props;
    const data = _.cloneDeep(yaxisList).map(item => {
      if (item.controlId === current.controlId) {
        item.suffix = value;
      }
      return item;
    });
    onChangeYaxisList({
      yaxisList: data,
    });
  };
  handleChangeFixType = (value, current) => {
    const { yaxisList, onChangeYaxisList } = this.props;
    const data = _.cloneDeep(yaxisList).map(item => {
      if (item.controlId === current.controlId) {
        item.fixType = value;
      }
      return item;
    });
    onChangeYaxisList({
      yaxisList: data,
    });
  };
  render() {
    const { data, isPivotTable } = this.props;
    const { magnitude, ydot, dot, suffix, fixType, controlType } = data;
    const sheetDot = magnitude === 1 && controlType !== 10000001 && ydot === dot;
    return (
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
            {(isPivotTable ? numberLevel.filter(item => item.value) : numberLevel).map(item => (
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
              this.handleChangeYdot(event.target.value, data);
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
        </div>
        <div className="mBottom15">
          <div className="mBottom8">{_l('单位')}</div>
          <FixTypeWrapper className="valignWrapper">
            <Select
              className="chartSelect"
              disabled={[0].includes(magnitude)}
              value={fixType || 0}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                this.handleChangeFixType(value, data);
              }}
            >
              <Select.Option className="selectOptionWrapper" key={1} value={1}>{_l('前缀')}</Select.Option>
              <Select.Option className="selectOptionWrapper" key={0} value={0}>{_l('后缀')}</Select.Option>
            </Select>
            <Input
              className="chartInput flex"
              value={suffix}
              disabled={[0].includes(magnitude)}
              onChange={event => {
                this.handleChangeSuffix(event.target.value.slice(0, 10), data);
              }}
            />
          </FixTypeWrapper>
        </div>
      </Fragment>
    );
  }
}

export default function unitPanelGenerator(props) {
  const { currentReport, changeCurrentReport, ...collapseProps } = props;
  const { reportType, yaxisList, rightY } = currentReport;
  const isPivotTable = reportType === reportTypes.PivotTable;
  const isDualAxes = reportType === reportTypes.DualAxes;
  const isNumberChart = reportType === reportTypes.NumberChart;
  const rightYaxisList = rightY ? rightY.yaxisList : [];
  const firstYaxis = yaxisList[0];
  const firstRightYaxis = rightYaxisList[0];
  return (
    <Fragment>
      {isPivotTable || isNumberChart ? (
        <Collapse.Panel header={_l('显示单位')} key="pivotTableUnit" {...collapseProps}>
          {
            yaxisList.map(item => (
              <Fragment>
                <div className="mBottom12 Bold Gray_75">{item.controlName}</div>
                <Unit
                  data={item}
                  yaxisList={yaxisList}
                  onChangeYaxisList={data => {
                    changeCurrentReport({
                      ...data,
                      displaySetup: {
                        ...currentReport.displaySetup,
                        magnitudeUpdateFlag: Date.now(),
                      },
                    });
                  }}
                />
              </Fragment>
            ))
          }
        </Collapse.Panel>
      ) : (
        <Collapse.Panel header={_l('显示单位')} key="leftUnit" {...collapseProps}>
          {firstYaxis && (
            <Fragment>
              {isDualAxes && <div className="mBottom12 Bold Gray_75">{_l('Y轴')}</div>}
              <Unit
                data={firstYaxis}
                yaxisList={yaxisList}
                onChangeYaxisList={data => {
                  changeCurrentReport({
                    ...data,
                    displaySetup: {
                      ...currentReport.displaySetup,
                      magnitudeUpdateFlag: Date.now(),
                    },
                  });
                }}
              />
            </Fragment>
          )}
          {firstRightYaxis && (
            <Fragment>
              <div className="mBottom12 Bold Gray_75">{isDualAxes ? _l('辅助Y轴') : _l('数值(2)')}</div>
              <Unit
                data={firstRightYaxis}
                yaxisList={rightYaxisList}
                onChangeYaxisList={data => {
                  changeCurrentReport({
                    displaySetup: {
                      ...currentReport.displaySetup,
                      magnitudeUpdateFlag: Date.now(),
                    },
                    rightY: {
                      ...currentReport.rightY,
                      ...data,
                    },
                  });
                }}
              />
            </Fragment>
          )}
        </Collapse.Panel>
      )}
    </Fragment>
  );
}
