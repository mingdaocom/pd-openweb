import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { Button, Modal } from 'ming-ui/antd-components';
import knowledgeAjax from '../../api/knowledge';
import worksheetAjax from 'src/api/worksheet';
import { formatValuesOfOriginConditions } from 'src/utils/domain/worksheet/filterValue';
import BaseInfo from './components/BaseInfo';
import FieldConfig from './components/FieldConfig';
import SheetSelector from './components/SheetSelector';
import { generateKnowledgeBasePlan, goToNextStep, goToPrevStep, setBasicInfo, setLoading } from './store/actions';
import { initialState, reducer } from './store/reducers';
import './index.less';

export const CreateKnowledgeContext = createContext();

export const useCreateKnowledgeStore = () => {
  const context = useContext(CreateKnowledgeContext);

  if (!context) {
    throw new Error('useCreateKnowledgeStore must be used within a CreateKnowledgeContext');
  }

  return context;
};

const CreateKnowledge = props => {
  const { appId, projectId, onClose, refreshKnowledgeList, attachmentEnhancedTip } = props;
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
  });
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);
  const aiEnabled = !md.global.SysSettings.hideAIBasicFun;
  const {
    loading,
    activeStep = {},
    knowledgeName,
    knowledgeDesc,
    selectedWorksheetList,
    worksheetIsLoaded,
    allWorksheetList,
  } = state;

  const handleToNextStep = async () => {
    goToNextStep(dispatch, state);
  };

  const handleToPrevStep = () => {
    goToPrevStep(dispatch, state);
  };

  const handleCreateKnowledge = async () => {
    if (!knowledgeName) {
      alert(_l('请输入名称'), 3);
      return;
    }

    const promiseList = selectedWorksheetList
      .filter(item => item.filterConditions?.length)
      .map(item => {
        return worksheetAjax.saveWorksheetFilter({
          appId,
          worksheetId: item.worksheetId,
          items: formatValuesOfOriginConditions(item.filterConditions),
          module: 3,
          name: '',
          type: '',
        });
      });

    try {
      setLoading(dispatch, true);
      const data = await Promise.all(promiseList);
      const filterMap = data?.reduce((acc, item) => {
        acc[item.worksheetId] = item.filterId;
        return acc;
      }, {});
      const params = {
        name: knowledgeName,
        description: knowledgeDesc,
        apkId: appId,
        collections: selectedWorksheetList.map(item => ({
          worksheetId: item.worksheetId,
          controlIds: item.fields.map(field => field.controlId),
          discussionEnabled: item.discussionEnabled,
          parseEnhanced: item.parseEnhanced,
          attachmentParseEnhanced: item.attachmentParseEnhanced,
          filterId: filterMap[item.worksheetId],
        })),
      };
      console.log('params', params);
      const result = await knowledgeAjax.createKnowledgeBase(params);

      if (result) {
        alert(_l('创建成功'));
        refreshKnowledgeList();
        onClose();
      }

      console.log('result', result);
      setLoading(dispatch, false);
    } catch (error) {
      console.error(error);
      setLoading(dispatch, false);
    }

    console.log('创建', state);
  };

  useEffect(() => {
    setBasicInfo(dispatch, { appId, projectId });
  }, [appId, projectId]);

  useEffect(() => {
    if (aiEnabled && worksheetIsLoaded) {
      generateKnowledgeBasePlan(dispatch, { appId, allWorksheetList });
    }
  }, [aiEnabled, worksheetIsLoaded, appId, allWorksheetList]);

  const isFirstStep = activeStep.id === 'selectSheet';
  const isLastStep = activeStep.id === 'setNameAndDesc';
  const footer = [
    <Button key="previous" type="text" disabled={loading} onClick={isFirstStep ? onClose : handleToPrevStep}>
      {isFirstStep ? _l('取消') : _l('上一步')}
    </Button>,
    <Button key="next" type="primary" loading={loading} onClick={isLastStep ? handleCreateKnowledge : handleToNextStep}>
      {isLastStep ? _l('创建') : _l('下一步')}
    </Button>,
  ];

  return (
    <Modal open className="createKnowledgeModal" width={1000} footer={footer} onCancel={onClose}>
      <CreateKnowledgeContext.Provider value={contextValue}>
        <div className="createRagContainer">
          <div className="header">
            <span>{_l('创建知识库')}</span>
            <span> - {activeStep.title}</span>
          </div>
          {/* 选择工作表 */}
          {activeStep.id === 'selectSheet' && <SheetSelector />}
          {/* 配置字段 */}
          {activeStep.id === 'configFields' && <FieldConfig attachmentEnhancedTip={attachmentEnhancedTip} />}
          {/* 设置名称和说明 */}
          {activeStep.id === 'setNameAndDesc' && <BaseInfo />}
        </div>
      </CreateKnowledgeContext.Provider>
      {loading && <div className="createRagLoading"></div>}
    </Modal>
  );
};

export default CreateKnowledge;
