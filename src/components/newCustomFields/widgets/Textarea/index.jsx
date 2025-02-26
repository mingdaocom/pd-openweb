import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Textarea, Linkify, Icon } from 'ming-ui';
import cx from 'classnames';
import TextScanQRCode from '../../components/TextScanQRCode';
import { getIsScanQR } from '../../components/ScanQRCode';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { browserIsMobile } from 'src/util';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import styled from 'styled-components';

const TextareaWrap = styled.div`
  position: relative;
  width: ${props => (props.startTextScanCode ? 'calc(100% - 42px)' : '100%')};
  .customFormControlBox {
    padding: 6px 12px !important;
    ${props => (props.isEditing ? 'display: none;' : '')}
    ${props => (props.isSingleLine ? '' : 'line-height: 1.5;')}
    ${props =>
      props.disabled
        ? 'padding: 6px 0px !important;'
        : props.isMask || props.hint
        ? ''
        : 'position: absolute;top: 0;right: 0;left: 0;bottom: 0;pointer-events: none; padding: 6px 12px !important;'}
    span a {
      pointer-events: all;
    }
  }
  .customFormTextarea {
    ${props => (props.disabled || props.isMask || (props.hint && !props.isEditing) ? 'display: none;' : '')}
    ${props => (props.isEditing ? '' : 'border-color: transparent !important;color: transparent;')}
  }
`;

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

  get isMask() {
    const { maskPermissions, enumDefault, value } = this.props;
    return maskPermissions && enumDefault === 2 && value && this.state.maskStatus;
  }

  componentDidMount() {
    if (this.text) {
      this.text.value = this.getEditValue();
    }
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }

    if (this.props.enumDefault === 1 && this.text) {
      this.text.addEventListener('scroll', this.syncScroll);
    }
  }

  // 穿透pointer-events：none;禁用滚动事件
  syncScroll = event => {
    const coverLayer = document.querySelector(`#textareaPointEvents-${this.props.controlId} .customFormTextareaBox`);
    coverLayer.scrollTop = event.target.scrollTop;
  };

  componentWillReceiveProps(nextProps) {
    if (
      this.text &&
      (!_.isEqual(nextProps.enumDefault, this.props.enumDefault) || !_.isEqual(nextProps.value, this.props.value))
    ) {
      this.text.value = this.getEditValue(nextProps);
    }
  }

  getEditValue(nextProps) {
    const { enumDefault, value = '' } = nextProps || this.props;
    return enumDefault === 2 ? value.replace(/\r\n|\n/g, ' ') : value;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !_.isEqual(
        _.pick(nextProps, ['value', 'disabled', 'controlId']),
        _.pick(this.props, ['value', 'disabled', 'controlId']),
      ) ||
      !_.isEqual(_.pick(nextState, ['isEditing', 'maskStatus']), _.pick(this.state, ['isEditing', 'maskStatus']))
    ) {
      return true;
    }
    return false;
  }

  onFocus = e => {
    // 只读不激活输入框
    if (this.props.disabled) return;

    // 单多行均有此问题
    // 文本框 tab键聚焦或shift+tab键聚焦 值不写入问题
    if (this.text && this.text.value !== this.props.value) {
      e.target.value = this.getEditValue();
    }
    this.setState({ originValue: e.target.value.trim(), isEditing: true });
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  onChange = value => {
    this.props.onChange(value);
  };

  onBlur = newValue => {
    const { onBlur, advancedSetting = {} } = this.props;
    const { originValue } = this.state;

    this.setState({ isEditing: false, maskStatus: advancedSetting.datamask === '1' });
    if (window.isWeiXin) {
      // 处理微信webview键盘收起 网页未撑开
      window.scrollTo(0, 0);
    }
    onBlur(originValue, newValue);
  };

  getShowValue = hint => {
    const { advancedSetting } = this.props;
    const isUnLink = advancedSetting.analysislink !== '1';
    const value = this.getEditValue();

    if (value) {
      if (this.state.maskStatus) {
        return dealMaskValue({ ...this.props, value });
      }
      return isUnLink ? (
        value
      ) : (
        <Linkify properties={{ target: '_blank' }} unLimit={true}>
          {value}
        </Linkify>
      );
    } else {
      return hint;
    }
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }

    // 穿透pointer-events禁用滚动
    if (this.props.enumDefault === 1 && this.text) {
      this.text.removeEventListener('scroll', this.syncScroll);
    }
  }

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
      this.setState({ isEditing: true, maskStatus: false }, () => {
        this.text && this.text.focus();
      });
    }
  };

  render() {
    const {
      controlId,
      disabled,
      value = '',
      enumDefault,
      strDefault = '10',
      advancedSetting,
      projectId,
      formData,
    } = this.props;
    let { hint } = this.props;
    const { isEditing } = this.state;
    const disabledInput = advancedSetting.dismanual === '1';
    const isMobile = browserIsMobile();
    const minHeight = isMobile ? 90 : Number(advancedSetting.minheight || '90');
    const maxHeight = isMobile ? 400 : Number(advancedSetting.maxheight || '400');
    const isSingleLine = enumDefault === 2;
    const isScanQR = getIsScanQR();
    const startTextScanCode = !disabled && isScanQR && advancedSetting.scantype;
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
        <TextareaWrap
          id={`textareaPointEvents-${controlId}`}
          isEditing={isEditing}
          isSingleLine={isSingleLine}
          startTextScanCode={startTextScanCode}
          disabled={disabled}
          isMask={this.isMask}
          hint={!value && hint}
        >
          <div
            className={cx(
              'customFormControlBox customFormTextareaBox',
              { Gray_bd: !value },
              { controlDisabled: disabled },
              { textAreaDisabledControl: enumDefault === 1 && disabled },
            )}
            style={{
              minHeight: enumDefault === 1 ? minHeight : 36,
              ...(disabled ? { wordBreak: 'break-all' } : {}),
              ...(enumDefault === 1 ? { maxHeight, overflowX: 'hidden' } : {}),
            }}
            onClick={this.joinTextareaEdit}
          >
            <span
              className={cx('WordBreak', { maskHoverTheme: disabled && this.isMask })}
              style={isMobile ? { wordWrap: 'break-word' } : {}}
              onClick={() => {
                if (disabled && this.isMask) this.setState({ maskStatus: false });
              }}
            >
              {this.getShowValue(hint)}
              {this.isMask && <Icon icon="eye_off" className={cx('Gray_bd', disabled ? 'mLeft7' : 'maskIcon')} />}
            </span>
          </div>

          <Textarea
            isFocus={isEditing}
            className="customFormTextarea escclose"
            minHeight={enumDefault === 1 ? minHeight : 36}
            {...(isSingleLine ? {} : { maxHeight })}
            manualRef={text => {
              this.text = text;
            }}
            placeholder={isEditing ? hint : ''}
            spellCheck={false}
            onFocus={this.onFocus}
            onChange={value => {
              if (!this.isOnComposition) {
                _.debounce(() => this.onChange(value), 500);
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
        </TextareaWrap>

        {startTextScanCode && (
          <TextScanQRCode
            projectId={projectId}
            disablePhoto={strDefault.split('')[0] === '1'}
            scantype={advancedSetting.scantype || '0'}
            control={_.find(formData, { controlId }) || {}}
            onChange={this.onChange}
          />
        )}
      </Fragment>
    );
  }
}
