import React, { Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const UpgradeContentItem = styled.div`
  padding: 0 12px;
  border-radius: 3px 3px 3px 3px;
  border: 1px solid var(--color-border-primary);
  margin-bottom: 30px;
  .itemTitle {
    height: 52px;
    align-items: center;
  }
  .rowItem {
    height: 44px;
    border-bottom: 1px solid var(--color-border-secondary);
    &.hoverRowItem:hover {
      background-color: var(--color-background-hover);
      margin: 0 -12px;
      padding: 0 12px;
    }
  }
  .noBorder {
    border: none !important;
  }
  .addTxtColor {
    color: var(--color-success);
  }
  .w50 {
    width: 50px;
  }
  .partialChanges {
    font-size: 12px;
    color: var(--color-text-secondary);
    background-color: var(--color-border-secondary);
    padding: 0 7px;
    border-radius: 12px;
  }
`;

export default function UpgradeItemWrap(props) {
  const { itemList = [] } = props;

  return (
    <UpgradeContentItem>
      <Fragment>
        <div className="flexRow alignItemsCenter textTertiary bold rowItem">
          <div className="flex flexRow name">
            <span>{_l('API 名称')}</span>
          </div>
          <div className="flex">{_l('描述')}</div>
          <div className="w50 TxtLeft">{_l('动作')}</div>
        </div>
        {itemList.map((it, i) => {
          const isAdd = it.upgradeType === 3;
          return (
            <div
              key={it.id}
              className={cx('flexRow alignItemsCenter textPrimary rowItem hoverRowItem', {
                noBorder: i === itemList.length - 1,
              })}
            >
              <div className="flex flexRow name alignItemsCenter">
                <span className="ellipsis" title={it.displayName}>
                  {it.displayName}
                </span>
              </div>
              <div className="flex ellipsis" title={it.explain}>
                {it.explain}
              </div>
              <div className={`w50 TxtLeft ${isAdd ? 'addTxtColor' : ''}`}>{isAdd ? _l('新增') : _l('更新')}</div>
            </div>
          );
        })}
      </Fragment>
    </UpgradeContentItem>
  );
}
