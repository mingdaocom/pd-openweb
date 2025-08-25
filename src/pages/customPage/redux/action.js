import {
  ADD_WIDGET,
  COPY_WIDGET,
  DEL_TABS_WIDGET,
  DEL_WIDGET,
  DEL_WIDGET_TAB,
  DELETE_LINKAGE_FILTERS_GROUP,
  INSET_TITLE,
  UPDATE_COMPONENTS,
  UPDATE_EDIT_PAGE_VISIBLE,
  UPDATE_FILTERS_GROUP,
  UPDATE_LAYOUT,
  UPDATE_LINKAGE_FILTERS_GROUP,
  UPDATE_LOADING,
  UPDATE_MODIFIED,
  UPDATE_PAGE_INFO,
  UPDATE_SAVE_LOADING,
  UPDATE_WIDGET,
  UPDATE_WIDGET_VISIBLE,
} from './actionType';

const genAction = type => payload => ({ type, payload });

export const updatePageInfo = genAction(UPDATE_PAGE_INFO);

export const addWidget = genAction(ADD_WIDGET);

export const delWidget = genAction(DEL_WIDGET);
export const delTabsWidget = genAction(DEL_TABS_WIDGET);
export const delWidgetTab = genAction(DEL_WIDGET_TAB);

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
