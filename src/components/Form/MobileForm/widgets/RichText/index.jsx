import React, { memo, useRef } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { RichText } from 'ming-ui';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { ADD_EVENT_ENUM } from '../../../core/enum';

const RichTextWrap = styled.div`
  .ck .ck-content {
    background: ${props =>
      props.disabled ? 'var(--color-background-primary)' : 'var(--color-background-input)'} !important;
    border: 1px solid var(--color-border-primary) !important;
  }
  .ck .ck-content.ck-focused {
    background: var(--color-background-input) !important;
  }
`;

const RichTextWidget = props => {
  const {
    disabled,
    value,
    triggerCustomEvent,
    type,
    flag,
    richTextControlCount = 0,
    widgetStyle = {},
    projectId,
    appId,
    worksheetId,
    width,
    controlName,
  } = props;
  const { titlelayout_app = '1' } = widgetStyle;
  const displayRow = titlelayout_app === '2';

  const onChange = useRef(
    _.debounce(val => {
      props.onChange(val);
    }, 500),
  ).current;

  const onBlur = () => {
    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.CHANGE);
      triggerCustomEvent(ADD_EVENT_ENUM.BLUR);
    }
  };

  const handleClick = e => {
    if (!disabled) return;

    const target = e.target;

    // 判断是否点击的是 img
    if (target && target.tagName === 'IMG') {
      console.log(target.src);
      previewAttachments({
        index: 0,
        attachments: [
          {
            name: controlName + '.png',
            path: target.src,
            previewAttachmentType: 'QINIU',
          },
        ],
        showThumbnail: true,
        hideFunctions: ['editFileName', 'download'],
      });
    }
  };

  return (
    <RichTextWrap disabled={disabled} onClick={handleClick}>
      <RichText
        projectId={projectId}
        appId={appId}
        worksheetId={worksheetId}
        clickInit={richTextControlCount >= 3}
        maxWidth={width}
        id={flag}
        data={value || ''}
        isRemark={type === 10010}
        disabled={disabled}
        onActualSave={onChange}
        onSave={onBlur}
        minHeight={90}
        maxHeight={10000}
        autoSize={{ height: displayRow ? 'auto' : '100%' }}
        onFocus={() => triggerCustomEvent(ADD_EVENT_ENUM.FOCUS)}
      />
    </RichTextWrap>
  );
};

RichTextWidget.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  triggerCustomEvent: PropTypes.func,
  type: PropTypes.number,
  flag: PropTypes.string,
  richTextControlCount: PropTypes.number,
  widgetStyle: PropTypes.object,
  projectId: PropTypes.string,
  appId: PropTypes.string,
  worksheetId: PropTypes.string,
  width: PropTypes.number,
};

export default memo(RichTextWidget);
