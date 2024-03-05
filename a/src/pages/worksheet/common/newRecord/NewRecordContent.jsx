import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Modal } from 'antd-mobile';
import { ScrollView, EditingBar } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import RecordInfoContext from '../recordInfo/RecordInfoContext';
import { getFormDataForNewRecord, submitNewRecord } from 'worksheet/controllers/record';
import {
  getSubListError,
  formatRecordToRelateRecord,
  isRelateRecordTableControl,
  getRecordTempValue,
  parseRecordTempValue,
  saveTempRecordValueToLocal,
  removeTempRecordValueFromLocal,
  filterHidedSubList,
  handleChildTableUniqueError,
} from 'worksheet/util';
import RecordForm from 'worksheet/common/recordInfo/RecordForm';
import Share from 'src/pages/worksheet/components/Share';
import { MobileRecordRecoverConfirm } from './MobileNewRecord';
import { openWorkSheetDraft } from '/src/pages/worksheet/common/WorksheetDraft';
import { browserIsMobile } from 'src/util';
import './NewRecord.less';
import { BUTTON_ACTION_TYPE } from './NewRecord';
import _ from 'lodash';
import { canEditData } from 'worksheet/redux/actions/util';
import { KVGet } from 'worksheet/util';
import { commonControlsAddTab } from 'mobile/components/RecordInfo/utils';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';

