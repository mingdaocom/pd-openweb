import React, { useState } from 'react';
import cx from 'classnames';
import { head, includes } from 'lodash';
import styled from 'styled-components';
import { openControlAttachmentInNewTab } from 'worksheet/controllers/record';
import BarCode from 'src/components/newCustomFields/widgets/BarCode';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { isIframeControl } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import emptyCover from 'src/pages/worksheet/assets/emptyCover.png';
import { getCoverStyle } from 'src/pages/worksheet/common/ViewConfig/utils';
import { browserIsMobile, getClassNameByExt } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import { addBehaviorLog } from 'src/utils/project';
import { getMultiRelateViewConfig } from '../util';

const CoverImageWrap = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 96px;
  flex-basis: 96px;
  flex-shrink: 0;
  border-left: 1px solid rgba(0, 0, 0, 0.08);

  .coverWrap {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px 3px 0 0;
    background: #fff;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-clip: content-box;

    &.emptyCoverWrap {
      img {
        width: 52px;
        height: 40px;
      }
      &:hover {
        &::after {
          content: '';
          display: none;
        }
      }
    }

    .fileIcon {
      width: 45px;
      height: 52px;
    }
    &:hover {
      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(221, 221, 221, 0.24);
      }
    }
  }

  &.dir-top {
    width: 100%;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    &.display-circle,
    &.display-square {
      border-bottom: none;
      padding: 14px 14px 0 14px;
    }
    .coverWrap {
      height: 170px;
      &.coverWrapQr {
        & > img {
          height: 100% !important;
          width: initial !important;
        }
      }
    }
    .mobileOverWrap {
      height: 100px;
    }
  }
  &.display-circle,
  &.display-square {
    .coverWrap {
      width: 80px;
      height: 80px;
      box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, 0.04);
    }
  }
  &.display-circle {
    .coverWrap {
      border-radius: 50%;
      &:hover {
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(221, 221, 221, 0.24);
        }
      }
    }
  }
  &.dir-left {
    border: none;
    border-right: 1px solid rgba(0, 0, 0, 0.04);
    &.display-circle,
    &.display-square {
      border: none;
      padding: 14px 0 14px 14px;
    }
  }
  &.dir-right {
    &.display-circle,
    &.display-square {
      border: none;
      padding: 14px 14px 14px 0;
    }
    .fileIcon {
      /* margin-left: 14px; */
    }
  }
  .coverCount {
    position: absolute;
    bottom: 6px;
    right: 6px;
    padding: 0 10px;
    line-height: 20px;
    text-align: center;
    color: #fff;
    border-radius: 12px;
    background-color: rgba(33, 33, 33, 0.24);
  }
