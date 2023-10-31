import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Tooltip from 'ming-ui/components/Tooltip';
import { browserIsMobile } from 'src/util';
import './SearchInput.less';

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
  render() {
    const { focusedClass, style, searchIcon } = this.props;
    const { value, isFocus } = this.state;
    const { className, keyWords, onOk, onClear, onFocus, onBlur, placeholder } = this.props;
    return (
      <div
        className={cx(
          'searchInputComp',
          className,
          { default: !isFocus, flex: isFocus && browserIsMobile() },
          isFocus ? focusedClass : '',
        )}
        style={style}
      >
        <div className="inputCon">
          <Tooltip disable={isFocus} popupPlacement="bottom" text={<span>{placeholder || _l('搜索')}</span>}>
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
          <input
            ref={inputEl => {
              this.inputEl = inputEl;
            }}
            placeholder={placeholder || _l('搜索')}
            type={browserIsMobile() ? 'search' : 'text'}
            value={value}
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
            onBlur={() => {
              if (!value && !keyWords) {
                this.setState({ isFocus: false });
                onBlur();
              }
            }}
          />
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
        </div>
      </div>
    );
  }
}
