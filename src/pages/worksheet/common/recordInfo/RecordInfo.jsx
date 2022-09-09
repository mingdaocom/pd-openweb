import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import styled from 'styled-components';
import { Dialog, EditingBar, WaterMark } from 'ming-ui';
import { getRowDetail } from 'src/api/worksheet';
import DragMask from 'worksheet/common/DragMask';
import {
  emitter,
  getSubListError,
  updateOptionsOfControls,
  isRelateRecordTableControl,
  replaceByIndex,
  filterHidedSubList,
} from 'worksheet/util';
import { checkRuleLocked } from 'src/components/newCustomFields/tools/filterFn';
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
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { getDiscussConfig } from 'src/api/externalPortal';

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

const LoadMask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 2;
`;

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
      submitLoading: false,
      formWidth: this.getFormWidth(props),
      recordinfo: {},
      tempFormData: [],
      updateControlIds: [],
      recordId: props.recordId,
      abnormal: false, // 异常
      sideVisible: props.from === RECORD_INFO_FROM.WORKFLOW || Boolean(localStorage.getItem('recordInfoSideVisible')),
      currentIndex: _.findIndex(props.currentSheetRows, item => {
        return item.rowid === props.recordId;
      }),
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
    };
    this.hadWaterMark = window.hadWaterMark;
    this.debounceRefresh = _.debounce(this.refreshEvent, 1000);
    this.refreshEvents = {};
    this.cellObjs = {};
  }
  componentDidMount() {
    emitter.addListener('RELOAD_RECORD_INFO', this.debounceRefresh);
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
    emitter.removeListener('RELOAD_RECORD_INFO', this.debounceRefresh);
  }

  getPortalDiscussSet = async nextProps => {
    const { appId } = nextProps;
    if (!appId) {
      return {};
    }
    return getDiscussConfig({ appId });
  };

  getFormWidth(props) {
    let { width, viewId, sheetSwitchPermit } = props || this.props;
    if (width > 1600) {
      width = 1600;
    }
    if (
      !isOpenPermit(permitList.recordDiscussSwitch, sheetSwitchPermit, viewId) &&
      !isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId)
    ) {
      return width;
    }
    let formWidth;
    try {
      formWidth = parseInt(localStorage.getItem('RECORD_INFO_FORM_WIDTH'), 10);
      if (!_.isNumber(formWidth) || _.isNaN(formWidth)) {
        throw new Error();
      }
    } catch (err) {
      formWidth = width - 500;
    }
    if (formWidth > width - 425) {
      formWidth = width - 425;
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
      view = {},
      controls,
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
      sheetSwitchPermit,
    } = props || this.props;
    const { tempFormData } = this.state;
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
        controls,
      });
      let portalDiscussSet = {};
      try {
        portalDiscussSet =
          (appId === _.get(window, ['appInfo', 'id']) && !_.get(window, ['appInfo', 'epEnableStatus'])) ||
          !isOpenPermit(permitList.recordDiscussSwitch, sheetSwitchPermit, viewId)
            ? //同一个应用 且外部门户为开启的情况 不去获取外部门户讨论设置
              {}
            : await this.getPortalDiscussSet(data);
      } catch (e) {}
      // 设置隐藏字段的 hidden 属性
      data.formData = data.formData.map(c => ({
        ...c,
        hidden: c.hidden || (view.controls || _.get(data, 'view.controls') || []).includes(c.controlId),
      }));
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
        ...portalDiscussSet,
        sideVisible:
          md.global.Account.isPortal && !portalDiscussSet.allowExAccountDiscuss ? false : this.state.sideVisible, //外部门户是否开启讨论
        recordinfo: {
          ...data,
          allowAdd,
          ...(data.rules ? {} : { rules }),
          isWorksheetQuery: isWorksheetQuery || _.isUndefined(isWorksheetQuery),
        },
        tempFormData: needUpdateControlIds
          ? tempFormData
              .filter(c => !_.find(needUpdateControlIds, id => c.controlId === id))
              .concat(needUpdateControlIds.map(id => _.find(data.formData, c => c.controlId === id)).filter(_.identity))
          : data.formData,
        formFlag: Math.random().toString(),
        loading: false,
        refreshBtnNeedLoading: false,
      });
      this.updateLockStatus(data.formData);
    } catch (err) {
      console.error(err);
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
    const { recordId, iseditting, tempFormData } = this.state;
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
      tempFormData: tempFormData.map(c => (isRelateRecordTableControl(c) ? { ...c, value: undefined } : c)),
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
    let activeDialogRecordId;
    try {
      activeDialogRecordId = [...document.querySelectorAll('.recordInfoCon')].pop().getAttribute('data-record-id');
    } catch (err) {}
    if (activeDialogRecordId !== this.state.recordId) {
      return;
    }
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
  handleFormChange(data, ids = []) {
    const { updateControlIds } = this.state;
    this.setState({
      tempFormData: data.map(c => (c.type === 34 ? { ...c, value: undefined } : c)),
      iseditting: true,
      updateControlIds: _.uniqBy(updateControlIds.concat(ids)),
    });
  }

  @autobind
  onSubmit({ callback, noSave } = {}) {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    this.submitOptions = { callback, noSave };
    this.setState({ submitLoading: true });
    this.recordform.current.submitFormData();
  }

  @autobind
  onSave(error, { data, updateControlIds }) {
    const { callback = () => {}, noSave } = this.submitOptions || {};
    if (error) {
      callback(true);
      this.setState({ submitLoading: false });
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
    const { recordId, recordinfo } = this.state;
    let hasError;
    emitter.emit('SAVE_CANCEL_RECORD');
    const subListControls = filterHidedSubList(data, 3);
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
      alert(_l('请正确填写%0', recordinfo.entityName), 3);
      if (_.isFunction(callback)) {
        callback(true);
      }
      this.setState({
        submitLoading: false,
      });
      return false;
    }
    if (noSave) {
      this.setState({
        submitLoading: false,
      });
      callback();
      return;
    }
    this.setState({
      iseditting: false,
    });
    setTimeout(() => {
      this.setState({
        submitLoading: false,
      });
    }, 600);
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
          let newFormData = recordinfo.formData.map(c => _.assign({}, c, { value: resdata[c.controlId] }));
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
            tempFormData: newFormData,
            recordinfo: { ...recordinfo, formData: newFormData },
            updateControlIds: [],
          });
          this.updateLockStatus(newFormData);
          if (_.isFunction(this.refreshEvents.loadcustombtns)) {
            this.refreshEvents.loadcustombtns();
          }
        }
      },
    );
  }

  updateLockStatus(formData) {
    const { from } = this.props;
    const { recordinfo } = this.state;
    this.setState({
      isLock: checkRuleLocked(recordinfo.rules, formData || recordinfo.formData, from),
    });
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
      tempFormData: (recordinfo.formData || []).map(c => {
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
    emitter.emit('RELOAD_RECORD_INFO_DISCUSS');
  }

  @autobind
  refreshSubList() {
    const { tempFormData, updateControlIds } = this.state;
    tempFormData
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
      controls,
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
      updateWorksheetControls,
    } = this.props;
    let { isCharge } = this.props;
    if (_.isUndefined(isCharge) && appId) {
      isCharge = window[`app_${appId}_is_charge`];
    }
    const {
      loading,
      isLock,
      submitLoading,
      formWidth,
      refreshBtnNeedLoading,
      abnormal,
      recordId,
      currentIndex,
      recordinfo,
      tempFormData,
      showError,
      formFlag,
      iseditting,
      sideVisible,
      dragMaskVisible,
      allowExAccountDiscuss,
      exAccountDiscussEnum,
    } = this.state;
    let { width } = this.props;
    if (width > 1600) {
      width = 1600;
    }
    const isSmall = window.innerWidth < 360 + 40;
    const recordTitle = getTitleTextFromControls(tempFormData);
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
    const useWaterMark = !this.hadWaterMark && recordinfo.projectId;
    let Con = useWaterMark ? WaterMark : React.Fragment;
    if (!this.hadWaterMark && loading) {
      return <span />;
    }
    return (
      <Con {...(useWaterMark ? { projectId: recordinfo.projectId } : {})}>
        <RecordInfoContext.Provider
          value={{ api: new RecordApi({ appId, worksheetId, viewId, recordId }), updateWorksheetControls }}
        >
          {this.renderDialogs()}
          {(from !== RECORD_INFO_FROM.WORKFLOW || viewId) && (
            <EditingBar
              loading={submitLoading}
              style={{ width: sideVisible ? formWidth : '100%' }}
              visible={iseditting}
              defaultTop={-50}
              visibleTop={8}
              title={_l('正在修改表单数据 ···')}
              onUpdate={this.onSubmit}
              onCancel={this.handleCancelChange}
            />
          )}
          <div
            className={cx('recordInfoCon flexColumn', { abnormal, isWorkflow: from === RECORD_INFO_FROM.WORKFLOW })}
            data-record-id={recordId}
            ref={con => (this.con = con)}
            onClick={e => e.stopPropagation()}
          >
            {!abnormal && (
              <Header
                allowExAccountDiscuss={allowExAccountDiscuss}
                exAccountDiscussEnum={exAccountDiscussEnum}
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
                addRefreshEvents={(key, fn) => {
                  this.refreshEvents[key] = fn;
                }}
                onRefresh={this.handleRefresh}
                onSubmit={this.onSubmit}
                refreshRotating={refreshBtnNeedLoading}
                hideRecordInfo={hideRecordInfo}
                reloadRecord={this.handleRefresh}
                onSideIconClick={() => {
                  if (from !== RECORD_INFO_FROM.WORKFLOW) {
                    safeLocalStorageSetItem('recordInfoSideVisible', sideVisible ? '' : 'true');
                  }
                  this.setState({ sideVisible: !sideVisible });
                }}
                onCancel={this.handleCancel}
                onUpdate={(changedValue, record) => {
                  updateRows([recordId], _.omit(record, ['allowedit', 'allowdelete']), changedValue);
                  const newFormData = recordinfo.formData.map(c =>
                    _.assign({}, c, { value: changedValue[c.controlId] || c.value }),
                  );
                  Object.keys(changedValue).forEach(key => {
                    if (_.isFunction(this.refreshEvents[key])) {
                      this.refreshEvents[key]();
                    }
                  });
                  this.setState({
                    formFlag: Math.random().toString(),
                    tempFormData: newFormData,
                    recordinfo: { ...recordinfo, formData: newFormData },
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
              {submitLoading && <LoadMask />}
              {dragMaskVisible && (
                <DragMask
                  value={formWidth}
                  min={400}
                  max={width - 423}
                  onChange={value => {
                    safeLocalStorageSetItem('RECORD_INFO_FORM_WIDTH', value);
                    this.setState({ dragMaskVisible: false, formWidth: value });
                  }}
                />
              )}
              <RecordForm
                ignoreHeader={from === RECORD_INFO_FROM.WORKFLOW && header && viewId}
                ignoreLock={from === RECORD_INFO_FROM.WORKFLOW}
                from={from}
                isLock={isLock}
                formWidth={sideVisible ? formWidth : width}
                loading={loading}
                recordbase={recordbase}
                mountRef={recordform => (this.recordform = recordform)}
                registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
                formFlag={formFlag}
                abnormal={abnormal}
                recordinfo={recordinfo}
                formdata={tempFormData}
                controlProps={{
                  isCharge,
                  refreshRecord: this.handleRefresh,
                  addRefreshEvents: (id, fn) => {
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
                addRefreshEvents={(key, fn) => {
                  this.refreshEvents[key] = fn;
                }}
                updateRecordDialogOwner={this.updateRecordOwner}
                updateRows={updateRows}
                onChange={this.handleFormChange}
                updateRelateRecordNum={(controlId, num) => {
                  if (!this.recordform) {
                    return;
                  }
                  const needUpdateControl = _.find(tempFormData, { controlId });
                  if (needUpdateControl && needUpdateControl.value == num) {
                    return;
                  }
                  if (typeof num === 'number' && num >= 0 && this.recordform.current.dataFormat) {
                    this.recordform.current.dataFormat.updateDataSource({
                      controlId,
                      value: String(num),
                      notInsertControlIds: true,
                    });
                    this.recordform.current.updateRenderData({ noRule: true });
                    this.setState({
                      tempFormData: tempFormData.map(item =>
                        item.controlId === controlId ? { ...item, value: String(num) } : item,
                      ),
                    });
                  }
                  tempFormData
                    .filter(c => c.type === 37 && _.includes(c.dataSource, controlId))
                    .forEach(c => {
                      getRowDetail({ worksheetId, rowId: recordId, getType: 1 }).then(data => {
                        const controlValue = safeParse(data.rowData)[c.controlId];
                        if (!_.isUndefined(controlValue)) {
                          this.setState({
                            recordinfo: {
                              ...recordinfo,
                              formData: recordinfo.formData.map(cc =>
                                cc.controlId === c.controlId ? { ...cc, value: controlValue } : cc,
                              ),
                            },
                          });
                          this.recordform.current.dataFormat.updateDataSource({
                            controlId: c.controlId,
                            value: controlValue,
                            // notInsertControlIds: true,
                          });
                          this.recordform.current.updateRenderData();
                        }
                      });
                    });
                }}
                onSave={this.onSave}
                onCancel={this.handleCancelChange}
                onError={() => {
                  this.setState({ submitLoading: false });
                }}
                currentIndex={currentIndex}
              />
              {sideVisible && <Drag left={formWidth} onMouseDown={() => this.setState({ dragMaskVisible: true })} />}
              {!abnormal && sideVisible && (
                <RecordInfoRight
                  allowExAccountDiscuss={allowExAccountDiscuss}
                  exAccountDiscussEnum={exAccountDiscussEnum}
                  className="flex"
                  recordbase={recordbase}
                  workflow={workflow}
                  sheetSwitchPermit={sheetSwitchPermit}
                  projectId={this.props.projectId}
                  controls={controls}
                  formFlag={formFlag}
                  formdata={tempFormData.map(o => {
                    if (o.controlId === 'ownerid') {
                      //更新拥有者数据
                      return { ...o, value: recordinfo.ownerAccount && JSON.stringify([recordinfo.ownerAccount]) };
                    } else {
                      return o;
                    }
                  })}
                />
              )}
            </div>
          </div>
        </RecordInfoContext.Provider>
      </Con>
    );
  }
}
