import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { generate } from '@ant-design/colors';
import { Dropdown, Menu, Tooltip } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import reportRequestAjax from '../api/report';
import { formatSummaryName } from 'statistics/common';
import * as actions from 'statistics/redux/actions';
import { fillValueMap, version } from '../common';
import { formatrChartValue, formatYaxisList, getChartColors, getControlMinAndMax, getStyleColor } from './common';

const PathWrapper = styled.div`
  font-size: 14px;
  padding: 5px 15px;
  position: absolute;
  bottom: 30px;
  left: 45%;
  z-index: 2;
  border-radius: 4px;
  background-color: #fff;
  .item {
    color: #1677ff;
    cursor: pointer;
    &:last-child {
      color: #000;
      cursor: inherit;
    }
  }
`;

const ZoomWrapper = styled.div`
  width: 40px;
  height: 90px;
  border-radius: 4px;
  background-color: #fff;
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
  .icon:hover {
    color: #1677ff !important;
  }
`;

const municipality = ['110000', '310000', '120000', '500000'];
const colorsLength = 6;

const setColorLavel = data => {
  let res = data.filter(item => item.value).sort((a, b) => a.value - b.value);
  let max = Math.ceil(res.length / colorsLength);
  let currentIndex = max;
  let lavel = 1;
  for (let i = 0; i < res.length; i++) {
    let current = res[i];
    let last = res[i - 1];
    if (i === currentIndex) {
      currentIndex = currentIndex + max;
      if (current.value !== (last && last.value)) {
        lavel = lavel + 1;
      }
    }
    current.colorLavel = lavel;
  }
  return res;
};

