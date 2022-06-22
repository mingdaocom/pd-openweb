import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getRequest } from 'src/util';
import { Icon, WaterMark, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import DocumentTitle from 'react-document-title';
import { Flex, ActivityIndicator, WingBlank, Button, Tabs, Modal } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import RelationList from 'mobile/RelationRow/RelationList';
import RelationAction from 'mobile/RelationRow/RelationAction';
import * as actions from 'mobile/RelationRow/redux/actions';
import * as reacordActions from '../RecordList/redux/actions';
import RecordAction from './RecordAction';
import CustomFields from 'src/components/newCustomFields';
import { updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import { formatControlToServer, controlState } from 'src/components/newCustomFields/tools/utils';
import Back from '../components/Back';
import { isRelateRecordTableControl } from 'worksheet/util';
import { renderCellText } from 'worksheet/components/CellControls';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import ChatCount from '../components/ChatCount';
import './index.less';
import { getDiscussConfig } from 'src/api/externalPortal';

const formatParams = params => {
  const { appId, viewId } = params;
  return {
    ...params,
    appId: ['null', 'undefined'].includes(appId) ? '' : appId,
    viewId: ['null', 'undefined'].includes(viewId) ? '' : viewId,
  };
};

class Record extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sheetRow: {},
      rules: [],
      isWorksheetQuery: false,
      loading: true,
      customBtns: [],
      recordActionVisible: false,
      isEdit: false,
      random: '',
      abnormal: null,
      originalData: null,
      currentTab: {},
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
    };
  }
  componentDidMount() {
    this.loadRow();
    this.loadCustomBtns();
    this.getSwitchPermit();
    this.getPortalDiscussSet();
  }
  customwidget = React.createRef();
  recordRef = React.createRef();
  getBaseIds = () => {
    const { ids, match } = this.props;
    return formatParams(ids || match.params);
  }
  loadRow = (props) => {
    const baseIds = this.getBaseIds();
    const getRowByIdRequest = worksheetAjax.getRowByID({
      ...baseIds,
      getType: 1,
      checkView: true,
      appId: null,
    });
    const getWorksheetInfoRequest = worksheetAjax.getWorksheetInfo({
      getRules: true,
      getViews: true,
      worksheetId: baseIds.worksheetId,
    });
    Promise.all([getRowByIdRequest, getWorksheetInfoRequest]).then(data => {
      const [rowResult, worksheetInfoResult] = data;
      const { receiveControls, view } = rowResult;
      this.formData = receiveControls;
      const newReceiveControls = receiveControls.filter(
        item => item.type !== 21 && !_.includes(view ? view.controls : [], item.controlId),
      );
      this.setState({
        random: Date.now(),
        sheetRow: rowResult,
        originalData: rowResult.receiveControls,
        loading: false,
        abnormal: !_.isUndefined(rowResult.resultCode) && rowResult.resultCode !== 1,
        rules: worksheetInfoResult.rules,
        isWorksheetQuery: worksheetInfoResult.isWorksheetQuery 
      });
    });
  }
  loadCustomBtns = () => {
    const baseIds = this.getBaseIds();
    worksheetAjax.getWorksheetBtns(baseIds).then(data => {
      this.setState({
        customBtns: data,
      });
    });
  };
  getSwitchPermit() {
    const baseIds = this.getBaseIds();
    const { appId, worksheetId } = baseIds;
    worksheetAjax
      .getSwitchPermit({
        appId: appId,
        worksheetId: worksheetId,
      })
      .then(res => {
        this.setState({
          switchPermit: res,
        });
      });
  }
  handleSave = () => {
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  }
  onSave = (error, { data, updateControlIds }) => {
    if (error) {
      this.setState({ submitLoading: false });
      return;
    }
    const baseIds = this.getBaseIds();
    const { sheetRow, originalData } = this.state;
    const cells = data
      .filter(item => updateControlIds.indexOf(item.controlId) > -1 && item.type !== 30)
      .map(formatControlToServer);

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
    if (tabsEl && (tabsEl.offsetTop - (isModal ? 55 : 0)) <= scrollTop) {
      fixedTabsEl && fixedTabsEl.classList.remove('hide');
    } else {
      fixedTabsEl && fixedTabsEl.classList.add('hide');
    }
  };
  renderRecordAction() {
    const baseIds = this.getBaseIds();
    const { sheetRow, customBtns, switchPermit } = this.state;

    return (
      <RecordAction
        {...baseIds}
        sheetRow={sheetRow}
        customBtns={customBtns}
        switchPermit={switchPermit}
        loadRow={this.loadRow}
        loadCustomBtns={this.loadCustomBtns}
        recordActionVisible={this.state.recordActionVisible}
        hideRecordActionVisible={() => {
          this.setState({ recordActionVisible: false });
        }}
        ref={this.recordRef}
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
  renderRecordBtns() {
    const { isSubList, editable } = this.props;
    const { isEdit, sheetRow, customBtns } = this.state;
    const allowEdit = sheetRow.allowEdit || editable;
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
                    const { sheetRow, originalData } = this.state;
                    this.setState({
                      isEdit: false,
                      random: Date.now(),
                      sheetRow: {
                        ...sheetRow,
                        receiveControls: originalData,
                      },
                    });
                  }}
                >
                  <span>{_l('取消')}</span>
                </Button>
              </WingBlank>
              <WingBlank className="flex" size="sm">
                <Button className="Font13 bold" type="primary" onClick={this.handleSave}>
                  {_l('保存')}
                </Button>
              </WingBlank>
            </Fragment>
          ) : (
            <Fragment>
              {allowEdit && (
                <WingBlank className="flex mLeft6 mRight6" size="sm">
                  <Button
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
              {showBtnsOut.map(item => {
                let disabled =
                  (this.recordRef.current && this.recordRef.current.state.btnDisable[item.btnId]) || item.disabled;
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
              {(sheetRow.allowDelete || (isSubList && editable)) && customBtns.length < 2 && (
                <WingBlank className="flex mLeft6 mRight6" size="sm">
                  <Button className="Font13 delete letterSpacing" onClick={this.handleDeleteAlert}>
                    <Icon icon="delete2" className="mRight7 Font15" />
                    <span>{_l('删除')}</span>
                  </Button>
                </WingBlank>
              )}
              {customBtns.length >= 2 && (
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
    const { sheetRow, isEdit, random, rules, isWorksheetQuery } = this.state;
    return (
      <div className="flex customFieldsWrapper">
        <CustomFields
          projectId={sheetRow.projectId}
          appId={baseIds.appId || ''}
          ref={this.customwidget}
          from={6}
          flag={random.toString()}
          rules={rules}
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
          onSave={this.onSave}
        />
      </div>
    );
  }
  renderAction() {
    const { currentTab } = this.state;
    if (currentTab.id) {
      return <RelationAction controlId={currentTab.id} />;
    } else {
      return this.renderRecordBtns();
    }
  }
  renderTabs(tabs, isRenderContent = true) {
    const { currentTab } = this.state;
    const index = currentTab.id ? _.findIndex(tabs, { id: currentTab.id }) : 0;
    return (
      <Tabs
        tabBarInactiveTextColor="#9e9e9e"
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
            <span className="tabName ellipsis">{tab.name}</span>
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
      return (
        <div className="flexColumn h100">
          <RelationList
            rowId={baseIds.rowId}
            worksheetId={baseIds.worksheetId}
            appId={baseIds.appId}
            viewId={baseIds.viewId}
            controlId={tab.id}
            control={tab.control}
          />
        </div>
      );
    } else {
      return <div className="flexColumn h100">{this.renderCustomFields()}</div>;
    }
  };
  renderContent() {
    const { sheetRow, isEdit, random, currentTab, rules } = this.state;
    const { relationRow, isModal, onClose } = this.props;
    const titleControl = _.find(this.formData || [], control => control.attribute === 1);
    const defaultTitle = _l('未命名');
    const recordTitle = titleControl ? renderCellText(titleControl) || defaultTitle : defaultTitle;
    const recordMuster = _.sortBy(
      updateRulesData({ rules: rules, data: sheetRow.receiveControls }).filter(
        control => isRelateRecordTableControl(control) && controlState(control, 6).visible,
      ),
      'row',
    );
    const tabs = [
      {
        name: _l('详情'),
        index: 0,
      },
    ].concat(
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
          control: item
        };
      }),
    );

    return (
      <Fragment>
        <DocumentTitle
          title={
            isEdit ? `${_l('编辑')}${sheetRow.entityName}` : recordTitle ? `${recordTitle}` : `${sheetRow.entityName}${_l('详情')}`
          }
        />
        {isModal && (
          <div className="flexRow sheetNameWrap">
            <div className="sheetName">
              {_l('工作表：%0', sheetRow.worksheetName)}
            </div>
            <Icon icon="closeelement-bg-circle" className="Gray_9e Font22" onClick={onClose} />
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
          {recordMuster.length ? (
            <div className={cx('recordViewTabs tabsWrapper flex', { edit: isEdit })}>{this.renderTabs(tabs)}</div>
          ) : (
            <div className="flexColumn flex">{this.renderCustomFields()}</div>
          )}
        </div>
        {!_.isEmpty(recordMuster) && !isEdit && (
          <div className={cx('fixedTabs recordViewTabs Fixed w100 hide', { top: isModal })}>{this.renderTabs(tabs, false)}</div>
        )}
        {this.renderAction()}
      </Fragment>
    );
  }
  getPortalDiscussSet = () => {
    const baseIds = this.getBaseIds();
    const { appId } = baseIds;

    getDiscussConfig({ appId }).then(res => {
      const {
        allowExAccountDiscuss, //允许外部用户讨论
        exAccountDiscussEnum,
      } = res;
      this.setState({
        allowExAccountDiscuss, //允许外部用户讨论
        exAccountDiscussEnum,
      });
    });
  }
  render() {
    const baseIds = this.getBaseIds();
    const { isSubList, editable, isModal } = this.props;
    const {
      submitLoading,
      loading,
      abnormal,
      isEdit,
      switchPermit,
      sheetRow,
      allowExAccountDiscuss,
      exAccountDiscussEnum,
      customBtns
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
        <div className={cx('extraAction', { low: !(sheetRow.allowEdit || editable) && _.isEmpty(customBtns) })}>
          <div className="backContainer">{!isEdit && !isModal && this.renderBack()}</div>
          {((!isPortal && isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId)) || (isPortal && allowExAccountDiscuss)) && ( //外部门户开启讨论的
            <div className="chatMessageContainer">
              {!isEdit && appId && !isSubList && !abnormal && (
                <ChatCount
                  allowExAccountDiscuss={allowExAccountDiscuss}
                  exAccountDiscussEnum={exAccountDiscussEnum}
                  worksheetId={worksheetId}
                  rowId={rowId}
                  appId={appId || ''}
                  autoOpenDiscuss={!isModal && location.search.includes('viewDiscuss')}
                />
              )}
            </div>
          )}
        </div>
      </div>
    )

    if (isModal) {
      return content;
    } else {
      return (
        <WaterMark projectId={sheetRow.projectId}>
          {content}
        </WaterMark>
      );
    }
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, ['loadParams', 'relationRow', 'sheetDiscussions'])
  }),
  dispatch =>
    bindActionCreators(
      { ..._.pick(actions, ['updatePageIndex', 'reset']), ..._.pick(reacordActions, ['updateClickChart']) },
      dispatch,
    ),
)(Record);
