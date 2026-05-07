import _ from 'lodash';
import mingoAjax from 'src/api/mingo';
import worksheetAjax from 'src/api/worksheet';
import { getTranslateInfo } from 'src/utils/app';
import { replaceControlsTranslateInfo } from 'src/utils/translate';

export const setLoading = (dispatch, loading) => {
  dispatch({ type: 'SET_LOADING', loading });
};

export const updateActiveSchemeId = (dispatch, scheme) => {
  dispatch({ type: 'UPDATE_ACTIVE_SCHEME', scheme });
};

export const setBasicInfo = (dispatch, { appId, projectId }) => {
  dispatch({ type: 'SET_BASIC_INFO', appId, projectId });
};

export const setAllWorksheetList = (dispatch, list) => {
  dispatch({ type: 'SET_ALL_WORKSHEET_LIST', list });
};

export const setSelectedWorksheetList = (dispatch, list = []) => {
  dispatch({ type: 'SET_SELECTED_WORKSHEET_LIST', list });
};

export const addSelectedWorksheet = (dispatch, sheet) => {
  dispatch({ type: 'ADD_SELECTED_WORKSHEET', sheet });
};

export const removeSelectedWorksheet = (dispatch, worksheetId) => {
  dispatch({ type: 'REMOVE_SELECTED_WORKSHEET', worksheetId });
};

export const resetSelectedWorksheetList = dispatch => {
  dispatch({ type: 'RESET_SELECTED_WORKSHEET_LIST' });
};

export const goToNextStep = async (dispatch, state) => {
  const { activeStep, stepList, selectedWorksheetList } = state;

  const currentIndex = stepList.findIndex(step => step.id === activeStep.id);
  if (currentIndex === -1) return;

  const nextStep = stepList[currentIndex + 1];
  if (!nextStep) return; // 已经是最后一步

  if (!selectedWorksheetList?.length) {
    alert(_l('请选择工作表'), 3);
    return;
  }

  switch (activeStep.id) {
    case 'selectSheet':
      // 校验是否选择了工作表
      break;
    case 'configFields':
      const hasEmptyFields = selectedWorksheetList.some(item => !item.fields || item.fields.length === 0);

      if (hasEmptyFields) {
        alert(_l('请选择字段'), 3);
        return;
      }

      break;
    default:
      break;
  }

  // setLoading(dispatch, false);
  // 更新 activeStep
  dispatch({ type: 'UPDATE_ACTIVE_STEP', step: nextStep });
};

export const goToPrevStep = (dispatch, state) => {
  const { activeStep, stepList } = state;

  const currentIndex = stepList.findIndex(step => step.id === activeStep.id);
  if (currentIndex <= 0) return;

  const prevStep = stepList[currentIndex - 1];

  switch (activeStep.id) {
    case 'configFields':
      // dispatch({ type: 'RESET_FIELDS' });
      break;

    default:
      break;
  }

  dispatch({ type: 'UPDATE_ACTIVE_STEP', step: prevStep });
};

export const addSelectedField = (dispatch, { worksheetId, control }) => {
  if (!worksheetId || !control?.controlId) return;

  dispatch({
    type: 'ADD_SELECTED_FIELD',
    worksheetId,
    control,
  });
};

export const removeSelectedField = (dispatch, { worksheetId, control }) => {
  if (!worksheetId || !control?.controlId) return;

  dispatch({
    type: 'REMOVE_SELECTED_FIELD',
    worksheetId,
    control,
  });
};

export const setFilterConditions = (dispatch, { worksheetId, filterConditions }) => {
  if (!worksheetId) return;

  dispatch({
    type: 'SET_FILTER_CONDITIONS',
    worksheetId,
    filterConditions,
  });
};

export const setWorksheetEnhance = (dispatch, { worksheetId }) => {
  if (!worksheetId) return;

  dispatch({
    type: 'SET_WORKSHEET_PARSE_ENHANCED',
    worksheetId,
  });
};

export const setAttachmentParseEnhanced = (dispatch, { worksheetId }) => {
  if (!worksheetId) return;

  dispatch({
    type: 'SET_WORKSHEET_ATTACHMENT_PARSE_ENHANCED',
    worksheetId,
  });
};

