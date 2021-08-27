import WIDGETS from './widgets';
import stateConfig from './stateConfig';
const READONLY_WIDGETS = {};
const BASIC_WIDGETS = {};
Object.keys(WIDGETS).forEach(widgetName => {
  let widget = WIDGETS[widgetName];
  if (widget.readonly) {
    READONLY_WIDGETS[widgetName] = widget;
  } else {
    BASIC_WIDGETS[widgetName] = widget;
  }
});

export default Object.assign({ WIDGETS }, { READONLY_WIDGETS }, { BASIC_WIDGETS }, stateConfig);
