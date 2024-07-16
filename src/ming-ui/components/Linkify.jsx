import React from 'react';
import linkifyit from 'linkify-it';

export default function MdLinkify(props) {
  const { properties } = props;

  // 剥离string
  const parseChildren = (children) => {
    if (typeof children === 'string') {
      return children.length > 1000 ? children : parseString(children);
    }
    return children;
  };

  // 匹配
  const parseString = string => {
    if (string === '') {
      return string;
    }

    const linkify = linkifyit();
    // 更多格式链接扩展
    linkify.add('weixin:', 'http:').set({ fuzzyIP: true });
    linkify.add('alipays:', 'http:').set({ fuzzyIP: true });
    const matches = linkify.match(string);

    if (!matches) {
      return string;
    }

    const elements = [];
    let lastIndex = 0;
    matches.forEach(function (match, i) {
      if (match.index > lastIndex) {
        elements.push(string.substring(lastIndex, match.index));
      }
      const parseComponent = (
        <a {...properties} href={match.url}>
          {match.text}
        </a>
      );
      elements.push(parseComponent);

      lastIndex = match.lastIndex;
    });

    if (string.length > lastIndex) {
      elements.push(string.substring(lastIndex));
    }
    return elements.length === 1 ? elements[0] : elements;
  };

  return parseChildren(props.children);
}
