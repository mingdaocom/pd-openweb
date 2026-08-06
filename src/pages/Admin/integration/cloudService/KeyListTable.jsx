import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Dialog, Icon, Input, Menu, MenuItem, UserHead, VerifyPasswordConfirm } from 'ming-ui';
import apiKeyAjax from 'src/pages/Admin/api/cloudApi/apiKey';
import CustomTableCom from 'src/pages/Admin/components/CustomTableCom';
import { PERMISSION_OPTIONS } from './constants';

const SearchInputWrap = styled.div`
  width: 300px;
  height: 36px;
  position: relative;
  border: 1px solid ${props => (props.isFocus ? 'var(--color-primary)' : 'var(--color-border-primary)')};
  border-radius: 4px;
  background: var(--color-bg-primary);

  .searchInput.ming.Input {
    width: 100%;
    height: 100%;
    border: none !important;
    box-shadow: none !important;
    background: transparent;
    line-height: 34px;
    padding-left: 42px !important;
    padding-right: 32px !important;
    font-size: 14px;

    &:hover,
    &:focus,
    &.active {
      border: none !important;
      box-shadow: none !important;
    }

    &::placeholder {
      color: var(--color-text-placeholder);
    }
  }
`;

const SearchIcon = styled(Icon)`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  font-size: 18px;
  z-index: 2;
  pointer-events: none;
`;

const ClearIcon = styled(Icon)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  font-size: 14px;
  z-index: 2;
  cursor: pointer;

  &:hover {
    color: var(--color-text-secondary);
  }
