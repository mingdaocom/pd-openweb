import React from 'react';
import Linkify from '@mdfe/react-linkify';
import { shape } from 'prop-types';
import { element } from 'prop-types';

export default function MdLinkify(props) {
  const { properties, ...rest } = props;
  if (typeof props.children === 'string' && props.children.length > 1000) {
    return props.children;
  }
  return (
    <Linkify
      {...rest}
      componentDecorator={(href, text) => (
        <a {...properties} href={href}>
          {text}
        </a>
      )}
    >
      {props.children}
    </Linkify>
  );
}

MdLinkify.propTypes = {
  children: element,
  properties: shape({}),
};
