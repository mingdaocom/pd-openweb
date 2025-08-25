import React, { useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import CodeMirror from 'codemirror';
import _, { get, identity, isEmpty } from 'lodash';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { emitter } from 'src/utils/common';
import { checkTypeSupportForFunction } from 'src/utils/control';
import { functions } from '../enum';
import setCloseBrackets from '../lib/closebrackets';
import setJavascriptMode from '../lib/javascript';
import setMatchBrackets from '../lib/matchbrackets';
import setShowHint from '../lib/show-hint';
import { getControlType } from './ControlList';
import '../lib/show-hint.css';

const TagWrapper = ({ onDidMount = () => {}, tag }) => {
  useLayoutEffect(() => {
    onDidMount();
  });

  return tag;
};

if (!window.emitter) {
  window.emitter = emitter;
}

setJavascriptMode(CodeMirror);
setCloseBrackets(CodeMirror);
setMatchBrackets(CodeMirror);
setShowHint(CodeMirror);

function createElement(text, style = {}, { tooltip } = {}) {
  const dom = document.createElement('span');
  dom.innerText = text;
  Object.keys(style).forEach(key => {
    dom.style[key] = style[key];
  });
  if (tooltip) {
    dom.setAttribute('data-tip', tooltip);
    dom.classList.add('tip-right', 'tip-no-animation', 'tip-red');
  }
  return dom;
}

function createTagEle(text) {
  const dom = createElement(text);
  dom.style.display = 'inline-block';
  dom.style.margin = '0 4px';
  dom.style.fontSize = '12px';
  dom.style.height = '24px';
  dom.style.lineHeight = '22px';
  dom.style.color = '#3c6b90';
  dom.style.padding = '0 13px';
  dom.style.borderRadius = '24px';
  dom.style.border = '1px solid #bbd6ea';
  dom.style.background = '#d8eeff';
  dom.style.fontWeight = '500';
  if (text) {
    dom.innerText = text;
  } else {
    dom.innerText = _l('字段已删除');
    dom.style.color = '#F44336';
    dom.style.borderColor = '#FF746A';
    dom.style.background = 'rgba(244,67,54,0.13)';
  }
  return dom;
}

function groupMatch(text, matchText) {
  const result = [];
  var regexp = typeof matchText === 'string' ? new RegExp(matchText, 'g') : matchText;
  const lines = text.split('\n');
  lines.forEach((line, lineNum) => {
    var match = regexp.exec(line);
    while (match) {
      result.push({
        str: match,
        start: match.index,
        end: match.index + match[0].length,
        line: lineNum,
      });
      match = regexp.exec(line);
    }
  });
  return result;
}
export default class Function {
  constructor(
    dom,
    {
      value,
      options = {},
      type = 'mdfunction',
      getControlName = () => {},
      controls = [],
      renderTag,
      onChange = () => {},
      insertTagToEditor = () => {},
      onError = () => {},
    } = {},
  ) {
    if (!dom) {
      console.log('target is not a dom element');
      return;
    }
    const args = {
      autofocus: true,
      lineWrapping: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: 'text/javascript',
      keywords: {},
      ...options,
    };
    if (type === 'mdfunction') {
      args.keywords = _.assign(
        {},
        args.keywords,
        Object.keys(functions)
          .map(key => ({
            [key]: {
              type: 'fn',
              style: 'customFn',
            },
          }))
          .reduce((a, b) => Object.assign(a, b), {}),
      );
    }
    if (type === 'javascript') {
      args.keywords = _.assign({}, args.keywords, {
        SYSTEM_URL_PARAMS: {
          type: 'system',
          style: 'system',
        },
      });
    }
    this.editor = CodeMirror(dom, args);
    this.markers = [];
    this.type = type;
    this.getControlName = getControlName;
    this.controls = controls;
    this.renderTag = renderTag;
    this.onChange = onChange;
    this.insertTagToEditor = insertTagToEditor;
    this.onError = onError;
    this.readOnly = options.readOnly;
    if (value) {
      this.init(value);
    }
    this.bindEvent();
  }
  init(value) {
    this.editor.setValue(value);
    this.markElements();
    this.editor.setCursor(0, value.length);
    setTimeout(() => {
      this.handleDefaultActiveFn(value);
    }, 10);
  }
  bindEvent() {
    const editor = this.editor;
    editor.on('blur', () => {
      window.emitter.emit('FUNCTIONEDITOR_CLEAR');
    });

    editor.on('cursorActivity', cm => {
      const cursor = cm.getCursor();
      const line = this.editor.getLine(cursor.line);
      const beforeChar = line.charAt(cursor.ch - 1);
      const afterChar = line.charAt(cursor.ch);
      if (/[A-Z_]/.test(beforeChar) || /[A-Z_]/.test(afterChar)) {
        const matchs = groupMatch(line, /([a-zA-Z0-9__]+)(?=\()/g);
        matchs.forEach(match => {
          if (cursor.ch >= match.start && cursor.ch <= match.end) {
            window.emitter.emit('FUNCTIONEDITOR_ACTIVE_FN', match.str[0]);
          }
        });
      }
    });
    editor.on('inputRead', () => {
      if (this.type === 'mdfunction') {
        this.showHint();
      }
    });
    editor.on('change', (cm, event) => {
      if (_.isFunction(this.onChange)) {
        this.onChange();
      }
      if (event.origin === 'complete' && functions[event.text[0]]) {
        this.insertBrackets();
      } else if (event.origin === '+input') {
        //
      }
      this.markElements();
      if (_.isFunction(this.onChange)) {
        this.onChange();
      }
    });
  }
  handleDefaultActiveFn(value = '') {
    const matchs = groupMatch(value, /([a-zA-Z0-9_]+)(?=\()/g);
    if (matchs.length && matchs[0].str && matchs[0].str[0]) {
      window.emitter.emit('FUNCTIONEDITOR_ACTIVE_FN', matchs[0].str[0]);
    }
  }
  showHint() {
    const editor = this.editor;
    const controls = this.controls;
    const insertTagToEditor = this.insertTagToEditor;
    CodeMirror.showHint(
      editor,
      function () {
        const cursor = editor.getCursor();
        const token = editor.getTokenAt(cursor);
        const start = token.start;
        const end = cursor.ch;
        const line = cursor.line;
        const filteredFunctions = Object.keys(functions).filter(fn => fn.indexOf(token.string.toUpperCase()) > -1);
        const filteredControls = controls
          .filter(c => c.controlName && checkTypeSupportForFunction(c))
          .filter(control => control.controlName.toUpperCase().indexOf(token.string.toUpperCase()) > -1);
        let hintData = [];
        if (filteredControls.length) {
          hintData = hintData.concat(
            filteredControls.map(control => ({
              text: '',
              displayText: control.controlName,
              control,
              render: (parent, data, cur, i) => {
                const isLast = i === filteredControls.length - 1;
                const node = document.createElement('div');
                node.className = 'hint-item';
                if (isLast && !!filteredFunctions.length) {
                  parent.style.borderBottom = '1px solid #afdcff';
                }
                node.innerHTML = `<i class="icon icon-${getIconByType(getControlType(control) || 2)}"></i> ${
                  control.controlName
                }`;
                parent.appendChild(node);
              },
            })),
          );
        }
        if (filteredFunctions.length) {
          hintData = hintData.concat(
            _.sortBy(
              filteredFunctions.map(fnName => ({
                text: fnName,
                displayText: fnName,
                render: parent => {
                  const node = document.createElement('div');
                  node.textContent = fnName;
                  parent.appendChild(node);
                },
              })),
              'text',
            ),
          );
        }
        return {
          list: hintData,
          from: CodeMirror.Pos(line, start),
          to: CodeMirror.Pos(line, end),
          _handlers: {
            close: [
              function () {
                window.emitter.emit('FUNCTIONEDITOR_BLUR_FN');
              },
            ],
            select: [
              function (item) {
                window.emitter.emit('FUNCTIONEDITOR_FOCUS_FN', item.text);
              },
            ],
            pick: [
              function (item) {
                if (item.control) {
                  insertTagToEditor({
                    value: [get(item, 'control.workflowGroupId', ''), get(item, 'control.controlId')]
                      .filter(identity)
                      .join('-'),
                    text: get(item, 'control.controlName'),
                  });
                } else {
                  window.emitter.emit('FUNCTIONEDITOR_ACTIVE_FN', item.text);
                }
              },
            ],
          },
        };
      },
      {
        completeSingle: false,
      },
    );
  }
  insertBrackets() {
    const editor = this.editor;
    editor.replaceSelection('()');
    const cursor = editor.getCursor();
    editor.setCursor({ ...cursor, ch: cursor.ch - 1 });
  }
  insertTag({ value }, position) {
    const editor = this.editor;
    position = position || editor.getCursor();
    if (editor.getValue()[position.ch - 1] === '$') {
      editor.replaceRange(',', position);
      position = editor.getCursor();
    }
    const strToInsert = `$${value}$`;
    editor.replaceRange(strToInsert, position);
    editor.focus();
  }
  insertFn(value, position) {
    const editor = this.editor;
    position = position || editor.getCursor();
    editor.replaceRange(value, position);
    this.insertBrackets();
    editor.focus();
  }

  renderColumnTag(id, options = {}, cb = () => {}) {
    let node;
    if (_.isFunction(this.renderTag)) {
      node = document.createElement('span');
      const tag = this.renderTag(id, options);
      if (React.isValidElement(tag)) {
        const root = createRoot(node);
        root.render(<TagWrapper onDidMount={() => cb(node)} tag={tag} />);
      } else {
        node.appendChild(tag);
        cb(node);
      }
      return;
    } else {
      node = createTagEle(this.getControlName(id) || '');
    }
    cb(node);
    return;
  }
  markControls() {
    const value = this.editor.getValue();
    const matchs = groupMatch(value, /\$(.+?)\$/g);
    matchs.forEach(match => {
      this.renderColumnTag(match.str[1], {}, node => {
        this.editor.markText(
          { line: match.line, ch: match.start },
          { line: match.line, ch: match.end },
          {
            replacedWith: node,
            handleMouseEvents: true,
          },
        );
      });
    });
  }
  markFunction() {
    const value = this.editor.getValue();
    const matchs = groupMatch(value, /([a-zA-Z0-9_]+)(?=\()/g);
    matchs.forEach(match => {
      this.editor.markText(
        { line: match.line, ch: match.start },
        { line: match.line, ch: match.end },
        {
          replacedWith: (() => {
            const dom = createElement(match.str[0]);
            dom.style.color = functions[match.str[0]] ? '#4caf50' : '#F44336';
            return dom;
          })(),
          handleMouseEvents: true,
        },
      );
    });
  }
  markSymbol() {
    const value = this.editor.getValue();
    const matchs = groupMatch(value, /[,()[\]"'+\-*/]/g);
    matchs.forEach(match => {
      this.editor.markText(
        { line: match.line, ch: match.start },
        { line: match.line, ch: match.end },
        {
          replacedWith: createElement(match.str[0], { margin: '0 3px' }),
          handleMouseEvents: true,
        },
      );
    });
  }
  markChineseSymbol() {
    const value = this.editor.getValue();
    // 匹配中文逗号、括号及双引号
    const matchs = groupMatch(value, /[，（）“”]/g);
    matchs.forEach(match => {
      const str = match.str[0];
      let shouldMark = true;

      // 处理中文双引号
      const pos = CodeMirror.Pos(match.line, match.start);
      const token = this.editor.getTokenAt(pos);
      // 检查是否在字符串内部（token类型包含'string'）
      if (token.type && token.type.includes('string')) {
        shouldMark = false;
      }

      if (shouldMark) {
        const marker = this.editor.markText(
          { line: match.line, ch: match.start },
          { line: match.line, ch: match.end },
          {
            replacedWith: createElement(str, {
              margin: '0 3px',
              color: '#F44336', // 标红
            }),
            handleMouseEvents: true,
          },
        );
        this.markers.push(marker);
        this.onError({ text: _l('字符错误，请输入英文字符') });
      }
    });
  }
  markErrorFunctionEnd() {
    const value = this.editor.getValue();
    const matchs = groupMatch(value, /(,|\+|-|\*|\/)\)/g);
    matchs.forEach(match => {
      const marker = this.editor.markText(
        { line: match.line, ch: match.start },
        { line: match.line, ch: match.end },
        {
          atomic: false,
          inclusiveLeft: false,
          inclusiveRight: false,
          css: 'color: #F44336',
          handleMouseEvents: true,
        },
      );
      this.markers.push(marker);
      this.onError({ text: _l('错误的公式结尾') });
    });
  }

  checkCommaInControls() {
    const value = this.editor.getValue();
    const matchs = groupMatch(value, /\$(.+?)\$\$(.+?)\$/g);
    if (!isEmpty(matchs)) {
      this.onError({ text: _l('缺少分隔符或运算符') });
    }
  }

  markUnclosedBrackets() {
    const editor = this.editor;
    const bracketStack = [];
    const unclosedBrackets = [];

    // Helper function to find function name
    const findFunctionName = (line, bracketPos) => {
      let startCh = bracketPos;
      while (startCh > 0) {
        startCh--;
        const char = line[startCh];
        if (!/[A-Z_]/.test(char)) {
          startCh++;
          break;
        }
      }
      return startCh < bracketPos ? startCh : null;
    };

    for (let lineNum = 0; lineNum < editor.lineCount(); lineNum++) {
      const line = editor.getLine(lineNum);
      for (let ch = 0; ch < line.length; ch++) {
        const char = line[ch];
        const token = editor.getTokenAt({ line: lineNum, ch: ch + 1 });
        if (token.type && token.type.includes('string')) {
          continue;
        }
        if (char === '(') {
          const functionStartCh = findFunctionName(line, ch);
          bracketStack.push({
            char: '(',
            pos: { line: lineNum, ch: ch },
            functionStartCh: functionStartCh, // Store function start position
          });
        } else if (char === ')') {
          if (bracketStack.length > 0 && bracketStack[bracketStack.length - 1].char === '(') {
            bracketStack.pop();
          }
        }
      }
    }

    while (bracketStack.length > 0) {
      const unclosedBracket = bracketStack.pop();
      unclosedBrackets.push(unclosedBracket);
    }

    unclosedBrackets.forEach(unclosedBracket => {
      // If function name exists, mark from function start to bracket
      const startPos =
        unclosedBracket.functionStartCh !== null
          ? { line: unclosedBracket.pos.line, ch: unclosedBracket.functionStartCh }
          : unclosedBracket.pos;

      const marker = editor.markText(
        startPos,
        { line: unclosedBracket.pos.line, ch: unclosedBracket.pos.ch + 1 },
        {
          replacedWith: createElement(
            editor.getRange(startPos, { line: unclosedBracket.pos.line, ch: unclosedBracket.pos.ch + 1 }),
            {
              color: '#F44336',
            },
            {
              tooltip: _l('函数括号未闭合'),
            },
          ),
          handleMouseEvents: true,
        },
      );
      this.markers.push(marker);
      this.onError({ text: _l('函数括号未闭合') });
    });
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.clear());
    this.markers = [];
    this.onError();
  }

  markElements() {
    // 处理字段
    this.markControls();
    // 处理函数呈现
    // this.markFunction();
    // 处理符号
    // this.markSymbol();
    if (this.type === 'mdfunction' && !this.readOnly) {
      this.clearMarkers();
      // 高亮显示中文符号
      this.markChineseSymbol();
      // 高亮显示未闭合的括号
      this.markUnclosedBrackets();
      // 高亮公式末尾带分隔符或运算符
      this.markErrorFunctionEnd();
      // 参数没有分隔符时报错
      this.checkCommaInControls();
    }
  }
}
