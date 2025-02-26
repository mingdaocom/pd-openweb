import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Toast } from 'antd-mobile';
import Amap from 'ming-ui/components/amap/Amap';
import { Gmap } from 'ming-ui/components/amap/components/GoogleMap';
import MDMap from 'ming-ui/components/amap/MDMap';
import MapLoader from 'ming-ui/components/amap/MapLoader';
import MapHandler from 'ming-ui/components/amap/MapHandler';
import { wgs84togcj02 } from 'worksheet/util-purejs';
import { FROM } from '../../tools/config';
import { browserIsMobile, toFixed, getMapConfig } from 'src/util';
import { CardButton } from 'src/pages/worksheet/components/Basics.jsx';
import {
  bindWeiXin,
  bindWxWork,
  bindFeishu,
  bindDing,
  bindWeLink,
  handleTriggerEvent,
} from '../../tools/authentication';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

const LocationWrap = styled.div`
  .location {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    position: relative;
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.12);
      .deleteIcon {
        display: block;
      }
    }
    .title {
      padding: 10px 12px 0;
      font-size: 14px;
      color: #151515;
      font-weight: 700;
    }
    .address {
      color: #151515;
      font-size: 12px;
      padding: 2px 12px 6px;
    }
    .xy {
      color: #9e9e9e;
      font-size: 12px;
      padding: 0 12px 10px;
      margin-top: -5px;
    }
    .deleteIcon {
      display: ${({ isMobile }) => (isMobile ? 'block' : 'none')};
      top: -12px;
      right: -12px;
    }
    .locationIcon {
      margin-left: 10px;
      width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const { IsLocal } = md.global.Config;
const isWx = window.isWeiXin && !IsLocal && !window.isWxWork;
const isMobile = browserIsMobile();
const isApp =
  (window.isWxWork || isWx || window.isWeLink || window.isDingTalk || window.isFeiShu || window.isMingDaoApp) &&
  isMobile;

export default class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    enumDefault: PropTypes.number,
    enumDefault2: PropTypes.number,
    onChange: PropTypes.func,
    default: PropTypes.string,
  };

  state = {
    visible: false,
  };

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  handleAuthentication = () => {
    const { strDefault, projectId } = this.props;
    const geolocation = (typeof strDefault === 'string' ? strDefault : '00')[0] === '1';

    if (window.isMingDaoApp) {
      this.handleMDAppLocation();
      return;
    }

    if (isWx) {
      if (!geolocation) {
        this.setState({ visible: true });
      } else {
        handleTriggerEvent(this.handleWxSelectLocation, bindWeiXin());
      }
      return;
    }

    if (window.isWxWork) {
      if (!geolocation) {
        this.setState({ visible: true });
      } else {
        handleTriggerEvent(this.handleWxSelectLocation, bindWxWork(projectId));
      }
      return;
    }

    if (window.isFeiShu) {
      handleTriggerEvent(this.handleFeishuSelectLocation, bindFeishu(projectId));
      return;
    }

    if (window.isDingTalk) {
      if (!geolocation) {
        this.setState({ visible: true });
      } else {
        handleTriggerEvent(this.handleDingSelectLocation, bindDing(projectId));
      }
      return;
    }

    if (window.isWeLink) {
      if (!geolocation) {
        this.setState({ visible: true });
      } else {
        handleTriggerEvent(this.handleWeLinkSelectLocation, bindWeLink(projectId));
      }
      return;
    }
  };

  handleDingSelectLocation = () => {
    const { onChange } = this.props;
    Toast.show({
      icon: 'loading',
      content: _l('正在获取取经纬度，请稍后'),
    });
    window.dd.device.geolocation.get({
      targetAccuracy: 200,
      coordinate: 1,
      withReGeocode: false,
      useCache: true,
      onSuccess: result => {
        const { longitude, latitude } = result;
        onChange(JSON.stringify({ x: longitude, y: latitude }));
        Toast.clear();
      },
      onFail: err => {
        window.nativeAlert(JSON.stringify(err));
        Toast.clear();
      },
    });
  };

  handleWeLinkSelectLocation = () => {
    const { onChange } = this.props;
    Toast.show({
      icon: 'loading',
      content: _l('正在获取取经纬度，请稍后'),
    });
    window.HWH5.getLocation({
      type: 0,
      mode: 'gps',
    })
      .then(result => {
        const { longitude, latitude } = result;
        onChange(JSON.stringify({ x: longitude, y: latitude }));
        Toast.clear();
      })
      .catch(err => {
        window.nativeAlert(JSON.stringify(err));
        Toast.clear();
      });
  };

  handleFeishuSelectLocation = () => {
    const { strDefault, onChange } = this.props;

    if ((typeof strDefault === 'string' ? strDefault : '00')[0] === '1') {
      // 获取经纬度
      Toast.show({
        icon: 'loading',
        content: _l('正在获取取经纬度，请稍后'),
      });
      window.tt.getLocation({
        type: 'gcj02',
        timeout: 5,
        cacheTimeout: 30,
        accuracy: 'best',
        success(res) {
          const { longitude, latitude } = res;
          onChange(JSON.stringify({ x: longitude, y: latitude }));
          Toast.clear();
        },
        fail(res) {
          const { errMsg } = res;
          if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
            window.nativeAlert(JSON.stringify(res));
          }
          Toast.clear();
        },
      });
    } else {
      // 地图打开
      window.tt.chooseLocation({
        type: 'gcj02',
        success(res) {
          const { longitude, latitude, address, name } = res;
          onChange(JSON.stringify({ x: longitude, y: latitude, address, title: name }));
        },
        fail(res) {
          const { errMsg } = res;
          if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
            window.nativeAlert(JSON.stringify(res));
          }
        },
      });
    }
  };

  handleMDAppLocation = () => {
    const { controlId, formData, onChange, strDefault } = this.props;
    const control = _.find(formData, { controlId }) || {};

    if ((typeof strDefault === 'string' ? strDefault : '00')[0] === '1') {
      Toast.show({
        icon: 'loading',
        content: _l('正在获取取经纬度，请稍后'),
      });

      if (!window.MDJS || !window.MDJS.getLocation) return;

      window.MDJS.getLocation({
        success: res => {
          const { longitude, latitude, address, title } = res;
          onChange(JSON.stringify({ x: longitude, y: latitude, address, title, coordinate: 'wgs84' }));
          Toast.clear();
        },
        cancel: res => {
          const { errMsg } = res;
          if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
            window.nativeAlert(JSON.stringify(res));
          }
          Toast.clear();
        },
      });
    } else if (window.MDJS && window.MDJS.chooseLocation) {
      window.MDJS.chooseLocation({
        control,
        success: res => {
          const { longitude, latitude, coordinate, address, title } = res;
          onChange(JSON.stringify({ x: longitude, y: latitude, address, title, coordinate }));
        },
        cancel: res => {
          const { errMsg } = res;
          if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
            window.nativeAlert(JSON.stringify(res));
          }
        },
      });
    }
  };

  handleMDAppOpenLocation = location => {
    if (!window.MDJS || !window.MDJS.openLocation) return;

    window.MDJS.openLocation({
      type: location.coordinate,
      longitude: location.x,
      latitude: location.y,
      name: location.title,
      address: location.address,
    });
  };

  handleWxSelectLocation = () => {
    const { onChange } = this.props;
    Toast.show({
      icon: 'loading',
      content: _l('正在获取取经纬度，请稍后'),
    });
    window.wx.getLocation({
      type: 'wgs84',
      success(res) {
        const { longitude, latitude, address, name } = res;
        onChange(JSON.stringify({ x: longitude, y: latitude, address, title: name, coordinate: 'WGS84' }));
        Toast.clear();
      },
      error(res) {
        window.nativeAlert(JSON.stringify(res));
        Toast.clear();
      },
    });
  };

  handleH5Location = () => {
    const { onChange } = this.props;
    Toast.show({
      icon: 'loading',
      content: _l('正在获取取经纬度，请稍后'),
    });
    new MapLoader().loadJs().then(() => {
      new MapHandler().getCurrentPos((status, res) => {
        if (status === 'complete') {
          onChange(
            JSON.stringify({
              x: res.position.lng,
              y: res.position.lat,
              address: res.formattedAddress || '',
              title: (res.addressComponent || {}).building || '',
            }),
          );
          Toast.clear();
        }
      });
    });
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  render() {
    const { disabled, value, enumDefault, enumDefault2, advancedSetting, onChange, from, strDefault } = this.props;
    const { visible } = this.state;
    const onlyCanAppUse = (typeof strDefault === 'string' ? strDefault : '00')[0] === '1';
    let location = null;

    const isGoogle = !!getMapConfig();

    if (value) {
      try {
        location = JSON.parse(value);
      } catch (error) {
        console.log(error);
      }
    }
    let locationForShow = location || {};
    if (
      (locationForShow.coordinate || '').toLowerCase() === 'wgs84' &&
      locationForShow.x &&
      locationForShow.y &&
      !getMapConfig()
    ) {
      const coordinate = wgs84togcj02(location.x, location.y);
      locationForShow.x = coordinate[0];
      locationForShow.y = coordinate[1];
    }
    if (onlyCanAppUse && !value) {
      if (isMobile) {
        return (
          <div
            className="customFormControlBox customFormButton TxtCenter"
            onClick={() => {
              if (isApp) {
                this.handleAuthentication();
              } else {
                this.handleH5Location();
              }
            }}
          >
            <span className="Bold Font13 LineHeight34">{_l('点击获取当前位置经纬度')}</span>
          </div>
        );
      }

      return (
        <div className="customLocationDisabled">
          <span>{_l('请在移动端中获取当前位置')}</span>
          <Icon
            icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'location'}
            className="Font16"
          />
        </div>
      );
    }

    return (
      <Fragment>
        {!_.isObject(location) ? (
          <div
            className="customFormControlBox customFormButton flexRow"
            onClick={() => {
              if (isApp) {
                this.handleAuthentication();
              } else {
                this.setState({ visible: true });
              }
            }}
          >
            <span className="flex mRight20 Gray_bd">{_l('请选择')}</span>
            {!disabled && (
              <Icon
                icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'location'}
                className="Font16 Gray_bd"
              />
            )}
          </div>
        ) : (
          <LocationWrap
            isMobile={isMobile}
            onClick={() => {
              if (window.isMingDaoApp) {
                this.handleMDAppOpenLocation(location);
              } else if (!isMobile || disabled) {
                if (isGoogle) {
                  window.open(
                    `https://www.google.com/maps?q=${location.y},${location.x}&ll=${location.y},${location.x}&z=15`,
                  );
                  return;
                }
                window.open(`https://uri.amap.com/marker?position=${location.x},${location.y}`);
              } else {
                if (isApp) {
                  this.handleAuthentication();
                } else {
                  this.setState({ visible: true });
                }
              }
            }}
          >
            <div className="location">
              {!disabled && (
                <div className="deleteIcon Absolute">
                  <CardButton
                    className="red"
                    onClick={evt => {
                      evt.stopPropagation();
                      onChange('');
                    }}
                  >
                    <i className="icon icon-close" />
                  </CardButton>
                </div>
              )}

              <div className="flexRow">
                <div className="flex">
                  <div className="title breakAll">{location.title || _l('位置')}</div>
                  <div className="address breakAll">{location.address}</div>
                  {(advancedSetting.showxy === '1' || (!location.title && !location.address)) && (
                    <div className="xy">{`${toFixed(location.y, 6)}，${toFixed(location.x, 6)}`}</div>
                  )}
                </div>
                {!disabled && !isMobile && !onlyCanAppUse && (
                  <div className="locationIcon">
                    <span data-tip={_l('编辑定位')}>
                      <Icon
                        icon="Reposition-01"
                        className="Gray_9e ThemeHoverColor3 pointer Font30"
                        onClick={evt => {
                          evt.stopPropagation();
                          if (isApp) {
                            this.handleAuthentication();
                          } else {
                            this.setState({ visible: true });
                          }
                        }}
                      />
                    </span>
                  </div>
                )}
              </div>

              {!!enumDefault && (
                <Fragment>
                  {isGoogle ? (
                    <div className="mapWrap relative">
                      <Gmap
                        lat={locationForShow.y}
                        lng={locationForShow.x}
                        disabled={true}
                        mapContainerStyle={{ width: '100%', minHeight: '110px' }}
                      />
                    </div>
                  ) : (
                    <div className="mapWrap relative">
                      <div
                        className="Absolute"
                        style={{ top: 0, right: 0, bottom: 0, left: 0, background: 'transparent', zIndex: 1 }}
                      />
                      <Amap
                        mapSearch={false}
                        mapStyle={{ minHeight: '110px', minWidth: 'auto' }}
                        defaultAddress={{
                          lng: locationForShow.x,
                          lat: locationForShow.y,
                        }}
                      />
                    </div>
                  )}
                </Fragment>
              )}
            </div>
          </LocationWrap>
        )}

        {visible && (
          <MDMap
            isMobile={isMobile}
            allowCustom={advancedSetting.allowcustom === '1'}
            distance={!!enumDefault2 ? parseInt(advancedSetting.distance) : 0}
            defaultAddress={location || null}
            onAddressChange={({ lng, lat, address, name }) => {
              onChange(JSON.stringify({ x: lng, y: lat, address, title: name, coordinate: isGoogle ? 'wgs84' : null }));
              this.setState({ visible: false });
            }}
            onClose={() => {
              this.setState({ visible: false });
            }}
          />
        )}

        {this.props.default === '1' && <div className="hidden" ref={container => (this._mapContainer = container)} />}
      </Fragment>
    );
  }
}
