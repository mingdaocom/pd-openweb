import sshConfig from '../../api/sshConfig';
import { sensitiveRequest } from './sensitiveRequest';

export default {
  ...sshConfig,
  addSshConfig: (args, options) => sensitiveRequest('sshConfig/addSshConfig', args, options, 'sshPwd'),
  test: (args, options) => sensitiveRequest('sshConfig/test', args, options, 'sshPwd'),
  updateSshConfig: (args, options) => sensitiveRequest('sshConfig/updateSshConfig', args, options, 'sshPwd'),
};
