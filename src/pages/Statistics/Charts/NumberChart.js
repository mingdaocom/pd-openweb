import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import Icon from 'ming-ui/components/Icon';
import { Tooltip, Row, Col } from 'antd';
import { formatContrastTypes, isFormatNumber } from '../common';
import { defaultNumberChartStyle, sizeTypes } from 'statistics/components/ChartStyle/components/NumberStyle';
import { formatrChartValue, getStyleColor } from './common';
import SvgIcon from 'src/components/SvgIcon';
import { toFixed, browserIsMobile } from 'src/util';
import _ from 'lodash';

const isMobile = browserIsMobile();

const Wrap = styled.div`
  justify-content: center;
  &.verticalAlign-top {
    align-items: flex-start;
    overflow-y: auto;
    overflow-x: hidden;
  }
  &.verticalAlign-center {
    align-items: center;
    overflow-y: hidden;
    overflow-x: hidden;
  }
  .wrap-center, .wrap-left {
    overflow: hidden;
    border-radius: 12px;
    transition: background-color 0.2s;
    &.oneNumber {
      padding-left: 0;
      padding-right: 0;
    }
    &.hover:hover {
      cursor: pointer;
      background-color: #f5f5f5;
    }
  }
  .wrap-center {
    padding: 30px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .svgIconWrap {
      margin-bottom: 12px;
    }
  }
  .wrap-left {
    padding: 30px 24px;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    .svgIconWrap {
      margin-right: 16px;
      margin-top: 10px;
    }
  }
  .svgIconWrap {
    width: 60px;
    height: 60px;
    &.square {
      border-radius: 6px;
    }
    &.circle {
      border-radius: 50%;
    }
    &.svgIconSize28 {
      width: 60px;
      height: 60px;
      svg {
        transform: scale(1);
      }
    }
    &.svgIconSize42 {
      width: 70px;
      height: 70px;
      svg {
        transform: scale(1.2);
      }
    }
    &.svgIconSize80 {
      width: 80px;
      height: 80px;
      svg {
        transform: scale(1.4);
      }
    }
    &.svgIconSize120 {
      width: 90px;
      height: 90px;
      svg {
        transform: scale(1.6);
      }
    }
  }
  .ant-row {
    width: 100%;
  }
  .ant-col {
    position: relative;
    &:nth-child(${props => props.columnCount}n)::after {
      display: none;
    }
    &:last-child::after {
      display: none;
    }
    &::after {
      content: '';
      height: 70%;
      width: 1px;
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      background-color: #EAEAEA;
    }
  }
`;

const NumberChartContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .contentWrapper {
    width: 100%;
    min-height: 20px;
    display: flex;
  }
  &.numberChartAlign-center, &.numberChartAlign-left {
    min-width: 0;
  }
  &.numberChartAlign-center {
    max-width: 100%;
    .name {
      text-align: center;
    }
    .textWrap {
      align-items: center;
      justify-content: center;
    }
  }
  &.numberChartAlign-left {
    .textWrap {
      align-items: flex-start;
      justify-content: flex-start;
    }
  }
  .subTextWrap>.w100:first-of-type {
    margin-top: 8px;
  }
  .contrastWrap, .minorWrap {
    margin-bottom: 4px;
    align-items: center !important;
  }
  .count {
    font-size: ${props => props.fontSize}px !important;
    line-height: ${props => props.fontSize}px !important;
    width: 100%;
    color: #333;
    font-weight: 500;
    font-family: system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  }
