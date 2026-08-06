import React from 'react';
import { pathCompletion } from 'src/utils/common';

export default function PriceTip(props) {
  const { text } = props;
  const url = pathCompletion('/billingrules');
  return (
    <span>
      {text}
      {window.platformENV.isPlatform ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mLeft5">
          {_l('查看扣费规则')}
        </a>
      ) : null}
    </span>
  );
}
