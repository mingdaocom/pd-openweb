import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, SvgIcon, Tooltip } from 'ming-ui';
import { addBehaviorLog } from 'src/util';

const RecordItem = styled.div`
  margin-top: 12px;
  border-radius: 3px;
  border: 1px solid #e2e2e2;
  position: relative;
  &:hover {
    .icon-drag {
      display: block;
    }
    .options {
      opacity: 1;
      display: flex;
    }
    .appName {
      opacity: 0;
      display: none;
    }
    .nameDivider {
      display: none;
    }
    .stickyTop {
      display: block !important;
    }
    &.forCard {
      background: #f8f8f8;
    }
    &:not(.forCard) {
      box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.04);
    }
  }

  &.forCard {
    margin-top: 0;
    height: 40px;
    border: none;
    .leftContent {
      padding: 8px 20px;
      .itemName {
        font-weight: normal;
      }
    }
    .rightContent {
      min-width: 0;
      .delFav,
      .toDes,
      .stickyTop {
        width: 30px;
        min-width: 30px;
        height: 30px;
        line-height: 30px;
        &:hover {
          background: #fff;
        }
      }
    }
  }

  .leftContent {
    flex: 1;
    flex-shrink: 0;
    min-width: 0;
    padding: 16px 20px;
    min-width: 120px;
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
      font-weight: bold;
    }
  }
  .rightContent {
    padding: 5px;
    justify-content: flex-end;
    min-width: 240px;

    .delFav,
    .toDes,
    .stickyTop {
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 4px;
      &:hover {
        background: #f5f5f5;
      }
      i {
        color: #9e9e9e;
        vertical-align: middle;
      }
    }
    .divider {
      width: 1px;
      height: 16px;
      background: #ddd;
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
  .icon-drag {
    position: absolute;
    left: 3px;
    top: 50%;
    transform: translateY(-50%);
    display: none;
    color: #bdbdbd;
    &:hover {
      color: #9e9e9e;
    }
  }
`;

export default function Item(props) {
  const { forCard, DragHandle, canDrag, isTop, onUpdateFavoriteTop } = props;

  return (
    <RecordItem
      key={props.favoriteId}
      className={cx('flexRow alignItemsCenter Hand', { forCard })}
      onClick={props.onShowRecord}
    >
      <div className="leftContent flexRow alignItemsCenter overflow_ellipsis">
        {canDrag && (
          <DragHandle>
            <Icon icon="drag" className="Font14 mRight5 pointer" />
          </DragHandle>
        )}
        <div
          className="itemIcon flexRow alignItemsCenter justifyContentCenter"
          style={{ backgroundColor: props.worksheetIconColor }}
        >
          <SvgIcon url={props.worksheetIconUrl} fill={'#fff'} size={15} />
        </div>
        <div className="itemName overflow_ellipsis mLeft12 flex">{props.title}</div>
      </div>
      <div className="rightContent flexRow alignItemsCenter">
        {!forCard && (
          <div className="appName mLeft10 overflow_ellipsis TxtRight Gray_9e mRight20 flex">
            {props.appName}.{props.workSheetName}
          </div>
        )}
        <div className="options flexRow alignItemsCenter">
          {!forCard && (
            <React.Fragment>
              <span className="flex Gray_9e TxtRight">{createTimeSpan(props.createTime)}</span>
              <div className="divider mLeft16 mRight5" />
            </React.Fragment>
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
              <Icon className="Font20" icon="launch" />
            </div>
          </Tooltip>
          <Tooltip text={_l('取消收藏')} popupPlacement="bottom">
            <div
              className="delFav"
              onClick={e => {
                props.remove();
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Icon className="Font20" icon="star_off" />
            </div>
          </Tooltip>
        </div>
        {isTop && !forCard && <div className="divider mRight10 nameDivider"></div>}
        <Tooltip text={isTop ? _l('取消置顶') : _l('置顶')} popupPlacement="bottom">
          <div
            className={cx('stickyTop mRight12', { hide: !isTop || forCard })}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              onUpdateFavoriteTop();
            }}
          >
            <Icon className="Font20" icon={isTop ? 'unpin' : 'folder-top'} />
          </div>
        </Tooltip>
      </div>
    </RecordItem>
  );
}
