import React, { Component, Fragment } from 'react';
import { Radio, Textarea, Checkbox } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { checkJSON } from '../../utils';
import { ParameterList, CustomTextarea, KeyPairs } from '../components';
import copy from 'copy-to-clipboard';

const STATUS = {
  NULL: 0,
  POST: 1,
  CUSTOM: 2,
  COMPLETE: 3,
  PAIRS: 4,
};

export default class WebhookContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: props.data.controls.length ? STATUS.COMPLETE : STATUS.NULL,
      count: 0,
      maxCount: 30,
      contentType: !!props.data.returnJson ? 2 : 1,
    };
  }

  componentWillUnmount() {
    clearInterval(this.setInterval);
  }

  /**
   * 轮询获取参数
   */
  loopGetParameter() {
    this.setInterval = setInterval(this.getAppTemplateControls, 6000);
  }

  /**
   * 获取参数
   */
  getAppTemplateControls = () => {
    const { data, processId, updateSource } = this.props;
    const { count, maxCount } = this.state;

    flowNode
      .getAppTemplateControls({ processId, nodeId: data.id, appId: processId, appType: data.appType })
      .then(result => {
        this.setState({ count: count + 1 });

        // 超过次数
        if (count + 1 >= maxCount || result.length) {
          clearInterval(this.setInterval);
        }

        if (result.length) {
          this.setState({ type: STATUS.COMPLETE });
          updateSource({ controls: result });
        }
      });
  };

  /**
   * 提交自定义参数
   */
  postCustomOptions = () => {
    const { data } = this.props;

    if (checkJSON(data.jsonParam)) {
      fetch(data.hookUrl, {
        method: 'POST',
        body: data.jsonParam,
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(() => {
        this.getAppTemplateControls();
      });
    } else {
      alert(_l('验证格式失败，请修改'), 2);
    }
  };

  /**
   * 提交key-value参数
   */
  postKeyValueOptions = () => {
    const { data } = this.props;
    const formData = new FormData();
    const params = data.params.filter(o => !!o.name);

    if (params.length) {
      for (let i = 0; i < params.length; i++) {
        formData.append(params[i].name, params[i].value);
      }

      fetch(data.hookUrl, { method: 'POST', body: formData }).then(() => {
        this.getAppTemplateControls();
      });
    } else {
      alert(_l('请配置key-value参数'), 2);
    }
  };

  render() {
    const { data, updateSource, onSave } = this.props;
    const { type, count, maxCount, contentType } = this.state;
    const overtime = !data.controls.length && count >= maxCount;
    const contentTypes = [
      { text: 'key-value pairs', value: 1 },
      { text: 'JSON', value: 2 },
    ];

    return (
      <Fragment>
        <div className="flowDetailStartHeader flexColumn BGBlueAsh">
          <div className="flowDetailStartIcon flexRow">
            <i className="icon-workflow_webhook Font40 gray" />
          </div>
          <div className="Font16 mTop10">{_l('Webhook')}</div>
        </div>
        <div className="workflowDetailBox mTop20">
          <div className="Font13 bold">{_l('Webhook URL')}</div>
          <div className="Gray_75 mTop5">{_l('我们为您生成了一个用来接收请求的URL')}</div>
          <div className="mTop10 flexRow">
            <input type="text" className="webhookLink flex" value={data.hookUrl} disabled />
            <div
              className="mLeft10 webhookLinkCopy"
              onClick={() => {
                copy(data.hookUrl);
                alert(_l('已复制到剪切板'));
              }}
            >
              {_l('复制链接')}
            </div>
          </div>

          {type === STATUS.NULL && (
            <Fragment>
              <div className="mTop20 bold">{_l('生成参数列表')}</div>
              <div className="Gray_75 mTop5">{_l('系统将根据生成的参数列表来抓取请求中的数据')}</div>
              <div className="mTop15">
                <Radio
                  text={_l('从请求范例生成')}
                  checked={type === STATUS.POST}
                  onClick={() => {
                    this.loopGetParameter();
                    this.setState({ type: STATUS.POST });
                  }}
                />
              </div>
              <div className="Gray_75 mTop5 mLeft30">{_l('请准备一条GET或POST请求')}</div>
              <div className="mTop15">
                <Radio
                  text={_l('从JSON数据范例生成')}
                  checked={type === STATUS.CUSTOM}
                  onClick={() => this.setState({ type: STATUS.CUSTOM })}
                />
              </div>
              <div className="mTop15">
                <Radio
                  text={_l('从key-value pairs生成')}
                  checked={type === STATUS.PAIRS}
                  onClick={() => {
                    this.setState({ type: STATUS.PAIRS });
                    if (!data.params.length) {
                      updateSource({ params: [{ name: '', value: '' }] });
                    }
                  }}
                />
              </div>
            </Fragment>
          )}

          {type === STATUS.POST && (
            <Fragment>
              <div className="mTop20 bold">{_l('从请求范例生成')}</div>
              <div className="Gray_75 mTop5">{_l('请在3分钟内向URL发送一条GET或POST请求')}</div>
              <div
                className="mTop15 workflowDetailDesc"
                style={{ padding: '15px 16px', color: overtime ? '#f44336' : '#2196f3' }}
              >
                {overtime ? _l('当前URL并没有收到任何有效请求，是否重试?') : _l('正在接收请求…')}
              </div>
              <div className="mTop15 flexRow alignItemsCenter">
                <div className="webhookBtn mRight10" onClick={() => this.setState({ type: STATUS.NULL })}>
                  {_l('返回')}
                </div>
                {overtime && (
                  <div
                    className="webhookBtn mRight10"
                    onClick={() => {
                      this.setState({ count: 0 });
                      this.loopGetParameter();
                    }}
                  >
                    {_l('重试')}
                  </div>
                )}
                {data.hooksAll && (
                  <Fragment>
                    <Checkbox
                      className="mLeft10"
                      checked={data.hooksBody}
                      text={_l('生成Body全文参数')}
                      onClick={checked => updateSource({ hooksBody: !checked }, onSave)}
                    />
                    <span
                      className="workflowDetailTipsWidth mLeft5 Gray_75 tip-top"
                      data-tip={_l('勾选后，将会生成一个记录Body全文的文本格式参数')}
                    >
                      <i className="Font14 icon-workflow_help Gray_9e" />
                    </span>
                  </Fragment>
                )}
              </div>
            </Fragment>
          )}

          {type === STATUS.CUSTOM && (
            <Fragment>
              <div className="mTop20 bold">{_l('从JSON数据范例生成')}</div>
              <div className="Gray_75 mTop5">{_l('请提供一个请求数据示例 （JSON格式）')}</div>
              <Textarea
                className="mTop15"
                maxHeight={250}
                minHeight={250}
                value={data.jsonParam}
                onChange={value => {
                  updateSource({ jsonParam: value });
                }}
              />
              <div className="mTop15 flexRow">
                <div className="webhookBtn mRight10" onClick={() => this.setState({ type: STATUS.NULL })}>
                  {_l('返回')}
                </div>
                <div className="webhookBtn mRight10" onClick={this.postCustomOptions}>
                  {_l('下一步')}
                </div>
              </div>
            </Fragment>
          )}

          {type === STATUS.PAIRS && (
            <Fragment>
              <div className="mTop20 bold">{_l('从key-value pairs生成')}</div>
              <KeyPairs
                key={this.props.selectNodeId}
                projectId={this.props.companyId}
                processId={this.props.processId}
                relationId={this.props.relationId}
                selectNodeId={this.props.selectNodeId}
                appId={data.appId}
                source={data.params}
                sourceKey="params"
                formulaMap={data.formulaMap}
                updateSource={updateSource}
                pairsOnlyText
              />
              <div className="mTop15 flexRow">
                <div className="webhookBtn mRight10" onClick={() => this.setState({ type: STATUS.NULL })}>
                  {_l('返回')}
                </div>
                <div className="webhookBtn mRight10" onClick={this.postKeyValueOptions}>
                  {_l('下一步')}
                </div>
              </div>
            </Fragment>
          )}

          {type === STATUS.COMPLETE && (
            <Fragment>
              <div className="mTop20 bold">{_l('参数列表')}</div>
              <div className="Gray_75 mTop5">
                {_l(
                  '系统将根据以下参数列表来抓取请求中的数据。支持将参数设为必填项，此时如果对方的请求中没有附带该参数时，我们将返回错误消息"msg": "参数缺少必填项"。',
                )}
              </div>

              <div className="mTop20 bold">{_l('请求')} Body</div>
              <ParameterList
                data={data.controls}
                controls={data.controls.filter(o => o.enumDefault === 0)}
                showRequired
                updateSource={updateSource}
              />

              {data.hooksAll && (
                <Fragment>
                  <div className="mTop20 bold">{_l('请求')} Params</div>
                  <ParameterList
                    data={data.controls}
                    controls={data.controls.filter(o => o.enumDefault === 1001)}
                    showRequired
                    updateSource={updateSource}
                  />
                  <div className="mTop20 bold">{_l('请求')} Header</div>
                  <ParameterList controls={data.controls.filter(o => o.enumDefault === 1000)} />
                </Fragment>
              )}

              <div className="mTop15 flexRow">
                <div
                  className="webhookBtn"
                  onClick={() => {
                    this.setState({ type: STATUS.NULL });
                    updateSource({ controls: [] }, onSave);
                  }}
                >
                  {_l('修改')}
                </div>
              </div>

              {!data.hooksAll && (
                <Fragment>
                  <div className="mTop20 bold">{_l('自定义返回数据')}</div>
                  <div className="Gray_75 mTop5">
                    {_l('系统默认接受数据后返回')}
                    {'{"status": 1, "data": {"sourceId": "xx", "instanceId": "xx"}, "msg": "成功"}'}
                  </div>
                  <div className="flexRow mTop15">
                    {contentTypes.map((item, i) => {
                      return (
                        <div className="flex" key={i}>
                          <Radio
                            text={item.text}
                            checked={contentType === item.value}
                            onClick={() => {
                              this.setState({ contentType: item.value });
                              updateSource({ returns: [{ name: '', value: '' }], returnJson: '' });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {contentType === 1 ? (
                    <KeyPairs
                      key={this.props.selectNodeId}
                      projectId={this.props.companyId}
                      processId={this.props.processId}
                      relationId={this.props.relationId}
                      selectNodeId={this.props.selectNodeId}
                      appId={data.appId}
                      source={data.returns.length ? data.returns : [{ name: '', value: '' }]}
                      sourceKey="returns"
                      formulaMap={data.formulaMap}
                      updateSource={updateSource}
                    />
                  ) : (
                    <CustomTextarea
                      className="minH100"
                      projectId={this.props.companyId}
                      processId={this.props.processId}
                      relationId={this.props.relationId}
                      selectNodeId={this.props.selectNodeId}
                      sourceAppId={data.appId}
                      type={2}
                      content={data.returnJson}
                      formulaMap={data.formulaMap}
                      onChange={(err, value, obj) => updateSource({ returnJson: value })}
                      updateSource={updateSource}
                    />
                  )}
                </Fragment>
              )}
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }
}
