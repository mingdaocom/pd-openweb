import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown, Radio } from 'ming-ui';
import _ from 'lodash';
import { NODE_TYPE } from '../../enum';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  Member,
  SelectUserDropDown,
  SingleControlValue,
  CustomTextarea,
} from '../components';

export default class Template extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      cacheKey: +new Date(),
      detailType: 0,
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

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, appId }).then(result => {
      this.setState({
        data: appId
          ? Object.assign({}, this.state.data, { appId, controls: result.controls, fields: result.fields })
          : result,
        cacheKey: +new Date(),
        detailType: result.templateNode.appId || result.templateNode.pagePath ? 1 : 0,
      });
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
    const { name, actionId, accounts, appId, fields, templateNode } = data;

    if (!accounts.length) {
      alert(_l('必须先选择一个发送人'), 2);
      return;
    }

    if (!appId) {
      alert(_l('必须先选择一个模板'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        actionId,
        name: name.trim(),
        accounts,
        appId,
        fields,
        templateNode,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 渲染描述
   */
  renderDesc() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Gray_75 workflowDetailDesc">
          {_l(
            '发送服务号消息是指向已关注公众号的微信用户发送模版消息。发送对象支持使用人员字段（通过微信授权注册的外部门户用户）或文本字段（存储微信公众号openid）。使用微信公众号模板消息需要组织后台绑定已认证的企业服务号，并在微信公众号后台开通“模板消息”功能。',
          )}
        </div>
        <div className="mTop20 bold">{_l('服务号')}</div>
        {data.service.appId ? (
          <div className="workflowDetailDesc mTop10">
            {_l('官方认证服务号')}
            <span className="mLeft5" style={{ color: '#01ca83' }}>
              {data.service.serviceName}
            </span>
          </div>
        ) : (
          <div className="Gray_75 workflowDetailDesc mTop10">
            {_l('当前应用外部门户未开通微信登录，请前往')}
            <a
              href={`/app/${this.props.relationId}/role/external`}
              className="ThemeColor3 ThemeHoverColor2"
              target={location.href.indexOf('role/external') ? '_blank' : '_self'}
            >
              {_l('门户设置')}
            </a>
            {_l('操作')}
          </div>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染成员
   */
  renderMembers() {
    const { data, showSelectUserDialog } = this.state;

    return (
      <Fragment>
        <div className="mTop20 bold">
          {_l('发送给')}
          <span
            className="workflowDetailTipsWidth mLeft5 Gray_9e tip-bottom-right"
            data-tip={_l('发送对象必须是已关注当前公众号的外部用户')}
          >
            <i className="Font16 icon-info" />
          </span>
        </div>
        <Member accounts={data.accounts} removeOrganization={true} updateSource={this.updateSource} />
        <div
          className="flexRow mTop15 ThemeColor3 workflowDetailAddBtn"
          onClick={() => this.setState({ showSelectUserDialog: true })}
        >
          <i className="Font28 icon-task-add-member-circle mRight10" />
          {_l('选择成员或包含openid的文本字段')}
          <SelectUserDropDown
            appId={this.props.relationType === 2 ? this.props.relationId : ''}
            specialType={10000005}
            visible={showSelectUserDialog}
            companyId={this.props.companyId}
            processId={this.props.processId}
            nodeId={this.props.selectNodeId}
            onlyNodeRole
            unique={false}
            accounts={data.accounts}
            updateSource={this.updateSource}
            onClose={() => this.setState({ showSelectUserDialog: false })}
          />
        </div>
      </Fragment>
    );
  }

  /**
   * 渲染模板
   */
  renderTemplate() {
    const { data, cacheKey, detailType } = this.state;
    const appList = data.appList.map(item => {
      return {
        text: item.name,
        value: item.id,
        className: item.id === data.appId ? 'ThemeColor3' : '',
      };
    });
    const list = [
      { text: _l('H5链接'), value: 0 },
      { text: _l('小程序路径'), value: 1 },
    ];

    return (
      <Fragment>
        <div className="mTop20 bold">
          {_l('选择模板')}
          <span
            className="workflowDetailTipsWidth mLeft5 Gray_9e tip-bottom-right"
            data-tip={_l('请严格按照模板消息的运营规范配置，防止模板消息被封。如未添加消息模板，请先去公众号中配置。')}
          >
            <i className="Font16 icon-info" />
          </span>
        </div>
        <Dropdown
          className="flowDropdown mTop10"
          data={appList}
          value={data.appId || undefined}
          border
          openSearch
          noData={_l('公众号未添加消息模板')}
          placeholder={_l('搜索模板')}
          onChange={appId => this.getNodeDetail(this.props, appId)}
        />

        {data.appId && (
          <Fragment>
            <div className="mTop20 bold">{_l('内容设置')}</div>
            <div className="mTop15 Font13 Gray_75">{_l('标题')}</div>
            <div className="mTop8 actionControlBox actionDisabled pLeft10 pRight10">
              {(_.find(appList, item => item.value === data.appId) || {}).text}
            </div>

            {data.fields.map((item, i) => {
              const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId);
              return (
                <div key={i} className="relative">
                  <div className="mTop15 ellipsis Font13">
                    {singleObj.controlName || (i === 0 ? _l('顶部自定义') : _l('备注'))}
                  </div>
                  <div className="flexRow">
                    <div className="flex">
                      <SingleControlValue
                        key={cacheKey + i}
                        companyId={this.props.companyId}
                        processId={this.props.processId}
                        selectNodeId={this.props.selectNodeId}
                        controls={data.controls}
                        formulaMap={data.formulaMap}
                        fields={data.fields}
                        updateSource={this.updateSource}
                        item={item}
                        i={i}
                      />
                    </div>
                    {i !== 0 && (
                      <div className="workflowDetailColorBtn mTop8 ThemeHoverColor3">
                        <input
                          type="color"
                          value={item.color || '#333333'}
                          onChange={event => {
                            let fields = [].concat(data.fields);

                            fields[i].color = event.target.value;
                            this.updateSource({ fields });
                          }}
                        />
                        <div className="flexColumn">
                          <span>Ａ</span>
                          <span className="workflowDetailColor" style={{ backgroundColor: item.color || '#333333' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="mTop20 bold">{_l('详情链接')}</div>
            <div className="flexRow mTop10">
              {list.map((item, i) => (
                <div className="flex" key={i}>
                  <Radio
                    text={item.text}
                    checked={item.value === detailType}
                    onClick={() => {
                      this.setState({ detailType: item.value });
                      this.updateSource({ templateNode: { url: '', appId: '', pagePath: '' } });
                    }}
                  />
                </div>
              ))}
            </div>
            {detailType === 0 ? (
              <Fragment>
                <div className="mTop15">{_l('H5页面路径')}</div>
                <div className="mTop10">
                  <CustomTextarea
                    processId={this.props.processId}
                    selectNodeId={this.props.selectNodeId}
                    type={2}
                    height={0}
                    content={data.templateNode.url}
                    formulaMap={data.formulaMap}
                    onChange={(err, value, obj) =>
                      this.updateSource({ templateNode: Object.assign({}, data.templateNode, { url: value }) })
                    }
                    updateSource={this.updateSource}
                  />
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className="mTop15 Gray_75">{_l('选择小程序链接，则小程序需已关联该公众号')}</div>
                <div className="mTop15">{_l('小程序ID（AppID）')}</div>
                <div className="mTop10">
                  <CustomTextarea
                    processId={this.props.processId}
                    selectNodeId={this.props.selectNodeId}
                    type={2}
                    height={0}
                    content={data.templateNode.appId}
                    formulaMap={data.formulaMap}
                    onChange={(err, value, obj) =>
                      this.updateSource({ templateNode: Object.assign({}, data.templateNode, { appId: value }) })
                    }
                    updateSource={this.updateSource}
                  />
                </div>
                <div className="mTop15">{_l('小程序页面路径')}</div>
                <div className="mTop10">
                  <CustomTextarea
                    processId={this.props.processId}
                    selectNodeId={this.props.selectNodeId}
                    type={2}
                    height={0}
                    content={data.templateNode.pagePath}
                    formulaMap={data.formulaMap}
                    onChange={(err, value, obj) =>
                      this.updateSource({ templateNode: Object.assign({}, data.templateNode, { pagePath: value }) })
                    }
                    updateSource={this.updateSource}
                  />
                </div>
              </Fragment>
            )}
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
          icon="icon-wechat"
          bg="BGBlue"
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              {this.renderDesc()}
              {this.renderMembers()}
              {this.renderTemplate()}
            </div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.accounts.length && data.appId} onSave={this.onSave} />
      </Fragment>
    );
  }
}
