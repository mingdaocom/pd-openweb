import { exportAll } from 'src/pages/widgetConfig/util';
const components = exportAll(require.context('./', true, /\.jsx$/));
export default components;
