import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Input } from 'ming-ui';

const Con = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #151515;
  font-weight: bold;
  input {
    border: none !important;
    font-size: 16px !important;
    color: #151515 !important;
    font-weight: bold !important;
    padding-left: 0 !important;
  }
`;

export default function EditableText(props) {
  const { onChange } = props;
  const ref = useRef();
  const [value, setValue] = useState(props.value);
  const [isEditing, setIsEditing] = useState(false);
  return (
    <Con>
      {isEditing && (
        <Input
          value={value}
          manualRef={ref}
          onChange={setValue}
          onBlur={e => {
            if (!(value || '').trim()) {
              alert(_l('字段名称不能为空'), 3);
              if (ref.current) {
                ref.current.focus();
                e.preventDefault();
              }
              return;
            }
            setIsEditing(false);
            onChange(value);
          }}
        />
      )}
      {!isEditing && <div className="text">{value}</div>}
      {!isEditing && (
        <i
          className="icon icon-edit Font16 Gray_75 mLeft10 Hand"
          onClick={() => {
            setIsEditing(true);
            setTimeout(() => {
              if (ref.current) {
                ref.current.focus();
              }
            }, 10);
          }}
        ></i>
      )}
    </Con>
  );
}
