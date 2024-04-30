import React, { useEffect, useState, useCallback } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { LoadDiv, Dialog } from 'ming-ui';
import CommonHeader from '../components/CommonHeader';
import KnowledgeList from './KnowledgeList';
import assistantApi from 'src/api/assistant';
import AddOrEditKnowledge from './AddOrEditKnowledge';
import EmptyContent from '../components/EmptyContent';
import _ from 'lodash';
import { formatFileSize } from 'src/util';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';

const Wrapper = styled.div`
  background: #fff;
  min-height: 100%;
  padding: 32px;
`;

export default function KnowledgeBase(props) {
  const { currentProjectId } = props;
  const [fetchState, setFetchState] = useSetState({
    keywords: '',
    pageIndex: 1,
    loading: true,
    noMore: false,
    sortInfo: { sort: 0, isAsc: false },
  });
  const [list, setList] = useState([]);
  const [limitCount, setLimitCount] = useState({});
  const [addOrEdit, setAddOrEdit] = useState({ visible: false, editRecord: null });
  const featureType = getFeatureStatus(currentProjectId, VersionProductType.assistant);

  useEffect(() => {
    assistantApi.getKnowledgeFileTotalSize({ projectId: currentProjectId }).then(res => {
      res && setLimitCount(res);
    });
  }, []);

  useEffect(() => fetchKnowledgeList(), [fetchState.loading, fetchState.pageIndex, fetchState.keywords]);

  const fetchKnowledgeList = () => {
    if (!fetchState.loading) return;
    assistantApi
      .getListKnowledgeBase({
        projectId: currentProjectId,
        pageIndex: fetchState.pageIndex,
        pageSize: 50,
        keywords: fetchState.keywords,
        ...fetchState.sortInfo,
      })
      .then(res => {
        if (res) {
          setList(fetchState.pageIndex > 1 ? list.concat(res.list) : res.list);
          setFetchState({ loading: false, noMore: res.list.length < 50 });
        }
      })
      .catch(error => {
        setFetchState({ loading: false });
      });
  };

  const onAdd = () => {
    const isExceed = limitCount.knowledgeBaseLimitFileSize <= 0;
    if (isExceed) {
      Dialog.confirm({
        buttonType: 'danger',
        title: _l('容量不足'),
        description: _l('超过知识库可用容量'),
        removeCancelBtn: true,
      });
    } else {
      setAddOrEdit({ visible: true });
    }
  };

  const onSearch = useCallback(
    _.debounce(value => setFetchState({ keywords: value, loading: true, pageIndex: 1 }), 500),
    [],
  );

  const onDelete = knowledgeBaseId => {
    assistantApi.deleteKnowledgeBase({ projectId: currentProjectId, knowledgeBaseId }).then(res => {
      if (res) {
        alert(_l('删除成功'));
        setList(list.filter(item => item.id !== knowledgeBaseId));
      }
    });
  };

  if (featureType === '2') {
    return buriedUpgradeVersionDialog(currentProjectId, VersionProductType.assistant, { dialogType: 'content' });
  }

  return (
    <Wrapper className="flexColumn h100">
      <CommonHeader
        title={_l('知识库')}
        description={_l('从工作表中获取文件来生成问答知识，通过助手的搭建实现基于知识的问答服务。')}
        limitInfo={`(${formatFileSize(limitCount.knowledgeBaseTotalFileSize)} / ${formatFileSize(
          limitCount.knowledgeBaseTotalLimitFileSize,
        )})`}
        showSearch={!!list.length || fetchState.keywords}
        keywords={fetchState.keywords}
        onSearch={onSearch}
        onAdd={onAdd}
        addText={_l('知识')}
      />

      {!list.length &&
        (fetchState.loading ? (
          <LoadDiv className="mTop10" />
        ) : (
          <EmptyContent
            icon="import_contacts"
            emptyText={fetchState.keywords ? _l('暂无搜索结果') : _l('暂无数据，请先添加知识')}
            showAddIcon={!fetchState.keywords}
            onAdd={onAdd}
            addText={_l('知识')}
          />
        ))}

      {!!list.length && (
        <KnowledgeList
          projectId={currentProjectId}
          list={list}
          loading={fetchState.loading}
          sortInfo={fetchState.sortInfo}
          onSort={sortInfo => setFetchState({ loading: true, pageIndex: 1, sortInfo })}
          onScrollEnd={() => {
            if (!fetchState.noMore && !fetchState.loading) {
              setFetchState({ loading: true, pageIndex: fetchState.pageIndex + 1 });
            }
          }}
          onEdit={editRecord => setAddOrEdit({ visible: true, editRecord })}
          onDelete={onDelete}
        />
      )}

      {addOrEdit.visible && (
        <AddOrEditKnowledge
          projectId={currentProjectId}
          editRecord={addOrEdit.editRecord}
          onClose={() => setAddOrEdit({ visible: false })}
          onRefreshList={() => setFetchState({ loading: true, pageIndex: 1 })}
          onUpdateSuccess={(id, updateObj) =>
            setList(list.map(item => (item.id === id ? { ...item, ...updateObj } : item)))
          }
        />
      )}
    </Wrapper>
  );
}
