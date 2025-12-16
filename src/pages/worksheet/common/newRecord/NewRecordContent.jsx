import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'antd-mobile';
import { openWorkSheetDraft } from '/src/pages/worksheet/common/WorksheetDraft';
import cx from 'classnames';
import _, { find, get, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { EditingBar, ScrollView } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import RecordForm from 'worksheet/common/recordInfo/RecordForm';
import { BUTTON_ACTION_TYPE } from 'worksheet/constants/enum';
import { getFormDataForNewRecord, submitNewRecord } from 'worksheet/controllers/record';
import { canEditData } from 'worksheet/redux/actions/util';
import { getDynamicValue } from 'src/components/Form/core/formUtils';
import { handleAPPScanCode } from 'src/pages/Mobile/components/RecordInfo/preScanCode';
import { openMobileRecordInfo } from 'src/pages/Mobile/Record';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { updateDraftTotalInfo } from 'src/pages/worksheet/common/WorksheetDraft/utils';
import Share from 'src/pages/worksheet/components/Share';
import { browserIsMobile, emitter, getRequest } from 'src/utils/common';
import { removeTempRecordValueFromLocal, saveTempRecordValueToLocal } from 'src/utils/common';
import { KVGet } from 'src/utils/common';
import { isRelateRecordTableControl } from 'src/utils/control';
import { compatibleMDJS } from 'src/utils/project';
import { formatRecordToRelateRecord, getRecordTempValue, parseRecordTempValue } from 'src/utils/record';
import RecordInfoContext from '../recordInfo/RecordInfoContext';
import MobileRecordRecoverConfirm from './MobileRecordRecoverConfirm';
import './NewRecord.less';

const Con = styled.div`
  height: 100%;
  margin: 0 -24px;
  .newRecordTitle {
    padding: 0 32px;
    flex-shrink: 0;
  }
  .customFieldsCon {
    display: flex;
    .recordInfoForm {
      flex: 1;
      min-width: 0;
      padding: ${({ isMobile }) => (isMobile ? '0 20px' : ' 0 32px')};
      overflow-x: ${({ isMobile }) => (isMobile ? 'hidden' : 'unset')};
    }
  }
`;
const EditingBarCon = styled.div`
  position: absolute;
  top: 2px;
  width: 100%;
  overflow: hidden;
  height: 86px;
`;

function checkVisibility(el) {
  return new Promise(resolve => {
    const observer = new IntersectionObserver(([entry]) => {
      resolve(entry?.isIntersecting);
      observer.disconnect();
    });
    observer.observe(el);
  });
}

function focusInput(formcon) {
  if (!formcon) return;
  const isMobile = browserIsMobile();
  const firstText = formcon.querySelector(`${isMobile ? '.customFormFocusControl' : '.customFormTextareaBox'}`);

  if (firstText) {
    checkVisibility(firstText).then(isVisible => {
      if (isVisible) {
        firstText.click();
      }
    });
  }
}

function NewRecordForm(props) {
  const {
    loading,
    maskLoading,
    isMingoCreate,
    from,
    isCustomButton,
    isCharge,
    appPkgData,
    notDialog,
    appId,
    viewId,
    groupId,
    worksheetId,
    title,
    entityName,
    showTitle,
    needCache = true,
    defaultRelatedSheet,
    defaultFormDataEditable,
    defaultFormData,
    writeControls,
    registerFunc,
    masterRecord,
    masterRecordRowId,
    shareVisible,
    customButtonConfirm,
    customBtn,
    sheetSwitchPermit,
    updateWorksheetControls,
    updateTitle = () => {},
    advancedSetting = {},
    setShareVisible = () => {},
    onSubmitBegin = () => {},
    onSubmitEnd = () => {},
    onAdd = () => {},
    onCancel = () => {},
    openRecord,
    addNewRecord = () => {},
    onWidgetChange = () => {},
    onManualWidgetChange = () => {},
    hidePublicShare,
    privateShare,
    isDraft = false,
    handleAddRelation,
    handOverNavigation = () => {},
  } = props;
  const cache = useRef({
    formLoading: true,
    pendingFunctions: [],
  });
  const cellObjs = useRef({});
  const isSubmitting = useRef(false);
  const customwidget = useRef();
  const formcon = useRef();
  const formdataRef = useRef([]);
  const propsWorksheetInfo = useMemo(() => _.cloneDeep(props.worksheetInfo || {}), []);
  const [formLoading, setFormLoading] = useState(true);
  const [isSettingTempData, setIsSettingTempData] = useState(false);
  const [restoreVisible, setRestoreVisible] = useState();
  const [relateRecordData, setRelateRecordData] = useState({});
  const [worksheetInfo, setWorksheetInfo] = useState(propsWorksheetInfo);
  const [originFormdata, setOriginFormdata] = useState([]);
  const [formdata, setFormdata] = useState([]);
  const { projectId, publicShareUrl, visibleType } = worksheetInfo;
  const [errorVisible, setErrorVisible] = useState();
  const [random, setRandom] = useState();
  const [requesting, setRequesting] = useState();
  const [offlineTempId, setOfflineTempId] = useState('');
  const [filledByAiMap, setFilledByAiMap] = useState({});
  const [isRenderForm, setIsRenderForm] = useState(true);
  const { offlineUpload } = getRequest();

  const isMobile = browserIsMobile();
  const saveKey = isMingoCreate ? 'tempNewRecordFromMingo' : 'tempNewRecord';

  // 同步 formdata 到 ref
  useEffect(() => {
    formdataRef.current = formdata;
  }, [formdata]);

  function newRecord(options = {}) {
    if (!customwidget.current) return;
    if (options.rowStatus === 21) {
      // 存草稿
      onSubmitBegin();
      const { data } = customwidget.current.getSubmitData({ ignoreAlert: true, silent: true });
      if (requesting) {
        return false;
      }
      setRequesting(true);
      submitNewRecord({
        appId,
        projectId,
        viewId,
        worksheetId,
        formdata: !isMobile
          ? data
          : data
              .filter(c => (isMobile ? true : !isRelateRecordTableControl(c)))
              .concat(
                _.keys(relateRecordData)
                  .map(key => ({
                    ...relateRecordData[key],
                    value: JSON.stringify(
                      formatRecordToRelateRecord(worksheetInfo.template.controls, relateRecordData[key].value),
                    ),
                  }))
                  .filter(_.identity),
              ),
        customwidget,
        rowStatus: 21,
        setRequesting,
        onSubmitSuccess: ({ rowData, isOverLimit }) => {
          handOverNavigation(true);
          removeTempRecordValueFromLocal(saveKey, worksheetId);
          if (_.isFunction(_.get(cache, 'current.tempSaving.cancel'))) {
            _.get(cache, 'current.tempSaving.cancel')();
          }
          setRestoreVisible(false);
          if (isOverLimit) {
            if (isMobile) {
              Dialog.alert({
                title: _l('您的草稿箱已满，无法保存'),
                content: _l('草稿箱中的数量已达到10条'),
                confirmText: _l('我知道了'),
              });
              return;
            }
            Confirm({
              className: '',
              title: _l('您的草稿箱已满，无法保存'),
              description: _l('草稿箱中的草稿数量已经达到10条'),
              okText: _l('查看草稿箱'),
              buttonType: 'primary',
              cancelText: _l('我知道了'),
              onOk: () => {
                openWorkSheetDraft({
                  showFillNext: true,
                  appId,
                  projectId,
                  viewId,
                  worksheetId,
                  worksheetInfo,
                  isCharge,
                  needCache: false,
                  addNewRecord,
                });
              },
            });
            return;
          }
          updateDraftTotalInfo({
            worksheetId,
            isAdd: true,
            callback: total => {
              emitter.emit('UPDATE_DRAFT_TOTAL', { worksheetId, total });
            },
          });
          onCancel();
          if (offlineUpload === '1') {
            compatibleMDJS(
              'offlineDataSaved',
              {
                tempId: offlineTempId,
                sheetId: props.worksheetId,
                recordId: rowData.rowid,
                draft: true,
              },
              () => {},
            );
          }
        },
        onSubmitEnd: () => {
          onSubmitEnd();
          setRequesting(false);
        },
        ..._.pick(props, ['notDialog', 'addWorksheetRow', 'masterRecord', 'addType', 'updateWorksheetControls']),
      });
      return;
    }
    onSubmitBegin();
    cache.current.newRecordOptions = options;
    customwidget.current.submitFormData();
  }
  async function onSave(error, { data, handleRuleError, handleServiceError, alertLockError } = {}) {
    if (error) {
      onSubmitEnd();
      return;
    }
    let hasError;
    isSubmitting.current = true;
    const isMobile = browserIsMobile();
    if (hasError) {
      setErrorVisible(true);
      alert(_l('请正确填写%0', entityName || worksheetInfo.entityName || ''), 3);
      onSubmitEnd();
      return false;
    } else {
      if (requesting) {
        return false;
      }
      if (customButtonConfirm) {
        try {
          const remark = await customButtonConfirm();
          customBtn.btnRemark = remark;
        } catch (err) {
          console.log(err);
          onSubmitEnd();
          return;
        }
      }
      setRequesting(true);
      const { autoFill, actionType, continueAdd, isContinue } = cache.current.newRecordOptions || {};
      submitNewRecord({
        appId,
        projectId,
        viewId,
        worksheetId,
        formdata: !isMobile
          ? data
          : data
              .filter(c => (isMobile ? true : !isRelateRecordTableControl(c)))
              .concat(
                _.keys(relateRecordData)
                  .map(key => ({
                    ...relateRecordData[key],
                    value: JSON.stringify(
                      formatRecordToRelateRecord(worksheetInfo.template.controls, relateRecordData[key].value),
                    ),
                  }))
                  .filter(_.identity),
              ),
        customwidget,
        setRequesting,
        setSubListUniqueError: badData => {
          customwidget.current.dataFormat.callStore('setUniqueError', { badData });
        },
        setRuleError: badData => handleRuleError(badData),
        alertLockError: () => alertLockError(),
        setServiceError: badData => handleServiceError(badData),
        onSubmitSuccess: ({ rowData, newControls }) => {
          handOverNavigation(!isContinue);

          // 支付配置‘立即支付’，创建记录后弹出付款层
          // if (
          //   worksheetInfo.isAllowImmediatePayment &&
          //   !isMobile &&
          //   (actionType === BUTTON_ACTION_TYPE.CLOSE || notDialog)
          // ) {
          //   handlePrePayOrder({
          //     worksheetId,
          //     rowId: rowData.rowid,
          //     paymentModule: md.global.Account.isPortal ? 3 : 2,
          //     projectId: projectId || props.projectId,
          //     appId,
          //     payNow: true,
          //     isAtOncePayment: true,
          //     onUpdateSuccess: updateObj => {},
          //   });
          // }

          // 创建记录后关闭弹层
          if (actionType === BUTTON_ACTION_TYPE.CLOSE) {
            alert(_l('提交成功'), 1);
          }

          if (actionType === BUTTON_ACTION_TYPE.CONTINUE_ADD || continueAdd || notDialog) {
            if (
              notDialog &&
              location.pathname.includes('mobile/addRecord') &&
              actionType !== BUTTON_ACTION_TYPE.CONTINUE_ADD &&
              !continueAdd
            ) {
              compatibleMDJS('back', { closeAll: false });
            }

            if (isDraft && _.isFunction(handleAddRelation)) {
              handleAddRelation([rowData]);
              setErrorVisible(false);
              setRandom(Math.random().toString());
              focusInput(formcon.current);
              return;
            }

            alert(_l('保存成功'), 1);
            isSubmitting.current = false;

            if (offlineUpload === '1' && offlineTempId) {
              compatibleMDJS('offlineDataSaved', {
                tempId: offlineTempId,
                sheetId: props.worksheetId,
                recordId: rowData.rowid,
                draft: isDraft,
              });
            }

            let dataForAutoFill = [...formdata];
            if (advancedSetting.reservecontrols) {
              const controlIds = safeParse(advancedSetting.reservecontrols, 'array');
              dataForAutoFill = dataForAutoFill.map(c =>
                _.includes(controlIds, c.controlId) ? c : _.find(originFormdata, { controlId: c.controlId }),
              );
            }

            // APP集成H5前置扫码继续扫码提交下一条
            if (isContinue && offlineUpload !== '1') {
              handleAPPScanCodeFunc(!autoFill ? originFormdata : dataForAutoFill);
            }

            if (!autoFill) {
              setFormdata(originFormdata);
              if (get(customwidget, 'current.dataFormat.callStore')) {
                customwidget.current.dataFormat.callStore('setEmpty');
              }
            } else {
              if (advancedSetting.reservecontrols) {
                setFormdata(dataForAutoFill);
                if (get(customwidget, 'current.dataFormat.callStore')) {
                  customwidget.current.dataFormat.callStore('setEmpty', {
                    ignoreControlId: safeParse(advancedSetting.reservecontrols, 'array'),
                  });
                }
              }
            }
            if (newControls) {
              setFormdata(
                (autoFill ? dataForAutoFill : originFormdata).map(c =>
                  Object.assign(_.find(newControls, nc => nc.controlId === c.controlId) || c, { value: c.value }),
                ),
              );
            }

            setErrorVisible(false);
            setRandom(Math.random().toString());
            setFilledByAiMap({});
            focusInput(formcon.current);
          } else {
            onCancel();
            if (actionType === BUTTON_ACTION_TYPE.OPEN_RECORD) {
              const openViewId = _.get(
                advancedSetting,
                isContinue && offlineUpload !== '1' ? 'continueOpenRecordViewId' : 'submitOpenRecordViewId',
              );
              if (_.isFunction(openRecord)) {
                openRecord(rowData.rowid, openViewId);
              } else if (isMobile) {
                openMobileRecordInfo({
                  className: 'full',
                  appId: appId,
                  worksheetId: worksheetId,
                  rowId: rowData.rowid,
                  viewId: openViewId,
                  from: 3,
                  enablePayment: worksheetInfo.enablePayment,
                });
              } else {
                openRecordInfo({
                  appId: appId,
                  worksheetId: worksheetId,
                  recordId: rowData.rowid,
                  viewId: openViewId,
                  appSectionId: groupId,
                  isOpenNewAddedRecord: true,
                  enablePayment: worksheetInfo.enablePayment,
                });
              }
            }
          }
          removeTempRecordValueFromLocal(saveKey, worksheetId);
          if (_.isFunction(_.get(cache, 'current.tempSaving.cancel'))) {
            _.get(cache, 'current.tempSaving.cancel')();
          }
          if (_.isFunction(onAdd)) {
            if (isDraft && _.isFunction(handleAddRelation)) {
              handleAddRelation([rowData]);
            } else {
              onAdd(rowData, { continueAdd: actionType === BUTTON_ACTION_TYPE.CONTINUE_ADD || continueAdd });
            }
          }
          if (window.customWidgetViewIsActive) {
            emitter.emit('POST_MESSAGE_TO_CUSTOM_WIDGET', {
              action: 'new-record',
              value: rowData,
            });
          }
        },
        onSubmitEnd: () => {
          emitter.emit('ROWS_UPDATE');
          onSubmitEnd();
          setRequesting(false);
        },
        customBtn,
        ..._.pick(props, ['notDialog', 'addWorksheetRow', 'masterRecord', 'addType', 'updateWorksheetControls']),
      });
    }
  }
  registerFunc({ newRecord, setRestoreVisible });
  const RecordCon = notDialog ? React.Fragment : ScrollView;
  const recordTitle = title || _l('创建%0', entityName || worksheetInfo.entityName || _l('记录'));
  const fillTempRecordValue = (tempNewRecord, formData) => {
    setIsSettingTempData(true);
    const savedData = safeParse(tempNewRecord);
    if (_.isEmpty(savedData)) return;
    const tempRecordCreateTime = savedData.create_at;
    const value = savedData.value || savedData;
    cache.current.tempRecordCreateTime = tempRecordCreateTime;
    const parsedData = parseRecordTempValue(value, formData, defaultRelatedSheet);
    if (cache.current.focusTimer) {
      clearTimeout(cache.current.focusTimer);
    }
    setFormdata(parsedData.formdata);
    setRelateRecordData(parsedData.relateRecordData);
    setRandom(Math.random().toString());
    setRestoreVisible(!isMingoCreate);
    setIsSettingTempData(false);
  };

  function handleRestoreTempRecord(newFormdata) {
    if (window.isMingDaoApp) return;
    if (needCache) {
      if (window.isWxWork) {
        KVGet(`${md.global.Account.accountId}${worksheetId}-${saveKey}`).then(data => {
          if (data) {
            fillTempRecordValue(data, newFormdata);
          }
        });
      } else {
        const tempData = localStorage.getItem(saveKey + '_' + worksheetId);
        if (tempData) {
          fillTempRecordValue(tempData, newFormdata);
        }
      }
    }
  }

  const handleAPPScanCodeFunc = newFormdata => {
    const { autoFill } = cache.current.newRecordOptions || {};
    newFormdata = newFormdata && !_.isEmpty(newFormdata) ? newFormdata : formdata;
    const controls = newFormdata.map(item => {
      if (_.get(item, 'advancedSetting.defsource')) {
        return { ...item, value: getDynamicValue(newFormdata, item) };
      }
      return item;
    });
    const cloneControls = _.clone(controls);

    handleAPPScanCode({
      controls,
      worksheetInfo,
      updateData: control => {
        const index = _.findIndex(cloneControls, c => c.controlId === control.controlId);
        cloneControls[index] = { ...cloneControls[index], ...control };
        setFormdata(cloneControls);
        setRandom(Math.random());
      },
      handleSubmit: isContinueNext => {
        if (_.isUndefined(autoFill)) {
          props.handleAdd(isContinueNext);
        } else {
          props.handleAdd(isContinueNext, autoFill);
        }
      },
      handleReStart: () => {
        setFormdata(originFormdata);
        setRandom(Math.random().toString());
        handleAPPScanCodeFunc(controls);
      },
      onCancel,
      handOverNavigation,
    });
  };

  useEffect(() => {
    async function load() {
      if (_.isEmpty(formdata)) {
        setWorksheetInfo(props.worksheetInfo);
        let newFormdata = await getFormDataForNewRecord({
          isCustomButton,
          worksheetInfo: props.worksheetInfo,
          defaultRelatedSheet,
          defaultFormData,
          defaultFormDataEditable,
          writeControls,
        });

        setOriginFormdata(newFormdata);
        cache.current.originFormdata = newFormdata;
        setFormdata(newFormdata);
        // 离线缓存;
        if (offlineUpload === '1') {
          compatibleMDJS('offlineDataUpload', {
            sheetId: props.worksheetId,
            success: res => {
              const tempId = res.tempId; // 临时记录ID
              const controls = res.controls;
              const data = newFormdata.map(item => {
                const it = _.find(controls, v => v.controlId === item.controlId) || {};

                if (it.type === 14) {
                  return {
                    ...item,
                    value: JSON.stringify({ attachmentData: [], attachments: it.value, knowledgeAtts: [] }),
                  };
                }
                if (it.type === 42) {
                  return {
                    ...item,
                    value:
                      _.isArray(it.value) && it.value.length
                        ? it.value[0].serverName + '/' + it.value[0].key
                        : undefined,
                  };
                }
                return { ...item, value: it.value ? it.value : item.value };
              });
              setOfflineTempId(tempId);
              setFormdata(data);
            },
          });
        } else {
          handleAPPScanCodeFunc(newFormdata);
        }

        setFormLoading(false);
        cache.current.formLoading = false;
        if (cache.current.pendingFunctions.length) {
          cache.current.pendingFunctions.forEach(handle => handle());
          cache.current.pendingFunctions = [];
        }
        cache.current.focusTimer = setTimeout(() => focusInput(formcon.current), 300);
        handleRestoreTempRecord(newFormdata);
      }
    }
    if (!loading) {
      load();
    }
  }, [loading]);

  const handleMingoTriggerAction = useCallback(({ action, params = {} }) => {
    function handle() {
      if (action === 'fillValueByAi') {
        const { controlId } = params;
        let value = params.value;
        const control = find(cache.current.originFormdata, { controlId });
        if (control && control.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST && !isEmpty(value)) {
          value = safeParse(value);
          customwidget.current.dataFormat.updateDataSource({
            controlId: control.controlId,
            value: {
              action: 'clearAndSet',
              rows: value,
            },
          });
          value = value.length;
        }
        if (control.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET && typeof value === 'undefined') {
          value = '[]';
        }
        setFilledByAiMap(prev => ({
          ...prev,
          [controlId]: typeof value === 'undefined' ? false : true,
        }));
        // 使用 ref 获取最新状态，避免并发更新时状态覆盖
        const newFormdata = formdataRef.current.map(item => (item.controlId === controlId ? { ...item, value } : item));
        setFormdata(newFormdata);
        formdataRef.current = newFormdata;
        setRandom(Math.random().toString());
      } else {
        handleMingoSaveTempRecord();
      }
    }
    if (cache.current.formLoading) {
      cache.current.pendingFunctions.push(handle);
    } else {
      handle();
    }
  });

  const handleMingoSaveTempRecord = useCallback(() => {
    setFormdata(prev => {
      saveTempRecordValueToLocal(
        'tempNewRecordFromMingo',
        worksheetId,
        JSON.stringify({ create_at: Date.now(), value: getRecordTempValue(prev) }),
      );
      return prev;
    });
  }, []);

  const handleResetForm = useCallback(() => {
    setFormdata(cache.current.originFormdata);
    setRandom(Math.random());
    setFilledByAiMap({});
  }, [originFormdata]);

  useEffect(() => {
    emitter.on('MINGO_TRIGGER_ACTION', handleMingoTriggerAction);
    emitter.on('MINGO_NEW_RECORD_CLEAN', handleResetForm);
    window.newRecordActive = true;
    return () => {
      emitter.off('MINGO_TRIGGER_ACTION', handleMingoTriggerAction);
      emitter.off('MINGO_NEW_RECORD_CLEAN', handleResetForm);
      window.newRecordActive = false;
    };
  }, []);

  const handleMobileFillValueByAi = aiData => {
    setFormdata(prev => prev.map(item => (aiData[item.controlId] ? { ...item, value: aiData[item.controlId] } : item)));
    // 手动重置表单
    setIsRenderForm(false);
    setTimeout(() => {
      setIsRenderForm(true);
    }, 300);
  };

  useEffect(() => {
    if (isMobile) {
      emitter.on('MINGO_FILL_NEW_RECORD_VALUE_BY_AI_MOBILE', handleMobileFillValueByAi);
    }
    return () => {
      if (isMobile) {
        emitter.off('MINGO_FILL_NEW_RECORD_VALUE_BY_AI_MOBILE', handleMobileFillValueByAi);
      }
    };
  }, []);

  useEffect(() => {
    updateTitle(recordTitle);
  }, [recordTitle]);

  useEffect(() => {
    return () => {
      if (isMingoCreate) {
        emitter.emit('NEW_RECORD_UNMOUNT');
      }
    };
  }, []);

  return (
    <RecordInfoContext.Provider
      value={{
        updateWorksheetControls: newControls => {
          newControls.forEach(control => {
            try {
              if (control.type === 34) {
                customwidget.current.dataFormat.data.filter(
                  item => item.controlId === control.controlId,
                )[0].advancedSetting.widths = control.advancedSetting.widths;
              }
            } catch (err) {
              console.error(err);
            }
          });
          updateWorksheetControls(newControls);
        },
      }}
    >
      <Con isMobile={isMobile}>
        {isMobile ? (
          <MobileRecordRecoverConfirm
            visible={restoreVisible}
            title={
              cache.current.tempRecordCreateTime
                ? _l('已恢复到上次中断内容（%0）', window.createTimeSpan(new Date(cache.current.tempRecordCreateTime)))
                : _l('已恢复到上次中断内容')
            }
            updateText={_l('确认')}
            cancelText={_l('清空')}
            onUpdate={() => setRestoreVisible(false)}
            onCancel={() => {
              removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
              setFormdata(originFormdata);
              setRandom(Math.random());
              setFilledByAiMap({});
              setRestoreVisible(false);
            }}
          />
        ) : (
          <EditingBarCon>
            <EditingBar
              visible={restoreVisible}
              defaultTop={-140}
              visibleTop={8}
              title={
                cache.current.tempRecordCreateTime
                  ? _l(
                      '已恢复到上次中断内容（%0）',
                      window.createTimeSpan(new Date(cache.current.tempRecordCreateTime)),
                    )
                  : _l('已恢复到上次中断内容')
              }
              updateText={_l('确认')}
              cancelText={_l('清空')}
              onUpdate={() => setRestoreVisible(false)}
              onCancel={() => {
                removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
                setFormdata(originFormdata);
                setRandom(Math.random());
                setFilledByAiMap({});
                setRestoreVisible(false);
              }}
            />
          </EditingBarCon>
        )}
        <RecordCon
          {...(!notDialog
            ? {
                className: cx('newRecordScrollContainer', {
                  fixedLeftOrRight: _.includes(['3', '4'], _.get(worksheetInfo.advancedSetting, 'tabposition')),
                }),
              }
            : {})}
        >
          {!window.isPublicApp && shareVisible && (
            <Share
              title={_l('新建记录链接')}
              from="newRecord"
              canEditForm={isCharge} //仅 管理员|开发者 可设置公开表单
              isPublic={visibleType === 2}
              publicUrl={publicShareUrl}
              hidePublicShare={hidePublicShare}
              privateShare={privateShare}
              isCharge={isCharge || canEditData(appPkgData.appRoleType)} //运营者具体分享权限
              params={{
                appId,
                viewId,
                worksheetId,
                title: recordTitle,
              }}
              onUpdate={data => {
                setWorksheetInfo(Object.assign({}, worksheetInfo, data));
              }}
              getCopyContent={(type, url) =>
                new Promise(async resolve => {
                  if (type === 'private') {
                    resolve(`${url} ${recordTitle}`);
                    return;
                  }
                  let name = '';
                  try {
                    const res = await publicWorksheetAjax.getPublicWorksheetInfo({ worksheetId }, { silent: true });
                    name = res.name;
                  } catch (err) {
                    console.log(err);
                  }
                  resolve(`${url} ${name}`);
                })
              }
              onClose={() => setShareVisible(false)}
            />
          )}
          {showTitle && <div className="newRecordTitle ellipsis Font20 mBottom10 Bold">{recordTitle}</div>}
          <div className="customFieldsCon" ref={formcon}>
            {(!isMobile || isRenderForm) && (
              <RecordForm
                from={2}
                isDraft={isDraft}
                type="new"
                loading={formLoading || loading || isSettingTempData}
                recordbase={{
                  appId,
                  worksheetId,
                  viewId,
                  from,
                  isCharge,
                  allowEdit: true,
                }}
                sheetSwitchPermit={sheetSwitchPermit}
                widgetStyle={worksheetInfo.advancedSetting}
                masterRecordRowId={masterRecordRowId || (masterRecord || {}).rowId}
                registerCell={({ item, cell }) => (cellObjs.current[item.controlId] = { item, cell })}
                mountRef={ref => (customwidget.current = ref.current)}
                formFlag={random}
                recordinfo={worksheetInfo}
                formdata={formdata.filter(
                  it =>
                    !_.includes(
                      [
                        'wfname',
                        'wfstatus',
                        'wfcuaids',
                        'wfrtime',
                        'wfftime',
                        'wfdtime',
                        'wfcaid',
                        'wfctime',
                        'wfcotime',
                        'rowid',
                        'uaid',
                      ],
                      it.controlId,
                    ),
                )}
                relateRecordData={relateRecordData}
                worksheetId={worksheetId}
                showError={errorVisible}
                filledByAiMap={filledByAiMap}
                onChange={(data, ids, { noSaveTemp } = {}) => {
                  setFilledByAiMap(prev => ({
                    ...prev,
                    [ids[0]]: undefined,
                  }));
                  if (isSubmitting.current || maskLoading) {
                    return;
                  }
                  setFormdata([...data]);
                  if (needCache && !noSaveTemp && cache.current.formUserChanged) {
                    cache.current.tempSaving = saveTempRecordValueToLocal(
                      saveKey,
                      worksheetId,
                      JSON.stringify({ create_at: Date.now(), value: getRecordTempValue(data, relateRecordData) }),
                    );
                  }
                }}
                onSave={onSave}
                onError={() => {
                  onSubmitEnd();
                }}
                onRelateRecordsChange={(control, records) => {
                  if (!customwidget.current) {
                    return;
                  }
                  customwidget.current.dataFormat.updateDataSource({
                    controlId: control.controlId,
                    value: String((records || []).length),
                    data: records,
                  });
                  customwidget.current.updateRenderData();
                  setFormdata(
                    formdata.map(item =>
                      item.controlId === control.controlId ? { ...item, value: String((records || []).length) } : item,
                    ),
                  );
                  const newRelateRecordData = {
                    ...relateRecordData,
                    [control.controlId]: { ...control, value: records },
                  };
                  setRelateRecordData(newRelateRecordData);
                  if (viewId) {
                    cache.current.tempSaving = saveTempRecordValueToLocal(
                      'tempNewRecord',
                      worksheetId,
                      JSON.stringify({ create_at: Date.now(), value: getRecordTempValue(formdata, relateRecordData) }),
                    );
                  }
                }}
                updateRelateRecordTableCount={(controlId, num) => {
                  if (customwidget.current) {
                    customwidget.current.dataFormat.updateDataSource({
                      controlId,
                      value: String(num),
                    });
                    customwidget.current.updateRenderData();
                  }
                  setFormdata(prevFormData =>
                    prevFormData.map(item => (item.controlId === controlId ? { ...item, value: String(num) } : item)),
                  );
                }}
                projectId={projectId || props.projectId}
                onWidgetChange={() => {
                  onWidgetChange();
                  cache.current.formUserChanged = true;
                }}
                onManualWidgetChange={onManualWidgetChange}
              />
            )}
          </div>
        </RecordCon>
      </Con>
    </RecordInfoContext.Provider>
  );
}

NewRecordForm.propTypes = {
  from: PropTypes.number,
  isCharge: PropTypes.bool,
  notDialog: PropTypes.bool,
  appId: PropTypes.string,
  viewId: PropTypes.string,
  worksheetId: PropTypes.string,
  worksheetInfo: PropTypes.shape({}),
  title: PropTypes.string,
  entityName: PropTypes.string,
  showTitle: PropTypes.bool,
  defaultRelatedSheet: PropTypes.shape({}),
  defaultFormData: PropTypes.shape({}),
  defaultFormDataEditable: PropTypes.bool,
  writeControls: PropTypes.arrayOf(PropTypes.shape({})),
  registerFunc: PropTypes.func,
  onError: PropTypes.func,
};

export default NewRecordForm;
