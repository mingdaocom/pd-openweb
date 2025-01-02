import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, SvgIcon } from 'ming-ui';
import { publishStatus2Text, formatDate } from 'src/pages/integration/config';
import { Switch } from 'antd';
import { LogoWrap } from 'src/pages/integration/apiIntegration/style';
const Wrap = styled.div`
  z-index: 11111;
  p {
    margin: 0;
  }
  background: #ffffff;
  border: 1px solid #f5f5f5;
  border-radius: 8px;
  padding: 0 40px 0 12px;
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
      color: #9e9e9e;
      &:hover {
        color: #2196f3;
      }
    }
    .del {
      &:hover {
        color: red;
      }
    }
  }
  .StatusTxt {
    opacity: 1;
    position: absolute;
    max-width: 145px;
  }
  &:hover {
    border: 1px solid #e8e8e8;
    .name {
      color: #2196f3;
    }
    .optionCon {
      opacity: 1;
    }
    .StatusTxt {
      opacity: 0;
    }
  }
  .statusBox {
    width: 62px;
  }
  .publishStatusCon {
    width: 145px;
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
        <div className="bg" style={{ backgroundColor: props.item.iconColor || '#757575' }}></div>
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
          <p className="Font13 Gray_9e WordBreak overflow_ellipsis" title={props.item.explain}>
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
        {props.item.publishStatus === 1 && props.item.enabled && (
          <span
            className={cx(
              'StatusTxt mLeft40 Font12 ellipsis',
              props.item.publishStatus === 1 ? 'ThemeColor3' : 'Gray_9e',
            )}
          >{`${formatDate(props.item.lastModifiedDate)} ${publishStatus2Text[props.item.publishStatus]}`}</span>
        )}
        <div className="optionCon mLeft40">
          <span data-tip={_l('日志')}>
            <Icon
              className="Font18 Hand InlineBlock"
              icon="restore2"
              onClick={() => {
                props.onOpenLog(props.item);
              }}
            />
          </span>
          <span data-tip={_l('复制')} className="mLeft25">
            <Icon
              className={cx('Font18 InlineBlock', { 'Gray_9e Alpha5': !props.canEdit, Hand: props.canEdit })}
              icon="copy"
              onClick={() => {
                if (!props.canEdit) {
                  return;
                }
                props.onCopyProcess(props.item);
              }}
            />
          </span>
          <span data-tip={_l('删除')} className="mLeft25">
            <Icon
              className={cx('Font18 InlineBlock del', { 'Gray_9e Alpha5': !props.canEdit, Hand: props.canEdit })}
              icon="delete1"
              onClick={() => {
                if (!props.canEdit) {
                  return;
                }
                props.onDel && props.onDel(props.item);
              }}
            />
          </span>
        </div>
      </div>
    </Wrap>
  );
}

export default APICard;
