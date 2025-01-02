import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown, Icon, RadioGroup, Checkbox } from 'ming-ui';
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
import { ACTION_ID, APP_TYPE, METHODS_TYPE } from '../../enum';
import cx from 'classnames';
import styled from 'styled-components';
import _ from 'lodash';
import { formatTestParameters } from '../../utils';

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
      color: #151515 !important;
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
    const { processId, selectNodeId, selectNodeType, isIntegration, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId }, { isIntegration })
      .then(result => {
        if (result.appType === APP_TYPE.OAUTH2 && !result.webHookNodes.length) {
          result.webHookNodes = [
            {
              method: 1,
              url: '',
              params: [
                { name: 'app_id', value: '' },
                { name: 'app_secret', value: '' },
              ],
              headers: [],
              contentType: 1,
              formControls: [],
              body: '',
              testMap: {},
              retryControls: [],
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
    let { webHookNodes = [] } = data;
    const retryControl = _.get(webHookNodes[this.testIndex], 'retryControls[0]');
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

    if (retryControl) {
      if (!retryControl.value || (retryControl.type === 10002 && !retryControl.name)) {
        alert(_l('请完善刷新条件'), 2);
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
        <div className="mTop5 Gray_75">{_l('将返回计算后的 Basic Auth 参数供 API 请求参数使用')}</div>
        {data.fields.map((item, i) => {
          const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId) || {};

          return (
            <div key={item.fieldId} className="relative">
              <div className="mTop15 ellipsis Font13 bold">{singleObj.controlName}</div>
              <SingleControlValue
                companyId={this.props.companyId}
                processId={this.props.processId}
                relationId={this.props.relationId}
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
    const { isIntegration, hasAuth } = this.props;
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
        {_.includes([ACTION_ID.CREDENTIALS, ACTION_ID.REFRESH_CREDENTIALS], data.actionId) ? (
          <Fragment>
            <div className="Font16 bold">{_l('OAuth 2.0 认证（授权码）')}</div>
            <div className="mTop5 Gray_75">
              {data.actionId === ACTION_ID.CREDENTIALS
                ? _l('根据 code 获取access_token')
                : _l('根据 Refresh token 刷新 Access Token')}
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <div className="Font16 bold">{_l('OAuth 2.0 认证（客户端凭证 client credentials）')}</div>
            <div className="mTop5 Gray_75">{_l('将返回获取到的 Access Token 值供 API 请求参数使用')}</div>
          </Fragment>
        )}

        <div className="Font13 bold mTop20">
          {data.actionId === ACTION_ID.REFRESH_CREDENTIALS ? _l('Refresh Token URL') : _l('Access Token URL')}
        </div>
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
                  data={METHODS_TYPE.filter(o => !o.disabled)}
                  value={item.method === 4 ? 14 : item.method}
                  border
                  onChange={method => this.updateAjaxParameter({ method: method }, i)}
                />
                <div className="flex minWidth0">
                  <CustomTextarea
                    projectId={this.props.companyId}
                    processId={this.props.processId}
                    relationId={this.props.relationId}
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
                          // { text: 'none', value: 0, checked: item.contentType === 0 },
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
                        projectId={this.props.companyId}
                        processId={this.props.processId}
                        relationId={this.props.relationId}
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
                        projectId={this.props.companyId}
                        processId={this.props.processId}
                        relationId={this.props.relationId}
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

        {data.actionId === ACTION_ID.CREDENTIALS ? (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('返回 Access Token 值')}</div>
            <div className="mTop10 Gray_75">{_l('向 Access Token URL 发送请求并接收返回值')}</div>
          </Fragment>
        ) : (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('返回参数列表')}</div>
            <div className="mTop10 Gray_75">{_l('向 Access Token URL 发送请求并返回参数列表')}</div>
          </Fragment>
        )}

        {!!(data.controls || []).length && (
          <Fragment>
            <ParameterList controls={data.controls} />
            <div className="mTop20 Gray_75">{_l('重新发送请求获取 Access Token')}</div>
          </Fragment>
        )}

        <div className="mTop15 webhookBtn InlineBlock" onClick={this.test}>
          {_l('获取 Access Token')}
        </div>

        {(!hasAuth || (hasAuth && data.actionId !== ACTION_ID.CREDENTIALS)) && (
          <Fragment>
            <div className="Font13 bold mTop20">
              {data.actionId === ACTION_ID.REFRESH_CREDENTIALS ? _l('自动刷新频率') : _l('Access Token 过期时间')}
            </div>
            <div className="mTop10 Gray_75">
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

            {isIntegration && data.appType === APP_TYPE.OAUTH2 && this.renderTokenRefreshCondition()}
          </Fragment>
        )}

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
          url: formatTestParameters(url, testMap),
          params: JSON.parse(formatTestParameters(JSON.stringify(params.filter(item => item.name)), testMap)),
          headers: JSON.parse(formatTestParameters(JSON.stringify(headers.filter(item => item.name)), testMap)),
          body: formatTestParameters(body, testMap),
          formControls: JSON.parse(
            formatTestParameters(JSON.stringify(formControls.filter(item => item.name)), testMap),
          ),
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

  /**
   * 渲染token刷新条件
   */
  renderTokenRefreshCondition() {
    const { data } = this.state;
    const refreshType = _.get(data.webHookNodes[this.testIndex], 'retryControls[0].type');
    const refreshName = _.get(data.webHookNodes[this.testIndex], 'retryControls[0].name') || '';
    const refreshValue = _.get(data.webHookNodes[this.testIndex], 'retryControls[0].value') || '';

    return (
      <Fragment>
        <div className="Font13 mTop25">
          <Checkbox
            className="InlineBlock bold"
            text={_l('配置 Access Token 刷新条件')}
            checked={!!refreshType}
            onClick={checked =>
              this.updateAjaxParameter(
                checked ? { retryControls: [] } : { retryControls: [{ type: 10001, name: '', value: '' }] },
                this.testIndex,
              )
            }
          />
        </div>
        <div className="Font13 mTop5 Gray_75">{_l('根据 API 状态码/错误码，设置判断刷新Access Token的条件')}</div>

        {!!(data.webHookNodes[this.testIndex].retryControls || []).length && (
          <div className="flexRow mTop10">
            <Dropdown
              className="flowDropdown mRight10"
              style={{ width: 115 }}
              data={[
                { text: _l('状态码'), value: 10001 },
                { text: _l('错误码'), value: 10002 },
              ]}
              value={refreshType}
              border
              onChange={value =>
                this.updateAjaxParameter({ retryControls: [{ type: value, name: '', value: '' }] }, this.testIndex)
              }
            />

            {refreshType === 10002 && (
              <input
                type="text"
                className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mRight10"
                style={{ width: 180 }}
                placeholder={_l('请输入错误码字段名称，如 code')}
                value={refreshName}
                onChange={evt => this.updateTokenRefreshValue(evt, 'name')}
                onBlur={evt => this.updateTokenRefreshValue(evt, 'name', true)}
              />
            )}

            <input
              type="text"
              className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
              placeholder={
                refreshType === 10001
                  ? _l('请输入指定刷新 token 的 HTTP 状态码，如：400,401(多个状态码用英文逗号隔开)')
                  : _l('请输入指定错误码，如：400,401(多个状态码用英文逗号隔开)')
              }
              value={refreshValue}
              onChange={evt => this.updateTokenRefreshValue(evt, 'value')}
              onBlur={evt => this.updateTokenRefreshValue(evt, 'value', true)}
            />
          </div>
        )}
      </Fragment>
    );
  }

  /**
   * 更新token刷新值
   */
  updateTokenRefreshValue = (evt, key, isBlur = false) => {
    const { data } = this.state;
    let value = evt.target.value;

    if (isBlur) {
      value = value.trim();
    }

    this.updateAjaxParameter(
      { retryControls: [{ ..._.get(data.webHookNodes[this.testIndex], 'retryControls[0]'), [key]: value }] },
      this.testIndex,
    );
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
          icon="icon-key1"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex">
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
