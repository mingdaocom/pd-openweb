import React, { Component, Fragment } from 'react';
import { Dialog, ScrollView, Icon } from 'ming-ui';
import { Popup } from 'antd-mobile';
import MapLoader from './MapLoader';
import MapHandler from './MapHandler';
import '../less/MDMap.less';
import { Tooltip } from 'antd';
import _ from 'lodash';
import markImg from './img/mark_r.png';
import styled from 'styled-components';

const ToolbarIconWrap = styled.div`
  width: 30px;
  text-align: center;
  right: 10px;
  top: ${({ isMobile, icon }) => (icon === 'gpsFixed' ? (isMobile ? '140px' : '470px') : isMobile ? '180px' : '520px')};
  z-index: 10;
  padding: 6px;
  border-radius: ${icon => (icon === 'gpsFixed' ? ' 50%' : 'unset')};
  background: #fff;
  box-shadow: 0 3px 6px 0px rgba(0, 0, 0, 0.16);
`;

export default class MDMap extends Component {
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
      defaultList: [],
      list: [],
      zoom: 15,
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
    const position = (defaultLocation || {}).position || {};

    if (!distance) return true;

    const lngLat = new AMap.LngLat(position.lng || '', position.lat || '');
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

  handleClearAndSet = location => {
    (document.getElementsByClassName('MDMapInput')[0] || {}).value = '';
    this.setPosition(location.lng, location.lat);
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

  renderOperatorIcon() {
    const { isMobile, onClose } = this.props;
    const { defaultLocation } = this.state;

    return (
      <Fragment>
        <div
          className="Absolute"
          style={{ right: 12, top: 11, borderRadius: '50%', background: '#fff', width: 16, height: 16, zIndex: 9 }}
        />
        <Icon
          icon="delete_out"
          className="Gray_9e Font20 Absolute ThemeHoverColor3 pointer"
          style={{ right: 10, top: 10, zIndex: 10 }}
          onClick={onClose}
        />

        {defaultLocation && defaultLocation.position && (
          <ToolbarIconWrap
            isMobile={isMobile}
            icon="gpsFixed"
            className="Gray_9e Absolute ThemeHoverColor3 pointer flexRow gpsFixedIcon"
            onClick={() => this.setPosition(defaultLocation.position.lng, defaultLocation.position.lat)}
          >
            <Icon icon="gps_fixed" className="Font18" />
          </ToolbarIconWrap>
        )}
        {defaultLocation && defaultLocation.position && (
          <ToolbarIconWrap
            className="Gray_9e Absolute pointer flexColumn zoomWrap"
            isMobile={isMobile}
            icon="plusMinus"
          >
            <div className="ThemeHoverColor3" onClick={() => this.setZoom('plus')}>
              <Icon icon="plus" className="Font14" />
            </div>
            <div className="w100 mTop2" style={{ height: 1, border: '1px solid #ddd' }}></div>
            <div className="ThemeHoverColor3 pTop3" style={{ height: 19 }} onClick={() => this.setZoom('minus')}>
              <Icon icon="minus" className="Font14" />
            </div>
          </ToolbarIconWrap>
        )}
      </Fragment>
    );
  }

  renderSearch() {
    const { distance } = this.props;

    return (
      <Fragment>
        <div className="mLeft16 mRight16 relative">
          <Icon icon="search" className="Gray_9e Font16 Absolute" style={{ left: 12, top: 10 }} />
          <input
            type="text"
            ref={con => (this.searchRef = con)}
            placeholder={_l('搜索地点')}
            className="MDMapInput Gray"
            onKeyUp={e => e.keyCode === 13 && this.handleChange()}
            onChange={_.debounce(e => this.handleChange(), 500)}
          />
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
                    onClick={() => this.handleClearAndSet(item.location)}
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

  render() {
    const { isMobile } = this.props;
    const { defaultLocation } = this.state;

    if (isMobile) {
      return (
        <Popup className="MDMap mobileModal minFull topRadius" visible>
          <div className="flexColumn h100 relative">
            {this.renderOperatorIcon()}
            <div className="Relative">
              <div className="mBottom5" style={{ height: 250 }} ref={container => (this._mapContainer = container)} />
              {defaultLocation && <img src={markImg} className="markMapImg" />}
            </div>
            {this.renderSearch()}
            {this.renderSearchList()}
          </div>
        </Popup>
      );
    }

    return (
      <Dialog.DialogBase className="MDMap" width="1080" visible overlayClosable={false}>
        {this.renderOperatorIcon()}
        <div ref={this.conRef} className="flexRow" style={{ height: 600 }}>
          <div className="MDMapSidebar flexColumn">
            {this.renderSearch()}
            {this.renderSearchList()}
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
