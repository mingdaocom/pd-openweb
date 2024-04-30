import React, { Fragment, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';

const HeaderWrap = styled.div`
  display: flex;
  align-items: center;
  .dataAuthorizeLabel {
    font-size: 16px;
    font-weight: 600;
    color: #212121;
    margin-left: 17px;
    margin-right: 9px;
  }
`;

const ContentWrap = styled.div`
  padding: 20px 40px 20px 45px;
  .addUser {
    line-height: 36px;
    background: #2196f3;
    border-radius: 3px;
    color: #fff;
    padding: 0 12px;
    display: inline-block;
    &:hover {
      background: #0065bc;
    }
  }
  .search .roleSearch {
    width: 244px;
    height: 37px;
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
  }
`;

const ListWrap = styled.div`
  overflow-x: auto;
  background: #fff;
  .opacity0 {
    opacity: 0 !important;
  }
  .Checkbox-box {
    margin-right: 0 !important;
  }
  .wrapTr {
    align-items: center;
    display: flex;
    height: 56px;
    padding: 16px 6px;
    min-width: 126px;
    &.nameWrapTr {
      min-width: 240px !important;
      overflow: hidden;
    }
    &.timeTr {
      min-width: 130px !important;
      overflow: hidden;
    }
    &.checkBoxTr {
      min-width: 38px;
      max-width: 38px;
      position: sticky;
      background: #fff;
      left: 0;
      z-index: 1;
    }
    &.isSort {
      &:hover {
        color: #2196f3;
      }
    }
  }
  .emptyCon {
    height: auto;
    width: auto;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .iconBox {
      width: 130px;
      height: 130px;
      display: inline-block;
      border-radius: 50%;
      background-size: 130px 130px;
      background-color: #f5f5f5;
    }
  }
  .checkBoxTr {
    opacity: 0;
    &:hover {
      opacity: 1;
    }
    &.show {
      opacity: 1;
    }
  }
`;

// const WrapSort = styled.div`
//   .icon {
//     display: none;
//   }
//   &:hover {
//     color: #2196f3;
//   }
//   &:hover,
//   &.isCue {
//     .icon {
//       display: block;
//     }
//   }
// `;

const COLUMNS = [
  {
    label: _l('名称'),
    key: 'name',
    classNames: 'nameWrapTr',
  },
  {
    label: _l('类型'),
    key: 'type',
    classNames: '',
  },
  {
    label: _l('添加人'),
    key: 'addUser',
    classNames: 'nameWrapTr roleTr',
  },
  {
    label: _l('添加时间'),
    key: 'addTime',
    classNames: 'operateTime timeTr',
  },
  {
    label: _l('操作'),
    key: 'option',
    classNames: 'optionWrapTr',
  },
];

function DataAuthorize(props) {
  const { history } = props;
  const [keywords, setKeywords] = useState(undefined);

  useEffect(() => {}, []);

  const handleSearch = keyWords => {
    setKeywords(keyWords);
    // SetAppRolePagingModel({
    //   ...appRolePagingModel,
    //   pageIndex: 1,
    //   keywords: keyWords,
    // });
    // getUserList({ appId }, true);
  };

  const onSearch = _.debounce(keywords => handleSearch(keywords), 500);

  return (
    <div>
      <HeaderWrap className="exclusiveCompHeader">
        <span className="icon-backspace Font22 ThemeHoverColor3" onClick={() => history.go(-1)}></span>
        <span className="dataAuthorizeLabel">{_l('用户授权')}</span>
        <span className="dataAuthorizeName Gray_75">{_l('被授权的用户创建应用时，可选择专属数据库进行存储')}</span>
      </HeaderWrap>
      <ContentWrap>
        <div className="listActionCon flexRow alignItemsCenter">
          <span className="name Font17 bold mRight8">专属数据库实例 1</span>
          <span className="Font12 Gray_9">{_l('%0个部门、%1个组织角色、%2个职位、%3名成员', 3, 5, 3, 36)}</span>
          <span className="flex"></span>
          <div className="search InlineBlock">
            <SearchInput
              className="roleSearch"
              placeholder={_l('搜索用户、部门、组织角色、职位')}
              value={keywords}
              onChange={onSearch}
            />
          </div>
          <div className="addUser Hand mLeft20 TxtTop Bold">
            <Icon type="add" />
            {_l('添加用户')}
          </div>
        </div>
        <ListWrap className="flex">
          {/* <WrapHeader className="flexRow alignItemsCenter">
            {COLUMNS.map((o, i) => {
              return (
                <div
                  className={cx('wrapTr overflow_ellipsis WordBreak Gray_9e Bold', o.classNames, {
                    isSort: isSort,
                    Hand: isSort,
                  })}
                  key={`dataAuthorize-col-${o.key}`}
                >
                  {o.label}
                </div>
              );
            })}
          </WrapHeader> */}
        </ListWrap>
      </ContentWrap>
    </div>
  );
}

export default withRouter(DataAuthorize);
