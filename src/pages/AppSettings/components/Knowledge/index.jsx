import React, { useState } from 'react';
import { Support } from 'ming-ui';
import KnowledgeDetail from './components/KnowledgeDetail';
import KnowledgeList from './components/KnowledgeList';
import { ViewMode } from './core/config';
import { parseKidHash } from './core/utils';
import './index.less';

const VECTOR_KNOWLEDGE_HELP_URL = 'https://docs-pd.mingdao.com/faq/integrate/ai/rag';

const getInitialKnowledgeId = () => {
  const params = parseKidHash() || {};
  return params.type === 'kid' && params.value ? params.value : '';
};

const getInitialState = () => {
  const knowledgeId = getInitialKnowledgeId();

  return {
    knowledgeId,
    viewMode: knowledgeId ? ViewMode.DETAIL : ViewMode.LIST,
  };
};

const renderUnavailableContent = () => {
  return (
    <div className="knowledgeUnavailable">
      <div className="imgWrap" />
      <div className="hint">
        {_l('向量数据库服务未部署，知识库暂不可用')}
        {!window.platformENV.isPlatform && <Support type={3} href={VECTOR_KNOWLEDGE_HELP_URL} text={_l('查看帮助')} />}
      </div>
    </div>
  );
};

const Knowledge = props => {
  const { appId, projectId } = props;

  const [{ knowledgeId, viewMode }, setState] = useState(getInitialState);

  const handleOpenKnowledgeDetail = knowledgeId => {
    setState({ viewMode: ViewMode.DETAIL, knowledgeId });
  };

  const handleBackToList = () => {
    setState({ viewMode: ViewMode.LIST, knowledgeId: '' });
  };

  const renderContent = () => {
    if ((window.platformENV.isLocal || window.platformENV.isOverseas) && !md.global.Config.EnableRAG) {
      return renderUnavailableContent();
    }

    if (viewMode === ViewMode.LIST) {
      return <KnowledgeList appId={appId} projectId={projectId} openKnowledgeDetail={handleOpenKnowledgeDetail} />;
    }

    return (
      <KnowledgeDetail appId={appId} projectId={projectId} knowledgeId={knowledgeId} backToList={handleBackToList} />
    );
  };

  return <div className="RagContainer">{renderContent()}</div>;
};

export default Knowledge;
