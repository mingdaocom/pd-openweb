import React, { memo, useEffect, useRef, useState } from 'react';
import { typeForCon } from '../../core/config';
import Content from '../Content';
import { getApproval, getApprovalDetail, getAttributeName } from './utils';

const ContentEnhancer = props => {
  const {
    rowValue,
    printData,
    params,
    flagUpdate = 0,
    updateFlagType,
    approvalCheckedMap,
    approvalParentId,
    setApprovalList,
    showApproval,
    immediateGetApprovalDetail = {},
    receiveControls,
    ...rest
  } = props;
  const { rowId } = rowValue;
  const { type } = params;
  const approvalAjaxRef = useRef({});
  const isImmediateLock = useRef(false);

  const [selfApproval, setSelfApproval] = useState([]);
  const [attributeName, setAttributeName] = useState('');

  const updateApprovalAjax = ajaxMap => {
    approvalAjaxRef.current = ajaxMap;
  };

  const uniqByProcessId = arr => {
    const map = {};
    return arr.filter(item => {
      if (map[item.processId]) return false;
      map[item.processId] = true;
      return true;
    });
  };

  const syncApprovalChecked = approval => {
    return approval.map(item => ({
      ...item,
      checked: approvalCheckedMap[item.processId],
      child: (item.child || []).map(child => ({
        ...child,
        checked: approvalCheckedMap[item.processId],
      })),
    }));
  };

  useEffect(() => {
    // 设置标题
    setAttributeName(getAttributeName(printData.allControls, rowValue));

    // 新建、编辑模版 或者 有approvalIds才执行
    const isNewOrEdit = type === typeForCon.NEW || type === typeForCon.EDIT;
    if (showApproval && (isNewOrEdit || (!isNewOrEdit && printData.approvalIds?.length))) {
      getApproval({
        rowId,
        approvalIds: printData.approvalIds,
        params,
        updateApprovalAjax,
      }).then(approval => {
        if (approval.length) {
          let uniqApproval = uniqByProcessId(approval);
          setSelfApproval(uniqApproval);
          setApprovalList({ list: uniqApproval, rowId });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (immediateGetApprovalDetail[rowId] && !isImmediateLock.current) {
      isImmediateLock.current = true;
      const filterApproval = selfApproval.filter(item => item.checked);
      filterApproval.forEach(item => {
        getApprovalDetail({
          approvalList: selfApproval,
          approvalRef: approvalAjaxRef.current[item.processId],
          params,
          approvalCheckedMap,
        }).then(approval => {
          setSelfApproval(approval);
        });
      });
    }
  }, [immediateGetApprovalDetail]);

  useEffect(() => {
    // 只有收到审批的 checked 状态变化时，才需要同步
    if (flagUpdate <= 0 || updateFlagType !== 'approval') return;

    const approvalRef = approvalAjaxRef.current[approvalParentId];

    // 选中，并且没有获取过，并且有待办
    const shouldFetch =
      approvalParentId &&
      approvalCheckedMap[approvalParentId] &&
      approvalRef &&
      !approvalRef.alreadyGet &&
      approvalRef.ajaxList?.length;

    if (shouldFetch) {
      getApprovalDetail({
        approvalList: selfApproval,
        approvalRef,
        params,
      }).then(approval => {
        approvalAjaxRef.current[approvalParentId].alreadyGet = true;
        setSelfApproval(approval);
      });
    } else {
      // 更新显示隐藏
      setSelfApproval(syncApprovalChecked(selfApproval));
    }
  }, [flagUpdate]);

  if (!rowId && rowId !== 'emptyRowId') {
    return null;
  }

  return (
    <Content
      {...rest}
      params={{ ...params, rowId }}
      printData={{ ...printData, approval: selfApproval, attributeName, receiveControls }}
      controls={receiveControls}
    />
  );
};

export default memo(ContentEnhancer);
