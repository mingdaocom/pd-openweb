import { exportRelevantComponents } from 'src/pages/widgetConfig/util/componentRegistry';

export default exportRelevantComponents(require.context('./', false, /\.jsx$/));
