import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Radio, Dropdown, Checkbox, Tooltip, Icon, Dialog } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  SelectNodeObject,
  DetailHeader,
  DetailFooter,
  CustomTextarea,
  ParameterList,
  KeyPairs,
  TestParameter,
  SpecificFieldsValue,
  FindResult,
} from '../components';
import { ACTION_ID, APP_TYPE, METHODS_TYPE } from '../../enum';
import _ from 'lodash';
import styled from 'styled-components';
import { checkJSON } from '../../utils';

const GenerateJSONBox = styled.textarea`
  padding: 12px;
  border-radius: 4px;
  height: 340px;
  overflow: auto;
  width: 100%;
  border: 1px solid #ddd;
  resize: none;
  &:focus {
    border-color: #2196f3;
  }
`;

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
      errorMsgArray: [],
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
    const { processId, selectNodeId, selectNodeType, isIntegration, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId }, { isIntegration })
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

        const errorMsgArray = Object.keys(result.errorMap).map(key => {
          return { key, value: result.errorMap[key] };
        });

        this.setState({
          data: result,
          errorMsgArray: errorMsgArray.length ? errorMsgArray : [{ key: '', value: '' }],
        });
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
    const { data, saveRequest, errorMsgArray } = this.state;
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
      successCode,
      errorMsg,
      executeType,
    } = data;
    const handleFormControls = formControls
      .filter(item => item.name)
      .map(item => {
        if (!item.type) {
          item.type = 2;
        }

        return item;
      });

    if (data.appType === APP_TYPE.SHEET && !selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (!sendContent.trim()) {
      alert(_l('API URL必填'), 2);
      return;
    }

    let hasError = 0;
    let errorMap = {};
    if (errorMsgArray.length) {
      errorMsgArray
        .filter(item => item.key || item.value)
        .forEach(item => {
          if (!item.key || !item.value) {
            hasError++;
          } else {
            errorMap[item.key] = item.value;
          }
        });
    }

    if (hasError) {
      alert(_l('指定状态码和错误消息不能为空'), 2);
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
          formControls: handleFormControls,
          settings,
          testMap,
          successCode,
          errorMap,
          errorMsg,
          executeType,
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

        <div className="mTop20">{this.renderUrl()}</div>
        {this.renderHeaders()}

        <div className="Gray_75 mTop15 flexRow alignItemsCenter">
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
    const { selectNodeType, isIntegration } = this.props;
    const { data, showTestDialog, testArray, fileArray } = this.state;

    return (
      <Fragment>
        {this.renderUrl()}
        {this.renderHeaders()}
        {!_.includes([1, 4, 5], data.method) && this.renderBody()}

        {!md.global.Config.IsLocal && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('可信 IP 地址')}</div>
            <div className="mTop10 Gray_9e">
              {_l('某些第三方平台需要设置白名单 IP 才能调用API，以下是系统使用的 IP 地址')}
            </div>
            <div className="mTop10">{data.realIp}</div>
          </Fragment>
        )}

        {this.renderCustomErrorMessage()}

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
            <div className="mTop15 flexRow">
              <div className="bold flex">{_l('响应 Body')}</div>
              <div className="ThemeColor3 ThemeHoverColor2 pointer" onClick={this.generateFromJSON}>
                {_l('从 JSON 导入响应示例')}
              </div>
            </div>
            <ParameterList controls={data.controls.filter(item => item.enumDefault === 0)} />
            <div className="mTop15 bold">{_l('响应 Header')}</div>
            <ParameterList controls={data.controls.filter(item => item.enumDefault === 1)} hideControlType />
          </Fragment>
        )}

        {!isIntegration && (
          <FindResult
            nodeType={selectNodeType}
            executeType={data.executeType}
            switchExecuteType={executeType => this.updateSource({ executeType })}
          />
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
      { text: 'binary', value: 5 },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">Body</div>
        <div className="flexRow mTop15">
          {contentTypes.map((item, i) => {
            return (
              <div
                className="alignItemsCenter flexRow minHeight30"
                style={{ flex: item.value === 1 ? 1.2 : 1 }}
                key={i}
              >
                <Radio
                  text={item.text}
                  checked={data.contentType === item.value || (data.contentType === 3 && item.value === 2)}
                  onClick={() =>
                    this.updateSource({
                      contentType: item.value,
                      body: '',
                      formControls: [
                        Object.assign(
                          { name: item.value === 5 ? 'file' : '', value: '' },
                          item.value === 4 ? { type: 2 } : item.value === 5 ? { type: 14 } : {},
                        ),
                      ],
                    })
                  }
                />
                {item.value === 2 && _.includes([2, 3], data.contentType) && (
                  <Dropdown
                    style={{ marginLeft: -15 }}
                    data={[
                      { text: 'Text', value: 3 },
                      { text: 'JSON', value: 2 },
                    ]}
                    value={data.contentType}
                    onChange={value => this.updateSource({ contentType: value })}
                  />
                )}
              </div>
            );
          })}
        </div>

        {_.includes([4, 5], data.contentType) && (
          <div className="Gray_9e mTop5">{_l('此模式下允许发送10M以内附件')}</div>
        )}

        {_.includes([1, 4, 5], data.contentType) && (
          <KeyPairs
            key={this.props.selectNodeId}
            projectId={this.props.companyId}
            processId={this.props.processId}
            relationId={this.props.relationId}
            selectNodeId={this.props.selectNodeId}
            isIntegration={this.props.isIntegration}
            source={data.formControls}
            sourceKey="formControls"
            showType={data.contentType === 4}
            onlyFile={data.contentType === 5}
            formulaMap={data.formulaMap}
            btnText={data.contentType === 4 ? '+ Form' : data.contentType === 5 ? '' : '+ key-value pairs'}
            updateSource={this.updateSource}
          />
        )}

        {_.includes([2, 3], data.contentType) && (
          <CustomTextarea
            className="minH100"
            projectId={this.props.companyId}
            processId={this.props.processId}
            relationId={this.props.relationId}
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
            text={_l('使用网络代理')}
            checked={data.settings.useProxy}
            onClick={checked =>
              this.updateSource({ settings: Object.assign({}, data.settings, { useProxy: !checked }) })
            }
          />
          <Tooltip text={<span>{_l('需要管理员在「组织后台-集成-其他」中配置}')}</span>}>
            <Icon icon="info_outline" className="Gray_9e mTop3 mLeft10 mRight20" />
          </Tooltip>
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
              projectId={this.props.companyId}
              processId={this.props.processId}
              relationId={this.props.relationId}
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
        <div className="Font13 bold mTop20">Headers</div>
        <KeyPairs
          key={this.props.selectNodeId}
          projectId={this.props.companyId}
          processId={this.props.processId}
          relationId={this.props.relationId}
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
  send = (testMap = {}, json) => {
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
          headers: this.formatParameters(
            headers.filter(item => item.name),
            testMap,
            true,
          ),
          body: this.formatParameters(body, testMap),
          formControls: this.formatParameters(
            formControls.filter(item => item.name),
            testMap,
            true,
          ),
          contentType,
          settings,
          json,
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
          alert(result.msg || _l('请求异常'), 2);
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

  /**
   * 渲染自定义错误消息
   */
  renderCustomErrorMessage() {
    const { isIntegration } = this.props;
    const { data, errorMsgArray } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('请求失败设置')}</div>

        {isIntegration && (
          <Fragment>
            <div className="Font13 mTop15">{_l('请求时长')}</div>
            <div className="mTop10 flexRow alignItemsCenter">
              <div style={{ width: 120 }}>
                <SpecificFieldsValue
                  projectId={this.props.companyId}
                  processId={this.props.processId}
                  selectNodeId={this.props.selectNodeId}
                  updateSource={({ fieldValue }) =>
                    this.updateSource({
                      settings: Object.assign({}, data.settings, {
                        timeout: parseInt(fieldValue),
                        maxRetries: fieldValue > 30 ? 0 : data.settings.maxRetries,
                      }),
                    })
                  }
                  type="number"
                  min={5}
                  max={120}
                  hasOtherField={false}
                  data={{ fieldValue: data.settings.timeout }}
                />
              </div>
              <div className="mLeft10">{_l('秒')}（5 ~ 120）</div>

              <Checkbox
                style={{ marginLeft: 80 }}
                text={_l('超时自动重试（最多重试2次）')}
                disabled={data.settings.timeout > 30}
                checked={data.settings.maxRetries > 0}
                onClick={checked =>
                  this.updateSource({ settings: Object.assign({}, data.settings, { maxRetries: checked ? 0 : 2 }) })
                }
              />
            </div>
          </Fragment>
        )}

        <div className="Font13 mTop15">{_l('请求成功的 HTTP 状态码')}</div>
        <div className="flexRow mTop10">
          <input
            type="text"
            className="flex ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
            placeholder={_l('示例：200,201（多个状态码用英文逗号隔开）')}
            value={data.successCode}
            onChange={e => this.updateSource({ successCode: e.target.value.replace(/[^0-9,]/g, '') })}
          />
        </div>

        <div className="Font13 mTop15">{_l('指定 HTTP 状态码错误消息')}</div>
        {errorMsgArray.map((item, i) => {
          return (
            <div className="flexRow mTop10 alignItemsCenter" key={i}>
              <input
                type="text"
                style={{ width: 100 }}
                className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
                placeholder={_l('示例：500')}
                value={item.key}
                onChange={e => this.updateErrorMsg('key', e.target.value.replace(/[^0-9]/g, ''), i)}
              />

              <input
                type="text"
                className="flex ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mLeft10"
                placeholder={_l('请输入错误消息')}
                value={item.value}
                onChange={e => this.updateErrorMsg('value', e.target.value, i)}
                onBlur={e => this.updateErrorMsg('value', e.target.value.trim(), i)}
              />

              <i
                className="icon-delete2 Font16 ThemeHoverColor3 pointer Gray_bd mLeft8"
                onClick={() => this.deleteErrorMsg(i)}
              />
            </div>
          );
        })}

        <div className="mTop10">
          <span
            className="ThemeHoverColor3 pointer Gray_9e"
            onClick={() => this.setState({ errorMsgArray: errorMsgArray.concat({ key: '', value: '' }) })}
          >
            + {_l('状态码')}
          </span>
        </div>

        <div className="Font13 mTop15">{_l('返回其他 HTTP 状态码时的默认错误消息')}</div>
        <div className="flexRow mTop10">
          <input
            type="text"
            className="flex ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
            placeholder={_l('请输入错误消息')}
            value={data.errorMsg}
            onChange={e => this.updateSource({ errorMsg: e.target.value })}
            onBlur={e => this.updateSource({ errorMsg: e.target.value.trim() })}
          />
        </div>
      </Fragment>
    );
  }

  /**
   * 更新错误消息
   */
  updateErrorMsg(key, value, i) {
    const errorMsgArray = _.cloneDeep(this.state.errorMsgArray);

    errorMsgArray[i][key] = value;
    this.setState({ errorMsgArray });
  }

  /**
   * 删除错误消息
   */
  deleteErrorMsg(i) {
    const errorMsgArray = _.cloneDeep(this.state.errorMsgArray);

    _.remove(errorMsgArray, (o, index) => index === i);
    this.setState({ errorMsgArray });
  }

  /**
   * 从JSON导入响应示例
   */
  generateFromJSON = () => {
    const { data } = this.state;

    Dialog.confirm({
      width: 640,
      title: _l('从 JSON 导入响应示例'),
      description: <GenerateJSONBox id="generateJSON">{data.json}</GenerateJSONBox>,
      onOk: () => {
        return new Promise((resolve, reject) => {
          const json = document.getElementById('generateJSON').value.trim();

          if (!json.trim() || checkJSON(json)) {
            this.updateSource({ json });
            this.send(data.testMap, json);
            resolve();
          } else {
            alert(_l('JSON格式有错误'), 2);
            reject(true);
          }
        });
      },
    });
  };

  /**
   * 渲染推送数据
   */
  renderPushSource() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font13">
          <span className="Gray_9e">
            {_l('用于接收事件推送消息，格式如下：必须为HTTP/HTTPS支持POST请求的公网可访问的地址，不能携带任何参数。')}
          </span>
          <a onClick={this.openChecksheet}>{_l('查看推送数据结构')}</a>
        </div>

        <div className="flexRow mTop10">
          <input
            type="text"
            className="flex ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
            placeholder={_l('推送地址')}
            value={data.sendContent}
            onChange={e => this.updateSource({ sendContent: e.target.value.trim() })}
          />
        </div>
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
          icon={data.actionId === ACTION_ID.PBC_OUT ? 'icon-sending' : 'icon-workflow_webhook'}
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">
              {_.includes([APP_TYPE.SHEET, APP_TYPE.CUSTOM_ACTION, APP_TYPE.EVENT_PUSH], data.appType) &&
                data.actionId !== ACTION_ID.PBC_OUT &&
                this.renderDefaultSource()}
              {data.appType === APP_TYPE.WEBHOOK && this.renderCustomSource()}
              {data.actionId === ACTION_ID.PBC_OUT && this.renderPushSource()}
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            ((_.includes([APP_TYPE.SHEET, APP_TYPE.EVENT_PUSH], data.appType) && data.selectNodeId) ||
              data.appType === APP_TYPE.WEBHOOK ||
              data.actionId === ACTION_ID.PBC_OUT) &&
            data.sendContent
          }
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}
