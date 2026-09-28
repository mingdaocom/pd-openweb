import datasource from '../../api/datasource';
import { sensitiveRequest } from './sensitiveRequest';

export default {
  ...datasource,
  addDatasource: (args, options) => sensitiveRequest('datasource/addDatasource', args, options),
  test: (args, options) => sensitiveRequest('datasource/test', args, options),
  updateDatasource: (args, options) => sensitiveRequest('datasource/updateDatasource', args, options),
};
