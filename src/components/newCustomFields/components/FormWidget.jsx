import { useEffect } from 'react';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

export default function FormWidget(props) {
  const { triggerCustomEvent, formDidMountFlag } = props;

  useEffect(() => {
    if (_.isFunction(triggerCustomEvent)) {
      const showEventTimer = setTimeout(() => {
        triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
        clearTimeout(showEventTimer);
      }, 500);

      return () => {
        triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
      };
    }
  }, [formDidMountFlag]);

  return props.children;
}
