import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Support } from 'ming-ui';
import mingoAjax from 'src/api/mingo';
import CreateAIDialog from 'src/pages/worksheet/components/CreateAIDialog';

export default function CreateAIActionDialog(props) {
  const { appId, worksheetId, onCancel, onSuccess } = props;
  const [{ remark, loadingAIsuggestions, generateLoading, suggestionList }, setState] = useSetState({
    suggestionList: [],
  });

  const generateSuggestionList = (isReload = false) => {
    setState({ loadingAIsuggestions: true });
    mingoAjax
      .generateAIActionInfo({
        appId,
        worksheetId,
        isReload,
        langType: window.getCurrentLangCode(),
      })
      .then(({ recommendations = [] }) => {
        setState({
          loadingAIsuggestions: false,
          suggestionList: [
            { name: _l('总结记录内容'), description: _l('分析记录字段值，提炼当前记录内容的核心信息') },
            ...recommendations,
          ].map(item => ({ ...item, summary: item.name })),
        });
      });
  };

  const handleOk = (params = {}) => {
    setState({ generateLoading: true });
    mingoAjax
      .generateAIActionInfo({
        name: params?.name || '',
        appId,
        worksheetId,
        description: params?.remark || remark,
        isReload: false,
        langType: window.getCurrentLangCode(),
      })
      .then(data => {
        const res = _.isArray(data?.recommendations)
          ? _.find(data.recommendations, v => v.name === params?.name) || {}
          : data;
        onSuccess({ ...res, description: params?.remark || remark });
        setState({ generateLoading: false });
        onCancel();
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
            <Support type={3} text={_l('了解模型价格')} href={md.global.Config.WebUrl + 'billingrules'} />
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
