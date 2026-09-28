import React, { cloneElement, forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import styled, { keyframes } from 'styled-components';
import { BgIconButton, Icon } from 'ming-ui';
import { PromptInput } from 'src/components/Agent/ui';
import { compatibleMDJS } from 'src/utils/services/project';
import { chooseMingoApp } from '../../services/chooseImage';
import { getMobileComposerClassName } from './utils';

const APP_PICKER_LAUNCH_GUARD_MS = 500;

const promptExpand = keyframes`
  0% {
    transform: scaleX(0.96);
  }
  100% {
    transform: scaleX(1);
  }
`;

const PromptInputContainer = styled.div`
  width: 100%;
  flex-shrink: 0;
`;

const AttachmentProxy = styled.div`
  position: fixed;
  top: 0;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const AddMenuOverlay = styled.div`
  position: fixed;
  z-index: 10001;
  inset: 0;
`;

const AddMenu = styled.div`
  position: absolute;
  box-sizing: border-box;
  width: 200px;
  padding: 10px 8px 9px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background: var(--color-background-card);
  box-shadow: var(--shadow-sm);

  .mobileMingoAddMenuItem {
    display: flex;
    height: 46px;
    align-items: center;
    gap: 16px;
    padding: 0 8px;
    color: var(--color-text-primary);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;

    .icon {
      width: 20px;
      color: var(--color-text-secondary);
      font-size: 18px;
      text-align: center;
    }
  }
`;

const StyledPromptInput = styled(PromptInput)`
  isolation: isolate;
  position: relative;
  width: 100%;
  min-height: 60px;
  flex-shrink: 0;
  border: 0;
  border-radius: 30px;
  background: transparent;
  transition:
    min-height 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-radius 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.2s ease;

  &::before {
    position: absolute;
    z-index: -1;
    inset: 0;
    border-radius: inherit;
    background: var(--color-background-secondary);
    content: '';
    pointer-events: none;
    transform-origin: right bottom;
  }

  &.mobileMingoPromptInput--expanded {
    min-height: 110px;
    border-radius: 20px;
  }

  &.focused.mobileMingoPromptInput--expanded {
    &::before {
      animation: ${promptExpand} 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
    }
  }

  .mentionEditor {
    box-sizing: border-box;
    min-height: 60px;
    max-height: 160px;
    padding: 19px 60px;
    font-size: 15px;
    line-height: 22px;
    transition:
      min-height 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
      padding 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .mentionEditor[data-empty='true']::before {
    top: 19px;
    left: 60px;
    transition:
      top 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
      left 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  &.mobileMingoPromptInput--without-add-button {
    .mentionEditor {
      padding-left: 22px;
    }

    .mentionEditor[data-empty='true']::before {
      left: 22px;
    }
  }

  .mentionInputWrap {
    transition: padding-bottom 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  &.mobileMingoPromptInput--expanded .mentionInputWrap {
    padding-bottom: 60px;
  }

  &.mobileMingoPromptInput--expanded .mentionEditor {
    min-height: 50px;
    max-height: 100px;
    overflow-y: auto;
    padding: 14px 22px;
  }

  &.mobileMingoPromptInput--expanded .mentionEditor[data-empty='true']::before {
    top: 14px;
    left: 22px;
  }

  .promptInputFooter {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 60px;
    padding: 0 15px 0 20px;
    pointer-events: none;
  }

  .footerStart,
  .promptInputActions {
    gap: 0;
    pointer-events: auto;
  }

  .mobileMingoAttachmentButton,
  .promptVoiceButton,
  .promptSendButton {
    position: relative;
    flex: none;
    width: 32px;
    height: 32px;
    padding: 0 !important;
    border-radius: 50% !important;

    &::before {
      position: absolute;
      inset: -6px;
      content: '';
    }
  }

  .mobileMingoAttachmentButton {
    background: transparent;
    .btnIcon {
      font-size: 24px;
    }
  }

  .promptVoiceButton {
    background: var(--color-mingo);
    .btnIcon {
      color: var(--color-white);
      font-size: 18px;
    }
  }

  .promptSendButton {
    display: none;
    .btnIcon {
      font-size: 20px;
      transform: rotate(-90deg);
    }
  }

  &.mobileMingoPromptInput--sendable {
    .promptVoiceButton {
      display: none;
    }
    .promptSendButton {
      display: inline-flex;
    }
  }

  &.mobileMingoPromptInput--recording {
    box-shadow:
      45px calc(12px + var(--mobile-mingo-recording-glow-offset, 0px))
        calc(60px + var(--mobile-mingo-recording-glow-size, 0px)) 6px
        color-mix(in srgb, var(--color-mingo) 6%, transparent),
      25px calc(25px + var(--mobile-mingo-recording-glow-offset, 0px))
        calc(60px + var(--mobile-mingo-recording-glow-size, 0px)) 6px
        color-mix(in srgb, var(--color-primary) 6%, transparent),
      5px calc(32px + var(--mobile-mingo-recording-glow-offset, 0px))
        calc(60px + var(--mobile-mingo-recording-glow-size, 0px)) 6px
        color-mix(in srgb, var(--color-success) 5%, transparent),
      -5px calc(32px + var(--mobile-mingo-recording-glow-offset, 0px))
        calc(60px + var(--mobile-mingo-recording-glow-size, 0px)) 6px
        color-mix(in srgb, var(--color-yellow) 5%, transparent),
      -25px calc(25px + var(--mobile-mingo-recording-glow-offset, 0px))
        calc(60px + var(--mobile-mingo-recording-glow-size, 0px)) 6px
        color-mix(in srgb, var(--color-warning) 6%, transparent),
      -45px calc(12px + var(--mobile-mingo-recording-glow-offset, 0px))
        calc(60px + var(--mobile-mingo-recording-glow-size, 0px)) 6px
        color-mix(in srgb, var(--color-error) 6%, transparent);

    .mentionEditor {
      color: var(--color-text-primary);
    }
    .footerStart {
      min-width: 0;
    }
    .promptRecorder {
      min-width: 0;
      flex: 1;
    }
    .recorderIcon,
    .recordTime {
      display: none;
    }
    .promptSendButton {
      display: inline-flex;
      background: transparent !important;
      .btnIcon {
        display: none;
      }
      &::after {
        width: 16px;
        height: 16px;
        border-radius: 2px;
        background: var(--color-text-secondary);
        content: '';
      }
    }
    .recorderStatus {
      max-width: 140px;
      margin: 0 auto;
      padding: 0;
    }
  }

  &.mobileMingoPromptInput--loading .promptInputActions > div {
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    .icon {
      color: ${() => (md.global.SysSettings.aiBrandThemeColor ? 'var(--color-mingo)' : 'var(--color-text-secondary)')};
      font-size: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &.focused.mobileMingoPromptInput--expanded::before {
      animation: none;
    }

    .mentionEditor,
    .mentionEditor[data-empty='true']::before,
    .mentionInputWrap {
      transition: none;
    }
  }
`;

function MobileMingoPromptInput({ className, ...props }, ref) {
  const { attachmentSlot, cameraSlot, enableMention = true, onCameraOpen, onSubmit, ...promptInputProps } = props;
  const containerRef = useRef(null);
  const promptInputRef = useRef(null);
  const attachmentProxyRef = useRef(null);
  const attachmentTriggerRef = useRef(null);
  const appPickerLaunchAtRef = useRef(0);
  const [menuPosition, setMenuPosition] = useState(null);

  const setPromptInputRef = useCallback(
    node => {
      promptInputRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const closeMenu = useCallback(() => {
    setMenuPosition(null);
  }, []);

  const openMenu = useCallback(e => {
    e?.preventDefault();

    if (window.isMingDaoApp) {
      if (attachmentTriggerRef.current) {
        attachmentTriggerRef.current.click();
      } else {
        promptInputRef.current?.insertAt();
      }

      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    setMenuPosition({
      left: rect.left,
      bottom: window.innerHeight - rect.top + 8,
    });
  }, []);

  useEffect(() => {
    if (!menuPosition) return;

    window.addEventListener('resize', closeMenu);
    window.addEventListener('orientationchange', closeMenu);

    return () => {
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('orientationchange', closeMenu);
    };
  }, [menuPosition, closeMenu]);

  const openAppSelector = useCallback(() => {
    closeMenu();
    setTimeout(() => promptInputRef.current?.insertAt(), 0);
  }, [closeMenu]);

  const openAttachmentPicker = useCallback(() => {
    closeMenu();
    const fileInput = attachmentProxyRef.current?.querySelector('input[type="file"]');

    if (fileInput) {
      fileInput.click();
    } else {
      attachmentTriggerRef.current?.click();
    }
  }, [closeMenu]);

  const openCamera = useCallback(() => {
    closeMenu();
    onCameraOpen?.();
  }, [closeMenu, onCameraOpen]);

  const handleSubmit = useCallback(
    (...args) => {
      onSubmit?.(...args);
      promptInputRef.current?.blur();
    },
    [onSubmit],
  );

  const attachmentProxySlot = React.isValidElement(attachmentSlot)
    ? cloneElement(
        attachmentSlot,
        undefined,
        <button ref={attachmentTriggerRef} type="button" tabIndex={-1} aria-hidden="true" />,
      )
    : null;
  const cameraProxySlot = React.isValidElement(cameraSlot) ? cameraSlot : null;
  const showAddButton = Boolean(attachmentProxySlot || enableMention);

  const handleActionFeedback = useCallback(() => {
    compatibleMDJS('vibrate', {});
  }, []);

  const handleSelectApp = useCallback((insertApp, closePicker) => {
    const now = Date.now();

    // onInput 和 onKeyUp 可能连续触发两次，只拦截同一轮输入造成的重复拉起。
    // 不依赖原生 cancel 回调维持长期锁，避免原生层直接关闭且不回调后无法再次打开。
    if (now - appPickerLaunchAtRef.current < APP_PICKER_LAUNCH_GUARD_MS) return;

    appPickerLaunchAtRef.current = now;
    chooseMingoApp({
      onChoose: insertApp,
      onFinish: () => {
        appPickerLaunchAtRef.current = 0;
        closePicker();
      },
    });
  }, []);

  return (
    <PromptInputContainer ref={containerRef}>
      <StyledPromptInput
        {...promptInputProps}
        ref={setPromptInputRef}
        enableMention={enableMention}
        onSelectApp={window.isMingDaoApp ? handleSelectApp : undefined}
        onSubmit={handleSubmit}
        submitOnEnter={false}
        attachmentSlot={
          showAddButton ? (
            <BgIconButton
              className="mobileMingoAttachmentButton"
              style={{ borderRadius: '8px', padding: '6px' }}
              icon="plus"
              onClick={openMenu}
            />
          ) : null
        }
        className={cx('mobileMingoPromptInput', className, {
          'mobileMingoPromptInput--without-add-button': !showAddButton,
        })}
        getStateClassName={getMobileComposerClassName}
        sendButtonIcon="arrow_forward"
        showMentionButton={false}
        recordingButtonMode="stop"
        showAttachmentWhileRecording
        discardWhitespaceOnlyRecordingBase
        onActionFeedback={handleActionFeedback}
      />
      {attachmentProxySlot && <AttachmentProxy ref={attachmentProxyRef}>{attachmentProxySlot}</AttachmentProxy>}
      {cameraProxySlot && <AttachmentProxy>{cameraProxySlot}</AttachmentProxy>}
      {menuPosition &&
        createPortal(
          <AddMenuOverlay onMouseDown={closeMenu}>
            <AddMenu style={menuPosition} onMouseDown={e => e.stopPropagation()}>
              {cameraProxySlot && (
                <div className="mobileMingoAddMenuItem" onClick={openCamera}>
                  <Icon icon="camera_alt" />
                  <span>{_l('拍照')}</span>
                </div>
              )}
              {attachmentProxySlot && (
                <div className="mobileMingoAddMenuItem" onClick={openAttachmentPicker}>
                  <Icon icon="attachment" />
                  <span>{_l('附件')}</span>
                </div>
              )}
              {enableMention && (
                <div className="mobileMingoAddMenuItem" onClick={openAppSelector}>
                  <Icon icon="widgets" />
                  <span>{_l('应用')}</span>
                </div>
              )}
            </AddMenu>
          </AddMenuOverlay>,
          document.body,
        )}
    </PromptInputContainer>
  );
}

export default forwardRef(MobileMingoPromptInput);
