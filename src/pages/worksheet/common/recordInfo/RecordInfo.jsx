import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import styled from 'styled-components';
import { Dialog, EditingBar, WaterMark } from 'ming-ui';
import DragMask from 'worksheet/common/DragMask';
import { emitter, getSubListError, updateOptionsOfControls, isRelateRecordTableControl } from 'worksheet/util';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import RecordInfoContext from './RecordInfoContext';
import { loadRecord, updateRecord, deleteRecord, RecordApi } from './crtl';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import RecordForm from './RecordForm';
import Header from './RecordForm/Header';
import RecordInfoRight from './RecordInfoRight';
import './RecordInfo.less';

const Drag = styled.div(
  ({ left }) => `
position: absolute;
z-index: 2;
left: ${left}px;
width: 10px;
height: 100%;
cursor: ew-resize;
&:hover {
  border-left: 2px solid #ddd;
}
`,
);

export default class RecordInfo extends Component {
  static propTypes = {
    width: PropTypes.number,
    visible: PropTypes.bool,
    isCharge: PropTypes.bool,
    allowAdd: PropTypes.bool,
    notDialog: PropTypes.bool,
    showPrevNext: PropTypes.bool,
    instanceId: PropTypes.string, // 仅工作流调用需要 流程实例id
    workId: PropTypes.string, // 仅工作流调用需要 运行节点id
    appId: PropTypes.string,
    appSectionId: PropTypes.string,
    viewId: PropTypes.string,
    recordId: PropTypes.string,
    worksheetId: PropTypes.string,
    from: PropTypes.number,
    view: PropTypes.shape({}),
    sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
    isSubList: PropTypes.bool,
    allowEdit: PropTypes.bool,
    updateSuccess: PropTypes.func,
    updateWorksheetControls: PropTypes.func,
    projectId: PropTypes.string,
    currentIndex: PropTypes.number,
    hideRecordInfo: PropTypes.func,
    updateRows: PropTypes.func,
    hideRows: PropTypes.func,
    currentSheetRows: PropTypes.arrayOf(PropTypes.shape({})),
    header: PropTypes.element, // 放到头部的组件
    workflow: PropTypes.element,
  };
  static defaultProps = {
    showPrevNext: false,
    editable: true,
    view: {},
    sheetSwitchPermit: [],
    hideRecordInfo: () => {},
    updateRows: () => {},
    hideRows: () => {},
    from: RECORD_INFO_FROM.WORKSHEET,
    currentSheetRows: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      formWidth: this.getFormWidth(props),
      recordinfo: {},
      tempFormdata: [],
      updateControlIds: [],
      recordId: props.recordId,
      abnormal: false, // 异常
      sideVisible: props.from === RECORD_INFO_FROM.WORKFLOW || Boolean(localStorage.getItem('recordinfoSideVisible')),
      currentIndex: _.findIndex(props.currentSheetRows, item => {
        return item.rowid === props.recordId;
      }),
    };
    this.hadWaterMark = window.hadWaterMark;
    this.debounceRefresh = _.debounce(this.refreshEvent, 1000);
    this.refreshEvents = {};
    this.cellObjs = {};
  }
  componentDidMount() {
    emitter.addListener('RELOAD_RECORDINFO', this.debounceRefresh);
    window.addEventListener('keydown', this.bindPrevNextKeyEvent);
    this.loadRecord({ recordId: this.state.recordId });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.recordId !== this.props.recordId && nextProps.recordId) {
      this.setState({ loading: true, recordId: nextProps.recordId, abnormal: false });
      this.loadRecord({ recordId: nextProps.recordId, props: nextProps });
    }
    if (nextProps.width !== this.props.width) {
      this.setState({ formWidth: this.getFormWidth(nextProps) });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.bindPrevNextKeyEvent);
    emitter.removeListener('RELOAD_RECORDINFO', this.debounceRefresh);
  }

  getFormWidth(props) {
    let { width, viewId, sheetSwitchPermit } = props || this.props;
    if (width > 1600) {
      width = 1600;
    }
    let formWidth;
    try {
      formWidth = parseInt(localStorage.getItem('RECORDINFO_FORMWIDTH'), 10);
      if (!_.isNumber(formWidth) || _.isNaN(formWidth)) {
        throw new Error();
      }
    } catch (err) {
      formWidth = width - 420;
    }
    if (formWidth > width - 345) {
      formWidth = width - 345;
    }

    if (
      !isOpenPermit(permitList.recordDiscussSwitch, sheetSwitchPermit, viewId) &&
      !isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId)
    ) {
      formWidth = width;
    }
    return formWidth;
  }

  getRowGetType(from) {
    if (
      from === RECORD_INFO_FROM.CHAT ||
      (from === RECORD_INFO_FROM.WORKSHEET_ROW_LAND && location.search && location.search.indexOf('share') > -1)
    ) {
      return 3;
    } else {
      return 1;
    }
  }

  async loadRecord({ recordId, props, closeWhenNotViewData, needUpdateControlIds }) {
    const {
      from,
      allowAdd,
      appId,
      viewId,
      worksheetId,
      instanceId,
      workId,
      rules,
      isWorksheetQuery,
      isWorksheetRowLand,
      hideRows,
      hideRecordInfo,
    } = props || this.props;
    const { tempFormdata } = this.state;
    try {
      const data = await loadRecord({
        appId,
        viewId,
        worksheetId,
        instanceId,
        workId,
        recordId,
        getType: this.getRowGetType(from),
        getRules: !rules,
      });
      if (isWorksheetRowLand && (!viewId || (viewId && !data.isViewData))) {
        data.allowEdit = false;
      }
      if (_.isBoolean(closeWhenNotViewData) && closeWhenNotViewData && !data.isViewData) {
        hideRows([recordId]);
        if (from !== RECORD_INFO_FROM.WORKSHEET_ROW_LAND) {
          hideRecordInfo(recordId);
          return;
        }
      }
      this.setState({
        recordinfo: { ...data, allowAdd, ...(data.rules ? {} : { rules }), isWorksheetQuery },
        tempFormdata: needUpdateControlIds
          ? tempFormdata
              .filter(c => !_.find(needUpdateControlIds, id => c.controlId === id))
              .concat(
                needUpdateControlIds
                  .map(id => _.find(data.receiveControls, c => c.controlId === id))
                  .filter(_.identity),
              )
          : data.receiveControls,
        formFlag: Math.random().toString(),
        loading: false,
        refreshBtnNeedLoading: false,
      });
    } catch (err) {
      this.setState({
        abnormal: true,
        loading: false,
        recordinfo: err || {},
        refreshBtnNeedLoading: false,
      });
    }
  }

  @autobind
  handleCancel() {
    if (this.state.iseditting) {
      this.setState({ showCloseDialog: true });
    } else {
      this.props.hideRecordInfo();
    }
  }

  @autobind
  async handleDelete(e) {
    if (e && _.isFunction(e.stopPropagation)) {
      e.stopPropagation();
    }
    const { worksheetId, hideRecordInfo, hideRows, deleteRows, onDeleteSuccess = () => {} } = this.props;
    const { recordId } = this.state;
    if (_.isFunction(deleteRows)) {
      deleteRows(worksheetId, [{ rowid: recordId, allowDelete: true }]);
      hideRecordInfo();
      return;
    }
    try {
      await deleteRecord({ worksheetId, recordId });
      hideRecordInfo();
      onDeleteSuccess();
      alert(_l('删除成功'));
    } catch (err) {
      alert(_l('删除失败'), 2);
    }
  }

  @autobind
  switchRecord(isNext) {
    const { recordId, iseditting, tempFormdata } = this.state;
    if (iseditting) {
      alert(_l('请先保存或取消当前更改'), 3);
      return;
    }
    $('.mdEditorSave').click();
    const { currentSheetRows } = this.props;
    const index = _.findIndex(currentSheetRows, record => {
      return record.rowid === recordId;
    });
    const newIndex = isNext ? index + 1 : index - 1;
    if (!currentSheetRows[newIndex]) {
      return;
    }
    const newRecordId = currentSheetRows[newIndex].rowid;
    this.setState({
      tempFormdata: tempFormdata.map(c => (isRelateRecordTableControl(c) ? { ...c, value: undefined } : c)),
    });
    this.loadRecord({ recordId: newRecordId });
    this.setState({
      recordId: newRecordId,
      currentIndex: newIndex,
    });
  }

  @autobind
  bindPrevNextKeyEvent(e) {
    const { currentSheetRows } = this.props;
    const canPrev = currentSheetRows.length > 0 && this.state.currentIndex !== 0;
    const canNext = currentSheetRows.length > 0 && this.state.currentIndex !== currentSheetRows.length - 1;
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 188) {
      if (canPrev) {
        this.switchRecord(false);
      } else {
        alert(_l('没有更多了'), 3);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 190) {
      if (canNext) {
        this.switchRecord(true);
      } else {
        alert(_l('没有更多了'), 3);
      }
    }
  }

  renderDialogs() {
    const { hideRecordInfo } = this.props;
    const { recordinfo, showCloseDialog } = this.state;
    return (
      <React.Fragment>
        {showCloseDialog && (
          <Dialog
            visible={showCloseDialog}
            title={<span className="Red">{_l('您有未保存的修改，确定要离开此页吗？')}</span>}
            description={_l('如果不保存，修改的内容将会丢失')}
            onCancel={() => {
              this.setState({ showCloseDialog: false });
            }}
            onOk={() => {
              hideRecordInfo();
            }}
          />
        )}
      </React.Fragment>
    );
  }

  @autobind
  handleFormChange(data, ids = [], slient) {
    const { updateControlIds } = this.state;
    this.setState({
      tempFormdata: data.map(c => (c.type === 34 ? { ...c, value: undefined } : c)),
      iseditting: slient ? this.state.iseditting : true,
      updateControlIds: _.unique(updateControlIds.concat(ids)),
    });
  }

  @autobind
  handleFormSave({ callback, noSave } = {}) {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    const {
      from,
      appId,
      viewId,
      worksheetId,
      projectId,
      instanceId,
      workId,
      updateSuccess,
      updateRows,
      hideRows,
      hideRecordInfo,
      updateWorksheetControls,
    } = this.props;
    const { cellObjs } = this;
    const { recordId, recordinfo, updateControlIds } = this.state;
    let { data, hasRuleError, hasError } = this.recordform.current.getSubmitData();
    emitter.emit('SAVE_CANCEL_RECORD');
    const subListControls = data.filter(item => item.type === 34);
    function getRows(controlId) {
      try {
        return cellObjs[controlId].cell.props.rows;
      } catch (err) {
        return [];
      }
    }
    function getControls(controlId) {
      try {
        return cellObjs[controlId].cell.controls;
      } catch (err) {
        return;
      }
    }
    if (subListControls.length) {
      const errors = subListControls
        .map(control => ({
          id: control.controlId,
          value: getSubListError(
            {
              rows: getRows(control.controlId),
              rules: _.get(cellObjs || {}, `${control.controlId}.cell.worksheettable.current.table.state.rules`),
            },
            getControls(control.controlId) || control.relationControls,
            control.showControls,
            3,
          ),
        }))
        .filter(c => !_.isEmpty(c.value));
      if (errors.length) {
        hasError = true;
        errors.forEach(error => {
          const errorSublist = cellObjs[error.id];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: !_.isEmpty(error.value),
              cellErrors: error.value,
            });
          }
        });
      } else {
        subListControls.forEach(control => {
          const errorSublist = cellObjs[control.controlId];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: false,
              cellErrors: {},
            });
          }
        });
      }
      if (this.con.querySelector('.cellControlErrorTip')) {
        hasError = true;
      }
    }
    if (hasError) {
      this.setState({
        showError: true,
      });
      alert(_l('请正确填写%0', recordinfo.entityName), 3);
      if (_.isFunction(callback)) {
        callback(true);
      }
      return false;
    } else if ($('.workSheetRecordInfo .Progress--circle').length > 0) {
      alert(_l('附件正在上传，请稍后', 3));
      if (_.isFunction(callback)) {
        callback(true);
      }
      return false;
    } else if (hasRuleError) {
      if (_.isFunction(callback)) {
        callback(true);
      }
      return false;
    }
    if (noSave) {
      return true;
    }
    this.setState({
      iseditting: false,
    });
    updateRecord(
      {
        appId,
        viewId,
        getType: this.getRowGetType(from),
        worksheetId,
        recordId,
        projectId,
        instanceId,
        workId,
        data,
        updateControlIds,
        updateSuccess,
        triggerUniqueError: badData => {
          if (this.recordform.current && _.isFunction(this.recordform.current.uniqueErrorUpdate)) {
            this.recordform.current.uniqueErrorUpdate(badData);
          }
        },
      },
      (err, resdata) => {
        if (!err) {
          let newFormData = recordinfo.receiveControls.map(c => _.assign({}, c, { value: resdata[c.controlId] }));
          updateRows([recordId], _.omit(resdata, ['allowedit', 'allowdelete']), _.pick(resdata, updateControlIds));
          this.refreshSubList();
          if (viewId && !resdata.isviewdata) {
            hideRows([recordId]);
            if (from !== RECORD_INFO_FROM.WORKSHEET_ROW_LAND) {
              hideRecordInfo();
            }
          }
          if (_.isFunction(callback)) {
            callback();
          }
          // 处理选项自定义选项
          const newOptionControls = updateOptionsOfControls(data, resdata);
          if (newOptionControls.length) {
            if (_.isFunction(updateWorksheetControls)) {
              updateWorksheetControls(newOptionControls);
            }
            newFormData = newFormData.map(c => {
              const optionControl = _.find(newOptionControls, noc => noc.controlId === c.controlId);
              return optionControl
                ? { ...optionControl, value: resdata[optionControl.controlId] || optionControl.value }
                : c;
            });
          }
          this.setState({
            formFlag: Math.random().toString(),
            tempFormdata: newFormData,
            recordinfo: { ...recordinfo, receiveControls: newFormData },
            updateControlIds: [],
          });
          if (_.isFunction(this.refreshEvents.loadcustombtns)) {
            this.refreshEvents.loadcustombtns();
          }
        }
      },
    );
  }

  @autobind
  updateRecordOwner(newOwner, record) {
    const { updateRows } = this.props;
    const { recordId, recordinfo } = this.state;
    const changedValue = { ownerid: JSON.stringify([newOwner]) };
    updateRows([recordId], _.omit(record, ['allowedit', 'allowdelete']), changedValue);
    this.setState({
      recordinfo: { ...recordinfo, ownerAccount: newOwner },
    });
  }

  @autobind
  handleCancelChange() {
    const { recordinfo, updateControlIds } = this.state;
    emitter.emit('SAVE_CANCEL_RECORD');
    // 清除子表错误状态
    Object.keys(this.cellObjs).forEach(key => {
      if (this.cellObjs[key].cell && !_.isEmpty(this.cellObjs[key].cell.state.cellErrors)) {
        this.cellObjs[key].cell.setState({ cellErrors: {} });
      }
    });
    this.setState({
      tempFormdata: (recordinfo.receiveControls || []).map(c => {
        if (c.type === 34 && _.includes(updateControlIds, c.controlId)) {
          return { ...c, value: { num: c.value, action: 'reset' } };
        } else {
          return c;
        }
      }),
      iseditting: false,
      formFlag: Math.random().toString(),
    });
  }

  @autobind
  refreshEvent({ worksheetId, recordId, closeWhenNotViewData }) {
    const { iseditting } = this.state;
    if (!iseditting && worksheetId === this.props.worksheetId && recordId === this.state.recordId) {
      this.handleRefresh(closeWhenNotViewData);
    }
  }

  @autobind
  handleRefresh(closeWhenNotViewData) {
    if (this.state.iseditting) {
      return;
    }
    this.setState({
      refreshBtnNeedLoading: true,
    });
    _.each(this.refreshEvents || {}, fn => {
      if (_.isFunction(fn)) {
        fn();
      }
    });
    this.loadRecord({ recordId: this.state.recordId, closeWhenNotViewData });
    emitter.emit('RELOAD_RECORDINFO_DISCUSS');
  }

  @autobind
  refreshSubList() {
    const { tempFormdata, updateControlIds } = this.state;
    tempFormdata
      .filter(c => _.find(updateControlIds, id => c.controlId === id) && c.type === 34)
      .forEach(c => {
        if (_.isFunction(this.refreshEvents[c.controlId])) {
          this.refreshEvents[c.controlId](null, { noLoading: true });
        }
      });
  }

  render() {
    const {
      allowEdit,
      header,
      workflow,
      appId,
      viewId,
      worksheetId,
      view,
      instanceId,
      workId,
      notDialog,
      from,
      appSectionId,
      currentSheetRows,
      hideRecordInfo,
      updateRows,
      isSubList,
      sheetSwitchPermit,
      showPrevNext,
      handleAddSheetRow,
    } = this.props;
    let { isCharge } = this.props;
    if (_.isUndefined(isCharge) && appId) {
      isCharge = window[`app_${appId}_is_charge`];
    }
    const {
      loading,
      formWidth,
      refreshBtnNeedLoading,
      abnormal,
      recordId,
      currentIndex,
      recordinfo,
      tempFormdata,
      showError,
      formFlag,
      iseditting,
      sideVisible,
      dragMaskVisible,
    } = this.state;
    let { width } = this.props;
    if (width > 1600) {
      width = 1600;
    }
    const isSmall = window.innerWidth < 360 + 40;
    const recordTitle = getTitleTextFromControls(tempFormdata);
    const recordbase = {
      appId,
      worksheetId,
      appSectionId,
      viewId,
      recordId,
      instanceId,
      workId,
      from,
      notDialog,
      isSubList,
      isCharge,
      isSmall,
      recordTitle,
      allowEdit: _.isUndefined(allowEdit) ? recordinfo.allowEdit : allowEdit,
    };
    let Con = !this.hadWaterMark && recordinfo.projectId ? WaterMark : React.Fragment;
    return (
      <Con projectId={recordinfo.projectId}>
        <RecordInfoContext.Provider value={{ api: new RecordApi({ appId, worksheetId, viewId, recordId }) }}>
          {this.renderDialogs()}
          {(from !== RECORD_INFO_FROM.WORKFLOW || viewId) && (
            <EditingBar
              style={{ width: sideVisible ? formWidth : '100%' }}
              visible={iseditting}
              defaultTop={-50}
              visibleTop={8}
              title={_l('正在修改表单数据 ···')}
              onUpdate={this.handleFormSave}
              onCancel={this.handleCancelChange}
            />
          )}
          <div
            className={cx('recordInfoCon flexColumn', { abnormal, isWorkflow: from === RECORD_INFO_FROM.WORKFLOW })}
            ref={con => (this.con = con)}
            onClick={e => e.stopPropagation()}
          >
            {!abnormal && (
              <Header
                loading={loading}
                viewId={viewId}
                header={header}
                isSmall={isSmall}
                sideVisible={sideVisible}
                sheetSwitchPermit={sheetSwitchPermit}
                recordbase={recordbase}
                recordinfo={recordinfo}
                iseditting={iseditting}
                showPrevNext={showPrevNext}
                switchRecord={this.switchRecord}
                currentSheetRows={currentSheetRows}
                currentIndex={currentIndex}
                registeRefreshEvents={(key, fn) => {
                  this.refreshEvents[key] = fn;
                }}
                onRefresh={this.handleRefresh}
                onSave={this.handleFormSave}
                refreshRotating={refreshBtnNeedLoading}
                hideRecordInfo={hideRecordInfo}
                reloadRecord={this.handleRefresh}
                onSideIconClick={() => {
                  if (from !== RECORD_INFO_FROM.WORKFLOW) {
                    localStorage.setItem('recordinfoSideVisible', sideVisible ? '' : 'true');
                  }
                  this.setState({ sideVisible: !sideVisible });
                }}
                onCancel={this.handleCancel}
                onUpdate={(changedValue, record) => {
                  updateRows([recordId], _.omit(record, ['allowedit', 'allowdelete']), changedValue);
                  const newFormData = recordinfo.receiveControls.map(c =>
                    _.assign({}, c, { value: changedValue[c.controlId] || c.value }),
                  );
                  Object.keys(changedValue).forEach(key => {
                    if (_.isFunction(this.refreshEvents[key])) {
                      this.refreshEvents[key]();
                    }
                  });
                  this.setState({
                    formFlag: Math.random().toString(),
                    tempFormdata: newFormData,
                    recordinfo: { ...recordinfo, receiveControls: newFormData },
                  });
                }}
                onDelete={this.handleDelete}
                handleAddSheetRow={(row, afterRowId) => {
                  this.loadRecord({ recordId: row.rowid });
                  this.setState({
                    recordId: row.rowid,
                    currentIndex: currentIndex + 1,
                  });
                  handleAddSheetRow(row, afterRowId);
                }}
              />
            )}
            <div className="recordBody flex flexRow">
              {dragMaskVisible && (
                <DragMask
                  value={formWidth}
                  min={400}
                  max={width - 343}
                  onChange={value => {
                    localStorage.setItem('RECORDINFO_FORMWIDTH', value);
                    this.setState({ dragMaskVisible: false, formWidth: value });
                  }}
                />
              )}
              <RecordForm
                ignoreHeader={from === RECORD_INFO_FROM.WORKFLOW && header && viewId}
                from={from}
                formWidth={sideVisible ? formWidth : width}
                loading={loading}
                recordbase={recordbase}
                mountRef={recordform => (this.recordform = recordform)}
                registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
                formFlag={formFlag}
                abnormal={abnormal}
                recordinfo={recordinfo}
                formdata={tempFormdata}
                controlProps={{
                  isCharge,
                  refreshRecord: this.handleRefresh,
                  registeRefreshEvents: (id, fn) => {
                    this.refreshEvents[id] = fn;
                  },
                  sideVisible,
                  formWidth,
                }}
                worksheetId={worksheetId}
                view={view}
                showError={showError}
                iseditting={iseditting}
                sheetSwitchPermit={sheetSwitchPermit}
                registeRefreshEvents={(key, fn) => {
                  this.refreshEvents[key] = fn;
                }}
                updateRecordDailogOwner={this.updateRecordOwner}
                updateRows={updateRows}
                reloadControls={needUpdateControlIds => {
                  if (!needUpdateControlIds || !needUpdateControlIds.length) {
                    return;
                  }
                  this.loadRecord({
                    recordId,
                    needUpdateControlIds,
                  });
                }}
                onChange={this.handleFormChange}
                updateRelateRecordNum={(controlId, num) => {
                  if (!this.recordform) {
                    return;
                  }
                  this.recordform.current.dataFormat.updateDataSource({
                    controlId,
                    value: String(num),
                    notInsertControlIds: true,
                  });
                  this.recordform.current.updateRenderData();
                  this.setState({
                    tempFormdata: tempFormdata.map(item =>
                      item.controlId === controlId ? { ...item, value: String(num) } : item,
                    ),
                  });
                }}
                onSave={this.handleFormSave}
                onCancel={this.handleCancelChange}
                currentIndex={currentIndex}
              />
              {sideVisible && <Drag left={formWidth} onMouseDown={() => this.setState({ dragMaskVisible: true })} />}
              {!abnormal && sideVisible && (
                <RecordInfoRight
                  className="flex"
                  recordbase={recordbase}
                  workflow={workflow}
                  sheetSwitchPermit={sheetSwitchPermit}
                  projectId={this.props.projectId}
                  controls={this.props.controls}
                  formFlag={formFlag}
                  formdata={tempFormdata}
                />
              )}
            </div>
          </div>
        </RecordInfoContext.Provider>
      </Con>
    );
  }
}
