import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import styled from 'styled-components';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/eclipse.css';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/xml-hint';
import 'codemirror/addon/hint/html-hint';
import { useMeasure } from 'react-use';

const Con = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  .CodeMirror {
    height: 100%;
    border-top: 1px solid #e0e0e0;
    font-size: 14px;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }

  /* 提示框样式 */
  .CodeMirror-hints {
    position: absolute;
    z-index: 10;
    overflow: hidden;
    list-style: none;
    margin: 0;
    padding: 2px;
    border-radius: 3px;
    font-size: 90%;
    max-height: 20em;
    overflow-y: auto;
    background: white;
    border: 1px solid #ddd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .jsx-hint {
    padding: 4px 8px;
    border-radius: 2px;
    border-left: 2px solid #61dafb;
    color: #151515;
  }

  .CodeMirror-hint {
    margin: 0;
    padding: 4px 8px;
    border-radius: 2px;
    white-space: pre;
    color: #151515;
    cursor: pointer;
  }

  .CodeMirror-hint-active {
    background: #f0f0f0;
    color: #151515;
  }

  /* 选中文本的背景色 */
  .CodeMirror-selected {
    background: #e3f2fd !important;
  }

  /* 当前行的背景色 */
  .CodeMirror-activeline-background {
    background: #fafafa;
  }

  /* 光标颜色 */
  .CodeMirror-cursor {
    border-left: 1px solid #151515;
  }

  /* 行号样式 */
  .CodeMirror-linenumber {
    color: #999;
  }

  /* 折叠图标样式 */
  .CodeMirror-foldgutter {
    color: #999;
  }
`;

const CodeEditor = ({ value = '', onChange = () => {} }) => {
  const [ref, { height }] = useMeasure();
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // 扩展 JavaScript hints，添加 React 相关关键字
    const originalJavaScriptHint = CodeMirror.hint.javascript;
    CodeMirror.hint.javascript = function (editor) {
      const cursor = editor.getCursor();
      const token = editor.getTokenAt(cursor);
      const inner = originalJavaScriptHint(editor) || { from: cursor, to: cursor, list: [] };

      const reactKeywords = [
        'useState',
        'useEffect',
        'useCallback',
        'useMemo',
        'useRef',
        'useContext',
        'useReducer',
        'useLayoutEffect',
        'Fragment',
        'React.Fragment',
        'className',
        'onClick',
        'onChange',
        'onSubmit',
        'props',
        'children',
        'state',
        'render',
        'component',
        'return',
        'export default',
        'import React from "react"',
        'import { useState } from "react"',
        'import { useEffect } from "react"',
      ];

      // 过滤并添加匹配的关键字
      const matching = reactKeywords.filter(word => word.toLowerCase().startsWith(token.string.toLowerCase()));

      inner.list = [...matching, ...inner.list];
      return inner;
    };

    // 初始化 HTML hints
    if (!CodeMirror.hint.html) {
      CodeMirror.hint.html = CodeMirror.hint.xml;
    }

    // 扩展 HTML hints
    CodeMirror.hint.html.schemaInfo = {
      '!attrs': {
        className: null,
        style: null,
        onClick: null,
        onChange: null,
        onSubmit: null,
        value: null,
        type: null,
        id: null,
        name: null,
        disabled: null,
        placeholder: null,
        required: null,
        checked: null,
        readOnly: null,
      },
      div: {
        attrs: {
          className: null,
          style: null,
          onClick: null,
          id: null,
        },
      },
      span: {
        attrs: {
          className: null,
          style: null,
        },
      },
      input: {
        attrs: {
          type: ['text', 'password', 'email', 'number', 'checkbox', 'radio', 'submit'],
          value: null,
          onChange: null,
          placeholder: null,
          required: ['required'],
          disabled: ['disabled'],
        },
      },
      button: {
        attrs: {
          type: ['button', 'submit', 'reset'],
          onClick: null,
          className: null,
          disabled: ['disabled'],
        },
      },
      form: {
        attrs: {
          onSubmit: null,
          className: null,
        },
      },
      // 可以继续添加更多标签和属性
    };

    editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
      mode: 'jsx',
      theme: 'eclipse',
      lineNumbers: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
      lineWrapping: true,
      tabSize: 2,
      indentWithTabs: false,
      extraKeys: {
        'Ctrl-Space': cm => {
          cm.showHint({
            completeSingle: false,
            hint: CodeMirror.hint.javascript,
          });
        },
        Tab: cm => {
          const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
          if (cm.somethingSelected()) {
            cm.indentSelection('add');
          } else {
            cm.replaceSelection(spaces);
          }
        },
      },
    });

    // 自动触发提示
    editorRef.current.on('keyup', (editor, event) => {
      const cursor = editor.getCursor();
      const token = editor.getTokenAt(cursor);

      // 在输入 < 后触发标签提示
      if (event.key === '<') {
        editor.showHint({
          completeSingle: false,
          hint: CodeMirror.hint.html,
        });
        return;
      }

      // 在标签内输入空格后触发属性提示
      if (event.key === ' ' && token.type && token.type.includes('tag')) {
        editor.showHint({
          completeSingle: false,
          hint: CodeMirror.hint.html,
        });
        return;
      }

      // 其他情况下触发 JavaScript/JSX 提示
      if (/^[a-zA-Z0-9_.]$/.test(event.key)) {
        editor.showHint({
          completeSingle: false,
          hint: CodeMirror.hint.javascript,
        });
      }
    });

    if (value) {
      editorRef.current.setValue(value);
    }

    editorRef.current.on('change', editor => {
      const value = editor.getValue();
      const blobSizeOfKb = new Blob([value]).size / 1024;
      if (blobSizeOfKb > 64) {
        alert(_l('代码无法保存，代码长度不能超过64KB'), 3);
        return;
      }
      onChange(value);
    });

    // Update editor size when container height changes
    if (editorRef.current && height) {
      editorRef.current.setSize(null, height);
    }

    return () => {
      editorRef.current.toTextArea();
    };
  }, [height]);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
      const lastLine = editorRef.current.lastLine();
      const lastCh = editorRef.current.getLine(lastLine).length;
      editorRef.current.setCursor(lastLine, lastCh);
      editorRef.current.scrollIntoView(null, 20);
    }
  }, [value]);

  return (
    <Con ref={ref}>
      <textarea ref={textareaRef} />
    </Con>
  );
};

export default CodeEditor;
