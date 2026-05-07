import React, { createContext, Fragment, useContext, useEffect, useMemo, useReducer } from 'react';
import { Modal } from 'ming-ui';
import knowledgeAjax from '../../api/knowledge';
import worksheetAjax from 'src/api/worksheet';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import Button from '../../components/Button';
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
  }, [aiEnabled, worksheetIsLoaded, appId]);

  return (
    <Modal visible className="createKnowledgeModal" width={1000} onCancel={onClose}>
      <CreateKnowledgeContext.Provider value={contextValue}>
        <div className="createRagContainer">
          <div className="header">
            <span>{_l('创建知识库')}</span>
            <span> - {activeStep.title}</span>
          </div>
          {/* 选择工作表 */}
          {activeStep.id === 'selectSheet' && (
            <Fragment>
              <SheetSelector />
              <div className="footer">
                <Button type="text" onClick={onClose}>
                  {_l('取消')}
                </Button>
                <Button type="primary" onClick={handleToNextStep}>
                  {_l('下一步')}
                </Button>
              </div>
            </Fragment>
          )}
          {/* 配置字段 */}
          {activeStep.id === 'configFields' && (
            <Fragment>
              <FieldConfig attachmentEnhancedTip={attachmentEnhancedTip} />
              <div className="footer">
                <Button type="text" onClick={handleToPrevStep}>
                  {_l('上一步')}
                </Button>
                <Button type="primary" onClick={handleToNextStep}>
                  {_l('下一步')}
                </Button>
              </div>
            </Fragment>
          )}
          {/* 设置名称和说明 */}
          {activeStep.id === 'setNameAndDesc' && (
            <Fragment>
              <BaseInfo />
              <div className="footer">
                <Button type="text" onClick={handleToPrevStep}>
                  {_l('上一步')}
                </Button>
                <Button type="primary" onClick={handleCreateKnowledge}>
                  {_l('创建')}
                </Button>
              </div>
            </Fragment>
          )}
        </div>
      </CreateKnowledgeContext.Provider>
      {loading && <div className="createRagLoading"></div>}
    </Modal>
  );
};

export default CreateKnowledge;
