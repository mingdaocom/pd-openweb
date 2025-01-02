import _ from 'lodash';

export const updateDraftTotalInfo = ({ worksheetId, total, isAdd, isMinus, callback = () => {} }) => {
  if (!window.draftTotalNumInfo) {
    window.draftTotalNumInfo = {};
  }

  if (!_.isUndefined(total)) {
    window.draftTotalNumInfo[worksheetId] = total;
    callback(total);
    return;
  }

  const currentTotal = window.draftTotalNumInfo[worksheetId] || 0;
  let resTotal = 0;

  resTotal = isAdd ? currentTotal + 1 : isMinus ? currentTotal - 1 : resTotal;

  resTotal = resTotal < 0 ? 0 : resTotal > 10 ? 10 : resTotal;

  window.draftTotalNumInfo[worksheetId] = resTotal;
  callback(resTotal);
};
