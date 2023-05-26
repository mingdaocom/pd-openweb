import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown, Icon, RadioGroup } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  SingleControlValue,
  KeyPairs,
  CustomTextarea,
  TestParameter,
  ParameterList,
} from '../components';
import { APP_TYPE, METHODS_TYPE } from '../../enum';
import cx from 'classnames';
import styled from 'styled-components';
import _ from 'lodash';

const Tabs = styled.ul`
  border-bottom: 3px solid #f5f5f5;
  height: 36px;
  margin-top: 10px;
  li {
    border-bottom: 3px solid transparent;
    box-sizing: initial;
    cursor: pointer;
    height: 33px;
    line-height: 33px;
    padding: 0 25px;
    font-weight: bold;
    &:not(.active) {
      border-color: transparent !important;
      color: #333 !important;
    }
  }
`;
export default class Authentication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showParameterList: [],
      tab: '1',
      showTestDialog: false,
      testArray: [],
    };
  }

  testIndex = 0;

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
        if (result.appType === APP_TYPE.OAUTH2 && !result.webHookNodes.length) {
          result.webHookNodes = [
            {
              method: 1,
              url: '',
              params: [{ name: 'app_id', value: '' }, { name: 'app_secret', value: '' }],
              headers: [],
              contentType: 1,
              formControls: [],
              body: '',
              testMap: {},
            },
          ];
        }

        this.setState({ data: result });
        if (this.refreshTime) {
          this.refreshTime.value = result.expireAfterSeconds;
        }
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
    const { name, fields, expireAfterSeconds } = data;
    let { webHookNodes } = data;
    let hasError = false;

    if (data.appType === APP_TYPE.BASIC_AUTH) {
      fields.forEach(o => {
        if (!o.fieldValue && !o.fieldValueId) {
          hasError = true;
        }
      });

      if (hasError) {
        alert(_l('用户名、密码不能为空'), 2);
        return;
      }
    }

    if (data.appType === APP_TYPE.OAUTH2) {
      let hasURLError = false;
      let hasRawError = false;

      webHookNodes.forEach(item => {
        item.params = item.params.filter(o => o.name || o.value);
        item.headers = item.headers.filter(o => o.name || o.value);
        item.formControls = item.formControls.filter(o => o.name || o.value);

        if (!item.url) {
          hasURLError = true;
        }

        if (
          item.params.filter(o => !o.name).length ||
          item.headers.filter(o => !o.name).length ||
          item.formControls.filter(o => !o.name).length
        ) {
          hasError = true;
        }

        if (item.contentType === 2 && !item.body) {
          hasRawError = true;
        }
      });

      if (hasURLError) {
        alert(_l('Access Token URL不能为空'), 2);
        return;
      }

      if (hasError) {
        alert(_l('参数名不能为空'), 2);
        return;
      }
      if (hasRawError) {
        alert(_l('raw(JSON)不能为空'), 2);
        return;
      }
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
          fields,
          webHookNodes,
          expireAfterSeconds,
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
   * 渲染basic auth内容
   */
  renderBasicAuthContent() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font16 bold">{_l('Basic Auth 认证')}</div>
        <div className="mTop5 Gray_9e">{_l('将返回计算后的 Basic Auth 参数供 API 请求参数使用')}</div>
        {data.fields.map((item, i) => {
          const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId) || {};

          return (
            <div key={item.fieldId} className="relative">
              <div className="mTop15 ellipsis Font13 bold">{singleObj.controlName}</div>
              <SingleControlValue
                companyId={this.props.companyId}
                processId={this.props.processId}
                selectNodeId={this.props.selectNodeId}
                isIntegration={this.props.isIntegration}
                sourceNodeId={data.selectNodeId}
                controls={data.controls}
                formulaMap={data.formulaMap}
                fields={data.fields}
                updateSource={this.updateSource}
                item={item}
                i={i}
              />
            </div>
          );
        })}
      </Fragment>
    );
  }

  /**
   * 渲染oauth2内容
   */
  renderOAuth2Content() {
    const { data, showParameterList, tab, showTestDialog, testArray } = this.state;
    const TABS = {
      1: {
        text: 'Params',
        sourceKey: 'params',
        btnText: '+ Query Param',
      },
      2: {
        text: 'Headers',
        sourceKey: 'headers',
        btnText: '+ Header',
      },
      3: {
        text: 'Body',
        sourceKey: 'formControls',
        btnText: '+ Form',
      },
    };

    return (
      <Fragment>
        <div className="Font16 bold">{_l('OAuth 2.0 认证（客户端凭证 client credentials）')}</div>
        <div className="mTop5 Gray_9e">{_l('将返回获取到的 Access Token 值供 API 请求参数使用')}</div>

        <div className="Font13 bold mTop20">{_l('Access Token URL')}</div>
        {data.webHookNodes.map((item, i) => {
          if (_.includes([1, 4, 5], item.method)) {
            delete TABS['3'];
          }

          return (
            <Fragment>
              <div className="flexRow">
                <Dropdown
                  className="flowDropdown mRight10 mTop10"
                  style={{ width: 115 }}
                  data={METHODS_TYPE}
                  value={item.method}
                  border
                  onChange={method => this.updateAjaxParameter({ method: method }, i)}
                />
                <div className="flex">
                  <CustomTextarea
                    processId={this.props.processId}
                    selectNodeId={this.props.selectNodeId}
                    isIntegration={this.props.isIntegration}
                    type={2}
                    height={0}
                    content={item.url}
                    formulaMap={data.formulaMap}
                    onChange={(err, value, obj) => this.updateAjaxParameter({ url: value }, i)}
                    updateSource={this.updateSource}
                  />
                </div>
              </div>

              <div className="flexRow mTop10">
                <div className="flex" />
                <div className="ThemeColor3 ThemeHoverColor2 pointer" onClick={() => this.switchParameterVisible(i)}>
                  {_.includes(showParameterList, i) ? _l('隐藏请求参数详情') : _l('显示请求参数详情')}
                  <Icon
                    type={_.includes(showParameterList, i) ? 'arrow-up-border' : 'arrow-down-border'}
                    className="Font14 mLeft5"
                  />
                </div>
              </div>

              {_.includes(showParameterList, i) && (
                <Fragment>
                  <Tabs className="flexRow">
                    {Object.keys(TABS).map(key => {
                      return (
                        <li
                          key={key}
                          className={cx('ThemeBorderColor3 ThemeColor3', { active: tab === key })}
                          onClick={() => this.setState({ tab: key })}
                        >
                          {TABS[key].text}
                        </li>
                      );
                    })}
                    <li className="flex cursorDefault" />
                  </Tabs>
                  {tab === '3' && (
                    <div className="mTop15">
                      <RadioGroup
                        className="Font12"
                        data={[
                          { text: 'none', value: 0, checked: item.contentType === 0 },
                          { text: 'x-www-form-urlencoded', value: 1, checked: item.contentType === 1 },
                          { text: 'raw(JSON)', value: 2, checked: item.contentType === 2 },
                        ]}
                        onChange={value => {
                          const newObj = { contentType: value };

                          if (value === 0) {
                            newObj.formControls = [];
                            newObj.body = '';
                          } else if (value === 1) {
                            newObj.body = '';
                          } else {
                            newObj.formControls = [];
                          }

                          this.updateAjaxParameter(newObj, i);
                        }}
                      />
                    </div>
                  )}
                  {(_.includes(['1', '2'], tab) || (tab === '3' && item.contentType === 1)) && (
                    <div className="mTop15">
                      <KeyPairs
                        key={this.props.selectNodeId + tab}
                        processId={this.props.processId}
                        selectNodeId={this.props.selectNodeId}
                        isIntegration={this.props.isIntegration}
                        source={item[TABS[tab].sourceKey]}
                        sourceKey={TABS[tab].sourceKey}
                        btnText={TABS[tab].btnText}
                        formulaMap={data.formulaMap}
                        updateSource={(obj, callback = () => {}) => {
                          if (obj.formulaMap) {
                            this.updateSource({ formulaMap: obj.formulaMap }, callback);
                          } else {
                            this.updateAjaxParameter({ [TABS[tab].sourceKey]: obj[TABS[tab].sourceKey] }, i);
                          }
                        }}
                      />
                    </div>
                  )}
                  {tab === '3' && item.contentType === 2 && (
                    <div className="mTop15">
                      <CustomTextarea
                        className="minH100"
                        processId={this.props.processId}
                        selectNodeId={this.props.selectNodeId}
                        isIntegration={this.props.isIntegration}
                        type={2}
                        content={item.body}
                        formulaMap={data.formulaMap}
                        onChange={(err, value, obj) => this.updateAjaxParameter({ body: value }, i)}
                        updateSource={this.updateSource}
                      />
                    </div>
                  )}
                </Fragment>
              )}
            </Fragment>
          );
        })}

        <div className="Font13 bold mTop20">{_l('返回参数列表')}</div>
        <div className="mTop10 Gray_9e">{_l('向 Access Token URL 发送请求并返回参数列表')}</div>

        {!!(data.controls || []).length && (
          <Fragment>
            <ParameterList controls={data.controls} />
            <div className="mTop20 Gray_9e">{_l('重新发送请求获取 Acess Token')}</div>
          </Fragment>
        )}

        <div className="mTop15 webhookBtn InlineBlock" onClick={this.test}>
          {_l('获取 Access Token')}
        </div>

        <div className="Font13 bold mTop20">{_l('Access Token 过期时间')}</div>
        <div className="mTop10 Gray_9e">
          {_l('系统将依据这里的时长设置来判断自动刷新 Access Token 的频率，为 0 则不自动刷新')}
        </div>

        <div className="mTop15 flexRow alignItemsCenter">
          <input
            type="text"
            className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
            style={{ width: 115 }}
            ref={refreshTime => {
              this.refreshTime = refreshTime;
            }}
            defaultValue={data.expireAfterSeconds}
            onKeyUp={evt => this.checkNumberControl(evt)}
            onPaste={evt => this.checkNumberControl(evt)}
            onBlur={evt => this.checkNumberControl(evt, true)}
          />
          <div className="flex mLeft10">{_l('秒')}</div>
        </div>

        {showTestDialog && (
          <TestParameter
            title={_l('编辑 Access Token 测试数据')}
            onOk={this.send}
            onClose={() => this.setState({ showTestDialog: false })}
            testArray={testArray}
            formulaMap={data.formulaMap}
            testMap={data.webHookNodes[this.testIndex].testMap}
          />
        )}
      </Fragment>
    );
  }

  /**
   * 更新请求参数
   */
  updateAjaxParameter(obj, i) {
    const { data } = this.state;
    const webHookNodes = _.cloneDeep(data.webHookNodes);

    Object.keys(obj).map(key => {
      if (key === 'method' && _.includes([1, 4, 5], obj[key])) {
        webHookNodes[i].contentType = 1;
        webHookNodes[i].formControls = [];
        webHookNodes[i].body = '';
      }

      webHookNodes[i][key] = obj[key];
    });

    this.updateSource({ webHookNodes });
  }

  /**
   * 显示隐藏参数详情
   */
  switchParameterVisible(i) {
    const { showParameterList } = this.state;

    if (_.includes(showParameterList, i)) {
      _.remove(showParameterList, index => index === i);
    } else {
      showParameterList.push(i);
    }

    this.setState({ showParameterList });
  }

  /**
   * 测试
   */
  test = () => {
    const { data } = this.state;
    const { url, params, headers, formControls, body } = data.webHookNodes[this.testIndex];
    const testArray = _.uniq(
      (url + JSON.stringify(params) + JSON.stringify(headers) + JSON.stringify(formControls) + body).match(
        /\$[^ \r\n]+?\$/g,
      ) || [],
    );

    if (!testArray.length) {
      this.send();
    } else {
      this.setState({
        showTestDialog: true,
        testArray,
      });
    }
  };

  /**
   * 发送
   */
  send = (testMap = {}) => {
    const { processId, selectNodeId } = this.props;
    const { data, sendRequest } = this.state;
    const { method, url, params, headers, body, formControls, contentType } = data.webHookNodes[this.testIndex];

    this.setState({ showTestDialog: false });

    if (!url) {
      alert(_l('Access Token URL'), 2);
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
          url: this.formatParameters(url, testMap),
          params: JSON.parse(this.formatParameters(JSON.stringify(params.filter(item => item.name)), testMap)),
          headers: JSON.parse(this.formatParameters(JSON.stringify(headers.filter(item => item.name)), testMap)),
          body: this.formatParameters(body, testMap),
          formControls: formControls.filter(item => item.name),
          contentType,
        },
        { isIntegration: this.props.isIntegration },
      )
      .then(result => {
        if (result.status === 1) {
          this.updateSource({ controls: result.data.controls }, () => {
            this.updateAjaxParameter({ testMap }, this.testIndex);
          });
        } else {
          this.updateAjaxParameter({ testMap }, this.testIndex);
          alert(result.msg || _l('请求异常'), 2);
        }

        this.setState({ sendRequest: false });
      });

    this.setState({ sendRequest: true });
  };

  /**
   * 格式化参数
   */
  formatParameters = (source, testMap) => {
    (source.match(/\$[^ \r\n]+?\$/g) || []).forEach(key => {
      source = source.replace(key, testMap[key] || '');
    });

    return source;
  };

  /**
   * 验证数值控件
   */
  checkNumberControl(evt, isBlur) {
    let num = evt.target.value.replace(/[^\d]/g, '');

    evt.target.value = num;

    if (isBlur) {
      num = parseInt(num || '0');

      if (num > 604800) {
        num = 604800;
      }

      evt.target.value = num;
      this.updateSource({ expireAfterSeconds: num });
    }
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
          icon="icon-key1"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              {data.appType === APP_TYPE.BASIC_AUTH && this.renderBasicAuthContent()}
              {data.appType === APP_TYPE.OAUTH2 && this.renderOAuth2Content()}
            </div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect onSave={this.onSave} />
      </Fragment>
    );
  }
}
