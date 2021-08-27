import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { getRequest } from 'src/util';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import DocumentTitle from 'react-document-title';
import homeAppAjax from 'src/api/homeApp';
import { Flex, ActivityIndicator, Modal, List, WhiteSpace, WingBlank, Button, Tabs } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import { startProcess } from 'src/pages/workflow/api/process';
import RelationRow from '../RelationRow';
import CustomFields from 'src/components/newCustomFields';
import FillRecordControls from 'src/pages/worksheet/common/recordInfo/FillRecordControls/MobileFillRecordControls';
import NewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { formatControlToServer, controlState } from 'src/components/newCustomFields/tools/utils';
import Back from '../components/Back';
import PermissionsInfo from '../components/PermissionsInfo';
import * as actions from '../RecordList/redux/actions';
import { isRelateRecordTableControl } from 'worksheet/util';
import { renderCellText } from 'worksheet/components/CellControls/index.jsx';
import './index.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

const CUSTOM_BUTTOM_CLICK_TYPE = {
  IMMEDIATELY: 1,
  CONFIRM: 2,
  FILL_RECORD: 3,
};

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
    const { isSubList, editable } = getRequest();
    this.isSubList = isSubList == 'true';
    this.editable = editable == 'true';
    this.state = {
      sheetRow: {},
      loading: true,
      isChange: false,
      customBtns: [],
      actionSheetVisible: false,
      fillRecordVisible: false,
      newRecordVisible: false,
      shareUrl: '',
      isEdit: false,
      random: '',
      appStatus: 1,
      abnormal: null,
      switchPermit: [],
      originalData: null,
      btnDisable: {}
    };
  }
  componentDidMount() {
    const { params } = this.props.match;
    if (['undefined', 'null'].includes(params.appId)) {
      this.loadRow();
      this.loadCustomBtns();
    } else {
      homeAppAjax
        .checkApp(
          {
            appId: params.appId,
          },
          { silent: true },
        )
        .then(status => {
          this.setState({ appStatus: status });
          if (status == 1) {
            this.loadRow();
            this.loadCustomBtns();
          }
        });
    }
    if (!this.isSubList) {
      worksheetAjax
        .getSwitchPermit({
          appId: params.appId,
          worksheetId: params.worksheetId,
        })
        .then(res => {
          this.setState({
            switchPermit: res,
          });
        });
    }
    IM.socket.on('workflow', this.receiveWorkflow);
  }
  componentWillUnmount() {
    IM.socket.off('workflow', this.receiveWorkflow);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.rowId !== this.props.match.params.rowId) {
      this.setState({
        loading: true,
      });
      this.loadRow(nextProps);
      this.loadCustomBtns(nextProps);
    }
  }
  navigateTo(url) {
    if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
      url = url + '#publicapp' + window.publicAppAuthorization;
    }
    this.props.history.push(url);
  }
  customwidget = React.createRef();
  receiveWorkflow = (data) => {
    const { storeId, status } = data;
    if (!storeId && status === 2) {
      this.loadRow();
      this.setState({ btnDisable: {} });
    }
  }
  loadRow(props = this.props) {
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
    if (navigator.share) {
      worksheetAjax
        .getWorksheetShareUrl({
          ...formatParams(params),
          objectType: 2,
        })
        .then(shareUrl => {
          this.setState({
            shareUrl,
          });
        });
    }
  }
  loadCustomBtns(props = this.props) {
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
  disableCustomButton(id) {
    this.setState({
      btnDisable: { ...this.state.btnDisable, [id]: true },
    });
  }
  fillRecordControls = (newControls, targetOptions) => {
    const { params } = this.props.match;
    const { worksheetId, rowId } = params;
    worksheetAjax
      .updateWorksheetRow({
        appId: targetOptions.appId,
        viewId: targetOptions.viewId,
        worksheetId: targetOptions.worksheetId,
        rowId: targetOptions.recordId,
        projectID: targetOptions.projectId,
        newOldControl: newControls,
        btnId: this.activeBtn.btnId,
        btnWorksheetId: worksheetId,
        btnRowId: rowId,
      })
      .then(res => {
        if (res && res.data) {
          alert(_l('操作已执行'), 3);
          if (this.activeBtn.workflowType === 2) {
            this.loadRow();
            this.loadCustomBtns();
          }
          this.setState({
            fillRecordVisible: false,
          });
        } else {
          if (res.resultCode === 11) {
            if (this.customwidget.current && _.isFunction(this.customwidget.current.uniqueErrorUpdate)) {
              this.customwidget.current.uniqueErrorUpdate(res.badData);
            }
          } else {
            alert(_l('操作失败，请稍后重试'), 2);
          }
        }
      });
  }
  async fillRecord(btn) {
    const { sheetRow } = this.state;
    const { worksheetId, rowId } = this.props.match.params;
    const rowInfo = await worksheetAjax.getRowByID({
      worksheetId,
      getType: 1,
      rowId,
    });
    const titleControl = _.find(rowInfo.receiveControls, control => control.attribute === 1);
    const caseStr = btn.writeObject + '' + btn.writeType;
    const relationControl = _.find(rowInfo.receiveControls, c => c.controlId === btn.relationControl);
    const addRelationControl = _.find(rowInfo.receiveControls, c => c.controlId === btn.addRelationControl);
    this.activeBtn = btn;
    this.defaultFormData = {};
    this.fillRecordProps = {};
    switch (caseStr) {
      case '11': // 本记录 - 填写字段
        this.btnRelateWorksheetId = worksheetId;
        this.fillRecordId = rowId;
        this.fillRecordProps = {
          formData: rowInfo.receiveControls,
        };
        this.setState({
          fillRecordVisible: true,
        });
        break;
      case '12': // 本记录 - 新建关联记录
        if (!addRelationControl || !_.isObject(addRelationControl)) {
          Modal.alert(_l('无法执行按钮“%0”', btn.name), _l('关联字段被隐藏或已删除'), [
            { text: _l('确定'), onPress: () => {} },
          ]);
          return;
        }
        try {
          const controldata = JSON.parse(addRelationControl.value);
          if (addRelationControl.enumDefault === 1 && controldata.length) {
            Modal.alert(
              _l('无法执行按钮“%0”', btn.name),
              _l('“%0”已有关联记录，无法重复添加', addRelationControl.controlName),
              [{ text: _l('确定'), onPress: () => {} }],
            );
            return;
          }
        } catch (err) {}
        this.btnAddRelateWorksheetId = addRelationControl.dataSource;
        this.defaultFormData = {
          [addRelationControl.sourceControlId]: JSON.stringify([
            {
              name: titleControl.value,
              sid: rowId,
              sourcevalue: JSON.stringify(_.assign(...this.formData.map(c => ({ [c.controlId]: c.value })))),
            },
          ]),
        };
        this.setState({
          newRecordVisible: true,
        });
        break;
      case '21': // 关联记录 - 填写字段
        if (!relationControl || !_.isObject(relationControl)) {
          return;
        }
        this.btnRelateWorksheetId = relationControl.dataSource;
        try {
          const controldata = JSON.parse(relationControl.value);
          this.fillRecordId = controldata[0].sid;
          this.fillRecordProps = {
            appId: relationControl.appId,
            rowId: this.fillRecordId,
            viewId: relationControl.viewId,
          };
        } catch (err) {
          Modal.alert(
            _l('无法执行按钮“%0”', btn.name),
            _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            [{ text: _l('确定'), onPress: () => {} }],
          );
          return;
        }
        this.setState({
          fillRecordVisible: true,
        });
        break;
      case '22': // 关联记录 - 新建关联记录
        if (!relationControl || !_.isObject(relationControl)) {
          return;
        }
        try {
          const controldata = JSON.parse(relationControl.value);
          this.fillRecordId = controldata[0].sid;
          this.addRelateRecordRelateRecord(relationControl, btn.addRelationControl);
        } catch (err) {
          Modal.alert(
            _l('无法执行按钮“%0”', btn.name),
            _l('“%0”为空，请关联操作后再执行按钮操作', relationControl.controlName),
            [{ text: _l('确定'), onPress: () => {} }],
          );
          return;
        }
        break;
    }
  }
  addRelateRecordRelateRecord(relationControl, relationControlrelationControlId) {
    let controldata;
    try {
      controldata = JSON.parse(relationControl.value);
    } catch (err) {
      return;
    }
    worksheetAjax
      .getRowByID({
        worksheetId: relationControl.dataSource,
        getType: 1,
        appId: relationControl.appId,
        rowId: controldata[0].sid,
        viewId: relationControl.viewId,
      })
      .then(data => {
        const relationControlrelationControl = _.find(
          data.receiveControls,
          c => c.controlId === relationControlrelationControlId,
        );
        if (!relationControlrelationControl) {
          Modal.alert(_l('无法执行按钮“%0”', this.activeBtn.name), _l('关联字段被隐藏或已删除'), [
            { text: _l('确定'), onPress: () => {} },
          ]);
          return;
        }
        try {
          const relationControlrelationControlData = JSON.parse(relationControlrelationControl.value);
          if (relationControlrelationControl.enumDefault === 1 && relationControlrelationControlData.length) {
            Modal.alert(
              _l('无法执行按钮“%0”', this.activeBtn.name),
              _l('“%0”已有关联记录，无法重复添加', relationControlrelationControl.controlName),
              [{ text: _l('确定'), onPress: () => {} }],
            );
            return;
          }
        } catch (err) {}
        this.defaultFormData = {
          [relationControlrelationControl.sourceControlId]: JSON.stringify([
            {
              name: controldata[0].name,
              sid: controldata[0].sid,
              sourcevalue: JSON.stringify(_.assign(...data.receiveControls.map(c => ({ [c.controlId]: c.value })))),
            },
          ]),
        };
        if (relationControlrelationControl) {
          this.btnAddRelateWorksheetId = relationControlrelationControl.dataSource;
          this.setState({
            newRecordVisible: true,
          });
        }
      });
  }
  handleAddRecordCallback = recordItem => {
    if (this.activeBtn.workflowType === 2) {
      alert(_l('操作已执行'), 3);
    }
    this.loadRow();
    this.loadCustomBtns();
  }
  handleOpenDiscuss = () => {
    const { params } = this.props.match;
    this.navigateTo(`/mobile/discuss/${params.appId}/${params.worksheetId}/${params.viewId}/${params.rowId}`);
  }
  handleDeleteAlert = () => {
    Modal.alert(this.isSubList ? _l('是否删除子表记录 ?') : _l('是否删除此条记录 ?'), '', [
      { text: _l('取消'), style: 'default', onPress: () => {} },
      { text: _l('确定'), style: { color: 'red' }, onPress: this.handleDelete },
    ]);
    this.setState({
      actionSheetVisible: false,
    });
  }
  triggerImmediately(btnId) {
    const { params } = this.props.match;
    startProcess({
      appId: params.worksheetId,
      sources: [params.rowId],
      triggerId: btnId,
    }).then(data => {
      alert(_l('操作已执行'), 3);
      this.loadCustomBtns();
      this.disableCustomButton(btnId);
    });
  }
  handleTriggerCustomBtn = btn => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.IMMEDIATELY) {
      // 立即执行
      this.triggerImmediately(btn.btnId);
    } else if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.CONFIRM) {
      // 二次确认
      Modal.alert(_l('你确认对记录执行此操作吗？'), '', [
        { text: _l('取消'), onPress: () => {}, style: 'default' },
        { text: _l('确定'), onPress: () => this.triggerImmediately(btn.btnId) },
      ]);
    } else if (btn.clickType === CUSTOM_BUTTOM_CLICK_TYPE.FILL_RECORD) {
      // 填写字段
      this.fillRecord(btn);
    } else {
      // 无 clickType 有误
    }
    this.setState({
      actionSheetVisible: false,
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

    worksheetAjax
      .updateWorksheetRow({
        ...formatParams(params),
        newOldControl: cells,
      })
      .then(result => {
        if (result && result.data) {
          alert(_l('保存成功'));
          this.props.dispatch(actions.emptySheetRows());
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
  handleDelete = () => {
    const { params } = this.props.match;
    const { rowId } = params;
    worksheetAjax
      .deleteWorksheetRows({
        ...formatParams(params),
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
  }
  handleOpenShare = () => {
    const { shareUrl } = this.state;
    navigator
      .share({
        title: _l('分享'),
        text: document.title,
        url: shareUrl,
      })
      .then(() => {
        alert(_l('分享成功'));
      });
  }
  renderActionSheet() {
    const { params } = this.props.match;
    const { sheetRow, customBtns, switchPermit, btnDisable } = this.state;
    const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
    const { isSubList, editable } = this;
    return (
      <Modal
        popup
        animationType="slide-up"
        className="actionSheetModal"
        visible={this.state.actionSheetVisible}
        onClose={() => {
          this.setState({ actionSheetVisible: false });
        }}
      >
        <List className="mobileActionSheetList">
          <div className="actionHandleList">
            {customBtns.map(item => (
              <List.Item
                className={cx({ disabled: btnDisable[item.btnId] || item.disabled })}
                key={item.btnId}
                onClick={() => {
                  if (btnDisable[item.btnId] || item.disabled) {
                    return;
                  }
                  this.handleTriggerCustomBtn(item);
                }}
              >
                {item.name}
              </List.Item>
            ))}
            {isWxWork || isSubList || !isOpenPermit(permitList.discussSwitch, switchPermit) ? null : (
              <List.Item onClick={this.handleOpenDiscuss}>{_l('查看讨论')}</List.Item>
            )}
            {navigator.share && isOpenPermit(permitList.recordShareSwitch, switchPermit, params.viewId) ? (
              <List.Item onClick={this.handleOpenShare}>{_l('分享')}</List.Item>
            ) : null}
            {sheetRow.allowDelete || (isSubList && editable) ? (
              <List.Item className="delete" onClick={this.handleDeleteAlert}>
                {_l('删除')}
              </List.Item>
            ) : null}
          </div>
          <WhiteSpace size="sm" />
          <List.Item
            onClick={() => {
              this.setState({ actionSheetVisible: false });
            }}
          >
            {_l('取消')}
          </List.Item>
        </List>
      </Modal>
    );
  }
  renderFillRecord() {
    const { activeBtn = {}, fillRecordId, btnRelateWorksheetId, fillRecordProps } = this;
    const { params } = this.props.match;
    const btnTypeStr = activeBtn.writeObject + '' + activeBtn.writeType;
    const { sheetRow } = this.state;
    return (
      <Modal
        popup
        animationType="slide-up"
        className="mobileFillRecordControlsModal"
        visible={this.state.fillRecordVisible}
        onClose={() => {
          this.setState({ fillRecordVisible: false });
        }}
      >
        <FillRecordControls
          title={activeBtn.name}
          loadWorksheetRecord={btnTypeStr === '21'}
          viewId={params.viewId}
          projectId={sheetRow.projectId}
          recordId={fillRecordId}
          worksheetId={btnRelateWorksheetId}
          writeControls={activeBtn.writeControls}
          onSubmit={this.fillRecordControls}
          hideDialog={() => {
            this.setState({
              fillRecordVisible: false,
            });
          }}
          {...fillRecordProps}
        />
      </Modal>
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
        {this.renderBack()}
      </Fragment>
    );
  }
  renderCustomFields() {
    const { params } = this.props.match;
    const { sheetRow, isEdit, random } = this.state;
    return (
      <Fragment>
        <div className="flex" style={{ overflow: 'hidden auto' }}>
          <CustomFields
            projectId={sheetRow.projectId}
            ref={this.customwidget}
            from={6}
            flag={random.toString()}
            disabled={!isEdit}
            recordCreateTime={sheetRow.createTime}
            recordId={params.rowId}
            worksheetId={params.worksheetId}
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
                      isChange: false,
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
                    this.setState({ actionSheetVisible: true });
                  }}
                  type="primary"
                >
                  {_l('更多操作')}
                </Button>
              </WingBlank>
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }
  renderTabContent = tab => {
    if (tab.id) {
      return (
        <div className="flexColumn h100">
          <RelationRow controlId={tab.id} />
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
    const { sheetRow, isChange, isEdit, random } = this.state;
    const titleControl = _.find(this.formData || [], control => control.attribute === 1);
    const defaultTitle = _l('未命名');
    const recordTitle = titleControl ? renderCellText(titleControl) || defaultTitle : defaultTitle;
    const recordMuster = sheetRow.receiveControls.filter(item => isRelateRecordTableControl(item) && controlState(item, 6).visible);
    const tabs = [{
      title: _l('详情'),
      index: 0,
    }].concat(recordMuster.map((item, index) => {
      return {
        id: item.controlId,
        title: item.controlName,
        value: Number(item.value),
        index: index + 1
      }
    }));
    return (
      <Fragment>
        <DocumentTitle title={isEdit ? `${_l('编辑')}${sheetRow.entityName}` : `${sheetRow.entityName}${_l('详情')}`} />
        <div className="flexColumn h100">
          {!isEdit && (
            <div className="header">
              <div className="title">{recordTitle}</div>
            </div>
          )}
          {recordMuster.length ? (
            <div className={cx('recordViewTabs flex', { edit: isEdit })}>
              <Tabs
                tabBarInactiveTextColor="#9e9e9e"
                tabs={tabs}
                renderTab={tab => (
                  tab.value ? (
                    <Fragment>
                      <span className="tabName ellipsis mRight2">{tab.title}</span>
                      <span>{`(${tab.value})`}</span>
                    </Fragment>
                  ) : (
                    <span className="tabName ellipsis">{tab.title}</span>
                  )
                )}
              >
                {this.renderTabContent}
              </Tabs>
            </div>
          ) : (
            <div className="flexColumn flex Height26">
              {this.renderCustomFields()}
            </div>
          )}
        </div>
        {!isEdit && this.renderBack()}
      </Fragment>
    );
  }
  rnederNewRecord() {
    const { activeBtn = {} } = this;
    const { newRecordVisible } = this.state;
    const { params } = this.props.match;
    const { worksheetId, rowId } = params;
    return (
      <NewRecord
        title={activeBtn.name}
        className="worksheetRelateNewRecord"
        worksheetId={this.btnAddRelateWorksheetId}
        addType={2}
        filterRelateSheetIds={worksheetId}
        visible={newRecordVisible}
        defaultFormData={this.defaultFormData}
        customBtn={{
          btnId: activeBtn.btnId,
          btnWorksheetId: worksheetId,
          btnRowId: rowId,
        }}
        hideNewRecord={() => {
          this.setState({ newRecordVisible: false });
        }}
        onAdd={this.handleAddRecordCallback}
      />
    );
  }
  render() {
    const { loading, appStatus, abnormal } = this.state;
    const { params } = this.props.match;
    return (
      <div className="mobileSheetRowRecord h100">
        {loading ? (
          appStatus !== 1 ? (
            <PermissionsInfo status={appStatus} isApp={false} appId={params.appId} />
          ) : (
            <Flex justify="center" align="center" className="h100">
              <ActivityIndicator size="large" />
            </Flex>
          )
        ) : abnormal ? (
          this.renderWithoutJurisdiction()
        ) : (
          this.renderContent()
        )}
        {this.renderActionSheet()}
        {this.renderFillRecord()}
        {this.rnederNewRecord()}
      </div>
    );
  }
}

export default connect(state => {
  return {};
})(Record);
