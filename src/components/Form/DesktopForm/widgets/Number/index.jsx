import React, { useCallback } from 'react';
import { Slider } from 'ming-ui';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting.js';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import Number from './number';

const NumberWidget = props => {
  const {
    disabled,
    advancedSetting: { showtype, numinterval, showinput, min, max, numshow },
    value,
    onChange,
    formItemId,
    registerCell,
    getControlRef = () => {},
    controlId,
  } = props;

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      const controlRefs = getControlRef(controlId) || {};
      const { handleFocus, handleBlur } = controlRefs;
      switch (triggerType) {
        case 'trigger_tab_enter':
          handleFocus();
          break;
        case 'trigger_tab_leave':
          handleBlur();
          break;
        default:
          break;
      }
    }, []),
  );

  if (showtype === '2') {
    const itemnames = getAdvanceSetting(props, 'itemnames');
    const itemcolor = getAdvanceSetting(props, 'itemcolor');

    return (
      <Slider
        from="recordInfo"
        disabled={disabled}
        itemnames={itemnames}
        itemcolor={itemcolor}
        showInput={showinput === '1'}
        showAsPercent={numshow === '1'}
        barStyle={{ margin: '15px 0' }}
        registerCell={registerCell}
        min={parseFloat(min)}
        max={parseFloat(max)}
        value={parseFloat(value)}
        step={parseFloat(numinterval)}
        onChange={value => onChange(value)}
      />
    );
  }

  return <Number {...props} />;
};

export default NumberWidget;
