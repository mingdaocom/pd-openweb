import React, { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, Linkify } from 'ming-ui';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import TextMarkdown from '../../../components/TextMarkdown';
import { ADD_EVENT_ENUM } from '../../../core/enum';
import { getIsScanQR } from '../../components/ScanQRCode';
import TextScanQRCode from '../../components/TextScanQRCode';

const isScanQR = getIsScanQR();

const TextareaWrap = styled.div`
  position: relative;
  width: ${props => (props.startTextScanCode ? 'calc(100% - 42px)' : '100%')};
  .customFormTextareaView {
    ${props => props.hint && 'white-space: nowrap !important; overflow: hidden; text-overflow: ellipsis;'}
    ${props => !(props.disabled || props.isMask || props.hint) && 'pointer-events: none;'}
    span a {
      pointer-events: all;
    }
  }
  .customFormTextareaView {
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: 1;
    width: 100% !important;
    height: 100% !important;
    line-height: 1.5;
    color: var(--gray-bd) !important;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .customFormTextarea {
    box-sizing: border-box;
    border: 1px solid var(--gray-e0);
    border-radius: 3px;
    padding: 6px 12px;
    width: 100%;
    line-height: 1.5;
    vertical-align: top;
    overflow-x: hidden;
    overflow-y: auto;
    resize: none;
  }
`;

const Textarea = props => {
  const {
    className,
    hint,
    maskPermissions,
    enumDefault,
    value = '',
    advancedSetting = {},
    controlId,
    triggerCustomEvent,
    projectId,
    strDefault = '10',
    formData,
    disabled,
    formDisabled,
  } = props;
  if (enumDefault === 3) {
    return <TextMarkdown {...props} />;
  }

  const startTextScanCode = !disabled && isScanQR && advancedSetting.scantype;
  const getEditValue = () => {
    return enumDefault === 2 ? value.replace(/\r\n|\n/g, ' ') : value;
  };

  const textareaRef = useRef(null);
  const isOnComposition = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originValue, setOriginValue] = useState('');
  const [maskStatus, setMaskStatus] = useState(advancedSetting.datamask === '1');
  const [currentValue, setCurrentValue] = useState(getEditValue());
  const isMask = useMemo(() => {
    return maskPermissions && enumDefault === 2 && value && maskStatus;
  }, [maskPermissions, enumDefault, value, maskStatus]);

  const onFocus = event => {
    setOriginValue(event.target.value.trim());
    setIsEditing(true);

    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const onBlur = event => {
    const trimValue = event.target.value.trim();
    if (trimValue !== value) {
      props.onChange(trimValue);
    }
    setIsEditing(false);
    setMaskStatus(advancedSetting.datamask === '1');
    if (window.isWeiXin) {
      // 处理微信webview键盘收起 网页未撑开
      window.scrollTo(0, 0);
    }
    props.onBlur(originValue, event.target.value);
  };

  const getShowValue = () => {
    const isUnLink = advancedSetting.analysislink !== '1';
    const value = getEditValue();

    if (value) {
      if (maskStatus) {
        return dealMaskValue({ ...props, value });
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

  /**
   * 多行文本进入编辑
   */
  const joinTextareaEdit = event => {
    const href = event.target.getAttribute('href');

    // 复制中的时候不进入编辑
    if (window.getSelection().toString()) return;

    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'nofollow noopener noreferrer';
      a.click();
      event.preventDefault();
    } else if (!disabled && advancedSetting.dismanual !== '1') {
      setIsEditing(true);
      setMaskStatus(false);
      textareaRef.current.focus();
    }
  };

  // 穿透pointer-events：none;禁用滚动事件
  const syncScroll = event => {
    const coverLayer = document.querySelector(`#textareaPointEvents-${controlId} .customFormTextareaView`);
    coverLayer.scrollTop = event.target.scrollTop;
  };

  const debouncedOnChange = useRef(
    _.debounce((props, val) => {
      props.onChange(val);
    }, 500),
  ).current;

  useEffect(() => {
    if (enumDefault === 1 && textareaRef.current) {
      textareaRef.current.addEventListener('scroll', syncScroll);
    }

    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }

    return () => {
      if (_.isFunction(triggerCustomEvent)) {
        triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
      }

      // 穿透pointer-events禁用滚动
      if (enumDefault === 1 && textareaRef.current) {
        textareaRef.current.removeEventListener('scroll', syncScroll);
      }
    };
  }, [disabled]);

  useEffect(() => {
    // 动态设置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 0;
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 3}px`;
    }
  }, [isEditing, currentValue, disabled, formDisabled]);

  useEffect(() => {
    setCurrentValue(getEditValue());
  }, [value]);

  return (
    <Fragment>
      <TextareaWrap
        className="customFormTextareaWrap"
        id={`textareaPointEvents-${controlId}`}
        startTextScanCode={startTextScanCode}
        disabled={disabled}
        isMask={isMask}
        hint={!value && hint}
      >
        <div
          className={cx('customFormControlBox customFormTextareaView', {
            controlEditReadonly: !formDisabled && currentValue && disabled,
            controlDisabled: formDisabled,
          })}
          style={{
            ...(enumDefault === 1 ? { minHeight: 89, maxHeight: 10000, overflowX: 'hidden' } : { minHeight: 35 }),
            zIndex: isEditing ? -1 : 1,
          }}
          onClick={joinTextareaEdit}
        >
          <span
            onClick={() => {
              if (disabled && isMask) setMaskStatus(false);
            }}
          >
            {getShowValue()}
            {isMask && <Icon icon="eye_off" className={cx('commonFormIcon', disabled ? 'mLeft7' : 'maskIcon')} />}
          </span>
        </div>
        {!disabled && (
          <textarea
            className={cx('customFormTextarea', className)}
            value={currentValue}
            disabled={disabled}
            ref={textareaRef}
            style={{
              maxHeight: 10000,
              minHeight: enumDefault === 1 ? 90 : 36
            }}
            onFocus={onFocus}
            onChange={event => {
              const val = event.target.value;
              setCurrentValue(val);
              if (isOnComposition.current) return;
              // debouncedOnChange(props, val);
            }}
            onBlur={onBlur}
            onCompositionStart={() => (isOnComposition.current = true)}
            onCompositionEnd={event => {
              if (event.type === 'compositionend') {
                isOnComposition.current = false;
              }

              // 谷歌浏览器：compositionstart onChange compositionend
              // 火狐浏览器：compositionstart compositionend onChange
              if (window.isChrome) {
                props.onChange(event.target.value);
              }
            }}
          />
        )}
      </TextareaWrap>

      {startTextScanCode && (
        <TextScanQRCode
          projectId={projectId}
          disablePhoto={strDefault.split('')[0] === '1'}
          scantype={advancedSetting.scantype || '0'}
          control={_.find(formData, { controlId }) || {}}
          onChange={props.onChange}
        />
      )}
    </Fragment>
  );
};

Textarea.propTypes = {
  className: PropTypes.string,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  maskPermissions: PropTypes.bool,
  // 1: 多行文本框, 0: 单行文本框
  enumDefault: PropTypes.number,
  strDefault: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  triggerCustomEvent: PropTypes.func,
  projectId: PropTypes.string,
  advancedSetting: PropTypes.object,
  controlId: PropTypes.string,
  value: PropTypes.string,
  formData: PropTypes.array,
  formDisabled: PropTypes.bool,
};

export default memo(Textarea, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'controlId', 'formDisabled']),
    _.pick(nextProps, ['value', 'disabled', 'controlId', 'formDisabled']),
  );
});
