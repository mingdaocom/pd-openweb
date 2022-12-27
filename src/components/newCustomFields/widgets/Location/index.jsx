import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import Amap from 'ming-ui/components/amap/Amap';
import MDMap from 'ming-ui/components/amap/MDMap';
import { FROM } from '../../tools/config';
import { browserIsMobile } from 'src/util';
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

  render() {
    const { disabled, value, enumDefault, enumDefault2, advancedSetting, onChange, from, strDefault } = this.props;
    const { visible } = this.state;
    const isMobile = browserIsMobile();
    const onlyCanAppUse = (typeof strDefault === 'string' ? strDefault : '00')[0] === '1';
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
            onClick={() => this.setState({ visible: true })}
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
