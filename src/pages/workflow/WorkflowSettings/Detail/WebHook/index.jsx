import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Radio, Dropdown, Checkbox } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  SelectNodeObject,
  DetailHeader,
  DetailFooter,
  CustomTextarea,
  ParameterList,
  KeyPairs,
  TestParameter,
} from '../components';
import { APP_TYPE, METHODS_TYPE } from '../../enum';

export default class WebHook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      sendRequest: false,
      showTestDialog: false,
      testArray: [],
      fileArray: [],
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
        if (!result.headers.length) {
          result.headers.push({
            name: '',
            value: '',
          });
        }

        if (!result.formControls.length) {
          result.formControls.push({
            name: '',
            value: '',
          });
        }

        this.setState({ data: result });
      });
  }

  /**
   * 下拉框更改
   */
  onChange = selectNodeId => {
    const { data } = this.state;
    const selectNodeObj = _.find(data.appList, item => item.nodeId === selectNodeId);

    this.updateSource({ selectNodeId, selectNodeObj });
  };

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * open checksheet
   */
  openChecksheet = () => {
    const { data } = this.state;
    const { selectNodeId } = data;

    if (!selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    window.open(`/workflow/checksheet/${this.props.processId}/${this.props.selectNodeId}/${selectNodeId}`);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const {
      selectNodeId,
      name,
      sendContent,
      body,
      headers,
      method,
      contentType,
      formControls,
      settings,
      testMap,
    } = data;

    if (data.appType === APP_TYPE.SHEET && !selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (!sendContent.trim()) {
      alert(_l('API URL必填'), 2);
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
          name: name.trim(),
          selectNodeId,
          sendContent: sendContent.trim(),
          body,
          headers: headers.filter(item => item.name),
          method,
          contentType,
          formControls: formControls.filter(item => item.name),
          settings: {
            openSSL: settings.openSSL,
          },
          testMap,
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
   * 渲染默认数据
   */
  renderDefaultSource() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold">{_l('数据对象')}</div>
        <div className="Font13 Gray_9e mTop10">{_l('当前流程中的节点对象')}</div>

        <SelectNodeObject
          appList={data.appList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={this.onChange}
        />

        {this.renderUrl()}
        {this.renderHeaders()}

        <div className="Gray_75 mTop15">
          <i className="icon-workflow_error mRight5 Font16" />
          {_l('查看发送数据的')}
          <a className="mLeft5" onClick={this.openChecksheet}>
            {_l('字段对照表')}
          </a>
        </div>
      </Fragment>
    );
  }

  /**
   * 渲染自定义数据
   */
  renderCustomSource() {
    const { data, showTestDialog, testArray, fileArray } = this.state;

    return (
      <Fragment>
        {this.renderUrl()}
        {this.renderHeaders()}
        {!_.includes([1, 4, 5], data.method) && this.renderBody()}

        <div className="Font13 bold mTop20">{_l('返回参数列表')}</div>
        <div className="mTop10 Gray_9e">{_l('向URL发送请求测试获取参数列表；请求中的动态参数将取测试值')}</div>
        <div className="mTop15 webhookBtn InlineBlock" onClick={this.test}>
          {_l('测试 API')}
        </div>

        {!!(data.controls || []).length && (
          <Fragment>
            {data.requestDate && (
              <div className="mTop25 Gray_75">
                {_l('请求时间 %0, 状态码 %1，耗时 %2 秒', data.requestDate, data.statusCode, data.requestTime / 1000)}
              </div>
            )}
            <div className="mTop15 bold">{_l('响应 Body')}</div>
            <ParameterList controls={data.controls.filter(item => item.enumDefault === 0)} />
            <div className="mTop15 bold">{_l('响应 Header')}</div>
            <ParameterList controls={data.controls.filter(item => item.enumDefault === 1)} hideControlType />
          </Fragment>
        )}

        {showTestDialog && (
          <TestParameter
            title={_l('编辑 API 测试数据')}
            onOk={this.send}
            onClose={() => this.setState({ showTestDialog: false })}
            testArray={testArray}
            fileArray={fileArray}
            formulaMap={data.formulaMap}
            testMap={data.testMap}
          />
        )}
      </Fragment>
    );
  }

  /**
   * 渲染body
   */
  renderBody() {
    const { data } = this.state;
    const contentTypes = [
      { text: 'form-data', value: 4 },
      { text: 'x-www-form-urlencoded', value: 1 },
      { text: 'raw', value: 2 },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('Body')}</div>
        <div className="flexRow mTop15">
          {contentTypes.map((item, i) => {
            return (
              <div className="flex alignItemsCenter flexRow minHeight30" key={i}>
                <Radio
                  text={item.text}
                  checked={data.contentType === item.value || (data.contentType === 3 && item.value === 2)}
                  onClick={() =>
                    this.updateSource({
                      contentType: item.value,
                      body: '',
                      formControls: [Object.assign({ name: '', value: '' }, item.value === 4 ? { type: 2 } : {})],
                    })
                  }
                />
                {item.value === 2 && _.includes([2, 3], data.contentType) && (
                  <Dropdown
                    style={{ marginLeft: -15 }}
                    data={[{ text: 'Text', value: 3 }, { text: 'JSON', value: 2 }]}
                    value={data.contentType}
                    onChange={value => this.updateSource({ contentType: value })}
                  />
                )}
              </div>
            );
          })}
        </div>

        {data.contentType === 4 && <div className="Gray_9e mTop5">{_l('此模式下允许发送10M以内附件')}</div>}

        {_.includes([1, 4], data.contentType) && (
          <KeyPairs
            key={this.props.selectNodeId}
            processId={this.props.processId}
            selectNodeId={this.props.selectNodeId}
            isIntegration={this.props.isIntegration}
            source={data.formControls}
            sourceKey="formControls"
            showType={data.contentType === 4}
            formulaMap={data.formulaMap}
            btnText={data.contentType === 4 ? '+ Form' : '+ key-value pairs'}
            updateSource={this.updateSource}
          />
        )}

        {_.includes([2, 3], data.contentType) && (
          <CustomTextarea
            className="minH100"
            processId={this.props.processId}
            selectNodeId={this.props.selectNodeId}
            isIntegration={this.props.isIntegration}
            type={2}
            content={data.body}
            formulaMap={data.formulaMap}
            onChange={(err, value, obj) => this.updateSource({ body: value })}
            updateSource={this.updateSource}
          />
        )}
      </Fragment>
    );
  }

  /**
   * 渲染URL
   */
  renderUrl() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold">{_l('API URL （必填）')}</div>
        <div className="mTop10 Gray_9e flexRow">
          <div className="flex">{_l('将向对应的HTTP地址发送请求；URL后面可以拼接参数')} </div>
          <Checkbox
            className="flexRow"
            text={_l('开启SSL证书验证')}
            checked={data.settings.openSSL}
            onClick={checked =>
              this.updateSource({ settings: Object.assign({}, data.settings, { openSSL: !checked }) })
            }
          />
        </div>

        <div className="flexRow">
          <Dropdown
            className="flowDropdown mTop10 mRight10"
            style={{ width: 120 }}
            data={METHODS_TYPE}
            value={data.method}
            border
            onChange={method => this.updateSource({ method, body: _.includes([1, 5], method) ? '' : data.body })}
          />
          <div className="flex" style={{ minWidth: 0 }}>
            <CustomTextarea
              processId={this.props.processId}
              selectNodeId={this.props.selectNodeId}
              isIntegration={this.props.isIntegration}
              type={2}
              height={0}
              content={data.sendContent}
              formulaMap={data.formulaMap}
              onChange={(err, value, obj) => this.updateSource({ sendContent: value })}
              updateSource={this.updateSource}
            />
          </div>
        </div>
      </Fragment>
    );
  }

  /**
   * 渲染headers
   */
  renderHeaders() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('Headers')}</div>
        <KeyPairs
          key={this.props.selectNodeId}
          processId={this.props.processId}
          selectNodeId={this.props.selectNodeId}
          isIntegration={this.props.isIntegration}
          source={data.headers}
          sourceKey="headers"
          formulaMap={data.formulaMap}
          updateSource={this.updateSource}
          btnText="+ header"
        />
      </Fragment>
    );
  }

  /**
   * 测试
   */
  test = () => {
    const { data } = this.state;
    const { sendContent, headers, formControls, body } = data;
    const testArray = _.uniq(
      (
        sendContent +
        JSON.stringify(headers) +
        JSON.stringify(formControls.filter(item => item.type !== 14)) +
        body
      ).match(/\$[^ \r\n]+?\$/g) || [],
    );
    const fileArray = _.uniq(
      JSON.stringify(formControls.filter(item => item.type === 14)).match(/\$[^ \r\n]+?\$/g) || [],
    );

    if (!(testArray.length + fileArray.length)) {
      this.send();
    } else {
      this.setState({
        showTestDialog: true,
        testArray,
        fileArray,
      });
    }
  };

  /**
   * 发送
   */
  send = (testMap = {}) => {
    const { processId, selectNodeId, isIntegration } = this.props;
    const { data, sendRequest } = this.state;
    const { headers, body, sendContent, method, formControls, contentType, settings } = data;

    this.setState({ showTestDialog: false });

    if (!sendContent) {
      alert(_l('API URL必填'), 2);
      return;
    }

    if (sendRequest) {
      return;
    }

    flowNode
      .webHookTestRequest(
        {
          processId,
          nodeId: selectNodeId,
          method,
          url: this.formatParameters(sendContent, testMap),
          headers: this.formatParameters(headers.filter(item => item.name), testMap, true),
          body: this.formatParameters(body, testMap),
          formControls: this.formatParameters(formControls.filter(item => item.name), testMap, true),
          contentType,
          settings,
        },
        { isIntegration },
      )
      .then(result => {
        if (result.status === 1) {
          this.updateSource({
            controls: result.data.controls,
            testMap,
            requestDate: result.requestDate,
            requestTime: result.requestTime,
            statusCode: result.statusCode,
          });
        } else {
          this.updateSource({ testMap });
          alert(result.msg, 2);
        }

        this.setState({ sendRequest: false });
      });

    this.setState({ sendRequest: true });
  };

  /**
   * 格式化参数
   */
  formatParameters = (source, testMap, isArray) => {
    if (isArray) {
      source = _.cloneDeep(source);
      source.map(item => {
        (item.value.match(/\$[^ \r\n]+?\$/g) || []).forEach(key => {
          item.value = item.value.replace(key, testMap[item.type === 14 ? `${key}14` : key] || '');
        });

        return item;
      });
    } else {
      (source.match(/\$[^ \r\n]+?\$/g) || []).forEach(key => {
        source = source.replace(key, testMap[key] || '');
      });
    }

    return source;
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
          icon="icon-workflow_webhook"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              {_.includes([APP_TYPE.SHEET, APP_TYPE.CUSTOM_ACTION], data.appType) && this.renderDefaultSource()}
              {data.appType === APP_TYPE.WEBHOOK && this.renderCustomSource()}
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            ((data.appType === APP_TYPE.SHEET && data.selectNodeId) || data.appType === APP_TYPE.WEBHOOK) &&
            data.sendContent
          }
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}
