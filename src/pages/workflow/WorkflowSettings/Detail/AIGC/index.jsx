import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dialog, Dropdown, Switch, Support } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, CustomTextarea, TestParameter, JSONAnalysis, OutputList } from '../components';
import { ACTION_ID } from '../../enum';
import _ from 'lodash';
import cx from 'classnames';
import { formatTestParameters } from '../../utils';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import Remarkable from 'remarkable';
import { replaceEntities, escapeHtml } from 'remarkable/lib/common/utils';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

const MarkdownContent = styled.div`
  p {
    margin-bottom: 0;
  }
  .markdown-body {
    h1 {
      font-size: 16px !important;
      padding-bottom: 0 !important;
      border: none !important;
      line-height: normal !important;
      font-weight: normal !important;
    }
    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
      background: transparent;
    }
    span {
      white-space: pre-wrap !important;
      word-break: break-all !important;
    }
    > pre {
      border-radius: 8px !important;
    }
  }
`;

const getDefaultParameters = () => {
  return {
    controlId: uuidv4(),
    type: 2,
    controlName: '',
    dataSource: '',
    value: '',
    jsonPath: '',
  };
};

export default class AIGC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      sendRequest: false,
      templateKey: '',
      templateValue: '',
      showTestDialog: false,
      testArray: [],
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
        if (!result.appId && result.appList.length) {
          result.appId = result.appList[0].id;
        }

        if (result.actionId === ACTION_ID.AIGC_OBJECT && !result.outputs) {
          result.outputs = [getDefaultParameters()];
        }

        this.setState({ data: result });
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
    const { name, appId, prompt, outputs } = data;
    let hasError = false;

    (outputs || []).forEach(item => {
      if (!item.controlName) {
        hasError = true;
      }
    });

    if (saveRequest) {
      return;
    }

    if (!appId) {
      alert(_l('请选择一种AI模型'), 2);
      return;
    }

    if (!prompt) {
      alert(_l('提示词不能为空'), 2);
      return;
    }

    if (hasError) {
      alert(_l('输出参数配置有误'), 2);
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        ...data,
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
    const { data, templateKey, templateValue, showTestDialog, testArray, sendRequest } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold">{_l('选择AI模型')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={data.appList.map((o, index) => ({
            text: `${o.name}${index === 0 ? _l('（默认）') : ''}`,
            value: o.id,
          }))}
          value={data.appId}
          noData={_l('暂无可用模型')}
          border
          openSearch
          onChange={appId => {
            this.updateSource({ appId });
          }}
        />
        {!!data.appList.length && (!md.global.Config.IsLocal || md.global.Config.IsPlatformLocal) && (
          <div className="Font13 Gray_75 mTop5 flexRow">
            {_l(
              '%0 模型按 %1元 / 1K tokens 计费，直接从组织账户余额中扣除',
              data.appId,
              _.find(data.appList, o => o.id === data.appId).entityName,
            )}
            {!md.global.Config.IsPlatformLocal && (
              <Support type={3} text={_l('扣费说明')} href="https://help.mingdao.com/purchase/billing-items" />
            )}
          </div>
        )}

        {this.renderMessage('prompt')}

        <div className="flexRow mTop20 alignItemsCenter">
          <Switch
            className="mRight10"
            checked={data.moreSetting}
            size="small"
            onClick={() => this.updateSource({ moreSetting: !data.moreSetting })}
          />
          {_l('更多设置')}
        </div>

        {data.moreSetting && (
          <Fragment>
            {data.actionId === ACTION_ID.AIGC_TEXT && this.renderMessage('systemMessage')}
            {this.renderMessage('temperature')}
            {this.renderMessage('chatHistory')}
          </Fragment>
        )}

        {data.actionId === ACTION_ID.AIGC_OBJECT && this.renderObject()}

        <div className="mTop25 webhookBtn InlineBlock" onClick={this.test}>
          {_l('测试')}
        </div>

        {sendRequest ? (
          <div className="Font13 workflowDetailDesc mTop25 subProcessDesc Gray_75">{_l('生成中...')}</div>
        ) : (
          <Fragment>
            {data.actionId === ACTION_ID.AIGC_TEXT && data.result && (
              <MarkdownContent
                className="Font13 workflowDetailDesc mTop25 subProcessDesc"
                dangerouslySetInnerHTML={{ __html: this.renderMarkdownContent(data.result) }}
              />
            )}

            {data.actionId === ACTION_ID.AIGC_OBJECT && data.outputs && !!data.outputs.length && data.result && (
              <div className="mTop25 webhookBox">
                <div className="webhookHeader flexRow">
                  <div className="bold w180 ellipsis">{_l('参数名称')}</div>
                  <div className="bold mLeft15 flex ellipsis">{_l('值')}</div>
                </div>
                <JSONAnalysis list={data.outputs} json={data.result} />
              </div>
            )}
          </Fragment>
        )}

        {!!data.totalTokens && (
          <div className="Font13 Gray_75 mTop5">
            {_l('本次测试消耗 %0 tokens， 计费 %1 元', data.totalTokens, data.price)}
          </div>
        )}

        {templateKey && (
          <Dialog
            className="workflowDialogBox"
            visible
            width={400}
            title={templateKey === 'promptTemplate' ? _l('提示词模板') : _l('系统消息模板')}
            onOk={() => {
              this.updateSource({ [templateKey === 'promptTemplate' ? 'prompt' : 'systemMessage']: templateValue });
              this.setState({ templateKey: '', templateValue: '' });
            }}
            onCancel={() => this.setState({ templateKey: '' })}
          >
            <Dropdown
              className="flowDropdown w100"
              menuClass="w100"
              data={Object.keys(data[templateKey]).map(key => ({ text: key, value: data[templateKey][key] }))}
              value={templateValue}
              border
              openSearch
              onChange={templateValue => this.setState({ templateValue })}
            />
          </Dialog>
        )}

        {showTestDialog && (
          <TestParameter
            title={_l('AI 测试数据')}
            onOk={this.send}
            onClose={() => this.setState({ showTestDialog: false })}
            testArray={testArray}
            formulaMap={data.formulaMap}
            testMap={data.testMap}
          />
        )}
      </Fragment>
    );
  }

  // 渲染信息
  renderMessage(key) {
    const { data } = this.state;
    const MESSAGE_MAPS = {
      prompt: {
        title: _l('提示词'),
        desc: _l('给AI模型设置提示词，可引用其他节点动态值。'),
        templateKey: 'promptTemplate',
        templateTitle: _l('提示词模板'),
      },
      systemMessage: {
        title: _l('系统消息'),
        desc: _l(
          '告诉AI模型在生成响应时应该如何行为以及需要参考的任何上下文。你可以描述助手的个性，告诉它应该回答什么和不应该回答什么，并告诉它如何格式化响应。系统消息将按所消耗token数进行计费。',
        ),
        templateKey: 'systemTemplate',
        templateTitle: _l('系统消息模板'),
      },
      temperature: {
        title: _l('温度'),
        desc: _l(
          '值在0到1之间，控制随机性。降低温度意味着模型将产生更多重复和确定性的响应。增加温度会导致更多意外或创造性的响应。',
        ),
      },
      chatHistory: {
        title: _l('会话历史'),
        desc: _l(
          '传入 JSON 对象数组格式的会话历史，将有助于AI理解上下文并进行连续对话。会话历史将按所消耗 token 数进行计费。',
        ),
      },
    };
    const source = MESSAGE_MAPS[key];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{source.title}</div>
        <div className="Font13 flexRow mTop5" style={{ alignItems: 'end' }}>
          <div className="Gray_75" style={{ maxWidth: source.templateKey ? 600 : '100%' }}>
            {source.desc}
          </div>
          <div className="flex" />
          {source.templateKey && data.actionId === ACTION_ID.AIGC_TEXT && (
            <div
              className="ThemeColor3 ThemeHoverColor2 pointer"
              onClick={() => this.setState({ templateKey: source.templateKey })}
            >
              <i className="Font14 icon-lightbulb_outline mRight5" />
              {source.templateTitle}
            </div>
          )}
        </div>
        <CustomTextarea
          className={cx({ minH100: key !== 'temperature' })}
          projectId={this.props.companyId}
          processId={this.props.processId}
          relationId={this.props.relationId}
          selectNodeId={this.props.selectNodeId}
          type={key === 'temperature' ? 6 : 2}
          height={0}
          content={data[key]}
          formulaMap={data.formulaMap}
          onChange={(err, value, obj) => this.updateSource({ [key]: value })}
          updateSource={this.updateSource}
        />
      </Fragment>
    );
  }

  // 渲染数据对象参数
  renderObject() {
    const { isIntegration } = this.props;
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('数据对象参数')}</div>
        <div className="Font13 Gray_75 mTop5">
          {_l('定义输出数据对象的参数，参数名称只能是英文、数字和下划线。参数名称和说明需要含义清晰以便 AI 识别。')}
        </div>

        <OutputList outputType={2} data={data} isIntegration={isIntegration} updateSource={this.updateSource} />
      </Fragment>
    );
  }

  // 测试
  test = () => {
    const { data, sendRequest } = this.state;
    const { prompt, systemMessage, temperature, chatHistory } = data;
    const testArray = _.uniq((prompt + systemMessage + temperature + chatHistory).match(/\$[^ \r\n]+?\$/g) || []);

    if (sendRequest) {
      return;
    }

    if (!testArray.length) {
      this.send();
    } else {
      this.setState({ showTestDialog: true, testArray });
    }
  };

  /**
   * 发送
   */
  send = (testMap = {}) => {
    const { processId, selectNodeId, isIntegration } = this.props;
    const { data, sendRequest } = this.state;
    const { actionId, appId, prompt, systemMessage, temperature, chatHistory, outputs } = data;

    this.setState({ showTestDialog: false });

    if (sendRequest) {
      return;
    }

    flowNode
      .aigcTest(
        {
          processId,
          nodeId: selectNodeId,
          actionId,
          model: appId,
          prompt: formatTestParameters(prompt, testMap),
          systemMessage: formatTestParameters(systemMessage, testMap),
          temperature: formatTestParameters(temperature, testMap),
          chatHistory: formatTestParameters(chatHistory, testMap),
          outputs,
        },
        { isIntegration },
      )
      .then(result => {
        if (result.status === 1) {
          this.updateSource({
            testMap,
            result: result.data,
            price: result.price,
            totalTokens: result.totalTokens,
          });
        } else {
          this.updateSource({ testMap, result: result.data === '' && result.totalTokens === 0 ? '' : result.msg });
        }

        this.setState({ sendRequest: false });
      });

    this.setState({ sendRequest: true });
  };

  /**
   * markdown显示AIGC内容
   */
  renderMarkdownContent = text => {
    const md = new Remarkable({
      highlight(str, lang) {
        return highlight(str, languages.js);
      },
    });

    md.renderer.rules.link_open = function (tokens, idx) {
      const title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
      return '<a target="_blank" href="' + escapeHtml(tokens[idx].href) + '"' + title + '>';
    };

    return md.render(text);
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
          icon={
            _.includes([ACTION_ID.AIGC_TEXT, ACTION_ID.AIGC_OBJECT], data.actionId) ? 'icon-text_ai' : 'icon-AI_image'
          }
          bg="BGRed"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.appId && data.prompt} onSave={this.onSave} />
      </Fragment>
    );
  }
}
