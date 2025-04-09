import React, { useRef, Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Markdown, Textarea, Icon } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import styled from 'styled-components';
import cx from 'classnames';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { createPortal } from 'react-dom';

const FullMarkdownWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  & > div {
    width: 100%;
    height: 100%;
    .rc-md-editor {
      width: 100%;
      height: 100%;
    }
  }
  .MdEditorCon {
    max-height: 100%;
  }
`;

const TextMarkdownWrap = styled.div`
  position: relative;
  .customFormMarkdown {
    padding: 0 !important;
    height: fit-content !important;
    .rc-md-editor {
      border-color: ${props => (props.isEditing ? '#2196f3' : props.disabled ? 'transparent' : '#f7f7f7')};
      ${props => (!props.disabled && !props.isMobile ? 'background: #f7f7f7;' : '')}
      .editor-container {
        .section {
          border-right: none;
          .section-container {
            padding: ${props => (props.disabled ? '6px 0' : '6px 15px 6px 12px')};
          }
        }
      }
    }
    .MdEditorCon {
      height: auto;
      max-height: 100%;
    }
  }
  .iconFullScreen {
    position: absolute;
    font-size: 20px;
    cursor: pointer;
    top: 7px;
    right: 7px;
    color: #757575;
    z-index: 1;
    &:hover {
      color: #2196f3;
    }
  }
`;

export default function TextMarkdown(props) {
  const { hint = '', value = '', disabled, advancedSetting = {}, onChange, onBlur } = props;
  const [{ isEditing, originValue, fullScreen }, setState] = useSetState({
    isEditing: false,
    originValue: '',
    fullScreen: false,
    isOnComposition: false,
  });
  const isMobile = browserIsMobile();
  const minHeight = isMobile ? 90 : Number(advancedSetting.minheight || '90');
  const maxHeight = isMobile ? 400 : Number(advancedSetting.maxheight || '400');
  const fullMarkdown = useRef(null);
  const inputRef = useRef(null);

  const handleFullScreen = e => {
    e.preventDefault();
    setState({ fullScreen: true });
  };

  useEffect(() => {
    if (fullScreen) {
      if (fullMarkdown && fullMarkdown.current) {
        fullMarkdown.current.fullScreen(true);
        fullMarkdown.current.setView({ md: !disabled, menu: !disabled, html: true });
        setTimeout(() => {
          const mdElement = fullMarkdown.current.getMdElement();
          if (mdElement) {
            mdElement.focus();
            mdElement.setSelectionRange(mdElement.value.length, mdElement.value.length);
          }
        }, 500);

        fullMarkdown.current.on('fullscreen', isFullScreen => {
          if (!isFullScreen) {
            fullMarkdown.current.fullScreen(false);
            setState({ fullScreen: false });
            inputRef && inputRef.current && inputRef.current.focus();
            // 全屏关闭时更新value
            const newValue = fullMarkdown.current.state.text;
            if (value !== newValue) {
              onChange(newValue);
            }
          }
        });
      }
    }
  }, [fullScreen]);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.value = value;
    }
  }, [isEditing, value]);

  const handleFocus = e => {
    const newValue = e.target.value;
    setState({ originValue: newValue, isEditing: true });

    if (_.isFunction(props.triggerCustomEvent)) {
      props.triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleBlur = e => {
    if (fullScreen) return;
    setState({ isEditing: false });
    const trimValue = e.target.value;
    if (trimValue !== value) {
      onChange(trimValue);
    }
    onBlur(originValue, trimValue);
  };

  const renderMarkdown = () => {
    const editProps = {
      placeholder: hint,
      linkify: advancedSetting.analysislink === '1',
      config: disabled
        ? { view: { md: false, menu: false, html: true } }
        : { view: { md: false, menu: false, html: true } },
      ...(fullScreen
        ? { ref: fullMarkdown, style: { minHeight, maxHeight: '100%' } }
        : { style: { minHeight, maxHeight } }),
    };
    return (
      <Markdown
        value={value}
        editProps={editProps}
        {..._.pick(props, ['appId', 'projectId', 'worksheetId'])}
        onSave={_.debounce(text => {
          onChange(text);
        }, 500)}
      />
    );
  };

  return (
    <Fragment>
      <TextMarkdownWrap isEditing={isEditing} disabled={disabled} isMobile={isMobile}>
        {!disabled && isEditing && (
          <span data-tip={_l('全屏编辑')} className="tip-bottom iconFullScreen" onMouseDown={handleFullScreen}>
            <Icon icon="fullscreen" />
          </span>
        )}
        {!isEditing ? (
          <div
            className={cx(
              'customFormControlBox',
              { Gray_bd: !value },
              { controlDisabled: disabled },
              { customFormMarkdown: !fullScreen },
            )}
            isEditing={isEditing}
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              setState({ isEditing: true });
            }}
          >
            {renderMarkdown()}
          </div>
        ) : (
          <Textarea
            isFocus={isEditing}
            className="customFormTextarea escclose"
            minHeight={minHeight}
            maxHeight={maxHeight}
            manualRef={text => (inputRef.current = text)}
            placeholder={isEditing ? hint : ''}
            spellCheck={false}
            autoFocus={true}
            onFocus={handleFocus}
            onChange={value => {
              if (!isOnComposition) {
                _.debounce(() => onChange(value), 500);
              }
            }}
            onBlur={handleBlur}
            onCompositionStart={() => setState({ isOnComposition: true })}
            onCompositionEnd={event => {
              if (event.type === 'compositionend') {
                setState({ isOnComposition: false });
              }

              if (window.isChrome) {
                onChange(event.target.value);
              }
            }}
          />
        )}
      </TextMarkdownWrap>

      {fullScreen &&
        createPortal(
          <FullMarkdownWrap className="fullScreenMarkdown">{renderMarkdown()}</FullMarkdownWrap>,
          document.body,
        )}
    </Fragment>
  );
}
