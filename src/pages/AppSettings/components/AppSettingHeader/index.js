import React, { Fragment } from 'react';
import { any, bool, element, func, string } from 'prop-types';
import styled from 'styled-components';
import { Support, UpgradeIcon } from 'ming-ui';
import { Button, Input } from 'ming-ui/antd-components';

const ADD_BUTTON_PROPS = { type: 'primary' };
const UPGRADE_ADD_BUTTON_PROPS = { color: 'default', variant: 'filled' };

const HeaderWrap = styled.div`
  margin-bottom: 24px;
  .content {
    height: 40px;
  }
  .searchWrap {
    width: 200px;
    height: 36px;
    border-radius: 18px;
    margin-left: 20px;
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
    extraTitleElement,
    link,
    customBtn,
    handleSearch = () => {},
    handleAdd = () => {},
  } = props;

  return (
    <HeaderWrap className={warpClassName}>
      <div className="flexRow alignItemsCenter content">
        <div className="Font17 bold flex">
          <span>{title}</span>
          {extraTitleElement && <Fragment>{extraTitleElement}</Fragment>}
        </div>
        {extraElement && <Fragment>{extraElement}</Fragment>}
        {showSearch && (
          <Input
            className="searchWrap"
            prefix={<i className="icon-search Font18 textTertiary" />}
            placeholder={_l('搜索') || placeholder}
            onChange={event => handleSearch(event.target.value)}
          />
        )}
        {addBtnName ? (
          <Button
            {...(needUpgrade ? UPGRADE_ADD_BUTTON_PROPS : ADD_BUTTON_PROPS)}
            className="mLeft20"
            shape="round"
            icon={<i className={`icon icon-${addIcon || 'plus'}`} />}
            onClick={handleAdd}
          >
            {addBtnName}
            {needUpgrade && <UpgradeIcon />}
          </Button>
        ) : customBtn ? (
          customBtn
        ) : null}
      </div>
      {description && (
        <div>
          <span className="textSecondary TxtMiddle">{description}</span>
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
  extraTitleElement: any,
  handleAdd: func,
  link: string,
  customBtn: element, // 自定义添加按钮
};
