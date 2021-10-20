import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import Icon from 'ming-ui/components/Icon';
import { Tooltip } from 'antd';
import { formatContrastTypes, getPerfectFontSize } from '../common';
import { formatrChartValue } from './common';

const NumberChartContent = styled.div`
  padding: 0 15px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .content-wrapper {
    width: 100%;
    min-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .count {
    font-size: ${props => props.fontSize}px !important;
    width: 100%;
    color: #333;
    font-weight: 500;
    font-family: system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  }
  .range {
    font-size: ${props => 0.5 * props.fontSize}px !important;
  }
`;


export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fontSize: 1
    }
  }
  wrapper = React.createRef();
  componentDidMount() {
    const { number, yaxisList, style } = this.props.reportData;
    const formatrValue = formatrChartValue(number, false, yaxisList, null, false);
    const unit = yaxisList.length ? yaxisList[0].suffix : null;
    const level = style ? style.fontSize : 0;
    const levels = [36, 48, 60];
    const fontSize = getPerfectFontSize(this.wrapper.current, formatrValue, level) / 1.2;
    this.setState({
      fontSize: fontSize > levels[level] ? levels[level] : fontSize
    });
  }
  render() {
    const { contrastNumber, number, rangeType, rangeValue, displaySetup, yaxisList } = this.props.reportData;
    const newContrastNumber = typeof contrastNumber === 'number' ? contrastNumber : 0;
    const percentage = ((number - newContrastNumber) / newContrastNumber) * 100;
    const positiveNumber = percentage >= 0;
    const { text: tipsText } = formatContrastTypes({ rangeType, rangeValue }).filter(item => item.value === displaySetup.contrastType)[0] || {};
    const isEquality = number && contrastNumber ? number === contrastNumber : false;
    const formatrValue = formatrChartValue(number, false, yaxisList, null, false);
    const { fontSize } = this.state;
    return (
        <NumberChartContent className="h100" fontSize={fontSize}>
          <Tooltip title={number.toLocaleString() == formatrValue ? null : number.toLocaleString()}>
            <div ref={this.wrapper} className="content-wrapper tip-top">
              <div className="flexRow valignWrapper">
                <div className="ellipsis count">{formatrValue}</div>
              </div>
            </div>
          </Tooltip>
          {number && newContrastNumber && percentage ? (
            <Tooltip title={tipsText}>
              <div className={`tip-top ${positiveNumber ? 'DepGreen' : 'Red'}`}>
                <div className="valignWrapper range">
                  {isEquality ? null : <Icon className="mRight3" icon={`${positiveNumber ? 'worksheet_rise' : 'worksheet_fall'}`} />}
                  <span className={cx({ Gray_75: isEquality })}>{`${Math.abs(percentage.toFixed(2))}%`}</span>
                </div>
              </div>
            </Tooltip>
          ) : (
            displaySetup.contrastType && rangeType ? <span className="Gray_9e range">- -</span> : null
          )}
        </NumberChartContent>
    );
  }
}
