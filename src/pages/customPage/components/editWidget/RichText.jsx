import React from 'react';
import { string } from 'prop-types';
import BraftEditor from 'src/components/braftEditor/braftEditor';

export default function RichText(props) {
  const { onEdit, onClose, widget } = props;
  const { value } = widget;
  return <BraftEditor isEditing cacheKey="customPageRichText" summary={value} onSave={value => value && onEdit({ value })} onCancel={onClose} />;
}