`;

const COVER_TYPE_TO_BACKGROUND_SIZE = {
  2: 'circle',
  3: 'square',
};

const COVER_IMAGE_POSITION = {
  2: 'top',
  1: 'left',
  0: 'right',
};

const COVER_FILL_TYPE_BACKGROUND_SIZE = {
  0: 'cover',
  1: 'contain',
};

export default function CardCoverImage(props) {
  const { data, stateData = {}, sheetSwitchPermit = [], currentView, viewId = '', projectId } = props;
  const { allAttachments = [], coverData = {}, formData, rowId } = data;
  const { type, controlId, advancedSetting = {} } = coverData;
  const allowDownload = advancedSetting.allowdownload || '1';
  const { previewUrl, ext } = head(allAttachments) || {};
  const { viewType, appId, worksheetId } = currentView;
  const isGalleryView = String(viewType) === '3';
  const isHierarchyView = String(viewType) === '2';
  const coverImage = data.coverImage || previewUrl;
  const coverSetting = getMultiRelateViewConfig(currentView, stateData);
  const { coverCid } = coverSetting;
  const { opencover } = getAdvanceSetting(coverSetting); //opencover 空(默认没key)或者1：允许 2：不允许
  const { coverPosition = '0', coverType, coverFillType } = getCoverStyle(coverSetting);
  const position = COVER_IMAGE_POSITION[coverPosition];
  const [isErr, setIsErr] = useState(false);
  if (!coverCid) return null;
  if (!isGalleryView && !isHierarchyView && position !== 'left' && !coverImage && !ext && type !== 47) return null;
  // 嵌入字段iframe展示
  const isIframeCover = isIframeControl(coverData);
  const previewAttachment = e => {
    // 不允许预览
    if (opencover === '2') {
      return;
    }
    e.stopPropagation();

    const recordAttachmentSwitch = !viewId
      ? true
      : isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewId);
    let hideFunctions = ['editFileName', 'saveToKnowlege'];
    if (!recordAttachmentSwitch || allowDownload === '0') {
      /* 是否不可下载 且 不可保存到知识和分享 */
      hideFunctions.push('download', 'share');
    }

    addBehaviorLog('previewFile', worksheetId, {
      fileId: _.get(allAttachments, `[${0}].fileID`),
      rowId,
    });
    previewAttachments(
      {
        index: 0,
        attachments: allAttachments.map(attachment =>
          Object.assign({}, attachment, {
            previewAttachmentType: attachment.refId ? 'KC_ID' : 'COMMON_ID',
          }),
        ),
        showThumbnail: true,
        hideFunctions: hideFunctions,
        recordId: rowId,
        worksheetId,
        controlId,
        projectId,
      },
      {
        openControlAttachmentInNewTab: recordAttachmentSwitch
          ? (fileId, options = {}) => {
              openControlAttachmentInNewTab({
                controlId,
                fileId,
                appId,
                recordId: rowId,
                viewId,
                worksheetId,
                ...options,
              });
            }
          : undefined,
      },
    );
  };

  const getStyle = () => {
    if (includes([0, 1], coverFillType)) {
      return {
        backgroundImage: `url(${coverImage})`,
        backgroundSize: COVER_FILL_TYPE_BACKGROUND_SIZE[coverFillType],
      };
    }
    return {
      backgroundImage: `url(${coverImage})`,
    };
  };

  const getCover = () => {
    const isMobile = browserIsMobile();
    if (!coverImage && !ext) {
      return (
        <div className={cx('coverWrap', 'emptyCoverWrap')}>
          <img src={emptyCover} />
        </div>
      );
    }
    const img = new Image();
    img.src = coverImage;
    img.onerror = () => {
      setIsErr(true);
    };
    if (coverImage && !isErr) {
      return (
        <div className={cx('coverWrap', '')} onClick={previewAttachment} style={getStyle()}>
          {allAttachments.length > 1 && <div className="coverCount">{allAttachments.length}</div>}
        </div>
      );
    }
    return (
      <div className={cx('coverWrap', '', { mobileOverWrap: isMobile })} onClick={previewAttachment}>
        <div className={cx('fileIcon', getClassNameByExt(ext))} />
        {allAttachments.length > 1 && <div className="coverCount">{allAttachments.length}</div>}
      </div>
    );
  };

  const getIframe = () => {
    const isMobile = browserIsMobile();
    const isLegalLink = /^https?:\/\/.+$/.test(coverData.value);
    return (
      <div className="coverWrap">
        {isLegalLink ? (
          <iframe className="overflowHidden Border0" width="100%" height="100%" src={coverData.value} />
        ) : (
          <div className={cx('coverWrap', 'emptyCoverWrap', { mobileOverWrap: isMobile })}>
            <img src={emptyCover} />
          </div>
        )}
      </div>
    );
  };

  const getBarCode = () => {
    return (
      <BarCode
        {...coverData}
        className={cx('coverWrap', { coverWrapQr: coverData.enumDefault !== 1 })}
        formData={formData}
        appId={appId}
        worksheetId={worksheetId}
        recordId={rowId}
        viewIdForPermit={viewId}
        isView={true}
      />
    );
  };

  const renderContent = () => {
    const isBarCode = type === 47;
    if (isIframeCover) {
      return getIframe();
    } else if (isBarCode) {
      return getBarCode();
    } else {
      return getCover();
    }
  };

  return (
    <CoverImageWrap
      className={cx(
        `dir-${position} display-${COVER_TYPE_TO_BACKGROUND_SIZE[coverType]} display-${COVER_FILL_TYPE_BACKGROUND_SIZE[coverFillType]}`,
      )}
    >
      {renderContent()}
    </CoverImageWrap>
  );
}
