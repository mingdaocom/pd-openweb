import React, { Component } from 'react';
import { string, func, bool } from 'prop-types';
import autoSize from 'ming-ui/decorators/autoSize';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import instanceVersion from '../../api/instanceVersion';
import { STATUS_ERROR_MESSAGE } from './config';
import './index.less';
import Header from './Header';
import StepItem from './StepItem';

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
  };

  componentDidMount() {
    this.getData();
  }

  /**
   * 获取节点的详细数据
   */
  getData = () => {
    let { id, workId, onRead, onSave } = this.props;

    instanceVersion.get({ id, workId }).then(res => {
      const { status, currentWork, currentWorkItem, works, companyId, ...rest } = res;

      onRead();

      if (status) {
        this.setState({ errorMsg: STATUS_ERROR_MESSAGE[status] });
      } else {
        this.setState({
          data: rest,
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
    const { data, works, currentWork, currentWorkItem, projectId, errorMsg } = this.state;
    const RecordInfoWrapperComp = isLand ? autoSize(RecordInfoWrapper) : RecordInfoWrapper;
    return (
      <RecordInfoWrapperComp
        notDialog={isLand}
        from={4}
        header={
          <Header
            projectId={projectId}
            data={data}
            currentWorkItem={currentWorkItem}
            errorMsg={errorMsg}
            {...this.props}
          />
        }
        workflow={
          <ul className="workflowStepListWrap">
            {works.map((item, index) => {
              return (
                <StepItem
                  key={index}
                  data={item}
                  currentWork={currentWork}
                  currentType={(currentWorkItem || {}).type}
                />
              );
            })}
          </ul>
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
