import React, { useState, useEffect } from 'react';
import { string } from 'prop-types';
import { CircleAdd } from '../../styled';

export default function UserPicker(props) {
  return (
    <CircleAdd>
      <i className="icon-add"></i>
    </CircleAdd>
  );
}
