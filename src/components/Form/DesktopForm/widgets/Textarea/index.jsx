import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Linkify, Textarea } from 'ming-ui';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import TextMarkdown from '../../../components/TextMarkdown';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const TextareaWrap = styled.div`
  position: relative;
  width: 100%;
  .customFormControlBox {
    padding: 6px 12px !important;
    ${props => (props.isEditing ? 'display: none;' : '')}
    ${props => (props.isSingleLine ? '' : 'line-height: 1.5;')}
    ${props =>
      props.disabled
        ? 'padding: 6px 0px !important;'
        : props.showMaskValue || props.hint
          ? ''
          : 'position: absolute;top: 0;right: 0;left: 0;bottom: 0;pointer-events: none; padding: 6px 12px !important;'}
    span a {
      pointer-events: all;
    }
  }
  .customFormTextarea {
    ${props => (props.disabled || ((props.showMaskValue || props.hint) && !props.isEditing) ? 'display: none;' : '')}
    ${props => (props.isEditing ? '' : 'border-color: transparent !important;color: transparent;')}
  }
`;

const Text = props => {
  const {
    controlId,
    disabled,
    formItemId,
    value = '',
    enumDefault,
    onChange,
    onBlur,
    hint,
    advancedSetting = {},
    triggerCustomEvent,
    renderMaskContent = () => {},
    handleMaskClick = () => {},
    showMaskValue = false,
    isMaskReadonly = false,
    createEventHandler = () => {},
  } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [originValue, setOriginValue] = useState('');

  const textRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'trigger_tab_enter':
          setIsEditing(true);
          break;
        case 'trigger_tab_leave':
          textRef.current && textRef.current.blur();
          break;
        default:
          break;
      }
    }, []),
  );

  const getEditValue = useCallback(() => {
    return enumDefault === 2 ? value.replace(/\r\n|\n/g, ' ') : value;
  }, [enumDefault, value]);

  // 穿透pointer-events：none;禁用滚动事件
  const syncScroll = useCallback(
    event => {
      const coverLayer = document.querySelector(`#textareaPointEvents-${controlId} .customFormTextareaBox`);
      if (coverLayer) {
        coverLayer.scrollTop = event.target.scrollTop;
      }
    },
    [controlId],
  );

  useEffect(() => {
    if (enumDefault !== 2 && textRef.current) {
      textRef.current.addEventListener('scroll', syncScroll);

      return () => {
        // 穿透pointer-events禁用滚动
        textRef.current && textRef.current.removeEventListener('scroll', syncScroll);
      };
    }
  }, []);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.value = getEditValue();
      // 手动触发 input 事件以调整 textarea 高度
      $(textRef.current).trigger('input');
      // 当value为空时，直接重置高度为最小高度
      if (!getEditValue()) {
        const minH = enumDefault === 1 ? Number(advancedSetting.minheight || '90') : 36;
        $(textRef.current).height(minH);
      }
    }
  }, [enumDefault, value, advancedSetting.minheight]);

  useEffect(() => {
    if (isEditing) {
      textRef.current && textRef.current.focus();
    }
  }, [isEditing]);

  const handleFocus = e => {
    // 只读不激活输入框
    if (disabled) return;

    // 单多行均有此问题
    // 文本框 tab键聚焦或shift+tab键聚焦 值不写入问题
    if (textRef.current && textRef.current.value !== value) {
      e.target.value = getEditValue();
    }
    setOriginValue(e.target.value.trim());
    setIsEditing(true);
    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleBlur = newValue => {
    setIsEditing(false);
    if (window.isWeiXin) {
      // 处理微信webview键盘收起 网页未撑开
      window.scrollTo(0, 0);
    }
    onBlur(originValue, newValue);
  };

  const getShowValue = hint => {
    const isUnLink = advancedSetting.analysislink !== '1';
    const currentValue = getEditValue();

    if (currentValue) {
      if (showMaskValue) {
        return dealMaskValue({ ...props, value: currentValue });
      }
      return isUnLink ? (
        currentValue
      ) : (
        <Linkify properties={{ target: '_blank' }} unLimit={true}>
          {currentValue}
        </Linkify>
      );
    } else {
      return hint;
    }
  };

  /**
   * 多行文本进入编辑
   */
  const joinTextareaEdit = evt => {
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
      setIsEditing(true);
    }
  };

  const handleTextareaBlur = event => {
    const trimValue = event.target.value.trim();
    if (trimValue !== value) {
      onChange(trimValue);
    }
    handleBlur(trimValue);
  };

  const compositionOptions = {
    onCompositionEnd: event => {
      // 谷歌浏览器：compositionstart onChange compositionend
      // 火狐浏览器：compositionstart compositionend onChange
      if (window.isChrome) {
        onChange(event.target.value);
      }
    },
  };

  const minHeight = Number(advancedSetting.minheight || '90');
  const maxHeight = advancedSetting.maxheight ? Number(advancedSetting.maxheight) : 'auto';
  const isSingleLine = enumDefault === 2;

  return (
    <TextareaWrap
      id={`textareaPointEvents-${controlId}`}
      isEditing={isEditing}
      isSingleLine={isSingleLine}
      disabled={disabled}
      showMaskValue={showMaskValue}
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
          ...(enumDefault !== 2 ? { maxHeight, overflowX: 'hidden' } : {}),
        }}
        onClick={joinTextareaEdit}
      >
        <span className={cx('WordBreak', { maskHoverTheme: isMaskReadonly })} onClick={handleMaskClick}>
          {getShowValue(hint)}
          {renderMaskContent()}
        </span>
      </div>

      <Textarea
        isFocus={isEditing}
        className="customFormTextarea escclose"
        minHeight={enumDefault === 1 ? minHeight : 36}
        {...(isSingleLine ? {} : { maxHeight })}
        manualRef={con => (textRef.current = con)}
        placeholder={isEditing ? hint : ''}
        spellCheck={false}
        onFocus={handleFocus}
        onBlur={handleTextareaBlur}
        onKeyDown={createEventHandler}
        {...compositionOptions}
      />
    </TextareaWrap>
  );
};

const TextWidget = props => {
  if (props.enumDefault === 3) {
    return <TextMarkdown {...props} />;
  }
  return <Text {...props} />;
};

Text.propTypes = {
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  enumDefault: PropTypes.number,
  strDefault: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
};

export default memo(TextWidget, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'controlId', 'showMaskValue', 'isMaskReadonly']),
    _.pick(nextProps, ['value', 'disabled', 'controlId', 'showMaskValue', 'isMaskReadonly']),
  );
});