`;

export default function KeyListTable({
  list,
  loading,
  total,
  pageIndex,
  pageSize,
  searchInput,
  onSearchChange,
  onSearchClear,
  onFetchList,
  onOpenWhiteList,
  onOpenEdit,
  onCreate,
}) {
  const [isFocus, setIsFocus] = useState(false);
  const [actionPopupVisible, setActionPopupVisible] = useState(false);
  const [pendingActionId, setPendingActionId] = useState('');

  const handleToggleStatus = item => {
    if (pendingActionId) return;

    const newStatus = item.status === 1 ? 0 : 1;

    const updateStatus = () => {
      setPendingActionId(item.id);
      apiKeyAjax
        .keysStatusUpdate({ apiKeyId: item.id, status: newStatus })
        .then(() => {
          alert(newStatus === 0 ? _l('已禁用') : _l('已启用'));
          onFetchList(pageIndex);
        })
        .finally(() => setPendingActionId(''));
    };

    if (newStatus === 0) {
      Dialog.confirm({
        title: <span className="Red Bold">{_l('确定禁用此密钥?')}</span>,
        description: _l('禁用后，此密钥提供的云服务将会调用失败，导致相关功能异常。'),
        okText: _l('禁用'),
        buttonType: 'danger',
        onOk: () => {
          // 禁用会导致调用失败，确认后仍需进行账号密码二次验证。
          VerifyPasswordConfirm.confirm({
            isRequired: true,
            onOk: updateStatus,
          });
        },
      });
      return;
    }

    updateStatus();
  };

  const handleClickDelete = item => {
    if (pendingActionId) return;

    Dialog.confirm({
      title: <span className="Red Bold">{_l('确定删除此密钥?')}</span>,
      description: _l('删除后，此密钥提供的云服务将会调用失败，导致相关功能异常。'),
      okText: _l('删除'),
      buttonType: 'danger',
      onOk: () => {
        VerifyPasswordConfirm.confirm({
          isRequired: true,
          onOk: () => {
            setPendingActionId(item.id);
            apiKeyAjax
              .keysDelete({ apiKeyId: item.id })
              .then(() => {
                alert(_l('已删除'));
                onFetchList(pageIndex);
              })
              .finally(() => setPendingActionId(''));
          },
        });
      },
    });
  };

  const renderStatus = status => {
    const isEnabled = status === 1;
    return (
      <span className="statusWrap">
        <span className={isEnabled ? 'statusDot enabled' : 'statusDot'} />
        <span>{isEnabled ? _l('启用中') : _l('已禁用')}</span>
      </span>
    );
  };

  const renderCreator = item => {
    const creater = item.creater || {};
    const accountId = creater.id;
    const name = creater.name || '';
    const avatar = creater.avatar;

    if (!name) return '-';

    return (
      <div className="flexRow alignItemsCenter">
        <UserHead className="circle mRight8" user={{ accountId, userHead: avatar }} size={28} disabled={!accountId} />
        <span className="ellipsis" title={name}>
          {name}
        </span>
      </div>
    );
  };

  const renderTime = time => {
    return time ? <span title={time}>{createTimeSpan(time)}</span> : '-';
  };

  const renderAuthService = item => {
    const permissions = item.permission || [];
    const names = permissions
      .map(value => (PERMISSION_OPTIONS.find(option => option.value === value) || {}).label)
      .filter(Boolean);

    return names.join('、') || '-';
  };

  const columns = [
    {
      title: _l('密钥名称'),
      dataIndex: 'description',
      className: 'colSecretName ellipsis',
    },
    {
      title: _l('密钥'),
      dataIndex: 'maskedKey',
      className: 'colSecretKey ellipsis',
    },
    {
      title: _l('授权服务'),
      dataIndex: 'authService',
      className: 'colAuthService ellipsis',
      render: renderAuthService,
    },
    {
      title: _l('创建人'),
      dataIndex: 'creater',
      className: 'colCreatorName ellipsis',
      render: renderCreator,
    },
    {
      title: _l('创建时间'),
      dataIndex: 'createTime',
      className: 'colCreateTime ellipsis',
      render: item => renderTime(item.createTime),
    },
    {
      title: _l('最近使用时间'),
      dataIndex: 'updateTime',
      className: 'colLastUsedTime ellipsis',
      render: item => renderTime(item.updateTime),
    },
    {
      title: _l('信用点消耗'),
      dataIndex: 'totalConsumedAmount',
      className: 'colCreditPoint ellipsis',
    },
    {
      title: _l('状态'),
      dataIndex: 'status',
      className: 'colStatus ellipsis',
      render: item => renderStatus(item.status),
    },
    {
      title: _l('操作'),
      dataIndex: 'action',
      className: 'colAction',
      render: item => (
        <div className="flexRow alignItemsCenter">
          <span className="colorPrimary Hand mRight12 adminHoverColor" onClick={() => onOpenWhiteList(item)}>
            {_l('IP 白名单')}
          </span>
          <Trigger
            action={['click']}
            popupVisible={actionPopupVisible === item.id}
            onPopupVisibleChange={visible => setActionPopupVisible(visible ? item.id : false)}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [0, 8],
              overflow: { adjustX: true, adjustY: true },
            }}
            popup={
              <Menu className="Static">
                <MenuItem
                  onClick={() => {
                    setActionPopupVisible(false);
                    onOpenEdit(item);
                  }}
                >
                  {_l('编辑')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setActionPopupVisible(false);
                    handleToggleStatus(item);
                  }}
                >
                  {item.status === 1 ? _l('禁用') : _l('启用')}
                </MenuItem>
                <MenuItem
                  className="Red"
                  onClick={() => {
                    setActionPopupVisible(false);
                    handleClickDelete(item);
                  }}
                >
                  {_l('删除')}
                </MenuItem>
              </Menu>
            }
          >
            <Icon icon="moreop" className="Font18 Gray_9e Hand" onClick={e => e.stopPropagation()} />
          </Trigger>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="toolBar flexRow alignItemsCenter">
        <SearchInputWrap isFocus={isFocus}>
          <SearchIcon icon="search" />
          <Input
            className="searchInput"
            placeholder={_l('密钥名称')}
            value={searchInput}
            onChange={onSearchChange}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
          />
          {!!searchInput && (
            <ClearIcon
              icon="cancel"
              onMouseDown={e => {
                e.preventDefault();
                onSearchClear();
              }}
            />
          )}
        </SearchInputWrap>
        <Button type="primary" className="createButton mLeft10" onClick={onCreate}>
          <i className="icon-add Font14 mRight4" />
          {_l('创建密钥')}
        </Button>
      </div>

      <div className="tableWrap flexColumn">
        <CustomTableCom
          className="cloudServiceTable"
          columns={columns}
          dataSource={list}
          loading={loading}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          changePage={page => onFetchList(page)}
          dealSorter={() => {}}
          emptyInfo={{
            emptyContent: _l('暂无密钥'),
            emptyDescription: '',
          }}
        />
      </div>
    </>
  );
}
