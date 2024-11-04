import React, { useEffect, useState } from 'react';
import PinMarker from '../components/PinMarker';
import _ from 'lodash';
import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';
import { getMapKey } from 'src/ming-ui/components/amap/MapLoader';
import { LoadDiv } from 'ming-ui';

const wrapperStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
};

function GMap(props) {
  const { zoom, center = [150.644, -34.397], markers = [], markOptions } = props;

  const [gMapKey, setKey] = useState('');

  useEffect(() => {
    setKey(_.get(getMapKey('gmap'), 'key') || '');
  }, []);

  return (
    <div className="w100">
      {!gMapKey ? (
        <LoadDiv className="flexCenter" size="big" />
      ) : (
        <LoadScript
          loadingElement={<LoadDiv className="flexCenter" size="big" />}
          googleMapsApiKey={gMapKey}
          libraries={['maps', 'places']}
        >
          <GoogleMap
            zoom={zoom}
            mapContainerStyle={wrapperStyle}
            center={{ lng: center[0], lat: center[1] }}
            options={{
              disableDefaultUI: true,
              fullscreenControl: false,
              mapTypeControl: false,
              streetViewControl: false,
            }}
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
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
}

export default GMap;
