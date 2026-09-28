import React, { useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Dropdown, Input, Modal } from 'ming-ui/antd-components';
import Share from 'src/pages/worksheet/components/Share';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { deleteAgentSession, renameAgentSession } from '../agentService';
import { buildSessionShareProps } from '../sessionShare';

// 单条会话行：供「对话历史」弹窗（SessionHistory）与落地页左栏（HistorySide）共用。
// 仅承载行结构 + 更多菜单（重命名 / 分享 / 删除）及其行为；.sessionItem 的视觉样式由各自外壳定义，
// 因此两端可保留不同尺寸（弹窗显示更新时间、侧栏不显示）。新增单条会话操作只需改这一处。
export default function SessionRow({
  item,
  active = false,
  showUpdateTime = false,
  enableShare = true,
  onSelect = () => {},
  onRenamed = () => {},
  onDeleted = () => {},
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const renameInputRef = useRef(null); // 重命名弹层里 Input 的非受控引用

  const doRename = title => {
    renameAgentSession(item.sessionId, title)
      .then(newTitle => {
        onRenamed(item.sessionId, newTitle);
        alert(_l('重命名成功'));
      })
      .catch(err => {
        console.error('[agent] rename session failed', err);
        alertIfNotUnauthorized(err, _l('重命名失败'), 2);
      });
  };

  const doDelete = () => {
    deleteAgentSession(item.sessionId)
      .then(() => {
        onDeleted(item.sessionId);
        alert(_l('删除成功'));
      })
      .catch(err => {
        console.error('[agent] delete session failed', err);
        alertIfNotUnauthorized(err, _l('删除失败'), 2);
      });
  };

  const openRenameConfirm = () => {
    Modal.confirm({
      title: _l('重命名对话'),
      width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
      content: (
        <Input
          autoFocus
          placeholder={_l('请输入对话名称')}
          className="w100 textPrimary"
          defaultValue={item.title}
          ref={input => {
            renameInputRef.current = input?.input;
          }}
        />
      ),
      onOk: () => {
        const val = renameInputRef.current && renameInputRef.current.value.trim();

        if (val) {
          doRename(val);
        } else {
          alert(_l('请输入对话名称'), 3);
          renameInputRef.current && renameInputRef.current.focus();
          return false;
        }
      },
    });
  };

  const openDeleteConfirm = () => {
    Modal.confirm({
      title: (
        <span
          style={{
            color: 'var(--color-error)',
          }}
          className="textError"
        >
          {_l('确定删除该对话')}
        </span>
      ),
      width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
      content: _l('删除后，聊天记录将不可恢复'),
      okButtonProps: {
        danger: true,
      },
      onOk: () => doDelete(),
    });
  };

  return (
    <div
      className={cx('sessionItem t-flex t-items-center', { active, menuActive: menuOpen })}
      onClick={() => onSelect(item)}
    >
      <div className="name ellipsis t-flex-1">{item.title}</div>
      {showUpdateTime && !!item.updateTime && (
        <div className="updateTime">{window.createTimeSpan(item.updateTime, 5)}</div>
      )}
      {/* 不要给菜单写死 zIndex（含 styles.root.zIndex —— antd 会把它当 customZIndex 直接锁死层级）：
          本组件既用在落地页左栏，也用在「历史对话」弹窗里，写死后者就会被弹窗盖住。
          交给 antd 的 ZIndexContext 自动分层：弹窗内取弹窗层级 +50，普通页面走默认的 zIndexPopupBase + 50。 */}
      <Dropdown
        open={menuOpen}
        onOpenChange={setMenuOpen}
        trigger={['click']}
        placement="bottomLeft"
        menu={{
          items: [
            {
              key: 'rename',
              icon: <Icon icon="rename_input" className="Font18" />,
              label: <span className="mLeft10">{_l('重命名')}</span>,
              onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                setMenuOpen(false);
                openRenameConfirm();
              },
            },
            ...(enableShare
              ? [
                  {
                    key: 'share',
                    icon: <Icon icon="share" className="Font18" />,
                    label: <span className="mLeft10">{_l('分享')}</span>,
                    onClick: ({ domEvent }) => {
                      domEvent.stopPropagation();
                      setMenuOpen(false);
                      setShareVisible(true);
                    },
                  },
                ]
              : []),
            {
              key: 'delete',
              danger: true,
              icon: <Icon icon="trash" className="Font18" />,
              label: <span className="mLeft10">{_l('删除')}</span>,
              onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                setMenuOpen(false);
                openDeleteConfirm();
              },
            },
          ],
        }}
      >
        <span className="operateIcon" onClick={e => e.stopPropagation()}>
          <i className="icon icon-more_horiz Font18 textTertiary Hand" />
        </span>
      </Dropdown>
      {/* 弹层经 portal 渲染，事件仍沿 React 树冒泡到行的 onSelect，这里阻断，避免操作弹窗时切走会话 */}
      {enableShare && shareVisible && (
        <span onClick={e => e.stopPropagation()}>
          <Share
            {...buildSessionShareProps({ sessionId: item.sessionId, title: item.title })}
            onClose={() => setShareVisible(false)}
          />
        </span>
      )}
    </div>
  );
}

SessionRow.propTypes = {
  item: PropTypes.object,
  active: PropTypes.bool,
  showUpdateTime: PropTypes.bool,
  // 是否提供「分享」菜单项：智能客服等不支持会话分享的场景传 false
  enableShare: PropTypes.bool,
  onSelect: PropTypes.func,
  onRenamed: PropTypes.func,
  onDeleted: PropTypes.func,
};
