import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from 'ming-ui/components/Tooltip';
import './index.less';

export default class SearchInput extends Component {
  static propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    focusedClass: PropTypes.string,
    style: PropTypes.shape({}),
    placeholder: PropTypes.string,
    onClear: PropTypes.func,
    onOk: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };
  static defaultProps = {
    style: {},
    onClear: () => {},
    onFocus: () => {},
    onBlur: () => {},
  };
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.active !== 'undefined') {
      this.setState({
        isFocus: nextProps.active,
      });
    }
    if (this.props.viewId !== nextProps.viewId) {
      this.setState({ value: '', isFocus: false });
    }
  }
  clear() {
    this.setState({ value: '' });
  }
  render() {
    const { inputWidth, focusedClass, style, searchIcon } = this.props;
    const { value, isFocus } = this.state;
    const { className, keyWords, onOk, onClear, onFocus, onBlur, placeholder, triggerWhenBlurWithEmpty } = this.props;
    return (
      <div
        className={cx(
          'mobileSearchInputComp queryInput mobileQueryInput',
          className,
          isFocus ? `inputFocus ${focusedClass}` : 'inputBlur',
        )}
        style={style}
      >
        <div className="inputCon">
          {!isFocus && searchIcon ? (
            <span
              onClick={() => {
                this.setState(
                  {
                    isFocus: true,
                  },
                  () => {
                    $(this.inputEl).focus();
                  },
                );
              }}
            >
              {searchIcon}
            </span>
          ) : (
            <i
              className="icon icon-search Gray_9e"
              onClick={() => {
                this.setState(
                  {
                    isFocus: true,
                  },
                  () => {
                    $(this.inputEl).focus();
                  },
                );
              }}
            />
          )}
          <input
            className="flex"
            ref={inputEl => {
              this.inputEl = inputEl;
            }}
            placeholder={placeholder || _l('搜索')}
            type="search"
            value={value}
            style={isFocus && inputWidth ? { width: inputWidth } : {}}
            onKeyUp={e => {
              if (e.keyCode === 13) {
                onOk(e.target.value);
              }
            }}
            onChange={e => {
              this.setState({ value: e.target.value });
            }}
            onFocus={() => {
              this.setState({ isFocus: true });
              onFocus();
            }}
            onBlur={e => {
              if (!value && !keyWords) {
                this.setState({ isFocus: false });
                onBlur();
              }
              if (triggerWhenBlurWithEmpty && e.target.value === '' && keyWords) {
                onOk('');
              }
            }}
          />
          <i
            className={cx('icon icon-workflow_cancel Gray_9e Font16', {
              hide: !value,
            })}
            onClick={() => {
              this.setState({ value: '', isFocus: false }, () => {
                onClear();
              });
            }}
          />
        </div>
      </div>
    );
  }
}
