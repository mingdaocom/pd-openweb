import React from 'react';
import functionWrap from 'ming-ui/components/FunctionWrap';
import MDMap from 'ming-ui/components/amap/MDMap';
import { browserIsMobile } from 'src/util';
import { bool, func, number, shape } from 'prop-types';

function ShowMap(props) {
  const { distance, defaultPosition, closeAfterSelect, onSelect = () => {}, onClose = () => {} } = props;
  return (
    <MDMap
      isMobile={browserIsMobile()}
      distance={distance}
      defaultAddress={defaultPosition}
      onAddressChange={(...args) => {
        onSelect(...args);
        if (closeAfterSelect) {
          onClose();
        }
      }}
      onClose={onClose}
    />
  );
}

ShowMap.propTypes = {
  distance: number,
  closeAfterSelect: bool,
  defaultPosition: shape({}),
  onSelect: func,
  onClose: func,
};

export default function openMDMap(props) {
  functionWrap(ShowMap, props);
}