const Con = styled.div`
  height: 100%;
  margin: 0 -24px;
  .newRecordTitle,
  .customFieldsCon {
    padding: 0 24px;
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
  const $firstText = formcon.querySelector(
    '.customFieldsContainer .customFormItem:first-child .customFormTextareaBox input.smallInput',
  );
  if ($firstText) {
    $firstText.click();
  }
}

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
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
    loadDraftDataCount = () => {},
    addNewRecord = () => {},
    hidePublicShare,
  } = props;
  const cache = useRef({});
  const cellObjs = useRef({});
  const isSubmitting = useRef(false);
  const customwidget = useRef();
  const formcon = useRef();
  const [formLoading, setFormLoading] = useState(true);
  const [restoreVisible, setRestoreVisible] = useState();
  const [relateRecordData, setRelateRecordData] = useState({});
  const [worksheetInfo, setWorksheetInfo] = useState(_.cloneDeep(props.worksheetInfo || {}));
  const [originFormdata, setOriginFormdata] = useState([]);
  const [formdata, setFormdata] = useState([]);
  const { projectId, publicShareUrl, visibleType } = worksheetInfo;
  const [errorVisible, setErrorVisible] = useState();
  const [random, setRandom] = useState();
  const [requesting, setRequesting] = useState();
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
        formdata: data
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
          removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
          if (_.isFunction(_.get(cache, 'current.tempSaving.cancel'))) {
            _.get(cache, 'current.tempSaving.cancel')();
          }
          setRestoreVisible(false);
          if (isOverLimit) {
            if (isMobile) {
              Modal.alert(_l('您的草稿箱已满，无法保存'), _l('草稿箱中的数量已达到10条'), [
                { text: _l('我知道了'), onPress: () => {} },
              ]);
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
                  loadDraftDataCount,
                  addNewRecord,
                });
              },
            });
            return;
          }
          onCancel();
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
  async function onSave(error, { data, handleRuleError } = {}) {
    if (error) {
      onSubmitEnd();
      return;
    }
    let hasError;
    isSubmitting.current = true;
    const subListControls = filterHidedSubList(data, 2);
    const isMobile = browserIsMobile();
    if (subListControls.length) {
      const errors = subListControls
        .map(control => ({
          id: control.controlId,
          value:
            control.value &&
            control.value.rows &&
            control.value.rows.length &&
            getSubListError(
              {
                ...control.value,
                rules:
                  _.get(cellObjs.current || {}, `${control.controlId}.cell.worksheettable.current.table.rules`) ||
                  _.get(cellObjs.current || {}, `${control.controlId}.cell.props.rules`),
              },
              _.get(cellObjs.current, `${control.controlId}.cell.state.controls`) || control.relationControls,
              control.showControls,
              2,
            ),
        }))
        .filter(c => !_.isEmpty(c.value));
      if (errors.length) {
        hasError = true;
        errors.forEach(error => {
          const errorSublist = (cellObjs.current || {})[error.id];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: !_.isEmpty(error.value),
              cellErrors: error.value,
            });
          }
        });
      } else {
        subListControls.forEach(control => {
          const errorSublist = (cellObjs.current || {})[control.controlId];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: false,
              cellErrors: {},
            });
          }
        });
      }
      if (formcon.current && formcon.current.querySelector('.cellControlErrorTip')) {
        hasError = true;
      }
    }
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
        formdata: data
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
        setSublistUniqueError: badData => {
          handleChildTableUniqueError({ badData, data, cellObjs: cellObjs.current });
        },
        setRuleError: badData => {
          handleRuleError(badData, cellObjs.current);
        },
        onSubmitSuccess: ({ rowData, newControls }) => {
          if (actionType === BUTTON_ACTION_TYPE.CONTINUE_ADD || continueAdd || notDialog) {
            alert('保存成功', 1, 1000);
            isSubmitting.current = false;
            let dataForAutoFill = [...formdata];
            let relateRecordDataForAutoFill = { ...relateRecordData };
            if (advancedSetting.reservecontrols) {
              const controlIds = safeParse(advancedSetting.reservecontrols, 'array');
              dataForAutoFill = dataForAutoFill.map(c =>
                _.includes(controlIds, c.controlId) ? c : _.find(originFormdata, { controlId: c.controlId }),
              );
              Object.keys(relateRecordDataForAutoFill).forEach(controlId => {
                if (!_.includes(controlIds, controlId)) {
                  delete relateRecordDataForAutoFill[controlId];
                }
              });
            }
            if (!autoFill) {
              setFormdata(originFormdata);
              setRelateRecordData({});
            } else {
              if (advancedSetting.reservecontrols) {
                setFormdata(dataForAutoFill);
                setRelateRecordData(relateRecordDataForAutoFill);
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
                isContinue ? 'continueOpenRecordViewId' : 'submitOpenRecordViewId',
              );
              if (_.isFunction(openRecord)) {
                openRecord(rowData.rowid, openViewId);
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
            onAdd(rowData, { continueAdd: actionType === BUTTON_ACTION_TYPE.CONTINUE_ADD || continueAdd });
          }
        },
        onSubmitEnd: () => {
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
  };
  const onTempNewRecordCancel = () => {
    setRestoreVisible(false);
    removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
  };
  function handleRestoreTempRecord(newFormdata) {
    if (needCache) {
      if (isWxWork) {
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
        newFormdata = isMobile
          ? commonControlsAddTab(newFormdata, { rules: props.rules, from: from || 2 })
          : newFormdata;

        setFormdata(newFormdata);
        setOriginFormdata(newFormdata);
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
        updateWorksheetControls,
      }}
    >
      <Con onClick={e => e.stopPropagation()}>
        {isMobile ? (
          <MobileRecordRecoverConfirm
            visible={restoreVisible}
            title={_l(
              '已恢复到上次中断内容%0',
              cache.current.tempRecordCreateTime
                ? `（${window.createTimeSpan(new Date(cache.current.tempRecordCreateTime))}）`
                : '',
            )}
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
              title={_l(
                '已恢复到上次中断内容%0',
                cache.current.tempRecordCreateTime
                  ? `（${window.createTimeSpan(new Date(cache.current.tempRecordCreateTime))}）`
                  : '',
              )}
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
        <RecordCon>
          {!window.isPublicApp && shareVisible && (
            <Share
              title={_l('新建记录链接')}
              from="newRecord"
              canEditForm={isCharge} //仅 管理员|开发者 可设置公开表单
              isPublic={visibleType === 2}
              publicUrl={publicShareUrl}
              hidePublicShare={hidePublicShare}
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
          {showTitle && <div className="newRecordTitle ellipsis Font19 mBottom10 Bold">{recordTitle}</div>}
          <div className="customFieldsCon" ref={formcon}>
            <RecordForm
              from={2}
              type="new"
              loading={formLoading || loading}
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
                // let needHideRestore = restoreVisible && !noSaveTemp && !isAsyncChange;
                // try {
                //   needHideRestore =
                //     needHideRestore && !(ids.length === 1 && _.find(formdata, { controlId: ids[0] }).type === 34);
                // } catch (err) {}
                // if (needHideRestore) {
                //   setRestoreVisible(false);
                // }
                if (isSubmitting.current || maskLoading) {
                  return;
                }
                if (!isMobile) {
                  const relateRecordListControls = data.filter(isRelateRecordTableControl);
                  relateRecordListControls.forEach(c => {
                    if (String(c.value || '').startsWith('[')) {
                      try {
                        const records = safeParse(c.value, 'array');
                        setRelateRecordData(oldValue => ({
                          ...oldValue,
                          [c.controlId]: {
                            ...c,
                            value: records.map(r => r.row || safeParse(r.sourcevalue)),
                          },
                        }));
                        c.value = records.length;
                      } catch (err) {
                        c.value = '0';
                      }
                    } else if (c.value === 'deleteRowIds: all') {
                      setRelateRecordData(oldValue => ({
                        ...oldValue,
                        [c.controlId]: {
                          ...c,
                          value: [],
                        },
                      }));
                      c.value = '0';
                    }
                  });
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
              projectId={projectId || props.projectId}
              onWidgetChange={() => {
                cache.current.formUserChanged = true;
              }}
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
