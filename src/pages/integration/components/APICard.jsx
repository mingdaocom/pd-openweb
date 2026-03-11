import React from 'react';
import { Switch } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { LogoWrap } from 'src/pages/integration/apiIntegration/style';
import { formatDate, publishStatus2Text } from 'src/pages/integration/config';

const Wrap = styled.div`
  z-index: 11111;
  p {
    margin: 0;
  }
  background: var(--color-background-primary);
  border: 1px solid var(--color-background-secondary);
  border-radius: 8px;
  padding: 0 20px 0 12px;
  align-items: center;
  margin-bottom: 16px;
  .logo {
    border-radius: 8px;
    width: 48px;
    height: 48px;
    margin: 12px 0;
  }
  .ant-switch-checked {
    background-color: rgba(40, 202, 131, 1);
  }
  .optionCon {
    opacity: 0;
    .icon {
      color: var(--color-text-tertiary);
      &:hover {
        color: var(--color-primary);
      }
    }
    .del {
      &:hover {
        color: var(--color-error);
      }
    }
  }
  .StatusTxt {
    opacity: 1;
    position: absolute;
    max-width: 200px;
  }
  &:hover {
    border: 1px solid var(--color-border-secondary);
    .name {
      color: var(--color-primary);
    }
    .optionCon {
      opacity: 1;
    }
    .StatusTxt {
      opacity: 0;
      z-index: -1;
    }
  }
  .statusBox {
    width: 62px;
  }
  .publishStatusCon {
    width: 200px;
  }
  .apiDesCon {
    height: 74px;
  }
`;

// api 列表上的卡片
function APICard(props) {
  return (
    <Wrap className="flexRow alignItemsCenter">
      <LogoWrap className="logo iconWrap flexRow alignItemsCenter justifyContentCenter">
        <div className="bg" style={{ backgroundColor: props.item.iconColor || 'var(--color-text-secondary)' }}></div>
        {props.item.iconName ? (
          <SvgIcon url={props.item.iconName} fill={props.item.iconColor} size={32} />
        ) : (
          <Icon icon="rocket_launch" className={'Font32'} />
        )}
      </LogoWrap>
      <div
        className="flex pLeft16 apiDesCon pRight16 overflowHidden Hand justifyContentCenter flexColumn"
        onClick={() => {
          props.onOpenInfo(props.item);
        }}
      >
        <div className="">
          <p className="Font15 Bold name Hand WordBreak overflow_ellipsis">{props.item.name}</p>
          <p className="Font13 textTertiary WordBreak overflow_ellipsis" title={props.item.explain}>
            {props.item.explain}
          </p>
        </div>
      </div>
      <div className="statusBox flexColumn">
        <Switch
          checkedChildren={_l('开启')}
          unCheckedChildren={_l('关闭')}
          disabled={!props.isConnectOwner} //只有超级管理员和拥有者可以操作点击有权限的API的「状态」开关
          checked={!!props.item.enabled}
          onClick={() => {
            if (!props.isConnectOwner) {
              return;
            }
            props.switchEnabled(props.item);
          }}
        />
      </div>
      <div className="publishStatusCon">
        <span
          className={cx('StatusTxt mLeft40 Font12', props.item.publishStatus === 1 ? 'ThemeColor3' : 'textTertiary')}
        >
          {props?.item?.lastModifiedDate && props?.item?.publishStatus
            ? `${formatDate(props.item.lastModifiedDate)} ${publishStatus2Text[props.item.publishStatus]}`
            : props?.item?.createdDate
              ? `${_l('创建于')} ${formatDate(props.item.createdDate)}`
              : ''}
        </span>

        <div className="optionCon mLeft40 TxtCenter">
          <Tooltip title={_l('日志')}>
            <span>
              <Icon
                className="Font18 Hand InlineBlock"
                icon="restore2"
                onClick={() => {
                  props.onOpenLog(props.item);
                }}
              />
            </span>
          </Tooltip>
          <Tooltip title={_l('复制')}>
            <span className="mLeft25">
              <Icon
                className={cx('Font18 InlineBlock', { 'textTertiary Alpha5': !props.canEdit, Hand: props.canEdit })}
                icon="copy"
                onClick={() => {
                  if (!props.canEdit) {
                    return;
                  }
                  props.onCopyProcess(props.item);
                }}
              />
            </span>
          </Tooltip>
          <Tooltip title={_l('删除')}>
            <span className="mLeft25">
              <Icon
                className={cx('Font18 InlineBlock del', { 'textTertiary Alpha5': !props.canEdit, Hand: props.canEdit })}
                icon="trash"
                onClick={() => {
                  if (!props.canEdit) {
                    return;
                  }
                  props.onDel && props.onDel(props.item);
                }}
              />
            </span>
          </Tooltip>
        </div>
      </div>
    </Wrap>
  );
}

export default APICard;
