import _ from 'lodash';

export const formatQueryParam = queryParam => {
  const data = {
    apkId: _.get(queryParam, 'apkId'),
    processId: _.get(queryParam, 'processId'),
    createAccountId: _.get(queryParam.createAccount, 'accountId'),
    startDate: _.get(queryParam.date, 'startDate'),
    endDate: _.get(queryParam.date, 'endDate'),
    status: _.get(queryParam, 'status'),
  };
  if (queryParam.operationType && typeof queryParam.operationType === 'string') {
    let [oType, type] = queryParam.operationType.split('-');
    data.operationType = Number(oType);
    data.type = Number(type);
  }
  return data;
};
