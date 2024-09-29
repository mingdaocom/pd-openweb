import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Tooltip, Row, Col, Dropdown, Menu } from 'antd';
import { formatContrastTypes, isFormatNumber, isTimeControl } from '../common';
import { defaultNumberChartStyle, sizeTypes } from 'statistics/components/ChartStyle/components/NumberStyle';
import { formatrChartValue, getStyleColor } from './common';
import { SvgIcon, Icon } from 'ming-ui';
import { toFixed, browserIsMobile } from 'src/util';
import { generate } from '@ant-design/colors';
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
    padding: 20px 8px;
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
  .ant-col-5 {
    flex: 0 0 20%;
    max-width: 20%;
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

const formatData = ({ map, contrast, contrastMap, displaySetup, yaxisList, isTime }) => {
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
      item.value.forEach((n, index) => {
        const contrastData = {};
        if (isTime) {
          contrastData.lastContrastValue = _.get(contrastList[index], 'v') || (displaySetup.contrast ? 0 : null);
          contrastData.contrastValue = _.get(contrastMapList[index], 'v') || (displaySetup.contrastType ? 0 : null);
        } else {
          contrastData.lastContrastValue = _.get(_.find(contrastList, { originalX: n.originalX }), 'v') || (displaySetup.contrast ? 0 : null);
          contrastData.contrastValue = _.get(_.find(contrastMapList, { originalX: n.originalX }), 'v') || (displaySetup.contrastType ? 0 : null);
        }
        result.push({
          originalId: n.originalX,
          name: n.x || _l('空'),
          value: n.v || 0,
          ...contrastData,
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

export const replaceColor = (data, customPageConfig = {}, themeColor) => {
  const { numberChartColor, numberChartColorIndex = 1 } = customPageConfig;
  if (numberChartColor && numberChartColorIndex >= (data.numberChartColorIndex || 0)) {
    return {
      ...data,
      fontColor: numberChartColor,
      // iconColor: numberChartColor,
    }
  }
  data = _.clone(data);
  if (data.fontColor === 'DARK_COLOR') {
    data.fontColor = themeColor;
  }
  if (data.fontColor === 'LIGHT_COLOR') {
    data.fontColor = generate(themeColor)[0];
  }
  if (data.iconColor === 'DARK_COLOR') {
    data.iconColor = themeColor;
  }
  if (data.iconColor === 'LIGHT_COLOR') {
    data.iconColor = generate(themeColor)[0];
  }
  return data;
}

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownVisible: false,
      offset: {},
      param: null,
      linkageMatch: null,
      isLinkageMatch: false
    }
  }
  componentDidMount() {
    const { sourceType, isThumbnail } = this.props;
    const { reportId, xaxes, yaxisList, displaySetup } = this.props.reportData;
    const el = document.querySelector(`.statisticsCard-${reportId}`);
    const parentElement = _.get(el, 'parentElement.parentElement');
    const filterCriteriaIcon = el && el.querySelector('.filterCriteriaIcon');
    if (yaxisList.length === 1 && !xaxes.controlId && sourceType && isThumbnail && !isMobile) {
      if (parentElement) {
        el.classList.add('hideNumberChartName');
        el.classList.add('hideChartHeader');
        filterCriteriaIcon && filterCriteriaIcon.classList.add('tip-bottom-right');
      }
    } else {
      if (parentElement && displaySetup.showTitle) {
        el.classList.remove('hideNumberChartName');
        el.classList.remove('hideChartHeader');
        filterCriteriaIcon && filterCriteriaIcon.classList.remove('tip-bottom-right');
      }
    }
  }
  getParentNode() {
    const { isThumbnail, reportData } = this.props;
    const { reportId } = reportData;
    return isThumbnail ? document.querySelector(isMobile ? `.statisticsCard-${reportId}` : `.statisticsCard-${reportId} .content`) : document.querySelector(`.ChartDialog .chart .flex`);
  }
  getControlName = id => {
    const { yaxisList } = this.props.reportData;
    const control = _.find(yaxisList, { controlId: id }) || {};
    return control.rename || control.controlName;
  }
  handleClick = (event, data = {}) => {
    const { xaxes, appId, reportId, name, reportType, style, displaySetup, map } = this.props.reportData;
    const param = {};
    const linkageMatch = {
      sheetId: appId,
      reportId,
      reportName: name,
      reportType,
      filters: []
    };
    this.isViewOriginalData = displaySetup.showRowList && this.props.isViewOriginalData;
    this.isLinkageData = this.props.isLinkageData && !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) && xaxes.controlId;
    if (data.isTotal || _.isEmpty(map)) {
      return;
    }
    if (xaxes.cid) {
      const { originalId } = data;
      const isNumber = isFormatNumber(xaxes.controlType);
      param[xaxes.cid] = isNumber && originalId ? Number(originalId) : originalId;
      linkageMatch.value = originalId;
      linkageMatch.filters.push({
        controlId: xaxes.controlId,
        values: [param[xaxes.cid]],
        controlName: xaxes.controlName,
        controlValue: data.name,
        type: xaxes.controlType,
        control: xaxes
      });
    }
    if (_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length) {
      linkageMatch.onlyChartIds = style.autoLinkageChartObjectIds;
    }
    const isAll = this.isViewOriginalData && this.isLinkageData;
    const { x, y } = this.getParentNode().getBoundingClientRect();
    this.setState({
      dropdownVisible: isAll,
      offset: {
        x: event.pageX - x + 20,
        y: event.pageY - y
      },
      match: param,
      linkageMatch
    }, () => {
      if (!isAll && this.isViewOriginalData) {
        this.handleRequestOriginalData();
      }
      if (!isAll && this.isLinkageData) {
        this.handleAutoLinkage();
      }
    });
  }
  handleRequestOriginalData = () => {
    const { isThumbnail } = this.props;
    const { match } = this.state;
    const data = {
      isPersonal: false,
      match
    }
    this.setState({ dropdownVisible: false });
    if (isThumbnail) {
      this.props.onOpenChartDialog(data);
    } else {
      this.props.requestOriginalData(data);
    }
  }
  handleAutoLinkage = () => {
    const { linkageMatch } = this.state;
    this.props.onUpdateLinkageFiltersGroup(linkageMatch);
    this.setState({
      dropdownVisible: false,
      isLinkageMatch: true
    });
  }
  renderContrast(value, contrastValue, name, isContrastValue) {
    const { filter, displaySetup = {}, style, yaxisList } = this.props.reportData;
    const { rangeType, rangeValue } = filter;
    const percentage = ((value - contrastValue) / contrastValue) * 100;
    const positiveNumber = percentage >= 0;
    const { numberChartStyle = {} } = style;
    const { contrastValueShowPercent = true, contrastValueShowNumber = false, contrastValueDot = 2 } = numberChartStyle;
    const contrastColor = _.isUndefined(numberChartStyle.contrastColor) ? style.contrastColor : numberChartStyle.contrastColor;
    const isEquality = value && contrastValue ? value === contrastValue : false;
    const { text: tipsText } = formatContrastTypes(filter).filter(item => item.value === displaySetup.contrastType)[0] || {};

    if (!_.isNumber(contrastValue)) {
      return null;
    }

    return (
      <div className="w100 flexRow textWrap contrastWrap Font14">
        <div className="mRight5 Gray_75">
          {name}
          {isContrastValue && ` (${tipsText})`}
        </div>
        {
          contrastValue && percentage ? (
            <Tooltip title={contrastValue} overlayInnerStyle={{ textAlign: 'center' }}>
              <div className={`tip-top ${positiveNumber ? (contrastColor ? 'Red' : 'DepGreen') : (contrastColor ? 'DepGreen' : 'Red')}`}>
                <div className="valignWrapper">
                  {isEquality ? null : <Icon className="mRight3" icon={`${positiveNumber ? 'worksheet_rise' : 'worksheet_fall'}`} />}
                  {contrastValueShowPercent && (
                    <span className={cx('bold mRight5', { Gray_75: isEquality })}>
                      {`${toFixed(Math.abs(percentage), contrastValueDot)}%`}
                    </span>
                  )}
                  {contrastValueShowNumber && (
                    <span className={cx('bold', { Gray_75: isEquality })}>
                      {contrastValueShowPercent ? `(${formatrChartValue(value - contrastValue, false, yaxisList)})` : formatrChartValue(value - contrastValue, false, yaxisList)}
                    </span>
                  )}
                </div>
              </div>
            </Tooltip>
          ) : (
            <span className="Gray range">- -</span>
          )
        }
      </div>
    );
  }
  renderMapItem(data, controlMinAndMax, span) {
    const { isLinkageMatch } = this.state;
    const { linkageMatch, isViewOriginalData, reportData, themeColor, customPageConfig = {}, layoutType } = this.props;
    const mobileFontSize = (isMobile || layoutType === 'mobile') ? this.props.mobileFontSize : 0;
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
    const { iconVisible, textAlign, icon, iconColor, shape, fontSize, fontColor, lastContrastText, contrastText } = replaceColor(numberChartStyle, customPageConfig, themeColor);
    const newFontSize = mobileFontSize || fontSize;
    const titleFontSize = mobileFontSize ? mobileFontSize - 5 : _.get(_.find(sizeTypes, { value: fontSize }), 'titleValue') || 15;
    const contrastTypes = formatContrastTypes(filter);
    const oneNumber = !xaxes.controlId && yaxisList.length === 1;
    const rule = _.get(displaySetup.colorRules[0], 'dataBarRule') || {};
    const color = !_.isEmpty(rule) ? getStyleColor({
      value: rule.controlId ? (_.get(_.find(minorList, { controlId: rule.controlId }), 'value') || value) : value,
      controlMinAndMax,
      rule,
      controlId: rule.controlId || yaxisList[0].controlId
    }) : fontColor;
    const isOpacity = !_.isEmpty(linkageMatch) && isLinkageMatch ? linkageMatch.value !== data.originalId : false;
    return (
      <Col span={span} onClick={event => !oneNumber ? this.handleClick(event, data) : _.noop()}>
        <div style={{ opacity: isOpacity ? 0.3 : undefined }} className={cx(`wrap-${textAlign}`, { oneNumber, hover: !oneNumber && displaySetup.showRowList && isViewOriginalData })}>
          {iconVisible && oneNumber && (
            <div className={cx('svgIconWrap valignWrapper justifyContentCenter', shape, `svgIconSize${newFontSize}`)} style={{ backgroundColor: iconColor }}>
              <SvgIcon url={`${md.global.FileStoreConfig.pubHost}customIcon/${icon}.svg`} fill="#fff" size={32} />
            </div>
          )}
          <NumberChartContent
            className={cx('flex', `numberChartAlign-${textAlign}`)}
            fontSize={newFontSize}
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
              {!!contrastTypes.length && this.renderContrast(value, contrastValue, contrastText || _l('同比'), true)}
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
  renderOverlay() {
    return (
      <Menu className="chartMenu" style={{ width: 160 }}>
        <Menu.Item onClick={this.handleAutoLinkage} key="autoLinkage">
          <div className="flexRow valignWrapper">
            <Icon icon="link1" className="mRight8 Gray_9e Font20 autoLinkageIcon" />
            <span>{_l('联动')}</span>
          </div>
        </Menu.Item>
        <Menu.Item onClick={this.handleRequestOriginalData} key="viewOriginalData">
          <div className="flexRow valignWrapper">
            <Icon icon="table" className="mRight8 Gray_9e Font18" />
            <span>{_l('查看原始数据')}</span>
          </div>
        </Menu.Item>
      </Menu>
    );
  }
  render() {
    const { mobileCount = 1, layoutType, reportData, sourceType, isThumbnail } = this.props;
    const { name, xaxes, map, contrast = [], contrastMap = [], displaySetup = {}, summary, yaxisList, style } = reportData;
    const { numberChartStyle = {} } = style;
    const { dropdownVisible, offset } = this.state;
    const isTime = isTimeControl(xaxes.controlType);
    const list = xaxes.controlId ? formatData({ map, contrast, contrastMap, displaySetup, yaxisList, isTime }) : fillMap(map, contrast, contrastMap);
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
        onClick={(event) => oneNumber ? this.handleClick(event, list[0]) : _.noop()}
      >
        <Row gutter={[8, 0]}>
          {showTotal && !!list.length && !totalIsHide && (
            this.renderMapItem({
              value: summary.sum,
              name: summary.name,
              lastContrastValue: displaySetup.contrast ? summary.contrastSum || 0 : null,
              contrastValue: displaySetup.contrastType ? summary.contrastMapSum || 0 : null,
              isTotal: true
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
            lastContrastValue: displaySetup.contrast ? 0 : null,
            contrastValue: displaySetup.contrastType ? 0 : null
          }, controlMinAndMax, 24)}
        </Row>
        <Dropdown
          visible={dropdownVisible}
          onVisibleChange={(dropdownVisible) => {
            this.setState({ dropdownVisible });
          }}
          trigger={['click']}
          placement="bottomLeft"
          overlay={this.renderOverlay()}
        >
          <div className="Absolute" style={{ left: offset.x, top: offset.y }}></div>
        </Dropdown>
      </Wrap>
    );
  }
}
