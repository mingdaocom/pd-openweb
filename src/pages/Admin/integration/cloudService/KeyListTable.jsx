import React, { useState } from 'react';
import { Icon, UserHead, VerifyPasswordConfirm } from 'ming-ui';
import { Button, Dropdown, Input, Modal } from 'ming-ui/antd-components';
import apiKeyAjax from 'src/pages/Admin/api/cloudApi/apiKey';
import CustomTableCom from 'src/pages/Admin/components/CustomTableCom';
import { PERMISSION_OPTIONS } from './constants';

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
      Modal.confirm({
        title: <span className="textError">{_l('确定禁用此密钥?')}</span>,
        content: _l('禁用后，此密钥提供的云服务将会调用失败，导致相关功能异常。'),
        okText: _l('禁用'),
        okButtonProps: {
          danger: true,
        },
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

    Modal.confirm({
      title: <span className="Red textError">{_l('确定删除此密钥?')}</span>,
      content: _l('删除后，此密钥提供的云服务将会调用失败，导致相关功能异常。'),
      okText: _l('删除'),
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        VerifyPasswordConfirm.confirm({
          isRequired: true,
          onOk: () => {
            setPendingActionId(item.id);
            apiKeyAjax
              .keysDelete({
                apiKeyId: item.id,
              })
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
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            open={actionPopupVisible === item.id}
            onOpenChange={visible => setActionPopupVisible(visible ? item.id : false)}
            menu={{
              items: [
                { key: 'edit', label: _l('编辑') },
                { key: 'toggleStatus', label: item.status === 1 ? _l('禁用') : _l('启用') },
                { key: 'delete', danger: true, label: _l('删除') },
              ],
              onClick: ({ key }) => {
                setActionPopupVisible(false);
                if (key === 'edit') {
                  onOpenEdit(item);
                } else if (key === 'toggleStatus') {
                  handleToggleStatus(item);
                } else if (key === 'delete') {
                  handleClickDelete(item);
                }
              },
            }}
          >
            <Icon icon="moreop" className="Font18 textTertiary Hand" onClick={e => e.stopPropagation()} />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="toolBar flexRow alignItemsCenter">
        <Input
          style={{ width: 300 }}
          prefix={<Icon icon="search" className="Font18 textTertiary" />}
          suffix={
            searchInput ? (
              <Icon
                icon="cancel"
                className="Font14 textTertiary pointer"
                onMouseDown={e => {
                  e.preventDefault();
                  onSearchClear();
                }}
              />
            ) : null
          }
          placeholder={_l('密钥名称')}
          value={searchInput}
          onChange={e => onSearchChange(e.target.value)}
        />
        <Button type="primary" className="mLeft10" icon={<i className="icon-add" />} onClick={onCreate}>
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