export const setWorksheetDiscuss = (dispatch, { worksheetId }) => {
  if (!worksheetId) return;

  dispatch({
    type: 'SET_WORKSHEET_DISCUSSION_ENABLED',
    worksheetId,
  });
};

export const setKnowledgeName = (dispatch, { name }) => {
  dispatch({
    type: 'SET_KNOWLEDGE_NAME',
    name,
  });
};

export const setKnowledgeDesc = (dispatch, { desc }) => {
  dispatch({
    type: 'SET_KNOWLEDGE_DESC',
    desc,
  });
};

export const generateKnowledgeBasePlan = async (dispatch, { appId, allWorksheetList, isreload = false }) => {
  const params = { appId, isreload, langType: getCurrentLangCode() };

  if (md.global.SysSettings.hideAIBasicFun) {
    dispatch({ type: 'SET_AI_LOADING', loading: false });
    dispatch({ type: 'SET_KNOWLEDGE_RECOMMEND_SCHEMES', list: [] });
    return;
  }

  try {
    dispatch({ type: 'SET_AI_LOADING', loading: true });
    const result = await mingoAjax.generateKnowledgeBasePlan(params);
    console.log(result);
    if (result) {
      const { recommended_plans = [] } = result;
      const worksheetMap = allWorksheetList.reduce((acc, item) => {
        acc[item.worksheetId] = item;
        return acc;
      }, {});
      const formattedList = recommended_plans
        .filter(item => item.worksheets?.length > 0)
        .map((item, index) => ({
          isInit: true,
          id: `recommend_${index}`,
          num: item.worksheets.length,
          title: item.plan_name,
          description: item.plan_description,
          worksheetList: item.worksheets.map(worksheet => ({
            ...(worksheetMap[worksheet.worksheet_id] || {
              worksheetId: worksheet.worksheet_id,
              worksheetName: getTranslateInfo(appId, null, worksheet.worksheet_id).name || worksheet.worksheet_name,
              worksheet: {},
            }),
            discussionEnabled: worksheet.include_discussion,
            parseEnhanced: false,
            attachmentParseEnhanced: false,
            fields: worksheet.selected_fields?.map(field => ({
              controlId: field.field_id,
              controlName: field.field_name,
            })),
          })),
        }));
      dispatch({ type: 'SET_KNOWLEDGE_RECOMMEND_SCHEMES', list: formattedList });
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch({ type: 'SET_AI_LOADING', loading: false });
  }
};

export const refreshKnowledgeBasePlan = async (dispatch, { appId, allWorksheetList }) => {
  try {
    generateKnowledgeBasePlan(dispatch, { appId, allWorksheetList, isreload: true });
  } catch (error) {
    console.error(error);
  }
};

export const improveKnowledgeBasePlan = async (dispatch, { itemRecommend, appId }) => {
  try {
    const { worksheetList } = itemRecommend;
    let targetRecommend = _.cloneDeep(itemRecommend);
    const promiseList = worksheetList.map(worksheet => {
      return worksheetAjax.getWorksheetInfo({
        appId,
        worksheetId: worksheet.worksheetId,
        getTemplate: true,
      });
    });
    Promise.all(promiseList).then(res => {
      const { worksheetList } = targetRecommend;
      targetRecommend.worksheetList = worksheetList.map((item, index) => ({
        ...item,
        fields: replaceControlsTranslateInfo(
          appId,
          item.worksheetId,
          item.fields.map(control => res[index].template?.controls?.find(c => c.controlId === control.controlId)),
        ),
      }));
      dispatch({ type: 'IMPROVE_KNOWLEDGE_RECOMMEND_SCHEMES', preload: targetRecommend });
      updateActiveSchemeId(dispatch, targetRecommend);
      setSelectedWorksheetList(dispatch, targetRecommend.worksheetList || []);
      setKnowledgeName(dispatch, { name: targetRecommend.title });
      setKnowledgeDesc(dispatch, { desc: targetRecommend.description });
    });
  } catch (error) {
    console.error(error);
  }
};

export const setWorksheetIsLoaded = (dispatch, { loaded }) => {
  dispatch({ type: 'SET_WORKSHEET_IS_LOADED', loaded });
};
