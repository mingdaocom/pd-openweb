import React from 'react';
import { string, element } from 'prop-types';
import { navigateTo } from 'src/router/navigateTo';

export default function PurchaseExpandPack(props) {
  const { className, text, type, projectId, routePath = 'expansionservice', extraParam } = props;

  const handleClick = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    navigateTo(`/admin/${routePath}/${projectId}/${type}${extraParam ? '/' + extraParam : ''}`);
  };

  if (md.global.Config.IsLocal) return null;

  return (
    <span className={`Normal ThemeColor Hand ${className}`} onClick={handleClick}>
      {text}
    </span>
  );
}

PurchaseExpandPack.prototypes = {
  className: string,
  text: element,
  type: string,
  projectId: string,
  routePath: string,
  extraParam: string,
};
