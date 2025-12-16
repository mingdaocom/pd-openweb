import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { formatSummaryName, isFormatNumber } from 'statistics/common';
import { getMapKey } from 'src/ming-ui/components/amap/MapLoader';
import { formatrChartValue, getChartColors } from './common';

const ZoomWrapper = styled.div`
  width: 40px;
  height: 90px;
  border-radius: 4px;
  background-color: #fff;
  position: absolute;
  bottom: 25px;
  right: 25px;
  z-index: 10;
  .icon:hover {
    color: #1677ff !important;
  }
`;

const getSizeLavel = data => {
  let res = data.filter(item => item.v).sort((a, b) => a.v - b.v);
  let max = Math.ceil(res.length / 10);
  let currentIndex = max;
  let lavel = 1;
  for (let i = 0; i < res.length; i++) {
    let current = res[i];
    let last = res[i - 1];
    if (i === currentIndex) {
      currentIndex = currentIndex + max;
      if (current.v !== (last && last.v)) {
        lavel = lavel + 1;
      }
    }
    current.sizeLavel = lavel;
  }
  return res;
};

const getPointData = reportData => {
  const { xaxes, split, map, locationMap, valueMap, yaxisList } = reportData;
  const xaxesValueMap = valueMap[xaxes.controlId] || {};
  let features = [];

  if (split.controlId) {
    const { value } = map[0];
    const nControlId = _.get(yaxisList[0], 'controlId');
    const sizeControlId = _.get(yaxisList[1], 'controlId');
    value.map(item => {
      map.forEach((element, index) => {
        const target = element.value.filter(n => n.x === item.x)[0];
        if (yaxisList.length > 1 ? target.m[nControlId] : target.v) {
          const location = locationMap[target.x];
          const value = yaxisList.length > 1 ? target.m[nControlId] : target.v;
          features.push({
            type: 'Feature',
            properties: {
              id: target.x,
              name: xaxesValueMap[target.x],
              value,
              mag: 20,
              size: yaxisList.length > 1 ? target.m[sizeControlId] : 0,
              groupKey: element.key,
              colorIndex: index,
            },
            geometry: {
              type: 'Point',
              coordinates: location ? location.split(',').map(n => Number(n)) : [],
            },
            v: value,
          });
        }
      });
    });
    const sizeLavel = getSizeLavel(
      features.map(item => {
        return {
          id: item.properties.id,
          groupKey: item.properties.groupKey,
          v: item.properties.size,
        };
      }),
    );
    features = features.map(item => {
      const sizeData = _.find(sizeLavel, { id: item.properties.id, groupKey: item.properties.groupKey });
      return {
        ...item,
        properties: {
          ...item.properties,
          mag: (_.get(sizeData, 'sizeLavel') || 1) * 10,
        },
        v: undefined,
      };
    });
  } else {
    const baseMap = _.get(_.find(map, { c_id: _.get(yaxisList[0], 'controlId') }), 'value');
    const sizeMap = _.get(_.find(map, { c_id: _.get(yaxisList[1], 'controlId') }), 'value');
    const sizeLavel = getSizeLavel(sizeMap || []);
    features = baseMap.map(data => {
      const location = locationMap[data.x];
      return {
        type: 'Feature',
        properties: {
          id: data.x,
          name: xaxesValueMap[data.x],
          value: data.v,
          mag: sizeMap ? (_.get(_.find(sizeLavel, { x: data.x }), 'sizeLavel') || 1) * 10 : 10,
        },
        geometry: {
          type: 'Point',
          coordinates: location ? location.split(',').map(n => Number(n)) : [],
        },
      };
    });
  }

  return {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      },
    },
    features,
  };
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalCount: 0,
      count: 0,
      dropdownVisible: false,
      offset: {},
      match: null,
      linkageMatch: null,
    };
    this.scene = null;
    this.g2plotComponent = {};
  }
  componentDidMount() {
    Promise.all([import('@antv/l7'), import('@antv/l7-maps')]).then(([l7, maps]) => {
      const { LayerPopup, PointLayer, Scene } = l7;
      const { GaodeMap } = maps;
      this.LayerPopup = LayerPopup;
      this.PointLayer = PointLayer;
      this.Scene = Scene;
      this.GaodeMap = GaodeMap;
      this.renderWorldMap(this.props);
    });
  }
  componentWillUnmount() {
    this.scene && this.scene.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { style = {}, displaySetup = {} } = nextProps.reportData;
    const { style: oldStyle = {}, displaySetup: oldDisplaySetup = {} } = this.props.reportData;
    if (
      (!_.isEmpty(displaySetup) && displaySetup.showChartType !== oldDisplaySetup.showChartType) ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      !_.isEqual(style, oldStyle) ||
      nextProps.themeColor !== this.props.themeColor ||
      !_.isEqual(
        _.pick(nextProps.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
        _.pick(this.props.customPageConfig, ['chartColor', 'pageStyleType', 'widgetBgColor']),
      )
    ) {
      this.resetChart(nextProps);
    }
    if (nextProps.isLinkageData !== this.props.isLinkageData) {
      this.isLinkageData =
        nextProps.isLinkageData &&
        !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0);
    }
  }
  handleClickPoint = event => {
    const { xaxes, appId, reportId, name, reportType, split, style } = this.props.reportData;
    const { feature, x, y } = event;
    const { properties } = feature;
    const param = {};
    const linkageMatch = {
      sheetId: appId,
      reportId,
      reportName: name,
      reportType,
      filters: [],
    };
    if (xaxes.cid) {
      const isNumber = isFormatNumber(xaxes.controlType);
      const value = properties.id;
      param[xaxes.cid] = isNumber && value ? Number(value) : value;
      linkageMatch.value = value;
      linkageMatch.filters.push({
        controlId: xaxes.controlId,
        values: [param[xaxes.cid]],
        controlName: xaxes.controlName,
        controlValue: properties.name,
        type: xaxes.controlType,
        control: xaxes,
      });
    }
    if (split.controlId) {
      const isNumber = isFormatNumber(split.controlType);
      const value = properties.groupKey;
      param[split.cid] = isNumber && value ? Number(value) : value;
      if (!xaxes.cid) {
        linkageMatch.value = properties.id;
      }
      linkageMatch.filters.push({
        controlId: split.controlId,
        values: [param[split.cid]],
        controlName: split.controlName,
        controlValue: properties.name,
        type: split.controlType,
        control: split,
      });
    }
    if (_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length) {
      linkageMatch.onlyChartIds = style.autoLinkageChartObjectIds;
    }
    const isAll = this.isViewOriginalData && this.isLinkageData;
    this.setState(
      {
        dropdownVisible: isAll,
        offset: {
          x: x,
          y: y + 20,
        },
        match: param,
        linkageMatch,
      },
      () => {
        if (!isAll && this.isViewOriginalData) {
          this.handleRequestOriginalData();
        }
        if (!isAll && this.isLinkageData) {
          this.handleAutoLinkage();
        }
      },
    );
  };
  handleRequestOriginalData = () => {
    const { isThumbnail } = this.props;
    const { match } = this.state;
    const data = {
      isPersonal: false,
      match,
    };
    this.setState({ dropdownVisible: false });
    if (isThumbnail) {
      this.props.onOpenChartDialog(data);
    } else {
      this.props.requestOriginalData(data);
    }
  };
  handleAutoLinkage = () => {
    const { linkageMatch } = this.state;
    this.props.onUpdateLinkageFiltersGroup(linkageMatch);
    this.setState({
      dropdownVisible: false,
    });
  };
  renderWorldMap(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, isThumbnail } = props;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light' } = customPageConfig;
    const styleConfig = reportData.style || {};
    const { displaySetup, split, xaxes } = reportData;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const style =
      chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0)
        ? { ...styleConfig, ...chartColor }
        : styleConfig;
    const colors = getChartColors(style, themeColor, projectId);
    this.isViewOriginalData = displaySetup.showRowList && props.isViewOriginalData;
    this.isLinkageData =
      props.isLinkageData &&
      !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0) &&
      (xaxes.controlId || split.controlId) &&
      xaxes.controlType !== 40;

    const { key } = getMapKey('amap') || {};

    this.scene = new this.Scene({
      id: this.chartEl,
      map: new this.GaodeMap({
        style: isDark ? 'dark' : 'light',
        center: [10, 40],
        zoom: 1,
        maxZoom: 10,
        token: key,
        languageCode: getCurrentLangCode() ? 'en' : 'zh',
      }),
      logoVisible: false,
    });
    const sourceData = getPointData(reportData);
    this.scene.on('loaded', () => {
      const pointLayer = new this.PointLayer({})
        .source(sourceData)
        .shape('circle')
        .size('mag', mag => {
          return mag;
        })
        .color('colorIndex', colorIndex => {
          return colors[colorIndex % colors.length] || colors[0];
        })
        .active({
          color: '#000',
          mix: 0.6,
        })
        .style({
          opacity: 0.3,
          strokeWidth: 1,
        });
      if (this.isViewOriginalData || this.isLinkageData) {
        pointLayer.on('click', this.handleClickPoint);
      }
      this.scene.addLayer(pointLayer);
      this.scene.addPopup(
        new this.LayerPopup({
          items: [
            {
              layer: pointLayer,
              fields: [
                {
                  field: 'name',
                  formatField: () => _l('地区'),
                  formatValue: name => {
                    if (xaxes.controlType === 40 && name) {
                      const data = JSON.parse(name);
                      return data.title || data.address || `x: ${data.x}, y: ${data.y}`;
                    } else {
                      return name;
                    }
                  },
                },
                {
                  field: 'value',
                  formatField: () => _l('数值'),
                  formatValue: value => value,
                },
              ],
            },
          ],
          trigger: 'hover',
        }),
      );
    });
    this.setCount(props);
  }
  resetChart(props) {
    this.scene && this.scene.destroy();
    this.renderWorldMap(props);
  }
  setCount(props) {
    const { summary, yaxisList } = props.reportData;
    const value = summary.sum;
    const count = formatrChartValue(value, false, yaxisList);
    this.setState({
      originalCount: value.toLocaleString() == count ? 0 : value.toLocaleString(),
      count,
    });
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
    const { count, originalCount, dropdownVisible, offset } = this.state;
    const { summary, displaySetup = {} } = this.props.reportData;
    return (
      <div className="flex flexColumn chartWrapper Relative">
        <Dropdown
          visible={dropdownVisible}
          onVisibleChange={dropdownVisible => {
            this.setState({ dropdownVisible });
          }}
          trigger={['click']}
          placement="bottomLeft"
          overlay={this.renderOverlay()}
        >
          <div className="Absolute" style={{ left: offset.x, top: offset.y }}></div>
        </Dropdown>
        {displaySetup.showTotal && (
          <div className="summaryWrap flexRow alignItemsCenter">
            <span>{formatSummaryName(summary)}: </span>
            <Tooltip title={originalCount ? originalCount : null}>
              <span className="count">{count}</span>
            </Tooltip>
          </div>
        )}
        <div
          className={cx('Relative', displaySetup.showTotal ? 'showTotalHeight' : 'h100')}
          ref={el => (this.chartEl = el)}
        />
        <ZoomWrapper className="flexColumn alignItemsCenter justifyContentCenter card">
          <Tooltip title={_l('放大')}>
            <Icon
              className="pointer Font20 Gray_75"
              icon="add"
              onClick={() => {
                this.scene.zoomIn();
              }}
            />
          </Tooltip>
          <Tooltip title={_l('完整显示')}>
            <Icon
              className="pointer Font17 Gray_75 mTop10 mBottom10"
              icon="gps_fixed"
              onClick={() => {
                this.scene.setZoom(1);
              }}
            />
          </Tooltip>
          <Tooltip title={_l('缩小')}>
            <Icon
              className="pointer Font20 Gray_75"
              icon="minus"
              onClick={() => {
                this.scene.zoomOut();
              }}
            />
          </Tooltip>
        </ZoomWrapper>
      </div>
    );
  }
}
