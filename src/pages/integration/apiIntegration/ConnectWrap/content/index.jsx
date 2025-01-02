import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import ConnectSet from './ConnectSet';
import APIList from './APIList';
import AccountList from './AccountList';
import AuthorizeToApp from './AuthorizeToApp';
import { TYPELIST } from 'src/pages/integration/config.js';
import { Radio } from 'ming-ui';
import { useSetState } from 'react-use';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';

const Wrap = styled.div``;
export default function Info(props) {
  const { onChangeSate, getInfo, getDetailInfo, setDefaultFlowNode } = props;
  const [
    {
      connectData,
      nodeInfo,
      loading,
      tab,
      apiList,
      isConnectOwner,
      introduce,
      controls,
      hasManageAuth,
      currentProjectId,
      actionId,
      authType,
    },
    setState,
  ] = useSetState(props);
  useEffect(() => {
    const {
      connectData,
      nodeInfo,
      loading,
      tab,
      apiList,
      isConnectOwner,
      introduce,
      controls,
      hasManageAuth,
      currentProjectId,
      actionId,
      authType,
    } = props;
    setState({
      connectData,
      nodeInfo,
      loading,
      tab,
      apiList,
      isConnectOwner,
      introduce,
      controls,
      hasManageAuth,
      currentProjectId,
      actionId,
      authType,
    });
  }, [props]);
  //创建api管理
  const addConnet = () => {
    packageVersionAjax
      .add(
        {
          companyId: currentProjectId,
          defaultFlowNode: {
            actionId: actionId,
            appType: authType,
          },
          explain: '',
          iconColor: '',
          iconName: '',
          name: _l('未命名连接'),
          relationId: '',
          relationType: 4,
          startEventAppType: 0,
        },
        { isIntegration: true },
      )
      .then(res => {
        getInfo(res.id);
        let newData = {
          ...connectData,
          ...res,
          isOwner: true,
          authType: authType,
          hasAuth: actionId === '523' && authType === 32,
          type: 1,
          ownerAccount: {
            ...res.ownerAccount,
            accountId: md.global.Account.accountId,
            fullName: md.global.Account.fullname,
          },
        };
        onChangeSate({
          connectData: newData,
          isChange: true,
          isConnectOwner: hasManageAuth || newData.isOwner,
        });
      });
  };
  //修改使用说明
  const updateIntroduce = introduce => {
    packageVersionAjax
      .update(
        {
          id: connectData.id,
          introduce,
        },
        { isIntegration: true },
      )
      .then(res => {
        if (res) {
          onChangeSate({
            introduce,
          });
        } else {
          alert(_l('修改失败，请稍后再试'), 2);
        }
      });
  };
  const renderCon = () => {
    switch (tab) {
      case 0:
        //用户安装的连接中，若未配置连接参数（即连接参数为空），则隐藏连接参数配置卡片
        if (connectData.type === 2 && controls.length <= 0 && !introduce) {
          return '';
        }
        return (
          <ConnectSet
            hasChange={() =>
              onChangeSate({
                isChange: true,
              })
            }
            {...nodeInfo}
            hasAuth={connectData.hasAuth}
            fetchInfo={() => {
              getInfo(connectData.id);
              onChangeSate({
                isChange: true,
              });
            }}
            controls={controls}
            updateIntroduce={value => updateIntroduce(value)}
            introduce={introduce}
            connectId={connectData.id}
            connectType={connectData.type}
            isConnectOwner={isConnectOwner}
            toAccountTab={() => onChangeSate({ tab: 3 })}
          />
        );
      case 1:
        return (
          <APIList
            {...connectData}
            hasAuth={connectData.hasAuth}
            connectData={connectData}
            isConnectOwner={isConnectOwner}
            hasChange={() =>
              onChangeSate({
                isChange: true,
              })
            }
            connectType={connectData.type}
            apiList={apiList}
            updateList={apiList => {
              onChangeSate({ apiCount: apiList.length, apiList: apiList });
            }}
            getApiListFetch={data => {
              getApiListFetch(data);
            }}
            apkCount={props.apkCount}
            hasManageAuth={hasManageAuth}
          />
        );
      case 2:
        return (
          <AuthorizeToApp
            {...nodeInfo}
            hasAuth={connectData.hasAuth}
            isConnectOwner={isConnectOwner}
            processId={connectData.id}
            list={connectData.apks || []}
            hasChange={() =>
              onChangeSate({
                isChange: true,
              })
            }
            onFresh={() => {
              onChangeSate({
                isChange: true,
              });
              getDetailInfo(connectData.id);
            }}
          />
        );
      case 3:
        return <AccountList {...nodeInfo} connectId={connectData.id} hasAuth={connectData.hasAuth} />;
    }
  };
  return (
    <Wrap className="">
      {!nodeInfo.startEventId && !loading ? ( //新创建
        <div className="chooseAuthType">
          <p className="title TxtLeft">{_l('请选择鉴权方式')}</p>
          <ul className="flexRow mTop30 chooseTypeContent justifyContentCenter">
            {TYPELIST.map(o => {
              return (
                <li className={'chooseTypeCon'}>
                  <Radio
                    className=""
                    text={o.name}
                    checked={authType === o.appType && actionId === o.actionId}
                    onClick={() => {
                      setDefaultFlowNode({ authType: o.appType, actionId: o.actionId });
                    }}
                  />
                </li>
              );
            })}
          </ul>
          <div
            className={cx('btn Bold', { disabled: !authType })}
            onClick={e => {
              if (!authType) {
                return;
              }
              addConnet();
            }}
          >
            {_l('保存并继续')}
          </div>
        </div>
      ) : (
        renderCon()
      )}
    </Wrap>
  );
}
