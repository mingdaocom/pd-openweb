import React from 'react';
import { CommonDisplay } from '../../styled';
import { getRelationText } from '../../util/index';

export default function Relation({ data }) {
  const text = getRelationText(data.enumDefault);
  return (
    <CommonDisplay>
      <div className="intro">
        <i className="icon-add"></i>
        <span>{text}</span>
      </div>
    </CommonDisplay>
  );
}
