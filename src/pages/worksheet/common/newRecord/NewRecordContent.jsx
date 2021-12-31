import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ScrollView, EditingBar } from 'ming-ui';
import {
  getSubListError,
  formatRecordToRelateRecord,
  isRelateRecordTableControl,
  getRecordTempValue,
  parseRecordTempValue,
  saveToLocal,
  removeFromLocal,
} from 'worksheet/util';
import RecordForm from 'worksheet/common/recordInfo/RecordForm';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import ShareNewRecord from './ShareNewRecord';
import { getControlsForNewRecord, addRecord } from './dal';
import './NewRecord.less';

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
  top: 60px;
  width: 100%;
  overflow: hidden;
  height: 56px;
`;

function foucsInput(formcon) {
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
function NewReccordForm(props) {
  const {
    from,
    isCharge,
    notDialog,
    appId,
    viewId,
    worksheetId,
    title,
    entityName,
    showTitle,
    needCache,
    showShare = false,
    defaultRelatedSheet,
    defaultFormDataEditable,
    defaultFormData,
    registeFunc,
    onAdd = () => {},
    onError = () => {},
  } = props;
  const tempNewRecord = needCache && viewId && localStorage.getItem('tempNewRecord_' + viewId);
  const cellObjs = useRef({});
  const isSubmitting = useRef(false);
  const customwidget = useRef();
  const formcon = useRef();
  const [restoreVisible, setRestoreVisible] = useState(!!tempNewRecord);
  const [formdata, setFormdata] = useState([]);
  const [relateRecordData, setRelateRecordData] = useState({});
  const [worksheetInfo, setWorksheetInfo] = useState({});
  const { projectId, publicShareUrl, visibleType } = worksheetInfo;
  const [shareVisible, setShareVisible] = useState();
  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState();
  const [random, setRandom] = useState();
  const [requesting, setRequesting] = useState();
  useEffect(() => {
    getControlsForNewRecord(worksheetId, defaultRelatedSheet, defaultFormData, defaultFormDataEditable).then(res => {
      if (!res.worksheetInfo || res.worksheetInfo.resultCode !== 1 || res.controls.length === 0) {
        onError();
        return;
      }
      setWorksheetInfo({ ...res.worksheetInfo, controls: res.controls });
      setFormdata(res.controls);
      setLoading(false);
      setTimeout(() => foucsInput(formcon.current), 300);
    });
  }, []);
  function newRecord(options = {}) {
    if (!customwidget.current) return;
    let { data, hasError, hasRuleError } = customwidget.current.getSubmitData();
    isSubmitting.current = true;
    const subListControls = data.filter(item => item.type === 34);
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
                rules: _.get(
                  cellObjs.current || {},
                  `${control.controlId}.cell.worksheettable.current.table.state.rules`,
                ),
              },
              _.get(cellObjs.current, `${control.controlId}.cell.controls`) || control.relationControls,
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
      return false;
    } else if ($('.workSheetNewRecord .Progress--circle').length > 0) {
      alert(_l('附件正在上传，请稍后', 3));
      return false;
    } else if (hasRuleError) {
      return false;
    } else {
      if (requesting) {
        return false;
      }
      if (viewId) {
        removeFromLocal('tempNewRecord_' + viewId);
      }
      setRequesting(true);
      const { autoFill, continueAdd } = options;
      addRecord({
        appId,
        projectId,
        viewId,
        worksheetId,
        formdata: data
          .filter(c => !isRelateRecordTableControl(c))
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
        continueAdd,
        customwidget,
        setRequesting,
        resetForm: ({ newControls } = {}) => {
          isSubmitting.current = false;
          if (!autoFill) {
            setFormdata(worksheetInfo.controls);
            setRelateRecordData({});
          }
          if (newControls) {
            setFormdata(formdata.map(c => _.find(newControls, nc => nc.controlId === c.controlId) || c));
          }
          setErrorVisible(false);
          setRandom(Math.random().toString());
          foucsInput(formcon.current);
        },
        onAdd,
        ..._.pick(props, [
          'notDialog',
          'addWorksheetRow',
          'customBtn',
          'masterRecord',
          'addType',
          'onCancel',
          'onSubmitBegin',
          'onSubmitEnd',
          'updateWorksheetControls',
        ]),
      });
    }
  }
  registeFunc({ newRecord });
  const RecordCon = notDialog ? React.Fragment : ScrollView;
  return (
    <Con>
      {tempNewRecord && (
        <EditingBarCon>
          <EditingBar
            visible={restoreVisible}
            defaultTop={-140}
            visibleTop={8}
            title={_l('有上次意外退出未提交的内容，是否恢复？')}
            updateText={_l('确定')}
            onUpdate={() => {
              setRestoreVisible(false);
              if (viewId) {
                const parsedData = parseRecordTempValue(tempNewRecord, formdata);
                setRandom(Math.random().toString());
                setFormdata(parsedData.formdata);
                setRelateRecordData(parsedData.relateRecordData);
                removeFromLocal('tempNewRecord', viewId);
              }
            }}
            onCancel={() => {
              setRestoreVisible(false);
              if (viewId) {
                removeFromLocal('tempNewRecord', viewId);
              }
            }}
          />
        </EditingBarCon>
      )}
      <RecordCon>
        {!window.isPublicApp && shareVisible && (
          <ShareNewRecord
            visible
            isCharge={isCharge}
            appId={appId}
            viewId={viewId}
            worksheetId={worksheetId}
            publicShareUrl={publicShareUrl}
            visibleType={visibleType}
            onClose={() => setShareVisible(false)}
          />
        )}
        {showTitle && (
          <div className="newRecordTitle ellipsis Font19 mBottom10">
            {title || _l('创建%0', entityName || worksheetInfo.entityName || '')}
            {showShare && (
              <i
                className="icon icon-share newRecordLinkIcon ThemeHoverColor3"
                onClick={() => setShareVisible(true)}
              ></i>
            )}
          </div>
        )}
        <div className="customFieldsCon" ref={formcon}>
          <RecordForm
            from={2}
            type="new"
            loading={loading}
            recordbase={{
              appId,
              worksheetId,
              viewId,
              from,
              isCharge,
              allowEdit: true,
            }}
            registerCell={({ item, cell }) => (cellObjs.current[item.controlId] = { item, cell })}
            mountRef={ref => (customwidget.current = ref.current)}
            formFlag={random}
            // abnormal={abnormal}
            recordinfo={worksheetInfo}
            formdata={formdata}
            relateRecordData={relateRecordData}
            worksheetId={worksheetId}
            showError={errorVisible}
            onChange={(data, { noSaveTemp } = {}) => {
              if (isSubmitting.current) {
                return;
              }
              setFormdata([...data]);
              if (needCache && viewId && !noSaveTemp) {
                saveToLocal('tempNewRecord', viewId, JSON.stringify(getRecordTempValue(data, relateRecordData)));
              }
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
              const newRelateRecordData = { ...relateRecordData, [control.controlId]: { ...control, value: records } };
              setRelateRecordData(newRelateRecordData);
              if (viewId) {
                saveToLocal('tempNewRecord', viewId, JSON.stringify(getRecordTempValue(formdata, newRelateRecordData)));
              }
            }}
          />
        </div>
      </RecordCon>
    </Con>
  );
}

NewReccordForm.propTypes = {
  from: PropTypes.number,
  isCharge: PropTypes.bool,
  notDialog: PropTypes.bool,
  appId: PropTypes.string,
  viewId: PropTypes.string,
  worksheetId: PropTypes.string,
  title: PropTypes.string,
  entityName: PropTypes.string,
  showTitle: PropTypes.bool,
  showShare: PropTypes.bool,
  defaultRelatedSheet: PropTypes.shape({}),
  defaultFormData: PropTypes.shape({}),
  defaultFormDataEditable: PropTypes.bool,
  registeFunc: PropTypes.func,
  onError: PropTypes.func,
};

export default NewReccordForm;
