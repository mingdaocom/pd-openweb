import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Switch } from 'ming-ui/antd-components';
import { APP_ROLE_TYPE } from 'src/utils/domain/worksheet/constants';
import './index.less';

const AdjustScreenWrap = styled.div`
  width: 360px;
  padding: 10px;
  padding-bottom: 16px;
  line-height: 20px;
  h3 {
    margin: 0;
  }
  .hint {
    margin: 12px 0;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
`;

const CONFIG = [
  {
    type: 'editCanvas',
    text: _l('编辑画布%07005'),
    icon: 'settings',
  },
  {
    type: 'editPage',
    text: _l('编辑外部链接'),
    icon: 'settings',
  },
  { type: 'divider' },
  {
    type: 'editName',
    text: _l('修改名称和图标%07004'),
    icon: 'edit',
  },
  {
    type: 'editIntro',
    text: _l('自定义页面说明'),
    icon: 'info',
  },
  {
    type: 'displaySetting',
    text: _l('显示设置%07002'),
    icon: 'desktop',
  },
  { type: 'divider' },
  {
    type: 'delete',
    danger: true,
    text: _l('删除页面%07000'),
    icon: 'trash',
    className: 'delete',
  },
];

const renderMenuIcon = ({ danger, icon }) => <Icon icon={icon} className={cx('Font18', { textTertiary: !danger })} />;

export const getOperateMenuItems = ({
  currentSheet,
  appGroups = [],
  ids,
  onClick,
  appPkg,
  adjustScreen,
  moveSheetToOtherGroup = _.noop,
  openOtherAppDialog = _.noop,
}) =>
  CONFIG.filter(o => {
    // 加锁| 运营者=>修改名称和图标(详情页)
    if (_.get(appPkg, ['isLock']) || _.get(appPkg, ['permissionType']) === APP_ROLE_TYPE.RUNNER_ROLE) {
      return ['editName', 'editIntro'].includes(o.type);
    } else {
      return true;
    }
  })
    .filter(o => {
      if (o.type === 'editCanvas' || o.type === 'displaySetting') {
        return !currentSheet.urlTemplate;
      }

      if (o.type === 'editPage') {
        return !!currentSheet.urlTemplate;
      }

      return true;
    })
    .map(({ type, text, icon, ...rest }, index) => {
      if (type === 'divider') {
        return {
          key: `divider_${index}`,
          type: 'divider',
        };
      }

      if (type === 'move') {
        return {
          ...rest,
          key: type,
          'data-event': type,
          icon: renderMenuIcon({ ...rest, icon }),
          label: <span>{text}</span>,
          children: [
            ...appGroups.map(item => ({
              key: item.appSectionId,
              'data-event': `group_${item.appSectionId}`,
              className: 'pointer',
              disabled: item.appSectionId === ids.groupId,
              onClick: () => moveSheetToOtherGroup(item.appSectionId),
              label: <span>{item.name || _l('未命名分组')}</span>,
            })),
            {
              key: 'move_divider',
              type: 'divider',
            },
            {
              key: 'otherApp',
              'data-event': 'otherApp',
              className: 'otherApp pointer',
              onClick: openOtherAppDialog,
              label: <span>{_l('其他应用')}</span>,
            },
          ],
        };
      }

      if (type === 'displaySetting') {
        return {
          ...rest,
          key: type,
          'data-event': type,
          icon: renderMenuIcon({ ...rest, icon }),
          label: <span>{text}</span>,
          children: [
            {
              key: 'displaySettingContent',
              className: 'displaySettingContentItem',
              label: (
                <AdjustScreenWrap onClick={e => e.stopPropagation()}>
                  <div className="bold Font18">{_l('强制适应屏幕%07001')}</div>
                  <div className="hint">
                    {_l(
                      '强制页面适应一屏显示，适合需要在所有尺寸屏幕下始终铺满的情况。（ 如果原始页面过长，组件会被压缩，导致无法正常显示 ）',
                    )}
                  </div>
                  <Switch
                    checked={adjustScreen}
                    onChange={() => {
                      onClick('adjustScreen', { adjustScreen: !adjustScreen });
                    }}
                  />
                </AdjustScreenWrap>
              ),
            },
          ],
        };
      }

      return {
        ...rest,
        key: type,
        'data-event': type,
        onClick: () => onClick(type),
        icon: renderMenuIcon({ ...rest, icon }),
        label: <span>{text}</span>,
      };
    });
