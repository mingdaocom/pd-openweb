import React from 'react';
import Linkify from '@mdfe/react-linkify';

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
