import React, { useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import cx from 'classnames';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/display/placeholder';
import { MODE } from './enum';
import './TagTextarea.less';
import _, { get, includes } from 'lodash';

const TagWrapper = ({ onDidMount = () => {}, tag }) => {
  useLayoutEffect(() => {
    onDidMount();
  });

  return tag;
};

export default class TagTextarea extends React.Component {
  static propTypes = {
    noCursor: PropTypes.bool,
    className: PropTypes.string,
    mode: PropTypes.number,
    rightIcon: PropTypes.bool,
    readonly: PropTypes.bool,
    operatorsSetMargin: PropTypes.bool,
    defaultValue: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxHeight: PropTypes.number,
    renderTag: PropTypes.func,
    getRef: PropTypes.func,
    onAddClick: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    codeMirrorMode: PropTypes.string,
    lineNumbers: PropTypes.bool,
  };

  static defaultProps = {
    maxHeight: 500,
    mode: MODE.TEXT,
    operatorsSetMargin: false,
    defaultValue: '',
    noCursor: false,
    lineNumbers: false,
    getRef: () => {},
    onAddClick: () => {},
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }

  componentDidMount() {
    const {
      defaultValue,
      height,
      onFocus,
      onBlur,
      getRef,
      readonly,
      noCursor,
      placeholder,
      codeMirrorMode,
      lineNumbers,
    } = this.props;
    getRef(this);
    if (this.cmcon) {
      this.cmObj = CodeMirror(this.cmcon, {
        value: defaultValue,
        mode: codeMirrorMode || null,
        lineNumbers,
        lineWrapping: true,
        readOnly: readonly,
        cursorHeight: noCursor || readonly ? 0 : 1,
        placeholder: placeholder || null,
      });
      if (height) {
        this.cmObj.setSize('100%', typeof height === 'number' ? `${height}px` : height);
      }
      if (defaultValue) {
        this.updateTextareaView();
        // this.cmObj.execCommand('goDocEnd');
      }
      this.cmObj.on('change', this.handleCMChange);
      this.cmObj.on('beforeChange', (cm, obj) => {
        if (obj.origin === 'undo' || obj.origin === 'redo') {
          return;
        }
        // 事件内，mode只能从每次this.props取，不然取不到最新
        if (
          this.props.mode === MODE.ONLYTAG &&
          obj.origin !== '+delete' &&
          obj.origin !== 'inserttag' &&
          obj.origin !== 'setValue'
        ) {
          obj.cancel();
        }
        let { text } = obj;
        // 事件内，mode只能从每次this.props取，不然取不到最新
        if (
          this.props.mode === MODE.FORMULA &&
          obj.origin !== '+delete' &&
          obj.origin !== 'inserttag' &&
          obj.origin !== 'setValue'
        ) {
          text = text.map(t =>
            t
              .toUpperCase()
              .split('')
              .filter(t => (obj.origin === 'paste' ? /[0-9A-Z\+\-\*\/\(\)\,\.\$]/ : /[0-9A-Z\+\-\*\/\(\)\,\.]/).test(t))
              .join(''),
          );
        }
        if (
          this.props.mode === MODE.DATE &&
          obj.origin !== '+delete' &&
          obj.origin !== 'inserttag' &&
          obj.origin !== 'setValue'
        ) {
          text = text.map(t =>
            t
              .split('')
              .filter(t => (obj.origin === 'paste' ? /[0-9YMdhm\+\-\$]/ : /[0-9YMdhm\+\-]/).test(t))
              .join(''),
          );
        }
        obj.update(obj.from, obj.to, text);
      });
      this.cmObj.on('focus', (...args) => {
        this.cmcon.classList.add('active');
        onFocus(...args);
      });
      this.cmObj.on('blur', (...args) => {
        if (this.cmcon) {
          this.cmcon.classList.remove('active');
        }
        onBlur(...args);
      });
    }
  }

  componentWillUnmount() {
    this.props.getRef(undefined);
  }

  updateTextareaView = () => {
    const { mode, operatorsSetMargin } = this.props;
    const value = this.cmObj.getValue();
    if (this.markers) {
      this.markers.forEach(marker => marker.clear());
    }
    this.markers = [];
    this.markColumns(this.markers, value);
    if (mode === MODE.FORMULA || mode === MODE.DATE || operatorsSetMargin) {
      this.markOperators(this.markers, value);
    }
  };

  setValue = value => {
    this.cmObj.setValue(value || '');
  };

  markColumns(markers, value) {
    const poss = getRePosFromStr(value);
    poss.forEach((pos, i) => {
      this.renderColumnTag(pos.tag, { isLast: i === poss.length - 1 }, node => {
        markers.push(
          this.cmObj.markText(
            { line: pos.line, ch: pos.start },
            { line: pos.line, ch: pos.stop },
            { replacedWith: node, handleMouseEvents: true },
          ),
        );
      });
    });
  }

  markOperators(markers, value) {
    const poss = getRePosFromStr(value, /\+|\-|\*|\/|\(|\)|,/g);
    poss.forEach((pos, i) => {
      const operatorEle = document.createElement('span');
      operatorEle.classList.add('operator');
      operatorEle.innerHTML = pos.tag;
      markers.push(
        this.cmObj.markText(
          { line: pos.line, ch: pos.start },
          { line: pos.line, ch: pos.stop },
          { replacedWith: operatorEle, handleMouseEvents: true },
        ),
      );
    });
  }

  handleCMChange = (cm, obj) => {
    const { onChange } = this.props;
    const value = this.cmObj.getValue();
    if (!includes(['setValue', '*compose'], obj.origin)) {
      onChange(null, value, obj);
    }
    setTimeout(() => {
      if (obj.origin === '*compose' && !get(this, 'cmObj.display.input.composing')) {
        onChange(null, value, obj);
      }
    }, 1);
    this.updateTextareaView();
  };

  renderColumnTag = (id, options, cb) => {
    const node = document.createElement('div');
    node.classList.add('columnTagCon');
    if (_.isFunction(this.props.renderTag)) {
      const tag = this.props.renderTag(id, options);
      if (React.isValidElement(tag)) {
        const root = createRoot(node);
        root.render(<TagWrapper onDidMount={() => cb(node)} tag={tag} />);
      } else {
        node.appendChild(tag);
        cb(node);
      }
      return;
    }
    node.append(id);
    cb(node);
    return;
  };

  insertColumnTag = id => {
    const { mode, autoComma } = this.props;
    const position = this.cmObj.getCursor();
    const editorValue = this.cmObj.getValue();

    this.cmObj.replaceRange(
      `${mode === MODE.FORMULA && autoComma && editorValue[position.ch - 1] === '$' ? ',' : ''}$${id}$`,
      position,
      undefined,
      'inserttag',
    );
    this.cmObj.focus();
    if (this.cmcon) {
      this.cmcon.scrollTop = this.cmcon.scrollHeight - this.cmcon.clientHeight;
    }
  };

  handleBlur = () => {
    this.setState({ active: false });
  };

  render() {
    const { className, maxHeight, rightIcon, onAddClick } = this.props;
    return (
      <div className={cx('tagInputarea', className, { flexRow: rightIcon })}>
        <div
          className={cx('tagInputareaIuput ThemeBorderColor3', { 'flex hasRightIcon': rightIcon })}
          ref={con => (this.cmcon = con)}
          style={{ maxHeight }}
        />
        {rightIcon && (
          <span className="rightIcon Hand ThemeHoverColor3" onClick={onAddClick} data-tip={_l('添加字段')}>
            <i className="icon icon-workflow_other"></i>
          </span>
        )}
      </div>
    );
  }
}

/**
 * getRePosFromStr 正则匹配字段返回位置信息
 * */
export function getRePosFromStr(text = '', re = /\$[^ \r\n\[\](){}!@%^&*+=]+?\$/g) {
  const lines = text.split('\n');
  const positions = [];
  let m;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    while ((m = re.exec(l)) !== null) {
      var tag = m[0].substring(1, m[0].length - 1);
      positions.push({
        line: i,
        start: m.index,
        stop: m.index + m[0].length,
        tag: tag,
      });
    }
  }
  return positions;
}
