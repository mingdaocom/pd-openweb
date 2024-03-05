import React, { Fragment, Component } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import worksheetApi from 'src/api/worksheet';
import instanceVersionApi from 'src/pages/workflow/api/instanceVersion';
import RecordInfo from 'mobile/components/RecordInfo/RecordInfo';
import { Loading, Abnormal } from 'mobile/components/RecordInfo/RecordState';
import WorkflowStepItem from 'mobile/ProcessRecord/WorkflowStepItem';
import Footer from './Footer';
import {
  ACTION_TYPES,
} from 'src/pages/workflow/components/ExecDialog/config';

export default class ProcessRecordInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      errorMsg: '',
      workItem: {},
      instance: {}
    }
  }
  processFooter = React.createRef();
  componentDidMount() {
    this.getWorkItem();
  }
  getWorkItem() {
    const { instanceId, workId } = this.props;
    Promise.all([
      worksheetApi.getWorkItem({
        instanceId,
        workId
      }),
      instanceVersionApi.get({
        id: instanceId,
        workId
      })
    ]).then(data => {
      const [workItem, instance] = data;
      this.setState({
        loading: false,
        workItem,
        instance,
      });
    }).catch(err => {
      this.setState({
        loading: false,
        error: true,
        errorMsg: _.get(err, 'errorMessage') || _l('流程已关闭或删除')
      });
    });
  }
  handleStash = () => {
    this.processFooter.current.handleClick('stash');
  }
  renderHeader() {
    const { instance } = this.state;
    const { name, type, appType } = instance.flowNode;
    const isStash = _.includes(instance.operationTypeList[0], 13);
    const action = ACTION_TYPES[type];
    return (
      <div className="flexRow flex alignItemsCenter" style={{ justifyContent: 'space-between' }}>
        <div
          className={cx(
            'sheetName ellipsis Font13',
            action.id,
            typeof action.icon === 'string' ? '' : action.icon[appType],
          )}
        >
          <Icon icon={typeof action.icon === 'string' ? action.icon : action.icon[appType]} className="Font18" />
          <span>{name}</span>
        </div>
        {isStash && (
          <Icon className="Font22 mRight10 Gray_9e" icon="save1" onClick={this.handleStash} />
        )}
      </div>
    );
  }
  renderWorkflow() {
    const { workItem, instance } = this.state;
    return (
      <WorkflowStepItem
        instance={instance}
        worksheetId={workItem.worksheetId}
        recordId={workItem.rowId}
      />
    );
  }
  render() {
    const { workId, instanceId, onClose } = this.props;
    const { loading, workItem, instance, error, errorMsg } = this.state;

    if (loading) {
      return <Loading />;
    }

    if (error) {
      return (
        <Abnormal errorMsg={errorMsg} onClose={onClose} />
      );
    }

    return (
      <RecordInfo
        isModal={true}
        from={_.get(instance, 'flowNode.type') === 5 ? 6 : 4}
        appId={instance.app.id}
        worksheetId={workItem.worksheetId}
        viewId={workItem.viewId}
        recordId={workItem.rowId}
        workId={workId}
        instanceId={instanceId}
        onClose={onClose}
        header={this.renderHeader()}
        footer={(
          <Footer
            ref={this.processFooter}
            workId={workId}
            instanceId={instanceId}
            workItem={workItem}
            instance={instance}
            onClose={onClose}
          />
        )}
        workflow={this.renderWorkflow()}
      />
    );
  }
}
