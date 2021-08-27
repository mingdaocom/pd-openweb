import { exportAll } from 'src/util';
const components = exportAll(require.context('./', false, /\.png$/));
export default components;
