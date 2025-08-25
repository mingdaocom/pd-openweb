import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView, SvgIcon, Tooltip } from 'ming-ui';
import { dialogSelectIntegrationApi } from 'ming-ui/functions';
import flowNode from '../../../api/flowNode';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import { DetailFooter, DetailHeader, FindResult, ProcessParameters, SelectAuthAccount } from '../components';

export default class Api extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps) {
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
  getNodeDetail(props, appId) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;
    const { data } = this.state;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, appId, instanceId })
      .then(result => {
        if (result.subProcessVariables.length) {
          result.subProcessVariables
            .filter(item => item.dataSource)
            .forEach(item => {
              const parentNode = _.find(result.subProcessVariables, o => o.controlId === item.dataSource);

              if (parentNode && _.includes([10000007, 10000008], parentNode.type)) {
                result.fields.forEach(o => {
                  if (o.fieldId === item.controlId) {
                    o.dataSource = parentNode.controlId;
                  }
                });
              }
            });
        }

        this.setState({ data: !appId ? result : { ...result, name: data.name, authId: '' } });
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
    const { name, appId, fields, hasAuth, authId, executeType, authIdAccounts, authIdKeywords } = data;
    const subProcessVariables = _.cloneDeep(data.subProcessVariables);
    let hasError = 0;

    if (saveRequest) {
      return;
    }

    subProcessVariables.forEach(item => {
      if (item.type === 10000008) {
        const { fieldValueId, nodeId, required } = fields.find(o => o.fieldId === item.controlId);

        if ((fieldValueId && nodeId) || !required) {
          _.remove(subProcessVariables, o => o.dataSource === item.controlId);
        }
      }
    });

    subProcessVariables.forEach(item => {
      if (item.required) {
        fields.forEach(o => {
          if (item.controlId === o.fieldId && !o.nodeId && !o.fieldValue && !o.fieldValueId) {
            hasError++;
          }
        });
      }
    });

    if (hasError > 0) {
      alert(_l('有必填字段未填写'), 2);
      return;
    }

    if (hasAuth && !authId && !authIdAccounts.length) {
      alert(_l('必须选择一个账户'), 2);
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        appId,
        fields,
        authId,
        executeType,
        authIdAccounts,
        authIdKeywords,
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
    const { selectNodeType } = this.props;
    const { data } = this.state;

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
              className="Gray_75 ThemeHoverColor3 pointer alignItemsCenter"
              style={{ display: 'inline-flex' }}
              onClick={this.selectIntegrationApi}
            >
              <Icon icon="add_circle_outline" className="Font20 mRight5" />
              {_l('请选择 API 模板')}
            </span>
          ) : data.appId && !data.app.name ? (
            <Fragment>
              <div className="flex Font15">{_l('API已删除')}</div>
              <span data-tip={_l('变更API')}>
                <Icon
                  icon="swap_horiz"
                  className="Font20 Gray_75 ThemeHoverColor3 pointer"
                  onClick={this.selectIntegrationApi}
                />
              </span>
            </Fragment>
          ) : (
            <Fragment>
              <div
                className="workflowApiIcon"
                style={{ backgroundColor: getRgbaByColor(data.app.iconColor || '#757575', '0.08') }}
              >
                <SvgIcon url={data.app.iconName} fill={data.app.iconColor} size={32} />
                <Tooltip popupPlacement="bottom" text={<span>{data.app.otherApkId || _l('未命名连接')}</span>}>
                  <div className="workflowApiIconSubscript workflowDetailTipsWidth tip-bottom-right">
                    {data.app.otherApkName ? <img src={data.app.otherApkName} /> : <Icon icon="connect" />}
                  </div>
                </Tooltip>
              </div>
              <div className="mLeft12 flexColumn" style={{ maxWidth: 600 }}>
                <div className="Font15">
                  <span className="ellipsis InlineBlock" style={{ maxWidth: 570 }}>
                    {data.app.name}
                  </span>
                  <Icon
                    icon="task-new-detail"
                    className="mLeft10 Font12 ThemeColor3 ThemeHoverColor2 pointer"
                    onClick={() => window.open(`/integrationApi/${data.appId}`)}
                  />
                </div>
                {(data.app.explain || data.app.describe) && (
                  <div className="Gray_75 ellipsis">{data.app.explain || data.app.describe}</div>
                )}
              </div>
              <div className="flex" />
              <span data-tip={_l('变更API')}>
                <Icon
                  icon="swap_horiz"
                  className="Font20 Gray_75 ThemeHoverColor3 pointer"
                  onClick={this.selectIntegrationApi}
                />
              </span>
            </Fragment>
          )}
        </div>

        {data.hasAuth && (
          <SelectAuthAccount
            {...this.props}
            className="mTop20"
            required
            apiId={data.appId}
            authId={data.authId}
            authIdAccounts={data.authIdAccounts}
            authIdKeywords={data.authIdKeywords}
            formulaMap={data.formulaMap}
            onChange={(obj, callback = () => {}) => {
              if (_.isObject(obj)) {
                this.updateSource(obj, callback);
              } else {
                this.updateSource({ authId: obj, authIdAccounts: [], authIdKeywords: '' });
              }
            }}
          />
        )}

        {data.appId && !!data.fields.length && (
          <Fragment>
            <div className="mTop20 bold">{_l('传递参数')}</div>
            <ProcessParameters {...this.props} data={data} updateSource={this.updateSource} />
          </Fragment>
        )}

        {data.appId && (
          <FindResult
            nodeType={selectNodeType}
            executeType={data.executeType}
            switchExecuteType={executeType => this.updateSource({ executeType })}
          />
        )}
      </Fragment>
    );
  }

  /**
   * 选择已集成的api
   */
  selectIntegrationApi = () => {
    const { companyId, relationId } = this.props;

    dialogSelectIntegrationApi({
      projectId: companyId,
      appId: relationId,
      onOk: id => this.getNodeDetail(this.props, id),
    });
  };

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
          icon="icon-api"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.appId} onSave={this.onSave} />
      </Fragment>
    );
  }
}
