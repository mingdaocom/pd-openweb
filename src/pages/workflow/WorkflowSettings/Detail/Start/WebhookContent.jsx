import React, { Component, Fragment } from 'react';
import { Radio, Textarea } from 'ming-ui';
import Clipboard from 'clipboard';
import flowNode from '../../../api/flowNode';
import { checkJSON } from '../../utils';
import { ParameterList } from '../components';

const STATUS = {
  NULL: 0,
  POST: 1,
  CUSTOM: 2,
  COMPLETE: 3,
};

export default class WebhookContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: props.data.controls.length ? STATUS.COMPLETE : STATUS.NULL,
      count: 0,
      maxCount: 30,
      value: '',
    };
  }

  componentDidMount() {
    const { data } = this.props;

    this.clipboard = new Clipboard('.webhookLinkCopy', {
      text: () => data.hookUrl,
    });

    this.clipboard.on('success', () => {
      alert(_l('已复制到剪切板'));
    });
  }

  componentWillUnmount() {
    clearInterval(this.setInterval);
    this.clipboard.destroy();
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
    const { value } = this.state;

    if (checkJSON(value)) {
      fetch(data.hookUrl, { method: 'POST', body: value }).then(() => {
        this.getAppTemplateControls();
      });
    } else {
      alert(_l('验证格式失败，请修改'), 2);
    }
  };

  render() {
    const { data, updateSource, onSave } = this.props;
    const { type, count, maxCount } = this.state;
    const overtime = !data.controls.length && count >= maxCount;

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
            <div className="webhookLink flex">{data.hookUrl}</div>
            <div className="mLeft10 webhookLinkCopy">{_l('复制链接')}</div>
          </div>

          {type === STATUS.NULL && (
            <Fragment>
              <div className="mTop20 bold">{_l('配置参数列表')}</div>
              <div className="Gray_75 mTop5">{_l('系统将根据配置的参数列表来抓取请求中的数据')}</div>
              <div className="mTop15">
                <Radio
                  text={_l('已发送请求范例')}
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
                  text={_l('自定义参数列表')}
                  checked={type === STATUS.CUSTOM}
                  onClick={() => this.setState({ type: STATUS.CUSTOM })}
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
              <div className="mTop20 bold">{_l('自定义参数列表')}</div>
              <div className="Gray_75 mTop5">{_l('请提供一个请求数据示例 （JSON格式）')}</div>
              <Textarea
                className="mTop15"
                maxHeight={250}
                minHeight={250}
                onChange={value => {
                  this.setState({ value });
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

          {type === STATUS.COMPLETE && (
            <Fragment>
              <div className="mTop20 bold">{_l('参数列表')}</div>
              <div className="Gray_75 mTop5">{_l('我们获取了一组参数列表')}</div>

              <ParameterList controls={data.controls} />

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
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }
}
