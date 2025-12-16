import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { reportTypes } from '../../Charts/common';

export default class HeaderDisplaySetup extends Component {
  constructor(props) {
    super(props);
  }
  setDefaultValue = reportType => {
    const { displaySetup } = this.props;
    let newData = null;
    if (reportType === reportTypes.BarChart) {
      newData = {
        ...displaySetup,
        isPile: false,
        isPerPile: false,
      };
    }
    if (reportType === reportTypes.LineChart) {
      newData = {
        ...displaySetup,
        isPile: false,
        isAccumulate: false,
        accumulatePerPile: false,
        isPerPile: false,
      };
    }
    if (reportType === reportTypes.FunnelChart) {
      newData = {
        ...displaySetup,
        isAccumulate: false,
      };
    }
    this.props.onUpdateDisplaySetup(newData, 'default');
  };
  getDefaultValue(reportType) {
    const { displaySetup } = this.props;
    if (reportType === reportTypes.BarChart) {
      if (displaySetup.isPile || displaySetup.isPerPile) {
        return false;
      } else {
        return true;
      }
    }
    if (reportType === reportTypes.LineChart) {
      if (
        displaySetup.isPile ||
        displaySetup.isAccumulate ||
        displaySetup.accumulatePerPile ||
        displaySetup.isPerPile
      ) {
        return false;
      } else {
        return true;
      }
    }
    if (reportType === reportTypes.FunnelChart) {
      if (displaySetup.isAccumulate) {
        return false;
      } else {
        return true;
      }
    }
  }
  handleCheck(name, checked) {
    const { displaySetup } = this.props;
    let newData = null;
    if (name === 'isPile' || name === 'isPerPile') {
      newData = {
        ...displaySetup,
        isPile: name === 'isPile' ? !checked : false,
        isPerPile: name === 'isPerPile' ? !checked : false,
      };
    } else if (name === 'isAccumulate' || name === 'accumulatePerPile') {
      newData = {
        ...displaySetup,
        isAccumulate: name === 'isAccumulate' ? !checked : false,
        accumulatePerPile: name === 'accumulatePerPile' ? !checked : false,
      };
    } else {
      newData = {
        ...displaySetup,
        [name]: !checked,
      };
    }
    this.props.onUpdateDisplaySetup(newData, name);
  }
  render() {
    const { displaySetup, mapKeys, reportType, chartType, title } = this.props;
    const isPile = [reportTypes.LineChart, reportTypes.BarChart].includes(reportType) && mapKeys.length >= 2;
    const isPerPile =
      (reportType === reportTypes.BarChart ||
        (reportType === reportTypes.LineChart && displaySetup.showChartType === 2)) &&
      mapKeys.length >= 2;
    const isAccumulate = reportTypes.LineChart === reportType;
    const isHide = !isPile && !isPerPile && !isAccumulate;
    return (
      <Fragment>
        {title && !isHide && <div className="mRight10">{title}</div>}
        <div className={cx('displaySetup flexRow valignWrapper', { hide: isHide })}>
          {!isHide && (
            <div
              className={cx('item', { active: this.getDefaultValue(reportType) })}
              onClick={() => {
                this.setDefaultValue(reportType);
              }}
            >
              {_l('默认')}
            </div>
          )}
          {isPile && (
            <div
              className={cx('item', { active: displaySetup.isPile })}
              onClick={this.handleCheck.bind(this, 'isPile', displaySetup.isPile)}
            >
              {_l('堆叠')}
            </div>
          )}
          {isPerPile && reportTypes.DualAxes !== chartType && (
            <div
              className={cx('item', { active: displaySetup.isPerPile })}
              onClick={this.handleCheck.bind(this, 'isPerPile', displaySetup.isPerPile)}
            >
              {_l('百分比')}
            </div>
          )}
          {isAccumulate && (
            <div
              className={cx('item', { active: displaySetup.isAccumulate })}
              onClick={this.handleCheck.bind(this, 'isAccumulate', displaySetup.isAccumulate)}
            >
              {_l('累计')}
            </div>
          )}
          {isAccumulate && (
            <div
              className={cx('item', { active: displaySetup.accumulatePerPile })}
              onClick={this.handleCheck.bind(this, 'accumulatePerPile', displaySetup.accumulatePerPile)}
            >
              {_l('累计百分比')}
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}
