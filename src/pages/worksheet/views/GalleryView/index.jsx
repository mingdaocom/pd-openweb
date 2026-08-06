import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import autoSize from 'ming-ui/components/AutoSize';
import useButtonStatusOfRows from 'worksheet/hooks/useButtonStatusOfRows';
import * as actions from 'worksheet/redux/actions/galleryview';
import {
  filterButtonBySheetSwitchPermit,
  getSheetOperateButtonIds,
  getSheetOperatesButtons,
} from 'src/utils/worksheet';
import RecordGalleryInner from './components/RecordGalleryInner';
import './index.less';

// 为画廊视图注入卡片自定义动作状态，主体渲染交给 RecordGalleryInner。
const RecordGalleryWrapper = props => {
  const { base = {}, views = [], galleryview = {}, sheetButtons, printList, sheetSwitchPermit } = props;
  const { viewId, worksheetId } = base;
  const currentView = views.find(o => o.viewId === viewId) || {};
  const { gallery = [] } = galleryview;

  // 画廊卡片上的自定义动作按当前页记录批量取状态，分组视图需要从各分组 rows 中取记录 id。
  const allRecordIds = useMemo(() => {
    const groupsetting = _.get(currentView, 'advancedSetting.groupsetting');

    if (groupsetting) {
      return _.flatMap(gallery, item => (item.rows || []).map(row => safeParse(row)?.rowid)).filter(Boolean);
    }

    return gallery.map(item => item.rowid).filter(Boolean);
  }, [gallery, currentView]);

  // 画廊卡片只展示当前视图配置允许、且工作表开关权限放行的动作按钮。
  const operateButtons = useMemo(() => {
    const buttons = getSheetOperatesButtons(currentView, { buttons: sheetButtons, printList });
    return filterButtonBySheetSwitchPermit(buttons, sheetSwitchPermit, viewId);
  }, [currentView, sheetButtons, printList, sheetSwitchPermit, viewId]);

  const btnIds = useMemo(() => getSheetOperateButtonIds(operateButtons), [operateButtons]);
  const { buttonsCheckStatus } = useButtonStatusOfRows(worksheetId, allRecordIds, btnIds);

  return <RecordGalleryInner {...props} buttonsCheckStatus={buttonsCheckStatus} />;
};

export default autoSize(
  connect(
    state => ({
      ...state.sheet,
      chatVisible: state.chat.visible,
      sheetListVisible: state.sheetList.isUnfold,
    }),
    dispatch => bindActionCreators(actions, dispatch),
  )(RecordGalleryWrapper),
);
