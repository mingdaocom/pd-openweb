import React from 'react';
import PinMarker from '../components/PinMarker';
import _ from 'lodash';
import { OverlayView } from '@react-google-maps/api';
import { Gmap } from 'ming-ui/components/amap/components/GoogleMap';

const wrapperStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
};

function GMap(props) {
  const { zoom, center = [150.644, -34.397], markers = [], markOptions } = props;

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
}

export default GMap;
