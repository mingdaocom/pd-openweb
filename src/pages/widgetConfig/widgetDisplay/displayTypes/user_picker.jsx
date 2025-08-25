import React from 'react';
import { CircleAdd } from '../../styled';

export default function UserPicker(props) {
  return (
    <CircleAdd displayRow={props.displayRow}>
      <i className="icon-add"></i>
    </CircleAdd>
  );
}
