import React from 'react';
import { createRoot } from 'react-dom/client';
import { getAMapPixel, getAMapPosition } from './common';
import { isFun } from './common.js';

export const MarkerConfigurableProps = [
  'position',
  'offset',
  'icon',
  'content',
  'draggable',
  'visible',
  'zIndex',
  'angle',
  'animation',
  'shadow',
  'title',
  'clickable',
  'extData',
  'label',
];

export const MarkerAllProps = MarkerConfigurableProps.concat([
  'topWhenClick',
  'bubble',
  'raiseOnDrag',
  'cursor',
  'autoRotation',
  'shape',
]);

export const getPropValue = (key, value) => {
  if (MarkerAllProps.indexOf(key) === -1) {
    return null;
  }
  if (key === 'position') {
    return getAMapPosition(value);
  } else if (key === 'offset') {
    return getAMapPixel(value);
  }
  return value;
};

export const renderMarkerComponent = (component, marker) => {
  let child = component;
  if (isFun(component)) {
    const extData = marker.getExtData();
    child = component(extData);
  }

  const root = createRoot(marker.getContent());

  root.render(<div>{child}</div>);
};
