import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Support } from 'ming-ui';
import agentApi from 'src/api/agent';
import { buildFormFieldsControls } from 'src/components/Mingo/ChatBot/utils';
import CreateAIDialog from 'src/pages/worksheet/components/CreateAIDialog';
import { genBotSessionId } from 'src/utils/agentSession';
import { pathCompletion } from 'src/utils/common';

export default function CreateAIActionDialog(props) {
  const { worksheetInfo = {}, onCancel, onSuccess } = props;
  const [{ remark, loadingAIsuggestions, generateLoading, suggestionList }, setState] = useSetState({
    suggestionList: [],
  });

  const generateSuggestionList = (isReload = false) => {
    setState({ loadingAIsuggestions: true });
    agentApi
      .agentExecute({
        agentName: 'record-ai-actions-recommender',
        sessionId: genBotSessionId(),
        message: _l('开始'),
        forceRefresh: isReload,
        context: {
          language: window.getCurrentLang() || 'zh-Hans',
          appName: worksheetInfo.appName,
          worksheetName: worksheetInfo.name,
          worksheetRemark: worksheetInfo.remark,
          fields: JSON.stringify(buildFormFieldsControls(worksheetInfo)),
        },
      })
      .then(res => {
        const recommendations = res?.data?.recommendations || [];
        setState({
          loadingAIsuggestions: false,
          suggestionList: [
            { name: _l('总结记录内容'), description: _l('分析记录字段值，提炼当前记录内容的核心信息') },
            ...recommendations,
          ].map(item => ({ ...item, summary: item.name })),
        });
      })
      .catch(() => {
        setState({ loadingAIsuggestions: false, suggestionList: [] });
      });
  };

  const handleOk = (params = {}) => {
    setState({ generateLoading: true });
    const description = params?.remark || remark;
    agentApi
      .agentExecute({
        agentName: 'record-ai-action-builder',
        sessionId: genBotSessionId(),
        message: _l('开始'),
        context: {
          appName: worksheetInfo.appName,
          worksheetName: worksheetInfo.name,
          worksheetRemark: worksheetInfo.remark,
          taskName: params?.name || '',
          taskDescription: description,
          fields: JSON.stringify(buildFormFieldsControls(worksheetInfo)),
          language: window.getCurrentLang() || 'zh-Hans',
        },
      })
      .then(res => {
        const data = res?.data || {};
        onSuccess({ ...data });
        setState({ generateLoading: false });
        onCancel();
      })
      .catch(() => {
        setState({ generateLoading: false });
      });
  };

  useEffect(() => {
    generateSuggestionList();
  }, []);

  return (
    <CreateAIDialog
      visible
      title={_l('创建 AI 动作')}
      width={800}
      okText={_l('创建')}
      okDisabled={!remark}
      description={
        !window.platformENV.isOverseas && !window.platformENV.isLocal ? (
          <span>
            <span>{_l('AI 动作消耗的Token将从组织信用点扣除')}</span>
            <Support type={3} text={_l('了解模型价格')} href={pathCompletion('/billingrules')} />
          </span>
        ) : (
          _l('您可以选择下列选项，快速创建 AI 动作.')
        )
      }
      aiTitle={_l('AI 建议')}
      customTitle={_l('自定义创建')}
      customDescription={_l('描述你希望 AI 动作实现的目标和功能。例如：“依据当前客户记录生成跟进建议”')}
      placeholder={_l('AI 将根据您的描述自动生成AI 动作的名称以及提示词 ”')}
      loadingAIsuggestions={loadingAIsuggestions}
      generateLoading={generateLoading}
      aiList={suggestionList}
      refresh={() => generateSuggestionList(true)}
      defaultAIsuggestions={[
        { summary: _l('总结记录内容'), description: _l('分析记录字段值，提炼当前记录内容的核心信息') },
      ]}
      updateData={(data, callback = () => {}) => {
        setState({ ...data });
        callback({ ...data });
      }}
      onOk={handleOk}
      onCancel={onCancel}
    />
  );
}
