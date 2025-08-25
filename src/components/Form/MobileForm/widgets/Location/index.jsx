import React, { Component, Fragment } from 'react';
import { Toast } from 'antd-mobile';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import Amap from 'ming-ui/components/amap/Amap';
import { Gmap } from 'ming-ui/components/amap/components/GoogleMap';
import MapHandler from 'ming-ui/components/amap/MapHandler';
import MapLoader from 'ming-ui/components/amap/MapLoader';
import MDMap from 'ming-ui/components/amap/MDMap';
import {
  bindDing,
  bindFeishu,
  bindWeiXin,
  bindWeLink,
  bindWxWork,
  handleTriggerEvent,
} from '../../../core/authentication';
import { getMapConfig, toFixed, wgs84togcj02 } from '../../tools/utils';

const LocationWrap = styled.div`
  .locationTitle {
    padding: 10px 12px 0;
    font-size: 14px;
    color: var(--color-secondary);
    font-weight: 500;
  }
  .address {
    color: var(--color-secondary);
    font-size: 12px;
    padding: 2px 12px 6px;
  }
  .xy {
    color: var(--gray-9e);
    font-size: 12px;
    padding: 0 12px 10px;
    margin-top: -5px;
  }
`;

const { IsLocal } = md.global.Config;
const isWx = window.isWeiXin && !IsLocal && !window.isWxWork;
const isApp = window.isWxWork || isWx || window.isWeLink || window.isDingTalk || window.isFeiShu || window.isMingDaoApp;

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
        handleTriggerEvent(this.handleWxSelectLocation, bindWeiXin(projectId));
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
    const isGoogle = !!getMapConfig();
    if (isGoogle) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            onChange(
              JSON.stringify({
                x: lng,
                y: lat,
                address: '',
                title: '',
                coordinate: 'wgs84',
              }),
            );
          },
          () => {
            window.nativeAlert(_l('定位失败，请重试'));
          },
        );
        Toast.clear();
      } else {
        window.nativeAlert(_l('定位失败，请重试'));
        Toast.clear();
      }
      return;
    }
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

  render() {
    const { disabled, value, enumDefault, enumDefault2, advancedSetting, onChange, strDefault } = this.props;
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
      return (
        <div
          className="customFormControlBox customFormButton"
          onClick={() => {
            if (isApp) {
              this.handleAuthentication();
            } else {
              this.handleH5Location();
            }
          }}
        >
          <Icon icon="location" />
          <span>{_l('点击获取当前位置经纬度')}</span>
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
            {!disabled && <Icon icon="location" />}
            <span>{_l('定位')}</span>
          </div>
        ) : (
          <LocationWrap
            onClick={() => {
              if (window.isMingDaoApp) {
                this.handleMDAppOpenLocation(location);
              } else if (disabled) {
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
            <div className="cardWrap">
              {!disabled && (
                <i
                  className="icon icon-cancel removeBtn"
                  onClick={evt => {
                    evt.stopPropagation();
                    onChange('');
                  }}
                />
              )}
              <div className="flexRow">
                <div className="flex">
                  <div className="locationTitle breakAll">{location.title || _l('位置')}</div>
                  <div className="address breakAll">{location.address}</div>
                  {(advancedSetting.showxy === '1' || (!location.title && !location.address)) && (
                    <div className="xy">{`${toFixed(location.y, 6)}，${toFixed(location.x, 6)}`}</div>
                  )}
                </div>
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
            isMobile={true}
            allowCustom={advancedSetting.allowcustom === '1'}
            distance={enumDefault2 ? parseInt(advancedSetting.distance) : 0}
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
