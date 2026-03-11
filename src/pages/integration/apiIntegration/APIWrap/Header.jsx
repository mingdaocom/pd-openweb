import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Menu, SvgIcon, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { dialogSelectIcon } from 'ming-ui/functions';
import HistoryVersion from 'src/pages/workflow/WorkflowSettings/Header/HistoryVersion.jsx';
import { ActWrap, LogoWrap, MenuItemWrap, RedMenuItemWrap } from '../style';

const WrapMenu = styled(Menu)`
  .historyVersion {
    top: 0;
    right: 0;
    left: initial;
    bottom: 0;
    z-index: 1;
  }
`;

const HeadTop = styled.div`
  background: var(--color-background-primary);
  padding-top: 24px;
  textarea.des {
    height: auto;
  }
  .apiTop {
    .forTip {
      height: 36px;
      width: 1px;
    }
    input {
      width: 90%;
      &:focus {
        color: var(--color-text-title) !important;
      }
    }
  }
`;

function Header({ data, apkInfo, isConnectOwner, forPage, listId, onCancel, onDel, updateInfo, onDataChange }) {
  // 内部状态管理
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // 内部 refs
  const TipRef = useRef();
  const InputRef = useRef();
  const InputDesRef = useRef();

  // 编辑描述时自动聚焦
  useEffect(() => {
    if (editing) {
      setTimeout(() => {
        $(InputDesRef.current).focus();
      }, 300);
    }
  }, [editing]);

  // 编辑名称时自动聚焦
  useEffect(() => {
    if (editingName) {
      setTimeout(() => {
        $(InputRef.current).focus();
      }, 300);
    }
  }, [editingName]);

  const renderIcon = () => {
    const onClickIcon = () => {
      if (!isConnectOwner) return;

      dialogSelectIcon({
        hideInput: true,
        hideCustom: true,
        iconColor: data.iconColor,
        icon: '',
        name: data.iconName,
        projectId: localStorage.getItem('currentProjectId'),
        onModify: ({ iconColor, iconUrl }) => {
          updateInfo({ ...data, iconColor: iconColor || data.iconColor, iconName: iconUrl || data.iconName });
        },
      });
    };

    return data.iconName ? (
      <LogoWrap
        className="logo iconWrap mRight15 flexRow alignItemsCenter justifyContentCenter"
        width={48}
        onClick={onClickIcon}
      >
        <div className="bg" style={{ backgroundColor: data.iconColor }}></div>
        <SvgIcon url={data.iconName} fill={data.iconColor} size={32} />
      </LogoWrap>
    ) : (
      <LogoWrap
        className="logo mRight15 flexRow alignItemsCenter justifyContentCenter"
        width={48}
        onClick={onClickIcon}
      >
        <Icon icon="rocket_launch" className="Font32" />
      </LogoWrap>
    );
  };

  const renderOption = () => {
    return (
      <React.Fragment>
        {data.ownerAccount && _.get(data, 'ownerAccount.accountId') && (
          <div className="textSecondary node TxtMiddle mLeft10 flexRow alignItemsCenter">
            <React.Fragment>
              <UserHead
                user={{
                  userHead: data?.ownerAccount?.avatar,
                  accountId: data?.ownerAccount?.accountId,
                }}
                size={24}
                className="mRight8"
                newPageChat={true}
              />
              <span
                className="textPrimary mRight8 maxWidth100 overflow_ellipsis"
                title={_.get(data, 'ownerAccount.fullName')}
              >
                {_.get(data, 'ownerAccount.fullName')}
              </span>
              <span className="" style={{ color: 'var(--color-text-tertiary)' }}>
                {apkInfo.type === 2 ? _l('安装于') : data.lastModifiedDate ? _l('更新于') : _l('创建于')}
                {apkInfo.type === 2 ? data.createdDate : data.lastModifiedDate || data.createdDate}
              </span>
            </React.Fragment>
            {(location.href.indexOf('integrationApi') < 0 || (apkInfo.type === 1 && isConnectOwner)) && (
              <Trigger
                action={['click']}
                zIndex={1000}
                popup={
                  <WrapMenu>
                    {location.href.indexOf('integrationApi') < 0 && (
                      <MenuItemWrap
                        icon={<Icon icon="launch" className="Font17 mLeft5" />}
                        onClick={() => {
                          window.open(`/integrationApi/${listId}`);
                        }}
                      >
                        <span>{_l('新页面打开')}</span>
                      </MenuItemWrap>
                    )}
                    {/* 自定义的api才能有删除的权限 */}
                    {apkInfo.type === 1 && isConnectOwner && (
                      <React.Fragment>
                        {data.lastPublishDate && (
                          <HistoryVersion
                            isIntegration
                            popupClassName="historyActionPopup"
                            wrapClassName="historyVersion"
                            flowInfo={data}
                            customBtn={() => {
                              return (
                                <MenuItemWrap icon={<Icon icon="sp_library_books_white" className="Font17 mLeft5" />}>
                                  <span>{_l('历史版本')}</span>
                                </MenuItemWrap>
                              );
                            }}
                          />
                        )}
                        <RedMenuItemWrap
                          icon={<Icon icon="trash" className="Font17 mLeft5" />}
                          onClick={() => {
                            setShowMenu(false);
                            onDel && onDel(data);
                          }}
                        >
                          <span>{_l('删除')}</span>
                        </RedMenuItemWrap>
                      </React.Fragment>
                    )}
                  </WrapMenu>
                }
                popupVisible={showMenu}
                onPopupVisibleChange={visible => {
                  setShowMenu(visible);
                }}
                popupAlign={{
                  points: ['tr', 'bl'],
                  offset: [-150, 0],
                  overflow: { adjustX: true, adjustY: true },
                }}
              >
                <ActWrap
                  className="act InlineBlock TxtMiddle TxtCenter"
                  onClick={() => {
                    setShowMenu(true);
                  }}
                >
                  <i className={'icon-moreop Font22 TxtMiddle'} />
                </ActWrap>
              </Trigger>
            )}
          </div>
        )}
        {location.href.indexOf('integrationApi') < 0 && (
          <i
            className={'icon-close Font24 TxtMiddle Hand LineHeight35 textTertiary hoverTextPrimaryLight closeBtn'}
            onClick={() => onCancel && onCancel()}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <HeadTop className="w100 Relative">
      <div className="flexRow pLeft40 pRight24">
        {location.href.indexOf('/integrationApi') >= 0 && (
          <ActWrap
            className="act InlineBlock TxtMiddle TxtCenter mLeft0 mRight32 Hand LineHeight36"
            onClick={() => {
              if (history.length === 1) {
                location.href = '/integration';
              } else {
                history.back();
              }
            }}
          >
            <Icon icon="backspace" className="Font16" />
          </ActWrap>
        )}
        <div className="Hand apiDes flexRow flex">
          {apkInfo.type === 1 && renderIcon()}
          <div className={cx('apiTop Relative', { flex: true, w150: !forPage })}>
            <div className="flexRow">
              <Tooltip
                title={_l('API建议命名为动作+名词，如：获取订单列表、删除订单')}
                trigger={['click']}
                placement="bottomLeft"
              >
                <div className="forTip Absolute" ref={TipRef}></div>
              </Tooltip>
              {!editingName ? (
                <span
                  className="name LineHeight35 Block WordBreak flex Font22"
                  onClick={() => {
                    if (
                      (apkInfo.type === 1 || //自定义
                        apkInfo.type === 2) && // 安装超管和拥有者可以修改描述和名称
                      isConnectOwner
                    ) {
                      setEditingName(true);
                    }
                  }}
                >
                  {data.name || _l('未命名 API')}
                </span>
              ) : (
                <React.Fragment>
                  <input
                    type="text"
                    ref={InputRef}
                    className="name Block flex Font22 Border0"
                    value={data.name}
                    autoFocus
                    placeholder={_l('添加API标题')}
                    onChange={e => {
                      let str = e.target.value;
                      if (e.target.value.trim().length > 40) {
                        str = e.target.value.trim().slice(0, 40);
                      }
                      const newData = { ...data, name: str };
                      onDataChange && onDataChange(newData);
                      if (e.target.value.length <= 0 && TipRef && TipRef.current) {
                        TipRef.current.click();
                      }
                    }}
                    onBlur={e => {
                      const newData = {
                        ...data,
                        name: !e.target.value.trim() ? _l('未命名API') : e.target.value.trim().slice(0, 40),
                      };
                      updateInfo(newData);
                      onDataChange && onDataChange(newData);
                      setEditingName(false);
                    }}
                  />
                </React.Fragment>
              )}
              {renderOption()}
            </div>

            {!editing ? (
              <span
                className="des textTertiary Block mTop8 WordBreak"
                onClick={() => {
                  if (
                    (apkInfo.type === 1 || //自定义
                      apkInfo.type === 2) && // 安装超管和拥有者可以修改描述和名称
                    isConnectOwner
                  ) {
                    setEditing(true);
                  }
                }}
              >
                {data.explain || _l('添加说明…')}
              </span>
            ) : (
              <textarea
                type="text"
                ref={InputDesRef}
                autofocus="autofocus"
                placeholder={_l('添加说明…')}
                className="des textTertiary Block mTop8 TextArea Border0 w100"
                value={data.explain}
                onChange={e => {
                  let str = e.target.value;
                  if (e.target.value.trim().length > 200) {
                    str = e.target.value.trim().slice(0, 200);
                  }
                  const newData = { ...data, explain: str };
                  onDataChange && onDataChange(newData);
                }}
                onBlur={e => {
                  const newData = { ...data, explain: e.target.value.trim().slice(0, 200) };
                  updateInfo(newData);
                  onDataChange && onDataChange(newData);
                  setEditing(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </HeadTop>
  );
}

export default Header;
