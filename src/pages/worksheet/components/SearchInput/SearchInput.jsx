import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Tooltip } from 'ming-ui/antd-components';
import { browserIsMobile } from 'src/utils/common';
import './SearchInput.less';

export default class SearchInput extends Component {
  static propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    focusedClass: PropTypes.string,
    style: PropTypes.shape({}),
    placeholder: PropTypes.string,
    showCaseSensitive: PropTypes.bool,
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
      isCaseSensitive: false,
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
    const { inputWidth, focusedClass, style, searchIcon, showCaseSensitive } = this.props;
    const { value, isFocus, isCaseSensitive } = this.state;
    const { className, keyWords, onOk, onClear, onFocus, onBlur, placeholder, triggerWhenBlurWithEmpty } = this.props;
    const focusMode = isFocus || isCaseSensitive;
    return (
      <div
        className={cx(
          'searchInputComp',
          className,
          { default: !focusMode, flex: focusMode && browserIsMobile() },
          focusMode ? focusedClass : '',
        )}
        style={style}
      >
        <div className="inputCon">
          <Tooltip placement="bottom" title={isFocus ? '' : <span>{placeholder || _l('搜索')}</span>}>
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
          </Tooltip>
          {focusMode && (
            <input
              className={cx({ flex: browserIsMobile() })}
              ref={inputEl => {
                this.inputEl = inputEl;
              }}
              placeholder={placeholder || _l('搜索')}
              type={browserIsMobile() ? 'search' : 'text'}
              value={value}
              style={isFocus && inputWidth ? { width: inputWidth } : {}}
              onKeyUp={e => {
                if (e.keyCode === 13) {
                  onOk(e.target.value, { isCaseSensitive });
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
          )}
          <i
            className={cx('icon icon-cancel Hand Gray_9e', {
              none: !value,
            })}
            onClick={() => {
              this.setState({ value: '', isFocus: false }, () => {
                onClear();
              });
            }}
          />
          {showCaseSensitive && (
            <Tooltip title={isCaseSensitive ? _l('取消区分大小写') : _l('区分大小写')} placement="bottom">
              <div
                className={cx('caseSensitive', { ThemeColor3: isCaseSensitive })}
                onMouseDown={() => {
                  this.setState({ isCaseSensitive: !isCaseSensitive });
                  onOk(value, { isCaseSensitive: !isCaseSensitive });
                }}
              >
                <i className="icon icon-case"></i>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }
}
