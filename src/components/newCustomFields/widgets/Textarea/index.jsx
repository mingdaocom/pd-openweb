import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Textarea, Linkify, Icon } from 'ming-ui';
import cx from 'classnames';
import TextScanQRCode from '../../components/TextScanQRCode';
import { getIsScanQR } from '../../components/ScanQRCode';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { browserIsMobile } from 'src/util';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

export default class Widgets extends Component {
  static propTypes = {
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    enumDefault: PropTypes.number,
    strDefault: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  };

  state = {
    isEditing: false,
    originValue: '',
    maskStatus: _.get(this.props, 'advancedSetting.datamask') === '1',
  };

  isOnComposition = false;

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (
      this.text &&
      (!_.isEqual(nextProps.enumDefault, this.props.enumDefault) || !_.isEqual(nextProps.value, this.props.value))
    ) {
      this.text.value =
        nextProps.enumDefault === 2 ? (nextProps.value || '').replace(/\r\n|\n/g, ' ') : nextProps.value || '';
    }
  }

  onFocus = e => {
    // 单多行均有此问题
    // 文本框 tab键聚焦或shift+tab键聚焦 值不写入问题
    if ((!this.text && this.props.value) || (this.text && this.text.value !== this.props.value)) {
      // 客户配置出现enumDefault为0的情况，统一按单行来
      if (!_.includes([0, 2], this.props.enumDefault)) {
        this.joinTextareaEdit(e);
      } else {
        e.target.value = this.props.value || '';
      }
    }
    this.setState({ originValue: e.target.value.trim() });
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  onChange = value => {
    this.props.onChange(value);
  };

  onBlur = newValue => {
    const { onBlur } = this.props;
    const { originValue } = this.state;

    this.setState({ isEditing: false });
    if (window.isWeiXin) {
      // 处理微信webview键盘收起 网页未撑开
      window.scrollTo(0, 0);
    }
    onBlur(originValue, newValue);
  };

  /**
   * 多行文本进入编辑
   */
  joinTextareaEdit = evt => {
    const { disabled, advancedSetting, value } = this.props;
    const href = evt.target.getAttribute('href');

    // 复制中的时候不进入编辑
    if (window.getSelection().toString()) return;

    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'nofollow noopener noreferrer';
      a.click();
      evt.preventDefault();
    } else if (!disabled && advancedSetting.dismanual !== '1') {
      this.setState({ isEditing: true }, () => {
        if (this.text) {
          this.text.value = value || '';
          this.text.focus();
        }
      });
    }
  };

  getShowValue = hint => {
    const { value = '', advancedSetting } = this.props;
    const isUnLink = advancedSetting.analysislink !== '1';

    if (value) {
      if (this.state.maskStatus) {
        return dealMaskValue(this.props);
      }
      return isUnLink ? value : <Linkify properties={{ target: '_blank' }}>{value}</Linkify>;
    } else {
      return hint;
    }
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  render() {
    const {
      disabled,
      value = '',
      enumDefault,
      strDefault = '10',
      advancedSetting,
      projectId,
      maskPermissions,
    } = this.props;
    let { hint } = this.props;
    const { isEditing, maskStatus } = this.state;
    const isMask = maskPermissions && enumDefault === 2 && value && maskStatus;
    const disabledInput = advancedSetting.dismanual === '1';
    const isSingleLine = enumDefault === 2;
    const isScanQR = getIsScanQR();
    const startTextScanCode = !disabled && isScanQR && strDefault.split('')[1] === '1';
    const compositionOptions = {
      onCompositionStart: () => (this.isOnComposition = true),
      onCompositionEnd: event => {
        if (event.type === 'compositionend') {
          this.isOnComposition = false;
        }

        // 谷歌浏览器：compositionstart onChange compositionend
        // 火狐浏览器：compositionstart compositionend onChange
        if (window.isChrome) {
          this.onChange(event.target.value);
        }
      },
    };

    // 开启扫码输入并且禁止手动输入
    if (startTextScanCode && disabledInput) {
      hint = hint || _l('请扫码输入');
    } else if (disabledInput) {
      hint = _l('请在移动端扫码输入');
    }

    return (
      <Fragment>
        {!isEditing ? (
          <div
            className={cx(
              'customFormControlBox customFormTextareaBox',
              { Gray_bd: !value },
              { controlDisabled: disabled },
              { textAreaDisabledControl: enumDefault === 1 && disabled },
            )}
            style={{
              minHeight: enumDefault === 1 ? 90 : 36,
              width: startTextScanCode ? 'calc(100% - 42px)' : '100%',
              lineHeight: 1.5,
              ...(disabled ? { wordBreak: 'break-all' } : {}),
            }}
            onClick={this.joinTextareaEdit}
          >
            <span
              className={cx('WordBreak', { maskHoverTheme: disabled && isMask })}
              style={browserIsMobile() ? { wordWrap: 'break-word' } : {}}
              onClick={() => {
                if (disabled && isMask) this.setState({ maskStatus: false });
              }}
            >
              {this.getShowValue(hint)}
              {isMask && <Icon icon="eye_off" className={cx('Gray_bd', disabled ? 'mLeft7' : 'maskIcon')} />}
            </span>

            {!disabled && !disabledInput && (
              <input type="text" className="smallInput" onFocus={() => this.setState({ isEditing: true })} />
            )}
          </div>
        ) : isSingleLine ? (
          <input
            type="text"
            className="customFormControlBox escclose"
            style={{ width: startTextScanCode ? 'calc(100% - 42px)' : '100%', padding: '7px 12px 6px' }}
            ref={text => {
              this.text = text;
            }}
            autoFocus={isEditing}
            placeholder={hint}
            onFocus={this.onFocus}
            onChange={event => {
              if (!this.isOnComposition) {
                this.onChange(event.target.value);
              }
            }}
            onBlur={event => {
              const trimValue = event.target.value.trim();
              if (trimValue !== value) {
                this.onChange(trimValue);
              }
              this.onBlur(trimValue);
            }}
            {...compositionOptions}
          />
        ) : (
          <Textarea
            isFocus
            className="customFormTextarea escclose"
            style={{ width: startTextScanCode ? 'calc(100% - 42px)' : '100%' }}
            minHeight={enumDefault === 1 ? 90 : 36}
            maxHeight={400}
            manualRef={text => {
              this.text = text;
            }}
            placeholder={hint}
            spellCheck={false}
            onFocus={this.onFocus}
            onChange={value => {
              if (!this.isOnComposition) {
                this.onChange(value);
              }
            }}
            onBlur={event => {
              const trimValue = event.target.value.trim();
              if (trimValue !== value) {
                this.onChange(trimValue);
              }
              this.onBlur(trimValue);
            }}
            {...compositionOptions}
          />
        )}

        {startTextScanCode && (
          <TextScanQRCode
            projectId={projectId}
            disablePhoto={strDefault.split('')[0] === '1'}
            onChange={this.onChange}
          />
        )}
      </Fragment>
    );
  }
}
