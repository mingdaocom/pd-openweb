import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from 'ming-ui';

export default function EditText({ content, onBlur, style }) {
  const [value, setValue] = useState(content);
  const $ref = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      const $dom = $ref.current;
      if (!$dom) return;
      $dom.setSelectionRange(0, value.length);
      $dom.focus();
    }, 200);
  }, []);
  return (
    <Textarea
      manualRef={ref => {
        $ref.current = ref;
      }}
      defaultValue={value}
      style={{
        boxShadow: 'none',
        border: 'none',
        wordBreak: 'break-all',
        minHeight: '22px',
        marginBottom: '-6px',
        padding: '0 14px',
        ...style,
      }}
      className="editTitleTextInput"
      value={value}
      onChange={setValue}
      onBlur={() => {
        onBlur(value, value !== content);
      }}
    />
  );
}
