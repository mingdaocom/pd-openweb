import React, { useState, useEffect, useCallback } from 'react';
import { useSetState } from 'react-use';
import { Dialog, LoadDiv, ScrollView, Icon } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import styled from 'styled-components';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import _ from 'lodash';
import assistantApi from 'src/api/assistant';
import { navigateTo } from 'src/router/navigateTo';
import { formatFileSize } from 'src/util';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .searchInput {
    width: 200px;
    margin-right: 10px;
    border: 1px solid #e0e0e0;
    background: #fff;
    input {
      min-width: 0;
    }
  }
  .knowledgeItem {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 64px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    cursor: pointer;
    .nameText {
      font-size: 15px;
      font-weight: 500;
    }
    &:hover {
      border-color: #2196f3;
    }
  }
`;

const EmptyContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .iconWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: #f5f5f5;
    margin-bottom: 20px;
  }
`;

function SelectKnowledgeBase(props) {
  const { onOk, onClose, projectId } = props;
  const [fetchState, setFetchState] = useSetState({ loading: true, pageIndex: 1, noMore: false, keywords: '' });
  const [knowledgeList, setKnowledgeList] = useState([]);

  const onFetch = () => {
    if (!fetchState.loading) return;
    assistantApi
      .getListKnowledgeBase({
        projectId,
        pageIndex: fetchState.pageIndex,
        pageSize: 50,
        keywords: fetchState.keywords,
      })
      .then(res => {
        if (res) {
          const filterList = res.list.filter(item => item.fileCount);
          setKnowledgeList(fetchState.pageIndex > 1 ? knowledgeList.concat(filterList) : filterList);
          setFetchState({ loading: false, noMore: res.list.length < 50 });
        }
      })
      .catch(error => {
        setFetchState({ loading: false });
      });
  };

  const onScrollEnd = () => {
    if (!fetchState.noMore && !fetchState.loading) {
      setFetchState({ loading: true, pageIndex: fetchState.pageIndex + 1 });
    }
  };

  const onSearch = useCallback(
    _.debounce(value => {
      setFetchState({ loading: true, pageIndex: 1, keywords: value });
    }, 500),
    [],
  );

  useEffect(onFetch, [fetchState.loading, fetchState.pageIndex, fetchState.keywords]);

  return (
    <Dialog visible type="fixed" showFooter={false} width={660} title={_l('选择知识库')} onCancel={onClose}>
      <Wrapper>
        <div className="flexRow alignItemsCenter">
          <SearchInput
            className="searchInput"
            placeholder={_l('搜索')}
            value={fetchState.keywords}
            onChange={onSearch}
          />
          <div className="flex" />
          <div
            className="InlineBlock ThemeColor ThemeHoverColor2 pointer"
            onClick={() => {
              onClose();
              navigateTo('/plugin/knowledgeBase');
            }}
          >
            {_l('+ 新建知识库')}
          </div>
        </div>

        {!knowledgeList.length &&
          (fetchState.loading ? (
            <LoadDiv className="mTop10" />
          ) : (
            <EmptyContent>
              <div className="iconWrapper">
                <Icon icon="import_contacts" className="Font48 Gray_bd" />
              </div>
              <div className="mBottom20 Font17 Gray_bd">{_l('暂无数据，请先添加知识库')}</div>
            </EmptyContent>
          ))}

        {!!knowledgeList.length && (
          <ScrollView className="flex" onScrollEnd={onScrollEnd}>
            {knowledgeList.map(item => {
              return (
                <div
                  className="knowledgeItem"
                  onClick={() => {
                    onOk(item);
                    onClose();
                  }}
                >
                  <div className="nameText">{item.name}</div>
                  <div className="Font14 Gray_9e">{formatFileSize(item.fileSize)}</div>
                </div>
              );
            })}
            {fetchState.loading && <LoadDiv className="mTop10" />}
          </ScrollView>
        )}
      </Wrapper>
    </Dialog>
  );
}

export default props => functionWrap(SelectKnowledgeBase, { ...props });
