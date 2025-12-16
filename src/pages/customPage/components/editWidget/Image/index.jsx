import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import RegExpValidator from 'src/utils/expression';

const ContentWrap = styled.div`
  &.cardStyleWrap {
    border-radius: 6px;
    background-color: var(--widget-color, #fff);
    overflow: hidden;
  }
  &.editableWrap {
    border-radius: 6px;
    border: 1px dashed var(--border-color);
    overflow: hidden;
  }
  .imageHeader {
    padding: 12px;
    .cardName {
      color: var(--title-color);
    }
  }
  .image {
    width: 100%;
    height: 100%;
    &.fill {
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
    &.full {
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: contain;
    }
  }
`;

export default props => {
  const { editable, widget, themeColor, customPageConfig = {} } = props;
  const { componentConfig = {} } = widget;
  const { name, url, showType = 1, showName = true, action = 0, openMode = 1, linkUrl, fill = 1 } = componentConfig;
  const isDark = customPageConfig.pageStyleType === 'dark';
  const previewUrl = componentConfig.previewUrl || url;

  const handleTriggerAction = () => {
    if (editable || !action || !previewUrl) return;

    if (action === 1) {
      previewAttachments({
        index: 0,
        attachments: [
          {
            name,
            ext: RegExpValidator.getExtOfFileName(previewUrl.split('?')[0]),
            path: previewUrl,
            previewAttachmentType: 'QINIU',
          },
        ],
        callFrom: 'player',
        showThumbnail: true,
        hideFunctions: ['editFileName', 'saveToKnowlege', 'share'],
      });
    }

    if (action === 2 && linkUrl) {
      if (openMode === 1) {
        window.open(linkUrl);
      }
      if (openMode === 2) {
        location.href = linkUrl;
      }
    }
  };

  return (
    <ContentWrap
      className={cx('flexColumn h100', {
        cardStyleWrap: showType === 2,
        editableWrap: editable && showType === 1,
      })}
      style={{
        '--app-primary-color': themeColor,
        '--border-color': isDark ? '#e6e6e633' : '#bdbdbd',
        '--hover-bg-color': isDark ? '#f5f5f533' : '#f5f5f5',
      }}
      onClick={handleTriggerAction}
    >
      {showType === 2 && (
        <div className={cx('imageHeader flexRow', { hide: !showName })}>
          <div className="bold Font15 cardName">{name}</div>
        </div>
      )}
      <div className="imageBody flex">
        {previewUrl ? (
          fill === 3 ? (
            <img src={previewUrl} className="w100 h100" />
          ) : (
            <div
              className={cx('image', { fill: fill === 1, full: fill === 2 })}
              style={{ backgroundImage: `url(${previewUrl})` }}
            />
          )
        ) : (
          <div className="h100 flexColumn alignItemsCenter justifyContentCenter Gray_9e">
            <Icon className="Font40" icon="insert_photo_21" />
            <div className="mTop10">{editable ? _l('添加图片') : _l('暂无图片')}</div>
          </div>
        )}
      </div>
    </ContentWrap>
  );
};
