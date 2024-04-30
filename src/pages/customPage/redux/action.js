import {
  ADD_WIDGET,
  DEL_WIDGET,
  UPDATE_WIDGET,
  UPDATE_LAYOUT,
  UPDATE_PAGE_INFO,
  UPDATE_LOADING,
  UPDATE_SAVE_LOADING,
  INSET_TITLE,
  UPDATE_MODIFIED,
  COPY_WIDGET,
  UPDATE_WIDGET_VISIBLE,
  UPDATE_EDIT_PAGE_VISIBLE,
  UPDATE_COMPONENTS,
  ADD_RECORD,
  UPDATE_FILTERS_GROUP,
  UPDATE_LINKAGE_FILTERS_GROUP,
  DELETE_LINKAGE_FILTERS_GROUP
} from './actionType';
import sheetAjax from 'src/api/worksheet';

const genAction = type => payload => ({ type, payload });

export const updatePageInfo = genAction(UPDATE_PAGE_INFO);

export const addWidget = genAction(ADD_WIDGET);

export const delWidget = genAction(DEL_WIDGET);

export const copyWidget = genAction(COPY_WIDGET);

export const updateWidgetVisible = genAction(UPDATE_WIDGET_VISIBLE);

export const updateWidget = genAction(UPDATE_WIDGET);

export const updateEditPageVisible = genAction(UPDATE_EDIT_PAGE_VISIBLE);

export const updateLayout = genAction(UPDATE_LAYOUT);

export const updateLoading = genAction(UPDATE_LOADING);

export const updateSaveLoading = genAction(UPDATE_SAVE_LOADING);

export const insertTitle = genAction(INSET_TITLE);

export const updateModified = genAction(UPDATE_MODIFIED);

export const updateComponents = genAction(UPDATE_COMPONENTS);

export const updateFiltersGroup = genAction(UPDATE_FILTERS_GROUP);

export const updateLinkageFiltersGroup = genAction(UPDATE_LINKAGE_FILTERS_GROUP);

export const deleteLinkageFiltersGroup = genAction(DELETE_LINKAGE_FILTERS_GROUP);



