import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Icon } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter } from '../components';
import SelectApiPackage from '../../../components/SelectApiPackage';
import cx from 'classnames';
import ConnectParam from 'src/pages/integration/components/ConnectParam';
import ConnectAuth from 'src/pages/integration/components/ConnectAuth';
import { APP_TYPE } from '../../enum';
import _ from 'lodash';

export default class ApiPackage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      visible: false,
      apiData: {},
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.getNodeDetail(nextProps);
    }

    if (
      nextProps.selectNodeName &&
      nextProps.selectNodeName !== this.props.selectNodeName &&
      nextProps.selectNodeId === this.props.selectNodeId &&
      !_.isEmpty(this.state.data)
    ) {
      this.updateSource({ name: nextProps.selectNodeName });
    }
  }

  /**
   * 获取节点详情
   */
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId })
      .then(result => {
        this.setState({ data: result });

        if (result.appId) {
          this.getList(result.appId);
        }
      });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { name, appId } = data;

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        appId,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { relationId, companyId } = this.props;
    const { visible, data, apiData } = this.state;

    return (
      <Fragment>
        <div
          className={cx(
            'flexRow alignItemsCenter workflowDetailSelectApi',
            { null: !data.appId },
            { error: data.appId && !data.app.name },
          )}
        >
          {!data.appId ? (
            <span
              className="Gray_9e ThemeHoverColor3 pointer alignItemsCenter"
              style={{ display: 'inline-flex' }}
              onClick={() => this.setState({ visible: true })}
            >
              <Icon icon="add_circle_outline" className="Font20 mRight5" />
              {_l('请选择 API 连接与认证')}
            </span>
          ) : data.appId && !data.app.name ? (
            <Fragment>
              <div className="flex Font15">{_l('API 接与认证已删除')}</div>
              <span data-tip={_l('变更连接与认证')}>
                <Icon
                  icon="swap_horiz"
                  className="Font20 Gray_9e ThemeHoverColor3 pointer"
                  onClick={() => this.setState({ visible: true })}
                />
              </span>
            </Fragment>
          ) : (
            <Fragment>
              <div className="workflowApiIcon circle">
                {data.app.iconName ? <img src={data.app.iconName} /> : <Icon icon="connect" className="Font20" />}
              </div>
              <div className="mLeft12 flexColumn" style={{ maxWidth: 600 }}>
                <div className="Font15">
                  <span className="ellipsis InlineBlock" style={{ maxWidth: 570 }}>
                    {data.app.name}
                  </span>
                  <Icon
                    icon="task-new-detail"
                    className="mLeft10 Font12 ThemeColor3 ThemeHoverColor2 pointer"
                    onClick={() => window.open(`/integrationConnect/${data.appId}`)}
                  />
                </div>
                {(data.app.explain || data.app.describe) && (
                  <div className="Gray_9e ellipsis">{data.app.explain || data.app.describe}</div>
                )}
              </div>
              <div className="flex" />
              <span data-tip={_l('变更连接与认证')}>
                <Icon
                  icon="swap_horiz"
                  className="Font20 Gray_9e ThemeHoverColor3 pointer"
                  onClick={() => this.setState({ visible: true })}
                />
              </span>
            </Fragment>
          )}
        </div>

        {apiData.startEventId && this.renderApiContent()}

        <SelectApiPackage
          appId={relationId}
          companyId={companyId}
          visible={visible}
          onSave={app => {
            this.updateSource({ appId: app.id, app });
            this.getList(app.id);
          }}
          onClose={() => this.setState({ visible: false })}
        />
      </Fragment>
    );
  }

  /**
   * 获取列表
   */
  getList(processId) {
    flowNode.get({ processId }, { isIntegration: true }).then(result => {
      this.setState({ apiData: result });
    });
  }

  /**
   * 渲染api内容
   */
  renderApiContent() {
    const { apiData } = this.state;
    const firstNode = apiData.flowNodeMap[apiData.startEventId];
    const nextNode = apiData.flowNodeMap[firstNode.nextId];

    return (
      <Fragment>
        <ConnectParam
          className="w100 mTop20"
          id={apiData.id}
          node={{ id: apiData.startEventId, typeId: firstNode.typeId }}
        />
        {nextNode.appType !== APP_TYPE.NO_AUTH && (
          <Fragment>
            <div className="flexColumn alignItemsCenter">
              <Icon icon="arrow" className="Font20 Gray_bd" />
            </div>
            <ConnectAuth
              className="w100 mTop0"
              id={apiData.id}
              node={{
                appId: nextNode.appId,
                id: nextNode.id,
                typeId: nextNode.typeId,
              }}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }

  render() {
    const { data } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-connect"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.appId} onSave={this.onSave} />
      </Fragment>
    );
  }
}
