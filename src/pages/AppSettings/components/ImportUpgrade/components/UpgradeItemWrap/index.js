import React, { Fragment } from 'react';
import styled from 'styled-components';
import CheckBox from 'ming-ui/components/Checkbox';
import SvgIcon from 'src/components/SvgIcon';
import cx from 'classnames';

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
  .addTxtColor {
    color: #4caf50;
  }
  .w50 {
    width: 50px;
  }
  .partialChanges {
    font-size: 12px;
    color: #757575;
    background-color: #eaeaea;
    padding: 0 7px;
    border-radius: 12px;
  }
`;

export default function UpgradeItemWrap(props) {
  const {
    titleClassName,
    isWorksheetDetail,
    item = {},
    itemList = [],
    isExpand,
    checkedInfo = {},
    worksheetDetailData = {},
    handleExpandCollapse = () => {},
    checkAllCurrentType = () => {},
    checkItem = () => {},
    openShowUpgradeDetail = () => {},
  } = props;
  const { type } = item;

  return (
    <UpgradeContentItem>
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
      {isExpand && (
        <Fragment>
          <div className="flexRow alignItemsCenter Gray_9e bold rowItem">
            <div className="flex flexRow name">
              {/* <CheckBox
                checked={checkedInfo[`${type}CheckAll`]}
                onClick={checked => checkAllCurrentType(checked, type)}
              /> */}
              <span>{_l('名称')}</span>
            </div>
            {isWorksheetDetail ? '' : <div className="flex action">{_l('动作')}</div>}
            <div className="w50 TxtLeft"></div>
          </div>
          {itemList.map((it, i) => {
            const isChecked = _.includes(checkedInfo[`${type}CheckIds`], it.id);
            return (
              <div
                key={it.id}
                className={cx('flexRow alignItemsCenter Gray rowItem hoverRowItem', {
                  noBorder: i === itemList.length - 1,
                })}
              >
                <div className="flex flexRow name alignItemsCenter">
                  {/* <CheckBox
                    checked={isChecked}
                    onClick={checked => checkItem({ checked, type, it, currentItemAllList: itemList })}
                  /> */}
                  {it.iconUrl ? (
                    <div>
                      <SvgIcon className="mRight5 mTop2" url={it.iconUrl} fill="#9e9e9e" size={16} />
                    </div>
                  ) : it.icon ? (
                    <i className={`icon-${it.icon} Gray_9e mRight3`} />
                  ) : (
                    ''
                  )}
                  <span
                    className="ellipsis"
                    // className={isWorksheetDetail ? '' : 'Hand'}
                    // onClick={() => (isWorksheetDetail ? () => {} : openShowUpgradeDetail(it))}
                  >
                    {it.displayName}
                  </span>
                  {/* {type === 'worksheets' && _.get(worksheetDetailData, `${it.id}.isPartialChanges`) && (
                    <span className="partialChanges">{_l('部分变更')}</span>
                  )} */}
                </div>
                {isWorksheetDetail ? (
                  ''
                ) : (
                  <Fragment>
                    <div className={`flex action ${it.upgradeType === 3 ? 'addTxtColor' : ''}`}>
                      {it.upgradeType === 3 ? _l('新增') : _l('更新')}
                    </div>
                    <div className="w50 TxtLeft">
                      {type === 'worksheets' ? (
                        <span className="Hand ThemeColor" onClick={() => openShowUpgradeDetail(it)}>
                          {_l('详情')}
                        </span>
                      ) : (
                        ''
                      )}
                    </div>
                  </Fragment>
                )}
              </div>
            );
          })}
        </Fragment>
      )}
    </UpgradeContentItem>
  );
}
