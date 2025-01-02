import React, { Component, Fragment } from 'react';
import { Dialog, ScrollView, Icon } from 'ming-ui';
import { Popup } from 'antd-mobile';
import MapLoader from './MapLoader';
import MapHandler from './MapHandler';
import '../less/MDMap.less';
import { Tooltip } from 'antd';
import _ from 'lodash';
import markImg from './img/mark_r.png';
import cx from 'classnames';
import CustomLocation from './components/CustomLocation';
import OperatorIcon from './components/OperatorIcon';
import GoogleMap from './components/GoogleMap';
import { AnimationWrap } from 'src/pages/widgetConfig/styled/index.js';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { getMapConfig } from 'src/util';

const MAP_TYPE = [
  { text: _l('地图位置'), value: 0 },
  { text: _l('自定义位置'), value: 1 },
];

class GDMap extends Component {
  static defaultProps = {
    isMobile: false,
    distance: 0,
    onAddressChange: () => {},
    onClose: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      defaultLocation: null,
      currentLocation: null,
      customLocation: null,
      defaultList: [],
      list: [],
      zoom: 15,
      tab: 0,
    };
  }

  componentDidMount() {
    this._MapLoader = new MapLoader();
    this._MapLoader.loadJs().then(() => {
      this.initMapObject();
    });
    if (this.conRef.current) {
      if (this.conRef.current.querySelector('.MDMapInput')) {
        this.conRef.current.querySelector('.MDMapInput').focus();
      }
    }
  }

  componentWillUnmount() {
    if (this._maphHandler) {
      this._maphHandler.destroyMap();
      this._maphHandler = null;
    }
  }

  conRef = React.createRef();

  initMapObject() {
    const { defaultAddress } = this.props;

    this._maphHandler = new MapHandler(this._mapContainer, { zoom: 15 });
    this._maphHandler.getCurrentPos(this.handleCurrPos, !defaultAddress); // 初始定位

    // 点击地图
    this._maphHandler.onClick((lng, lat, address, name) => {
      if (this.compareDistance(lng, lat)) {
        this.geoLocation(lng, lat, address, name);
      } else {
        alert(_l('不在定位范围内'), 2);
      }
    });

    // 移动地图
    this._maphHandler.moveEnd((lng, lat, address, name) => {
      this.geoLocation(lng, lat, address, name);
    });
  }

  // 定位到当前位置，有可能会失败
  handleCurrPos = (status, result) => {
    const { defaultAddress } = this.props;

    if (status === 'complete') {
      this.setState({ currentLocation: result, defaultLocation: result });

      if (defaultAddress) {
        this.setPosition(defaultAddress.x, defaultAddress.y);
      } else {
        this.setPosition(result.position.lng, result.position.lat);
      }
    } else if (status === 'error' && defaultAddress) {
      const location = this.getCurrentLocation({ ...defaultAddress });
      this.setPosition(defaultAddress.x, defaultAddress.y);
      this.setState({
        currentLocation: location,
        defaultLocation: location,
      });
    }
  };

  getCurrentLocation = ({ x, y, title, address }) => {
    return {
      addressComponent: { building: title },
      formattedAddress: address,
      position: {
        lng: x,
        lat: y,
      },
    };
  };

  // 定位
  geoLocation = (lng, lat, address, name) => {
    if (this._maphHandler) {
      this.setState(
        {
          currentLocation: !this.compareDistance(lng, lat)
            ? undefined
            : this.getCurrentLocation({ x: lng, y: lat, title: name, address }),
          zoom: this._maphHandler.map.getZoom(),
          ...(this.state.tab === 1
            ? { customLocation: !this.compareDistance(lng, lat) ? undefined : { lng, lat, name, address } }
            : {}),
        },
        () => this.setPosition(lng, lat, this.state.zoom),
      );
    }
  };

  // 定位
  setPosition(lng, lat, resetZoom = true) {
    const { distance } = this.props;
    const { zoom } = this.state;
    if (!this.compareDistance(lng, lat)) {
      this.setState({ currentLocation: undefined, defaultList: [] });
      return;
    }
    if (this._maphHandler) {
      this._maphHandler.setPosition(lng, lat, resetZoom ? zoom : this._maphHandler.map.getZoom());

      // 周边搜索
      new AMap.PlaceSearch().searchNearBy('', [lng, lat], distance || 100, (status, result) => {
        if (status === 'complete') {
          this.setState({
            defaultList: result.poiList.pois.filter(
              item => item.location && item.location.lng && this.compareDistance(item.location.lng, item.location.lat),
            ),
          });
        } else {
          this.setState({ defaultList: [] });
        }
      });
    }
  }

  // 计算距离
  compareDistance(lng, lat) {
    const { distance } = this.props;
    const { defaultLocation } = this.state;
    const position = (defaultLocation || {}).position;

    if (!distance || !position) return true;

    const lngLat = new AMap.LngLat(position.lng, position.lat);
    const myDistance = lngLat.distance([lng, lat]);

    if (myDistance < distance) {
      return true;
    }

    return false;
  }

  handleChange = () => {
    const { distance } = this.props;
    const centerInfo = this._maphHandler && this._maphHandler.map && this._maphHandler.map.getCenter();
    const { lat, lng } = centerInfo || {};

    const keywords = _.get(this.searchRef, 'value') || '';

    if (!distance) {
      new AMap.PlaceSearch().search(keywords.trim(), (status, result) => {
        this.setState({
          list:
            status === 'complete'
              ? (_.get(result, 'poiList.pois') || []).filter(item => item.location && item.location.lng)
              : [],
        });
      });
      return;
    }

    new AMap.PlaceSearch({ citylimit: true, pageSize: 50 }).searchNearBy(
      keywords.trim(),
      [lng, lat],
      distance,
      (status, result) => {
        this.setState({
          list:
            status === 'complete'
              ? (_.get(result, 'poiList.pois') || []).filter(item => item.location && item.location.lng)
              : [],
        });
      },
    );
  };

  handleClearAndSet = item => {
    const { location = {}, address, name } = item;
    const { lng, lat } = location;
    (document.getElementsByClassName('MDMapInput')[0] || {}).value = '';
    this.setPosition(lng, lat);
    this.setState({
      customLocation: { lng, lat, name, address },
    });
  };

  setZoom = type => {
    const { currentLocation = {}, defaultLocation = {}, zoom } = this.state;
    if (zoom > 18 || zoom < 3) {
      this.setState({ zoom: zoom > 18 ? 18 : 3 });
      return;
    }
    this.setState({ zoom: type === 'plus' ? zoom + 1 : zoom - 1 }, () => {
      const { lng, lat } = _.get(currentLocation || defaultLocation, 'position') || {};
      this._maphHandler.setPosition(lng, lat, this.state.zoom);
    });
  };

  renderOperatorIcon = () => {
    const { defaultLocation } = this.state;

    return (
      <OperatorIcon
        {...this.props}
        defaultLocation={defaultLocation}
        setZoom={this.setZoom}
        setPosition={(lng, lat) => this.setPosition(lng, lat)}
      />
    );
  };

  renderHeader() {
    if (!this.props.allowCustom) return null;

    const { isMobile } = this.props;

    return (
      <AnimationWrap className={cx('mLeft16 mRight16', { mTop16: !isMobile })}>
        {MAP_TYPE.map(item => {
          return (
            <div
              className={cx('animaItem', { active: this.state.tab === item.value })}
              onClick={() => {
                this.setState({ tab: item.value }, () => {
                  if (!this.state.tab) {
                    this.setState({ customLocation: null });
                  }
                });
              }}
            >
              {item.text}
            </div>
          );
        })}
      </AnimationWrap>
    );
  }

  renderSearch() {
    const { distance, isMobile } = this.props;

    return (
      <Fragment>
        <div className={cx('mLeft16 mRight16 relative', { mTop16: !isMobile, mTop10: isMobile })}>
          <Icon icon="search" className="Gray_9e Font16 Absolute" style={{ left: 12, top: 10 }} />
          <form action="#" className="flex" onSubmit={event => event.preventDefault()}>
            <input
              type={isMobile ? 'search' : 'text'}
              ref={con => (this.searchRef = con)}
              placeholder={_l('搜索地点')}
              className="MDMapInput Gray"
              onKeyUp={e => e.keyCode === 13 && this.handleChange()}
              onChange={_.debounce(e => this.handleChange(), 500)}
            />
          </form>
        </div>
        {!!distance && (
          <div className="distanceInfo">
            <div className="Font12" style={{ color: '#4CAF50' }}>
              <Icon icon="task-setting_promet" className="Font14 mRight5" />
              {_l('仅能定位周边%0米以内的地点', distance)}
            </div>
          </div>
        )}
      </Fragment>
    );
  }

  renderSearchList() {
    const { currentLocation, list, defaultList } = this.state;
    const keywords = ((document.getElementsByClassName('MDMapInput')[0] || {}).value || '').trim();

    return (
      <ScrollView className="flex mTop5">
        {currentLocation && (
          <div className="MDMapList">
            <div
              className="flexColumn flex ellipsis"
              onClick={() =>
                this.props.onAddressChange({
                  lng: currentLocation.position.lng,
                  lat: currentLocation.position.lat,
                  address: currentLocation.formattedAddress,
                  name: (currentLocation.addressComponent || {}).building,
                })
              }
            >
              <div className="ellipsis bold Gray">
                {_l('(当前位置)')}
                {(currentLocation.addressComponent || {}).building}
              </div>
              <div className="ellipsis Gray_9e">
                {currentLocation.formattedAddress ||
                  _l('经度%0,纬度%1', currentLocation.position.lng, currentLocation.position.lat)}
              </div>
            </div>
          </div>
        )}
        {(keywords ? list : defaultList).map((item, index) => {
          if (item.address && typeof item.address === 'string') {
            return (
              <div className="MDMapList">
                <div
                  key={index}
                  className="flexColumn flex ellipsis"
                  onClick={() => {
                    this._maphHandler.getAddress(item.location.lng, item.location.lat, address => {
                      this.geoLocation(item.location.lng, item.location.lat, address || item.address, item.name);
                      this.props.onAddressChange({
                        lng: item.location.lng,
                        lat: item.location.lat,
                        address: address || item.address,
                        name: item.name,
                      });
                    });
                  }}
                >
                  <div className="ellipsis bold Gray">{item.name}</div>
                  <div className="ellipsis Gray_9e">{item.address}</div>
                </div>
                <Tooltip title={_l('定位')}>
                  <Icon
                    icon="location"
                    className="Font20 Gray_9e ThemeHoverColor3 pointer"
                    onClick={() => this.handleClearAndSet(item)}
                  />
                </Tooltip>
              </div>
            );
          }
          return null;
        })}
      </ScrollView>
    );
  }

  renderMapContent() {
    const { customLocation, tab, currentLocation } = this.state;
    if (!tab) {
      return (
        <Fragment>
          {this.renderSearch()}
          {this.renderSearchList()}
        </Fragment>
      );
    }

    // 自定义
    return (
      <CustomLocation
        {...this.props}
        customLocation={customLocation}
        currentLocation={currentLocation}
        setPosition={(lng, lat) => this.setPosition(lng, lat)}
      />
    );
  }

  render() {
    const { isMobile } = this.props;
    const { defaultLocation } = this.state;

    if (isMobile) {
      return (
        <Popup className="MDMap mobileModal minFull topRadius mobileMap" visible>
          <div className="flexColumn h100 relative">
            {this.renderOperatorIcon()}
            <div className="Relative">
              <div className="mBottom10" style={{ height: 254 }} ref={container => (this._mapContainer = container)} />
              {defaultLocation && <img src={markImg} className="markMapImg" />}
            </div>
            <div className="MDMapSidebar flexColumn w100 flex">
              {this.renderHeader()}
              {this.renderMapContent()}
            </div>
          </div>
        </Popup>
      );
    }

    return (
      <Dialog.DialogBase className="MDMap" width="1080" visible overlayClosable={false}>
        {this.renderOperatorIcon()}
        <div ref={this.conRef} className="flexRow" style={{ height: 600 }}>
          <div className="MDMapSidebar flexColumn">
            {this.renderHeader()}
            {this.renderMapContent()}
          </div>

          <div className="flex h100 Relative">
            <div className="h100" ref={container => (this._mapContainer = container)} />
            {defaultLocation && <img src={markImg} className="markMapImg" />}
          </div>
        </div>
      </Dialog.DialogBase>
    );
  }
}

export default class MDMap extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const MapComponent = !!getMapConfig() ? GoogleMap : GDMap;
    return <MapComponent {...this.props} />;
  }
}

export function dialogLocation(props) {
  functionWrap(MDMap, props);
}
