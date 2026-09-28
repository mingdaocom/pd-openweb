import _ from 'lodash';

/**
 * 判断当前页面是否处于任一种公开分享或公开访问上下文。
 */
export const isPublicLink = () => {
  const {
    isPublicForm,
    isPublicView,
    isPublicPage,
    isPublicRecord,
    isPublicQuery,
    isPublicFormPreview,
    isPublicWorkflowRecord,
  } = _.get(window, 'shareState') || {};

  return (
    _.get(window, 'isPublicWorksheet') ||
    isPublicForm ||
    isPublicView ||
    isPublicPage ||
    isPublicRecord ||
    isPublicQuery ||
    isPublicFormPreview ||
    isPublicWorkflowRecord
  );
};
