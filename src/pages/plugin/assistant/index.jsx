import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { LoadDiv, Dialog, ScrollView } from 'ming-ui';
import CommonHeader from '../components/CommonHeader';
import AssistantList from './AssistantList';
import assistantApi from 'src/api/assistant';
import CreateOrUpdateAssistant from './createOrUpdateAssistant';
import SelectKnowledgeBase from './createOrUpdateAssistant/SelectKnowledgeBase';
import EmptyContent from '../components/EmptyContent';
import _ from 'lodash';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';

const Wrapper = styled.div`
  background: #fff;
  min-height: 100%;
  padding: 32px;
`;

export default function Assistant(props) {
  const { currentProjectId } = props;
  const [list, setList] = useState([]);
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState({});
  const [addOrEdit, setAddOrEdit] = useState({ visible: false });
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const featureType = getFeatureStatus(currentProjectId, VersionProductType.assistant);

  useEffect(() => {
    assistantApi.getAIAssistantLimitNumber({ projectId: currentProjectId }).then(res => {
      res && setLimitCount(res);
    });
  }, []);

  useEffect(() => fetchAssistantList(), [keywords]);

  const fetchAssistantList = () => {
    !loading && setLoading(true);
    assistantApi
      .getList({ projectId: currentProjectId, keywords })
      .then(res => {
        if (res) {
          setLoading(false);
          setList(res);
        }
      })
      .catch(error => {
        setLoading(false);
      });
  };

  const onAdd = () => {
    const isExceed = limitCount.aiAssistantLimitNumber <= 0;
    if (isExceed) {
      Dialog.confirm({
        buttonType: 'danger',
        title: _l('容量不足'),
        description: _l('超过助手数量限制'),
        removeCancelBtn: true,
      });
    } else {
      SelectKnowledgeBase({
        projectId: currentProjectId,
        onOk: data => {
          setKnowledgeBase({
            knowledgeBaseId: data.id,
            knowledgeBaseName: data.name,
            knowledgeFileSize: data.fileSize,
          });
          Dialog.confirm({
            title: _l('提醒'),
            description: _l('本功能需要将对话数据传输至 OpenAI，请确认知晓并开始使用'),
            onOk: () => setAddOrEdit({ visible: true }),
            removeCancelBtn: true,
          });
        },
      });
    }
  };

  const onSearch = useCallback(
    _.debounce(value => setKeywords(value), 500),
    [],
  );

  const onDelete = assistantId => {
    assistantApi.delete({ projectId: currentProjectId, assistantId }).then(res => {
      if (res) {
        alert(_l('删除成功'));
        setList(list.filter(item => item.id !== assistantId));
        window.updateAssistantApiList && window.updateAssistantApiList();
      }
    });
  };

  const onSwitchStatus = (assistantId, status, cb) => {
    assistantApi.setStatus({ projectId: currentProjectId, assistantId, status }).then(res => {
      if (res) {
        cb && cb();
        setList(list.map(item => (item.id === assistantId ? { ...item, status } : item)));
        window.updateAssistantApiList && window.updateAssistantApiList();
      }
    });
  };

  if (featureType === '2') {
    return buriedUpgradeVersionDialog(currentProjectId, VersionProductType.assistant, { dialogType: 'content' });
  }

  return (
    <Wrapper className="flexColumn h100">
      <CommonHeader
        title={_l('助手')}
        description={_l('基于企业知识组学习，搭建 AI 问答助手')}
        limitInfo={`(${limitCount.aiAssistantCount || 0} / ${limitCount.aiAssistantTotalLimitNumber || 0})`}
        showSearch={!!list.length || keywords}
        keywords={keywords}
        onSearch={onSearch}
        onAdd={onAdd}
        addText={_l('助手')}
      />
      {!list.length &&
        (loading ? (
          <LoadDiv className="mTop10" />
        ) : (
          <EmptyContent
            icon="contact_support"
            emptyText={keywords ? _l('暂无搜索结果') : _l('暂无数据，请先添加助手')}
            showAddIcon={!keywords}
            onAdd={() => setAddOrEdit({ visible: true })}
            addText={_l('助手')}
          />
        ))}

      {!!list.length && (
        <ScrollView className="flex mTop12">
          <AssistantList
            list={list}
            onEdit={(editId, editName) => setAddOrEdit({ visible: true, editId, editName })}
            onDelete={onDelete}
            onSwitchStatus={onSwitchStatus}
          />
          {loading && <LoadDiv className="mTop10" />}
        </ScrollView>
      )}
      {addOrEdit.visible && (
        <CreateOrUpdateAssistant
          projectId={currentProjectId}
          assistantId={addOrEdit.editId}
          assistantName={addOrEdit.editName}
          knowledgeBase={knowledgeBase}
          onClose={() => setAddOrEdit({ visible: false })}
          onRefreshList={fetchAssistantList}
          onUpdateSuccess={(id, updateObj) =>
            setList(list.map(item => (item.id === id ? { ...item, ...updateObj } : item)))
          }
          onSwitchStatus={onSwitchStatus}
        />
      )}
    </Wrapper>
  );
}
