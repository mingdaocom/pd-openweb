import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { Dialog, EditingBar, WaterMark } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import DragMask from 'worksheet/common/DragMask';
import {
  emitter,
  updateOptionsOfControls,
  isRelateRecordTableControl,
  filterHidedSubList,
  checkCellIsEmpty,
  getRowGetType,
  formatRecordToRelateRecord,
  getRecordTempValue,
  saveTempRecordValueToLocal,
  removeTempRecordValueFromLocal,
  KVGet,
} from 'worksheet/util';
import { checkRuleLocked, updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import RecordInfoContext from './RecordInfoContext';
import { loadRecord, updateRecord, deleteRecord, RecordApi } from './crtl';
import { RECORD_INFO_FROM, RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import RecordForm from './RecordForm';
import Header from './RecordForm/Header';
import RecordInfoRight from './RecordInfoRight';
import SheetWorkflow from 'src/pages/workflow/components/SheetWorkflow';
import './RecordInfo.less';
import { controlState, formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import externalPortalAjax from 'src/api/externalPortal';
import { addBehaviorLog, getTranslateInfo } from 'src/util';
import _, { get } from 'lodash';
import SheetContext from '../Sheet/SheetContext';
import paymentAjax from 'src/api/payment.js';

const SIDE_MIN_WIDTH = 400;

const Drag = styled.div`
  z-index: 2;
  width: 10px;
  height: 100%;
  margin-right: -10px;
  cursor: ew-resize;
  &:hover {
    border-left: 2px solid #ddd;
  }
`;

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

function getSideVisible(from) {
  if (from === RECORD_INFO_FROM.DRAFT) {
    return false;
  } else if (from === RECORD_INFO_FROM.WORKFLOW) {
    return Boolean(localStorage.getItem('recordInfoOfWorkflowSideVisible'));
  } else {
    return Boolean(localStorage.getItem('recordInfoSideVisible'));
  }
}

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
    renderHeader: PropTypes.func, // 渲染头部组件的方法
    renderAbnormal: PropTypes.func, // 渲染异常
    workflow: PropTypes.element,
    hideEditingBar: PropTypes.bool, // 隐藏编辑提示层
    switchRecordSuccess: PropTypes.func, //切换记录回调
    customBtnTriggerCb: PropTypes.func, //自定义按钮回调
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
  static contextType = SheetContext;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      submitLoading: false,
      isSettingTempData: false,
      sideWidth: this.getSideWidth(),
      recordinfo: {},
      tempFormData: [],
      updateControlIds: [],
      sheetSwitchPermit: props.sheetSwitchPermit,
      appId: props.appId,
      worksheetId: props.worksheetId,
      viewId: props.viewId,
      recordId: props.recordId,
      abnormal: false, // 异常
      sideVisible: getSideVisible(props.from),
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
      payConfig: {}, //支付相关
      discussCount: undefined,
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
        this.setState({ isSettingTempData: true });
        const savedData = safeParse(tempData);
        if (_.isEmpty(savedData)) {
          this.setState({ isSettingTempData: false });
          return;
        }
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
            this.setState({ isSettingTempData: false });
            return;
          }
          this.setState(
            {
              restoreVisible: tempRecordCreateTime,
              tempFormData: newTempData,
              formFlag: Math.random().toString(),
              isSettingTempData: false,
            },
            () => {
              setTimeout(() => {
                if (this.recordform.current) {
                  this.recordform.current.dataFormat.controlIds = tempFormData
                    .filter(c => value[c.controlId] && !((c.type === 29 && c.enumDefault !== 1) || c.type === 34))
                    .map(c => c.controlId);
                }
              }, 300);
            },
          );
        } else {
          this.setState({ isSettingTempData: false });
        }
      }
    };
    if (window.isWxWork) {
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

  getPayConfig = (projectId, worksheetId, appId, rowId, viewId) => {
    return paymentAjax.checkPayOrderForRowDetail({
      projectId,
      worksheetId,
      appId,
      rowId,
      viewId,
    });
  };

  getSideWidth() {
    const sideWidth = parseInt(localStorage.getItem('RECORD_INFO_SIDE_WIDTH') || 400, 10);
    if (_.isNaN(sideWidth)) {
      return 400;
    }
    // SIDE_MIN_WIDTH
    return sideWidth;
  }

  async loadRecord({ recordId, props, needReLoadSheetSwitch, closeWhenNotViewData, needUpdateControlIds }) {
    const {
      from,
      view = {},
      controls,
      allowAdd,
      appId,
      viewId,
      worksheetId,
      relationWorksheetId,
      instanceId,
      workId,
      rules,
      isWorksheetQuery,
      isWorksheetRowLand,
      hideRows,
      hideRecordInfo,
      enablePayment,
      onError = _.noop,
    } = props || this.props;
    let { sheetSwitchPermit } = this.state;
    const { isPublicShare } = this;
    const { tempFormData } = this.state;
    try {
      if (needReLoadSheetSwitch) {
        sheetSwitchPermit = await worksheetAjax.getSwitchPermit({ worksheetId });
      }
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
        relationWorksheetId,
      });
      let portalConfigSet = {};
      const id = this.props.projectId || data.projectId;
      // 支付配置（草稿箱、对外公开分享\公开表单无支付）
      let payConfig =
        from === 21 ||
        this.isPublicShare ||
        _.get(window, 'shareState.isPublicForm') ||
        _.get(window, 'shareState.isPublicWorkflowRecord') ||
        (!_.isUndefined(enablePayment) && !enablePayment) ||
        !data.appId
          ? {}
          : await this.getPayConfig(id, worksheetId, data.appId, recordId, viewId);

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
      data.worksheetName = getTranslateInfo(appId, null, worksheetId).name || data.worksheetName;
      // 设置隐藏字段的 hidden 属性
      data.formData = data.formData.map(c => {
        const newControl = {
          ...c,
          hidden: c.hidden || (view.controls || _.get(data, 'view.controls') || []).includes(c.controlId),
        };
        if (c.type === 29 && get(c, 'advancedSetting.showtype') === String(RELATE_RECORD_SHOW_TYPE.TABLE)) {
          // 关联表格配置了过滤结果后，需要不显示实际关联数量，显示过滤后数量
          const strDefault = c.strDefault || '';
          const [isHiddenOtherViewRecord] = strDefault.split('');
          const resultfilters = safeParse(get(c, 'advancedSetting.resultfilters'));
          const filterResult = (resultfilters && resultfilters.length > 0) || !!+isHiddenOtherViewRecord;
          return filterResult
            ? {
                ...newControl,
                value: undefined,
              }
            : newControl;
        } else {
          return newControl;
        }
      });
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
      const tempControls = needUpdateControlIds
        ? tempFormData
            .filter(c => !_.find(needUpdateControlIds, id => c.controlId === id))
            .concat(needUpdateControlIds.map(id => _.find(data.formData, c => c.controlId === id)).filter(_.identity))
        : data.formData;

      const childTableControlIds = updateRulesData({
        rules,
        data: tempControls,
        recordId,
      })
        .filter(item => {
          if (item.type === 34) {
            const tab = _.find(tempControls, v => item.sectionId == v.controlId);
            return tab
              ? !item.hidden && controlState(item, from).visible && !tab.hidden && controlState(tab, from).visible
              : !item.hidden && controlState(item, from).visible;
          }
          return false;
        })
        .map(it => it.controlId);

      this.setState({
        ...portalConfigSet,
        payConfig,
        sideVisible:
          (md.global.Account.isPortal &&
            !portalConfigSet.allowExAccountDiscuss &&
            (!portalConfigSet.approved || !isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId))) ||
          isPublicShare ||
          _.get(window, 'shareState.isPublicForm') ||
          _.get(window, 'shareState.isPublicWorkflowRecord')
            ? false
            : this.state.sideVisible, //外部门户是否开启讨论
        formSectionWidth: 0,
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
        ...(needReLoadSheetSwitch ? { sheetSwitchPermit } : {}),
      });
      this.loadTempValue({ updateTime: data.updateTime });
    } catch (res) {
      if (instanceId && workId && res.errorCode === 10) {
        onError(res);
      }

      this.setState({
        abnormal: true,
        loading: false,
        recordinfo: res || {},
        refreshBtnNeedLoading: false,
      });
    }
  }

  handleCancel = () => {
    if (this.state.iseditting) {
      this.setState({ showCloseDialog: true });
    } else {
      this.props.hideRecordInfo();
    }
  };

  handleDelete = async e => {
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
      if (window.customWidgetViewIsActive) {
        emitter.emit('POST_MESSAGE_TO_CUSTOM_WIDGET', {
          action: 'delete-record',
          value: recordId,
        });
      }
      alert(_l('删除成功'));
    } catch (err) {
      alert(_l('删除失败'), 2);
    }
  };

  switchRecord = isNext => {
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
      needReLoadSheetSwitch: worksheetId !== this.state.worksheetId,
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
  };

  handleRecordInfoKeyDown = e => {
    const { tableType, showPrevNext } = this.props;
    // 嵌入视图不支持上下页快捷操作
    if (get(this.context, 'config.fromEmbed')) return;

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
      const filterEmbedViewRecord = [...document.querySelectorAll('.recordInfoCon')].filter(i => {
        return !i.closest('.viewContainer');
      });
      activeDialogRecordId = filterEmbedViewRecord.pop().getAttribute('data-record-id');
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
  };

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

  handleFormChange = (data, ids = []) => {
    const { from, allowAdd } = this.props;
    const { viewId, recordinfo, updateControlIds } = this.state;

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
  };

  onSubmit = ({ callback, noSave, ignoreError, ignoreAlert = false, silent = false } = {}) => {
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
  };

  getDraftParams = data => {
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
      .map(v => (v.type === 29 && !v.value ? { ...v, value: '[]' } : v))
      .filter(it => !_.includes(formDataIds, it.controlId))
      .concat(formData)
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
  };

  onSave = (error, { data, updateControlIds, handleRuleError }) => {
    const { setHighLightOfRows = () => {}, from } = this.props;
    const { callback = () => {}, noSave, ignoreError } = this.submitOptions || {};
    data =
      from === RECORD_INFO_FROM.DRAFT
        ? data
        : data.filter(c => !isRelateRecordTableControl(c, { ignoreInFormTable: true }));
    if (error && !ignoreError) {
      callback({ error: true });
      this.setState({ submitLoading: false });
      return;
    }
    const {
      projectId,
      instanceId,
      workId,
      updateSuccess,
      updateRows,
      hideRows,
      hideRecordInfo,
      updateWorksheetControls,
      allowEmptySubmit,
      enablePayment,
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
          viewId: viewId || get(this, 'props.view.viewId'),
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
          } else if (res.resultCode === 2) {
            alert(_l('当前草稿已保存，请勿重复提交'), 2);
          } else {
            alert(_l('记录添加失败'), 2);
          }
          if (res.resultCode !== 1) {
            this.setState({
              submitLoading: false,
            });
          }
        })
        .catch(err => {
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
        setSubListUniqueError: badData => {
          this.recordform.current.dataFormat.callStore('setUniqueError', { badData });
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
          let newFormData = recordinfo.formData.map(c => {
            let value = resdata[c.controlId];
            return _.assign({}, c, { value, count: resdata[`rq${c.controlId}`] });
          });
          updateRows([recordId], _.omit(resdata, ['allowedit', 'allowdelete']), _.pick(resdata, updateControlIds));
          if (window.customWidgetViewIsActive) {
            emitter.emit('POST_MESSAGE_TO_CUSTOM_WIDGET', {
              action: 'update-record',
              value: resdata,
            });
          }
          this.refreshAsyncLoadControl();
          if (get(this, 'recordform.current.dataFormat.callStore')) {
            this.recordform.current.dataFormat.callStore('reset');
          }
          if (viewId && !resdata.isviewdata) {
            hideRows([recordId]);
            if (from !== RECORD_INFO_FROM.WORKSHEET_ROW_LAND) {
              hideRecordInfo();
            }
          }
          const updatePayConfig = async () => {
            let payConfig =
              from === 21 ||
              this.isPublicShare ||
              _.get(window, 'shareState.isPublicForm') ||
              _.get(window, 'shareState.isPublicWorkflowRecord') ||
              (!_.isUndefined(enablePayment) && !enablePayment) ||
              !recordinfo.appId
                ? {}
                : await this.getPayConfig(recordinfo.projectId, worksheetId, recordinfo.appId, recordId, viewId);
            this.setState({
              payConfig,
            });
          };
          updatePayConfig();
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
  };

  // 保存/提交草稿
  saveDraftData = ({ draftType }) => {
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
    const { projectId } = this.props;
    const { appId, viewId, worksheetId, recordId } = this.state;
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
      .catch(err => {
        if (_.isObject(err)) {
          alert(err.errorMessage || _l('记录添加失败'), 2);
        } else {
          alert(err || _l('记录添加失败'), 2);
        }
      });
  };

  updateRecordOwner = (newOwner, record) => {
    const { updateRows } = this.props;
    const { recordId, recordinfo } = this.state;
    const changedValue = { ownerid: JSON.stringify([newOwner]) };
    updateRows([recordId], _.omit(record, ['allowedit', 'allowdelete']), changedValue);
    this.setState({
      recordinfo: { ...recordinfo, ownerAccount: newOwner },
    });
  };

  abortChildTable = () => {
    Object.keys(this.cellObjs).forEach(key => {
      if (_.get(this, `cellObjs.${key}.cell.updateAbortController`)) {
        this.cellObjs[key].cell.updateAbortController();
      }
    });
  };

  handleCancelChange = () => {
    const { viewId, recordinfo, updateControlIds } = this.state;
    removeTempRecordValueFromLocal('recordInfo', viewId + '-' + this.state.recordId);
    emitter.emit('SAVE_CANCEL_RECORD');
    this.setState(
      {
        tempFormData: recordinfo.formData || [],
        iseditting: false,
        formFlag: Math.random().toString(),
      },
      () => {
        this.recordform.current.dataFormat.callStore('cancelChange');
        this.abortChildTable();
      },
    );
  };

  refreshEvent = ({ worksheetId, recordId, closeWhenNotViewData }) => {
    const { iseditting } = this.state;
    if (!iseditting && worksheetId === this.state.worksheetId && recordId === this.state.recordId) {
      this.handleRefresh({ closeWhenNotViewData, reloadDiscuss: false });
    }
  };

  handleRefresh = ({ closeWhenNotViewData, doNotResetPageIndex, reloadDiscuss = true } = {}) => {
    if (this.state.iseditting) {
      return;
    }
    emitter.emit('RELOAD_RECORD_INFO_BEGIN');
    this.setState({
      refreshBtnNeedLoading: true,
    });
    _.each(this.refreshEvents || {}, fn => {
      if (_.isFunction(fn)) {
        fn({ doNotResetPageIndex });
      }
    });
    const { recordId, worksheetId, appId, viewId } = this.state;
    this.loadRecord({
      recordId,
      closeWhenNotViewData,
      props: {
        ...this.props,
        appId,
        viewId,
        worksheetId,
      },
    });
    if (reloadDiscuss) {
      emitter.emit('RELOAD_RECORD_INFO_DISCUSS');
    }
    emitter.emit('RELOAD_RECORD_INFO_LOG');
  };

  refreshAsyncLoadControl = () => {
    const { tempFormData } = this.state;
    tempFormData.forEach(c => {
      if (_.isFunction(this.refreshEvents[c.controlId])) {
        this.refreshEvents[c.controlId]({ noLoading: true });
      }
    });
  };

  handleUnMask = () => {
    this.setState({ forceShowFullValue: true });
  };

  getRecordApi = () => {
    const { appId, viewId, worksheetId, recordId } = this.state;
    return new RecordApi({ appId, worksheetId, viewId, recordId });
  };

  render() {
    const {
      allowEdit,
      allowAdd,
      isOpenNewAddedRecord,
      renderHeader,
      renderAbnormal,
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
      showPrevNext,
      handleAddSheetRow,
      updateWorksheetControls = () => {},
      rowStatus,
      hideEditingBar,
      workflowStatus,
      hideFormHeader,
      customBtnTriggerCb = () => {},
    } = this.props;
    const {
      loading,
      sheetSwitchPermit,
      submitLoading,
      sideWidth,
      dragLeft,
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
      payConfig,
      isSettingTempData,
      discussCount,
      formSectionWidth,
    } = this.state;
    let { isCharge } = this.props;
    if (_.isUndefined(isCharge) && appId) {
      isCharge = window[`app_${appId}_is_charge`];
    }
    const isLock = checkRuleLocked(recordinfo.rules, recordinfo.formData, recordId);
    let { width } = this.props;
    if (width > 1600) {
      width = 1600;
    }
    const isSmall = window.innerWidth < 360 + 40;
    const isWorkflow = from === RECORD_INFO_FROM.WORKFLOW;
    const titleControl = _.find(tempFormData, control => control.attribute === 1) || {};
    const showFullValue = _.isNull(forceShowFullValue)
      ? _.get(titleControl, 'advancedSetting.datamask') !== '1'
      : forceShowFullValue;
    const recordTitle =
      this.props.recordTitle ||
      getTitleTextFromControls(tempFormData, undefined, undefined, {
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
      roleType: recordinfo.roleType,
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

    const formWidth = width - (sideVisible ? sideWidth : 0) - formSectionWidth;

    return (
      <Con {...(useWaterMark ? { projectId: recordinfo.projectId } : {})}>
        <RecordInfoContext.Provider
          value={{
            api: this.getRecordApi,
            updateWorksheetControls: newControls => {
              newControls.forEach(control => {
                try {
                  if (control.type === 34) {
                    this.recordform.current.dataFormat.data.filter(
                      item => item.controlId === control.controlId,
                    )[0].advancedSetting.widths = control.advancedSetting.widths;
                  }
                } catch (err) {
                  console.error(err);
                }
              });
              updateWorksheetControls(newControls);
            },
            recordBaseInfo: recordbase,
          }}
        >
          {this.renderDialogs()}
          {(from !== RECORD_INFO_FROM.WORKFLOW || viewId) && rowStatus !== 21 && !hideEditingBar && (
            <EditingBar
              okDisabled={!iseditting}
              loading={submitLoading}
              style={{ left: formSectionWidth, width: width - formSectionWidth - (sideVisible ? sideWidth : 0) }}
              visible={iseditting}
              defaultTop={-50}
              visibleTop={8}
              title={_l('正在修改表单数据 ···')}
              saveShortCut
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
              style={{ left: formSectionWidth, width: width - formSectionWidth - (sideVisible ? sideWidth : 0) }}
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
            data-view-id={viewId}
            ref={con => (this.con = con)}
            // onClick={e => e.stopPropagation()}
          >
            {!(abnormal && !isWorkflow) &&
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
                  payConfig={payConfig}
                  approved={approved}
                  loading={loading}
                  view={view}
                  viewId={viewId}
                  renderHeader={
                    from === 21 && !_.isEmpty(childTableControlIds) && !canSubmitDraft
                      ? () => <div className="flex"></div>
                      : renderHeader
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
                  reloadRecord={() => this.handleRefresh({ doNotResetPageIndex: true, reloadDiscuss: false })}
                  onSideIconClick={() => {
                    safeLocalStorageSetItem(
                      from !== RECORD_INFO_FROM.WORKFLOW ? 'recordInfoSideVisible' : 'recordInfoOfWorkflowSideVisible',
                      sideVisible ? '' : 'true',
                    );
                    this.setState({ sideVisible: !sideVisible, hideRight: sideVisible });
                  }}
                  onCancel={this.handleCancel}
                  onUpdate={(changedValue, record) => {
                    updateRows([recordId], _.omit(record, ['allowedit', 'allowdelete']), changedValue);
                    let newValue = { ...changedValue };
                    if (_.filter(recordinfo.formData, c => c.type === 34 && changedValue[c.controlId]).length) {
                      newValue = _.omit(record, ['allowedit', 'allowdelete']);
                    }
                    const newFormData = recordinfo.formData.map(c =>
                      _.assign({}, c, {
                        value: !_.isUndefined(newValue[c.controlId]) ? newValue[c.controlId] : c.value,
                      }),
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
                  customBtnTriggerCb={customBtnTriggerCb}
                  updateDiscussCount={count => {
                    this.setState({
                      discussCount: count,
                    });
                  }}
                />
              )}
            <div className="recordBody flex flexRow">
              {submitLoading && <LoadMask />}
              {dragMaskVisible && (
                <DragMask
                  style={
                    formSectionWidth
                      ? {
                          left: formSectionWidth,
                          right: 0,
                          width: 'auto',
                        }
                      : {}
                  }
                  value={dragLeft ? dragLeft - formSectionWidth : 0}
                  min={450}
                  max={width - formSectionWidth - SIDE_MIN_WIDTH}
                  onChange={value => {
                    safeLocalStorageSetItem('RECORD_INFO_SIDE_WIDTH', width - value - formSectionWidth);
                    this.setState({ dragMaskVisible: false, sideWidth: width - value - formSectionWidth });
                  }}
                />
              )}
              <RecordForm
                payConfig={payConfig}
                updatePayConfig={async () => {
                  const payConfig = await this.getPayConfig(
                    recordinfo.projectId,
                    worksheetId,
                    recordinfo.appId,
                    recordId,
                    viewId,
                  );
                  this.setState({
                    payConfig,
                    formFlag: Math.random().toString(),
                  });
                }}
                ignoreHeader={from === RECORD_INFO_FROM.WORKFLOW && renderHeader && viewId}
                hideFormHeader={hideFormHeader}
                ignoreLock={from === RECORD_INFO_FROM.WORKFLOW || from === RECORD_INFO_FROM.DRAFT}
                from={from}
                isLock={isLock}
                formWidth={formWidth}
                loading={loading || isSettingTempData}
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
                  refreshRecord: () => this.handleRefresh({ reloadDiscuss: false }),
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
                updateRelateRecordTableCount={(controlId, num, { changed } = {}) => {
                  if (!get(this, 'recordform.current')) {
                    return;
                  }
                  updateRows([recordId], { [controlId]: String(num) }, { [controlId]: String(num) });
                  const tempFormData = this.state.tempFormData;
                  const needUpdateControl = _.find(tempFormData, { controlId });
                  if (typeof num === 'number' && num >= 0 && _.get(this, 'recordform.current.dataFormat')) {
                    this.recordform.current.dataFormat.setControlItemValue(controlId, String(num));
                    this.recordform.current.updateRenderData({ noRule: true });
                    this.setState({
                      tempFormData: tempFormData.map(item =>
                        item.controlId === controlId ? { ...item, value: String(num) } : item,
                      ),
                    });
                    if (changed && _.isFunction(this.refreshEvents.loadcustombtns)) {
                      this.refreshEvents.loadcustombtns();
                    }
                  }
                  if (!changed) {
                    return;
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
                renderAbnormal={renderAbnormal}
                loadDraftChildTableData={controlId => {
                  this.setState({ loadedChildIds: (this.state.loadedChildIds || []).concat(controlId) }, () => {
                    if (childTableControlIds.every(v => _.includes(this.state.loadedChildIds, v))) {
                      this.setState({ canSubmitDraft: true });
                    }
                  });
                }}
                onRefresh={this.handleRefresh}
                onUpdateFormSectionWidth={sectionWidth => {
                  this.setState({ formSectionWidth: sectionWidth });
                }}
              />
              {sideVisible && (
                <Drag
                  ref={drag => (this.drag = drag)}
                  onMouseDown={() => {
                    let newDragLeft = formWidth;
                    try {
                      newDragLeft =
                        this.drag.getBoundingClientRect().left -
                        this.drag.parentElement.getBoundingClientRect().left -
                        1;
                    } catch (e) {}
                    this.setState({
                      dragMaskVisible: true,
                      dragLeft: newDragLeft,
                    });
                  }}
                />
              )}
              {!abnormal && (sideVisible || typeof hideRight !== 'undefined') && (
                <RecordInfoRight
                  workflowStatus={
                    workflowStatus ||
                    _.get(
                      _.find(tempFormData, c => c.controlId === 'wfstatus'),
                      'value',
                    )
                  }
                  discussCount={discussCount}
                  loading={loading}
                  isOpenNewAddedRecord={isOpenNewAddedRecord}
                  allowExAccountDiscuss={allowExAccountDiscuss}
                  exAccountDiscussEnum={exAccountDiscussEnum}
                  payConfig={payConfig}
                  approved={approved}
                  className={cx({ hide: hideRight })}
                  style={{ width: sideWidth }}
                  recordbase={recordbase}
                  workflow={workflow ? React.cloneElement(workflow, { controls: recordinfo.formData }) : null}
                  approval={
                    <SheetWorkflow
                      projectId={this.props.projectId || recordinfo.projectId}
                      worksheetId={worksheetId}
                      recordId={recordId}
                      isCharge={recordinfo.roleType === 2}
                      refreshBtnNeedLoading={refreshBtnNeedLoading}
                      formWidth={formWidth}
                      appId={appId}
                      controls={recordinfo.formData}
                      reloadRecord={() => this.handleRefresh({ doNotResetPageIndex: true, reloadDiscuss: false })}
                    />
                  }
                  sheetSwitchPermit={sheetSwitchPermit}
                  projectId={this.props.projectId || recordinfo.projectId}
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
