import React, { useState, useCallback, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import cx from 'classnames';
import { Modal, Icon, ScrollView, LoadDiv } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import _ from 'lodash';
import { SOURCE_FROM_TYPE, CREATE_TYPE, ROLE_TYPE } from '../../constant';
import dataSourceApi from '../../../api/datasource';
import { formatDate } from '../../../config';

const ExistSourceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .headerWrapper {
    height: 50px;
    width: 100%;
    box-sizing: border-box;
    border-bottom: 1px solid #eaeaea;

    .searchInput {
      background: #fff;
      width: 94%;
      height: 36px;
      margin-top: 7px;
      margin-left: 10px;
    }
  }
  .contentWrapper {
    flex: 1;
  }
`;

const LeftListWrapper = styled.div`
  padding: 16px;
  width: 260px;
  box-sizing: border-box;
  border-right: 1px solid #e0e0e0;

  ul {
    margin-bottom: 40px !important;
    li {
      display: inline-flex;
      align-items: center;
      height: 36px;
      width: 100%;
      border-radius: 3px;
      cursor: pointer;
      .liIcon {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 36px;
        height: 36px;
        .svg-icon {
          width: 16px;
          height: 16px;
        }
      }

      &:hover {
        background: #f7f7f7;
      }

      &.isCur {
        background: #f0f7ff;
        span {
          font-weight: 600;
        }
      }
    }
    .categoryText {
      padding: 12px 0;
      margin-bottom: 0;
      color: #757575;
      font-size: 12px;
    }
  }

  .leftFooter {
    position: absolute;
    width: 100%;
    text-align: center;
    bottom: 16px;
    cursor: pointer;

    &:hover {
      span,
      i {
        color: #2196f3 !important ;
      }
    }
  }
`;

const RightListWrapper = styled.div`
  flex: 1;
  padding: 12px;
  min-height: 570px;
  box-sizing: border-box;

  .listItem {
    display: flex;
    align-items: center;
    height: 72px;
    width: 100%;
    border-radius: 3px;
    font-size: 13px;
    cursor: pointer;

    .itemIcon {
      padding: 0 20px;
      .svg-icon {
        width: 22px;
        height: 22px;
      }
    }
    .itemText {
      padding: 12px 0;
      overflow: hidden;
      p {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-bottom: 6px;
        font-size: 14px;
        color: #333;
        font-weight: 600;
      }
      span {
        margin-right: 8px;
        color: #9e9e9e;
      }
    }

    &:hover {
      background: #f7f7f7;
    }
  }
`;

const NoDataWrapper = styled.div`
  text-align: center !important;
  margin-top: 170px;
  .iconCon {
    width: 130px;
    height: 130px;
    line-height: 130px;
    background: #fbfbfb;
    border-radius: 50%;
    color: #9e9e9e;
  }
`;

let listAjaxPromise = null;
export default function ExistSourceModal(props) {
  const { connectorConfigData = {}, roleType, setConnectorConfigData, onClose } = props;
  const [searchKeyWords, setSearchKeyWords] = useState('');
  const [currentTab, setCurrentTab] = useState(SOURCE_FROM_TYPE.ALL);
  const [dsTypeList, setDsTypeList] = useState([]);
  const [dataSourceList, setDataSourceList] = useState([]);
  const [loadingState, setLoadingState] = useSetState({ loading: false, pageNo: 0, noMore: false });

  useEffect(() => {
    const fetchTypeParams = {
      projectId: props.currentProjectId,
      onlyRelatedTask: false,
      onlyCreated: true,
    };
    dataSourceApi.getTypes(fetchTypeParams).then(res => {
      if (res) {
        const filterRes = res.filter(item => _.includes([ROLE_TYPE.ALL, roleType.toUpperCase()], item.roleType));
        const dataList = [
          {
            key: SOURCE_FROM_TYPE.LOCAL,
            text: _l('本地'),
            list: filterRes.filter(item => item.fromType === SOURCE_FROM_TYPE.LOCAL),
          },
          {
            key: SOURCE_FROM_TYPE.CLOUD,
            text: _l('云端'),
            list: filterRes.filter(item => item.fromType === SOURCE_FROM_TYPE.CLOUD),
          },
          {
            key: SOURCE_FROM_TYPE.MESSAGE_QUEUE,
            text: _l('消息队列'),
            list: filterRes.filter(item => item.fromType === SOURCE_FROM_TYPE.MESSAGE_QUEUE),
          },
        ];
        let isExist = false;

        dataList.forEach(item => {
          item.list = _.uniqBy(item.list, o => o.id);

          if (item.list.filter(obj => obj.type === _.get(connectorConfigData[roleType], 'type')).length > 0) {
            isExist = true;
          }
        });

        setDsTypeList(dataList);
        setCurrentTab(isExist ? connectorConfigData[roleType] : SOURCE_FROM_TYPE.ALL);
      }
    });
  }, []);

  useEffect(() => {
    if (dsTypeList.length) {
      setLoadingState({ pageNo: 0 });
      onFetchSourceList();
    }
  }, [currentTab, searchKeyWords]);

  useEffect(() => {
    if (loadingState.pageNo !== 0) {
      onFetchSourceList();
    }
  }, [loadingState.pageNo]);

  //获取数据源列表
  const onFetchSourceList = () => {
    setLoadingState({ loading: true });
    const fetchSourceParams = {
      projectId: props.currentProjectId,
      pageNo: loadingState.pageNo,
      pageSize: 20,
      searchBody: searchKeyWords,
      dsType: currentTab === 'ALL' ? null : currentTab.type,
      roleType: roleType.toUpperCase(),
    };
    if (listAjaxPromise) {
      listAjaxPromise.abort();
    }
    listAjaxPromise = dataSourceApi.list(fetchSourceParams);
    listAjaxPromise.then(res => {
      listAjaxPromise = null;
      if (res) {
        const list = res.content
          .filter(item => item.id !== (connectorConfigData[roleType] || {}).id)
          .map(item => {
            return {
              ...item,
              address: item.hosts[0].split(':')[0],
            };
          });
        setDataSourceList(loadingState.pageNo > 0 ? dataSourceList.concat(list) : list);
        setLoadingState({ loading: false, noMore: res.content.length < 10 });
      }
    });
  };

  const onSearch = useCallback(
    _.debounce(value => {
      setSearchKeyWords(value);
    }, 500),
    [],
  );

  const onSelect = selectItem => {
    //获取数据源详情以回填表单
    dataSourceApi.getDatasource({ projectId: props.currentProjectId, datasourceId: selectItem.id }).then(res => {
      if (res) {
        const detail = {
          ...res,
          address: res.hosts[0].split(':')[0],
          post: res.hosts[0].split(':')[1],
          type: selectItem.dsTypeInfo,
        };

        setConnectorConfigData({
          [roleType]: Object.assign({}, connectorConfigData[roleType], selectItem.dsTypeInfo, {
            id: selectItem.id,
            createType: CREATE_TYPE.SELECT_EXIST,
            sourceName: selectItem.name,
            formData: detail,
          }),
        });
        onClose();
      }
    });
  };

  const onScrollEnd = () => {
    if (loadingState.loading || loadingState.noMore) return;
    setLoadingState({ loading: true, pageNo: loadingState.pageNo + 1 });
  };

  return (
    <Modal visible width={1000} type="fixed" bodyStyle={{ padding: '0' }} onCancel={onClose}>
      <ExistSourceWrapper>
        <div className="headerWrapper">
          <SearchInput
            className="searchInput"
            placeholder={_l('搜索数据源名称、地址')}
            value={searchKeyWords}
            onChange={onSearch}
          />
        </div>
        <div className="contentWrapper">
          <div className="flexRow h100">
            <LeftListWrapper>
              <div className="relative h100">
                <ul>
                  <li
                    className={cx({ isCur: currentTab === SOURCE_FROM_TYPE.ALL })}
                    onClick={() => setCurrentTab(SOURCE_FROM_TYPE.ALL)}
                  >
                    <div className="liIcon">
                      <Icon icon="storage" className="Font16" />
                    </div>
                    <span>{_l('全部')}</span>
                  </li>
                  {dsTypeList.map((item, i) => {
                    return (
                      item.list.length > 0 && (
                        <React.Fragment key={i}>
                          <p className="categoryText">{item.text}</p>
                          {item.list.map((connectorConfigData, j) => {
                            return (
                              <li
                                key={`${i}-${j}`}
                                className={cx({ isCur: connectorConfigData.type === currentTab.type })}
                                onClick={() => setCurrentTab(connectorConfigData)}
                              >
                                <div className="liIcon">
                                  <svg className="icon svg-icon" aria-hidden="true">
                                    <use xlinkHref={`#icon${connectorConfigData.className}`} />
                                  </svg>
                                </div>
                                <span>{connectorConfigData.name}</span>
                              </li>
                            );
                          })}
                        </React.Fragment>
                      )
                    );
                  })}
                </ul>

                <a className="leftFooter" href="/integration/source" target="_blank">
                  <span className="bold Gray">{_l('去集成中心添加')}</span>
                  <Icon icon="launch" className="Gray_9e mLeft5 mTop2" />
                </a>
              </div>
            </LeftListWrapper>
            <RightListWrapper>
              <ScrollView onScrollEnd={onScrollEnd}>
                {loadingState.loading && loadingState.pageNo === 0 ? (
                  <LoadDiv />
                ) : dataSourceList.length > 0 ? (
                  dataSourceList.map((item, index) => {
                    return (
                      <div key={index} className="listItem" onClick={() => onSelect(item)}>
                        <div className="itemIcon">
                          <svg className="icon svg-icon" aria-hidden="true">
                            <use xlinkHref={`#icon${item.dsTypeInfo.className}`} />
                          </svg>
                        </div>
                        <div className="itemText">
                          <p>{item.name}</p>
                          <span>{item.dsTypeInfo.name}</span>
                          <span>{item.address}</span>
                          <span>{_l('创建于 %0', formatDate(item.createTime))}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <NoDataWrapper>
                    <span className="iconCon InlineBlock TxtCenter ">
                      <i className="icon-storage Font64 TxtMiddle" />
                    </span>
                    <p className="Gray_9e mTop28 mBottom0">{_l('暂无可选择数据')}</p>
                  </NoDataWrapper>
                )}
              </ScrollView>
            </RightListWrapper>
          </div>
        </div>
      </ExistSourceWrapper>
    </Modal>
  );
}
