import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { generate } from '@ant-design/colors';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
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

let mapbox = null;

@connect(
  state => ({
    base: state.statistics.base,
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
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
      path: [],
      drillDownLoading: false,
    };
    this.scene = null;
    this.CountryLayerChart = null;
  }
  componentDidMount() {
    Promise.all([import('@antv/l7'), import('@antv/l7-maps'), import('@antv/l7-district')]).then(
      ([l7, l7Maps, l7District]) => {
        const { Scene } = l7;
        const { Mapbox } = l7Maps;
        const { CountryLayer, ProvinceLayer, CityLayer, DrillDownLayer } = l7District;
        this.asyncComponents = { Scene, Mapbox, CountryLayer, ProvinceLayer, CityLayer, DrillDownLayer };

        const { isThumbnail, reportData, isViewOriginalData, isLinkageData } = this.props;
        const { displaySetup, country } = reportData;
        const style = reportData.style || {};
        const { scene, config, ChartComponent } = this.getChartConfig(this.props);

        scene.on('loaded', () => {
          this.isViewOriginalData = displaySetup.showRowList && isViewOriginalData;
          this.isLinkageData =
            isLinkageData &&
            !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0);
          this.CountryLayerChart = new ChartComponent(scene, config);
          if (country.municipality) return;
          if ((this.isViewOriginalData || this.isLinkageData) && !style.isDrillDownLayer) {
            this.CountryLayerChart.on('click', this.handleClick);
          }
          if ((this.isViewOriginalData || this.isLinkageData) && style.isDrillDownLayer) {
            if (country.particleSizeType === 1) {
              this.CountryLayerChart.provinceLayer.on('click', this.handleClick);
              this.CountryLayerChart.cityLayer.on('click', this.handleClick);
              if (!isThumbnail) {
                this.CountryLayerChart.countyLayer.on('click', this.handleClick);
              }
            }
            if (country.particleSizeType === 2) {
              this.CountryLayerChart.cityLayer.on('click', this.handleClick);
              if (!isThumbnail) {
                this.CountryLayerChart.countyLayer.on('click', this.handleClick);
              }
            }
            if (country.particleSizeType === 3) {
              this.CountryLayerChart.on('click', this.handleClick);
            }
          }
        });
        if (this.chartEl) {
          this.resizeObserver = new ResizeObserver(() => {
            this.scene.map.resize();
          });
          this.resizeObserver.observe(this.chartEl);
        }
      },
    );
  }
  componentWillUnmount() {
    this.CountryLayerChart && this.CountryLayerChart.destroy();
    this.scene && this.scene.destroy();
    this.resizeObserver && this.resizeObserver.unobserve(this.chartEl);
  }
  componentWillReceiveProps(nextProps) {
    const { style = {}, displaySetup = {} } = nextProps.reportData;
    const { style: oldStyle = {}, displaySetup: oldDisplaySetup = {} } = this.props.reportData;
    const chartColor = _.get(nextProps, 'customPageConfig.chartColor');
    const oldChartColor = _.get(this.props, 'customPageConfig.chartColor');
    if (
      (!_.isEmpty(displaySetup) && displaySetup.showChartType !== oldDisplaySetup.showChartType) ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      !_.isEqual(chartColor, oldChartColor) ||
      !_.isEqual(style, oldStyle) ||
      nextProps.themeColor !== this.props.themeColor
    ) {
      this.CountryLayerChart && this.CountryLayerChart.destroy();
      this.scene && this.scene.destroy();
      const { scene, config, ChartComponent } = this.getChartConfig(nextProps);
      scene.on('loaded', () => {
        this.CountryLayerChart = new ChartComponent(scene, config);
      });
    }
    if (nextProps.isLinkageData !== this.props.isLinkageData) {
      this.isLinkageData =
        nextProps.isLinkageData &&
        !(_.isArray(style.autoLinkageChartObjectIds) && style.autoLinkageChartObjectIds.length === 0);
    }
    if (!nextProps.loading && this.props.loading) {
      const { map, yaxisList, summary, style, country } = nextProps.reportData;
      const data = setColorLavel(map);
      const { CountryLayerChart } = this;
      if (CountryLayerChart && typeof CountryLayerChart.updateData === 'function') {
        this.setCount(formatYaxisList(data, yaxisList), summary);
        if (_.get(style, 'isDrillDownLayer')) {
          if (country.particleSizeType === 3) {
            CountryLayerChart.updateData(data);
          } else {
            CountryLayerChart.updateData(CountryLayerChart.drillState, data);
          }
        } else {
          CountryLayerChart.updateData(data);
        }
      }
    }
  }
  handleClick = ({ feature, x, y }) => {
    const { path } = this.state;
    const { xaxes, country, appId, reportId, name, reportType, style } = this.props.reportData;
    const { code, value } = feature.properties;

    if (!value) return;

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
    const { base } = this.props;
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
    const { base, reportData, filtersGroup } = this.props;
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
        const data = setColorLavel(result.map);

        if (municipality.includes(code)) {
          const last = _.find(this.CountryLayerChart.provinceLayer.options.data, { code: code });
          this.setState({ path: [_l('全国'), last.name] });
          this.depthColorLavels = this.getColorLavels(this.props, data);
          this.CountryLayerChart.depth = 3;
          this.CountryLayerChart.drillState = 'Province';
          this.CountryLayerChart.drillDown(code, data);
          this.CountryLayerChart.drillState = 'City';
          this.CountryLayerChart.drillDown(code, data);
          return;
        }

        if (path.length) {
          const last = _.find(this.CountryLayerChart.cityLayer.options.data, { code: code });
          const city = last.name.split('/')[1];
          this.setState({ path: path.concat(city) });
          this.CountryLayerChart.drillState = 'City';
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
            this.CountryLayerChart.drillState = 'Province';
          }
          if (country.particleSizeType === 2) {
            this.CountryLayerChart.drillState = 'City';
          }
          this.setState({ path: newPath });
        }

        this.CountryLayerChart.drillDown(code, data);
      });
  };
  handleDrillUpTriggleData = index => {
    const { path } = this.state;
    const { isThumbnail, reportData, base } = this.props;
    const { country } = reportData;

    if (path.length) {
      if (index) {
        this.props.changeCurrentReport({
          country: {
            ...country,
            drillFilterCode: this.CountryLayerChart.cityLayer.options.adcode,
            drillParticleSizeType: 2,
          },
        });
        this.CountryLayerChart.drillUp('Province');
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
        this.CountryLayerChart.drillUp('Province');
        this.CountryLayerChart.drillUp('Country');
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
        this.CountryLayerChart.drillUp('Country');
      }
      if (country.particleSizeType === 2) {
        this.props.changeCurrentReport({
          country: {
            ...country,
            drillFilterCode: this.CountryLayerChart.cityLayer.options.adcode,
            drillParticleSizeType: 2,
          },
        });
        this.CountryLayerChart.drillUp('Province');
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
    const { themeColor, projectId, customPageConfig = {}, reportData } = props;
    const { country, displaySetup, map, yaxisList, summary } = reportData;
    const { colorRules } = displaySetup;
    const { chartColor, chartColorIndex = 1 } = customPageConfig;
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
    const { Scene, Mapbox, CountryLayer, ProvinceLayer, CityLayer, DrillDownLayer } = this.asyncComponents;

    this.setCount(newYaxisList, summary);
    this.colors = getChartColors(style, themeColor, projectId);
    this.colorLavels = this.getColorLavels(props, data);

    if (!mapbox) {
      mapbox = new Mapbox({
        center: [116.2825, 39.9],
        pitch: 0,
        style: 'blank',
        zoom: 3,
        minZoom: 1,
        maxZoom: 10,
      });
    }

    this.scene = new Scene({
      id: this.chartEl,
      logoVisible: false,
      map: mapbox,
    });

    const { scene } = this;
    const config = {
      data,
      joinBy: ['adcode', 'code'],
      cityStrokeWidth: 1,
      popup: {
        enable: true,
        Html: props => {
          if (_.isNull(props.value) || _.isUndefined(props.value)) {
            return `<span>${props.NAME_CHN}</span>`;
          } else {
            return `<span>${props.NAME_CHN}: ${formatrChartValue(props.value, false, newYaxisList)}</span>`;
          }
        },
      },
    };

    if (displaySetup.showChartType === 2) {
      config.provinceStroke = '#ffffffcc';
      config.cityStroke = '#ffffffcc';
      config.bubble = {
        color: this.colors[0],
        enable: true,
        size: {
          field: 'colorLavel',
          values: value => {
            return value ? value * 5 : 0;
          },
        },
      };
    } else {
      config.provinceStroke = '#BBDEFB';
      config.cityStroke = '#BBDEFB';
      if (isRuleColor) {
        config.fill = {
          color: {
            field: 'value',
            values: value => {
              const color = getStyleColor({
                value,
                controlMinAndMax,
                rule,
                controlId: yaxisList[0].controlId,
              });
              return color;
            },
          },
        };
      } else {
        config.fill = {
          color: {
            field: 'colorLavel',
            values: value => {
              if (this.depthColorLavels) {
                return this.depthColorLavels[value - 1];
              } else {
                return this.colorLavels[value - 1];
              }
            },
          },
        };
      }
    }

    // 钻取地图
    if (style && style.isDrillDownLayer && [1, 2].includes(country.particleSizeType) && !country.municipality) {
      config.customTrigger = true;
      config.data = undefined;
      // 省
      if (country.particleSizeType === 1) {
        config.provinceData = data;
        config.viewStart = 'Country';
        config.viewEnd = 'County';
      }
      // 市
      if (country.particleSizeType === 2) {
        config.cityData = data;
        config.viewStart = 'Province';
        config.viewEnd = 'County';
        config.city = {
          adcode: [country.filterCode],
        };
      }
      return {
        scene,
        config,
        ChartComponent: DrillDownLayer,
      };
    }

    // 普通地图
    if (country.municipality) {
      config.depth = 3;
      config.adcode = [country.filterCode];
      return {
        scene,
        config,
        ChartComponent: ProvinceLayer,
      };
    }
    // 普通地图 / 全国
    if (country.particleSizeType === 1) {
      config.depth = 1;
      return {
        scene,
        config,
        ChartComponent: CountryLayer,
      };
    }
    // 普通地图 / 市
    if (country.particleSizeType === 2) {
      config.depth = 2;
      config.adcode = [country.filterCode];
      return {
        scene,
        config,
        ChartComponent: ProvinceLayer,
      };
    }
    // 普通地图 / 县
    if (country.particleSizeType === 3) {
      config.depth = 3;
      config.adcode = [country.filterCode];
      return {
        scene,
        config,
        ChartComponent: CityLayer,
      };
    }
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
    const { displaySetup = {}, country = {}, summary } = this.props.reportData;
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
            <Tooltip title={originalCount ? originalCount : null}>
              <span className="count">{count}</span>
            </Tooltip>
          </div>
        ) : null}
        {country.filterCode == '910000' ? (
          <Fragment>
            <div className="flexRow valignWrapper h100 justifyContent Gray_75 Font16">{_l('海外地区暂不支持')}</div>
            <div className="hide" ref={el => (this.chartEl = el)} />
          </Fragment>
        ) : (
          <Fragment>
            <div
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
                <Icon className="pointer Font20 Gray_75 mTop2" icon="add" onClick={() => this.scene.map.zoomIn()} />
              </Tooltip>
              <Tooltip title={_l('完整显示')}>
                <Icon
                  className="pointer Font17 Gray_75 mTop10 mBottom10"
                  icon="gps_fixed"
                  onClick={() => this.scene.map.zoomTo(2)}
                />
              </Tooltip>
              <Tooltip title={_l('缩小')}>
                <Icon className="pointer Font20 Gray_75" icon="minus" onClick={() => this.scene.map.zoomOut()} />
              </Tooltip>
            </ZoomWrapper>
          </Fragment>
        )}
      </div>
    );
  }
}
