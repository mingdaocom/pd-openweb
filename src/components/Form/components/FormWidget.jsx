import { useEffect } from 'react';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from '../core/enum';

export default function FormWidget(props) {
  const { triggerCustomEvent, formDidMountFlag } = props;

  useEffect(() => {
    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.SHOW);

      return () => {
        triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
      };
    }
  }, [formDidMountFlag]);

  return props.children;
}
