import React from 'react';
import { getRelationText } from 'src/utils/domain/control/metadata';
import { CommonDisplay } from '../../styled';

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
