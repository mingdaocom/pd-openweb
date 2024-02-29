import { exportAll } from '../../util';
import WidgetBase from './WidgetBase';
import WidgetOperate from './WidgetOperate';
import WidgetStyle from './WidgetStyle';
import WidgetHighSetting from './WidgetHighSetting';
import WidgetMobile from './WidgetMobile';
import WidgetSecurity from './WidgetSecurity';

const components = exportAll(require.context('./', false, /\.jsx$/));
export default {
  ...components,
  WidgetBase,
  WidgetOperate,
  WidgetStyle,
  WidgetHighSetting,
  WidgetMobile,
  WidgetSecurity,
};
