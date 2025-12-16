import React from 'react';

export default function PriceTip(props) {
  const { text } = props;
  const { WebUrl } = md?.global?.Config || {};
  const url = WebUrl + 'billingrules';
  return (
    <span>
      {text}
      {md.global?.Config?.IsPlatformLocal ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mLeft5">
          {_l('查看扣费规则')}
        </a>
      ) : null}
    </span>
  );
}
