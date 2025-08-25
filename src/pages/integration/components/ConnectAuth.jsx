import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Checkbox, Dropdown, Icon, LoadDiv, Support } from 'ming-ui';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import Oauth2Ajax from 'src/pages/workflow/api/oauth2';
import { renderValue } from 'src/pages/integration/apiIntegration/util';
import LogDrawer from 'src/pages/integration/components/LogDrawer';
import { TYPELIST } from 'src/pages/integration/config';
import { CardTopWrap } from '../apiIntegration/style';

const Wrap = styled.div`
  p {
    margin: 0;
  }
  .Bold400 {
    font-weight: 400;
  }
  .Green_right {
    color: #4caf50;
  }
  .iconCon {
    width: 44px;
    height: 44px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    position: relative;
    text-align: center;
    line-height: 50px;
  }
  width: 880px;
  margin: 0 auto;
  background: #ffffff;
  // border: 1px solid #dddddd;
  border-radius: 10px;
  .con {
    padding: 20px 24px;
    .title {
      width: 130px;
      padding-right: 20px;
    }
  }
  .workflowSettings {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
  .line {
    padding: 10px 0;
    border-bottom: 1px solid #f2f2f2;
  }
  .btn {
    &.disable {
      background: #f5f5f5;
      color: #bdbdbd;
      border: 1px solid #bdbdbd;
    }
  }
  .actionControlBox {
    height: 34px;
    line-height: 34px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    min-width: 100px;
    box-sizing: initial;
    font-size: 13px;
  }
  .actionControlBox:not(:hover):not(:focus):not(.errorBorder):not(.actionClearBorder),
  .actionControlBox:not(.ThemeBorderColor3) {
    border-color: #ddd !important;
  }
  .showRefreshLogBtn {
    padding: 0 10px;
    &:hover {
      border-color: #1677ff !important;
    }
  }
`;

