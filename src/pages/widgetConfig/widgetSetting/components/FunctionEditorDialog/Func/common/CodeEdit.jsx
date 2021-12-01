import { arrayOf, shape, string } from 'prop-types';
import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';
import FunctionEditor from './FunctionEditor';

const Con = styled.div`
  padding: 20px 0 0;
  height: 100%;
  display: flex;
  flex-direction: column;
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

const Editor = styled.div`
  flex: 1;
  padding: 20px 0;
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
  const { value, control, controls } = props;
  const editorDomRef = useRef();
  const editorRef = useRef();
  useEffect(() => {
    if (editorDomRef.current) {
      const functionEditor = new FunctionEditor(editorDomRef.current, {
        value,
        getControlName: controlId => (_.find(controls, { controlId }) || {}).controlName,
      });
      editorRef.current = window.functionEditor = functionEditor;
    }
  }, []);
  useImperativeHandle(ref, () => ({
    insertTag: (tag, position, type) => {
      editorRef.current.insertTag(tag, position, type);
    },
    insertFn: (value, position) => {
      editorRef.current.insertFn(value, position);
    },
    getValue: () => editorRef.current.editor.getValue(),
  }));
  return (
    <Con>
      <Title ref={ref}>{control.controlName}</Title>
      <Editor ref={editorDomRef} />
    </Con>
  );
}

export default forwardRef(CodeEdit);

CodeEdit.propTypes = {
  value: string,
  control: shape({}),
  controls: arrayOf(shape({})),
};
