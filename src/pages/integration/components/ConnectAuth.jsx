import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Support, LoadDiv } from 'ming-ui';
import { useSetState } from 'react-use';
import { CardTopWrap } from '../apiIntegration/style';
import Detail from 'src/pages/workflow/WorkflowSettings/Detail';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import { TYPELIST } from 'src/pages/integration/config';
import axios from 'axios';
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
`;

//连接鉴权设置
function ConnectAuth(props) {
  const [{ node, isErr, showEdit, loading }, setState] = useSetState({
    isErr: false,
    showEdit: false,
    node: props.node || {},
    loading: true,
  });
  useEffect(() => {
    getNodeInfo();
  }, []);
  // 获取连接详情
  const getInfo = () => {
    if (!node || !node.id) {
      return;
    }
    axios
      .all([
        flowNodeAjax.get(
          {
            processId: props.connectId,
          },
          { isIntegration: true },
        ),
        flowNodeAjax.getNodeDetail(
          {
            processId: props.id,
            nodeId: node.id,
            flowNodeType: node.typeId,
          },
          { isIntegration: true },
        ),
      ])
      .then(res => {
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
            <div className="txt flex WordBreak">{node.webHookNodes[0].url}</div>
          </div>
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
          <Icon icon="check_circle1" className="Green_right tip" />
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
        !!node && <Icon icon="check_circle1" className="Green_right tip" />
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
      {showEdit && props.canEdit && (
        <div className="workflowSettings">
          <Detail
            companyId={localStorage.getItem('currentProjectId')}
            processId={props.id}
            relationId={props.relationId}
            relationType={props.relationType}
            selectNodeId={node.id} //gengxindonghua
            selectNodeType={node.typeId}
            closeDetail={() => {
              setState({
                showEdit: false,
              });
            }}
            hasAuth={props.hasAuth}
            customNodeName={_l('鉴权方式')}
            isIntegration
            updateNodeData={data => {
              getInfo();
            }}
          />
        </div>
      )}
    </Wrap>
  );
}

export default ConnectAuth;
