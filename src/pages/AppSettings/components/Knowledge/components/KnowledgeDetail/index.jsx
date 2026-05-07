import React, { memo, useState } from 'react';
import { KnowledgeDetailViewMode } from '../../core/config';
import ChunkPreview from './components/ChunkPreview';
import KnowledgeWorksheet from './components/KnowledgeWorksheet';

const KnowledgeDetail = props => {
  const { appId, projectId, knowledgeId, backToList } = props;

  const [viewMode, setViewMode] = useState(KnowledgeDetailViewMode.WORKSHEET);
  const [knowledgeDetail, setKnowledgeDetail] = useState({});
  const [knowledgeCollection, setKnowledgeCollection] = useState({});

  const handleOpenChunkPreview = (knowledgeDetail, worksheet) => {
    setViewMode(KnowledgeDetailViewMode.CHUNK_PREVIEW);
    setKnowledgeDetail(knowledgeDetail);
    setKnowledgeCollection(worksheet);
  };

  const handleBackToList = () => {
    setViewMode(KnowledgeDetailViewMode.WORKSHEET);
  };

  const renderContent = () => {
    switch (viewMode) {
      case KnowledgeDetailViewMode.WORKSHEET:
        return (
          <KnowledgeWorksheet
            appId={appId}
            projectId={projectId}
            knowledgeId={knowledgeId}
            backToList={backToList}
            openChunkPreview={handleOpenChunkPreview}
          />
        );
      case KnowledgeDetailViewMode.CHUNK_PREVIEW:
        return (
          <ChunkPreview
            knowledgeDetail={knowledgeDetail}
            knowledgeCollection={knowledgeCollection}
            backToList={handleBackToList}
          />
        );
    }
  };

  return renderContent();
};

export default memo(KnowledgeDetail);
