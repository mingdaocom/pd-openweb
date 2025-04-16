import React, { Fragment } from 'react';
import cx from 'classnames';
import { any, bool, element, func, string } from 'prop-types';
import styled from 'styled-components';
import { Button, Input, Support, UpgradeIcon } from 'ming-ui';

const HeaderWrap = styled.div`
  margin-bottom: 24px;
  .content {
    height: 40px;
  }
  .searchWrap {
    display: flex;
    align-items: center;
    width: 200px;
    height: 36px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 18px;
    padding: 0 12px;
    margin-left: 20px;
    overflow: hidden;
    .ming.Input {
      flex: 1;
      border: none;
      background-color: inherit;
      padding: 0 7px;
    }
  }
  .needUpgrade {
    background: #eee;
    color: #151515;
    &:hover {
      background: #dbdbdb;
    }
  }
`;

export default function AppSettingHeader(props) {
  const {
    warpClassName,
    title,
    showSearch,
    placeholder,
    addIcon,
    addBtnName,
    needUpgrade,
    description,
    extraElement,
    link,
    customBtn,
    handleSearch = () => {},
    handleAdd = () => {},
  } = props;

  return (
    <HeaderWrap className={warpClassName}>
      <div className="flexRow alignItemsCenter content">
        <div className="Font17 bold flex">{title}</div>
        {extraElement && <Fragment>{extraElement}</Fragment>}
        {showSearch && (
          <div className="searchWrap">
            <i className="icon-search Font18 Gray_9d" />
            <Input className="flex" placeholder={_l('搜索') || placeholder} onChange={handleSearch} />
          </div>
        )}
        {addBtnName ? (
          <Button className={cx(`mLeft20 pLeft20 pRight20`, { needUpgrade })} type="primary" radius onClick={handleAdd}>
            <i className={`icon icon-${addIcon ? addIcon : 'plus'} Font12 mRight5`} />
            {addBtnName}
            {needUpgrade && <UpgradeIcon />}
          </Button>
        ) : customBtn ? (
          customBtn
        ) : null}
      </div>
      {description && (
        <div>
          <span className="Gray_75 TxtMiddle">{description}</span>
          {link && <Support text={_l('帮助')} type={3} href={link} />}
        </div>
      )}
    </HeaderWrap>
  );
}

AppSettingHeader.propTypes = {
  warpClassName: string,
  title: string,
  showSearch: bool,
  placeholder: string,
  handleSearch: func,
  addBtnName: string,
  needUpgrade: bool,
  description: string,
  extraElement: any,
  handleAdd: func,
  link: string,
  customBtn: element, // 自定义添加按钮
};
