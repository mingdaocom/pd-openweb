import React, { useEffect, useRef } from 'react';
import { string } from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { useToggle, useFullscreen } from 'react-use';
import 'rc-trigger/assets/index.css';
import WebLayout from 'src/pages/customPage/webLayout';
import { updatePageInfo, updateLoading, updateEditPageVisible } from 'src/pages/customPage/redux/action';
import { copyCustomPage } from 'src/pages/worksheet/redux/actions/sheetList';
import {
  updateSheetListIsUnfold,
  updateWorksheetInfo,
  updateSheetList,
  deleteSheet,
} from 'src/pages/worksheet/redux/actions/sheetList';
import customApi from 'src/pages/worksheet/common/Statistics/api/custom.js';
import CustomPageHeader from './CustomPageHeader';
import { pick } from 'lodash';

const CustomPageContentWrap = styled.div`
  flex: 1;
  position: relative;
  header {
    display: flex;
    justify-content: space-between;
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 44px;
    line-height: 44px;
    padding: 0 24px 0 10px;
    border-radius: 3px 3px 0 0;
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
    z-index: 2;
    .customPageDesc {
      margin: 0 4px;
    }
    .nameWrap {
      display: flex;
      align-items: center;
      cursor: pointer;
      .pageName {
        margin: 0 6px;
        font-size: 18px;
        font-weight: bold;
      }
    }
    .hideSide {
      vertical-align: top;
    }
    .moreOperateIcon {
      color: #9e9e9e;
      cursor: pointer;

      &:hover {
        color: #2196f3;
      }
    }
    .fullScreenIcon {
      padding-top: 2px;
    }
    .iconWrap {
      color: #9e9e9e;
      &:hover {
        color: #2196f3;
      }
    }
  }
  .content {
    height: 100%;
  }
  .customPageContent {
    padding: 50px 8px 0px 8px;
    &.isFullscreen {
      padding-top: 0;
    }
  }
  .selectIconWrap {
    top: 40px;
    left: 10px;
  }
`;

const FullscreenHeader = styled.div`
  position: fixed;
  width: 100%;
  height: 50px;
  line-height: 50px;
  padding: 0 24px;
  background-color: #fff;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.24);
  i {
    color: #999;
    cursor: pointer;
    &:hover {
      color: #2196f3;
    }
  }
  span {
    margin-left: 8px;
  }
`;

function CustomPageContent(props) {
  const {
    loading,
    visible,
    currentSheet,
    activeSheetId,
    adjustScreen,
    updatePageInfo,
    updateLoading,
    appName,
    ids,
  } = props;
  const { workSheetId: pageId, workSheetName: name } = currentSheet;
  const ref = useRef(null);
  const [show, toggle] = useToggle(false);

  const closeFullscreen = () => {
    toggle(false);
  };
  const isFullscreen = useFullscreen(ref, show, { onClose: closeFullscreen });

  // useEffect(() => {
  //   if (activeSheetId !== pageId) {
  //     changeActiveSheetStatus(pageId);
  //   }
  // }, [pageId]);

  useEffect(() => {
    document.title = _l('%0 - %1', appName, name);
  }, [appName, name]);

  useEffect(() => {
    updateLoading(true);
    customApi
      .getPage({ appId: pageId }, { fireImmediately: true })
      .then(({ components, desc, adjustScreen }) => {
        updatePageInfo({ components, desc, adjustScreen, pageId });
      })
      .always(() => updateLoading(false));
  }, [pageId]);

  const renderContent = () => {
    if (visible) return null;
    if (loading) return <LoadDiv style={{ marginTop: '60px' }} />;

    return (
      <WebLayout
        adjustScreen={adjustScreen}
        className={cx('customPageContent', { isFullscreen })}
        from="display"
        ids={ids}
        isFullscreen={isFullscreen}
        editable={false}
        emptyPlaceholder={
          <div className="empty">
            <div className="iconWrap">
              <i className="icon-custom_widgets"></i>
            </div>
            <p>{_l('没有内容')}</p>
          </div>
        }
      />
    );
  };

  return (
    <CustomPageContentWrap>
      <CustomPageHeader {...props} toggle={toggle} />
      <div ref={ref} className="content">
        {/* {isFullscreen && !_.isEmpty(ref.current) && (
          <FullscreenHeader>
            <i onClick={closeFullscreen} className="icon-backspace Font20"></i>
            <span className="Font18 pointer" onClick={closeFullscreen}>
              {name}
            </span>
          </FullscreenHeader>
        )} */}
        {renderContent()}
      </div>
    </CustomPageContentWrap>
  );
}

export default connect(
  ({ appPkg, customPage, sheet: { isCharge, base }, sheetList: { isUnfold } }) => ({
    ...pick(customPage, ['loading', 'visible', 'desc', 'adjustScreen']),
    isCharge,
    sheetListVisible: isUnfold,
    activeSheetId: base.workSheetId,
    appName: appPkg.name,
    projectId: appPkg.projectId,
  }),
  dispatch =>
    bindActionCreators(
      {
        updatePageInfo,
        updateLoading,
        copyCustomPage,
        deleteSheet,
        updateSheetList,
        updateEditPageVisible,
        updateSheetListIsUnfold,
        updateWorksheetInfo,
      },
      dispatch,
    ),
)(CustomPageContent);
