import React, { Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { SvgIcon } from 'ming-ui';

const UpgradeContentItem = styled.div`
  padding: 0 12px;
  border-radius: 3px 3px 3px 3px;
  border: 1px solid #dddddd;
  margin-bottom: 30px;
  .itemTitle {
    height: 52px;
    align-items: center;
  }
  .rowItem {
    height: 44px;
    border-bottom: 1px solid #eaeaea;
    &.hoverRowItem:hover {
      background-color: #f5f5f5;
      margin: 0 -12px;
      padding: 0 12px;
    }
  }
  .noBorder {
    border: none !important;
  }
  .actionTag {
    padding: 3px 12px;
    border-radius: 4px;
  }
  .actionAdd {
    color: #4d8f43;
    background: #eaf9e9;
  }
  .actionDelete {
    color: #f44336;
    background: rgba(244, 67, 54, 0.1);
  }
  .actionUpdate {
    color: #eb9139;
    background: rgba(235, 145, 57, 0.28);
  }
  .w50 {
    width: 50px;
  }
`;

export default function UpgradeItemWrap(props) {
  const {
    titleClassName,
    isWorksheetDetail,
    item = {},
    itemList = [],
    isExpand,
    fileType = 0,
    modelType,
    handleExpandCollapse = () => {},
    openShowUpgradeDetail = () => {},
  } = props;
  const { type } = item;

  return (
    <UpgradeContentItem className={`${isWorksheetDetail ? 'pAll0 Border0' : ''}`}>
      {!isWorksheetDetail && (
        <div className="flexRow itemTitle">
          <div className="flex">
            {item.icon && <i className={`icon-${item.icon} Gray_9e Font18 mRight7 TxtMiddle`} />}
            <span className={cx('bold TxtMiddle', titleClassName)}>{item.name}</span>
          </div>
          <div className="w50 TxtCenter">
            <i
              className={cx(`Gray_bd Font18 Hand ${isExpand ? 'icon-arrow-up-border' : 'icon-arrow-down-border'}`)}
              onClick={() => handleExpandCollapse(item)}
            />
          </div>
        </div>
      )}
      {isExpand && (
        <Fragment>
          <div className="flexRow alignItemsCenter Gray_9e bold rowItem">
            <div className="flex flexRow name">
              <span>{_l('名称(源)')}</span>
            </div>
            <div className="flex action">{_l('动作')}</div>
            <div className="flex flexRow originalName">
              <span>{_l('名称(目标)')}</span>
            </div>
            <div className="w50 TxtLeft"></div>
          </div>
          {itemList
            .filter(v => (!modelType && v.upgradeType !== 4) || modelType)
            .map((it, i) => {
              const isAdd = it.upgradeType === 3 || fileType === 1;
              const isDelete = it.upgradeType === 4;
              return (
                <div
                  key={it.id}
                  className={cx('flexRow alignItemsCenter Gray rowItem hoverRowItem', {
                    noBorder: i === itemList.length - 1,
                  })}
                >
                  {!isDelete ? (
                    <div className="flex flexRow name alignItemsCenter">
                      {it.iconUrl ? (
                        <div>
                          <SvgIcon className="mRight5 mTop2" url={it.iconUrl} fill="#9e9e9e" size={16} />
                        </div>
                      ) : it.icon ? (
                        <i className={`icon-${it.icon} Gray_9e mRight3`} />
                      ) : (
                        ''
                      )}
                      <span className="ellipsis">{it.displayName}</span>
                    </div>
                  ) : (
                    <div className="flex flexRow name alignItemsCenter"></div>
                  )}
                  <Fragment>
                    <div className="flex action">
                      <span
                        className={cx('actionTag', {
                          actionAdd: isAdd,
                          actionDelete: isDelete,
                          actionUpdate: !isAdd && !isDelete,
                        })}
                      >
                        {isAdd ? _l('新增') : isDelete ? _l('删除') : _l('更新')}
                      </span>
                    </div>
                    {!isAdd ? (
                      <div className="flex flexRow originalName alignItemsCenter">
                        {it.originalIconUrl ? (
                          <div>
                            <SvgIcon className="mRight5 mTop2" url={it.originalIconUrl} fill="#9e9e9e" size={16} />
                          </div>
                        ) : it.originIcon ? (
                          <i className={`icon-${it.originIcon} Gray_9e mRight3`} />
                        ) : (
                          ''
                        )}
                        <span className="ellipsis">{it.originalName}</span>
                      </div>
                    ) : (
                      <div className="flex flexRow originalName"></div>
                    )}
                    <div className="w50 TxtLeft">
                      {type === 'worksheets' && !isDelete ? (
                        <span className="Hand ThemeColor" onClick={() => openShowUpgradeDetail(it)}>
                          {_l('详情')}
                        </span>
                      ) : (
                        ''
                      )}
                    </div>
                  </Fragment>
                </div>
              );
            })}
        </Fragment>
      )}
    </UpgradeContentItem>
  );
}
