import React from 'react';
import { AddRecord } from '../styled';

export default ({ onAdd }) => (
  <AddRecord
    size={24}
    className="addHierarchyRecord"
    onClick={e => {
      e.stopPropagation();
      onAdd();
    }}
  >
    <i className="icon icon-add" />
  </AddRecord>
);
