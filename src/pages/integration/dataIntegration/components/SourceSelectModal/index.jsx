import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import { Modal, ScrollView, LoadDiv } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { DATABASE_TYPE, ROLE_TYPE, SOURCE_FROM_TYPE, SOURCE_FROM_TYPE_TAB_LIST } from '../../constant';
import dataSourceApi from '../../../api/datasource';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .headerWrapper {
    height: 115px;
    .headerContent {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .searchInput {
      height: 36px;
      width: 240px;
    }
  }

  .contentWrapper {
    margin: 0 -12px;

    .isCommon {
      height: 0;
      padding: 0 !important;
      margin: 0 !important;
    }
  }
`;

const TabList = styled.div`
  ul {
    /* text-align: center; */
    li {
      display: inline-block;
      margin-right: 32px;
      box-sizing: border-box;
      border-bottom: 4px solid rgba(0, 0, 0, 0);
      a {
        color: #333;
        display: inline-block;
        font-size: 15px;
      }
      &.isCur {
        border-bottom: 4px solid #2196f3;
        a {
          color: #2196f3;
        }
      }
    }
  }
`;

const DataSourceCard = styled.div`
  display: inline-block;
  width: 144px;
  height: 150px;
  background: #fff;
  margin: 0 12px;
  border-radius: 12px;
  box-sizing: border-box;
  cursor: pointer;

  .content {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    align-items: center;
    .svg-icon {
      width: 36px;
      height: 36px;
    }
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

const NoDataWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default function SourceSelectModal({ projectId, isCreateConnector, onChange, onClose, roleType }) {
  const [currentTab, setCurrentTab] = useState(SOURCE_FROM_TYPE.COMMON);
  const [searchKeyWords, setSearchKeyWords] = useState('');
  const [dataSourceList, setDataSourceList] = useState([]);

  useEffect(() => {
    const params = {
      projectId,
      onlyRelatedTask: false,
      onlyCreated: false,
    };
    dataSourceApi.getTypes(params).then(res => {
      if (res && _.isArray(res)) {
        const list = isCreateConnector
          ? res.filter(item => _.includes([ROLE_TYPE.ALL, roleType.toUpperCase()], item.roleType))
          : res.filter(item => item.type !== DATABASE_TYPE.APPLICATION_WORKSHEET);

        const sourceList = [
          {
            key: SOURCE_FROM_TYPE.COMMON,
            text: _l('常用'),
            list: list.filter(item => item.isCommon),
          },
          {
            key: SOURCE_FROM_TYPE.LOCAL,
            text: _l('本地'),
            list: list.filter(item => item.fromType === SOURCE_FROM_TYPE.LOCAL),
          },
          {
            key: SOURCE_FROM_TYPE.CLOUD,
            text: _l('云端'),
            list: list.filter(item => item.fromType === SOURCE_FROM_TYPE.CLOUD),
          },
          {
            key: SOURCE_FROM_TYPE.MESSAGE_QUEUE,
            text: _l('消息队列'),
            list: list.filter(item => item.fromType === SOURCE_FROM_TYPE.MESSAGE_QUEUE),
          },
        ];
        setDataSourceList(sourceList.filter(item => item.list.length !== 0));
      }
    });
  }, []);

  const getFilterList = () => {
    return dataSourceList
      .map(item => {
        return { ...item, list: item.list.filter(i => i.name.toLowerCase().includes(searchKeyWords.toLowerCase())) };
      })
      .filter(item => item.list.length !== 0);
  };

  return (
    <Modal visible type="fixed" width={900} bodyStyle={{ padding: '32px' }} onCancel={onClose}>
      <Wrapper>
        <div className="headerWrapper">
          <h5 className="Font17 Gray bold mBottom20">{_l('选择数据源类型')}</h5>
          <div className="headerContent">
            <TabList>
              <ul>
                {SOURCE_FROM_TYPE_TAB_LIST.map((item, index) => {
                  return (
                    <li
                      key={index}
                      className={cx({ isCur: item.key === currentTab })}
                      onClick={() => {
                        if (currentTab === item.key) {
                          return;
                        }
                        setCurrentTab(item.key);
                        document.getElementById(item.key) && document.getElementById(item.key).scrollIntoView();
                      }}
                    >
                      <a className="pLeft18">{item.text}</a>
                    </li>
                  );
                })}
              </ul>
            </TabList>
            <SearchInput
              className="searchInput"
              placeholder={_l('搜索')}
              value={searchKeyWords}
              onChange={_.debounce(value => {
                setSearchKeyWords(value);
              }, 500)}
            />
          </div>
        </div>

        {!!getFilterList().length ? (
          <ScrollView className="flex">
            <div className="contentWrapper">
              {getFilterList().map((item, i) => {
                return (
                  <React.Fragment key={i}>
                    <p
                      id={item.key}
                      className={cx('Font14 Gray_9e pTop40 pLeft12 pRight12', {
                        isCommon: item.key === SOURCE_FROM_TYPE.COMMON,
                      })}
                    >
                      {item.text}
                    </p>
                    {item.list.map((sourceType, j) => {
                      return (
                        <DataSourceCard key={`${i}-${j}`} onClick={() => onChange(sourceType)}>
                          <div className="content">
                            <svg className="icon svg-icon" aria-hidden="true">
                              <use xlinkHref={`#icon${sourceType.className}`} />
                            </svg>
                            <div className="mTop10">{sourceType.name}</div>
                          </div>
                        </DataSourceCard>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </ScrollView>
        ) : !!dataSourceList.length ? (
          <NoDataWrapper>
            <div className="Gray_9e Font15">{_l('无搜索结果')}</div>
          </NoDataWrapper>
        ) : (
          <LoadDiv />
        )}
      </Wrapper>
    </Modal>
  );
}
