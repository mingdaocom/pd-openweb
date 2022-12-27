import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getRequest } from 'src/util';
import { Icon, WaterMark, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import DocumentTitle from 'react-document-title';
import { Flex, ActivityIndicator, WingBlank, Button, Tabs, Modal, ActionSheet, Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import worksheetAjax from 'src/api/worksheet';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import RelationList from 'mobile/RelationRow/RelationList';
import RelationAction from 'mobile/RelationRow/RelationAction';
import * as actions from 'mobile/RelationRow/redux/actions';
import * as reacordActions from '../RecordList/redux/actions';
import RecordAction from './RecordAction';
import CustomFields from 'src/components/newCustomFields';
import SheetWorkflow from 'src/pages/workflow/components/SheetWorkflow';
import { updateRulesData, checkRuleLocked } from 'src/components/newCustomFields/tools/filterFn';
import { formatControlToServer, controlState } from 'src/components/newCustomFields/tools/utils';
import Back from '../components/Back';
import { isRelateRecordTableControl, getSubListError, checkCellIsEmpty } from 'worksheet/util';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import ChatCount from '../components/ChatCount';
import './index.less';
import externalPortalAjax from 'src/api/externalPortal';
import { FORM_HIDDEN_CONTROL_IDS } from 'src/pages/widgetConfig/config/widget';
import _ from 'lodash';

const formatParams = params => {
  const { appId, viewId } = params;
  return {
    ...params,
    appId: ['null', 'undefined'].includes(appId) ? '' : appId,
    viewId: ['null', 'undefined'].includes(viewId) ? '' : viewId,
  };
};

const draftSubmitFilterData = [
  'rowid',
  'ownerid',
  'caid',
  'ctime',
  'utime',
  'uaid',
  'wfname',
  'wfcuaids',
  'wfcaid',
  'wfctime',
  'wfrtime',
  'wfftime',
  'wfstatus',
];

class Record extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sheetRow: {},
      rules: [],
      isWorksheetQuery: false,
      loading: true,
      customBtns: [],
      tempFormData: [],
      recordActionVisible: false,
      isEdit: false,
      random: '',
      abnormal: null,
      originalData: null,
      currentTab: {},
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
      approveCount: 0,
      btnDisable: {},
      advancedSetting: {},
    };
    this.refreshEvents = {};
    this.cellObjs = {};
    this.submitType = '';
  }
  componentDidMount() {
    this.loadRow();
    if (this.props.getDataType !== 21 && !window.share) {
      this.loadCustomBtns();
      this.getPortalDiscussSet();
      this.getApproveTodoList();
    }
  }
  customwidget = React.createRef();
  recordRef = React.createRef();
  getBaseIds = () => {
    const { ids, match } = this.props;
    return formatParams(ids || match.params);
  };
  loadRow = props => {
    const { getDataType } = this.props;
    const baseIds = this.getBaseIds();
    const getRowByIdRequest = worksheetAjax.getRowDetail({
      ...baseIds,
      getType: getDataType ? getDataType : (location.search.includes('share') || window.share) ? 3 : 1,
      checkView: true,
      appId: null,
    });
    const getWorksheetInfoRequest = worksheetAjax.getWorksheetInfo({
      getRules: true,
      getViews: true,
      getTemplate: true,
      worksheetId: baseIds.worksheetId,
      getSwitchPermit: true,
    });
    Promise.all([getRowByIdRequest, getWorksheetInfoRequest]).then(data => {
      const [rowResult, worksheetInfoResult] = data;
      const controls = _.get(worksheetInfoResult, 'template.controls') || [];
      const viewControls = _.get(rowResult, 'view.controls') || [];
      const rowData = safeParse(rowResult.rowData);
      let controlPermissions = safeParse(rowData.controlpermissions);
      let receiveControls = controls.map(c => ({
        ...c,
        controlPermissions: controlPermissions[c.controlId] || c.controlPermissions,
        dataSource: c.dataSource || '',
        value: rowData[c.controlId],
        hidden: _.includes(FORM_HIDDEN_CONTROL_IDS, c.controlId) || viewControls.includes(c.controlId),
      }));
      this.formData = receiveControls;
      rowResult.receiveControls = receiveControls;
      if (window.share) {
        rowResult.allowEdit = false;
        rowResult.allowDelete = false;
      }
      this.setState({
        random: Date.now(),
        sheetRow: rowResult,
        originalData: this.formData,
        loading: false,
        abnormal: !_.isUndefined(rowResult.resultCode) && rowResult.resultCode !== 1,
        rules: worksheetInfoResult.rules,
        isWorksheetQuery: worksheetInfoResult.isWorksheetQuery,
        advancedSetting: worksheetInfoResult.advancedSetting,
        switchPermit: worksheetInfoResult.switches,
      });
    });
  };
  loadCustomBtns = () => {
    const baseIds = this.getBaseIds();
    worksheetAjax.getWorksheetBtns(baseIds).then(data => {
      this.setState({
        customBtns: data,
      });
    });
  };
  getApproveTodoList() {
    const baseIds = this.getBaseIds();
    instanceVersion
      .getTodoCount2({
        startAppId: baseIds.worksheetId,
        startSourceId: baseIds.rowId,
      })
      .then(data => {
        this.setState({ approveCount: data });
      });
  }
  handleSave = () => {
    this.setState({ submitLoading: true, tempFormData: [] });
    this.customwidget.current.submitFormData();
  };

  getDraftParams = data => {
    const { draftFormControls = [] } = this.props;

    const formData = data
      .filter(it => it.controlId !== 'ownerid')
      .filter(item => item.type !== 30 && item.type !== 31 && item.type !== 32)
      .filter(item => !checkCellIsEmpty(item.value));
    const formDataIds = formData.map(it => it.controlId);
    let paramControls = draftFormControls.filter(it => !_.includes(formDataIds, it.controlId)).concat(formData);

    return paramControls.map(it => {
      if (it.type === 42) {
        let val = JSON.parse(JSON.stringify(it.value));
        return !_.isObject(val)
          ? formatControlToServer({
              ...it,
              value: JSON.stringify({
                bucket: 4,
                key: val.match(/pic\/\d+\/[0-9a-zA-Z]+(.png)/g)[0],
              }),
            })
          : formatControlToServer(it);
      }
      if (it.type === 34) {
        return formatControlToServer({
          ...it,
          value: _.isObject(it.value) ? { ...it.value, isAdd: true, updated: [] } : it.value,
        });
      }
      if (it.type === 14) {
        return formatControlToServer(it, { isSubListCopy: true });
      }
      return formatControlToServer(it);
    });
  };
  saveDraftData = ({ draftType }) => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (draftType === 'submit') {
      this.submitType = 'draft';
      this.setState({ submitLoading: true, tempFormData: [] });
      return this.customwidget.current.submitFormData();
    }
    this.setState({ submitLoading: true, tempFormData: [] });
    const { data } = this.customwidget.current.getSubmitData({
      silent: true,
      ignoreAlert: true,
    });
    const baseIds = this.getBaseIds();
    const { appId, viewId, worksheetId, rowId } = baseIds || {};

    worksheetAjax
      .addWorksheetRow({
        projectId: this.state.sheetRow.projectId,
        appId,
        worksheetId,
        viewId,
        draftRowId: rowId,
        rowStatus: draftType === 'submit' ? 11 : 21,
        pushUniqueId: md.global.Config.pushUniqueId,
        receiveControls: this.getDraftParams(data),
      })
      .then(res => {
        if (res.resultCode === 1) {
          alert(draftType === 'submit' ? _l('记录添加成功') : _l('记录保存成功'));
          this.props.onClose();
          this.props.getDraftData({ appId, worksheetId });
        } else {
          alert(draftType === 'submit' ? _l('记录添加失败') : _l('记录保存失败'), 2);
        }
      })
      .fail(err => {
        if (_.isObject(err)) {
          alert(err.errorMessage || _l('记录添加失败'), 2);
        } else {
          alert(err || _l('记录添加失败'), 2);
        }
      });
  };
  handleClose = () => {
    const { sheetRow, originalData } = this.state;
    this.setState({
      isEdit: false,
      random: Date.now(),
      tempFormData: [],
      sheetRow: {
        ...sheetRow,
        receiveControls: originalData,
      },
    });
  };
  handleMoreOperation = ({ allowDelete, allowShare }) => {
    const BUTTONS = [
      allowShare ? { name: _l('分享'), icon: 'share', iconClass: 'Font18 Gray_9e', fn: this.handleShare } : null,
      allowDelete
        ? { name: _l('删除'), icon: 'delete2', iconClass: 'Font22 Red', class: 'Red', fn: this.handleDeleteAlert }
        : null,
    ].filter(_ => _);
    ActionSheet.showActionSheetWithOptions({
      options: BUTTONS.map(item => (
        <div className={cx('flexRow valignWrapper w100', item.class)} onClick={item.fn}>
          <Icon className={cx('mRight10', item.iconClass)} icon={item.icon} />
          <span className="Bold">{item.name}</span>
        </div>
      )),
      message: (
        <div className="flexRow header">
          <span className="Font13">{_l('更多操作')}</span>
          <div className="closeIcon" onClick={() => ActionSheet.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
    });
  };
  handleShare = () => {
    const BUTTONS = [
      {
        name: _l('内部成员访问'),
        info: _l('仅限内部成员登录系统后根据权限访问'),
        icon: 'share',
        iconClass: 'Font18 Gray_9e',
        fn: this.getRecordUrl,
        className: 'mBottom10',
      },
      {
        name: _l('对外公开分享'),
        info: _l('获得链接的所有人都可以查看'),
        icon: 'delete2',
        iconClass: 'Font22 Red',
        fn: this.getWorksheetShareUrl,
      },
    ];
    ActionSheet.showActionSheetWithOptions({
      options: BUTTONS.map(item => (
        <div className={cx('flexRow valignWrapper w100', item.className)} onClick={item.fn}>
          <div className="flex flexColumn" style={{ lineHeight: '22px' }}>
            <span className="Bold">{item.name}</span>
            <span className="Font12 Gray_75">{item.info}</span>
          </div>
          <Icon className="Font18 Gray_9e" icon="arrow-right-border" />
        </div>
      )),
      message: (
        <div className="flexRow header">
          <span className="Font13">{_l('分享')}</span>
          <div className="closeIcon" onClick={() => ActionSheet.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
    });
  };
  getRecordUrl = () => {
    const baseIds = this.getBaseIds();
    const { appId, worksheetId, rowId, viewId } = baseIds;
    const shareUrl = `${location.origin}/mobile/record/${appId}/${worksheetId}/${viewId}/${rowId}`;
    if (navigator.share) {
      navigator
        .share({
          title: _l('系统'),
          text: document.title,
          url: shareUrl,
        })
        .then(() => {
          Toast.info(_l('分享成功'));
        });
    } else {
      copy(shareUrl);
      Toast.info(_l('复制成功'));
    }
  };
  getWorksheetShareUrl = () => {
    const baseIds = this.getBaseIds();
    const { appId, worksheetId, rowId, viewId } = baseIds;
    Toast.loading();
    worksheetAjax
      .getWorksheetShareUrl({
        appId,
        worksheetId,
        rowId,
        viewId,
        objectType: 2,
      })
      .then(shareUrl => {
        Toast.hide();
        if (navigator.share) {
          navigator
            .share({
              title: _l('系统'),
              text: document.title,
              url: shareUrl,
            })
            .then(() => {
              Toast.info(_l('分享成功'));
            });
        } else {
          copy(shareUrl);
          Toast.info(_l('复制成功'));
        }
      });
  };
  onSave = (error, { data, updateControlIds }) => {
    let hasError = false;
    const baseIds = this.getBaseIds();
    const { sheetRow, originalData } = this.state;

    const cells =
      this.submitType === 'draft'
        ? this.getDraftParams(data)
        : data
            .filter(item => updateControlIds.indexOf(item.controlId) > -1 && item.type !== 30)
            .map(formatControlToServer);

    const { cellObjs } = this;
    const subListControls = data.filter(item => item.type === 34).filter(c => controlState(c).editable);
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
              rules: _.get(cellObjs || {}, `${control.controlId}.cell.props.rules`),
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

    if (error || hasError) {
      this.setState({ submitLoading: false });
      return;
    }

    if (_.isEmpty(cells)) {
      this.setState({
        isEdit: false,
        submitLoading: false,
        random: Date.now(),
        sheetRow: {
          ...sheetRow,
          receiveControls: originalData,
        },
      });
      return;
    }

    if (this.submitType === 'draft') {
      worksheetAjax
        .addWorksheetRow({
          projectId: this.state.sheetRow.projectId,
          appId: baseIds.appId,
          worksheetId: baseIds.worksheetId,
          viewId: baseIds.viewId,
          draftRowId: baseIds.rowId,
          rowStatus: 11,
          pushUniqueId: md.global.Config.pushUniqueId,
          receiveControls: cells,
        })
        .then(res => {
          if (res.resultCode === 1) {
            alert(_l('记录添加成功'));
            this.props.onClose();
          } else if (res.resultCode === 11 && res.badData && !_.isEmpty(res.badData)) {
            let checkControl = _.find(cells, v => _.includes(res.badData, v.controlId)) || {};
            alert(`${_l('%0不允许重复', checkControl.controlName)}`, 3);
            this.setState({ submitLoading: false });
          } else {
            alert(_l('记录添加失败'));
            this.setState({ submitLoading: false });
          }
        })
        .fail(err => {
          if (_.isObject(err)) {
            alert(err.errorMessage || _l('记录添加失败'), 2);
          } else {
            alert(err || _l('记录添加失败'), 2);
          }
        });
      return;
    }

    worksheetAjax
      .updateWorksheetRow({
        ...baseIds,
        newOldControl: cells,
      })
      .then(result => {
        this.setState({ submitLoading: false });
        if (result && result.data) {
          alert(_l('保存成功'));
          this.formData = this.formData.map(c => _.assign({}, c, { value: result.data[c.controlId] }));
          this.setState({
            isEdit: false,
            random: Date.now(),
            sheetRow: Object.assign(sheetRow, { receiveControls: this.formData }),
            originalData: this.formData,
          });
          this.loadRow();
          this.loadCustomBtns();
          this.refreshSubList(data, updateControlIds);
        } else {
          if (result.resultCode === 11) {
            if (this.customwidget.current && _.isFunction(this.customwidget.current.uniqueErrorUpdate)) {
              this.customwidget.current.uniqueErrorUpdate(result.badData);
            }
          } else {
            alert(_l('保存失败，请稍后重试'));
          }
        }
      })
      .fail(error => {
        alert(_l('保存失败，请稍后重试'));
      });
  };
  refreshSubList = (tempFormData, updateControlIds) => {
    tempFormData
      .filter(c => _.find(updateControlIds, id => c.controlId === id) && c.type === 34)
      .forEach(c => {
        if (_.isFunction(this.refreshEvents[c.controlId])) {
          this.refreshEvents[c.controlId](null, { noLoading: true });
        }
      });
  };
  handleScroll = event => {
    const { rowId } = this.getBaseIds();
    const { isModal, loadParams, updatePageIndex } = this.props;
    const { isEdit, currentTab } = this.state;
    const { clientHeight, scrollHeight, scrollTop, className } = event.target;
    const targetVlaue = scrollHeight - clientHeight - 30;
    const { loading, isMore, pageIndex } = loadParams;
    if (isEdit || !className.includes('recordScroll')) {
      return;
    }
    if (targetVlaue <= scrollTop && currentTab.value && !loading && isMore) {
      updatePageIndex(pageIndex + 1);
    }
    const wrapEl = document.querySelector(`.mobileSheetRowRecord-${rowId}`);
    const tabsEl = wrapEl.querySelector('.tabsWrapper');
    const fixedTabsEl = wrapEl.querySelector('.fixedTabs');
    if (tabsEl && tabsEl.offsetTop - (isModal ? 55 : 0) <= scrollTop) {
      fixedTabsEl && fixedTabsEl.classList.remove('hide');
    } else {
      fixedTabsEl && fixedTabsEl.classList.add('hide');
    }
  };

  renderRecordAction() {
    const baseIds = this.getBaseIds();
    const { sheetRow, customBtns, switchPermit, random } = this.state;

    return (
      <RecordAction
        {...baseIds}
        sheetRow={sheetRow}
        customBtns={customBtns}
        switchPermit={switchPermit}
        loadRow={this.loadRow}
        loadCustomBtns={this.loadCustomBtns}
        recordActionVisible={this.state.recordActionVisible}
        onShare={this.handleShare}
        hideRecordActionVisible={() => {
          this.setState({ recordActionVisible: false });
        }}
        ref={this.recordRef}
        updateBtnDisabled={this.updateBtnDisabled}
      />
    );
  }
  renderBack() {
    const baseIds = this.getBaseIds();
    const { appId, viewId } = baseIds;
    return (
      <Back
        style={appId ? { position: 'unset' } : {}}
        onClick={() => {
          const { sheetRow } = this.state;
          window.mobileNavigateTo(`/mobile/recordList/${appId}/${sheetRow.groupId}/${baseIds.worksheetId}/${viewId}`);
        }}
      />
    );
  }
  renderWithoutJurisdiction() {
    const { resultCode, entityName } = this.state.sheetRow;
    return (
      <Fragment>
        <div className="flexColumn h100 valignWrapper justifyContentCenter">
          <span className="Icon icon icon-task-folder-message Font56 Gray_df" />
          <p className="mTop10">
            {resultCode === 7
              ? _l('无权限查看%0', entityName || _l('记录'))
              : _l('%0已被删除或分享已关闭', entityName || _l('记录'))}
          </p>
        </div>
      </Fragment>
    );
  }
  handleDelete = () => {
    const baseIds = this.getBaseIds();
    const { appId, worksheetId, viewId, rowId } = baseIds;
    worksheetAjax
      .deleteWorksheetRows({
        worksheetId,
        viewId,
        appId,
        rowIds: [rowId],
      })
      .then(({ isSuccess }) => {
        if (isSuccess) {
          alert(_l('删除成功'));
          history.back();
        } else {
          alert(_l('删除失败'));
        }
      });
  };
  handleDeleteAlert = () => {
    const { isSubList } = this.props;
    Modal.alert(isSubList ? _l('是否删除子表记录 ?') : _l('是否删除此条记录 ?'), '', [
      { text: _l('取消'), style: 'default', onPress: () => {} },
      { text: _l('确定'), style: { color: 'red' }, onPress: this.handleDelete },
    ]);
  };

  updateBtnDisabled = val => {
    this.setState({ btnDisable: val });
  };

  renderRecordBtns() {
    const { isSubList, editable, getDataType } = this.props;
    const { isEdit, sheetRow, customBtns, advancedSetting, rules, switchPermit } = this.state;
    const baseIds = this.getBaseIds();
    const allowEdit = sheetRow.allowEdit || editable;
    const allowDelete = sheetRow.allowDelete || (isSubList && editable);
    const rulesLocked = checkRuleLocked(rules, sheetRow.receiveControls);
    const allowShare =
      isOpenPermit(permitList.recordShareSwitch, switchPermit, baseIds.viewId) && !md.global.Account.isPortal;
    let copyCustomBtns = _.cloneDeep(customBtns);
    let showBtnsOut =
      copyCustomBtns.length && copyCustomBtns.length >= 2
        ? customBtns.slice(0, 2)
        : copyCustomBtns.length
        ? copyCustomBtns
        : [];

    return (
      <div className={cx('btnsWrapper', { hide: !allowEdit && _.isEmpty(customBtns) })}>
        <div className="flexRow">
          {isEdit ? (
            <Fragment>
              <WingBlank className="flex" size="sm">
                <Button
                  className="Font13 bold Gray_75"
                  onClick={() => {
                    if (this.state.tempFormData.length) {
                      Modal.alert(_l('是否保存修改的记录 ?'), '', [
                        { text: _l('放弃'), style: 'default', onPress: this.handleClose },
                        {
                          text: _l('保存'),
                          style: {},
                          onPress: () =>
                            getDataType === 21 ? this.saveDraftData({ draftType: 'draft' }) : this.handleSave,
                        },
                      ]);
                    } else {
                      this.handleClose();
                    }
                  }}
                >
                  <span>{_l('取消')}</span>
                </Button>
              </WingBlank>
              <WingBlank className="flex" size="sm">
                <Button
                  className="Font13 bold"
                  type="primary"
                  onClick={() => {
                    if (getDataType === 21) {
                      return this.saveDraftData({ draftType: 'draft' });
                    }
                    this.handleSave();
                  }}
                >
                  {_l('保存')}
                </Button>
              </WingBlank>
            </Fragment>
          ) : (
            <Fragment>
              {(allowEdit || getDataType === 21) && (
                <WingBlank className="flex mLeft6 mRight6" size="sm">
                  <Button
                    disabled={rulesLocked}
                    className="Font13 edit letterSpacing"
                    onClick={() => {
                      this.setState({ isEdit: true, random: Date.now() });
                    }}
                  >
                    <Icon icon="edit" className="Font15 mRight7" />
                    <span>{_l('编辑')}</span>
                  </Button>
                </WingBlank>
              )}
              {getDataType === 21 && (
                <WingBlank className="flex mLeft6 mRight6" size="sm">
                  <Button
                    className="Font13"
                    type="primary"
                    onClick={() => {
                      this.saveDraftData({ draftType: 'submit' });
                    }}
                  >
                    <span>{advancedSetting.sub || _l('提交')}</span>
                  </Button>
                </WingBlank>
              )}
              {showBtnsOut.map(item => {
                let disabled = (this.recordRef.current && this.state.btnDisable[item.btnId]) || item.disabled;
                return (
                  <WingBlank className="flex flexShink flexRow mLeft6 mRight6" size="sm" key={item.btnId}>
                    <Button
                      className={cx('Font13 flex', { disabled })}
                      style={disabled ? {} : { backgroundColor: item.color, color: '#fff' }}
                      onClick={() => {
                        if (disabled) {
                          return;
                        }
                        if (this.recordRef.current) {
                          this.recordRef.current.handleTriggerCustomBtn(item);
                        }
                      }}
                    >
                      <Icon
                        icon={item.icon || 'custom_actions'}
                        className={cx('Font15 mRight7', { opcIcon: !item.icon && !disabled })}
                      />
                      <span>{item.name}</span>
                    </Button>
                  </WingBlank>
                );
              })}
              {(!getDataType || getDataType !== 21) && (allowDelete || allowShare) && customBtns.length < 2 && (
                <WingBlank className="flex mLeft6 mRight6" size="sm">
                  <Button
                    className="Font13"
                    type="primary"
                    onClick={() => {
                      this.handleMoreOperation({ allowDelete, allowShare });
                    }}
                  >
                    <span>{_l('更多操作')}</span>
                  </Button>
                </WingBlank>
              )}
              {(customBtns.length >= 2 || allowShare || sheetRow.allowDelete) &&
                baseIds.appId &&
                !this.props.isMobileOperate && (
                  <div
                    className="moreOperation"
                    onClick={() => {
                      this.setState({ recordActionVisible: true });
                    }}
                  >
                    <Icon icon="expand_less" className="Font20" />
                  </div>
                )}
            </Fragment>
          )}
        </div>
      </div>
    );
  }
  renderCustomFields() {
    const baseIds = this.getBaseIds();
    const { getDataType, from } = this.props;
    const { sheetRow, isEdit, random, rules, isWorksheetQuery, switchPermit } = this.state;

    return (
      <div className={cx('flex customFieldsWrapper', { edit: isEdit })} ref={con => (this.con = con)}>
        <CustomFields
          projectId={sheetRow.projectId}
          appId={baseIds.appId || ''}
          viewId={baseIds.viewId || ''}
          ref={this.customwidget}
          from={from === 21 ? from : 6}
          flag={random.toString()}
          rules={rules}
          controlProps={{
            addRefreshEvents: (id, fn) => {
              this.refreshEvents[id] = fn;
            },
          }}
          registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
          isWorksheetQuery={isWorksheetQuery}
          disabled={!isEdit}
          recordCreateTime={sheetRow.createTime}
          recordId={baseIds.rowId}
          worksheetId={baseIds.worksheetId}
          showError={false}
          data={sheetRow.receiveControls.filter(item => {
            const result = item.type === 29 && (item.advancedSetting || {}).showtype === '2';
            return isEdit ? !result : item.type !== 43;
          })}
          sheetSwitchPermit={switchPermit}
          onSave={this.onSave}
          onChange={data => {
            this.setState({
              tempFormData: data,
            });
          }}
          verifyAllControls={getDataType === 21}
        />
      </div>
    );
  }
  renderAction() {
    const { currentTab } = this.state;
    if (currentTab.id) {
      return currentTab.id === 'approve' ? undefined : (
        <RelationAction controlId={currentTab.id} getDataType={this.props.getDataType} />
      );
    } else {
      return this.renderRecordBtns();
    }
  }
  renderTabs(tabs, isRenderContent = true) {
    const { currentTab } = this.state;
    const index = currentTab.id ? _.findIndex(tabs, { id: currentTab.id }) : 0;
    return (
      <Tabs
        tabBarInactiveTextColor="#757575"
        prerenderingSiblingsNumber={0}
        destroyInactiveTab={true}
        animated={false}
        swipeable={false}
        tabs={tabs}
        page={index}
        renderTab={tab =>
          tab.value ? (
            <Fragment>
              <span className="tabName ellipsis mRight2">{tab.name}</span>
              <span>{`(${tab.value})`}</span>
            </Fragment>
          ) : (
            <Fragment>
              {tab.id === 'approve' && <i className="approveTabLine" />}
              <span className={cx('tabName ellipsis', { approveTab: tab.id === 'approve' })}>{tab.name}</span>
            </Fragment>
          )
        }
        onChange={tab => {
          this.setState({
            currentTab: tab,
          });
          this.props.reset();
        }}
      >
        {isRenderContent && this.renderTabContent}
      </Tabs>
    );
  }
  renderTabContent = tab => {
    if (tab.id) {
      const baseIds = this.getBaseIds();
      if (tab.id === 'approve') {
        const { roleType, projectId } = this.state.sheetRow;
        return (
          <div className="flexColumn h100" style={{ backgroundColor: '#f8f8f8' }}>
            <SheetWorkflow
              isCharge={roleType === 2}
              projectId={projectId}
              worksheetId={baseIds.worksheetId}
              recordId={baseIds.rowId}
            />
          </div>
        );
      } else {
        return (
          <div className="flexColumn h100">
            <RelationList
              rowId={baseIds.rowId}
              worksheetId={baseIds.worksheetId}
              appId={baseIds.appId}
              viewId={baseIds.viewId}
              controlId={tab.id}
              control={tab.control}
              getType={this.props.getDataType}
            />
          </div>
        );
      }
    } else {
      return <div className="flexColumn h100">{this.renderCustomFields()}</div>;
    }
  };
  renderContent() {
    const baseIds = this.getBaseIds();
    const { sheetRow, isEdit, random, currentTab, rules, approveCount, advancedSetting, switchPermit } = this.state;
    const { relationRow, isModal, onClose, getDataType } = this.props;
    const viewHideControls = _.get(sheetRow, 'view.controls') || [];
    const titleControl = _.find(this.formData || [], control => control.attribute === 1);
    const defaultTitle = _l('未命名');
    const recordTitle = titleControl ? renderCellText(titleControl) || defaultTitle : defaultTitle;
    const allowApprove =
      isOpenPermit(permitList.approveDetailsSwitch, switchPermit, baseIds.viewId) &&
      !window.share &&
      getDataType !== 21;
    const recordMuster = _.sortBy(
      updateRulesData({ rules: rules, data: sheetRow.receiveControls }).filter(
        control =>
          isRelateRecordTableControl(control) &&
          controlState(control, 6).visible &&
          !viewHideControls.includes(control.controlId),
      ),
      'row',
    );
    const tabs = [
      {
        name: _l('详情'),
        index: 0,
      },
    ]
      .concat(
        recordMuster.map((item, index) => {
          const isCurrentTab = currentTab.id === item.controlId;
          const value = Number(item.value);
          const newValue = isCurrentTab ? relationRow.count : value;
          if (isCurrentTab) {
            item.value = newValue;
          }
          return {
            id: item.controlId,
            name: item.controlName,
            value: newValue,
            index: index + 1,
            control: item,
          };
        }),
      )
      .concat(
        allowApprove
          ? {
              name: _l('审批') + (approveCount ? `(${approveCount})` : ''),
              index: 1 + recordMuster.length + 1,
              id: 'approve',
            }
          : undefined,
      )
      .filter(_ => _);

    return (
      <Fragment>
        <DocumentTitle
          title={
            isEdit
              ? `${_l('编辑')}${sheetRow.entityName}`
              : recordTitle
              ? `${recordTitle}`
              : `${sheetRow.entityName}${_l('详情')}`
          }
        />
        {(isModal ? !isEdit : true) && (
          <div className="flexRow sheetNameWrap">
            {getDataType === 21 ? (
              <div className="sheetName ellipsis">{`${advancedSetting.title || '创建记录'}（${_l('草稿')}）`}</div>
            ) : (
              <div className="sheetName ellipsis">{_l('工作表：%0', sheetRow.worksheetName)}</div>
            )}
            {!isEdit && onClose && <Icon icon="closeelement-bg-circle" className="Gray_9e Font22 mLeft5" onClick={onClose} />}
          </div>
        )}
        <div
          className="flexColumn flex recordScroll"
          style={{ overflowX: 'hidden', overflowY: 'auto' }}
          onScroll={this.handleScroll}
        >
          {!isEdit && (
            <div className={cx('header', { pTop10: !isModal })}>
              <div className="title">{recordTitle}</div>
            </div>
          )}
          {recordMuster.length || allowApprove ? (
            <div className={cx('recordViewTabs tabsWrapper flex', { edit: isEdit })}>{this.renderTabs(tabs)}</div>
          ) : (
            <div className="flexColumn flex">{this.renderCustomFields()}</div>
          )}
        </div>
        {(!_.isEmpty(recordMuster) || allowApprove) && !isEdit && (
          <div className={cx('fixedTabs recordViewTabs Fixed w100 hide', { top: isModal })}>
            {this.renderTabs(tabs, false)}
          </div>
        )}
        {!window.share && this.renderAction()}
      </Fragment>
    );
  }
  getPortalDiscussSet = () => {
    const baseIds = this.getBaseIds();
    const { appId } = baseIds;

    externalPortalAjax.getDiscussConfig({ appId }).then(res => {
      const {
        allowExAccountDiscuss, //允许外部用户讨论
        exAccountDiscussEnum,
      } = res;
      this.setState({
        allowExAccountDiscuss, //允许外部用户讨论
        exAccountDiscussEnum,
      });
    });
  };
  render() {
    const baseIds = this.getBaseIds();
    const { currentTab } = this.state;
    const { isSubList, editable, isModal, getDataType } = this.props;
    const {
      submitLoading,
      loading,
      abnormal,
      isEdit,
      switchPermit,
      sheetRow,
      allowExAccountDiscuss,
      exAccountDiscussEnum,
      customBtns,
      originalData,
    } = this.state;
    const { viewId, appId, worksheetId, rowId } = baseIds;

    if (loading) {
      return (
        <div className="flexColumn h100">
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        </div>
      );
    }

    const { isPortal } = md.global.Account;

    const content = (
      <div className={cx('mobileSheetRowRecord flexColumn h100', `mobileSheetRowRecord-${rowId}`)}>
        {submitLoading && (
          <div className="loadingMask">
            <LoadDiv />
          </div>
        )}
        {abnormal ? this.renderWithoutJurisdiction() : this.renderContent()}
        {this.renderRecordAction()}
        <div
          className={cx('extraAction', { low: !(sheetRow.allowEdit || editable) && _.isEmpty(customBtns) })}
          style={{ bottom: currentTab.id == 'approve' ? 13 : undefined }}
        >
          <div className="backContainer">{!isEdit && !isModal && this.renderBack()}</div>
          {(((!getDataType || getDataType !== 21) && !window.share &&
            !isPortal &&
            isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId)) ||
            (isPortal && allowExAccountDiscuss)) && ( //外部门户开启讨论的
            <div className="chatMessageContainer">
              {!isEdit && appId && !isSubList && !abnormal && (
                <ChatCount
                  allowExAccountDiscuss={allowExAccountDiscuss}
                  exAccountDiscussEnum={exAccountDiscussEnum}
                  worksheetId={worksheetId}
                  rowId={rowId}
                  viewId={viewId}
                  appId={appId || ''}
                  autoOpenDiscuss={!isModal && location.search.includes('viewDiscuss')}
                  originalData={originalData}
                  projectId={sheetRow.projectId}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );

    if (isModal) {
      return content;
    } else {
      return <WaterMark projectId={sheetRow.projectId}>{content}</WaterMark>;
    }
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, ['loadParams', 'relationRow', 'sheetDiscussions']),
  }),
  dispatch =>
    bindActionCreators(
      { ..._.pick(actions, ['updatePageIndex', 'reset']), ..._.pick(reacordActions, ['updateClickChart']) },
      dispatch,
    ),
)(Record);
