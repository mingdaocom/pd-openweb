import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import LoadDiv from '../LoadDiv';
import host from './config';
import fixeddataController from 'src/api/fixedData';
import _ from 'lodash';

const particularlyCity = ['110000', '120000', '310000', '500000', '810000', '820000'];
const overseas = ['910000'];

class Panel extends Component {
  static propTypes = {
    handleOpen: PropTypes.func,
    handleClose: PropTypes.func,
    callback: PropTypes.func,
    level: PropTypes.number,
    defaultValue: PropTypes.array,
    /**
     * API HOST
     */
    host: PropTypes.string,
  };
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
    this.state = {
      loading: true,
      selectCitys: defaultValue,
      citys: [],
      indexLevel: defaultValue.length || 1,
      /**
       * API HOST
       */
      host: this.props.host || host,
    };
    this.onNext = this.onNext.bind(this);
    this.onRenderCity = this.onRenderCity.bind(this);
    this.onRenderProvinces = this.onRenderProvinces.bind(this);
  }
  componentDidMount() {
    this.onInit(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.host && nextProps.host !== this.state.host) {
      this.setState({
        host: nextProps.host,
      });
    }
    if (!_.isEqual(nextProps.level, this.props.level)) {
      this.setState({
        loading: true,
        selectCitys: nextProps.defaultValue,
        citys: [],
        indexLevel: nextProps.defaultValue.length || 1,
      });
      this.onInit(nextProps);
    }
  }

  onInit(props) {
    const { defaultValue } = props;
    const targetCity = defaultValue[defaultValue.length - 2];
    if (defaultValue.length >= 2) {
      this.getCityData(targetCity.id).then(result => {
        this.setState({
          citys: result.citys,
          loading: false,
        });
        this.props.handleOpen();
      });
    } else {
      this.getProvincesData().then(result => {
        this.setState({
          citys: result.provinces,
          loading: false,
        });
        this.props.handleOpen();
      });
    }
  }

  onNext(item) {
    const { level } = this.props;
    const { indexLevel, selectCitys } = this.state;
    const currentCity = selectCitys[indexLevel - 1];
    if (currentCity) {
      selectCitys.pop();
    }
    const newSelectCitys = [...selectCitys, item];
    this.setState({
      selectCitys: newSelectCitys,
    });

    if (particularlyCity.includes(item.id) && newSelectCitys.length === 2) {
      this.props.callback([item]);
    } else {
      this.props.callback(_.uniqBy(newSelectCitys).length !== newSelectCitys.length ? _.uniqBy(newSelectCitys) : newSelectCitys);
    }

    if (newSelectCitys.length === level) {
      this.props.handleClose();
      return;
    }

    if (particularlyCity.includes(item.id)) {
      if (newSelectCitys.length === 1) {
        this.setState({
          indexLevel: indexLevel + 1,
          citys: [item],
          loading: false,
        });
        this.props.handleOpen();
        return;
      }
    }

    if (overseas.includes(item.id)) {
      this.props.handleOpen();
      this.props.handleClose();
      return;
    }

    this.setState({
      loading: true,
    });

    this.getCityData(item.id).then(
      result => {
        this.setState({
          indexLevel: indexLevel + 1,
          citys: result.citys,
          loading: false,
        });
        this.props.handleOpen();
      },
      () => {
        this.props.onHide();
        this.props.handleClose();
      }
    );
  }
  onRenderCity() {
    const { selectCitys } = this.state;
    const targetCity = selectCitys[0];

    if (particularlyCity.includes(targetCity.id)) {
      this.setState({
        selectCitys: [targetCity],
        indexLevel: 2,
        citys: [targetCity],
      });
      this.props.handleOpen();
      this.props.callback([targetCity]);
    } else {
      selectCitys.splice(2, 2);
      this.setState({
        citys: [],
        loading: true,
      });
      this.getCityData(targetCity.id).then(result => {
        this.setState({
          selectCitys: [...selectCitys],
          indexLevel: 2,
          citys: result.citys,
          loading: false,
        });
        this.props.handleOpen();
        this.props.callback(selectCitys);
      });
    }
  }
  onRenderProvinces() {
    const { selectCitys } = this.state;
    selectCitys.splice(1, 2);
    this.setState({
      loading: true,
      selectCitys: [...selectCitys],
      indexLevel: 1,
      citys: [],
    });
    this.getProvincesData().then(result => {
      this.setState({
        citys: result.provinces,
        loading: false,
      });
      this.props.handleOpen();
      this.props.callback(selectCitys);
    });
  }
  getProvincesData() {
    return fixeddataController.loadProvince();
  }
  getCityData(id) {
    return fixeddataController.loadCityCountyById({ id });
  }
  render() {
    const { level } = this.props;
    const { citys, indexLevel, selectCitys, loading } = this.state;
    const currentCity = selectCitys[indexLevel - 1] || {};

    return (
      <div className={`CityPicker level-${indexLevel}`}>
        <div className="cityTabs">
          <div
            className={cx('cityTabs-item ThemeBorderColor3', { activeTab: indexLevel === 1 })}
            onClick={() => {
              if (indexLevel !== 1) this.onRenderProvinces();
            }}
          >
            省份
          </div>
          <div
            className={cx('cityTabs-item ThemeBorderColor3', { activeTab: indexLevel === 2, disbaleTab: indexLevel === 1, hidden: level < 2 })}
            onClick={() => {
              if (indexLevel === 3) this.onRenderCity();
            }}
          >
            城市
          </div>
          <div className={cx('cityTabs-item ThemeBorderColor3', { activeTab: indexLevel === 3, disbaleTab: indexLevel !== 3, hidden: level < 3 })}>区县</div>
        </div>
        <div className="cityContent">
          {loading
            ? LoadDiv({ size: 'small' })
            : citys.map((item, index) => (
                <div key={index} onClick={() => this.onNext(item)} className={cx('cityContent-item', { active: item.id === currentCity.id })}>
                  {item.name}
                </div>
              ))}
        </div>
      </div>
    );
  }
}

export default Panel;
