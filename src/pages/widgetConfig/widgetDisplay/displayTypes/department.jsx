import React from 'react';
import { CircleAdd } from '../../styled';

export default function Department(props) {
  return (
    <CircleAdd displayRow={props.displayRow}>
      <i className="icon-add"></i>
    </CircleAdd>
  );
}
