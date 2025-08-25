import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { bool, func, string } from 'prop-types';
import { Icon, ScrollView } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import instance from '../../api/instance';
import instanceVersion from '../../api/instanceVersion';
import worksheetAjax from 'src/api/worksheet';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { getTranslateInfo } from 'src/utils/app';
import { addBehaviorLog } from 'src/utils/project';
import { STATUS_ERROR_MESSAGE } from './config';
import Header from './Header';
import StepHeader from './StepHeader';
import Steps from './Steps';
import './index.less';

const WorkflowHistory = props => {
  return (
    <div className="flexColumn h100">
      <StepHeader
        appId={props.data.app.id}
        processId={props.data.processId}
        instanceId={props.instanceId}
        processName={props.data.processName}
        isApproval={props.data.isApproval}
      />
      <ScrollView className="flex">
        <ul className="pAll16 pTop0">
          <Steps
            projectId={props.projectId}
            appId={props.data.app.id}
            controls={props.controls}
            currentWork={props.currentWork}
            rowId={props.rowId}
            currentType={props.currentWorkItem.type}
            worksheetId={props.worksheetId}
            works={props.works}
            status={props.data.status}
            currents={props.data.currentWorkIds}
          />
        </ul>
      </ScrollView>
    </div>
  );
};

export default class ExecDialog extends Component {
  static propTypes = {
    id: string,
    isLand: bool,
    workId: string,
    onRead: func,
    onSave: func,
    onError: func,
    onClose: func,
  };

  static defaultProps = {
    id: '',
    workId: '',
    onRead: () => {},
    onSave: () => {},
    onError: () => {},
    onClose: () => {},
  };

  state = {
    data: {},
    works: [],
    currentWork: {},
    currentWorkItem: {},
    projectId: '',
    errorMsg: '',
    sheetSwitchPermit: [],
    worksheetId: '',
    rowId: '',
    viewId: '',
    nodeLoading: true,
    worksheetLoading: true,
  };

  componentDidMount() {
    this.getData();
    this.getPermit();
  }

  /**
   * 获取节点的详细数据
   */
  getData = () => {
    let { id, workId, onRead, onSave, onClose } = this.props;

    instanceVersion.get({ id, workId }).then(res => {
      const { status, currentWork, currentWorkItem, works, companyId, ...rest } = res;

      onRead();

      if (_.includes([20001, 30001, 30002, 30003, 30004, 30006, 40007], status)) {
        if (status === 30006) {
          alert(STATUS_ERROR_MESSAGE[status], 2);
          onClose();
          return;
        }
        this.setState({ errorMsg: STATUS_ERROR_MESSAGE[status], nodeLoading: false });
      } else {
        const { app, flowNode } = rest;
        app.name = getTranslateInfo(app.id, null, app.id).name || app.name;
        flowNode.name = getTranslateInfo(app.id, rest.parentId, flowNode.id).nodename || flowNode.name;
        rest.processName = getTranslateInfo(app.id, null, rest.parentId).name || rest.processName;

        this.setState({
          data: Object.assign({}, rest, { status }),
          currentWork,
          currentWorkItem,
          works: works.map(work => {
            const { flowNode, explain, explainMap } = work;
            return {
              ...work,
              explain: explainMap ? explainMap[md.global.Account.lang] || explain : explain,
              flowNode: {
                ...flowNode,
                name: getTranslateInfo(app.id, rest.parentId, flowNode.id).nodename || flowNode.name,
              },
            };
          }),
          projectId: companyId,
          nodeLoading: false,
        });

        if ((currentWorkItem || {}).operationTime) {
          onSave();
        }
      }
    });
  };
  getPermit = () => {
    const { id, workId, onError, onClose } = this.props;

    worksheetAjax
      .getWorkItem({
        instanceId: id,
        workId: workId,
      })
      .then(res => {
        if (!res.worksheetId) {
          onClose();
          return;
        }

        worksheetAjax.getSwitchPermit({ worksheetId: res.worksheetId }).then(sheetSwitchPermit => {
          this.setState({
            sheetSwitchPermit,
            viewId: res.viewId,
            worksheetId: res.worksheetId,
            rowId: res.rowId,
            worksheetLoading: false,
          });
          addBehaviorLog('worksheetRecord', res.worksheetId, { rowId: res.rowId }); // 埋点
        });
      })
      .catch(() => {
        onError();
      });
  };

  /**
   * 处理报错问题
   */
  onError = () => {
    let { id, workId, onError } = this.props;

    instanceVersion.get({ id, workId }).then(() => {
      onError();
    });
  };

  /**
   * 拥有者处理
   */
  ownerHandle = () => {
    const { id, workId, onClose } = this.props;
    const { currentWorkItem } = this.state;
    const { type } = currentWorkItem;

    instance[type === 4 ? 'forward' : 'transfer']({
      id,
      workId,
      forwardAccountId: 'user-workflow',
    }).then(() => {
      onClose();
    });
  };

  render() {
    const { id, workId, isLand, onClose } = this.props;
    const {
      data,
      works,
      currentWork,
      currentWorkItem,
      projectId,
      errorMsg,
      sheetSwitchPermit = [],
      worksheetId,
      viewId,
      rowId,
      nodeLoading,
      worksheetLoading,
    } = this.state;

    if (nodeLoading || worksheetLoading) return null;

    const RecordInfoWrapperComp = isLand ? autoSize(RecordInfoWrapper) : RecordInfoWrapper;

    return (
      <RecordInfoWrapperComp
        notDialog={isLand}
        from={_.get(data, 'flowNode.type') === 5 ? 3 : 4}
        sheetSwitchPermit={sheetSwitchPermit}
        viewId={viewId}
        recordId={rowId}
        worksheetId={worksheetId}
        recordTitle={data.recordTitle ? data.title.replace(/(<([^>]+)>)/gi, '') : ''}
        renderHeader={({ resultCode, isLoading, onRefresh, isRecordLock }) => {
          return (
            <Header
              projectId={projectId}
              data={data}
              works={works}
              currentWorkItem={currentWorkItem}
              errorMsg={errorMsg}
              sheetSwitchPermit={sheetSwitchPermit}
              viewId={viewId}
              rowId={rowId}
              worksheetId={worksheetId}
              noAuth={resultCode === 7 || isRecordLock}
              instanceId={id}
              isLoading={isLoading}
              onRefresh={() => {
                this.getData();
                this.getPermit();
                onRefresh();
              }}
              {...this.props}
            />
          );
        }}
        renderAbnormal={() => {
          return (
            <Fragment>
              <Icon type="info" style={{ color: '#ffa340' }} className="Font48" />
              <div className="Font17 Bold mTop15 Gray">{_l('当前记录无权限，无法查看')}</div>
              {!!data.operationTypeList[0].length && (
                <div className="mTop15 ThemeColor3 ThemeHoverColor2 pointer Font14" onClick={this.ownerHandle}>
                  {_l('转交给流程拥有者处理')}
                </div>
              )}
            </Fragment>
          );
        }}
        workflow={
          <WorkflowHistory
            projectId={projectId}
            data={data}
            works={works}
            currentWorkItem={currentWorkItem || {}}
            currentWork={currentWork}
            rowId={rowId}
            instanceId={id}
            worksheetId={worksheetId}
          />
        }
        instanceId={id}
        workId={workId}
        hideRecordInfo={onClose}
        visible
        onError={this.onError}
      />
    );
  }
}
