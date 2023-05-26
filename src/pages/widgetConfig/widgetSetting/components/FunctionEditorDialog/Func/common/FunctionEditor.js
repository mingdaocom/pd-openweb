import React from 'react';
import ReactDOM from 'react-dom';
import CodeMirror from 'codemirror';
import useShowHint from '../lib/show-hint';
import useMatchBrackets from '../lib/matchbrackets';
import useCloseBrackets from '../lib/closebrackets';
import setJavascriptMode from '../lib/javascript';
import { functions } from '../enum';
import '../lib/show-hint.css';
import _ from 'lodash';

setJavascriptMode(CodeMirror);
useCloseBrackets(CodeMirror);
useMatchBrackets(CodeMirror);
useShowHint(CodeMirror);

function createElement(text, style = {}) {
  const dom = document.createElement('span');
  dom.innerText = text;
  Object.keys(style).forEach(key => {
    dom.style[key] = style[key];
  });
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
    { value, options = {}, type = 'mdfunction', getControlName = () => {}, renderTag, onChange = () => {} } = {},
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
      ...options,
    };
    if (type === 'mdfunction') {
      args.keywords = _.assign(
        ...Object.keys(functions).map(key => ({
          [key]: {
            type: 'fn',
            style: 'customFn',
          },
        })),
      );
    }
    this.editor = CodeMirror(dom, args);
    this.type = type;
    this.getControlName = getControlName;
    this.renderTag = renderTag;
    this.onChange = onChange;
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

    editor.on('cursorActivity', (cm, event) => {
      const cursor = cm.getCursor();
      const line = this.editor.getLine(cursor.line);
      const beforeChar = line.charAt(cursor.ch - 1);
      const afterChar = line.charAt(cursor.ch);
      if (/[A-Z]/.test(beforeChar) || /[A-Z]/.test(afterChar)) {
        const matchs = groupMatch(line, /([a-zA-Z0-9]+)(?=\()/g);
        matchs.forEach(match => {
          if (cursor.ch >= match.start && cursor.ch <= match.end) {
            window.emitter.emit('FUNCTIONEDITOR_ACTIVE_FN', match.str[0]);
          }
        });
      }
    });
    editor.on('inputRead', (...args) => {
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
    });
  }
  handleDefaultActiveFn(value = '') {
    const matchs = groupMatch(value, /([a-zA-Z0-9]+)(?=\()/g);
    if (matchs.length && matchs[0].str && matchs[0].str[0]) {
      window.emitter.emit('FUNCTIONEDITOR_ACTIVE_FN', matchs[0].str[0]);
    }
  }
  showHint() {
    const editor = this.editor;
    CodeMirror.showHint(
      editor,
      function () {
        const cursor = editor.getCursor();
        const token = editor.getTokenAt(cursor);
        const start = token.start;
        const end = cursor.ch;
        const line = cursor.line;
        return {
          list: _.sortBy(
            Object.keys(functions)
              .filter(fn => fn.indexOf(token.string.toUpperCase()) > -1)
              .map(fn => ({
                text: fn,
                displayText: fn,
              })),
            'text',
          ),
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
                window.emitter.emit('FUNCTIONEDITOR_ACTIVE_FN', item.text);
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
  insertTag({ value, text }, position, type = 'column') {
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
  // markBrackets(cursor) {
  //   const line = this.editor.getLine(cursor.line);
  //   const beforeChar = line.charAt(cursor.ch - 1);
  //   const afterChar = line.charAt(cursor.ch);
  //   // console.log({ beforeChar, afterChar });
  //   const isBracket = /[()]/.test(beforeChar) || /[()]/.test(afterChar);
  //   if (!isBracket) {
  //     return;
  //   }
  //   const activeBracketPos = { line: cursor.line, ch: /[()]/.test(beforeChar) ? cursor.ch - 1 : cursor.ch };
  //   // console.log(activeBracketPos);
  //   const matchedChar = line.charAt(activeBracketPos) === '(' ? ')' : '(';
  //   let matchedBracketPos;
  //   let matchCount = 0;
  //   this.editor
  //     .getValue()
  //     .split('\n')
  //     .slice(activeBracketPos.line)
  //     .forEach((line, lineNum) => {
  //       if (matchedBracketPos) {
  //         return;
  //       }
  //       const regexp = /[()]/g;
  //       const needMatchText = line.slice(lineNum === 0 ? activeBracketPos.ch + 1 : 0);
  //       var match = regexp.exec(needMatchText);
  //       while (match != null) {
  //         if (match[0] === matchedChar) {
  //           matchCount--;
  //         } else {
  //           if (matchCount === 0) {
  //             matchedBracketPos = { line: cursor.line + lineNum, ch: match.index };
  //             break;
  //           } else {
  //             matchCount++;
  //           }
  //         }
  //         // result.push({
  //         //   str: match,
  //         //   start: match.index,
  //         //   end: match.index + match[0].length,
  //         //   line: lineNum,
  //         // });
  //         match = regexp.exec(needMatchText);
  //       }
  //     });
  //   console.log(matchedBracketPos);
  //   this.editor.markText(
  //     { line: matchedBracketPos.line, ch: matchedBracketPos.ch },
  //     { line: matchedBracketPos.line, ch: matchedBracketPos.ch + 1 },
  //     {
  //       replacedWith: createElement(matchedChar === '(' ? ')' : '(', { margin: '0 3px', color: '#F44336' }),
  //       handleMouseEvents: true,
  //     },
  //   );
  // }
  renderColumnTag(id, options = {}, cb = () => {}) {
    let node;
    if (_.isFunction(this.renderTag)) {
      node = document.createElement('span');
      const tag = this.renderTag(id, options);
      if (React.isValidElement(tag)) {
        ReactDOM.render(tag, node, () => {
          cb(node);
        });
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
    const matchs = groupMatch(value, /([a-zA-Z0-9]+)(?=\()/g);
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
    const matchs = groupMatch(value, /[,\(\)\[\]\"\'\+\-\*\/]/g);
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
    const matchs = groupMatch(value, /[，（）]/g);
    matchs.forEach(match => {
      this.editor.markText(
        { line: match.line, ch: match.start },
        { line: match.line, ch: match.end },
        {
          replacedWith: createElement(match.str[0], { margin: '0 3px', color: '#F44336' }),
          handleMouseEvents: true,
        },
      );
    });
  }
  markElements() {
    // 处理函数呈现
    // this.markFunction();
    // 处理符号
    // this.markSymbol();
    // 高亮显示中文符号
    this.markChineseSymbol();
    // 处理字段
    this.markControls();
  }
}
