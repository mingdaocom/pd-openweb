import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Toast } from 'antd-mobile';
import Amap from 'ming-ui/components/amap/Amap';
import MDMap from 'ming-ui/components/amap/MDMap';
import { FROM } from '../../tools/config';
import { browserIsMobile } from 'src/util';
import { bindFeishu } from '../../tools/authentication';
import _ from 'lodash';

const LocationWrap = styled.div`
  .location {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    position: relative;
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.12);
      .icon-minus-square {
        display: block;
      }
    }
    .title {
      padding: 10px 12px 0;
      font-size: 14px;
      color: #333;
      font-weight: 700;
    }
    .address {
      color: #333;
      font-size: 12px;
      padding: 2px 12px 6px;
    }
    .xy {
      color: #9e9e9e;
      font-size: 12px;
      padding: 0 12px 10px;
      margin-top: -5px;
    }
    .icon-minus-square {
      display: none;
      color: #757575;
      top: -12px;
      right: -10px;
      &:hover {
        color: #515151;
      }
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

const isFeishu = window.navigator.userAgent.toLowerCase().includes('feishu');

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
    if (isFeishu && !window.h5sdk) {
      $.getScript('https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.19.js');
    }
  }

  handleAuthentication = () => {
    const { projectId } = this.props;
    if (window.currentUrl !== location.href) {
      window.currentUrl = location.href;
      window.configSuccess = false;
      window.configLoading = false;
    }
    if (window.configSuccess) {
      this.handleSelectLocation();
    } else {
      if (!window.configLoading) {
        bindFeishu(projectId).then(() => {
          window.configLoading = false;
          window.configSuccess = true;
          this.handleSelectLocation();
        });
      }
    }
  }

  handleSelectLocation = () => {
    const { strDefault, onChange } = this.props;

    if ((typeof strDefault === 'string' ? strDefault : '00')[0] === '1') {
      // 获取经纬度
      Toast.loading(_l('正在获取取经纬度，请稍后'));
      window.tt.getLocation({
        type: 'gcj02',
        timeout: 5,
        cacheTimeout: 30,
        accuracy: 'best',
        success(res) {
          const { longitude, latitude } = res;
          onChange(JSON.stringify({ x: longitude, y: latitude }));
          Toast.hide();
        },
        fail(res) {
          _alert(`getLocation fail: ${JSON.stringify(res)}`);
          Toast.hide();
        }
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
          _alert(`chooseLocation fail: ${JSON.stringify(res)}`);
        }
      });
    }
  }

  render() {
    const { disabled, value, enumDefault, enumDefault2, advancedSetting, onChange, from, strDefault } = this.props;
    const { visible } = this.state;
    const isMobile = browserIsMobile();
    const onlyCanAppUse = (typeof strDefault === 'string' ? strDefault : '00')[0] === '1' && !isFeishu;
    let location = null;

    if (value) {
      try {
        location = JSON.parse(value);
      } catch (error) {
        console.log(error);
      }
    }

    if (onlyCanAppUse && !value) {
      return (
        <div className="customLocationDisabled">
          <span>{_l('请在app中获取当前位置')}</span>
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
              if (isFeishu) {
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
            onClick={() => {
              if (!isMobile || disabled) {
                window.open(`https://uri.amap.com/marker?position=${location.x},${location.y}`);
              } else {
                this.setState({ visible: true });
              }
            }}
          >
            <div className="location">
              {!disabled && !onlyCanAppUse && (
                <Icon
                  icon="minus-square"
                  className="Font20 pointer Absolute"
                  onClick={evt => {
                    evt.stopPropagation();
                    onChange('');
                  }}
                />
              )}

              <div className="flexRow">
                <div className="flex">
                  <div className="title">{location.title || _l('位置')}</div>
                  <div className="address">{location.address}</div>
                  {(advancedSetting.showxy === '1' || (!location.title && !location.address)) && (
                    <div className="xy">
                      <span>{_l('经度：%0', location.x)}</span>
                      <span className="mLeft10">{_l('纬度：%0', location.y)}</span>
                    </div>
                  )}
                </div>
                {!disabled && !isMobile && !onlyCanAppUse && (
                  <div className="locationIcon">
                    <span data-tip={_l('重新定位')}>
                      <Icon
                        icon="location"
                        className="Font20 Gray_9e ThemeHoverColor3 pointer"
                        onClick={evt => {
                          evt.stopPropagation();
                          this.setState({ visible: true });
                        }}
                      />
                    </span>
                  </div>
                )}
              </div>

              {!!enumDefault && (
                <div className="mapWrap relative">
                  <div
                    className="Absolute"
                    style={{ top: 0, right: 0, bottom: 0, left: 0, background: 'transparent', zIndex: 1 }}
                  />
                  <Amap
                    mapSearch={false}
                    mapStyle={{ minHeight: '110px', minWidth: 'auto' }}
                    defaultAddress={{
                      lng: location.x,
                      lat: location.y,
                    }}
                  />
                </div>
              )}
            </div>
          </LocationWrap>
        )}

        {visible && (
          <MDMap
            isMobile={isMobile}
            distance={!!enumDefault2 ? parseInt(advancedSetting.distance) : 0}
            defaultAddress={location || null}
            onAddressChange={({ lng, lat, address, name }) => {
              onChange(JSON.stringify({ x: lng, y: lat, address, title: name }));
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
