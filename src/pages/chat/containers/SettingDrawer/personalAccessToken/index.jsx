import React, { useCallback, useEffect, useRef, useState } from 'react';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import { Icon, LoadDiv, Support } from 'ming-ui';
import { Button, Dropdown, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import openAuthorAjax from 'src/api/openAuthor';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
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

const TokenActionMenu = props => {
  const { actionMenus, record } = props;

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        className: 'personalAccessTokenActionMenu',
        items: actionMenus
          .filter(item => !(item.key !== 'delete' && [2, 3].includes(record.status)))
          .map(item => ({
            key: item.key,
            label: item.text,
            className: item.className,
            onClick: () => item.onClick(record),
          })),
      }}
    >
      <Icon icon="more_horiz" className="tokenActionIcon" onClick={e => e.stopPropagation()} />
    </Dropdown>
  );
};

const TokenCard = props => {
  const { actionMenus, record, setVisibleTokenIds, visibleTokenIds } = props;
  const visible = visibleTokenIds.includes(record.id);
  const rawToken = record.rawToken || '';
  const tokenText = visible ? rawToken : formatMaskedToken(rawToken);
  const expireText = record.expireAt ? _l('%0 到期', formatTime(record.expireAt)) : _l('永久有效');

  return (
    <div className="tokenCard">
      <div className="tokenCardHeader">
        <div className="tokenName ellipsis">{record.name}</div>
        <div className="status">
          <span className={`statusBadge ${STATUS[record.status]?.className}`}>{STATUS[record.status]?.text}</span>
          {record.status === 3 && (
            <Tooltip title={_l('组织管理员不允许使用个人访问令牌')}>
              <Icon icon="error1" className="statusWarn" />
            </Tooltip>
          )}
          <TokenActionMenu actionMenus={actionMenus} record={record} />
        </div>
      </div>
      <div className="tokenValueRow">
        <span className="tokenValue ellipsis">{tokenText}</span>
        <Tooltip title={visible ? _l('隐藏') : _l('显示')}>
          <Icon
            icon={visible ? 'visibility_off' : 'eye_off'}
            className="tokenInlineIcon"
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
            className="tokenInlineIcon"
            onClick={() => {
              copy(rawToken, { format: 'text/plain' });
              alert(_l('已复制'));
            }}
          />
        </Tooltip>
      </div>
      <div className="tokenMeta">
        {formatTime(record.createTime)}
        <span className="mLeft4 mRight4">{_l('创建')}</span>
        <span>-</span>
        <span className="mLeft4">{expireText}</span>
      </div>
    </div>
  );
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
  const lang = window.getCurrentLang();

  const getDataSource = useCallback(() => {
    if (ajaxRef.current && ajaxRef.current.abort) {
      ajaxRef.current.abort();
    }

    setLoading(true);

    ajaxRef.current = openAuthorAjax.getPATs({ status: statusFilter });
    ajaxRef.current
      .then(res => setTokens(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const openFormDialog = tokenId => {
    setEditingTokenId(tokenId);
    setDialogVisible(true);
  };

  const closeFormDialog = () => {
    setDialogVisible(false);
    setEditingTokenId(null);
  };

  const openDeleteDialog = token => {
    Modal.confirm({
      centered: true,
      title: <span className="textError">{_l('删除 %0 令牌', token.name)}</span>,
      content: _l('删除后，使用此凭证发出的请求将被拒绝，请确认此操作'),
      okButtonProps: { danger: true },
      okText: _l('确认'),
      onOk: async () => {
        try {
          const res = await openAuthorAjax.deletePAT({ id: token.id });

          if (res) {
            alert(_l('删除成功'));
            getDataSource();
          } else {
            alert(_l('删除失败'), 2);
          }
        } catch (_requestError) {
          alertIfNotUnauthorized(_requestError, _l('删除失败'), 2);
        }
      },
    });
  };

  const openResetDialog = token => {
    Modal.confirm({
      centered: true,
      title: _l('重置 %0 令牌', token.name),
      content: _l(
        '重置后，将生成新的令牌，原有名称、有效期及权限配置保持不变，旧令牌发出的请求将被拒绝，请确认此操作。',
      ),
      okButtonProps: { danger: true },
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
        } catch (_requestError2) {
          alertIfNotUnauthorized(_requestError2, _l('重置失败'), 2);
        }
      },
    });
  };

  const openExpireDialog = token => {
    Modal.confirm({
      centered: true,
      title: _l('将 %0 令牌立即过期', token.name),
      content: _l('操作后，该令牌立即过期，使用此令牌发出的请求将被拒绝，请确认此操作。'),
      okButtonProps: { danger: true },
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
        } catch (_requestError3) {
          alertIfNotUnauthorized(_requestError3, _l('操作失败'), 2);
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
    const timer = setTimeout(getDataSource, 0);

    return () => clearTimeout(timer);
  }, [getDataSource]);

  const actionMenus = [
    { key: 'edit', text: _l('编辑'), onClick: record => openFormDialog(record.id) },
    { key: 'reset', text: _l('重置'), onClick: openResetDialog },
    { key: 'expire', text: _l('立即过期'), onClick: openExpireDialog },
    { key: 'delete', text: _l('删除'), className: 'Red', onClick: openDeleteDialog },
  ];

  return (
    <div className="personalAccessTokenPage">
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
        <Select
          className="tokenStatusDropdown"
          value={statusFilter}
          options={STATUS_FILTERS.map(item => ({ label: item.text, value: item.value }))}
          onChange={setStatusFilter}
        />
        <Button type="primary" icon={<Icon icon="plus" />} onClick={() => openFormDialog()}>
          {_l('添加')}
        </Button>
      </div>

      <div className="tokenCardList">
        {loading ? (
          <div className="tokenListLoading">
            <LoadDiv />
          </div>
        ) : tokens.length ? (
          tokens.map(record => (
            <TokenCard
              actionMenus={actionMenus}
              key={record.id}
              record={record}
              setVisibleTokenIds={setVisibleTokenIds}
              visibleTokenIds={visibleTokenIds}
            />
          ))
        ) : (
          <div className="tokenEmpty">{_l('暂无个人访问令牌')}</div>
        )}
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
        <Modal
          open
          width={500}
          title={successTokenTitle}
          className="successPatDialog"
          onCancel={() => setSuccessToken('')}
          footer={
            <Button
              type="primary"
              onClick={() => {
                copy(successToken, { format: 'text/plain' });
                alert(_l('已复制'));
                setSuccessToken('');
              }}
            >
              {_l('复制并关闭')}
            </Button>
          }
        >
          <div className="Font14 textSecondary LineHeight20">{_l('为保护您账户的安全，请妥善保管此凭证')}</div>
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
        </Modal>
      )}
    </div>
  );
}
