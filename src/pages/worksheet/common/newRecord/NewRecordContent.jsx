import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ScrollView, EditingBar } from 'ming-ui';
import { getWorksheetInfo } from 'src/api/worksheet';
import { getFormDataForNewRecord, submitNewRecord } from 'worksheet/controllers/record';
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
import ShareNewRecord from './ShareNewRecord';
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
    masterRecord,
    masterRecordRowId,
    onSubmitBegin = () => {},
    onSubmitEnd = () => {},
    onAdd = () => {},
    onError = () => {},
  } = props;
  const tempNewRecord = needCache && viewId && localStorage.getItem('tempNewRecord_' + viewId);
  const cache = useRef({});
  const cellObjs = useRef({});
  const isSubmitting = useRef(false);
  const customwidget = useRef();
  const formcon = useRef();
  const [loading, setLoading] = useState(true);
  const [restoreVisible, setRestoreVisible] = useState(!!tempNewRecord);
  const [relateRecordData, setRelateRecordData] = useState({});
  const [worksheetInfo, setWorksheetInfo] = useState(_.cloneDeep(props.worksheetInfo || {}));
  const [originFormdata, setOriginFormdata] = useState([]);
  const [formdata, setFormdata] = useState([]);
  const { projectId, publicShareUrl, visibleType } = worksheetInfo;
  const [shareVisible, setShareVisible] = useState();
  const [errorVisible, setErrorVisible] = useState();
  const [random, setRandom] = useState();
  const [requesting, setRequesting] = useState();
  useEffect(() => {
    async function load() {
      let newWorksheetInfo = worksheetInfo;
      if (_.isEmpty(worksheetInfo) || worksheetInfo.worksheetId !== worksheetId) {
        newWorksheetInfo = await getWorksheetInfo({
          handleDefault: true,
          getTemplate: true,
          getRules: true,
          worksheetId,
        });
      }
      if (_.isEmpty(formdata)) {
        const newFormdata = await getFormDataForNewRecord({
          worksheetInfo: newWorksheetInfo,
          defaultRelatedSheet,
          defaultFormData,
          defaultFormDataEditable,
        });
        setWorksheetInfo(newWorksheetInfo);
        setFormdata(newFormdata);
        setOriginFormdata(newFormdata);
        setLoading(false);
      }
      setTimeout(() => foucsInput(formcon.current), 300);
    }
    load();
  }, []);
  function newRecord(options = {}) {
    if (!customwidget.current) return;
    onSubmitBegin();
    cache.current.newRecordOptions = options;
    customwidget.current.submitFormData();
  }
  function onSave(error, { data } = {}) {
    if (error) {
      onSubmitEnd();
      return;
    }
    let hasError;
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
      onSubmitEnd();
      return false;
    } else {
      if (requesting) {
        return false;
      }
      if (viewId) {
        removeFromLocal('tempNewRecord_' + viewId);
      }
      setRequesting(true);
      const { autoFill, continueAdd } = cache.current.newRecordOptions || {};
      submitNewRecord({
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
            setFormdata(originFormdata);
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
            masterRecordRowId={masterRecordRowId || (masterRecord || {}).rowId}
            registerCell={({ item, cell }) => (cellObjs.current[item.controlId] = { item, cell })}
            mountRef={ref => (customwidget.current = ref.current)}
            formFlag={random}
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
            onSave={onSave}
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
  worksheetInfo: PropTypes.shape({}),
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
