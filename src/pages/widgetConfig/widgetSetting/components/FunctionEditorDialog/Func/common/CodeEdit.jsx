import { arrayOf, func, shape, string, bool } from 'prop-types';
import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';
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
  &::after {
    content: '=';
    color: #757575;
    position: absolute;
    top: -1px;
    margin-left: 6px;
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
  }
`;

function CodeEdit(props, ref) {
  const { mode, type, value, title, placeholder, controls, renderTag, onClick = () => {} } = props;
  const readOnly = mode === 'read';
  const editorDomRef = useRef();
  const editorRef = useRef();
  useEffect(() => {
    if (editorDomRef.current) {
      const functionEditor = new FunctionEditor(editorDomRef.current, {
        value,
        options: { readOnly: mode === 'read' ? 'nocursor' : undefined },
        getControlName: controlId => (_.find(controls, { controlId }) || {}).controlName,
        renderTag,
        type,
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
    getValue: () => editorRef.current.editor.getValue(),
    setValue: v => editorRef.current.editor.setValue(v),
  }));
  return (
    <Con readOnly={readOnly} onClick={onClick}>
      {!readOnly && <Title ref={ref}>{title}</Title>}
      {readOnly && !value && placeholder && <PlaceHolder>{placeholder}</PlaceHolder>}
      <Editor readOnly={readOnly} ref={editorDomRef} />
    </Con>
  );
}

export default forwardRef(CodeEdit);

CodeEdit.propTypes = {
  mode: bool,
  type: string,
  title: string,
  value: string,
  placeholder: string,
  controls: arrayOf(shape({})),
  renderTag: func,
  onClick: func,
};
