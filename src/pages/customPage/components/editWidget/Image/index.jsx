import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';

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
  const { type, componentConfig = {}, config = {} } = widget;
  const { name, url, showType = 1, showName = true } = componentConfig;
  const isDark = customPageConfig.pageStyleType === 'dark';
  const previewUrl = componentConfig.previewUrl || url;
  return (
    <ContentWrap
      className={cx('flexColumn h100', {
        cardStyleWrap: showType === 2,
        editableWrap: editable && showType === 1,
      })}
      style={{
        '--app-primary-color': themeColor,
        '--border-color': isDark ? '#e6e6e633' : '#bdbdbd',
        '--hover-bg-color': isDark ? '#f5f5f533' : '#f5f5f5'
      }}
    >
      {showType === 2 && (
        <div className={cx('imageHeader flexRow', { hide: !showName })}>
          <div className="bold Font15 cardName">{name}</div>
        </div>
      )}
      <div className="imageBody flex">
        {previewUrl ? (
          <div className="image fill" style={{ backgroundImage: `url(${previewUrl})` }} />
        ) : (
          <div className="h100 flexColumn alignItemsCenter justifyContentCenter Gray_9e">
            <Icon className="Font40" icon="insert_photo_21" />
            <div className="mTop10">{editable ? _l('添加图片') : _l('暂无图片')}</div>
          </div>
        )}
      </div>
    </ContentWrap>
  );
}

