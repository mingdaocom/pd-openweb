import React, { memo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { RichText } from 'ming-ui';
import { ADD_EVENT_ENUM } from '../../../core/enum';

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

  return (
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
      handleFocus={() => triggerCustomEvent(ADD_EVENT_ENUM.FOCUS)}
    />
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
