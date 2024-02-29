import React, { useState, Fragment } from 'react';
import { Drawer } from 'antd-mobile';
import styled from 'styled-components';
import cx from 'classnames';

const SearchCom = styled.div`
  display: flex;
  align-items: center;
  border-radius: 24px;
  padding: 10px 10px 10px 12px;
  .searchWrap {
    height: 32px;
    background-color: rgb(255, 255, 255);
    border-radius: 24px;
    padding: 8px 14px;
  }
  .filterWrap {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
    border-radius: 50%;
    margin-left: 10px;
  }
`;

const DrawerWrap = styled(Drawer)`
  &.filterStepListWrapper {
    z-index: 100;
    position: fixed;
  }
`;

const AppContent = styled.div`
  width: 335px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 18px 0 10px 16px;
  border-radius: 14px 0px 0px 14px;
  .closeIcon {
    width: 24px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    background: #e6e6e6;
    border-radius: 50%;
  }
  .appList {
    flex: 1;
    overflow-y: auto;
  }
  .appItem {
    display: flex;
    align-items: center;
    height: 40px;
  }
`;

export default function SearchWrap(props) {
  const { apps = [], handleSearchList = () => {} } = props;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchValue, setSearchValue] = useState();
  const [selectAppId, setSelectAppId] = useState('all');

  return (
    <SearchCom>
      <div className="searchWrap flexRow alignItemsCenter flex">
        <i className="icon icon-h5_search Gray_9e Font16 mRight10" />
        <input
          type="search"
          className="pAll0 Border0 w100"
          placeholder={_l('搜索')}
          value={searchValue}
          onChange={e => {
            const { value } = e.target;
            setSearchValue(value);
            handleSearchList({ searchValue: value });
          }}
          onKeyDown={e => {
            if (e.which === 13) {
              handleSearchList({ searchValue });
            }
          }}
        />
      </div>
      <div
        className="filterWrap"
        onClick={() => {
          setDrawerVisible(true);
        }}
      >
        <i
          className={cx('icon icon-filter Font20', {
            Gray_9e: selectAppId === 'all',
            ThemeColor: selectAppId !== 'all',
          })}
        />
      </div>

      {drawerVisible ? (
        <DrawerWrap
          className="filterStepListWrapper"
          position="right"
          sidebar={
            <AppContent>
              <div className="header flexRow alignItemsCenter mBottom10 pRight16">
                <div className="Font17 bold flex">{_l('按应用')}</div>
                <div className="closeIcon" onClick={() => setDrawerVisible(false)}>
                  <i className="icon icon-close Gray_9e" />
                </div>
              </div>
              <div className="appList pRight16">
                {[{ appId: 'all', appName: _l('全部') }].concat(apps).map(item => {
                  return (
                    <div
                      key={item.appId}
                      className="Font14 appItem"
                      onClick={() => {
                        setSelectAppId(item.appId);
                        handleSearchList({ appId: item.appId });
                        setDrawerVisible(false);
                      }}
                    >
                      <div className="flex ellipsis">{item.appName}</div>
                      {selectAppId === item.appId && <i className="icon icon-done ThemeColor Font18" />}
                    </div>
                  );
                })}
              </div>
            </AppContent>
          }
          open={drawerVisible}
          onOpenChange={() => setDrawerVisible(!drawerVisible)}
        >
          <Fragment />
        </DrawerWrap>
      ) : (
        ''
      )}
    </SearchCom>
  );
}
