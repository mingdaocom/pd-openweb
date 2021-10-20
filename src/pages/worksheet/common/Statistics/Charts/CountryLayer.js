import React, { Component, Fragment } from 'react';
import { Scene } from '@antv/l7';
import { CountryLayer, ProvinceLayer, CityLayer, setDataConfig } from '@antv/l7-district';
import { Mapbox } from '@antv/l7-maps';
import { formatrChartValue, formatYaxisList } from './common';
import { formatSummaryName } from 'src/pages/worksheet/common/Statistics/common';

const url = `${location.origin}`;

setDataConfig({
  country: {
    CHN: {
      1: {
        fill: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/71ac4de3-bb14-449d-a97d-2b98e25ec8df.bin`
        },
        line: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/70ec087e-c48a-4b76-8825-6452f17bae7a.bin`
        },
        provinceLine: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/0024caaf-86b2-4e75-a3d1-6d2146490b67.bin`
        },
        label: {
          type: 'json',
          url: `${url}/districtDataConfigFile/36832a45-68f8-4b51-b006-9dec71f92a23.json`
        }
      },
      2: {
        fill: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/522c6496-c711-4581-88db-c3741cd39abd.bin`
        },
        line: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/f6a4e2b1-359b-43a6-921c-39d2088d1dab.bin`
        },
        cityLine: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/f6a4e2b1-359b-43a6-921c-39d2088d1dab.bin`
        },
        provinceLine: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/0024caaf-86b2-4e75-a3d1-6d2146490b67.bin`
        }
      },
      3: {
        fill: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/516b2703-d692-44e6-80dd-b3f5df0186e7.bin`
        },
        line: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/bc97875a-90f2-42c0-a62c-43d2efd7460d.bin`
        },
        countryLine: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/bc97875a-90f2-42c0-a62c-43d2efd7460d.bin`
        },
        cityLine: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/8bfbfe7e-bd0e-4bbe-84d8-629f4dc7abc4.bin`
        },
        provinceLine: {
          type: 'pbf',
          url: `${url}/districtDataConfigFile/778ad7ba-5a3f-4ed6-a94a-b8ab8acae9d6.bin`
        }
      },
      nationalBoundaries: {
        type: 'json',
        url: `${url}/districtDataConfigFile/ee493a41-0558-4c0e-bee6-520276c4f1a8.json`
      },
      nationalBoundaries2: {
        type: 'json',
        url: `${url}/districtDataConfigFile/f2189cc4-662b-4358-8573-36f0f918b7ca.json`
      },
      island: {
        type: 'json',
        url: `${url}/districtDataConfigFile/fe49b393-1147-4769-94ed-70471f4ff15d.json`
      }
    }
  }
});

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
  const maxLength = Math.max.apply(
    null,
    data.map(item => item.colorLavel),
  );
  if (maxLength === 1) {
    return [colors[0], colors[0]];
  } else if (maxLength < colors.length) {
    return colors.slice(0, maxLength);
  } else {
    return colors;
  }
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalCount: 0,
      count: 0,
    }
    this.scene = null;
    this.CountryLayerChart = null;
  }
  componentDidMount() {
    const { scene, config, ChartComponent } = this.getChartConfig(this.props);
    scene.on('loaded', () => {
      this.CountryLayerChart = new ChartComponent(scene, config);
    });
  }
  componentWillUnmount() {
    this.CountryLayerChart && this.CountryLayerChart.destroy();
    this.scene && this.scene.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, map } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup } = this.props.reportData;
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag
    ) {
      this.CountryLayerChart.destroy();
      const { scene, config, ChartComponent } = this.getChartConfig(nextProps);
      scene.on('loaded', () => {
        this.CountryLayerChart = new ChartComponent(scene, config);
      });
    }
    if (!nextProps.loading && this.props.loading) {
      const { map } = nextProps.reportData;
      const data = setColorLavel(map);
      this.CountryLayerChart && this.CountryLayerChart.updateData(data);
    }
  }
  getChartConfig(props) {
    const { country, displaySetup, map, yaxisList } = props.reportData;
    const data = setColorLavel(map);
    const newYaxisList = formatYaxisList(data, yaxisList);

    this.setCount(newYaxisList);

    this.scene = new Scene({
      id: this.chartEl,
      logoVisible: false,
      map: new Mapbox({
        center: [116.2825, 39.9],
        pitch: 0,
        style: 'blank',
        zoom: 3,
        minZoom: 1,
        maxZoom: 10,
      }),
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
          values: [3, 20],
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

    if (country.municipality) {
      config.depth = 3;
      config.adcode = [country.filterCode];
      return {
        scene,
        config,
        ChartComponent: ProvinceLayer,
      };
    }
    if (country.particleSizeType === 1) {
      config.depth = 1;
      return {
        scene,
        config,
        ChartComponent: CountryLayer,
      };
    }
    if (country.particleSizeType === 2) {
      config.depth = 2;
      config.adcode = [country.filterCode];
      return {
        scene,
        config,
        ChartComponent: ProvinceLayer,
      };
    }
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
      count
    });
  }
  render() {
    const { count, originalCount } = this.state;
    const { displaySetup, country, summary } = this.props.reportData;
    return (
      <div className="flex flexColumn chartWrapper Relative">
        {displaySetup.showTotal ? (
          <div>
            <span>{formatSummaryName(summary)}: </span>
            <span data-tip={originalCount ? originalCount : null} className="count">{count}</span>
          </div>
        ) : null}
        {country.filterCode == '910000' ? (
          <Fragment>
            <div className="flexRow valignWrapper h100 justifyContent Gray_75 Font16">{_l('海外地区暂不支持')}</div>
            <div className="hide" ref={el => (this.chartEl = el)}></div>
          </Fragment>
        ) : (
          <div
            className={displaySetup.showTotal ? 'showTotalHeight Relative' : 'flex'}
            ref={el => (this.chartEl = el)}
          ></div>
        )}
      </div>
    );
  }
}
