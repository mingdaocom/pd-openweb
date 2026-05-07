import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { OverlayView } from '@react-google-maps/api';
import _ from 'lodash';
import { Gmap } from 'ming-ui/components/amap/components/GoogleMap';
import PinMarker from '../components/PinMarker';

const wrapperStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
};

const GMap = forwardRef((props, ref) => {
  const {
    zoom,
    center = [150.644, -34.397],
    markers = [],
    markOptions,
    setCenter,
    setOriginalCenter,
    getLatLngOnClick,
    isCurrentPosition,
    resetAddRecordBtn = () => {},
  } = props;
  const mapRef = useRef(null);
  const isLockRef = useRef(false);
  const isZoomingRef = useRef(false);

  const [isLoaded, setIsLoaded] = useState(false);

  const handleMapClick = e => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    console.log('111', e);
    getLatLngOnClick({ left: e.pixel.x, top: e.pixel.y, lnglat: { lng, lat } });
  };

  const getAddress = (lng, lat, callback) => {
    if (mapRef.current) {
      mapRef.current.geocoder.geocode({ location: { lng, lat } }, (results, status) => {
        if (status === 'OK' && results.length) {
          const address = results[0].formatted_address;

          callback(address);
        } else {
          callback(null);
        }
      });
    } else {
      callback && callback(null);
    }
  };

  useImperativeHandle(ref, () => ({
    moveCenter: center => {
      if (mapRef.current && center?.length === 2) {
        mapRef.current.panTo({ lng: center[0], lat: center[1] });
        setCenter({ lng: center[0], lat: center[1] });
      }
    },
    zoomByStep: step => {
      if (mapRef.current) {
        const currentZoom = mapRef.current.getZoom();
        mapRef.current.setZoom(currentZoom + step);
      }
    },
    getAddress,
  }));

  const getCurrentPosition = () => {
    // 获取当前位置
    if (isCurrentPosition && navigator.geolocation && mapRef.current && !isLockRef.current) {
      isLockRef.current = true;
      navigator.geolocation.getCurrentPosition(
        position => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter([pos.lng, pos.lat]);
          setOriginalCenter([pos.lng, pos.lat]);
        },
        err => console.error('定位失败:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  };

  useEffect(() => {
    getCurrentPosition();
  }, [isCurrentPosition]);

  useEffect(() => {
    if (!isLoaded) return;

    const dargStartListener = mapRef.current.addListener('dragstart', () => {
      resetAddRecordBtn();
    });

    const dragEndListener = mapRef.current.addListener('dragend', () => {
      const c = mapRef.current.getCenter();
      setCenter([c.lng(), c.lat()]);
    });

    const zoomChangeListener = mapRef.current.addListener('zoom_changed', () => {
      if (isZoomingRef.current) return;

      isZoomingRef.current = true;
      resetAddRecordBtn();
    });

    const idleListener = mapRef.current.addListener('idle', () => {
      isZoomingRef.current = false;
    });

    return () => {
      dargStartListener.remove();
      dragEndListener.remove();
      zoomChangeListener.remove();
      idleListener.remove();
    };
  }, [isLoaded]);

  return (
    <Gmap
      zoom={zoom}
      mapContainerStyle={wrapperStyle}
      lat={center[1]}
      lng={center[0]}
      options={{
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
      }}
      onMapLoad={mapInstance => {
        mapRef.current = mapInstance;
        setIsLoaded(true);
        if (mapRef.current && !mapRef.current.geocoder) {
          mapRef.current.geocoder = new google.maps.Geocoder();
        }

        getCurrentPosition();
      }}
      handleClick={handleMapClick}
    >
      {markers.map(item => {
        const isCurrent = _.get(markOptions, 'mapViewState.searchData.rowid') === item.record.rowid;
        return (
          <OverlayView
            key={`Overlay-${item.record.rowid}`}
            position={{ lat: item.position.y, lng: item.position.x }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            zIndex={isCurrent ? 9 : 1}
          >
            <PinMarker
              {...markOptions}
              key={`PinMark-${item.record.rowid}`}
              isCurrent={isCurrent}
              marker={item}
              type="GMap"
            />
          </OverlayView>
        );
      })}
    </Gmap>
  );
});

export default GMap;
