import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getRequest } from 'src/util';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import DocumentTitle from 'react-document-title';
import { Flex, ActivityIndicator, Modal, List, WingBlank, Button, Tabs } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import RelationList from 'src/pages/Mobile/RelationRow/RelationList';
import RelationAction from 'src/pages/Mobile/RelationRow/RelationAction';
import * as actions from 'src/pages/Mobile/RelationRow/redux/actions';
import RecordAction from './RecordAction';
import CustomFields from 'src/components/newCustomFields';
import { updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import { formatControlToServer, controlState } from 'src/components/newCustomFields/tools/utils';
import Back from '../components/Back';
import AppPermissions from '../components/AppPermissions';
import { isRelateRecordTableControl } from 'worksheet/util';
import { renderCellText } from 'worksheet/components/CellControls';
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
    const { editable } = getRequest();
    this.editable = editable == 'true';
    this.state = {
      sheetRow: {},
      loading: true,
      customBtns: [],
      recordActionVisible: false,
      isEdit: false,
      showError: false,
      random: '',
      abnormal: null,
      originalData: null,
      currentTab: {}
    };
  }
  componentDidMount() {
    this.loadRow();
    this.loadCustomBtns();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.rowId !== this.props.match.params.rowId) {
      this.setState({
        loading: true,
        currentTab: {}
      });
      this.loadRow(nextProps);
      this.loadCustomBtns(nextProps);
    }
  }
  navigateTo = url => {
    if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
      url = url + '#publicapp' + window.publicAppAuthorization;
    }
    this.props.history.push(url);
  }
  customwidget = React.createRef();
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
  }
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
  }
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
  }
  handleScroll = (event) => {
    const { loadParams, updatePageIndex } = this.props;
    const { isEdit, currentTab } = this.state;
    const { clientHeight, scrollHeight, scrollTop } = event.target;
    const targetVlaue = scrollHeight - clientHeight - 30;
    const { loading, isMore, pageIndex } = loadParams;
    if (isEdit) {
      return
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
  }
  renderRecordAction() {
    const { params } = this.props.match;
    const { sheetRow, customBtns } = this.state;

    return (
      <RecordAction
        {...formatParams(params)}
        sheetRow={sheetRow}
        customBtns={customBtns}
        loadRow={this.loadRow}
        loadCustomBtns={this.loadCustomBtns}
        recordActionVisible={this.state.recordActionVisible}
        hideRecordActionVisible={() => {
          this.setState({ recordActionVisible: false });
        }}
      />
    );
  }
  renderBack() {
    const { params } = this.props.match;
    return (
      <Back
        onClick={() => {
          const { sheetRow } = this.state;
          const { appId, viewId } = formatParams(params);
          if (appId && viewId) {
            this.navigateTo(
              `/mobile/recordList/${appId}/${sheetRow.groupId}/${params.worksheetId}/${viewId}`,
            );
          } else {
            history.back();
          }
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
  renderRecordBtns() {
    const { isEdit, sheetRow } = this.state;
    return (
      <div className="btnsWrapper flexRow">
        {isEdit ? (
          <Fragment>
            <WingBlank className="flex" size="sm">
              <Button
                className="Font14 bold Gray_75"
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
              <Button className="Font14 bold" type="primary" onClick={this.handleSave}>
                {_l('保存')}
              </Button>
            </WingBlank>
          </Fragment>
        ) : (
          <Fragment>
            {(sheetRow.allowEdit || this.editable) && (
              <WingBlank className="flex" size="sm">
                <Button
                  className="Font14 edit bold"
                  onClick={() => {
                    this.setState({ isEdit: true, random: Date.now() });
                  }}
                >
                  <Icon icon="workflow_write" className="Font18 mRight5" />
                  <span>{_l('编辑')}</span>
                </Button>
              </WingBlank>
            )}
            <WingBlank className="flex" size="sm">
              <Button
                className="Font14 bold"
                onClick={() => {
                  this.setState({ recordActionVisible: true });
                }}
                type="primary"
              >
                {_l('更多操作')}
              </Button>
            </WingBlank>
          </Fragment>
        )}
      </div>
    );
  }
  renderCustomFields() {
    const { params } = this.props.match;
    const { sheetRow, isEdit, random, showError } = this.state;
    return (
      <div className="flex customFieldsWrapper">
        <CustomFields
          projectId={sheetRow.projectId}
          ref={this.customwidget}
          from={6}
          flag={random.toString()}
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
            this.navigateTo(`/mobile/record/${appId}/${worksheetId}/${viewId}/${rowId}`);
          }}
        />
      </div>
    );
  }
  renderAction() {
    const { currentTab } = this.state;
    if (currentTab.id) {
      return <RelationAction controlId={currentTab.id}/>
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
        renderTab={tab => (
          tab.value ? (
            <Fragment>
              <span className="tabName ellipsis mRight2">{tab.name}</span>
              <span>{`(${tab.value})`}</span>
            </Fragment>
          ) : (
            <span className="tabName ellipsis">{tab.name}</span>
          )
        )}
        onChange={(tab) => {
          this.setState({
            currentTab: tab
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
      return (
        <div className="flexColumn h100">
          <RelationList controlId={tab.id} />
        </div>
      );
    } else {
      return (
        <div className="flexColumn h100">
          {this.renderCustomFields()}
        </div>
      );
    }
  }
  renderContent() {
    const { sheetRow, isEdit, random, currentTab } = this.state;
    const { relationRow } = this.props;
    const titleControl = _.find(this.formData || [], control => control.attribute === 1);
    const defaultTitle = _l('未命名');
    const recordTitle = titleControl ? renderCellText(titleControl) || defaultTitle : defaultTitle;
    const recordMuster = _.sortBy(
      updateRulesData({ rules: sheetRow.rules, data: sheetRow.receiveControls }).filter(
        control => isRelateRecordTableControl(control) && controlState(control, 6).visible,
      ),
      'row',
    );
    const tabs = [{
      name: _l('详情'),
      index: 0,
    }].concat(recordMuster.map((item, index) => {
      const isCurrentTab = currentTab.id === item.controlId;
      const value = Number(item.value);
      const newValue = isCurrentTab ? (relationRow.count || value) : value
      if (isCurrentTab) {
        item.value = newValue;
      }
      return {
        id: item.controlId,
        name: item.controlName,
        value: newValue,
        index: index + 1
      }
    }));
    return (
      <Fragment>
        <DocumentTitle title={isEdit ? `${_l('编辑')}${sheetRow.entityName}` : `${sheetRow.entityName}${_l('详情')}`} />
        <div className="flexColumn flex" style={{ overflow: 'hidden auto' }} onScroll={this.handleScroll}>
          {!isEdit && (
            <div className="header">
              <div className="title">{recordTitle}</div>
            </div>
          )}
          {recordMuster.length ? (
            <div className={cx('recordViewTabs tabsWrapper flex', { edit: isEdit })}>
              {this.renderTabs(tabs)}
            </div>
          ) : (
            <div className="flexColumn flex">
              {this.renderCustomFields()}
            </div>
          )}
        </div>
        {!_.isEmpty(recordMuster) && !isEdit && (
          <div className="fixedTabs recordViewTabs Fixed w100 hide">
            {this.renderTabs(tabs, false)}
          </div>
        )}
        {this.renderAction()}
      </Fragment>
    );
  }
  render() {
    const { loading, abnormal, isEdit } = this.state;
    return (
      <div className="mobileSheetRowRecord flexColumn h100">
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : abnormal ? (
          this.renderWithoutJurisdiction()
        ) : (
          this.renderContent()
        )}
        {this.renderRecordAction()}
        {!isEdit && this.renderBack()}
      </div>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, ['loadParams', 'relationRow'])
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['updatePageIndex', 'reset']),
      dispatch,
  ),
)(Record);

