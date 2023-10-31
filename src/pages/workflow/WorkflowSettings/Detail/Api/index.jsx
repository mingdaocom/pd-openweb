import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Icon, Tooltip } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, ProcessParameters } from '../components';
import cx from 'classnames';
import DialogIntegrationApi from 'src/components/DialogIntegrationApi';
import SvgIcon from 'src/components/SvgIcon';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import _ from 'lodash';

export default class Api extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      visible: false,
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
  getNodeDetail(props, appId) {
    const { processId, selectNodeId, selectNodeType } = props;
    const { data } = this.state;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, appId }).then(result => {
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

      this.setState({ data: !appId ? result : { ...result, name: data.name } });
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
    const { name, appId, fields } = data;
    const subProcessVariables = _.cloneDeep(data.subProcessVariables);
    let hasError = 0;

    if (saveRequest) {
      return;
    }

    subProcessVariables.forEach(item => {
      if (item.type === 10000008 && fields.find(o => o.fieldId === item.controlId).nodeId) {
        _.remove(subProcessVariables, o => o.dataSource === item.controlId);
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

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        appId,
        fields,
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
    const { companyId, relationId } = this.props;
    const { data, visible } = this.state;

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
              {_l('请选择 API 模板')}
            </span>
          ) : data.appId && !data.app.name ? (
            <Fragment>
              <div className="flex Font15">{_l('API已删除')}</div>
              <span data-tip={_l('变更API')}>
                <Icon
                  icon="swap_horiz"
                  className="Font20 Gray_9e ThemeHoverColor3 pointer"
                  onClick={() => this.setState({ visible: true })}
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
                  <div className="Gray_9e ellipsis">{data.app.explain || data.app.describe}</div>
                )}
              </div>
              <div className="flex" />
              <span data-tip={_l('变更API')}>
                <Icon
                  icon="swap_horiz"
                  className="Font20 Gray_9e ThemeHoverColor3 pointer"
                  onClick={() => this.setState({ visible: true })}
                />
              </span>
            </Fragment>
          )}
        </div>

        {data.appId && !!data.fields.length && (
          <Fragment>
            <div className="mTop20 bold">{_l('传递参数')}</div>
            <ProcessParameters {...this.props} data={data} updateSource={this.updateSource} />
          </Fragment>
        )}

        {visible && (
          <DialogIntegrationApi
            projectId={companyId}
            appId={relationId}
            onOk={id => {
              this.getNodeDetail(this.props, id);
            }}
            onClose={() => this.setState({ visible: false })}
          />
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
          icon="icon-api"
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
