import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Radio, Dropdown, Checkbox } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { SelectNodeObject, DetailHeader, DetailFooter, CustomTextarea, ParameterList } from '../components';
import { APP_TYPE } from '../../enum';
import cx from 'classnames';

export default class WebHook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      sendRequest: false,
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
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }).then(result => {
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
    const { selectNodeId, name, sendContent, body, headers, method, contentType, formControls, settings } = data;

    if (data.appType === APP_TYPE.SHEET && !selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (!sendContent.trim()) {
      alert(_l('Webhook URL必填'), 2);
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
      })
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
        <div className="Font13 bold mTop20">{_l('数据对象')}</div>
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
    const { data } = this.state;
    const methods = [
      { text: 'GET', value: 1 },
      { text: 'POST', value: 2 },
    ];

    return (
      <Fragment>
        <div className="Font13 mTop20 flexRow">
          <div className="flex bold">{_l('请选择请求方式')}</div>
          <Checkbox
            className="flexRow"
            text={_l('开启SSL证书验证')}
            checked={data.settings.openSSL}
            onClick={checked =>
              this.updateSource({ settings: Object.assign({}, data.settings, { openSSL: !checked }) })
            }
          />
        </div>
        <Dropdown
          className="flowDropdown flowDropdownBorder mTop10"
          data={methods}
          value={data.method}
          border
          onChange={method => this.updateSource({ method, body: method === 1 ? '' : data.body })}
        />

        {this.renderUrl()}
        {this.renderHeaders()}

        {data.method !== 1 && this.renderBody()}

        <div className="Font13 bold mTop20">{_l('返回参数列表')}</div>

        <ParameterList controls={data.controls} />

        <div className="mTop20 Gray_9e">{_l('向URL发送请求测试获取参数列表；请求中的动态参数将取测试值')}</div>
        <div className="mTop15 webhookBtn InlineBlock" onClick={this.send}>
          {_l('发送')}
        </div>
      </Fragment>
    );
  }

  /**
   * 渲染body
   */
  renderBody() {
    const { data } = this.state;
    const contentTypes = [
      { text: 'key-value pairs', value: 1 },
      { text: 'raw (application/json)', value: 2 },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('Body')}</div>
        <div className="flexRow mTop15">
          {contentTypes.map((item, i) => {
            return (
              <div className="flex" key={i}>
                <Radio
                  text={item.text}
                  checked={data.contentType === item.value}
                  onClick={() =>
                    this.updateSource({ contentType: item.value, body: '', formControls: [{ name: '', value: '' }] })
                  }
                />
              </div>
            );
          })}
        </div>

        {data.contentType === 1 ? (
          this.renderKeyValues('formControls', data.formControls, '+ key-value pairs')
        ) : (
          <CustomTextarea
            className="minH100"
            processId={this.props.processId}
            selectNodeId={this.props.selectNodeId}
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
   * 渲染键值对
   */
  renderKeyValues(key, source, btnText) {
    const { data } = this.state;

    return (
      <Fragment>
        {source.map((item, i) => {
          return (
            <Fragment key={this.props.selectNodeId + i}>
              <div className={(cx('flexRow'), i === 0 ? 'mTop10' : 'mTop20')}>
                <input
                  type="text"
                  className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
                  style={{ width: 200 }}
                  placeholder="key"
                  value={item.name}
                  onChange={evt => this.updateKeyValues(key, 'name', evt.target.value, i)}
                />
              </div>
              <div className="flexRow">
                <div className="flex" style={{ minWidth: 0 }}>
                  <CustomTextarea
                    processId={this.props.processId}
                    selectNodeId={this.props.selectNodeId}
                    placeholder="value"
                    type={2}
                    height={0}
                    content={item.value}
                    formulaMap={data.formulaMap}
                    onChange={(err, value, obj) => this.updateKeyValues(key, 'value', value, i)}
                    updateSource={this.updateSource}
                  />
                </div>
                <i
                  className="icon-delete2 Font16 mLeft8 mTop20 ThemeHoverColor3 pointer Gray_bd"
                  onClick={() => this.deleteKeys(key, i)}
                />
              </div>
            </Fragment>
          );
        })}
        <div className="mTop10">
          <span
            className="ThemeHoverColor3 pointer Gray_9e"
            onClick={() => this.updateSource({ [key]: data[key].concat({ name: '', value: '' }) })}
          >
            {btnText}
          </span>
        </div>
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
        <div className="Font13 bold mTop20">{_l('Webhook URL （必填）')}</div>
        <div className="mTop15 Gray_9e">{_l('将向对应的HTTP地址发送请求；URL后面可以拼接参数')}</div>

        <CustomTextarea
          processId={this.props.processId}
          selectNodeId={this.props.selectNodeId}
          type={2}
          height={0}
          content={data.sendContent}
          formulaMap={data.formulaMap}
          onChange={(err, value, obj) => this.updateSource({ sendContent: value })}
          updateSource={this.updateSource}
        />
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
        {this.renderKeyValues('headers', data.headers, '+ header')}
      </Fragment>
    );
  }

  /**
   * 添加key参数
   */
  updateKeyValues(key, keyName, value, i) {
    const { data } = this.state;
    const items = _.cloneDeep(data[key]);

    items[i][keyName] = value;
    this.updateSource({ [key]: items });
  }

  /**
   * 删除头参数
   */
  deleteKeys(key, i) {
    const { data } = this.state;
    const items = _.cloneDeep(data[key]);

    _.remove(items, (obj, index) => index === i);
    this.updateSource({ [key]: items });
  }

  /**
   * 发送
   */
  send = () => {
    const { processId, selectNodeId } = this.props;
    const { data, sendRequest } = this.state;
    const { headers, body, sendContent, method, formControls, contentType, settings } = data;

    if (!sendContent) {
      alert(_l('Webhook URL必填'), 2);
      return;
    }

    if (sendRequest) {
      return;
    }

    flowNode
      .webHookTestRequest({
        processId,
        nodeId: selectNodeId,
        method,
        url: sendContent,
        headers: headers.filter(item => item.name),
        body,
        formControls: formControls.filter(item => item.name),
        contentType,
        settings,
      })
      .then(result => {
        if (result.status === 1) {
          this.updateSource({ controls: result.data.controls });
        } else {
          alert(result.msg, 2);
        }

        this.setState({ sendRequest: false });
      });

    this.setState({ sendRequest: true });
  };

  render() {
    const { data } = this.state;
    const types = [
      { text: _l('发送指定数据对象'), value: APP_TYPE.SHEET, otherType: [APP_TYPE.CUSTOM_ACTION] },
      { text: _l('发送自定义请求'), value: APP_TYPE.WEBHOOK },
    ];

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-workflow_webhook"
          bg="BGBlueAsh"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              {types.map((item, i) => {
                return (
                  <div className={cx({ mTop10: i > 0 })} key={i}>
                    <Radio
                      text={item.text}
                      checked={data.appType === item.value || _.includes(item.otherType, data.appType)}
                      onClick={() => this.updateSource({ appType: item.value, body: '', method: 1, selectNodeId: '' })}
                    />
                  </div>
                );
              })}
              {_.includes([APP_TYPE.SHEET, APP_TYPE.CUSTOM_ACTION], data.appType) && this.renderDefaultSource()}
              {data.appType === APP_TYPE.WEBHOOK && this.renderCustomSource()}
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          isCorrect={
            ((data.appType === APP_TYPE.SHEET && data.selectNodeId) || data.appType === APP_TYPE.WEBHOOK) &&
            data.sendContent
          }
          onSave={this.onSave}
          closeDetail={this.props.closeDetail}
        />
      </Fragment>
    );
  }
}
