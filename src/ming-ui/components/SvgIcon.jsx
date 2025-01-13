import React from 'react';
import { ReactSVG } from 'react-svg';

export default ({ url = '', size = 24, fill = '#2196f3', className, addClassName = '' }) => {
  return (
    <ReactSVG
      className={className}
      src={url}
      beforeInjection={svg => {
        if (addClassName) {
          svg.classList.add(...addClassName.split(' '));
        }

        const styleTags = svg.querySelectorAll('style');
        const styleTagArray = styleTags.length !== undefined ? styleTags : [styleTags];
        if (styleTagArray.length) {
          const uniqKey = 'svg_' + Math.random().toString(36).substring(2, 10);
          svg.classList.add(uniqKey);
          styleTagArray.forEach(styleTag => {
            styleTag.textContent = styleTag.textContent.replace(/\.([a-zA-Z0-9_-]+)/g, `.${uniqKey} .$1`);
          });
        }

        svg.setAttribute('style', `width: ${size}px;height: ${size}px;vertical-align: top;`);
        svg.setAttribute('fill', fill);
      }}
      afterInjection={(error, svg) => {
        if (error) {
          return;
        }

        const el = svg.getElementsByTagName('title')[0];

        if (el) {
          try {
            svg.removeChild(el);
          } catch (error) {}
        }

        if (
          svg &&
          svg.querySelectorAll('*') &&
          svg.querySelectorAll('*').length > 0 &&
          url.indexOf('_preserve.svg') === -1
        ) {
          try {
            svg.querySelectorAll('*').forEach(item => item.removeAttribute('fill'));
          } catch (error) {}
        }
      }}
    />
  );
};
