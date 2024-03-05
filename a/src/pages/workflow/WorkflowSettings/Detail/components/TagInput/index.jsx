import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import './index.less';

export default class TagInput extends Component {
  static propTypes = {
    defaultValue: PropTypes.string,
    className: PropTypes.string,
    createTag: PropTypes.func,
    delTag: PropTypes.func,
    disable: PropTypes.bool,
  };
  static defaultProps = {
    defaultValue: '',
    disable: false,
  };
  constructor(props) {
    super(props);
  }
  state = {
    val: this.props.defaultValue,
    charWidth: 0,
    inputActive: false,
  };

  /**
   * 创建标签
   */
  createTag = e => {
    const val = e.target.value.trim();
    const { tags } = this.props;
    if (e.keyCode === 13 || e.type === 'blur') {
      this.setState({ val: '', inputActive: false, charWidth: 12 });
      if (tags.indexOf(val) === -1 && val) {
        this.props.createTag(val);
      }
    }
  };

  onChange = e => {
    const val = e.target.value;

    this.setState({ val }, () => {
      const textWidth = this.textWrap.offsetWidth;
      const charWidth = textWidth;

      this.setState({ charWidth });
    });
  };

  handleClick = () => {
    this.tagInput.focus();
  };

  handleFocus = () => {
    this.setState({
      inputActive: true,
    });
  };

  delTag = item => {
    this.props.delTag(item);
  };

  render() {
    const { tags, className, disable } = this.props;
    const { val, inputActive, charWidth, inputFocus } = this.state;
    return (
      <div className={cx('tagInputWrap', { [className]: className, disable, active: inputActive })}>
        <ul className="tagWrap">
          {tags.map((item, i) => (
            <li key={i} className="tagItem flexRow">
              <span className="tag" title={item}>{item}</span>
              <span className="delTag" onClick={() => this.delTag(item)}>
                <Icon icon="close" className="pointer" />
              </span>
            </li>
          ))}
          <li className="flex" onClick={this.handleClick}>
            <div className="inputBox">
              <input
                type="text"
                autoFocus={inputFocus}
                disabled={disable}
                ref={node => (this.tagInput = node)}
                style={{ width: charWidth + 12 }}
                value={val}
                onFocus={this.handleFocus}
                onChange={this.onChange}
                onKeyDown={this.createTag}
                onBlur={this.createTag}
              />
            </div>
          </li>
        </ul>
        <span ref={node => (this.textWrap = node)} style={{ visibility: 'hidden', position: 'absolute' }}>
          {val}
        </span>
        <div
          className={cx('createTag ellipsis', { show: val.length !== 0 })}
          onClick={this.userTag}
        >{`使用 “${val}”`}</div>
      </div>
    );
  }
}
