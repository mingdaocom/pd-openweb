import React from 'react';
import { bool, func, number, shape } from 'prop-types';
import MDMap from 'ming-ui/components/amap/MDMap';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import { browserIsMobile } from 'src/utils/platform/browser/device';

export default function ShowMap(props) {
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

export function useSelectLocation() {
  return useFunctionWrapComponent(ShowMap);
}
