import React, { Component, Fragment } from 'react';
import { formatrChartValue, formatYaxisList, getChartColors } from './common';
import { formatSummaryName } from 'statistics/common';
import { Dropdown, Menu, Tooltip } from 'antd';
import { LoadDiv, Icon } from 'ming-ui';
import styled from 'styled-components';
import { connect } from 'react-redux';
import * as actions from 'statistics/redux/actions';
import { bindActionCreators } from 'redux';
import reportRequestAjax from '../api/report';
import { version, fillValueMap } from '../common';
import { generate } from '@ant-design/colors';
import _ from 'lodash';

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
    color: #2196f3;
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
    color: #2196f3 !important;
  }
`;


const municipality = ['110000', '310000', '120000', '500000'];
const colorsLength = 6;

const setColorLavel = (data) => {
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

const getColorValues = (data, colors) => {
  const maxLength = Math.max.apply(null, data.map(item => item.colorLavel));
  if (maxLength === 1) {
    return [colors[0], colors[0]];
  } else if (maxLength < colors.length) {
    return colors.slice(0, maxLength);
  } else {
    return colors;
  }
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
        const { CountryLayer, ProvinceLayer, CityLayer, DrillDownLayer, setDataConfig } = l7District;
        const url = md.global.Config.WebUrl;
        setDataConfig({
          country: {
            CHN: {
              1: {
                fill: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/71ac4de3-bb14-449d-a97d-2b98e25ec8df.bin`
                },
                line: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/70ec087e-c48a-4b76-8825-6452f17bae7a.bin`
                },
                provinceLine: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/0024caaf-86b2-4e75-a3d1-6d2146490b67.bin`
                },
                label: {
                  type: 'json',
                  url: `${url}districtDataConfigFile/36832a45-68f8-4b51-b006-9dec71f92a23.json`
                }
              },
              2: {
                fill: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/522c6496-c711-4581-88db-c3741cd39abd.bin`
                },
                line: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/f6a4e2b1-359b-43a6-921c-39d2088d1dab.bin`
                },
                cityLine: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/f6a4e2b1-359b-43a6-921c-39d2088d1dab.bin`
                },
                provinceLine: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/0024caaf-86b2-4e75-a3d1-6d2146490b67.bin`
                }
              },
              3: {
                fill: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/524f7de2-7d69-4fa7-8da3-7ff42fa69ee4.bin`
                },
                line: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/bc97875a-90f2-42c0-a62c-43d2efd7460d.bin`
                },
                countryLine: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/bc97875a-90f2-42c0-a62c-43d2efd7460d.bin`
                },
                cityLine: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/8bfbfe7e-bd0e-4bbe-84d8-629f4dc7abc4.bin`
                },
                provinceLine: {
                  type: 'pbf',
                  url: `${url}districtDataConfigFile/778ad7ba-5a3f-4ed6-a94a-b8ab8acae9d6.bin`
                }
              },
              nationalBoundaries: {
                type: 'json',
                url: `${url}districtDataConfigFile/ee493a41-0558-4c0e-bee6-520276c4f1a8.json`
              },
              nationalBoundaries2: {
                type: 'json',
                url: `${url}districtDataConfigFile/f2189cc4-662b-4358-8573-36f0f918b7ca.json`
              },
              island: {
                type: 'json',
                url: `${url}districtDataConfigFile/fe49b393-1147-4769-94ed-70471f4ff15d.json`
              }
            }
          }
        });

        this.asyncComponents = { Scene, Mapbox, CountryLayer, ProvinceLayer, CityLayer, DrillDownLayer };

        const { isThumbnail, reportData, isViewOriginalData } = this.props;
        const { displaySetup, country } = reportData;
        const style = reportData.style || {};
        const { scene, config, ChartComponent } = this.getChartConfig(this.props);

        scene.on('loaded', () => {
          this.CountryLayerChart = new ChartComponent(scene, config);
          if (country.municipality) return;
          if (displaySetup.showRowList && isViewOriginalData && !style.isDrillDownLayer) {
            this.CountryLayerChart.on('click', this.handleClick);
          }
          if (isViewOriginalData && style.isDrillDownLayer) {
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
      },
    );
  }
  componentWillUnmount() {
    this.CountryLayerChart && this.CountryLayerChart.destroy();
    this.scene && this.scene.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { style = {}, displaySetup = {}, map } = nextProps.reportData;
    const { style: oldStyle = {}, displaySetup: oldDisplaySetup = {} } = this.props.reportData;
    const chartColor = _.get(nextProps, 'customPageConfig.chartColor');
    const oldChartColor = _.get(this.props, 'customPageConfig.chartColor');
    if (
      !_.isEmpty(displaySetup) &&
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
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
    if (!nextProps.loading && this.props.loading) {
      const { map, yaxisList, summary, style } = nextProps.reportData;
      const data = setColorLavel(map);
      const { CountryLayerChart } = this;
      if (CountryLayerChart && typeof CountryLayerChart.updateData === 'function') {
        this.setCount(formatYaxisList(data, yaxisList), summary);
        if (_.get(style, 'isDrillDownLayer')) {
          CountryLayerChart.updateData(CountryLayerChart.drillState, data);
        } else {
          CountryLayerChart.updateData(data);
        }
      }
    }
  }
  handleClick = ({ feature, x, y }) => {
    const { path } = this.state;
    const { xaxes, country } = this.props.reportData;
    const { code, value } = feature.properties;

    if (!value) return;

    const param = {};
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
      param[xaxes.cid] = code;
    }

    this.setState({
      offset: {
        x,
        y,
      },
      match: param,
    });

    setTimeout(() => {
      this.setState({ dropdownVisible: true });
    }, 0);
  };
  handleRequestOriginalData = () => {
    const { isThumbnail, reportData } = this.props;
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
  handleDrillDownTriggerData = () => {
    const { base, reportData } = this.props;
    const { xaxes, country } = reportData;
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
    const { base, reportData } = this.props;
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
      })
      .then(result => {
        result = fillValueMap(result);
        this.setState({ drillDownLoading: false, dropdownVisible: false });
        const data = setColorLavel(result.map);

        if (municipality.includes(code)) {
          const last = _.find(this.CountryLayerChart.provinceLayer.options.data, { code: code });
          this.setState({ path: [_l('全国'), last.name] });
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
  getChartConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData } = props;
    const { country, displaySetup, map, yaxisList, summary, sorts } = reportData;
    const { chartColor, chartColorIndex = 1 } = customPageConfig;
    const sort = _.get(sorts[0], yaxisList[0].controlId);
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const data = setColorLavel(map);
    const maxColorLavel = _.max(data.map(n => n.colorLavel));
    const colors = getChartColors(style, themeColor, projectId);
    const generateColors = generate(colors[0]).filter((_, index) => [0, 2, 4, 6, 7, 9].includes(index)).filter((_, index) => maxColorLavel > index);
    const colorLavels = sort === 2 ? generateColors.reverse() : generateColors;
    const newYaxisList = formatYaxisList(data, yaxisList);
    const { Scene, Mapbox, CountryLayer, ProvinceLayer, CityLayer, DrillDownLayer } = this.asyncComponents;

    this.setCount(newYaxisList, summary);

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
          const { yaxisList } = this.props.reportData;
          if (_.isNull(props.value) || _.isUndefined(props.value)) {
            return `<span>${props.NAME_CHN}</span>`;
          } else {
            return `<span>${props.NAME_CHN}: ${formatrChartValue(props.value, false, newYaxisList)}</span>`;
          }
        },
      },
    };

    if (displaySetup.showChartType === 2) {
      config.provinceStroke = '#FFF';
      config.cityStroke = '#FFF';
      config.bubble = {
        color: colors[0],
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
      config.fill = {
        color: {
          field: 'colorLavel',
          values: value => {
            return colorLavels[value - 1];
          },
        },
      };
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
    const { displaySetup = {}, style, country } = reportData || {};
    return (
      <Menu className="chartMenu" style={{ width: 160 }}>
        {displaySetup.showRowList && (isThumbnail ? _.isEmpty(path) : true) && (
          <Menu.Item onClick={this.handleRequestOriginalData} key="viewOriginalData">
            <div className="flexRow valignWrapper">
              <span>{_l('查看原始数据')}</span>
            </div>
          </Menu.Item>
        )}
        {style &&
          style.isDrillDownLayer &&
          [1, 2].includes(country.particleSizeType) &&
          path.length < (country.particleSizeType === 1 ? 3 : 2) && (
            <Menu.Item onClick={this.handleDrillDownTriggerData} key="dataDrill">
              <div className="flexRow valignWrapper">
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
          <div>
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">
              {count}
            </span>
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
                <Icon className="pointer Font17 Gray_75 mTop10 mBottom10" icon="gps_fixed" onClick={() => this.scene.map.zoomTo(2)} />
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