//连接鉴权设置
function ConnectAuth(props) {
  const [{ node, showEdit, loading, showRefreshLog, tokenLoading }, setState] = useSetState({
    showEdit: false,
    node: props.node || {},
    loading: true,
    showRefreshLog: false,
    tokenLoading: false,
  });
  const testIndex = 0;
  const [Component, setComponent] = useState(null);
  const refreshTime = useRef(null);

  useEffect(() => {
    getNodeInfo();
  }, []);

  useEffect(() => {
    if (showEdit && !Component) {
      import('src/pages/workflow/WorkflowSettings/Detail').then(component => {
        setComponent(component.default);
      });
    }
  }, [showEdit]);

  // 获取连接详情
  const getInfo = () => {
    if (!node || !node.id) {
      return;
    }
    Promise.all([
      flowNodeAjax.get({ processId: props.connectId }, { isIntegration: true }),
      flowNodeAjax.getNodeDetail(
        { processId: props.id, nodeId: node.id, flowNodeType: node.typeId },
        { isIntegration: true },
      ),
    ]).then(res => {
      //更新鉴权认证节点
      const list = _.toArray((res[0] || {}).flowNodeMap || {});
      setState({
        node: {
          ...node,
          ...(list.find(o => o.typeId === 22) || {}),
          ...res[1],
        },
      });
    });
  };
  const getNodeInfo = () => {
    flowNodeAjax
      .getNodeDetail(
        {
          processId: props.id,
          nodeId: node.id,
          flowNodeType: node.typeId,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({ node: { ...node, ...res }, loading: false });
      });
  };

  const renderList = fields => {
    return (
      <div className="flexRow mBottom20">
        <div className="title Gray_75">{_l('可用返回参数')}</div>
        <div className="txt flex">
          <div className="flexRow line">
            <div className="flex Gray_9e">{_l('参数名')}</div>
            <div className="flex Gray_9e">{_l('参考值')}</div>
          </div>
          {fields.map(o => {
            return (
              <div className="flexRow line">
                <div className="flex WordBreak">{o.controlName}</div>
                <div className="flex WordBreak">{o.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const renderBasic = () => {
    if (!node.appId) {
      //还未配置过
      return;
    }
    return (
      <div className="con">
        <div className="flexRow mBottom20">
          <div className="title Gray_75">{_l('鉴权方式')}</div>
          <div className="txt flex">
            <span>{TYPELIST.find(o => o.appType === node.appType).name}</span>
          </div>
        </div>
        <div className="">
          <div className="flexRow mBottom20">
            <div className="title Gray_75">{_l('Basic Auth 参数')}</div>
            <div className="txt flex">
              {/* 密码 账号必须都填才行 */}
              {(node.fields || []).filter(o => !!o.fieldValue).length >= 2 ? (
                <span>{_l('已获取')}</span>
              ) : (
                <span class="Red">{_l('未获取')}</span>
              )}
            </div>
          </div>
          {(node.fields || []).length > 0 &&
            node.appId &&
            renderList([
              //后端说写死
              {
                controlId: 'basicAuth',
                controlName: 'Basic Auth 参数',
                type: 2,
                hide: false,
                value: '************ (隐藏)',
              },
            ])}
        </div>
      </div>
    );
  };

  const updateSource = obj => {
    flowNodeAjax
      .saveNode(
        {
          processId: props.id,
          nodeId: node.id,
          flowNodeType: node.typeId,
          ..._.pick(node, ['webHookNodes', 'expireAfterSeconds', 'name']),
          ...obj,
        },
        { isIntegration: true },
      )
      .then(() => {
        setState({ node: { ...node, ...obj } });
      });
  };
  const checkNumberControl = (evt, isBlur) => {
    let num = evt.target.value.replace(/[^\d]/g, '');
    evt.target.value = num;
    if (isBlur) {
      num = parseInt(num || '0');
      if (num > 2628000) {
        num = 2628000;
      }
      evt.target.value = num;
      updateSource({ expireAfterSeconds: num });
    }
  };

  const updateAjaxParameter = (obj, i, isBlur) => {
    const webHookNodes = _.cloneDeep(node.webHookNodes);
    Object.keys(obj).map(key => {
      if (key === 'method' && _.includes([1, 4, 5], obj[key])) {
        webHookNodes[i].contentType = 1;
        webHookNodes[i].formControls = [];
        webHookNodes[i].body = '';
      }
      webHookNodes[i][key] = obj[key];
    });
    setState({ node: { ...node, webHookNodes } });
    if (isBlur) {
      updateSource({ webHookNodes });
    }
  };

  const updateTokenRefreshValue = (evt, key, isBlur = false) => {
    let value = evt.target.value;
    if (isBlur) {
      value = value.trim();
    }
    updateAjaxParameter(
      { retryControls: [{ ..._.get(node.webHookNodes[testIndex], 'retryControls[0]'), [key]: value }] },
      testIndex,
      isBlur,
    );
  };

  const renderTokenRefreshCondition = () => {
    const refreshType = _.get(node.webHookNodes[testIndex], 'retryControls[0].type');
    const refreshName = _.get(node.webHookNodes[testIndex], 'retryControls[0].name') || '';
    const refreshValue = _.get(node.webHookNodes[testIndex], 'retryControls[0].value') || '';

    return (
      <Fragment>
        <div className="Font13 mTop25">
          <Checkbox
            className="InlineBlock bold"
            text={_l('配置 Access Token 刷新条件')}
            checked={!!refreshType}
            onClick={checked =>
              updateAjaxParameter(
                checked ? { retryControls: [] } : { retryControls: [{ type: 10001, name: '', value: '' }] },
                testIndex,
                true,
              )
            }
          />
        </div>
        <div className="Font13 mTop5 Gray_75">{_l('根据 API 状态码/错误码，设置判断刷新Access Token的条件')}</div>

        {!!(node.webHookNodes[testIndex].retryControls || []).length && (
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
                updateAjaxParameter({ retryControls: [{ type: value, name: '', value: '' }] }, testIndex, true)
              }
            />
            {refreshType === 10002 && (
              <input
                type="text"
                className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mRight10"
                style={{ width: 180 }}
                placeholder={_l('请输入错误码字段名称，如 code')}
                value={refreshName}
                onChange={evt => updateTokenRefreshValue(evt, 'name')}
                onBlur={evt => updateTokenRefreshValue(evt, 'name', true)}
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
              onChange={evt => updateTokenRefreshValue(evt, 'value')}
              onBlur={evt => updateTokenRefreshValue(evt, 'value', true)}
            />
          </div>
        )}
      </Fragment>
    );
  };

  const onGetRefreshTokenLogs = () => {
    if (tokenLoading) return;
    setState({ tokenLoading: true });
    Oauth2Ajax.refreshClientCredentials(
      {
        id: props.id,
      },
      { isIntegration: true },
    ).then(res => {
      if (res) {
        alert(_l('刷新成功'));
      } else {
        alert(_l('刷新失败'), 2);
      }
      setState({ tokenLoading: false });
    });
  };

  const renderOAuth = () => {
    if ((node.webHookNodes || []).length <= 0) {
      return '';
    }
    return (
      <div className="con">
        <div className="flexRow mBottom20">
          <div className="title Gray_75">{_l('鉴权方式')}</div>
          <div className="txt flex">
            <span>{TYPELIST.find(o => o.appType === node.appType).name}</span>
          </div>
        </div>
        <div className="">
          <div className="flexRow mBottom20">
            <div className="title Gray_75">Access Token URL</div>
            <div className="txt flex WordBreak">{renderValue(node.webHookNodes[testIndex].url, node)}</div>
          </div>
          {props.forIntegration ? (
            <Fragment>
              <div className="Font13 bold mTop20">{_l('Access Token 过期时间')}</div>
              <div className="mTop10 Gray_75">
                {_l('系统将依据这里的时长设置来判断自动刷新 Access Token 的频率，为 0 则不自动刷新')}
              </div>
              <div className="mTop15 flexRow alignItemsCenter">
                <input
                  type="text"
                  className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
                  style={{ width: 115 }}
                  ref={refreshTime}
                  defaultValue={node.expireAfterSeconds}
                  onKeyUp={evt => checkNumberControl(evt)}
                  onPaste={evt => checkNumberControl(evt)}
                  onBlur={evt => checkNumberControl(evt, true)}
                />
                <div className="flex mLeft10">{_l('秒')}</div>
              </div>
              {renderTokenRefreshCondition()}
              <div className="mTop10 mBottom10">
                <Button
                  type="ghostgray"
                  className="showRefreshLogBtn"
                  onClick={() => setState({ showRefreshLog: true })}
                >
                  {_l('查看日志')}
                </Button>
                <Button type="ghostgray" className="mLeft10 showRefreshLogBtn" onClick={onGetRefreshTokenLogs}>
                  {tokenLoading ? (
                    <div className="flexRow alignItemsCenter">
                      <LoadDiv size="small" className="mRight5 mTop5" />
                      {_l('刷新中')}
                    </div>
                  ) : (
                    _l('刷新 token')
                  )}
                </Button>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              {/* 安装的连接  OAuth不显示 Access Token和返回参数 */}
              {props.connectType !== 2 && (
                <div className="flexRow mBottom20">
                  <div className="title Gray_75">Access Token</div>
                  <div className="txt flex">
                    {(node.controls || []).length > 0 ? (
                      <span>{_l('已获取')}</span>
                    ) : (
                      <span class="Red">{_l('未获取')}</span>
                    )}
                  </div>
                </div>
              )}
              <div className="flexRow mBottom20">
                <div className="title Gray_75">{_l('过期时间')}</div>
                <div className="txt flex">
                  {node.expireAfterSeconds} {_l('秒')}
                </div>
              </div>
              {props.connectType !== 2 && (node.controls || []).length > 0 && renderList(node.controls)}
            </Fragment>
          )}
        </div>
      </div>
    );
  };
  if (loading) {
    return <LoadDiv />;
  }
  const tipsRender = () => {
    if (node.appType === 31) {
      return node.appId ? (
        (node.fields || []).filter(o => !!o.fieldValue).length >= 2 ? (
          <Icon icon="check_circle" className="Green_right tip" />
        ) : (
          <Icon icon="error1" className="Red tip" />
        )
      ) : (
        ''
      );
    } else {
      if ((node.webHookNodes || []).length <= 0) {
        return;
      }
      return (node.controls || []).length > 0 ? (
        !!node && <Icon icon="check_circle" className="Green_right tip" />
      ) : (
        <Icon icon="error1" className="Red tip" />
      );
    }
  };
  const renderBtn = () => {
    let str = '';
    if (node.appType !== 31) {
      str = !node.controls ? _l('开始配置') : _l('修改配置');
    } else {
      str = (node.fields || []).filter(o => !!o.fieldValue).length <= 0 ? _l('开始配置') : _l('修改配置');
    }
    return (
      <div
        className="btn Hand"
        onClick={() => {
          setState({
            showEdit: true,
          });
        }}
      >
        {str}
      </div>
    );
  };

  return (
    <Wrap className={props.className}>
      <CardTopWrap className="flexRow">
        <div className={cx('iconCon')}>
          {tipsRender()}
          <Icon icon="key1" className="iconParam Font24" />
        </div>
        <div className="flex pLeft16">
          <p className="Font17 Bold">{node.appType === 31 ? _l('Basic Auth 鉴权认证') : _l('OAuth 鉴权认证')}</p>
          <p className="Font13 Gray_75 mTop4">
            <span className="TxtMiddle">{_l('配置发送 API 请求时采用的鉴权认证方式')}</span>
            <Support
              href={
                node.appType === 31
                  ? 'https://help.mingdao.com/integration/api#basic-auth'
                  : 'https://help.mingdao.com/integration/api#oauth'
              }
              type={3}
              text={_l('使用帮助')}
            />
          </p>
        </div>
        {/*安装的连接  只能在OAuth2获取AccessToken  */}
        {props.canEdit && props.connectType === 2 && node.appType !== 31
          ? ''
          : props.canEdit && props.connectType !== 2 && renderBtn()}
      </CardTopWrap>
      {node && node.appType === 31 ? renderBasic() : renderOAuth()}
      {showEdit && props.canEdit && Component && (
        <div className="workflowSettings">
          <Component
            companyId={localStorage.getItem('currentProjectId')}
            processId={props.id}
            relationId={props.relationId}
            relationType={props.relationType}
            selectNodeId={node.id} //gengxindonghua
            selectNodeType={node.typeId}
            closeDetail={() => setState({ showEdit: false })}
            hasAuth={props.hasAuth}
            customNodeName={_l('鉴权方式')}
            isIntegration
            updateNodeData={() => {
              getInfo();
            }}
          />
        </div>
      )}
      {showRefreshLog && (
        <LogDrawer
          {...props}
          showRefreshLog={showRefreshLog}
          processId={props.id}
          onClose={() => setState({ showRefreshLog: false })}
        />
      )}
    </Wrap>
  );
}

export default ConnectAuth;
