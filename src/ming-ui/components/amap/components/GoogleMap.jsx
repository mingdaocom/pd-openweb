import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Popup } from 'antd-mobile';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import markImg from '../img/mark_r.png';
import { getMapKey } from '../MapLoader';
import CustomLocation from './CustomLocation';
import OperatorIcon from './OperatorIcon';
import '../../less/MDMap.less';

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  i {
    font-size: ${props => (props.disabled ? '40px' : '80px')};
    color: #e0e0e0;
  }
  span {
    color: #9e9e9e;
    margin-top: 16px;
    font-size: ${props => (props.disabled ? '13px' : '17px')};
    font-weight: bold;
  }
`;

function BaseGoogleMap(props) {
  const {
    lat,
    lng,
    gMapKey,
    mapContainerStyle,
    disabled,
    children,
    zoom = 15,
    options = {},
    onMapLoad = () => {},
    onMapDragEnd = () => {},
    handleClick = () => {},
  } = props;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: gMapKey,
    libraries: ['maps', 'places'],
  });

  if (loadError) {
    return (
      <ErrorContent style={mapContainerStyle} className="TxtCenter" disabled={disabled}>
        <Icon icon="location_off" />
        <span>{_l('加载失败')}</span>
      </ErrorContent>
    );
  }

  if (!isLoaded) {
    return <LoadDiv className="w100 h100 flexCenter" style={mapContainerStyle} />;
  }

  const position = lat && lng ? { lng: parseFloat(lng), lat: parseFloat(lat) } : undefined;

  return (
    <GoogleMap
      zoom={zoom}
      mapContainerStyle={mapContainerStyle}
      center={position}
      options={{ disableDefaultUI: true, ...(disabled ? { disableDoubleClickZoom: true, draggable: false } : options) }}
      onLoad={onMapLoad}
      onDragEnd={onMapDragEnd}
      onClick={handleClick}
    >
      {children}
      {!children && position && <Marker position={position} icon={markImg}></Marker>}
    </GoogleMap>
  );
}

// key没获取前,加载地图会报错
export function Gmap(props) {
  const [gMapKey, setKey] = useState('');

  useEffect(() => {
    setKey(_.get(getMapKey('gmap'), 'key') || '');
  }, []);

  if (!gMapKey) {
    return <LoadDiv className="w100 h100 flexCenter" style={props.mapContainerStyle} />;
  }

  return <BaseGoogleMap {...props} gMapKey={gMapKey} />;
}

export default function GoogleMapCom(props) {
  const [customLocation, setCustomLocation] = useState(null);
  const [defaultLocation, setDefaultLocation] = useState(null);
  const [map, setMap] = useState(null);
  const { lat = '40.7167', lng = '-74' } = customLocation || {};

  useEffect(() => {
    getCurrentLocation();
  }, [map]);

  // 获取当前定位
  const getCurrentLocation = () => {
    if (props.defaultAddress) {
      setDefault();
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setPosition(lat, lng);
          setDefaultLocation({
            position: {
              lng,
              lat,
            },
          });
        },
        () => {
          // 定位失败
          if (props.defaultAddress) {
            setDefault();
          }
        },
      );
    }
  };

  // 默认定位
  const setDefault = () => {
    const { x, y, address, title } = props.defaultAddress;
    setDefaultLocation({
      position: {
        lng: x,
        lat: y,
      },
    });
    setCustomLocation({
      lng: x,
      lat: y,
      address,
      name: title,
    });
    map && map.panTo({ lat: parseFloat(y), lng: parseFloat(x) });
  };

  // 点击定位
  const handleClick = e => {
    if (e.placeId) {
      // 根据placeId获取详细地址(包含name)
      const place = new google.maps.places.Place({
        id: e.placeId,
        requestedLanguage: window.getCurrentLang() || 'zh-CN',
      });

      place.fetchFields({ fields: ['displayName', 'location', 'formattedAddress'] }).then(res => {
        if (!_.isEmpty(res.place)) {
          const lat = res.place.location.lat();
          const lng = res.place.location.lng();
          setCustomLocation({
            lat,
            lng,
            address: res.place.formattedAddress,
            name: res.place.displayName,
          });
          map && map.panTo({ lat, lng });
        }
      });
    } else {
      setPosition(e.latLng.lat(), e.latLng.lng());
    }
  };

  const setPosition = (latitude, longitude) => {
    const latLng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    setCustomLocation({
      lat: latitude,
      lng: longitude,
      address: '',
      name: '',
    });
    map && map.panTo(latLng);
  };

  // 范围缩放
  const setZoom = type => {
    if (!map) return;
    if (type === 'plus') {
      map.setZoom(map.zoom + 1);
    } else {
      map.setZoom(map.zoom - 1);
    }
  };

  if (props.isMobile) {
    return (
      <Popup className="MDMap mobileModal minFull topRadius mobileMap" visible>
        <div className="flexColumn h100 relative">
          <OperatorIcon
            {...props}
            defaultLocation={defaultLocation}
            setPosition={(lng, lat) => setPosition(lat, lng)}
            setZoom={type => setZoom(type)}
          />
          <div className="Relative" style={{ height: 254 }}>
            <Gmap
              lat={lat}
              lng={lng}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              onMapLoad={map => setMap(map)}
              onMapDragEnd={() => {
                setPosition(map.center.lat(), map.center.lng());
              }}
              handleClick={e => handleClick(e)}
            />
          </div>
          <div className="MDMapSidebar flexColumn pAll0 w100 flex">
            <CustomLocation
              {...props}
              customLocation={customLocation}
              setPosition={(lng, lat) => setPosition(lat, lng)}
            />
          </div>
        </div>
      </Popup>
    );
  }

  return (
    <Dialog.DialogBase className="MDMap" width="1080" visible overlayClosable={false}>
      <OperatorIcon
        {...props}
        defaultLocation={defaultLocation}
        setPosition={(lng, lat) => setPosition(lat, lng)}
        setZoom={type => setZoom(type)}
      />
      <div className="flexRow" style={{ height: 600 }}>
        <div className="MDMapSidebar flexColumn pAll0">
          <CustomLocation
            {...props}
            customLocation={customLocation}
            setPosition={(lng, lat) => setPosition(lat, lng)}
          />
        </div>

        <div className="flex h100 Relative">
          <Gmap
            lat={lat}
            lng={lng}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            onMapLoad={map => setMap(map)}
            onMapDragEnd={() => {
              setPosition(map.center.lat(), map.center.lng());
            }}
            handleClick={e => handleClick(e)}
          />
        </div>
      </div>
    </Dialog.DialogBase>
  );
}
