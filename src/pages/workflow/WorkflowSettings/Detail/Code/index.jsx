import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Icon, Dialog } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, ParameterList, KeyPairs } from '../components';
import { ACTION_ID } from '../../enum';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import { Base64 } from 'js-base64';
import _ from 'lodash';

export default class Code extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      sendRequest: false,
      msg: '',
      isFullCode: false,
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
    const { processId, selectNodeId, selectNodeType, isIntegration } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }, { isIntegration })
      .then(result => {
        if (!result.inputDatas.length) {
          result.inputDatas.push({
            name: '',
            value: '',
          });
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
    const { name, actionId, inputDatas, code } = data;

    if (!code) {
      alert(_l('代码块必填'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode(
        {
          processId: this.props.processId,
          nodeId: this.props.selectNodeId,
          flowNodeType: this.props.selectNodeType,
          actionId,
          name: name.trim(),
          inputDatas: inputDatas.filter(item => item.name),
          code: Base64.encode(code),
        },
        { isIntegration: this.props.isIntegration },
      )
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * Output对象参数列表
   */
  renderParameterList() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('Output对象参数列表')}</div>

        <ParameterList controls={data.controls} />

        <div className="mTop20 Gray_9e">{_l('请运行代码块以获得output对象; input对象将采用测试数据')}</div>
        <div className="mTop15 webhookBtn InlineBlock" onClick={this.send}>
          {_l('测试')}
        </div>
      </Fragment>
    );
  }

  /**
   * 发送
   */
  send = () => {
    const { processId, selectNodeId, isIntegration } = this.props;
    const { data, sendRequest } = this.state;
    const { actionId, code, inputDatas } = data;

    if (!code) {
      alert(_l('代码块必填'), 2);
      return;
    }

    if (sendRequest) {
      return;
    }

    flowNode
      .codeTest(
        {
          processId,
          nodeId: selectNodeId,
          actionId,
          code: Base64.encode(code),
          inputDatas: inputDatas.filter(item => item.name),
        },
        { isIntegration },
      )
      .then(result => {
        if (result.status === 1) {
          this.updateSource({ controls: result.data.controls });
          this.setState({ msg: '' });
        } else {
          this.setState({ msg: result.msg });
        }

        this.setState({ sendRequest: false });
      })
      .fail(() => {
        this.setState({ sendRequest: false });
      });

    this.setState({ sendRequest: true });
  };

  /**
   * 渲染代码块
   */
  renderCode(minHeight = { minHeight: 250 }) {
    const { data } = this.state;

    return (
      <Editor
        value={data.code}
        onValueChange={code => this.updateSource({ code })}
        highlight={code => highlight(code, languages.js)}
        textareaClassName="codeTextarea"
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 13,
          ...minHeight,
        }}
      />
    );
  }

  render() {
    const { data, msg, isFullCode } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-url"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              <div className="Font14 Gray_75 workflowDetailDesc">
                {data.actionId === ACTION_ID.JAVASCRIPT ? _l('使用JavaScript语言') : _l('使用Python语言')}
              </div>

              <div className="Font13 bold mTop20">{_l('定义input对象')}</div>
              <KeyPairs
                key={this.props.selectNodeId}
                processId={this.props.processId}
                selectNodeId={this.props.selectNodeId}
                isIntegration={this.props.isIntegration}
                source={data.inputDatas}
                sourceKey="inputDatas"
                flowNodeList={data.flowNodeList}
                formulaMap={data.formulaMap}
                updateSource={this.updateSource}
              />

              <div className="Font13 bold mTop20">{_l('代码块')}</div>
              <div className="mTop5 Gray_9e">
                {data.actionId === ACTION_ID.JAVASCRIPT
                  ? _l('Output 示例：output = {output: "hello world" };')
                  : _l("Output 示例：output = {'hello': 'world!'}")}
              </div>

              <div className="mTop15 relative">
                {this.renderCode()}
                <span
                  data-tip={_l('放大')}
                  className="codeEditorFull tip-top"
                  onClick={() => this.setState({ isFullCode: true })}
                >
                  <Icon icon="open_in_full" />
                </span>
              </div>

              {msg && (
                <Fragment>
                  <div className="mTop10" style={{ color: '#f44336' }}>
                    {_l('代码错误')}
                  </div>
                  <div className="mTop10" style={{ color: '#f44336' }}>
                    {msg}
                  </div>
                </Fragment>
              )}

              {this.renderParameterList()}
            </div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={!!data.code} onSave={this.onSave} />

        {isFullCode && (
          <Dialog
            className="workfowFullCode"
            closable={false}
            type="fixed"
            title={
              <span
                data-tip={_l('缩小')}
                className="codeEditorSmall tip-top"
                onClick={() => this.setState({ isFullCode: false })}
              >
                <Icon icon="close_fullscreen" />
              </span>
            }
            visible
            width={800}
            footer={null}
          >
            {this.renderCode({ minHeight: '100%' })}
          </Dialog>
        )}
      </Fragment>
    );
  }
}
