import JSEncrypt from 'jsencrypt';
import moment from 'moment';
import { PUBLIC_KEY } from 'src/utils/domain/shared/securityConstants';

/**
 * 使用系统公钥加密带有效时间的文本载荷。
 */
export const encrypt = text => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUBLIC_KEY);
  return encrypt.encrypt(
    JSON.stringify({
      expire: moment().utc().valueOf(),
      data: encodeURIComponent(text),
    }),
  );
};
