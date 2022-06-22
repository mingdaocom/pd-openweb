import discussionAjax from 'src/api/discussion';
import worksheetAjax from 'src/api/worksheet';

export const getSheetDiscussion = ({worksheetId, rowId, pageIndex, entityType}, callback) => (dispatch, getState) => {
  const sourceType = rowId ? 8 : 7;
  const sourceId = rowId ? `${worksheetId}|${rowId}` : worksheetId;
  discussionAjax.getDiscussions({
    sourceId,
    sourceType,
    pageIndex,
    pageSize: 10,
    isFocus: false,
    entityType,
  }).then(result => {
    if (pageIndex === 1) {
      dispatch({ type: 'MOBILE_SET_SHEET_DISCUSSION', data: result.data });
    } else {
      dispatch({ type: 'MOBILE_ADD_SHEET_DISCUSSION', data: result.data });
    }
    if (callback && result && result.data) {
      callback(result.data.length === 10);
    }
  });
};

export const unshiftSheetDiscussion = data => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_UNSHIFT_SHEET_DISCUSSION', data });
}

export const removeSheetDiscussion = (discussionId, rowId) => (dispatch, getState) => {
  const { sheetDiscussions } = getState().mobile;
  discussionAjax.removeDiscussion({
    discussionId,
    sourceType: rowId ? 8 : 7,
  }).then(result => {
    const list = sheetDiscussions.filter(item => item.discussionId !== discussionId);
    dispatch({ type: 'MOBILE_SET_SHEET_DISCUSSION', data: list });
  });
}

export const getSheetLogs = ({worksheetId, rowId, pageIndex}, callback) => (dispatch, getState) => {
  worksheetAjax.getLogs({
    worksheetId,
    rowId,
    pageIndex,
    pageSize: 10,
  }).then(result => {
    if (pageIndex === 1) {
      dispatch({ type: 'MOBILE_SET_SHEET_LOG', data: result });
    } else {
      dispatch({ type: 'MOBILE_ADD_SHEET_LOG', data: result });
    }
    if (callback && result) {
      callback(result.length === 10);
    }
  });
};

export const getSheetAttachments = ({worksheetId, rowId}, callback) => (dispatch, getState) => {
  const sourceId = rowId ? `${worksheetId}|${rowId}` : worksheetId;
  discussionAjax.getSourceAtts({
    sourceId,
    sourceType: 7,
  }).then(result => {
    dispatch({ type: 'MOBILE_SET_SHEET_ATTACHMENTS', data: result.data });
    if (callback) {
      callback();
    }
  });
}

export const emptySheetDiscussion = () => {
  return {
    type: 'MOBILE_SET_SHEET_DISCUSSION',
    data: [],
  };
}

export const emptySheetLogs = () => {
  return {
    type: 'MOBILE_SET_SHEET_LOG',
    data: [],
  };
}
