import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import Amap from 'ming-ui/components/amap/Amap';
import { Gmap } from 'ming-ui/components/amap/components/GoogleMap';
import MDMap from 'ming-ui/components/amap/MDMap';
import { CardButton } from 'src/pages/worksheet/components/Basics.jsx';
import { getMapConfig, toFixed, wgs84togcj02 } from 'src/utils/control';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const LocationWrap = styled.div`
  .location {
    box-shadow:
      0 1px 4px rgba(0, 0, 0, 0.12),
      0 0 2px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    position: relative;
    &:hover {
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.12),
        0 0 2px rgba(0, 0, 0, 0.12);
      .deleteIcon {
        display: block;
      }
    }
    .title {
      padding: 10px 12px 0;
      font-size: 14px;
      color: var(--color-text-primary);
      font-weight: 700;
    }
    .address {
      color: var(--color-text-primary);
      font-size: 12px;
      padding: 2px 12px 6px;
    }
    .xy {
      color: var(--color-text-tertiary);
      font-size: 12px;
      padding: 0 12px 10px;
      margin-top: -5px;
    }
    .deleteIcon {
      display: none;
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

const Widgets = props => {
  const {
    disabled,
    value,
    enumDefault,
    enumDefault2,
    advancedSetting,
    onChange,
    strDefault,
    default: defaultProp,
    formItemId,
  } = props;
  const [visible, setVisible] = useState(false);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'Enter':
          if (valueRef.current) return;
          setVisible(true);
          break;
        case 'trigger_tab_leave':
          setVisible(false);
          break;
        default:
          break;
      }
    }, []),
  );

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
      <div className="customLocationDisabled">
        <span>{_l('请在移动端中获取当前位置')}</span>
        <Icon icon="location" className="Font16" />
      </div>
    );
  }

  return (
    <Fragment>
      {!_.isObject(location) ? (
        <div
          className="customFormControlBox customFormButton flexRow customFormLocation"
          onClick={() => {
            setVisible(true);
          }}
        >
          <span className="flex mRight20 Gray_bd">{_l('请选择')}</span>
          {!disabled && <Icon icon="location" className="Font16 Gray_bd" />}
        </div>
      ) : (
        <LocationWrap
          onClick={() => {
            if (isGoogle) {
              window.open(
                `https://www.google.com/maps?q=${location.y},${location.x}&ll=${location.y},${location.x}&z=15`,
              );
              return;
            }
            window.open(`https://uri.amap.com/marker?position=${location.x},${location.y}`);
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
              {!disabled && !onlyCanAppUse && (
                <div className="locationIcon">
                  <Tooltip title={_l('编辑定位')}>
                    <span>
                      <Icon
                        icon="Reposition-01"
                        className="Gray_9e ThemeHoverColor3 pointer Font30"
                        onClick={evt => {
                          evt.stopPropagation();
                          setVisible(true);
                        }}
                      />
                    </span>
                  </Tooltip>
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
          allowCustom={advancedSetting.allowcustom === '1'}
          distance={enumDefault2 ? parseInt(advancedSetting.distance) : 0}
          defaultAddress={location || null}
          onAddressChange={({ lng, lat, address, name }) => {
            onChange(JSON.stringify({ x: lng, y: lat, address, title: name, coordinate: isGoogle ? 'wgs84' : null }));
            setVisible(false);
          }}
          onClose={() => {
            setVisible(false);
          }}
        />
      )}

      {defaultProp === '1' && <div className="hidden" />}
    </Fragment>
  );
};

Widgets.propTypes = {
  from: PropTypes.number,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  enumDefault: PropTypes.number,
  enumDefault2: PropTypes.number,
  onChange: PropTypes.func,
  default: PropTypes.string,
};

export default Widgets;
