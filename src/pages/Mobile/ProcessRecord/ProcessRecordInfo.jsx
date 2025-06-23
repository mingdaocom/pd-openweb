import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import worksheetApi from 'src/api/worksheet';
import instanceApi from 'src/pages/workflow/api/instance';
import instanceVersionApi from 'src/pages/workflow/api/instanceVersion';
import { Abnormal, Loading } from 'mobile/components/RecordInfo/RecordState';
import WorkflowStepItem from 'mobile/ProcessRecord/WorkflowStepItem';
import FixedPage from 'src/pages/Mobile/App/FixedPage';
import { ACTION_TYPES } from 'src/pages/workflow/components/ExecDialog/config';
import { addBehaviorLog } from 'src/utils/project';
import Footer from './Footer';

export default class ProcessRecordInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      errorMsg: '',
      workItem: {},
      instance: {},
      appInfo: {},
      RecordInfo: null,
    };
  }
  processFooter = React.createRef();
  componentDidMount() {
    this.getWorkItem();
    import('mobile/components/RecordInfo/RecordInfo').then(component => {
      this.setState({ RecordInfo: component.default });
    });
  }
  getWorkItem() {
    const { instanceId, workId, isModal } = this.props;
    Promise.all([
      worksheetApi.getWorkItem({
        instanceId,
        workId,
      }),
      instanceVersionApi.get({
        id: instanceId,
        workId,
      }),
    ])
      .then(data => {
        const [workItem, instance] = data;
        // 落地页，调用 app 接口获取状态
        if (!isModal && _.get(instance, 'app.id')) {
          homeAppApi
            .getApp({
              appId: _.get(instance, 'app.id'),
            })
            .then(data => {
              addBehaviorLog('worksheetRecord', workItem.worksheetId, { rowId: workItem.rowId });
              this.setState({
                loading: false,
                appInfo: data,
                workItem,
                instance,
              });
            });
        } else {
          this.setState({
            loading: false,
            workItem,
            instance,
          });
        }
      })
      .catch(err => {
        this.setState({
          loading: false,
          error: true,
          errorMsg: _.get(err, 'errorMessage') || _l('流程已关闭或删除'),
        });
      });
  }
  handleStash = () => {
    this.processFooter.current.handleClick('stash');
  };
  ownerHandle = () => {
    const { instanceId, workId, onClose } = this.props;
    const { currentWorkItem } = this.state.instance;
    const { type } = currentWorkItem;

    instanceApi[type === 4 ? 'forward' : 'transfer']({
      id: instanceId,
      workId,
      forwardAccountId: 'user-workflow',
    }).then(() => {
      onClose({ id: instanceId, workId });
    });
  };
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
        {isStash && <Icon className="Font22 mRight10 Gray_9e" icon="save1" onClick={this.handleStash} />}
      </div>
    );
  }
  renderWorkflow = ({ formData }) => {
    const { workItem, instance } = this.state;
    return (
      <WorkflowStepItem
        instance={instance}
        worksheetId={workItem.worksheetId}
        recordId={workItem.rowId}
        controls={formData}
      />
    );
  };
  render() {
    const { RecordInfo } = this.state;
    const { workId, instanceId, onClose, onSave } = this.props;
    const { loading, workItem, instance, error, errorMsg, appInfo } = this.state;

    if (loading || !RecordInfo) {
      return <Loading />;
    }

    if (appInfo.webMobileDisplay) {
      return <FixedPage isNoPublish={true} backVisible={false} />;
    }

    if (error) {
      return <Abnormal errorMsg={errorMsg} onClose={onClose} />;
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
        renderAbnormal={() => {
          return (
            <Abnormal
              errorMsg={
                <div className="flexColumn alignItemsCenter">
                  <div className="Font17 Bold Gray">{_l('当前记录无权限，无法查看')}</div>
                  {!!instance.operationTypeList[0].length && (
                    <div className="mTop15 ThemeColor3 ThemeHoverColor2 pointer Font14" onClick={this.ownerHandle}>
                      {_l('转交给流程拥有者处理')}
                    </div>
                  )}
                </div>
              }
              onClose={onClose}
            />
          );
        }}
        footer={
          <Footer
            ref={this.processFooter}
            workId={workId}
            instanceId={instanceId}
            workItem={workItem}
            instance={instance}
            onClose={onClose}
            onSave={onSave}
          />
        }
        workflow={this.renderWorkflow}
      />
    );
  }
}
