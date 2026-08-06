import React, { useEffect, useRef, useState } from 'react';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import Trigger from 'rc-trigger';
import { Button, Dialog, Dropdown, Icon, Menu, MenuItem, Support } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import openAuthorAjax from 'src/api/openAuthor';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import PersonalAccessTokenDrawer from './PersonalAccessTokenDrawer';
import './index.less';

const STATUS_FILTERS = [
  { text: _l('全部状态'), value: 0 },
  { text: _l('生效中'), value: 1 },
  { text: _l('已过期'), value: 2 },
  { text: _l('已失效'), value: 3 },
];

const STATUS = {
  1: { text: _l('生效中'), className: 'active' },
  2: { text: _l('已过期'), className: 'expired' },
  3: { text: _l('已失效'), className: 'invalid' },
};

const formatTime = time => (time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '');

const formatMaskedToken = rawToken => {
  return rawToken.length > 10 ? `${rawToken.slice(0, 7)}${'*'.repeat(10)}${rawToken.slice(-3)}` : rawToken;
};

export default function PersonalAccessToken() {
  const ajaxRef = useRef(null);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTokenId, setEditingTokenId] = useState(null);
  const [successToken, setSuccessToken] = useState('');
  const [successTokenTitle, setSuccessTokenTitle] = useState(_l('创建个人访问令牌'));
  const [visibleTokenIds, setVisibleTokenIds] = useState([]);
  const [actionPopupVisible, setActionPopupVisible] = useState(false);
  const lang = window.getCurrentLang();

  const getDataSource = () => {
    if (ajaxRef.current && ajaxRef.current.abort) {
      ajaxRef.current.abort();
    }

    setLoading(true);

    ajaxRef.current = openAuthorAjax.getPATs({ status: statusFilter });
    ajaxRef.current
      .then(res => setTokens(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openFormDialog = tokenId => {
    setEditingTokenId(tokenId);
    setDialogVisible(true);
  };

  const closeFormDialog = () => {
    setDialogVisible(false);
    setEditingTokenId(null);
  };

  const openDeleteDialog = token => {
    Dialog.confirm({
      title: _l('删除 %0 令牌', token.name),
      description: _l('删除后，使用此凭证发出的请求将被拒绝，请确认此操作'),
      buttonType: 'danger',
      onOk: async () => {
        try {
          const res = await openAuthorAjax.deletePAT({ id: token.id });

          if (res) {
            alert(_l('删除成功'));
            getDataSource();
          } else {
            alert(_l('删除失败'), 2);
          }
        } catch {
          alert(_l('删除失败'), 2);
        }
      },
    });
  };

  const openResetDialog = token => {
    Dialog.confirm({
      title: _l('重置 %0 令牌', token.name),
      description: _l(
        '重置后，将生成新的令牌，原有名称、有效期及权限配置保持不变，旧令牌发出的请求将被拒绝，请确认此操作。',
      ),
      buttonType: 'danger',
      okText: _l('确认'),
      onOk: async () => {
        try {
          const res = await openAuthorAjax.resetPAT({ id: token.id });

          if (res) {
            alert(_l('重置成功'));
            if (res.rawToken) {
              setSuccessToken(res.rawToken);
              setSuccessTokenTitle(_l('重置个人访问令牌'));
            }

            getDataSource();
          } else {
            alert(_l('重置失败'), 2);
          }
        } catch {
          alert(_l('重置失败'), 2);
        }
      },
    });
  };

  const openExpireDialog = token => {
    Dialog.confirm({
      title: _l('将 %0 令牌立即过期', token.name),
      description: _l('操作后，该令牌立即过期，使用此令牌发出的请求将被拒绝，请确认此操作。'),
      buttonType: 'danger',
      okText: _l('确认'),
      onOk: async () => {
        try {
          const res = await openAuthorAjax.expirePAT({ id: token.id });

          if (res) {
            alert(_l('操作成功'));
            getDataSource();
          } else {
            alert(_l('操作失败'), 2);
          }
        } catch {
          alert(_l('操作失败'), 2);
        }
      },
    });
  };

  const handleDialogSuccess = ({ rawToken, title } = {}) => {
    if (rawToken) {
      setSuccessToken(rawToken);
      setSuccessTokenTitle(title || _l('创建个人访问令牌'));
    }

    getDataSource();
  };

  useEffect(() => {
    getDataSource();
  }, [statusFilter]);

  const actionMenus = [
    { key: 'edit', text: _l('编辑'), onClick: record => openFormDialog(record.id) },
    { key: 'reset', text: _l('重置'), onClick: openResetDialog },
    { key: 'expire', text: _l('立即过期'), onClick: openExpireDialog },
    { key: 'delete', text: _l('删除'), className: 'Red', onClick: openDeleteDialog },
  ];

  const columns = [
    {
      title: _l('名称'),
      dataIndex: 'name',
      width: 200,
      render: (text, record) => <div className="ellipsis">{record.name}</div>,
    },
    {
      title: _l('令牌'),
      dataIndex: 'rawToken',
      width: '32%',
      render: (text, record) => {
        const visible = visibleTokenIds.includes(record.id);
        const tokenText = visible ? record.rawToken : formatMaskedToken(record.rawToken);

        return (
          <div className="flexRow alignItemsCenter">
            <div className="ellipsis textTitle">{tokenText}</div>
            <div className="flexRow alignItemsCenter mLeft8">
              <Tooltip title={visible ? _l('隐藏') : _l('显示')}>
                <Icon
                  icon={visible ? 'visibility_off' : 'eye_off'}
                  className="Font16 pointer textSecondary hoverColorPrimary"
                  onClick={() => {
                    const newVisibleTokenIds = visible
                      ? visibleTokenIds.filter(item => item !== record.id)
                      : visibleTokenIds.concat(record.id);
                    setVisibleTokenIds(newVisibleTokenIds);
                  }}
                />
              </Tooltip>
              <Tooltip title={_l('复制')}>
                <Icon
                  icon="copy"
                  className="Font16 pointer textSecondary hoverColorPrimary mLeft8"
                  onClick={() => {
                    copy(record.rawToken, { format: 'text/plain' });
                    alert(_l('已复制'));
                  }}
                />
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: _l('状态'),
      dataIndex: 'status',
      width: '10%',
      render: (text, record) => (
        <div className="status">
          <span className={`statusBadge ${STATUS[record.status]?.className}`}>{STATUS[record.status]?.text}</span>
          {record.status === 3 && (
            <Tooltip title={_l('组织管理员不允许使用个人访问令牌')}>
              <Icon icon="error1" className="statusWarn" />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: _l('创建时间'),
      dataIndex: 'createTime',
      width: '15%',
      render: text => <div>{formatTime(text)}</div>,
    },
    {
      title: _l('到期时间'),
      dataIndex: 'expireAt',
      width: '15%',
      render: text => <div>{formatTime(text) || _l('永久有效')}</div>,
    },
    {
      title: '',
      dataIndex: 'actions',
      width: '6%',
      align: 'right',
      render: (text, record) => (
        <div className="actions">
          <Trigger
            action={['click']}
            popupVisible={actionPopupVisible === record.id}
            onPopupVisibleChange={visible => setActionPopupVisible(visible ? record.id : false)}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [0, 5],
              overflow: { adjustX: true, adjustY: true },
            }}
            popup={
              <Menu className="Static">
                {actionMenus
                  .filter(item => !(item.key !== 'delete' && [2, 3].includes(record.status)))
                  .map(item => (
                    <MenuItem
                      key={item.key}
                      className={item.className}
                      onClick={() => {
                        setActionPopupVisible(false);
                        item.onClick(record);
                      }}
                    >
                      {item.text}
                    </MenuItem>
                  ))}
              </Menu>
            }
          >
            <Icon icon="more_horiz" className="actionIcon" onClick={e => e.stopPropagation()} />
          </Trigger>
        </div>
      ),
    },
  ];

  return (
    <div className="personalAccessTokenPage">
      <div className="Bold Font18">{_l('个人访问令牌')}</div>
      <div className="tipBar">
        <Icon icon="info" className="mRight10 tipIcon Font16" />
        <span>
          {_l(
            '个人访问令牌代表您的身份，用于 HAP 数据的操作访问。您可自定义权限范围和数据访问权限。️安全提示：令牌具有账户权限，请勿分享给他人。',
          )}
        </span>
        <Support
          className="mLeft4"
          type={3}
          href={`${md.global.Config.OpenApiDocUrl}/application_v3/pat/${lang === 'zh-Hans' ? 'zh-Hans' : 'en'}/`}
          text={_l('API 文档')}
        />
      </div>

      <div className="toolbar">
        <Dropdown
          border
          isAppendToBody
          className="Width200"
          data={STATUS_FILTERS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <Button type="primary" radius onClick={() => openFormDialog()}>
          <Icon icon="plus" className="mRight4" />
          <span>{_l('添加')}</span>
        </Button>
      </div>

      <div className="flex minHeight0 tokenTableWrap">
        <PageTableCon
          className="patPageTable"
          loading={loading}
          columns={columns}
          dataSource={tokens}
          count={tokens.length}
          getDataSource={getDataSource}
          tableSetting={{ rowKey: 'id' }}
        />
      </div>

      {dialogVisible && (
        <PersonalAccessTokenDrawer
          visible
          tokenId={editingTokenId}
          onClose={closeFormDialog}
          onSuccess={handleDialogSuccess}
        />
      )}

      {!!successToken && (
        <Dialog
          visible
          width={500}
          title={successTokenTitle}
          description={_l('为保护您账户的安全，请妥善保管此凭证')}
          className="successPatDialog"
          onCancel={() => setSuccessToken('')}
          onOk={() => {
            copy(successToken, { format: 'text/plain' });
            alert(_l('已复制'));
            setSuccessToken('');
          }}
          okText={_l('复制并关闭')}
          showCancel={false}
        >
          <div className="tokenResult">
            <span className="ellipsis flex">{successToken}</span>
            <Icon
              icon="content-copy"
              className="copyResultIcon"
              onClick={() => {
                copy(successToken, { format: 'text/plain' });
                alert(_l('已复制'));
              }}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
