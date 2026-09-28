export const getScheduleConfigUpdateError = (result, fallback) => {
  if (result === true) return '';
  return result?.errorMsgList?.[0] || result?.errorMsg || fallback;
};

export const isSuccessfulDatasourceUpdate = result => typeof result === 'string' || !!result;
