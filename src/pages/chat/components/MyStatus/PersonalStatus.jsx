import React, { useState } from 'react';
import { Fragment } from 'react';
import { Button, Popup } from 'antd-mobile';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import filterXss from 'xss';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import personalStyleApi from 'src/api/personalStyle';
import createLinksForMessage from 'src/utils/createLinksForMessage';
import { formatDateShow } from './util';

const StatusWrap = styled.div`
  display: flex;
  align-items: center;
  height: 28px;
  border-radius: 16px;
  padding: 10px 12px;
  font-weight: 400;
  font-size: 13px;
  background-color: #fff;
  border: 1px solid #ddd;
  .statusNotStarted {
    max-width: 100%;
    display: flex;
    align-items: center;
  }
  &.fitContent {
    width: fit-content;
    max-width: 100%;
  }
  img {
    width: 16px;
    height: 16px;
    margin-bottom: 2px;
  }
  .icon-closeelement-bg-circle {
    display: none;
  }
  &.hover:hover {
    background-color: #f5f5f5;
    .icon-closeelement-bg-circle {
      display: inline-block;
    }
  }
  &.noBorder {
    border: none;
  }
  &.statusIsEnabled {
    background-color: #f5f9ff !important;
    border: 1px solid #0077fa;
    &:hover {
      background-color: #f5f9ff !important;
    }
  }
  .time {
    text-overflow: initial !important;
    overflow: initial !important;
    white-space: nowrap !important;
  }
`;

const EmojiWrap = styled.span`
  img {
    width: 14px;
    height: 14px;
    margin-bottom: 2px;
  }
`;

export default function PersonalStatus(props) {
  const { className, onlyEmoji, showCancel, onStatusOption = {}, isMobile, isSetting, onClick = () => {} } = props;
  const { statusId, icon, remark, beginTime, endTime, durationOption } = onStatusOption;
  const accountId = props.accountId || onStatusOption.accountId;
  const isSelf = accountId === _.get(md, 'global.Account.accountId');
  const started = moment(beginTime).isBefore(moment());
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // 取消状态二次确认
  const handleConfirmCancel = e => {
    e.stopPropagation();
    setShowCancelConfirm(true);
  };

  // 取消状态
  const onCancel = e => {
    e.stopPropagation();
    personalStyleApi.cancelPersonalStatus({ statusId }).then(res => {
      if (res) {
        props.onCancel && props.onCancel();
        alert(_l('取消成功'));
      }
    });
  };

  if (
    _.isEmpty(onStatusOption) ||
    !durationOption ||
    (!isSelf && !started) ||
    (endTime && moment(endTime).isBefore(moment()))
  ) {
    return null;
  }

  const time = formatDateShow(!started ? beginTime : endTime);

  if (onlyEmoji) {
    return (
      <Tooltip title={`${remark} ${time} ${_l('结束')}`}>
        <EmojiWrap
          className={className}
          dangerouslySetInnerHTML={{ __html: filterXss(createLinksForMessage({ message: icon }), {}) }}
        />
      </Tooltip>
    );
  }

  const renderCon = () => {
    return (
      <Fragment>
        <div dangerouslySetInnerHTML={{ __html: filterXss(createLinksForMessage({ message: icon }), {}) }} />
        <span className="mLeft5 mRight10 ellipsis remark" title={remark}>
          {remark}
        </span>
        <span className="time Gray_9e">{`${time} ${!started ? _l('开始') : _l('结束')}`}</span>
        {isSetting && !started && (
          <i className="icon icon-access_time Gray_9e mLeft5 Font16" style={{ verticalAlign: 'text-bottom' }} />
        )}
      </Fragment>
    );
  };

  return (
    <StatusWrap
      className={`flexRow ${className ? className : ''} ${isSetting && started ? 'statusIsEnabled' : ''}`}
      onClick={onClick}
    >
      {!isMobile && isSetting && !started ? (
        <Tooltip
          title={
            <div>
              <duv>{_l('状态未开始')}</duv>
              <div>{`${formatDateShow(beginTime)} ${_l('开始')} - ${formatDateShow(endTime)} ${_l('结束')}`}</div>
            </div>
          }
        >
          <div className="statusNotStarted flex minWidth0">{renderCon()}</div>
        </Tooltip>
      ) : (
        renderCon()
      )}
      {!isMobile && isSetting && !started ? '' : <div className="flex"></div>}
      {showCancel ? (
        isMobile ? (
          <Icon icon="close" className="Gray_9e Font16" onClick={handleConfirmCancel} />
        ) : (
          <Tooltip title={_l('取消状态')}>
            <Icon icon="closeelement-bg-circle" className="Gray_9e Font16 mLeft10" onClick={onCancel} />
          </Tooltip>
        )
      ) : null}

      {showCancelConfirm && (
        <Popup
          className="mobileModal topRadius"
          visible={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
        >
          <div className="Black Font17 bold mTop24 mBottom24 mLeft16">{_l('确认取消当前个人状态？')}</div>
          <div className="flexRow pLeft16 pRight16 pBottom12">
            <Button className="flex mRight6 bold Gray_75 Font14" onClick={() => setShowCancelConfirm(false)}>
              {_l('取消')}
            </Button>
            <Button className="flex mLeft6 bold Font14" color="primary" onClick={onCancel}>
              {_l('确认')}
            </Button>
          </div>
        </Popup>
      )}
    </StatusWrap>
  );
}
