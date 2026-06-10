import React, { memo, useEffect, useRef, useState } from 'react';
import { updateRulesData } from 'src/components/Form/core/formUtils/updateRulesData';
import { fromType, typeForCon } from '../../core/config';
import { getControlsForPrint, isRelationControl } from '../../core/util';
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
    receiveControls = [],
    relationRowsValues,
    view = {},
    signature = [],
    ...rest
  } = props;
  const { rowId } = rowValue;
  const { type, from, printType, printId, rowIds = [] } = params;
  // console.log('缓存的关联记录值', relationRowsValues);
  // console.log('规则计算之前', receiveControls);
  // 1、执行业务规则
  const ruleFilterReceiveControls = updateRulesData({
    rules: [typeForCon.NEW, typeForCon.EDIT].includes(type) && from === fromType.FORM_SET ? [] : printData.rules,
    recordId: rowId,
    data: [...receiveControls, ...signature],
  });
  // console.log('规则计算之后', ruleFilterReceiveControls);
  // 2、权限过滤
  const needVisible = type === typeForCon.NEW && from === fromType.FORM_SET;
  const filterAllControls = getControlsForPrint({
    receiveControls: ruleFilterReceiveControls,
    relationMaps: printData.relationMaps,
    needVisible,
    info: printData.info,
  });
  // console.log('权限过滤之后', filterReceiveControls);
  // 3、视图字段配置
  const hideControls = view?.controls || [];
  const filterViewControls = filterAllControls.filter(control => !hideControls.includes(control.controlId));
  // 常规字段
  const combinedReceiveControls = filterViewControls
    .filter(control => control.type !== 42)
    .map(control => {
      if (isRelationControl(control.type)) {
        return {
          ...control,
          value: relationRowsValues?.get(control.controlId),
        };
      }

      return control;
    });
  // 签名字段
  const signatureControls = filterViewControls.filter(control => control.type === 42);

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

  const syncApprovalChecked = (approval, map) => {
    const realMap = map || approvalCheckedMap;
    return approval.map(item => ({
      ...item,
      checked: realMap[item.processId],
      child: (item.child || []).map(child => ({
        ...child,
        checked: realMap[item.processId],
      })),
    }));
  };

  useEffect(() => {
    // 设置标题
    const currentAttributeName = getAttributeName(printData.allControls, rowValue);
    setAttributeName(currentAttributeName);

    if (from === fromType.PRINT && printType !== 'flow' && rowIds.length === 1) {
      document.title = printId
        ? `${printData.name}-${currentAttributeName}`
        : `${_l('系统打印')}-${currentAttributeName}`;
    }

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
          setApprovalList({ list: uniqApproval, rowId }, (nextApproval, map) => {
            setSelfApproval(syncApprovalChecked(nextApproval, map));
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (immediateGetApprovalDetail[rowId] && !isImmediateLock.current && selfApproval?.length) {
      isImmediateLock.current = true;
      const filterApproval = selfApproval.filter(item => item.checked);
      filterApproval.forEach(item => {
        getApprovalDetail({
          approvalList: selfApproval,
          approvalRef: approvalAjaxRef.current[item.processId],
          params,
          approvalCheckedMap,
        }).then(approval => {
          setSelfApproval(syncApprovalChecked(approval));
        });
      });
    }
  }, [immediateGetApprovalDetail, selfApproval]);

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
        setSelfApproval(syncApprovalChecked(approval));
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
      printData={{ ...printData, approval: selfApproval, attributeName, receiveControls: combinedReceiveControls }}
      controls={combinedReceiveControls}
      signature={signatureControls}
    />
  );
};

export default memo(ContentEnhancer);
