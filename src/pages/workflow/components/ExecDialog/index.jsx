import React, { Component } from 'react';
import { string, func, bool } from 'prop-types';
import autoSize from 'ming-ui/decorators/autoSize';
import ScrollView from 'ming-ui/components/ScrollView';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import instanceVersion from '../../api/instanceVersion';
import { STATUS_ERROR_MESSAGE } from './config';
import './index.less';
import Header from './Header';
import Steps from './Steps';
import worksheetAjax from 'src/api/worksheet';
import _ from 'lodash';
import StepHeader from './StepHeader';

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
    loading: true,
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
        this.setState({ errorMsg: STATUS_ERROR_MESSAGE[status] });
      } else {
        this.setState({
          data: Object.assign({}, rest, { status }),
          currentWork,
          currentWorkItem,
          works,
          projectId: companyId,
        });

        if ((currentWorkItem || {}).operationTime) {
          onSave();
        }
      }
    });
  };
  getPermit = () => {
    const { id, workId, onError } = this.props;

    worksheetAjax
      .getWorkItem({
        instanceId: id,
        workId: workId,
      })
      .then(res => {
        worksheetAjax.getSwitchPermit({ worksheetId: res.worksheetId }).then(sheetSwitchPermit => {
          this.setState({
            sheetSwitchPermit,
            viewId: res.viewId,
            worksheetId: res.worksheetId,
            rowId: res.rowId,
            loading: false,
          });
        });
      })
      .fail(res => {
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
      loading,
    } = this.state;
    if (loading) return null;
    const RecordInfoWrapperComp = isLand ? autoSize(RecordInfoWrapper) : RecordInfoWrapper;
    return (
      <RecordInfoWrapperComp
        notDialog={isLand}
        from={_.get(currentWork, 'flowNode.type') === 5 ? 3 : 4}
        sheetSwitchPermit={sheetSwitchPermit}
        viewId={viewId}
        recordId={rowId}
        worksheetId={worksheetId}
        header={
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
            {...this.props}
          />
        }
        workflow={
          <div className="flexColumn h100">
            <StepHeader
              processId={data.processId}
              instanceId={id}
              processName={data.processName}
              isApproval={data.isApproval}
            />
            <ScrollView className="flex">
              <ul className="pAll20 pTop0">
                <Steps
                  currentWork={currentWork}
                  rowId={rowId}
                  currentType={(currentWorkItem || {}).type}
                  worksheetId={worksheetId}
                  works={works}
                  status={data.status}
                />
              </ul>
            </ScrollView>
          </div>
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
