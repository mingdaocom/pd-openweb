import _ from 'lodash';

export const getAuthParams = list => {
  let auth = {};
  if (list.length) {
    auth = {
      ..._.pick(list[0], ['key', 'required', 'fieldPermission']),
    };
  }
  return auth;
};
