import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
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
    debounceTime: PropTypes.number,
  };
  static defaultProps = {
    style: {},
    onClear: () => {},
    onOk: () => {},
    onFocus: () => {},
    onBlur: () => {},
    debounceTime: 500,
  };
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false,
    };
    this.handleDebouncedOk = _.debounce(value => {
      this.props.onOk(value);
    }, props.debounceTime);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (typeof this.props.active !== 'undefined') {
        this.setState({
          isFocus: this.props.active,
        });
      }

      if (prevProps.viewId !== this.props.viewId) {
        this.handleDebouncedOk.cancel();
        this.setState({
          value: '',
          isFocus: false,
        });
      }
    }
  }
  componentWillUnmount() {
    this.handleDebouncedOk.cancel();
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
              className="icon icon-search textTertiary"
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
                this.handleDebouncedOk.cancel();
                onOk(e.target.value);
              }
            }}
            onChange={e => {
              const value = e.target.value;
              this.setState({ value });
              this.handleDebouncedOk(value);
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
                this.handleDebouncedOk.cancel();
                onOk('');
              }
            }}
          />
          <i
            className={cx('icon icon-workflow_cancel textTertiary Font16', {
              hide: !value,
            })}
            onClick={() => {
              this.handleDebouncedOk.cancel();
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
