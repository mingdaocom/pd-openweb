import React, { Component, Fragment } from 'react';
import { formatrChartValue, formatYaxisList } from './common';
import { formatSummaryName } from 'statistics/common';
import { Dropdown, Menu } from 'antd';
import { LoadDiv } from 'ming-ui';
import styled from 'styled-components';
import { connect } from 'react-redux';
import * as actions from 'statistics/redux/actions';
import { bindActionCreators } from 'redux';
import reportRequestAjax from '../api/report';
import { version, fillValueMap } from '../common';

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

const url = `${location.origin}`;
const colors = ['#E3F2FD', '#BBDEFB', '#90CAF9', '#2196F3', '#1565C0', '#0D47A1'];

const setColorLavel = data => {
  let res = data.filter(item => item.value).sort((a, b) => a.value - b.value);
  let max = Math.ceil(res.length / colors.length);
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

const getColorValues = data => {
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
        const { CountryLayer, ProvinceLayer, CityLayer, DrillDownLayer } = l7District;

        this.asyncComponents = { Scene, Mapbox, CountryLayer, ProvinceLayer, CityLayer, DrillDownLayer };

        const { isThumbnail, reportData, isViewOriginalData } = this.props;
        const { displaySetup, country } = reportData;
        const style = reportData.style || {};
        const { scene, config, ChartComponent } = this.getChartConfig(this.props);

        scene.on('loaded', () => {
          this.CountryLayerChart = new ChartComponent(scene, config);
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
    const { displaySetup = {}, map } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup = {} } = this.props.reportData;
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag
    ) {
      this.CountryLayerChart && this.CountryLayerChart.destroy();
      this.scene && this.scene.destroy();
      const { scene, config, ChartComponent } = this.getChartConfig(nextProps);
      scene.on('loaded', () => {
        this.CountryLayerChart = new ChartComponent(scene, config);
      });
    }
    if (!nextProps.loading && this.props.loading) {
      const { map } = nextProps.reportData;
      const data = setColorLavel(map);
      const { CountryLayerChart } = this;
      if (CountryLayerChart && typeof CountryLayerChart.updateData === 'function') {
        CountryLayerChart.updateData(data);
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
      dropdownVisible: true,
      offset: {
        x,
        y,
      },
      match: param,
    });
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
    const { reportData, base } = this.props;
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
        this.props.changeCurrentReport({
          country: {
            ...country,
            drillFilterCode: '',
            drillParticleSizeType: 1,
          },
        });
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
    const { country, displaySetup, map, yaxisList, style } = props.reportData;
    const data = setColorLavel(map);
    const newYaxisList = formatYaxisList(data, yaxisList);
    const { Scene, Mapbox, CountryLayer, ProvinceLayer, CityLayer, DrillDownLayer } = this.asyncComponents;

    this.setCount(newYaxisList);

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
          values: getColorValues(data),
        },
      };
    }

    // 钻取地图
    if (style && style.isDrillDownLayer && [1, 2].includes(country.particleSizeType)) {
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
  setCount(yaxisList) {
    const { summary } = this.props.reportData;
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
          </Fragment>
        )}
      </div>
    );
  }
}
