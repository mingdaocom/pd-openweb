import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import _ from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'pages/widgetConfig/config/widget';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui';
import { validateFnExpression } from 'src/utils/common';
import FunctionEditor from './FunctionEditor';

const Con = styled.div`
  padding: ${({ readOnly }) => (readOnly ? '4px 6px;' : '20px 0 0;')};
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  .description {
    font-size: 12px;
    color: #9e9e9e;
    font-weight: normal;
    margin-bottom: -10px;
    margin-top: 6px;
  }
  .subListInfo {
    display: flex;
    align-items: center;
    color: #999999;
    .icon {
      font-size: 18px;
      margin-right: 2px;
    }
  }
`;

const Title = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .controlName {
    flex: 1;
    display: flex;
    padding-right: 50px;
  }
  .name {
    font-size: 20px;
    font-weight: bold;
    max-width: 300px;
  }
  .equal {
    font-size: 20px;
    font-weight: bold;
    color: #757575;
    margin: 0 6px;
    font-family: monospace;
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

const TestButton = styled.div`
  display: inline-flex;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  width: 48px;
  height: 24px;
  line-height: 22px;
  background: #ffffff;
  border-radius: 2px 2px 2px 2px;
  border: 1px solid #1677ff;
  font-size: 12px;
  color: #1677ff;
  &:hover {
    background: #1677ff;
    color: #fff;
  }
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

const Error = styled.div`
  color: #f44336;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 0;
  .icon {
    margin-right: 4px;
  }
`;

function getControlDescription(type) {
  let result;
  switch (type) {
    case WIDGETS_TO_API_TYPE_ENUM.SWITCH:
      result = _l('为检查项字段赋值时请使用true/false，true为选中，false为不选中');
      break;
    case WIDGETS_TO_API_TYPE_ENUM.LOCATION:
      result = _l(
        '输入位置坐标信息：[x,y,标题,详细地址]。示例: [121.473667,31.230525,"Shanghai","address"]。使用WGS84坐标系，标题、详细地址可不输入',
      );
      break;
  }
  return result;
}

function CodeEdit(props, ref) {
  const {
    isWorksheetFlow,
    isCustom,
    control = {},
    mode,
    type,
    value,
    title,
    placeholder,
    controls,
    renderTag,
    appId,
    worksheetId,
    projectId,
    showTestButton,
    dialogWidth,
    onClick = () => {},
    onChange = () => {},
    insertTagToEditor = () => {},
    openTestFunctionDialog = () => {},
  } = props;
  const cache = useRef({});
  const [error, updateError] = useState();
  const setError = error => {
    updateError(error);
    cache.current.error = error;
  };
  // const [error, setError] = useState(undefined);
  const readOnly = mode === 'read';
  const editorDomRef = useRef();
  const editorRef = useRef();
  const description = getControlDescription(control.type);
  useEffect(() => {
    const handleChange = (...args) => {
      onChange(...args);
      let available = validateFnExpression(editorRef.current.editor.getValue(), type);
      if (!cache.current.error && !available) {
        setError({ text: _l('语法错误'), type: 'run' });
      } else if (available && cache.current.error && cache.current.error.type === 'run') {
        setError(undefined);
      }
    };
    if (editorDomRef.current) {
      const functionEditor = new FunctionEditor(editorDomRef.current, {
        value,
        options: {
          readOnly: mode === 'read' ? 'nocursor' : undefined,
          placeholder: !readOnly && _l('编辑时支持空格、缩进、换行'),
        },
        getControlName: controlId => (_.find(controls, { controlId }) || {}).controlName,
        controls,
        renderTag,
        type,
        onChange: handleChange,
        insertTagToEditor,
        onError: setError,
      });
      editorRef.current = window.functionEditor = functionEditor;
      handleChange();
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
  const subListHelpUrl = 'https://help.mingdao.com/worksheet/function-examples/#sumform';
  return (
    <Con readOnly={readOnly} onClick={onClick}>
      {!readOnly && (
        <Title ref={ref}>
          <div className="controlName">
            <span className="name ellipsis">{title}</span>
            <span className="equal">=</span>
          </div>
          {isCustom && control.type === 34 && (
            <Tooltip
              popupPlacement="bottom"
              text={
                <div
                  style={{
                    width: 360,
                    whiteSpace: 'break-spaces',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: _l(
                      '1.函数返回值需要保证和当前子表的数据结构完全一致，从而对子表数据进行全量替换更新。否则将会导致未知异常问题。%02.此功能仅提供给熟悉代码的用户使用，可以自由处理子表数据实现复杂业务逻辑。普通用户请谨慎使用！%1',
                      '<br /><br />',
                      `<br /><br /><a target="_blank" href="${md.global.Config.HelpUrl ? subListHelpUrl.replace('https://help.mingdao.com', md.global.Config.HelpUrl) : subListHelpUrl}">${_l('查看代码说明>')}</a>`,
                    ),
                  }}
                />
              }
            >
              <div className="subListInfo">
                <i className="icon icon-novice-circle" /> {_l('子表更新说明')}
              </div>
            </Tooltip>
          )}
          {showTestButton && (
            <TestButton
              onClick={() => {
                openTestFunctionDialog({
                  isWorksheetFlow,
                  appId,
                  worksheetId,
                  projectId,
                  width: dialogWidth,
                  control,
                  value: editorRef.current.editor.getValue(),
                  title,
                  controls,
                  editorRef: editorRef.current,
                  renderTag,
                  onChange,
                  insertTagToEditor,
                  onUpdate: newValue => {
                    editorRef.current.editor.setValue(newValue);
                  },
                });
              }}
            >
              {_l('测试')}
            </TestButton>
          )}
        </Title>
      )}
      {description && <div className="description">{description}</div>}
      {readOnly && !value && placeholder && <PlaceHolder>{placeholder}</PlaceHolder>}
      <Editor readOnly={readOnly} ref={editorDomRef} />
      {error && !readOnly && (
        <Error>
          <i className="icon icon-error1" />
          {error.text}
        </Error>
      )}
    </Con>
  );
}

export default forwardRef(CodeEdit);

CodeEdit.propTypes = {
  control: shape({}),
  dialogWidth: number,
  dialogHeight: number,
  showTestButton: bool,
  mode: bool,
  type: string,
  title: string,
  value: string,
  placeholder: string,
  controls: arrayOf(shape({})),
  renderTag: func,
  onClick: func,
  onChange: func,
  insertTagToEditor: func,
};
