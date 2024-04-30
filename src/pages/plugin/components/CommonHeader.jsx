import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import _ from 'lodash';

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  .searchInput {
    width: 200px;
    margin-right: 10px;
    border: 1px solid #e0e0e0;
    background: #fff;
    input {
      min-width: 0;
    }
  }
`;

const AddBtn = styled.div`
  padding: 8px 24px;
  min-width: 92px;
  background: #2196f3;
  border-radius: 18px;
  color: #fff;
  display: inline-block;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background: #1764c0;
  }
`;

export default function CommonHeader(props) {
  const { showSearch, title, description, limitInfo, keywords, onSearch, onAdd, addText } = props;

  return (
    <HeaderWrapper>
      <div className="flex">
        <div className="flexRow alignItemsCenter mBottom12 LineHeight36">
          <div className="Bold Font24">{title}</div>
          <div className="Font14 bold Gray_75 mLeft8">{limitInfo}</div>
        </div>
        <p className="Font15 mBottom0 flexRow alignItemsCenter">{description}</p>
      </div>
      {showSearch && (
        <div className="flexRow">
          <SearchInput className="searchInput" placeholder={_l('搜索')} value={keywords} onChange={onSearch} />
          <AddBtn onClick={onAdd}>
            <Icon icon="add" className="Font13" />
            <span className="mLeft5 bold LineHeight20">{addText}</span>
          </AddBtn>
        </div>
      )}
    </HeaderWrapper>
  );
}