export class CountryLayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalCount: 0,
      count: 0,
      dropdownVisible: false,
      offset: {},
      match: null,
      linkageMatch: null,
      path: [],
      drillDownLoading: false,
    };
    this.CountryLayerChart = null;
    this.DotLayerChart = null;
  }
  componentDidMount() {
    Promise.all([import('@antv/l7plot')]).then(([l7plot]) => {
      this.Choropleth = l7plot.Choropleth;
      this.DotLayer = l7plot.DotLayer;
      const { reportData, isViewOriginalData, isLinkageData } = this.props;
      const { style, displaySetup } = reportData;
      this.renderChart(this.props);
      this.isViewOriginalData = displaySetup.showRowList && isViewOriginalData;
      this.isLinkageData =
        isLinkageData && !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0);
      if (this.chartEl) {
        this.resizeObserver = new ResizeObserver(() => {
          const scene = this.CountryLayerChart.getScene();
          scene.map.resize();
        });
        this.resizeObserver.observe(this.chartEl);
      }
    });
  }
  componentWillUnmount() {
    this.CountryLayerChart && this.CountryLayerChart.destroy();
    this.resizeObserver && this.resizeObserver.unobserve(this.chartEl);
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
    if (!nextProps.loading && this.props.loading) {
      const { map, yaxisList, summary } = nextProps.reportData;
      const data = setColorLavel(map);
      this.setCount(formatYaxisList(data, yaxisList), summary);
      this.colorLavels = this.getColorLavels(nextProps, data);
      this.CountryLayerChart.changeData(data);
    }
  }
  renderChart = props => {
    const config = this.getChartConfig(props);
    this.CountryLayerChart = new this.Choropleth(this.chartEl, config);
    this.CountryLayerChart.on('loaded', () => {
      if (this.isViewOriginalData || this.isLinkageData) {
        this.CountryLayerChart.on('fillAreaLayer:click', this.handleClick);
      }
      const { dotLayerConfig, viewLevel, source } = config;
      if (dotLayerConfig) {
        const { locationMap } = props.reportData;
        const dotLayer = new this.DotLayer(dotLayerConfig);
        this[`${viewLevel.level}Data`] = { data: source.data, locationMap };
        this.CountryLayerChart.addLayer(dotLayer);
        this.DotLayerChart = dotLayer;
      }
    });
  };
  resetChart = props => {
    this.CountryLayerChart && this.CountryLayerChart.destroy();
    this.renderChart(props || this.props);
    this.setState({ path: [] });
  };
  handleClick = data => {
    const { feature, x, y } = data;
    const { path } = this.state;
    const { isThumbnail, reportData } = this.props;
    const { xaxes, country, appId, reportId, name, reportType, style } = reportData;
    const { code, value, level } = feature.properties;

    if (!value || (isThumbnail && level === 'district')) return;

    const param = {};
    const linkageMatch = {
      sheetId: appId,
      reportId,
      reportName: name,
      reportType,
      filters: [],
    };
    if (path.length) {
      // 省
      if (country.particleSizeType === 1) {
        param[`${xaxes.controlId}-${path.length}`] = code;
      }
      // 市
      if (country.particleSizeType === 2) {
        param[`${xaxes.controlId}-${path.length + 1}`] = code;
      }
    } else {
      const { name } = feature.properties;
      param[xaxes.cid] = code;
      linkageMatch.value = param[xaxes.cid];
      linkageMatch.filters.push({
        controlId: xaxes.controlId,
        values: [param[xaxes.cid]],
        controlName: xaxes.controlName,
        controlValue: name,
        type: xaxes.controlType,
      });
    }
    if (_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length) {
      linkageMatch.onlyChartIds = style.autoLinkageChartObjectIds;
    }

    this.setState({
      offset: {
        x,
        y,
      },
      match: param,
      linkageMatch,
    });

    setTimeout(() => {
      this.setState({ dropdownVisible: true });
    }, 0);
  };
  handleRequestOriginalData = () => {
    const { isThumbnail } = this.props;
    const { match } = this.state;
    const data = {
      isPersonal: false,
      match,
    };
    if (isThumbnail) {
      this.props.onOpenChartDialog(data);
    } else {
      this.props.requestOriginalData(data);
    }
    this.setState({ dropdownVisible: false });
  };
  handleAutoLinkage = () => {
    const { linkageMatch } = this.state;
    this.props.onUpdateLinkageFiltersGroup(linkageMatch);
    this.setState({
      dropdownVisible: false,
    });
  };
  handleDrillDownTriggerData = () => {
    const { base = {} } = this.props;
    const { match } = this.state;
    const key = _.findKey(match);
    const code = match[key];
    this.requestDrillDownTriggerData(code);
    if (base.sheetVisible) {
      this.handleCloseReportSingleCacheId();
      this.props.getTableData();
    }
  };
  requestDrillDownTriggerData = code => {
    const { path } = this.state;
    const { base = {}, reportData, filtersGroup } = this.props;
    const { country, reportId } = reportData;
    const id = reportId || base.report.id;
    const particleSizeType = path.length ? path.length + 1 : country.particleSizeType + 1;

    this.setState({ drillDownLoading: true });

    this.props.changeCurrentReport({
      country: {
        ...country,
        drillFilterCode: code,
        drillParticleSizeType: particleSizeType,
      },
    });

    reportRequestAjax
      .getData({
        reportId: id,
        version,
        filterCode: code,
        particleSizeType,
        filters: filtersGroup ? [filtersGroup] : undefined,
      })
      .then(result => {
        result = fillValueMap(result);
        this.setState({ drillDownLoading: false, dropdownVisible: false });
        const { locationMap = {} } = result;
        const data = setColorLavel(result.map);
        const renderDotLayerChart = level => {
          if (this.DotLayerChart) {
            const dotLayerConfig = this.getDotLayerConfig({ data, locationMap });
            this[`${level}Data`] = { data, locationMap };
            this.DotLayerChart.changeData(dotLayerConfig.source);
          }
        };

        if (municipality.includes(code)) {
          const last = _.find(this.CountryLayerChart.options.source.data, { code: code });
          this.setState({ path: [_l('全国'), last.name] });
          this.depthColorLavels = this.getColorLavels(this.props, data);
          this.CountryLayerChart.drillDown(
            { level: 'province', granularity: 'district', adcode: code },
            { source: { data } },
          );
          renderDotLayerChart('province');
          return;
        }

        if (path.length) {
          const last = _.find(this.CountryLayerChart.options.source.data, { code: code });
          const citys = last.name.split('/');
          const city = citys[citys.length - 1];
          this.setState({ path: path.concat(city) });
          this.CountryLayerChart.drillDown({ level: 'city', adcode: code }, { source: { data } });
          renderDotLayerChart('city');
        } else {
          const { map } = reportData;
          const newPath = [];
          if (country.particleSizeType === 1) {
            const last = _.find(map, { code: code });
            newPath.push(_l('全国'), last.name);
          }
          if (country.particleSizeType === 2) {
            const last = _.find(map, { code: code });
            newPath.push(...last.name.split('/'));
          }
          if (country.particleSizeType === 1) {
            this.CountryLayerChart.drillDown({ level: 'province', adcode: code }, { source: { data } });
            renderDotLayerChart('province');
          }
          if (country.particleSizeType === 2) {
            this.CountryLayerChart.drillDown({ level: 'city', adcode: code }, { source: { data } });
            renderDotLayerChart('city');
          }
          this.setState({ path: newPath });
        }
      });
  };
  handleDrillUpTriggleData = index => {
    const { path } = this.state;
    const { isThumbnail, reportData, base = {} } = this.props;
    const { country } = reportData;
    const renderDotLayerChart = level => {
      if (this.DotLayerChart) {
        const { data, locationMap } = this[`${level}Data`];
        const dotLayerConfig = this.getDotLayerConfig({ data, locationMap });
        this.DotLayerChart.changeData(dotLayerConfig.source);
      }
    };

    if (path.length) {
      if (index) {
        this.props.changeCurrentReport({
          country: {
            ...country,
            drillFilterCode: this.CountryLayerChart.options.viewLevel.adcode,
            drillParticleSizeType: 2,
          },
        });
        this.CountryLayerChart.drillUp(undefined, 'province');
        renderDotLayerChart('province');
        path.pop();
        this.setState({ path });
      } else {
        if (isThumbnail) {
          this.props.closeCurrentReport();
        } else {
          this.props.changeCurrentReport({
            country: {
              ...country,
              drillFilterCode: '',
              drillParticleSizeType: 1,
            },
          });
        }
        // 全国
        if (country.particleSizeType === 1) {
          this.CountryLayerChart.drillUp(undefined, 'country');
          renderDotLayerChart('country');
        } else {
          this.CountryLayerChart.drillUp(undefined, 'province');
          renderDotLayerChart('province');
        }
        this.setState({ path: [] });
        this.depthColorLavels = null;
      }
    } else {
      if (country.particleSizeType === 1) {
        this.props.changeCurrentReport({
          country: {
            ...country,
            drillFilterCode: '',
            drillParticleSizeType: 1,
          },
        });
        this.CountryLayerChart.drillUp(undefined, 'country');
      }
      if (country.particleSizeType === 2) {
        this.props.changeCurrentReport({
          country: {
            ...country,
            drillFilterCode: this.CountryLayerChart.cityLayer.viewLevel.adcode,
            drillParticleSizeType: 2,
          },
        });
        this.CountryLayerChart.drillUp(undefined, 'province');
      }
      this.setState({ path: [] });
    }

    if (base.sheetVisible) {
      this.handleCloseReportSingleCacheId();
      this.props.getTableData();
    }
  };
  handleCloseReportSingleCacheId = () => {
    this.props.changeBase({
      reportSingleCacheId: null,
      apkId: null,
      match: null,
    });
  };
  getColorLavels = (props, data) => {
    const { reportData } = props;
    const { yaxisList, sorts } = reportData;
    const sort = _.get(sorts[0], yaxisList[0].controlId);
    const maxColorLavel = _.max(data.map(n => n.colorLavel));
    const generateColors = generate(this.colors[0])
      .filter((_, index) => [0, 2, 4, 6, 7, 9].includes(index))
      .filter((_, index) => maxColorLavel > index);
    return sort === 2 ? generateColors.reverse() : generateColors;
  };
  getChartConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData, isThumbnail } = props;
    const { country, displaySetup, map, yaxisList, summary, locationMap = {} } = reportData;
    const { colorRules } = displaySetup;
    const { chartColor, chartColorIndex = 1, pageStyleType = 'light' } = customPageConfig;
    const isDark = pageStyleType === 'dark' && isThumbnail;
    const styleConfig = reportData.style || {};
    const style =
      chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0)
        ? { ...styleConfig, ...chartColor }
        : styleConfig;
    const data = setColorLavel(map);
    const rule = _.get(colorRules[0], 'dataBarRule') || {};
    const isRuleColor = !_.isEmpty(rule);
    const controlMinAndMax = isRuleColor
      ? getControlMinAndMax(
          yaxisList,
          data.map(n => Object.assign({}, n, { controlId: yaxisList[0].controlId })),
        )
      : {};
    const newYaxisList = formatYaxisList(data, yaxisList);
    const isBubbleStyle = displaySetup.showChartType === 2;

    this.setCount(newYaxisList, summary);
    this.colors = getChartColors(style, themeColor, projectId);
    this.colorLavels = this.getColorLavels(props, data);

    const config = {
      map: {
        type: 'map',
        style: 'blank',
        center: [120.19382669582967, 30.258134],
        zoom: 3,
        minZoom: 1,
        pitch: 0,
      },
      source: {
        data: data,
        joinBy: {
          sourceField: 'code',
          geoField: 'adcode',
        },
      },
      autoFit: true,
      drill: {
        steps: ['province', 'city'],
        triggerUp: null,
        triggerDown: null,
        onUp: (from, to, callback) => {
          callback();
        },
      },
      chinaBorder: {
        national: false,
        dispute: false,
        coast: { opacity: 0, width: 0 },
        hkm: false,
      },
      style: {
        opacity: 1,
        stroke: '#ccc',
        lineWidth: 0.6,
        lineOpacity: 1,
      },
      label: {
        visible: true,
        field: 'name',
        style: {
          fill: '#000',
          opacity: 0.8,
          fontSize: 10,
          stroke: '#fff',
          strokeWidth: 1,
          textAllowOverlap: false,
          padding: [5, 5],
        },
      },
      state: {
        active: { stroke: isDark ? '#fff' : 'black', lineWidth: 1 },
      },
      tooltip: {
        customTitle: data => {
          const { name, value } = data;
          return 'value' in data ? `${name}: ${formatrChartValue(value, false, newYaxisList)}` : name;
        },
      },
      zoom: false,
      legend: false,
    };

    if (md.global.Config.IsLocal) {
      config.geoArea = {
        url: location.origin + '/staticfiles/choroplethData',
        type: 'topojson',
      };
    }

    if (isBubbleStyle) {
      config.color = isDark ? 'transparent' : '#ccc';
      config.style.stroke = '#fff';
      config.dotLayerConfig = this.getDotLayerConfig({ data, locationMap });
    } else {
      if (isRuleColor) {
        config.color = {
          field: 'value',
          value: data => {
            const { value } = data;
            const color = getStyleColor({
              value,
              controlMinAndMax,
              rule,
              controlId: yaxisList[0].controlId,
            });
            return color;
          },
          scale: { type: 'quantile' },
        };
      } else {
        config.color = {
          field: 'colorLavel',
          value: data => {
            const { colorLavel } = data;
            const colorLavels = this.depthColorLavels || this.colorLavels;
            return colorLavel ? colorLavels[colorLavel - 1] : undefined;
          },
          scale: { type: 'quantile' },
        };
      }
    }

    if (country.particleSizeType === 1) {
      config.viewLevel = {
        level: 'country',
        adcode: 100000,
      };
    }

    if (country.particleSizeType === 2) {
      config.viewLevel = {
        level: 'province',
        adcode: country.filterCode,
      };
    }

    if (country.particleSizeType === 3) {
      config.viewLevel = {
        level: 'city',
        adcode: country.filterCode,
      };
    }

    // 直辖市
    if (country.municipality) {
      config.viewLevel = {
        level: 'province',
        granularity: 'district',
        adcode: country.filterCode,
      };
    }

    return config;
  }
  getDotLayerConfig({ data, locationMap }) {
    return {
      zIndex: 0,
      source: {
        data: data.map(item => {
          const [lng, lat] = (locationMap[item.code] || '').split(',');
          return {
            name: item.name,
            value: item.value,
            colorLavel: item.colorLavel,
            lng,
            lat,
          };
        }),
        parser: { type: 'json', x: 'lng', y: 'lat' },
      },
      size: {
        field: 'colorLavel',
        value: ({ colorLavel }) => {
          return colorLavel ? colorLavel * 5 : 0;
        },
      },
      color: this.colors[0],
    };
  }
  setCount(yaxisList, summary) {
    const value = summary.sum;
    const count = formatrChartValue(value, false, yaxisList);
    this.setState({
      originalCount: value.toLocaleString() == count ? 0 : value.toLocaleString(),
      count,
    });
  }
  renderOverlay() {
    const { reportData, isThumbnail } = this.props;
    const { path, drillDownLoading } = this.state;
    const { style, country } = reportData || {};
    return (
      <Menu className="chartMenu" style={{ width: 160 }}>
        <Fragment>
          {this.isLinkageData && _.isEmpty(path) && (
            <Menu.Item onClick={this.handleAutoLinkage} key="autoLinkage">
              <div className="flexRow valignWrapper">
                <Icon icon="link1" className="mRight8 Gray_9e Font20 autoLinkageIcon" />
                <span>{_l('联动')}</span>
              </div>
            </Menu.Item>
          )}
          {this.isViewOriginalData && (isThumbnail ? _.isEmpty(path) : true) && (
            <Menu.Item onClick={this.handleRequestOriginalData} key="viewOriginalData">
              <div className="flexRow valignWrapper">
                <Icon icon="table" className="mRight8 Gray_9e Font18" />
                <span>{_l('查看原始数据')}</span>
              </div>
            </Menu.Item>
          )}
        </Fragment>
        {_.get(style, 'isDrillDownLayer') &&
          [1, 2].includes(country.particleSizeType) &&
          path.length < (country.particleSizeType === 1 ? 3 : 2) && (
            <Menu.Item onClick={this.handleDrillDownTriggerData} key="dataDrill">
              <div className="flexRow valignWrapper">
                <Icon icon="drill_down" className="mRight8 Gray_9e Font20" />
                <span>{_l('数据钻取')}</span>
                {drillDownLoading && <LoadDiv size="small" />}
              </div>
            </Menu.Item>
          )}
      </Menu>
    );
  }
  render() {
    const { count, originalCount, dropdownVisible, offset, path } = this.state;
    const { xaxes = {}, displaySetup = {}, country = {}, summary } = this.props.reportData;
    const chooserange = _.get(xaxes, 'advancedSetting.chooserange');
    return (
      <div className="flex flexColumn chartWrapper countryLayerChart Relative">
        <Dropdown
          visible={dropdownVisible}
          onVisibleChange={dropdownVisible => {
            this.setState({ dropdownVisible });
          }}
          trigger={['click']}
          placement="bottomLeft"
          overlay={this.renderOverlay()}
        >
          <div className="Absolute" style={{ left: offset.x, top: offset.y }} />
        </Dropdown>
        {displaySetup.showTotal ? (
          <div className="summaryWrap">
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">
              {count}
            </span>
          </div>
        ) : null}
        {country.filterCode == '910000' || (chooserange && chooserange !== 'CN') ? (
          <Fragment>
            <div className="flexRow valignWrapper h100 justifyContent Gray_75 Font16">{_l('海外地区暂不支持')}</div>
            <div className="hide" ref={el => (this.chartEl = el)} />
          </Fragment>
        ) : (
          <Fragment>
            <div
              id="countryLayerChartEl"
              className={displaySetup.showTotal ? 'showTotalHeight Relative' : 'h100'}
              ref={el => (this.chartEl = el)}
            />
            {!_.isEmpty(path) && (
              <PathWrapper className="flexRow valignWrapper card">
                {path.map((item, index) => (
                  <Fragment>
                    {index ? <span className="mLeft5 mRight5">/</span> : null}
                    <div
                      className="item"
                      onClick={() => {
                        if (index !== path.length - 1) {
                          this.handleDrillUpTriggleData(index);
                        }
                      }}
                    >
                      {item}
                    </div>
                  </Fragment>
                ))}
              </PathWrapper>
            )}
            <ZoomWrapper className="flexColumn alignItemsCenter justifyContentCenter card">
              <Tooltip title={_l('放大')}>
                <Icon className="pointer Font20 Gray_75" icon="add" onClick={() => this.CountryLayerChart.zoomIn()} />
              </Tooltip>
              <Tooltip title={_l('完整显示')}>
                <Icon
                  className="pointer Font17 Gray_75 mTop10 mBottom10"
                  icon="gps_fixed"
                  onClick={() => this.resetChart()}
                />
              </Tooltip>
              <Tooltip title={_l('缩小')}>
                <Icon
                  className="pointer Font20 Gray_75"
                  icon="minus"
                  onClick={() => this.CountryLayerChart.zoomOut()}
                />
              </Tooltip>
            </ZoomWrapper>
          </Fragment>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    base: state.statistics.base,
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(CountryLayer);
