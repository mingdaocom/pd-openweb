import React, { useEffect, useState } from 'react';
import { Tooltip, Icon, SvgIcon } from 'ming-ui';
import styled from 'styled-components';
import { addBehaviorLog } from 'src/util';

const RecordItem = styled.div`
  margin-top: ${({ forCard }) => (!forCard ? '12px' : '0')};
  border-radius: 3px;
  ${({ forCard }) => forCard && 'height: 40px;'};
  ${({ forCard }) => !forCard && 'border: 1px solid #e2e2e2;'}
  &:hover {
    ${({ forCard }) => (!forCard ? 'box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.04);' : 'background: #F8F8F8;')}
    // ${({ forCard }) => !forCard && 'border: 1px solid transparent;'}
    .collectTime {
      display: none;
    }
    .rightIcons {
      display: flex;
    }
  }

  .leftContent {
    flex: 8;
    flex-shrink: 0;
    min-width: 0;
    padding: ${({ forCard }) => (!forCard ? '16px' : '8px 16px')};
    .itemIcon {
      width: 24px;
      min-width: 24px;
      height: 24px;
      border-radius: 4px;
      svg {
        margin-top: 3px;
      }
    }
    .itemName {
      flex-shrink: 0;
      font-weight: ${({ forCard }) => (!forCard ? 'bold' : 'normal')};
    }
  }
  .timeCon {
    font-weight: 400;
  }
  .rightCon {
    flex-shrink: 0;
    flex: 2;
    padding: 5px;
    justify-content: flex-end;
    ${({ forCard }) => !forCard && ' min-width: 240px;'};
    .delFav,
    .toDes {
      width: ${({ forCard }) => (!forCard ? '40px' : '30px')};
      height: ${({ forCard }) => (!forCard ? '40px' : '30px')};
      text-align: center;
      line-height: ${({ forCard }) => (!forCard ? '40px' : '30px')};
      border-radius: 4px;
      &:hover {
        background: ${({ forCard }) => (!forCard ? '#f5f5f5' : '#fff')};
      }
      i {
        color: #ffc402;
        vertical-align: middle;
      }
    }
  }
  .appName {
    font-weight: 400;
    opacity: 1;
  }
  .options {
    opacity: 0;
    display: none;
  }
  &:hover {
    .options {
      opacity: 1;
      display: flex;
    }
    .appName {
      opacity: 0;
      display: none;
    }
  }
`;

export default function Item(props) {
  return (
    <RecordItem
      key={props.favoriteId}
      className="flexRow alignItemsCenter Hand"
      onClick={props.onShowRecord}
      forCard={props.forCard}
    >
      <div className="leftContent flexRow alignItemsCenter overflow_ellipsis">
        <div
          className="itemIcon flexRow alignItemsCenter justifyContentCenter"
          style={{ backgroundColor: props.appColor }}
        >
          <SvgIcon url={props.appIconUrl} fill={'#fff'} size={15} />
        </div>
        <div className="itemName overflow_ellipsis mLeft12 flex">{props.title}</div>
      </div>
      <div className="rightCon flexRow">
        {!props.forCard && (
          <div className="appName mLeft10 overflow_ellipsis TxtRight Gray_9e mRight20 flex">
            {props.appName}.{props.workSheetName}
          </div>
        )}
        <div className="options flexRow alignItemsCenter">
          {!props.forCard && (
            <span className="timeCon flex Gray_9e TxtRight mRight3">{createTimeSpan(props.createTime)}</span>
          )}
          <Tooltip text={_l('在新页面中打开')} popupPlacement="bottom">
            <div
              className="toDes"
              onClick={e => {
                addBehaviorLog('worksheetRecord', props.worksheetId, { rowId: props.rowId });
                window.open(
                  `${window.subPath || ''}/app/${props.appId}/${props.worksheetId}${
                    props.viewId ? '/' + props.viewId : ''
                  }/row/${props.rowId}`,
                );
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Icon className="Font20 Gray_9e" icon="launch" />
            </div>
          </Tooltip>
          <Tooltip text={_l('取消收藏')} popupPlacement="bottom">
            <div
              className="delFav mRight13"
              onClick={e => {
                props.remove();
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Icon className="Font20" icon="task-star" />
            </div>
          </Tooltip>
        </div>
      </div>
    </RecordItem>
  );
}
