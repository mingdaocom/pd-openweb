import { getTranslateInfo } from 'src/utils/services/app';

export const translatePortalRoleOptions = (appId, controls = []) => {
  return controls.map(item => {
    if (item.controlId === 'portal_role') {
      return {
        ...item,
        options: (item.options || []).map(option => {
          return {
            ...option,
            value: getTranslateInfo(appId, null, option.key).name || option.value,
          };
        }),
      };
    }

    return item;
  });
};
