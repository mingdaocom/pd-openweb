import React, { useRef, Fragment } from 'react';
import { Button } from 'ming-ui';
import styled from 'styled-components';
import { pushInstallClientMsg } from 'src/api/project';
import copy from 'copy-to-clipboard';

const TYPE_CONFIG = {
  desktop: {
    title: _l('安装桌面客户端'),
    explain: _l('为您的成员安装桌面客户端，支持MAC或者Windows系统'),
    text: _l('将链接分享给你的成员'),
  },
  app: {
    title: _l('安装手机移动客户端'),
    explain: _l('为您的成员安装App（支持IOS或者Andriod)'),
    text: _l('扫描二维码，将页面发送给您的好友'),
  },
};
const InstallDialog = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  transition: all 0.75s;
  visibility: hidden;
  opacity: 0;
  &.desktop,
  &.app {
    visibility: visible;
    opacity: 0.9;
  }
  z-index: 3;

  .title {
    font-size: 36px;
  }
  .explain {
    font-size: 18px;
    margin-top: 6px;
  }
  .copyBtn {
    margin: 32px auto;
  }
  .shareContent {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 32px;
    .iconWrap {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background-color: #eee;
      text-align: center;
      line-height: 76px;
      font-size: 32px;
    }
    .line {
      width: 160px;
      margin: 0 16px;
      border-top: 4px dashed #eee;
    }
  }
  .text {
    margin: 32px;
    font-size: 18px;
    color: #999;
  }
  .selectUser {
    span {
      color: #2196f3;
      margin-left: 4px;
      cursor: pointer;
    }
  }
`;

export default function installDialog({ projectId, type, onClose, ...rest }) {
  const { title, explain, text } = TYPE_CONFIG[type] || {};
  const { AjaxApiUrl, WebUrl } = _.get(md, ['global', 'Config']);
  const isDesktop = type === 'desktop';
  const $ref = useRef(null);
  const $copy = useRef(null);
  const handleSelectUser = () => {
    import('dialogSelectUser').then(() => {
      $({}).dialogSelectUser({
        showMoreInvite: false,
        SelectUserSettings: {
          projectId, // 默认取哪个网络的用户 为空则表示默认加载全部
          filterAccountIds: [md.global.Account.accountId], // 不发自己
          filterAll: true, // 过滤全部
          filterFriend: true, // 是否过滤好友
          filterOthers: true, // 是否过滤其他协作关系
          filterOtherProject: true, // 当对于 true,projectId不能为空，指定只加载某个网络的数据
          dataRange: 2, // reference to dataRangeTypes 和 projectId 配合使用
          allowSelectNull: false, // 是否允许选择列表为空
          callback: function(data) {
            pushInstallClientMsg({
              projectId: projectId,
              accountIds: _.map(data, function(user) {
                return user.accountId;
              }),
              clientType: type === 'app' ? 0 : 1,
            }).done(function() {
              alert(_l('发送成功'), 1);
            });
          },
        },
      });
    });
  };

  return (
    <InstallDialog
      ref={$ref}
      className={type}
      type={type}
      onClick={e => {
        if (e.target.isEqualNode($ref.current)) {
          onClose();
        }
      }}
    >
      <div className="title">{title}</div>
      <div className="explain">{explain}</div>
      <div className="shareContent">
        {isDesktop ? (
          <Fragment>
            <div className="iconWrap">
              <i className="icon-link" />
            </div>
            <div className="line" />
            <div className="iconWrap">
              <i className="icon-group" />
            </div>
          </Fragment>
        ) : (
          <img src={`${AjaxApiUrl}code/CreateQrCodeImage?url=${WebUrl}mobile.html`} />
        )}
      </div>
      <div className="text">{text}</div>
      {isDesktop && (
        <Button
          ref={$copy}
          className="copyBtn"
          style={{ width: '260px' }}
          onClick={() => {
            copy(`${WebUrl}mobile.htm`);
            alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
          }}
        >
          {_l('复制邀请链接')}
        </Button>
      )}
      <div className="selectUser">
        {_l('或')}
        <span onClick={handleSelectUser}>{_l('从通讯录中选择')}</span>
      </div>
    </InstallDialog>
  );
}
