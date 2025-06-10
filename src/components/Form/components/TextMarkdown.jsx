import React from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, MdMarkdown } from 'ming-ui';
import MarkdownDialog from 'src/ming-ui/components/MdMarkdown/MarkdownDialog.js';
import { browserIsMobile } from 'src/utils/common';
import { ADD_EVENT_ENUM } from '../core/enum';

const TextMarkdownWrap = styled.div`
  position: relative;
  border-radius: 4px;
  min-height: ${props => `${props.minHeight}px`};
  height: auto;
  ${props => (props.maxHeight ? `max-height: ${props.maxHeight}px` : '')};
  background: ${props => (props.disabled ? 'transparent' : props.isEditing ? '#fff' : '#f7f7f7')} !important;

  .vditor {
    .vditor-reset {
      background: ${props => (props.disabled ? 'transparent' : props.isEditing ? '#fff' : '#f7f7f7')} !important;
      padding: ${props => (props.disabled && !props.isCreate ? '6px 0' : '6px 15px 6px 12px')} !important;
    }
    border-color: ${props => (props.disabled ? 'transparent' : props.isEditing ? '#2196f3' : '#f7f7f7')} !important;
  }

  .iconFullScreen {
    position: absolute;
    font-size: 20px;
    cursor: pointer;
    top: 7px;
    right: 7px;
    color: #757575;
    z-index: 2;
    &:hover {
      color: #2196f3;
    }
  }
`;

export default function TextMarkdown(props) {
  const {
    hint = '',
    value = '',
    disabled,
    advancedSetting = {},
    controlName,
    appId,
    projectId,
    worksheetId,
    onChange,
    onBlur,
    recordId,
  } = props;
  const [{ isEditing, originValue, visible }, setState] = useSetState({
    isEditing: false,
    originValue: '',
    visible: false,
  });

  const isMobile = browserIsMobile();
  const minHeight = isMobile ? 90 : Number(advancedSetting.minheight || '90');
  const maxHeight = isMobile ? 10000 : Number(advancedSetting.maxheight || '400');

  const getCommonProps = () => {
    return {
      minHeight,
      maxHeight,
      placeholder: hint,
      data: value,
      disabled,
      appId,
      projectId,
      worksheetId,
      controlName,
    };
  };

  const handleFocus = value => {
    setState({ originValue: value, isEditing: true });

    if (_.isFunction(props.triggerCustomEvent)) {
      props.triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleChange = value => {
    onChange(value);
  };

  const handleBlur = newValue => {
    setState({ isEditing: false });
    onBlur(originValue, newValue);
  };

  const handleFullScreen = e => {
    e.preventDefault();
    setState({ visible: true });
  };

  return (
    <TextMarkdownWrap
      isEditing={isEditing}
      disabled={disabled}
      minHeight={minHeight}
      maxHeight={maxHeight}
      isCreate={!recordId}
      className="textMarkdown"
    >
      {!disabled && isEditing && (
        <span
          data-tip={_l('全屏编辑')}
          className="tip-bottom iconFullScreen"
          onMouseDown={handleFullScreen}
          onPointerDown={handleFullScreen}
        >
          <Icon icon="fullscreen" />
        </span>
      )}
      <MdMarkdown
        {...getCommonProps()}
        hideToolbar={true}
        handleFocus={handleFocus}
        handleBlur={handleBlur}
        handleChange={handleChange}
      />

      {visible && (
        <MarkdownDialog
          {...getCommonProps()}
          handleClose={newValue => {
            if (newValue !== value.trimEnd()) {
              onChange(newValue);
            }
            setState({ visible: false });
          }}
        />
      )}
    </TextMarkdownWrap>
  );
}
