import { arrayOf, func, shape, string, bool } from 'prop-types';
import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';
import { WIDGETS_TO_API_TYPE_ENUM } from 'pages/widgetConfig/config/widget';
import FunctionEditor from './FunctionEditor';
import _ from 'lodash';

const Con = styled.div`
  padding: ${({ readOnly }) => (readOnly ? '4px 6px;' : '20px 0 0;')}
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Title = styled.div`
  position: relative;
  font-size: 20px;
  font-weight: bold;
  .name {
    &::after {
      content: '=';
      color: #757575;
      position: absolute;
      top: -1px;
      margin-left: 6px;
    }
  }
  .description {
    font-size: 13px;
    color: #bdbdbd;
    font-weight: normal;
    margin-bottom: -10px;
  }
`;

const PlaceHolder = styled.div`
  z-index: 2;
  position: absolute;
  left: 10px;
  top: 9px;
  color: #bdbdbd;
  font-size: 14px;
`;

const Editor = styled.div`
  flex: 1;
  padding: ${({ readOnly }) => (readOnly ? '0px' : '20px 0;')}
  overflow: hidden;
  .CodeMirror {
    font-family: Monaco, monospace;
    width: 100%;
    height: 100%;
    font-size: 14px;
    .cm-customFn {
      color: #4caf50;
    }
    .cm-system {
      color: #ffa100;
    }
  }
`;

function getControlDescription(type) {
  let result;
  switch (type) {
    case WIDGETS_TO_API_TYPE_ENUM.SWITCH:
      result = _l('为检查项字段赋值时请使用true/false，true为选中，false为不选中');
      break;
  }
  return result;
}

function CodeEdit(props, ref) {
  const {
    control = {},
    mode,
    type,
    value,
    title,
    placeholder,
    controls,
    renderTag,
    onClick = () => {},
    onChange = () => {},
  } = props;
  const readOnly = mode === 'read';
  const editorDomRef = useRef();
  const editorRef = useRef();
  const description = getControlDescription(control.type);
  useEffect(() => {
    if (editorDomRef.current) {
      const functionEditor = new FunctionEditor(editorDomRef.current, {
        value,
        options: { readOnly: mode === 'read' ? 'nocursor' : undefined },
        getControlName: controlId => (_.find(controls, { controlId }) || {}).controlName,
        renderTag,
        type,
        onChange,
      });
      editorRef.current = window.functionEditor = functionEditor;
    }
  }, []);
  useEffect(() => {
    if (readOnly && editorRef.current) {
      editorRef.current.editor.setValue(value);
    }
  }, [value]);
  useImperativeHandle(ref, () => ({
    insertTag: (tag, position, type) => {
      editorRef.current.insertTag(tag, position, type);
    },
    insertFn: (value, position) => {
      editorRef.current.insertFn(value, position);
    },
    getValue: () => editorRef.current && editorRef.current.editor.getValue(),
    setValue: v => editorRef.current && editorRef.current.editor.setValue(v),
  }));
  return (
    <Con readOnly={readOnly} onClick={onClick}>
      {!readOnly && (
        <Title ref={ref}>
          <div className="name"> {title}</div>
          {description && <div className="description">{description}</div>}
        </Title>
      )}
      {readOnly && !value && placeholder && <PlaceHolder>{placeholder}</PlaceHolder>}
      <Editor readOnly={readOnly} ref={editorDomRef} />
    </Con>
  );
}

export default forwardRef(CodeEdit);

CodeEdit.propTypes = {
  control: shape({}),
  mode: bool,
  type: string,
  title: string,
  value: string,
  placeholder: string,
  controls: arrayOf(shape({})),
  renderTag: func,
  onClick: func,
  onChange: func,
};
