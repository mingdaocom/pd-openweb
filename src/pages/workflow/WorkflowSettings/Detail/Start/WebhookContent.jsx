import React, { Component, Fragment } from 'react';
import { Radio, Textarea } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { checkJSON } from '../../utils';
import { ParameterList, CustomTextarea } from '../components';
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
      fetch(data.hookUrl, { method: 'POST', body: data.jsonParam }).then(() => {
        this.getAppTemplateControls();
      });
    } else {
      alert(_l('验证格式失败，请修改'), 2);
    }
  };

  /**
   * 渲染键值对
   */
  renderKeyValues(key, source) {
    const { data, updateSource } = this.props;

    return (
      <Fragment>
        {source.map((item, i) => {
          return (
            <Fragment key={this.props.selectNodeId + i}>
              <div className={i === 0 ? 'mTop10' : 'mTop20'}>
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
                  {key === 'params' ? (
                    <Textarea
                      className="mTop10"
                      maxHeight={250}
                      minHeight={0}
                      style={{ paddingTop: 6, paddingBottom: 6 }}
                      placeholder={_l('参考value')}
                      value={item.value}
                      onChange={value => {
                        this.updateKeyValues(key, 'value', value, i);
                      }}
                    />
                  ) : (
                    <CustomTextarea
                      processId={this.props.processId}
                      selectNodeId={this.props.selectNodeId}
                      sourceAppId={data.appId}
                      type={2}
                      height={0}
                      content={item.value}
                      formulaMap={data.formulaMap}
                      onChange={(err, value, obj) => this.updateKeyValues(key, 'value', value, i)}
                      updateSource={updateSource}
                    />
                  )}
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
            onClick={() => updateSource({ [key]: source.concat({ name: '', value: '' }) })}
          >
            + key-value pairs
          </span>
        </div>
      </Fragment>
    );
  }

  /**
   * 添加key参数
   */
  updateKeyValues(key, keyName, value, i) {
    const { data, updateSource } = this.props;
    let items = _.cloneDeep(data[key]);

    if (!items[i]) items[i] = {};

    items[i][keyName] = value;
    updateSource({ [key]: items });
  }

  /**
   * 删除参数
   */
  deleteKeys(key, i) {
    const { data, updateSource } = this.props;
    const items = _.cloneDeep(data[key]);

    _.remove(items, (obj, index) => index === i);
    updateSource({ [key]: items });
  }

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
    const contentTypes = [{ text: 'key-value pairs', value: 1 }, { text: 'JSON', value: 2 }];

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
              <div className="mTop20 bold">{_l('从请求范例生成参数列表')}</div>
              <div className="Gray_75 mTop5">{_l('请在3分钟内向URL发送一条GET或POST请求')}</div>
              <div
                className="mTop15 workflowDetailDesc"
                style={{ padding: '15px 16px', color: overtime ? '#f44336' : '#2196f3' }}
              >
                {overtime ? _l('当前URL并没有收到任何有效请求，是否重试?') : _l('正在接收请求…')}
              </div>
              <div className="mTop15 flexRow">
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
              {this.renderKeyValues('params', data.params)}
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

              <ParameterList controls={data.controls} showRequired updateSource={updateSource} />

              <div className="mTop15 flexRow">
                <div
                  className="webhookBtn"
                  onClick={() => {
                    this.setState({ type: STATUS.NULL });
                    updateSource({ controls: [] });
                    onSave();
                  }}
                >
                  {_l('修改')}
                </div>
              </div>

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
                this.renderKeyValues('returns', data.returns.length ? data.returns : [{ name: '', value: '' }])
              ) : (
                <CustomTextarea
                  className="minH100"
                  processId={this.props.processId}
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
        </div>
      </Fragment>
    );
  }
}
