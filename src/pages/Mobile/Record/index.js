import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getRequest } from 'src/util';
import { Icon, WaterMark } from 'ming-ui';
import cx from 'classnames';
import DocumentTitle from 'react-document-title';
import { Flex, ActivityIndicator, WingBlank, Button, Tabs, Modal } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import RelationList from 'src/pages/Mobile/RelationRow/RelationList';
import RelationAction from 'src/pages/Mobile/RelationRow/RelationAction';
import * as actions from 'src/pages/Mobile/RelationRow/redux/actions';
import * as dicussionActions from 'src/pages/Mobile/Discuss/redux/actions';
import RecordAction from './RecordAction';
import CustomFields from 'src/components/newCustomFields';
import { updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import { formatControlToServer, controlState } from 'src/components/newCustomFields/tools/utils';
import Back from '../components/Back';
import AppPermissions from '../components/AppPermissions';
import { isRelateRecordTableControl } from 'worksheet/util';
import { renderCellText } from 'worksheet/components/CellControls';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import './index.less';

const formatParams = params => {
  const { appId, viewId } = params;
  return {
    ...params,
    appId: ['null', 'undefined'].includes(appId) ? '' : appId,
    viewId: ['null', 'undefined'].includes(viewId) ? '' : viewId,
  };
};

@AppPermissions
class Record extends Component {
  constructor(props) {
    super(props);
    const { isSubList, editable } = getRequest();
    this.editable = editable == 'true';
    this.isSubList = isSubList == 'true';
    this.state = {
      sheetRow: {},
      rules: [],
      isWorksheetQuery: false,
      loading: true,
      customBtns: [],
      recordActionVisible: false,
      isEdit: false,
      showError: false,
      random: '',
      abnormal: null,
      originalData: null,
      currentTab: {},
    };
  }
  componentDidMount() {
    const { params } = this.props.match;
    const { worksheetId, rowId } = formatParams(params);
    this.loadRow();
    this.loadCustomBtns();
    this.props.getMobileDiscussionCount({ worksheetId, rowId });
    this.getSwitchPermit();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.rowId !== this.props.match.params.rowId) {
      const tab = sessionStorage.getItem(`tab-${nextProps.match.params.rowId}`);
      this.setState({
        loading: true,
        currentTab: tab ? JSON.parse(tab) : {},
      });
      this.loadRow(nextProps);
      this.loadCustomBtns(nextProps);
    }
  }
  customwidget = React.createRef();
  recordRef = React.createRef();
  loadRow = (props = this.props) => {
    const { params } = props.match;
    worksheetAjax
      .getRowByID({
        ...formatParams(params),
        getType: 1,
        appId: null,
      })
      .then(result => {
        const { receiveControls, view } = result;
        const isWorkfllow = params.workId;
        this.formData = receiveControls;
        const newReceiveControls = receiveControls.filter(
          item => item.type !== 21 && !_.includes(view ? view.controls : [], item.controlId),
        );
        result.receiveControls = newReceiveControls.map(c =>
          Object.assign({}, c, isWorkfllow ? { fieldPermission: '111' } : {}),
        );
        this.setState({
          random: Date.now(),
          sheetRow: result,
          originalData: result.receiveControls,
          loading: false,
          abnormal: !_.isUndefined(result.resultCode) && result.resultCode !== 1,
        });
      });
    worksheetAjax
      .getWorksheetInfo({
        getRules: true,
        worksheetId: params.worksheetId,
      })
      .then(data => {
        this.setState({ rules: data.rules, isWorksheetQuery: data.isWorksheetQuery });
      });
  };
  loadCustomBtns = (props = this.props) => {
    const { params } = props.match;
    worksheetAjax
      .getWorksheetBtns({
        ...formatParams(params),
      })
      .then(data => {
        this.setState({
          customBtns: data,
        });
      });
  };
  handleSave = () => {
    const { sheetRow } = this.state;
    const { params } = this.props.match;
    const { data, updateControlIds, hasError, hasRuleError } = this.customwidget.current.getSubmitData();
    const cells = data
      .filter(item => updateControlIds.indexOf(item.controlId) > -1 && item.type !== 30)
      .map(formatControlToServer);

    if (hasError) {
      this.setState({ showError: true });
      alert(_l('请正确填写记录'), 3);
      return;
    }

    if (_.isEmpty(cells)) {
      this.setState({ isEdit: false });
      return;
    }

    if (hasRuleError) {
      return;
    }

    this.setState({ showError: false });
    worksheetAjax
      .updateWorksheetRow({
        ...formatParams(params),
        newOldControl: cells,
      })
      .then(result => {
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
    const { loadParams, updatePageIndex } = this.props;
    const { isEdit, currentTab } = this.state;
    const { clientHeight, scrollHeight, scrollTop } = event.target;
    const targetVlaue = scrollHeight - clientHeight - 30;
    const { loading, isMore, pageIndex } = loadParams;
    if (isEdit) {
      return;
    }
    if (targetVlaue <= scrollTop && currentTab.value && !loading && isMore) {
      updatePageIndex(pageIndex + 1);
    }
    const tabsEl = document.querySelector('.tabsWrapper');
    const fixedTabsEl = document.querySelector('.fixedTabs');
    if (tabsEl && tabsEl.offsetTop <= scrollTop) {
      fixedTabsEl && fixedTabsEl.classList.remove('hide');
    } else {
      fixedTabsEl && fixedTabsEl.classList.add('hide');
    }
  };
  renderRecordAction() {
    const { params } = this.props.match;
    const { sheetRow, customBtns, switchPermit } = this.state;

    return (
      <RecordAction
        {...formatParams(params)}
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
    const { params } = this.props.match;
    const { appId, viewId } = formatParams(params);
    return (
      <Back
        style={appId ? { position: 'unset' } : {}}
        onClick={() => {
          const { sheetRow } = this.state;
          if (history.length <= 1) {
            window.mobileNavigateTo(`/mobile/recordList/${appId}/${sheetRow.groupId}/${params.worksheetId}/${viewId}`);
          } else {
            history.back();
          }
        }}
      />
    );
  }
  renderChatMessage = () => {
    const { discussionCount } = this.props;
    return (
      <div
        className="chatMessage Font13"
        onClick={() => {
          if (this.recordRef.current) {
            this.recordRef.current.handleOpenDiscuss();
          }
        }}
      >
        <Icon icon="chat" className="mRight5 TxtMiddle Font20" />
        <span>{discussionCount}</span>
      </div>
    );
  };
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
    const { params } = this.props.match;
    const { appId, worksheetId, viewId, rowId } = formatParams(params);
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
    Modal.alert(this.isSubList ? _l('是否删除子表记录 ?') : _l('是否删除此条记录 ?'), '', [
      { text: _l('取消'), style: 'default', onPress: () => {} },
      { text: _l('确定'), style: { color: 'red' }, onPress: this.handleDelete },
    ]);
  };
  renderRecordBtns() {
    const { isEdit, sheetRow, customBtns } = this.state;
    let copyCustomBtns = _.cloneDeep(customBtns);
    let showBtnsOut =
      copyCustomBtns.length && copyCustomBtns.length >= 2
        ? customBtns.slice(0, 2)
        : copyCustomBtns.length
        ? copyCustomBtns
        : [];
    return (
      <div className="btnsWrapper">
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
              {(sheetRow.allowEdit || this.editable) && (
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
              {(sheetRow.allowDelete || (this.isSubList && this.editable)) && customBtns.length < 2 && (
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
    const { params } = this.props.match;
    const { sheetRow, isEdit, random, showError, rules, isWorksheetQuery } = this.state;
    return (
      <div className="flex customFieldsWrapper">
        <CustomFields
          projectId={sheetRow.projectId}
          ref={this.customwidget}
          from={6}
          flag={random.toString()}
          rules={rules}
          isWorksheetQuery={isWorksheetQuery}
          disabled={!isEdit}
          recordCreateTime={sheetRow.createTime}
          recordId={params.rowId}
          worksheetId={params.worksheetId}
          showError={showError}
          data={sheetRow.receiveControls.filter(item => {
            const result = item.type === 29 && (item.advancedSetting || {}).showtype === '2';
            return isEdit ? !result : item.type !== 43;
          })}
          openRelateSheet={(appId, worksheetId, rowId, viewId) => {
            viewId = viewId || 'null';
            if (isEdit) return;
            window.mobileNavigateTo(`/mobile/record/${appId}/${worksheetId}/${viewId}/${rowId}`);
          }}
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
          const { params } = this.props.match;
          this.setState({
            currentTab: tab,
          });
          sessionStorage.setItem(`tab-${params.rowId}`, JSON.stringify(tab));
          this.props.reset();
        }}
      >
        {isRenderContent && this.renderTabContent}
      </Tabs>
    );
  }
  renderTabContent = tab => {
    if (tab.id) {
      return (
        <div className="flexColumn h100">
          <RelationList controlId={tab.id} />
        </div>
      );
    } else {
      return <div className="flexColumn h100">{this.renderCustomFields()}</div>;
    }
  };
  renderContent() {
    const { sheetRow, isEdit, random, currentTab, rules } = this.state;
    const { relationRow } = this.props;
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
        };
      }),
    );
    return (
      <Fragment>
        <DocumentTitle title={isEdit ? `${_l('编辑')}${sheetRow.entityName}` : `${sheetRow.entityName}${_l('详情')}`} />
        <div
          className="flexColumn flex"
          style={{ overflowX: 'hidden', overflowY: 'auto' }}
          onScroll={this.handleScroll}
        >
          {!isEdit && (
            <div className="header">
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
          <div className="fixedTabs recordViewTabs Fixed w100 hide">{this.renderTabs(tabs, false)}</div>
        )}
        {this.renderAction()}
      </Fragment>
    );
  }
  getSwitchPermit() {
    const { params } = this.props.match;
    const { appId, worksheetId } = formatParams(params);
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
  render() {
    const { params } = this.props.match;
    const { loading, abnormal, isEdit, switchPermit, sheetRow } = this.state;
    const { viewId, appId } = formatParams(params);

    if (loading) {
      return (
        <div className="flexColumn h100">
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        </div>
      );
    }

    return (
      <WaterMark projectId={sheetRow.projectId}>
        <div className="mobileSheetRowRecord flexColumn h100">
          {abnormal ? this.renderWithoutJurisdiction() : this.renderContent()}
          {this.renderRecordAction()}
          <div className="extraAction">
            <div className="backContainer">{!isEdit && this.renderBack()}</div>
            <div className="chatMessageContainer">
              {!isEdit &&
                appId &&
                (!this.isSubList || isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId)) &&
                this.renderChatMessage()}
            </div>
          </div>
        </div>
      </WaterMark>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, ['loadParams', 'relationRow', 'sheetDiscussions', 'discussionCount']),
  }),
  dispatch =>
    bindActionCreators(
      { ..._.pick(actions, ['updatePageIndex', 'reset']), ..._.pick(dicussionActions, ['getMobileDiscussionCount']) },
      dispatch,
    ),
)(Record);
