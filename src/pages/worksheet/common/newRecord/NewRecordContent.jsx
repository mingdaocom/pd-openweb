import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'antd-mobile';
import { openWorkSheetDraft } from '/src/pages/worksheet/common/WorksheetDraft';
import cx from 'classnames';
import _, { get, isEmpty } from 'lodash';
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
import {
  formatRecordToRelateRecord,
  getRecordTempValue,
  isRelateRecordTableControl,
  parseRecordTempValue,
  removeTempRecordValueFromLocal,
  saveTempRecordValueToLocal,
} from 'worksheet/util';
import { emitter, KVGet } from 'worksheet/util';
import { getDynamicValue } from 'src/components/newCustomFields/tools/formUtils';
import { handleAPPScanCode } from 'src/pages/Mobile/components/RecordInfo/preScanCode';
import { openMobileRecordInfo } from 'src/pages/Mobile/Record';
import { updateDraftTotalInfo } from 'src/pages/worksheet/common/WorksheetDraft/utils';
import Share from 'src/pages/worksheet/components/Share';
import { browserIsMobile } from 'src/util';
import { compatibleMDJS, getRequest, emitter as ViewEmitter } from 'src/util';
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
  .fixedLeftOrRight {
    .nano-content {
      display: flex;
      flex-direction: column;
      .customFieldsCon {
        flex: 1;
      }
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

function focusInput(formcon) {
  if (!formcon) {
    return;
  }
  const $formWrap = formcon.querySelector('.customFieldsContainer');
  if (!$formWrap) {
    return;
  }
  const $firstText = $formWrap.querySelector('.customFormItem:first-child .customFormTextareaBox input.smallInput');
  if ($firstText) {
    $firstText.click();
  }
}

function NewRecordForm(props) {
  const {
    loading,
    maskLoading,
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
  const cache = useRef({});
  const cellObjs = useRef({});
  const isSubmitting = useRef(false);
  const customwidget = useRef();
  const formcon = useRef();
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
  const { offlineUpload } = getRequest();

  const isMobile = browserIsMobile();
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
          removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
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
              ViewEmitter.emit('UPDATE_DRAFT_TOTAL', { worksheetId, total });
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
  async function onSave(error, { data, handleRuleError, handleServiceError } = {}) {
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
        setServiceError: badData => handleServiceError(badData),
        onSubmitSuccess: ({ rowData, newControls }) => {
          handOverNavigation(true);
          if (actionType === BUTTON_ACTION_TYPE.CONTINUE_ADD || continueAdd || notDialog) {
            if (isDraft && _.isFunction(handleAddRelation)) {
              handleAddRelation([rowData]);
              setErrorVisible(false);
              setRandom(Math.random().toString());
              focusInput(formcon.current);
              return;
            }

            alert(_l('保存成功'), 1, 1000);
            isSubmitting.current = false;

            if (offlineUpload === '1' && offlineTempId) {
              compatibleMDJS('offlineDataSaved', {
                tempId: offlineTempId,
                sheetId: props.worksheetId,
                recordId: rowData.rowid,
                draft: isDraft,
              });
            }

            // APP集成H5前置扫码继续扫码提交下一条
            if (isContinue && offlineUpload !== '1') {
              handleAPPScanCodeFunc(originFormdata);
            }
            let dataForAutoFill = [...formdata];
            if (advancedSetting.reservecontrols) {
              const controlIds = safeParse(advancedSetting.reservecontrols, 'array');
              dataForAutoFill = dataForAutoFill.map(c =>
                _.includes(controlIds, c.controlId) ? c : _.find(originFormdata, { controlId: c.controlId }),
              );
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
                });
              } else {
                openRecordInfo({
                  appId: appId,
                  worksheetId: worksheetId,
                  recordId: rowData.rowid,
                  viewId: openViewId,
                  appSectionId: groupId,
                  isOpenNewAddedRecord: true,
                });
              }
            }
          }
          removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
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
          ViewEmitter.emit('ROWS_UPDATE');
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
  const recordTitle = title || _l('创建%0', entityName || worksheetInfo.entityName || '');
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
    setRestoreVisible(true);
    setIsSettingTempData(false);
  };
  const onTempNewRecordCancel = () => {
    setRestoreVisible(false);
    removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
  };
  function handleRestoreTempRecord(newFormdata) {
    if (window.isMingDaoApp) return;
    if (needCache) {
      if (window.isWxWork) {
        KVGet(`${md.global.Account.accountId}${worksheetId}-tempNewRecord`).then(data => {
          if (data) {
            fillTempRecordValue(data, newFormdata);
          }
        });
      } else {
        const tempData = localStorage.getItem('tempNewRecord_' + worksheetId);
        if (tempData) {
          fillTempRecordValue(tempData, newFormdata);
        }
      }
    }
  }

  const handleAPPScanCodeFunc = newFormdata => {
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
        props.handleAdd(isContinueNext);
      },
      handleReStart: () => {
        setFormdata(originFormdata);
        setRandom(Math.random().toString());
        handleAPPScanCodeFunc(controls);
      },
      onCancel,
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
        newFormdata = newFormdata;
        setOriginFormdata(newFormdata);
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
        cache.current.focusTimer = setTimeout(() => focusInput(formcon.current), 300);
        handleRestoreTempRecord(newFormdata);
      }
    }
    if (!loading) {
      load();
    }
  }, [loading]);

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
                setRestoreVisible(false);
              }}
            />
          </EditingBarCon>
        )}
        <RecordCon
          className={cx({
            fixedLeftOrRight: _.includes(['3', '4'], _.get(worksheetInfo.advancedSetting, 'tabposition')),
          })}
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
                  } catch (err) {}
                  resolve(`${url} ${name}`);
                })
              }
              onClose={() => setShareVisible(false)}
            />
          )}
          {showTitle && <div className="newRecordTitle ellipsis Font20 mBottom10 Bold">{recordTitle}</div>}
          <div className="customFieldsCon" ref={formcon}>
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
              onChange={(data, ids, { noSaveTemp, isAsyncChange } = {}) => {
                if (isSubmitting.current || maskLoading) {
                  return;
                }
                setFormdata([...data]);
                if (needCache && !noSaveTemp && cache.current.formUserChanged) {
                  cache.current.tempSaving = saveTempRecordValueToLocal(
                    'tempNewRecord',
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
