import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, Input, LoadDiv, Menu, MenuItem, Switch } from 'ming-ui';
import privateSysSettingApi from 'src/api/privateSysSetting';
import { encrypt } from 'src/utils/common';
import googleIcon from '../images/google.svg';
import microsoftIcon from '../images/microsoft.png';
import qqIcon from '../images/personalQQIcon.png';
import wxIcon from '../images/weixinIcon.png';

export const EmptyWrap = styled.div`
  height: 48px;
  line-height: 46px;
  border-radius: 3px;
  border: 1px solid #e6e6e6;
`;
export const MyItem = styled(EmptyWrap)`
  display: flex;
  align-items: center;
  padding: 0 15px 0 7px;
  margin-bottom: 12px;
  .iconImg {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }
`;

export const ActionWrap = styled(Menu)`
  width: 160px !important;
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background-color: #f5f5f5 !important;
    color: #151515 !important;
  }
  .ming.MenuItem .Item-content.disabled {
    color: #9e9e9e;
    background-color: #f5f5f5 !important;
  }
  .delete {
    color: #f51744;
  }
`;

const list = [
  {
    tpType: 1,
    key: 'appid',
    idKey: 'appsecret',
    txt: _l('微信'),
    redirectUri: `${md.global.Config.WebUrl}orgsso/weixin/callback`,
    icon: wxIcon,
  },
  {
    tpType: 2,
    key: 'appid',
    idKey: 'appkey',
    txt: 'QQ',
    redirectUri: `${md.global.Config.WebUrl}orgsso/qq/callback`,
    icon: qqIcon,
  },
  {
    tpType: 13,
    key: 'clientId',
    idKey: 'clientSecret',
    txt: 'Google',
    redirectUri: `${md.global.Config.WebUrl}orgsso/google/callback`,
    icon: googleIcon,
  },
  {
    tpType: 14,
    key: 'clientId',
    idKey: 'clientSecret',
    txt: 'Microsoft',
    redirectUri: `${md.global.Config.WebUrl}orgsso/microsoft/callback`,
    icon: microsoftIcon,
  },
];
function Item(props) {
  const { item, className, onEdit = () => {}, onDelete = () => {}, onSwitch = () => {} } = props;
  const [visible, setVisible] = useState(false);
  const info = list.find(o => o.tpType === item.tpType) || {};
  return (
    <MyItem className={className}>
      <img src={info.icon} className="iconImg" />
      <div className="mLeft6 mRight12">{info.txt}</div>
      <div className="Font13 Gray_9e flex">{item.desc || ''}</div>
      <Switch size="small" checked={item.status === 1 ? true : false} onClick={onSwitch} />
      <Trigger
        popupVisible={visible}
        onPopupVisibleChange={value => setVisible(value)}
        action={['click']}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [-160, 15],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={
          <ActionWrap>
            <MenuItem
              onClick={() => {
                onEdit();
                setVisible(false);
              }}
            >
              {_l('编辑')}
            </MenuItem>
            <MenuItem
              className="delete"
              onClick={() => {
                onDelete();
                setVisible(false);
              }}
            >
              {_l('删除')}
            </MenuItem>
          </ActionWrap>
        }
      >
        <Icon icon="moreop" className="Font16 Hand mLeft15" />
      </Trigger>
    </MyItem>
  );
}
function SetDialog(props) {
  const { onClose, onOk, tpType, info } = props;
  const [ssoSettings, setSsoSettings] = useSetState({
    ...(list.find(o => o.tpType === tpType) || {}),
    ...info,
    tpType,
  });

  return (
    <Dialog
      visible={true}
      anim={false}
      title={ssoSettings.txt}
      width={480}
      okText={_l('保存')}
      onOk={() => {
        if (!(ssoSettings.clientSecret && ssoSettings.clientId)) {
          alert(_l('请完善配置信息'), 3);
          return;
        }
        privateSysSettingApi
          .setSso({
            clientId: encrypt(ssoSettings.clientId),
            clientSecret: encrypt(ssoSettings.clientSecret),
            tpType,
          })
          .then(() => {
            onOk();
          });
      }}
      onCancel={onClose}
    >
      <div className="flexColumn">
        <div className="flex">
          <Fragment>
            <div className="flexColumn">
              <div className="Font14 mBottom5">
                <span className="Red pRight5">*</span>
                {tpType === 3 ? 'client secret' : ssoSettings.key}
              </div>
              <Input
                className="w100"
                autoComplete={'new-password'}
                defaultValue={ssoSettings.clientId}
                onBlur={e => setSsoSettings({ clientId: e.target.value })}
              />
              <div className="Font14 mBottom5 mTop10">
                <span className="Red pRight5">*</span>
                {tpType === 3 ? 'client id' : ssoSettings.idKey}
              </div>
              <Input
                className="w100"
                autoComplete={'new-password'}
                type="password"
                defaultValue={ssoSettings.clientSecret}
                onBlur={e => setSsoSettings({ clientSecret: e.target.value })}
              />
              <div className="Font14 mBottom5 mTop10">
                <span className="Red pRight5">*</span>
                {_l('回调地址')}
              </div>
              <div className="flexRow">
                <span className="flex overflow_ellipsis">
                  <Tooltip title={ssoSettings.redirectUri}>{ssoSettings.redirectUri}</Tooltip>
                </span>
                <span
                  className="Hand ThemeColor3 mLeft5"
                  onClick={() => {
                    copy(ssoSettings.redirectUri);
                    alert(_l('复制成功'));
                  }}
                >
                  {_l('复制')}
                </span>
              </div>
            </div>
          </Fragment>
        </div>
      </div>
    </Dialog>
  );
}
export default function (props) {
  const [visible, setVisible] = useState(false);
  const [{ ssoInfo, loading, showEdit, tpType }, setState] = useSetState({
    ssoInfo: [],
    loading: true,
    showEdit: false,
    tpType: '',
  });

  useEffect(() => {
    getInfo();
  }, []);

  const getInfo = () => {
    privateSysSettingApi.getSsoSettings({}).then(data => {
      setState({ ssoInfo: data, loading: false });
    });
  };

  const removeSso = tpType => {
    privateSysSettingApi.removeSso({ tpType }).then(res => {
      setState({ ssoInfo: ssoInfo.filter(o => o.tpType !== tpType) });
    });
  };
  const switchSso = ({ tpType, status }) => {
    privateSysSettingApi
      .setSsoStatus({
        tpType,
        status,
      })
      .then(res => {
        setState({
          ssoInfo: ssoInfo.map(o => {
            if (o.tpType === tpType) {
              return { ...o, status };
            } else {
              return o;
            }
          }),
        });
      });
  };

  if (loading) return <LoadDiv />;
  return (
    <div className="privateCardWrap flexColumn">
      <div className="flexRow">
        <div className="flex Font17 bold mBottom5">{_l('SSO')}</div>
      </div>
      <div className="mBottom15 Gray_9e">{_l('使用预集成的SSO登录方式，开启后将在登录页显示对应登录方式')}</div>
      {ssoInfo.map(o => {
        const { tpType, status = 0 } = o;
        return (
          <Item
            item={o}
            className="pLeft20"
            onEdit={() => setState({ tpType: o.tpType, showEdit: true })}
            onDelete={() => removeSso(o.tpType)}
            onSwitch={() => switchSso({ tpType, status: status === 0 ? 1 : 0 })}
          />
        );
      })}
      {ssoInfo.length < list.length && (
        <Trigger
          popupVisible={visible}
          onPopupVisibleChange={value => setVisible(value)}
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [0, 15],
            overflow: { adjustX: true, adjustY: true },
          }}
          popup={
            <ActionWrap>
              {list.map(o => {
                const hs = ssoInfo.find(a => o.tpType === a.tpType);
                return (
                  <MenuItem
                    disabled={hs}
                    onClick={() => {
                      if (hs) return;
                      setState({
                        tpType: o.tpType,
                        showEdit: true,
                      });
                      setVisible(false);
                    }}
                  >
                    <span>{o.txt}</span>
                  </MenuItem>
                );
              })}
            </ActionWrap>
          }
        >
          <span className="ThemeColor3 ThemeHoverColor3 Hand InlineBlock">
            <Icon icon="add" className="Font16 Hand" />
            <span className="mLeft5">{_l('服务')}</span>
          </span>
        </Trigger>
      )}
      {showEdit && (
        <SetDialog
          tpType={tpType}
          info={ssoInfo.find(a => a.tpType === tpType)}
          onClose={() => setState({ showEdit: false })}
          onOk={data => {
            setState({ showEdit: false });
            getInfo();
          }}
        />
      )}
    </div>
  );
}