`;

const getMap = (map, contrast, contrastMap) => {
  if (map.length) return map;
  if (contrast.length) return contrast;
  if (contrastMap.length) return contrastMap;
  return [];
}

const formatData = (map, contrast, contrastMap, displaySetup, yaxisList) => {
  const result = [];
  const data = fillMap(map, contrast, contrastMap);
  const isHide = yaxisList.length === 1 && yaxisList[0].emptyShowType === 0;
  data.forEach((item, index) => {
    if (index) {
      item.value.forEach((n, i) => {
        const minorList = result[i].minorList || [];
        const control = _.find(yaxisList, { controlId: item.c_id }) || {};
        result[i].minorList = minorList.concat({ name: control.rename || control.controlName, value: n.v || 0, controlId: item.c_id });
      });
    } else {
      const contrastList = _.get(contrast[index], 'value') || [];
      const contrastMapList = _.get(contrastMap[index], 'value') || [];
      item.value.forEach(n => {
        result.push({
          originalId: n.originalX,
          name: n.x || _l('空'),
          value: n.v || 0,
          lastContrastValue: _.get(_.find(contrastList, { originalX: n.originalX }), 'v') || (displaySetup.contrast ? 0 : null),
          contrastValue: _.get(_.find(contrastMapList, { originalX: n.originalX }), 'v') || (displaySetup.contrastType ? 0 : null)
        });
      });
    }
  });
  return result.filter(data => {
    if (isHide && !data.value && !data.contrastValue && !data.lastContrastValue) {
      return false;
    } else {
      return true;
    }
  });
}

const fillMap = (map, contrast, contrastMap) => {
  if (map.length) {
    return map;
  } else {
    const mapData = getMap(map, contrast, contrastMap);
    return mapData.map(data => {
      const { value = [] } = data;
      return {
        ...data,
        value: value.map(data => {
          return { ...data, v: 0 }
        })
      }
    });
  }
}

const getControlMinAndMax = map => {
  const result = {};
  map.forEach(item => {
    const values = item.value.map(n => n.v);
    const min = _.min(values) || 0;
    const max = _.max(values) || 0;
    result[item.c_id] = {
      min,
      max,
      center: (max + min) / 2
    }
  });
  return result;
}


export default class extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { sourceType, isThumbnail } = this.props;
    const { reportId, xaxes, yaxisList, style, displaySetup } = this.props.reportData;
    const el = document.querySelector(`.statisticsCard-${reportId}`);
    const parentElement = _.get(el, 'parentElement.parentElement');
    if (yaxisList.length === 1 && !xaxes.controlId && sourceType && isThumbnail && !isMobile) {
      if (parentElement) {
        el.classList.add('hideNumberChartName');
        el.classList.add('hideChartHeader');
        parentElement.classList.add('numberChartCardHover');
      }
    } else {
      if (parentElement && displaySetup.showTitle) {
        el.classList.remove('hideNumberChartName');
        el.classList.remove('hideChartHeader');
        parentElement.classList.remove('numberChartCardHover');
      }
    }
  }
  getControlName = id => {
    const { yaxisList } = this.props.reportData;
    const control = _.find(yaxisList, { controlId: id }) || {};
    return control.rename || control.controlName;
  }
  handleOpenSheet = ({ originalId }) => {
    const { reportData, isViewOriginalData, isThumbnail } = this.props;
    const { xaxes, displaySetup } = reportData;
    if (displaySetup.showRowList && isViewOriginalData) {
      const param = {};
      if (xaxes.cid) {
        const isNumber = isFormatNumber(xaxes.controlType);
        param[xaxes.cid] = isNumber && originalId ? Number(originalId) : originalId;
      }
      const data = {
        isPersonal: false,
        match: param
      }
      if (isThumbnail) {
        this.props.onOpenChartDialog(data);
      } else {
        this.props.requestOriginalData(data);
      }
    }
  }
  renderContrast(value, contrastValue, name) {
    const { filter, displaySetup = {}, style } = this.props.reportData;
    const { rangeType, rangeValue } = filter;
    const percentage = ((value - contrastValue) / contrastValue) * 100;
    const positiveNumber = percentage >= 0;
    const { numberChartStyle = {} } = style;
    const { contrastValueShowType, contrastValueDot = 2 } = numberChartStyle;
    const contrastColor = _.isUndefined(numberChartStyle.contrastColor) ? style.contrastColor : numberChartStyle.contrastColor;
    const isEquality = value && contrastValue ? value === contrastValue : false;
    const { text: tipsText } = formatContrastTypes({ rangeType, rangeValue }).filter(item => item.value === displaySetup.contrastType)[0] || {};

    if (!_.isNumber(contrastValue)) {
      return null;
    }

    return (
      <div className="w100 flexRow textWrap contrastWrap Font14">
        <div className="mRight5 Gray_75">{name}</div>
        {
          contrastValue && percentage ? (
            //<Tooltip title={tipsText} overlayInnerStyle={{ textAlign: 'center' }}>
              <div className={`tip-top ${positiveNumber ? (contrastColor ? 'Red' : 'DepGreen') : (contrastColor ? 'DepGreen' : 'Red')}`}>
                <div className="valignWrapper">
                  {isEquality ? null : <Icon className="mRight3" icon={`${positiveNumber ? 'worksheet_rise' : 'worksheet_fall'}`} />}
                  <span className={cx('bold', { Gray_75: isEquality })}>{contrastValueShowType ? contrastValue : `${Math.abs(toFixed(percentage, contrastValueDot))}%`}</span>
                </div>
              </div>
            //</Tooltip>
          ) : (
            <span className="Gray range">- -</span>
          )
        }
      </div>
    );
  }
  renderMapItem(data, controlMinAndMax, span) {
    const { isViewOriginalData, reportData } = this.props;
    const { xaxes, yaxisList, style, filter, displaySetup, desc } = reportData;
    const { controlId, name, value, lastContrastValue, contrastValue, minorList = [], descVisible } = data;
    const newYaxisList = yaxisList.map(data => {
      return {
        ...data,
        emptyShowType: data.emptyShowType === 0 ? 1 : data.emptyShowType
      }
    });
    const hideVisible = xaxes.controlId && yaxisList.length === 1;
    const formatrValue = formatrChartValue(value, false, hideVisible ? yaxisList : newYaxisList, controlId);
    const { numberChartStyle = defaultNumberChartStyle } = style;
    const { iconVisible, textAlign, icon, iconColor, shape, fontSize, fontColor, lastContrastText, contrastText } = numberChartStyle;
    const titleFontSize = _.get(_.find(sizeTypes, { value: fontSize }), 'titleValue') || 15;
    const contrastTypes = formatContrastTypes(filter);
    const oneNumber = !xaxes.controlId && yaxisList.length === 1;
    const rule = _.get(displaySetup.colorRules[0], 'dataBarRule') || {};
    const color = !_.isEmpty(rule) && xaxes.controlId ? getStyleColor({
      value,
      controlMinAndMax,
      rule,
      controlId: yaxisList[0].controlId
    }) : fontColor;
    return (
      <Col span={span} onClick={() => !oneNumber ? this.handleOpenSheet(data) : _.noop()}>
        <div className={cx(`wrap-${textAlign}`, { oneNumber, hover: !oneNumber && displaySetup.showRowList && isViewOriginalData })}>
          {iconVisible && oneNumber && (
            <div className={cx('svgIconWrap valignWrapper justifyContentCenter', shape, `svgIconSize${fontSize}`)} style={{ backgroundColor: iconColor }}>
              <SvgIcon url={`${md.global.FileStoreConfig.pubHost}/customIcon/${icon}.svg`} fill="#fff" size={32} />
            </div>
          )}
          <NumberChartContent
            className={cx('flex', `numberChartAlign-${textAlign}`)}
            fontSize={fontSize}
          >
            <Tooltip title={value.toLocaleString() == formatrValue ? null : value.toLocaleString()} overlayInnerStyle={{ textAlign: 'center' }}>
              <div className="contentWrapper textWrap flexColumn tip-top">
                {name && (
                  <div className="flexRow valignWrapper w100 mBottom2">
                    <div className="flex ellipsis name" style={{ fontSize: titleFontSize }}>{name}</div>
                    {descVisible && desc && (
                      <Tooltip title={desc} placement="bottom">
                        <Icon
                          icon="info"
                          className="Font18 pointer Gray_9e mLeft7 mRight7 InlineBlock mTop2"
                        /> 
                      </Tooltip>
                    )}
                  </div>
                )}
                <div className="flexRow">
                  <div
                    className="ellipsis count"
                    style={{ color }}
                  >
                    {formatrValue}
                  </div>
                </div>
              </div>
            </Tooltip>
            <div className="w100 subTextWrap">
              {this.renderContrast(value, lastContrastValue, lastContrastText || _l('环比'))}
              {!!contrastTypes.length && this.renderContrast(value, contrastValue, contrastText || _l('同比'))}
              {minorList.map(data => (
                <div className="w100 flexRow textWrap minorWrap Font14">
                  <div className="mRight5 Gray_75">{data.name}</div>
                  <div>{formatrChartValue(data.value, false, newYaxisList, data.controlId)}</div>
                </div>
              ))}
            </div>
          </NumberChartContent>
        </div>
      </Col>
    );
  }
  render() {
    const { mobileCount = 1, layoutType, reportData, sourceType, isThumbnail } = this.props;
    const { name, xaxes, map, contrast = [], contrastMap = [], displaySetup = {}, summary, yaxisList, style } = reportData;
    const { numberChartStyle = {} } = style;
    const list = xaxes.controlId ? formatData(map, contrast, contrastMap, displaySetup, yaxisList) : fillMap(map, contrast, contrastMap);
    const totalIsHide = yaxisList.length === 1 && yaxisList[0].emptyShowType === 0 && !summary.sum;
    const oneNumber = !xaxes.controlId && yaxisList.length === 1;
    const defaultColumnCount = oneNumber ? 1 : (numberChartStyle.columnCount || 4);
    const columnCount = (isMobile || layoutType === 'mobile') ? mobileCount : defaultColumnCount;
    const showTotal = displaySetup.showTotal && xaxes.controlId;
    const count = list.length + (showTotal ? 1 : 0);
    const span = Math.ceil(24 / columnCount);
    const controlMinAndMax = getControlMinAndMax(map);
    return (
      <Wrap
        className={cx('flexRow h100', `verticalAlign-${numberChartStyle.allowScroll ? 'top' : 'center'}`)}
        columnCount={columnCount}
        onClick={() => oneNumber ? this.handleOpenSheet({}) : _.noop()}
      >
        <Row gutter={[8, 0]}>
          {showTotal && !!list.length && !totalIsHide && (
            this.renderMapItem({
              value: summary.sum,
              name: summary.name,
              lastContrastValue: displaySetup.contrast ? summary.contrastSum || 0 : null,
              contrastValue: displaySetup.contrastType ? summary.contrastMapSum || 0 : null
            }, controlMinAndMax, span)
          )}
          {xaxes.controlId ? (
            list.map(data => (
              this.renderMapItem(data, controlMinAndMax, span)
            ))
          ) : (
            list.map((data, index) => (
              this.renderMapItem({
                controlId: data.c_id,
                value: _.get(data, 'value[0].v') || 0,
                name: isMobile ? (list.length === 1 ? null : this.getControlName(data.c_id)) : (sourceType && list.length === 1) ? name : this.getControlName(data.c_id),
                descVisible: !isMobile && sourceType && list.length === 1,
                lastContrastValue: _.get(contrast[index], 'value[0].v') || (displaySetup.contrast ? 0 : null),
                contrastValue: _.get(contrastMap[index], 'value[0].v') || (displaySetup.contrastType ? 0 : null)
              }, controlMinAndMax, span)
            ))
          )}
          {!list.length && this.renderMapItem({
            value: 0,
            name: isMobile ? null : name,
            descVisible: sourceType,
          }, controlMinAndMax, 24)}
        </Row>
      </Wrap>
    );
  }
}
