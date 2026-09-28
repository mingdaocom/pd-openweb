import { exportRelevantComponents } from 'src/pages/widgetConfig/util/componentRegistry';

const components = exportRelevantComponents(require.context('./', false, /\.jsx$/));
export default components;
