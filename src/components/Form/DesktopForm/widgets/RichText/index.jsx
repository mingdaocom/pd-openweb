import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { RichText } from 'ming-ui';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const RichTextWidget = props => {
  const {
    disabled,
    value,
    width,
    type,
    flag,
    richTextControlCount = 0,
    widgetStyle = {},
    triggerCustomEvent,
    advancedSetting = {},
    projectId,
    appId,
    worksheetId,
    setHasChange = () => {},
    formItemId,
  } = props;
  const [currentWidth, setCurrentWidth] = useState(width);
  const richTextInstanceRef = useRef(null);
  const valueRef = useRef(value);
  const focusRef = useRef(false);
  const changeSettingRef = useRef(false);

  useEffect(() => {
    valueRef.current = value || '';
  }, [value]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      const table = _.get(richTextInstanceRef.current, 'table');
      switch (triggerType) {
        case 'trigger_tab_enter':
          table && table.focus();
          break;
        case 'trigger_tab_leave':
          table && table.blur();
          break;
        default:
          break;
      }
    }, []),
  );

  useEffect(() => {
    setCurrentWidth(width);
  }, [width]);

  const onChangeDebounced = useRef(
    _.debounce(tempValue => {
      // 防止非聚焦态被触发
      if (valueRef.current !== tempValue && changeSettingRef.current) {
        console.log('onChangeDebounced', tempValue);
        props.onChange(tempValue);
      }
      changeSettingRef.current = false;
    }, 500),
  ).current;

  const handleBlur = () => {
    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.CHANGE);
      triggerCustomEvent(ADD_EVENT_ENUM.BLUR);
    }
  };

  const { titlelayout_pc = '1' } = widgetStyle;
  const { minheight, maxheight } = advancedSetting;
  const displayRow = titlelayout_pc === '2';
  const minHeight = Number(minheight || '90');
  const maxHeight = maxheight ? Number(maxheight) : undefined;

  return (
    <RichText
      ref={richTextInstanceRef}
      projectId={projectId}
      appId={appId}
      worksheetId={worksheetId}
      clickInit={richTextControlCount >= 3}
      maxWidth={currentWidth}
      id={flag}
      data={value || ''}
      isRemark={type === 10010}
      className={cx({
        richTextDisabledControl: disabled,
      })}
      disabled={disabled}
      onActualSave={onChangeDebounced}
      onSave={() => {
        handleBlur();
      }}
      minHeight={minHeight}
      maxHeight={maxHeight}
      autoSize={{ height: displayRow ? 'auto' : '100%' }}
      changeSetting={() => {
        if (focusRef.current) {
          setHasChange(true);
          changeSettingRef.current = true;
        }
      }}
      onFocus={() => {
        focusRef.current = true;
        triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
      }}
      onBlur={() => {
        focusRef.current = false;
        setHasChange(false);
      }}
    />
  );
};

RichTextWidget.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  hasChange: PropTypes.bool,
  setHasChange: PropTypes.func,
};

const RichTextWrapper = memo(
  props => <RichTextWidget {...props} />,
  (prevProps, nextProps) => {
    // 同一条记录数据变更过程中不更新，防止光标跳动
    if (prevProps.recordId === nextProps.recordId && prevProps.value !== nextProps.value) {
      return nextProps.hasChange;
    }
    return _.isEqual(
      _.pick(prevProps, ['value', 'flag', 'width', 'disabled']),
      _.pick(nextProps, ['value', 'flag', 'width', 'disabled']),
    );
  },
);

const RichTextComponent = props => {
  const [hasChange, setHasChange] = useState(false);

  return <RichTextWrapper {...props} hasChange={hasChange} setHasChange={setHasChange} />;
};

export default RichTextComponent;
