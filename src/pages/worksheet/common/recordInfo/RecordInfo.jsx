import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import styled from 'styled-components';
import { Dialog, EditingBar, WaterMark } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import DragMask from 'worksheet/common/DragMask';
import {
  emitter,
  getSubListError,
  updateOptionsOfControls,
  isRelateRecordTableControl,
  replaceByIndex,
  filterHidedSubList,
  checkCellIsEmpty,
  getRowGetType,
  formatRecordToRelateRecord,
  getRecordTempValue,
  saveTempRecordValueToLocal,
  removeTempRecordValueFromLocal,
  KVGet,
  handleChildTableUniqueError,
} from 'worksheet/util';
import { checkRuleLocked, updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import RecordInfoContext from './RecordInfoContext';
import { loadRecord, updateRecord, deleteRecord, RecordApi } from './crtl';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import RecordForm from './RecordForm';
import Header from './RecordForm/Header';
import RecordInfoRight from './RecordInfoRight';
import SheetWorkflow from 'src/pages/workflow/components/SheetWorkflow';
import './RecordInfo.less';
import { controlState, formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import externalPortalAjax from 'src/api/externalPortal';
import { addBehaviorLog } from 'src/util';
import _ from 'lodash';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';

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

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');

export default class RecordInfo extends Component {
  static propTypes = {
    width: PropTypes.number,
    visible: PropTypes.bool,
    isCharge: PropTypes.bool,
    allowAdd: PropTypes.bool,
    isOpenNewAddedRecord: PropTypes.bool,
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
    hideEditingBar: PropTypes.bool, // 隐藏编辑提示层
    switchRecordSuccess: PropTypes.func, //
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
    hideEditingBar: false,
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
      appId: props.appId,
      worksheetId: props.worksheetId,
      viewId: props.viewId,
      recordId: props.recordId,
      abnormal: false, // 异常
      sideVisible:
        props.from !== RECORD_INFO_FROM.DRAFT &&
        (props.from === RECORD_INFO_FROM.WORKFLOW || Boolean(localStorage.getItem('recordInfoSideVisible'))),
      currentIndex: _.findIndex(props.currentSheetRows, item => {
        return _.get(item, 'rowid') === props.recordId;
      }),
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
      approved: false, //允许外部用户允许查看审批流转详情
      forceShowFullValue: null,
      widgetStyle: props.widgetStyle,
      relateRecordData: {},
      restoreVisible: false,
      canSubmitDraft: false,
    };
    this.hadWaterMark = window.hadWaterMark;
    this.debounceRefresh = _.debounce(this.refreshEvent, 1000);
    this.refreshEvents = {};
    this.cellObjs = {};
    this.submitType = '';
  }
  componentDidMount() {
    emitter.addListener('RELOAD_RECORD_INFO', this.debounceRefresh);
    window.addEventListener('keydown', this.handleRecordInfoKeyDown);
    this.loadRecord({ recordId: this.state.recordId });
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.recordId !== this.props.recordId || nextProps.flag !== this.props.flag) && nextProps.recordId) {
      this.setState({
        loading: true,
        recordId: nextProps.recordId,
        abnormal: false,
        currentIndex: _.findIndex(this.props.currentSheetRows, item => {
          return _.get(item, 'rowid') === nextProps.recordId;
        }),
      });
      this.loadRecord({ recordId: nextProps.recordId, props: nextProps });
    }
    if (nextProps.width !== this.props.width) {
      this.setState({ formWidth: this.getFormWidth(nextProps) });
    }
    const changes = {};
    if (nextProps.worksheetId !== this.state.worksheetId) {
      changes.worksheetId = nextProps.worksheetId;
    }
    if (nextProps.viewId !== this.state.viewId) {
      changes.viewId = nextProps.viewId;
    }
    if (nextProps.appId !== this.state.appId) {
      changes.appId = nextProps.appId;
    }
    if (!_.isEmpty(changes)) {
      this.setState(changes);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleRecordInfoKeyDown);
    emitter.removeListener('RELOAD_RECORD_INFO', this.debounceRefresh);
  }

  get isPublicShare() {
    return (
      _.get(window, 'shareState.isPublicRecord') ||
      _.get(window, 'shareState.isPublicView') ||
      _.get(window, 'shareState.isPublicPage') ||
      _.get(window, 'shareState.isPublicQuery') ||
      _.get(window, 'shareState.isPublicPrint')
    );
  }

  loadTempValue({ updateTime } = {}) {
    const { recordId } = this.props;
    const { viewId, iseditting, tempFormData } = this.state;
    if (!viewId) return;
    let tempData;
    const handleFillValue = () => {
      if (tempData && !iseditting) {
        const savedData = safeParse(tempData);
        if (_.isEmpty(savedData)) return;
        const { create_at, value } = savedData;
        const tempRecordCreateTime = new Date(create_at);
        const recordUpdateTime = new Date(updateTime);
        if (tempRecordCreateTime > recordUpdateTime) {
          const newTempData = tempFormData.map(c =>
            typeof value[c.controlId] !== 'undefined' && !((c.type === 29 && c.enumDefault !== 1) || c.type === 34)
              ? {
                  ...c,
                  value:
                    c.type === 34
                      ? {
                          // action: 'clearAndSet',
                          rows: value[c.controlId],
                        }
                      : value[c.controlId],
                }
              : c,
          );
          if (
            _.isEmpty(
              newTempData.filter(
                c =>
                  typeof value[c.controlId] !== 'undefined' &&
                  !((c.type === 29 && c.enumDefault !== 1) || c.type === 34),
              ),
            )
          ) {
            return;
          }
          this.setState({
            restoreVisible: tempRecordCreateTime,
            tempFormData: newTempData,
            formFlag: Math.random().toString(),
          });
          if (this.recordform.current) {
            this.recordform.current.dataFormat.controlIds = tempFormData
              .filter(c => value[c.controlId] && !_.includes([29, 34], c.type))
              .map(c => c.controlId);
          }
        }
      }
    };
    if (isWxWork) {
      KVGet(`${md.global.Account.accountId}${viewId}-${recordId}-recordInfo`).then(data => {
        tempData = data;
        handleFillValue();
      });
    } else {
      tempData = localStorage.getItem(`recordInfo_${viewId}-${recordId}`);
      handleFillValue();
    }
  }
  getPortalConfigSet = async nextProps => {
    const { appId } = nextProps;
    if (!appId) {
      return {};
    }
    return externalPortalAjax.getConfig({ appId });
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
    if (formWidth < 450) {
      formWidth = 450;
    }
    return formWidth;
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
      onError = _.noop,
    } = props || this.props;
    const { isPublicShare } = this;
    const { tempFormData } = this.state;
    try {
      const data = await loadRecord({
        appId,
        viewId,
        worksheetId,
        instanceId,
        workId,
        recordId,
        getType: getRowGetType(from),
        getRules: !rules,
        controls,
      });
      let portalConfigSet = {};
      if (
        !isPublicShare &&
        !_.get(window, 'shareState.isPublicForm') &&
        !_.get(window, 'shareState.isPublicWorkflowRecord')
      ) {
        try {
          portalConfigSet =
            (appId === _.get(window, ['appInfo', 'id']) && !_.get(window, ['appInfo', 'epEnableStatus'])) ||
            !isOpenPermit(permitList.recordDiscussSwitch, sheetSwitchPermit, viewId)
              ? //同一个应用 且外部门户为开启的情况 不去获取外部门户讨论设置
                {}
              : await this.getPortalConfigSet(data);
        } catch (e) {}
      }
      // 设置隐藏字段的 hidden 属性
      data.formData = data.formData.map(c => ({
        ...c,
        hidden: c.hidden || (view.controls || _.get(data, 'view.controls') || []).includes(c.controlId),
      }));
      if ((isWorksheetRowLand && (!viewId || (viewId && !data.isViewData))) || isPublicShare) {
        data.allowEdit = false;
      }
      if (_.isBoolean(closeWhenNotViewData) && closeWhenNotViewData && viewId && !data.isViewData) {
        hideRows([recordId]);
        if (from !== RECORD_INFO_FROM.WORKSHEET_ROW_LAND) {
          hideRecordInfo(recordId);
          return;
        }
      }
      const childTableControlIds = updateRulesData({
        rules,
        data: needUpdateControlIds
          ? tempFormData
              .filter(c => !_.find(needUpdateControlIds, id => c.controlId === id))
              .concat(needUpdateControlIds.map(id => _.find(data.formData, c => c.controlId === id)).filter(_.identity))
          : data.formData,
      })
        .filter(item => item.type === 34 && !item.hidden && controlState(item, from).visible)
        .map(it => it.controlId);

      this.setState({
        ...portalConfigSet,
        sideVisible:
          (md.global.Account.isPortal &&
            !portalConfigSet.allowExAccountDiscuss &&
            (!portalConfigSet.approved || !isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId))) ||
          isPublicShare ||
          _.get(window, 'shareState.isPublicForm') ||
          _.get(window, 'shareState.isPublicWorkflowRecord')
            ? false
            : this.state.sideVisible, //外部门户是否开启讨论
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
        widgetStyle: data.advancedSetting || this.state.widgetStyle,
        childTableControlIds,
      });
      this.loadTempValue({ updateTime: data.updateTime });
    } catch (err) {
      console.error(err);
      if (instanceId && workId && err.errorCode === 10) {
        onError(err);
      }
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
    const { hideRecordInfo, hideRows, deleteRows, onDeleteSuccess = () => {} } = this.props;
    const { recordId, worksheetId } = this.state;
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
    const { recordId, iseditting, tempFormData, restoreVisible } = this.state;
    const { switchRecordSuccess } = this.props;

    if (iseditting || restoreVisible) {
      alert(_l('请先保存或取消当前更改'), 3);
      return;
    }
    $('.mdEditorSave').click();
    const { currentSheetRows } = this.props;
    const index = _.findIndex(currentSheetRows, record => {
      return record && record.rowid === recordId;
    });
    const newIndex = isNext ? index + 1 : index - 1;
    if (!currentSheetRows[newIndex]) {
      return;
    }
    const newRecordId = currentSheetRows[newIndex].rowid;
    const appId = _.get(currentSheetRows, `${newIndex}.appId`);
    const viewId = _.get(currentSheetRows, `${newIndex}.viewId`);
    const worksheetId = _.get(currentSheetRows, `${newIndex}.worksheetId`);
    this.setState({
      tempFormData: tempFormData.map(c => (isRelateRecordTableControl(c) ? { ...c, value: undefined } : c)),
    });
    addBehaviorLog('worksheetRecord', worksheetId, { rowId: newRecordId }); // 埋点
    this.loadRecord({
      recordId: newRecordId,
      props: worksheetId
        ? {
            ...this.props,
            appId,
            viewId,
            worksheetId,
          }
        : undefined,
    });
    this.setState({
      recordId: newRecordId,
      currentIndex: newIndex,
      ...(worksheetId ? { appId, viewId, worksheetId } : {}),
    });
    if (typeof switchRecordSuccess === 'function') {
      switchRecordSuccess(currentSheetRows[newIndex]);
    }
  }

  @autobind
  handleRecordInfoKeyDown(e) {
    const { tableType, showPrevNext } = this.props;
    if (
      tableType === 'classic' &&
      e.key === ' ' &&
      e.target.tagName.toLowerCase() === 'body' &&
      !this.con.querySelector('.cell.focus')
    ) {
      this.handleCancel();
      e.preventDefault();
      e.stopPropagation();
      return;
    }
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
      if (showPrevNext) {
        if (canPrev) {
          this.switchRecord(false);
        } else {
          alert(_l('没有更多了'), 3);
        }
      }
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 190) {
      if (showPrevNext) {
        if (canNext) {
          this.switchRecord(true);
        } else {
          alert(_l('没有更多了'), 3);
        }
      }
    }
  }

  renderDialogs() {
    const { hideRecordInfo } = this.props;
    const { viewId, showCloseDialog } = this.state;
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
              removeTempRecordValueFromLocal('recordInfo', viewId + '-' + this.state.recordId);
              hideRecordInfo();
            }}
          />
        )}
      </React.Fragment>
    );
  }

  @autobind
  handleFormChange(data, ids = []) {
    const { from, allowAdd } = this.props;
    const { viewId, recordinfo, updateControlIds, childTableControlIds } = this.state;

    if (childTableControlIds.every(v => _.includes(ids, v))) {
      this.setState({ canSubmitDraft: true });
    }
    const tempRecordValue = getRecordTempValue(data, undefined, { updateControlIds: ids });
    if (viewId) {
      this.tempSaving = saveTempRecordValueToLocal(
        'recordInfo',
        viewId + '-' + this.state.recordId,
        JSON.stringify({ create_at: Date.now(), value: tempRecordValue }),
      );
    }
    const allowEdit =
      from === RECORD_INFO_FROM.DRAFT
        ? allowAdd
        : _.isUndefined(this.props.allowEdit)
        ? recordinfo.allowEdit
        : this.props.allowEdit;
    const isDraftChildTableDefault =
      from === RECORD_INFO_FROM.DRAFT && data.filter(t => t.type === 34).some(it => _.get(it, 'value.isDefault'));
    this.setState({
      restoreVisible: false,
      tempFormData: data.map(c => (c.type === 34 ? { ...c, value: undefined } : c)),
      iseditting: !isDraftChildTableDefault && allowEdit,
      updateControlIds: _.uniqBy(updateControlIds.concat(ids)),
    });
  }

  @autobind
  onSubmit({ callback, noSave, ignoreError, ignoreAlert = false, silent = false } = {}) {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    this.submitOptions = { callback, noSave, ignoreError };
    this.setState({ submitLoading: true });
    setTimeout(
      () => {
        this.hasFocusingRelateRecordTags = false;
        if (this.recordform.current) {
          this.recordform.current.submitFormData({ ignoreAlert, silent });
        }
      },
      this.hasFocusingRelateRecordTags ? 1000 : 0,
    );
  }

  @autobind
  getDraftParams(data) {
    data = _.filter(
      data,
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
            'ownerid',
            'caid',
            'utime',
            'ctime',
          ],
          it.controlId,
        ),
    );
    const { relateRecordData } = this.state;
    const { draftFormControls = [], controls = [] } = this.props;

    const formData = data
      .filter(it => it.controlId !== 'ownerid')
      .filter(item => item.type !== 30 && item.type !== 31 && item.type !== 32 && item.type !== 33)
      .filter(item => !checkCellIsEmpty(item.value));

    const formDataIds = formData.map(it => it.controlId);

    let paramControls = draftFormControls
      .filter(it => !_.includes(formDataIds, it.controlId))
      .concat(formData)
      .filter(v => !isRelateRecordTableControl(v))
      .concat(
        _.keys(relateRecordData)
          .map(key => ({
            ...relateRecordData[key],
            value: JSON.stringify(formatRecordToRelateRecord(controls, relateRecordData[key].value)),
          }))
          .filter(_.identity),
      );

    return paramControls.map(it => {
      if (it.type === 34) {
        return formatControlToServer(
          {
            ...it,
            value: _.isObject(it.value) ? { ...it.value, isAdd: true, updated: [] } : it.value,
          },
          { isNewRecord: true, isDraft: true },
        );
      }
      if (it.type === 14) {
        return formatControlToServer(it, { isSubListCopy: true, isNewRecord: true, isDraft: true });
      }
      return formatControlToServer(it, { isNewRecord: true, isDraft: true });
    });
  }

  @autobind
  onSave(error, { data, updateControlIds, handleRuleError }) {
    const { setHighLightOfRows = () => {} } = this.props;
    const { callback = () => {}, noSave, ignoreError } = this.submitOptions || {};
    data = data.filter(c => !isRelateRecordTableControl(c));
    if (error && !ignoreError) {
      callback({ error: true });
      this.setState({ submitLoading: false });
      return;
    }
    const {
      from,
      projectId,
      instanceId,
      workId,
      updateSuccess,
      updateRows,
      hideRows,
      hideRecordInfo,
      updateWorksheetControls,
      allowEmptySubmit,
    } = this.props;
    const { cellObjs } = this;
    const { appId, viewId, worksheetId, recordId, recordinfo } = this.state;
    let hasError;
    const subListControls = filterHidedSubList(data, this.submitType === 'draft' ? 2 : 3);
    function getRows(controlId) {
      try {
        return cellObjs[controlId].cell.props.rows;
      } catch (err) {
        return [];
      }
    }
    function getControls(controlId) {
      try {
        return _.get(cellObjs, controlId + '.cell.state.controls') || cellObjs[controlId].cell.controls;
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
              rules: _.get(cellObjs || {}, `${control.controlId}.cell.worksheettable.current.table.rules`),
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

    if (hasError && !ignoreError) {
      alert(_l('请正确填写%0', recordinfo.entityName), 3);
      if (_.isFunction(callback)) {
        callback({ error: true });
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

    if (this.submitType === 'draft') {
      worksheetAjax
        .addWorksheetRow({
          projectId,
          appId,
          worksheetId,
          viewId,
          draftRowId: recordId,
          rowStatus: 11,
          pushUniqueId: md.global.Config.pushUniqueId,
          receiveControls: this.getDraftParams(data),
        })
        .then(res => {
          if (res.resultCode === 1) {
            removeTempRecordValueFromLocal('recordInfo', viewId + '-' + this.state.recordId);
            if (_.isFunction(_.get(this, 'tempSaving.cancel'))) {
              _.get(this, 'tempSaving.cancel')();
            }
            alert(_l('记录添加成功'));
            this.props.loadDraftList();
            this.props.hideRecordInfo();
            this.props.addNewRecord &&
              _.isFunction(this.props.addNewRecord) &&
              this.props.addNewRecord(res.data, this.props.view);
            setHighLightOfRows([recordId]);
          } else if (res.resultCode === 11 && res.badData && !_.isEmpty(res.badData)) {
            if (this.recordform.current && _.isFunction(this.recordform.current.uniqueErrorUpdate)) {
              this.recordform.current.uniqueErrorUpdate(res.badData);
            }
          } else {
            alert(_l('记录添加失败'), 2);
          }
          if (res.resultCode !== 1) {
            this.setState({
              submitLoading: false,
            });
          }
        })
        .fail(err => {
          this.setState({
            submitLoading: false,
          });
          if (_.isObject(err)) {
            alert(err.errorMessage || _l('记录添加失败'), 2);
          } else {
            alert(err || _l('记录添加失败'), 2);
          }
        });
      return;
    }
    this.abortChildTable();
    updateRecord(
      {
        appId,
        viewId,
        getType: getRowGetType(from),
        worksheetId,
        recordId,
        projectId,
        instanceId,
        workId,
        data,
        updateControlIds,
        updateSuccess,
        isDraft: from === RECORD_INFO_FROM.DRAFT,
        allowEmptySubmit,
        triggerUniqueError: badData => {
          if (this.recordform.current && _.isFunction(this.recordform.current.uniqueErrorUpdate)) {
            this.recordform.current.uniqueErrorUpdate(badData);
          }
        },
        setSublistUniqueError: badData => {
          handleChildTableUniqueError({ badData, data, cellObjs });
        },
        setRuleError: badData => {
          handleRuleError(badData, cellObjs);
        },
      },
      (err, resdata, logId) => {
        setTimeout(() => {
          this.setState({
            submitLoading: false,
          });
        }, 600);
        if (!err) {
          let newFormData = recordinfo.formData.map(c =>
            _.assign({}, c, { value: resdata[c.controlId], count: resdata[`rq${c.controlId}`] }),
          );
          updateRows([recordId], _.omit(resdata, ['allowedit', 'allowdelete']), _.pick(resdata, updateControlIds));
          this.refreshSubList();
          if (viewId && !resdata.isviewdata) {
            hideRows([recordId]);
            if (from !== RECORD_INFO_FROM.WORKSHEET_ROW_LAND) {
              hideRecordInfo();
            }
          }
          if (_.isFunction(callback)) {
            callback({ logId });
          }
          this.setState({
            iseditting: false,
          });
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
          removeTempRecordValueFromLocal('recordInfo', viewId + '-' + this.state.recordId);
          if (_.isFunction(this.refreshEvents.loadcustombtns)) {
            if (_.isFunction(_.get(this, 'tempSaving.cancel'))) {
              _.get(this, 'tempSaving.cancel')();
            }
            this.refreshEvents.loadcustombtns();
          }
        } else {
          callback({ error: err });
        }
      },
    );
  }

  // 保存/提交草稿
  @autobind
  saveDraftData({ draftType }) {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (draftType === 'submit') {
      this.submitType = 'draft';
      this.setState({ submitLoading: true });
      this.recordform.current.submitFormData();
      return;
    }
    this.setState({ submitLoading: true });
    const { data } = this.recordform.current.getSubmitData({
      silent: true,
      ignoreAlert: true,
    });
    const { projectId, recordId } = this.props;
    const { appId, viewId, worksheetId } = this.state;
    worksheetAjax
      .addWorksheetRow({
        projectId,
        appId,
        worksheetId,
        viewId,
        draftRowId: recordId,
        rowStatus: draftType === 'submit' ? 11 : 21,
        pushUniqueId: md.global.Config.pushUniqueId,
        receiveControls: this.getDraftParams(data),
      })
      .then(res => {
        if (res.resultCode === 1) {
          alert(_l('记录保存成功'));
          this.props.loadDraftList();
          this.props.hideRecordInfo();
        } else {
          alert(_l('记录保存失败'), 2);
        }
      })
      .fail(err => {
        if (_.isObject(err)) {
          alert(err.errorMessage || _l('记录添加失败'), 2);
        } else {
          alert(err || _l('记录添加失败'), 2);
        }
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
  abortChildTable() {
    Object.keys(this.cellObjs).forEach(key => {
      if (_.get(this, `cellObjs.${key}.cell.updateAbortController`)) {
        this.cellObjs[key].cell.updateAbortController();
      }
    });
  }

  @autobind
  handleCancelChange() {
    const { viewId, recordinfo, updateControlIds } = this.state;
    removeTempRecordValueFromLocal('recordInfo', viewId + '-' + this.state.recordId);
    emitter.emit('SAVE_CANCEL_RECORD');
    // 清除子表错误状态
    Object.keys(this.cellObjs).forEach(key => {
      if (this.cellObjs[key].cell && !_.isEmpty(this.cellObjs[key].cell.state.cellErrors)) {
        this.cellObjs[key].cell.setState({ cellErrors: {}, error: false });
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
    this.abortChildTable();
  }

  @autobind
  refreshEvent({ worksheetId, recordId, closeWhenNotViewData }) {
    const { iseditting } = this.state;
    if (!iseditting && worksheetId === this.state.worksheetId && recordId === this.state.recordId) {
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
    const { recordId, worksheetId, appId, viewId } = this.state;
    this.loadRecord({ recordId, worksheetId, appId, viewId, closeWhenNotViewData });
    emitter.emit('RELOAD_RECORD_INFO_DISCUSS');
    emitter.emit('RELOAD_RECORD_INFO_LOG');
  }

  @autobind
  refreshSubList() {
    const { tempFormData } = this.state;
    tempFormData
      .filter(c => c.type === 34)
      .forEach(c => {
        if (_.isFunction(this.refreshEvents[c.controlId])) {
          this.refreshEvents[c.controlId](null, { noLoading: true });
        }
      });
  }

  @autobind
  handleUnMask() {
    this.setState({ forceShowFullValue: true });
  }

  render() {
    const {
      allowEdit,
      allowAdd,
      isOpenNewAddedRecord,
      header,
      controls = [],
      workflow,
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
      updateWorksheetControls = () => {},
      rowStatus,
      hideEditingBar,
      workflowStatus,
    } = this.props;
    let { isCharge } = this.props;
    if (_.isUndefined(isCharge) && appId) {
      isCharge = window[`app_${appId}_is_charge`];
    }
    const {
      loading,
      submitLoading,
      formWidth,
      refreshBtnNeedLoading,
      abnormal,
      appId,
      viewId,
      worksheetId,
      recordId,
      currentIndex,
      recordinfo,
      tempFormData,
      showError,
      formFlag,
      iseditting,
      restoreVisible,
      sideVisible,
      hideRight,
      dragMaskVisible,
      allowExAccountDiscuss,
      exAccountDiscussEnum,
      approved,
      forceShowFullValue,
      widgetStyle,
      relateRecordData,
      canSubmitDraft,
      childTableControlIds = [],
    } = this.state;
    const isLock = checkRuleLocked(recordinfo.rules, recordinfo.formData, recordId);
    let { width } = this.props;
    if (width > 1600) {
      width = 1600;
    }
    const isSmall = window.innerWidth < 360 + 40;
    const titleControl = _.find(tempFormData, control => control.attribute === 1) || {};
    const showFullValue = _.isNull(forceShowFullValue)
      ? _.get(titleControl, 'advancedSetting.datamask') !== '1'
      : forceShowFullValue;
    const recordTitle = getTitleTextFromControls(tempFormData, undefined, undefined, {
      noMask: showFullValue,
    });

    const recordbase = {
      appId: _.isUndefined(appId) ? recordinfo.appId : appId,
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
      allowEdit:
        from === RECORD_INFO_FROM.DRAFT ? allowAdd : _.isUndefined(allowEdit) ? recordinfo.allowEdit : allowEdit,
    };
    const maskinfo = {
      forceShowFullValue: showFullValue,
      maskPermissions:
        (isCharge || _.get(titleControl, 'advancedSetting.isdecrypt') === '1') &&
        titleControl.value &&
        !showFullValue &&
        !window.shareState.shareId,
      handleUnMask: this.handleUnMask,
    };
    const useWaterMark = !this.hadWaterMark && recordinfo.projectId;
    let Con = useWaterMark ? WaterMark : React.Fragment;
    if (!this.hadWaterMark && loading) {
      return <span />;
    }

    return (
      <Con {...(useWaterMark ? { projectId: recordinfo.projectId } : {})}>
        <RecordInfoContext.Provider
          value={{
            api: new RecordApi({ appId, worksheetId, viewId, recordId }),
            updateWorksheetControls,
            recordBaseInfo: recordbase,
          }}
        >
          {this.renderDialogs()}
          {(from !== RECORD_INFO_FROM.WORKFLOW || viewId) && rowStatus !== 21 && !hideEditingBar && (
            <EditingBar
              okDisabled={!iseditting}
              loading={submitLoading}
              style={{ width: sideVisible ? formWidth : '100%' }}
              visible={iseditting}
              defaultTop={-50}
              visibleTop={8}
              title={_l('正在修改表单数据 ···')}
              onOkMouseDown={() => {
                // hasFocusingRelateRecordTags 点击保存是不是有正在编辑的关联记录卡片字段 TODO: 后面从relateRecordTags组件交互方面解决这个问题
                this.hasFocusingRelateRecordTags = !!this.con.querySelector(
                  '.cellRelateRecordTags.cellControlEdittingStatus',
                );
              }}
              onUpdate={this.onSubmit}
              onCancel={this.handleCancelChange}
            />
          )}
          {(from !== RECORD_INFO_FROM.WORKFLOW || viewId) && rowStatus !== 21 && (
            <EditingBar
              loading={submitLoading}
              style={{ width: sideVisible ? formWidth : '100%' }}
              visible={!!restoreVisible}
              defaultTop={-50}
              visibleTop={8}
              title={_l('已恢复到上次中断内容（%0）', window.createTimeSpan(new Date(restoreVisible)))}
              onUpdate={() => {
                this.setState({
                  restoreVisible: false,
                  iseditting: true,
                });
              }}
              onCancel={() => {
                removeTempRecordValueFromLocal('recordInfo', viewId + '-' + this.state.recordId);
                this.setState({
                  restoreVisible: false,
                  tempFormData: recordinfo.formData || [],
                  formFlag: Math.random().toString(32),
                });
              }}
            />
          )}
          <div
            className={cx('recordInfoCon flexColumn', { abnormal, isWorkflow: from === RECORD_INFO_FROM.WORKFLOW })}
            data-record-id={recordId}
            ref={con => (this.con = con)}
            onClick={e => e.stopPropagation()}
          >
            {!abnormal &&
              !(
                (_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) &&
                _.get(view, 'viewType') === 6 &&
                String(_.get(view, 'childType')) === '1'
              ) && (
                <Header
                  isCharge={isCharge}
                  from={from}
                  isOpenNewAddedRecord={isOpenNewAddedRecord}
                  allowExAccountDiscuss={allowExAccountDiscuss}
                  exAccountDiscussEnum={exAccountDiscussEnum}
                  approved={approved}
                  loading={loading}
                  view={view}
                  viewId={viewId}
                  header={
                    from === 21 && !_.isEmpty(childTableControlIds) && !canSubmitDraft ? (
                      <div className="flex"></div>
                    ) : (
                      header
                    )
                  }
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
                    this.setState({ sideVisible: !sideVisible, hideRight: sideVisible });
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
                    if (_.isFunction(handleAddSheetRow)) {
                      handleAddSheetRow(row, afterRowId);
                    }
                  }}
                />
              )}
            <div className="recordBody flex flexRow">
              {submitLoading && <LoadMask />}
              {dragMaskVisible && (
                <DragMask
                  value={formWidth}
                  min={450}
                  max={width - 423}
                  onChange={value => {
                    safeLocalStorageSetItem('RECORD_INFO_FORM_WIDTH', value);
                    this.setState({ dragMaskVisible: false, formWidth: value });
                  }}
                />
              )}
              <RecordForm
                ignoreHeader={from === RECORD_INFO_FROM.WORKFLOW && header && viewId}
                ignoreLock={from === RECORD_INFO_FROM.WORKFLOW || from === RECORD_INFO_FROM.DRAFT}
                from={from}
                isLock={isLock}
                formWidth={sideVisible ? formWidth : width}
                loading={loading}
                recordbase={recordbase}
                maskinfo={maskinfo}
                widgetStyle={widgetStyle}
                mountRef={recordform => (this.recordform = recordform)}
                registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
                formFlag={formFlag}
                abnormal={abnormal}
                recordinfo={recordinfo}
                formdata={tempFormData}
                controlProps={{
                  recordInfoFrom: from,
                  isCharge,
                  refreshRecord: this.handleRefresh,
                  addRefreshEvents: (id, fn) => {
                    this.refreshEvents[id] = fn;
                  },
                  updateRelationControls: (worksheetIdOfControl, newControls) => {
                    this.recordform.current.dataFormat.data = this.recordform.current.dataFormat.data.map(item => {
                      if (item.type === 34 && item.dataSource === worksheetIdOfControl) {
                        return { ...item, relationControls: newControls };
                      } else {
                        return item;
                      }
                    });
                    this.recordform.current.setState({ renderData: this.recordform.current.getFilterDataByRule() });
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
                  const tempFormData = this.state.tempFormData;
                  const needUpdateControl = _.find(tempFormData, { controlId });
                  if (needUpdateControl && needUpdateControl.value == num) {
                    return;
                  }
                  if (typeof num === 'number' && num >= 0 && _.get(this, 'recordform.current.dataFormat')) {
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
                    if (_.isFunction(this.refreshEvents.loadcustombtns)) {
                      this.refreshEvents.loadcustombtns();
                    }
                  }
                  tempFormData
                    .filter(c => c.type === 37 && _.includes(c.dataSource, controlId))
                    .forEach(c => {
                      worksheetAjax.getRowDetail({ worksheetId, rowId: recordId, getType: 1 }).then(data => {
                        const controlValue = safeParse(data.rowData)[c.controlId];
                        const newFormData = tempFormData.map(cc =>
                          cc.controlId === c.controlId ? { ...cc, value: controlValue } : cc,
                        );
                        if (!_.isUndefined(controlValue)) {
                          this.setState({
                            recordinfo: {
                              ...recordinfo,
                              formData: newFormData,
                            },
                            tempFormData: newFormData,
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
                  if (_.isFunction(this.refreshEvents.loadcustombtns)) {
                    this.refreshEvents.loadcustombtns();
                  }
                }}
                onSave={this.onSave}
                onCancel={this.handleCancelChange}
                onError={() => {
                  this.setState({ submitLoading: false });
                }}
                currentIndex={currentIndex}
                onRelateRecordsChange={(control, records) => {
                  if (!this.recordform || !this.recordform.current || from !== RECORD_INFO_FROM.DRAFT) {
                    return;
                  }
                  const newRelateRecordData = {
                    ...relateRecordData,
                    [control.controlId]: { ...control, value: records },
                  };
                  this.setState({ relateRecordData: newRelateRecordData });
                }}
                updateWorksheetControls={(needUpdateControls = []) => {
                  updateWorksheetControls(
                    controls.map(c => _.find(needUpdateControls, { controlId: c.controlId }) || c),
                  );
                }}
              />
              {sideVisible && <Drag left={formWidth} onMouseDown={() => this.setState({ dragMaskVisible: true })} />}
              {!abnormal && (sideVisible || typeof hideRight !== 'undefined') && (
                <RecordInfoRight
                  workflowStatus={
                    workflowStatus ||
                    _.get(
                      _.find(tempFormData, c => c.controlId === 'wfstatus'),
                      'value',
                    )
                  }
                  loading={loading}
                  isOpenNewAddedRecord={isOpenNewAddedRecord}
                  allowExAccountDiscuss={allowExAccountDiscuss}
                  exAccountDiscussEnum={exAccountDiscussEnum}
                  approved={approved}
                  className={cx('flex', { hide: hideRight })}
                  recordbase={recordbase}
                  workflow={workflow}
                  approval={
                    <SheetWorkflow
                      projectId={this.props.projectId || recordinfo.projectId}
                      worksheetId={worksheetId}
                      recordId={recordId}
                      isCharge={recordinfo.roleType === 2}
                      refreshBtnNeedLoading={refreshBtnNeedLoading}
                      formWidth={formWidth}
                      appId={appId}
                    />
                  }
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
