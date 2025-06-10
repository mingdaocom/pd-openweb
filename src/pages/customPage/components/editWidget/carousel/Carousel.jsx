import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Carousel } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { BarCode, Icon, LoadDiv, Qr } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import homeAppAjax from 'src/api/homeApp';
import { RecordInfoModal } from 'mobile/Record';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { getBarCodeValue } from 'src/components/newCustomFields/tools/utils';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { browserIsMobile } from 'src/utils/common';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { getUrlList } from './util';

const CarouselComponent = styled(Carousel)`
  &.slick-slider .slick-dots li {
    width: 10px;
    height: 10px;
    button {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1px solid #fff;
      background-color: transparent;
      opacity: 1;
      &:hover {
        opacity: 1;
        background-color: #fff;
      }
    }
    &.slick-active {
      width: 10px;
      button {
        background-color: #fff !important;
      }
    }
  }
  .slick-dots {
    margin: 0 !important;
  }
  .slick-dots li button {
    box-shadow: 0 2px 6px 0px rgb(0 0 0 / 15%);
  }
  .image {
    width: 100%;
    height: 100%;
    &.fill {
      background-size: cover;
    }
    &.full {
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: contain;
    }
  }
  &:hover {
    .mask {
      display: block;
    }
  }
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.01);
    display: none;
    pointer-events: none;
  }
  .explain {
    cursor: pointer;
    position: absolute;
    bottom: 0;
    width: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 80%);
    .content {
      overflow: auto;
      padding: 0 30px;
      margin: 80px 0 35px;
      max-height: calc(100% - 30px);
    }
    .title,
    .subTitle {
      cursor: initial;
      max-width: 720px;
      text-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3);
    }
  }
  .hideMore {
    cursor: pointer !important;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /* autoprefixer: off */
    -webkit-box-orient: vertical;
    /* autoprefixer: on */
  }

  &.slick-slider:hover {
    .slick-prev,
    .slick-next {
      display: flex !important;
    }
  }

  &.slick-slider .slick-prev,
  &.slick-slider .slick-next {
    width: 24px;
    height: 48px;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    margin-top: -24px;
    background-color: rgb(51 51 51 / 40%);
    display: none !important;
    &:hover {
      background-color: rgb(51 51 51 / 60%);
      .icon {
        opacity: 0.7;
      }
    }
  }

  &.slick-slider .slick-prev,
  &.slick-slider .slick-prev:hover {
    left: 0;
    z-index: 2;
    color: white;
    border-radius: 0px 6px 6px 0px;
  }

  &.slick-slider .slick-next,
  &.slick-slider .slick-next:hover {
    right: 0;
    z-index: 2;
    color: white;
    border-radius: 6px 0px 0px 6px;
  }
`;

const QRErrorCorrectLevel = {
  '7%': 1,
  '15%': 0,
  '25%': 3,
  '30%': 2,
};

function Explain(props) {
  const { title, subTitle, onClick } = props;
  const [showMore, setShowMore] = useState(false);
  return (
    <div
      className="explain White"
      onClick={e => {
        const { target } = e;
        if (target.classList.contains('explain') || target.classList.contains('content')) {
          onClick();
        }
      }}
    >
      <div className="content">
        <div className="Font20 mBottom5 ellipsis title bold">{title}</div>
        <div className={cx('Font14 pointer subTitle', { hideMore: !showMore })} onClick={() => setShowMore(!showMore)}>
          {subTitle}
        </div>
      </div>
    </div>
  );
}

export default function CarouselPreview(props) {
  const { componentConfig = {}, config = {}, customPageConfig = {}, editable } = props;
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [controls, setControls] = useState([]);
  const [previewRecord, setPreviewRecord] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState(0);
  const contentRef = useRef();
  const isMobile = browserIsMobile();

  const { worksheetId, viewId, image, count, title, subTitle, url } = componentConfig;
  const imageControl = _.find(controls, { controlId: image }) || {};
  const isDark = customPageConfig.pageStyleType === 'dark';

  useEffect(() => {
    if (worksheetId && viewId && image) {
      homeAppApi
        .getAttachementImages({
          worksheetId,
          viewId,
          attachementControlId: image,
          imageLimitCount: count,
          filedIds: [title, subTitle, url].filter(_ => _),
          displayMode: config.displayMode,
        })
        .then(data => {
          const { appId, code, imageData = [], rowData = [], controls = [] } = data;
          const imageControl = _.find(controls, { controlId: image }) || {};
          if (imageControl.type === 14) {
            setImageData(
              imageData.map(data => {
                return {
                  ...JSON.parse(data.image),
                  rowId: data.rowId,
                };
              }),
            );
          }
          if (imageControl.type === 47) {
            setImageData(
              imageData
                .map(data => {
                  return {
                    image: getBarCodeValue({
                      data: [
                        {
                          ...imageControl,
                          value: data.image,
                        },
                      ],
                      control: {
                        enumDefault: imageControl.enumDefault,
                        enumDefault2: imageControl.enumDefault2,
                        dataSource: image,
                      },
                      codeInfo: {
                        recordId: data.rowId,
                        appId,
                        worksheetId,
                        viewId,
                      },
                    }),
                    rowId: data.rowId,
                  };
                })
                .filter(n => n.image),
            );
          }
          setRowData(rowData.map(data => JSON.parse(data)));
          setControls(controls);
          setCode(code);
          setLoading(false);
        });
    } else {
      setImageData([]);
      setRowData([]);
      setLoading(false);
    }
  }, [worksheetId, viewId, image, title, subTitle, url, config.displayMode]);

  const onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => setPreviewRecord({}));
  };

  useEffect(() => {
    window.addEventListener('popstate', onQueryChange);
    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, []);

  const contentWidth = _.get(contentRef.current, 'clientWidth');
  const contentHeight = _.get(contentRef.current, 'clientHeight');
  const style = {
    position: 'relative',
    height: contentHeight,
    backgroundColor:
      imageControl.type === 14
        ? isDark
          ? customPageConfig.widgetBgColor || config.fillColor
          : config.fillColor
        : '#fff',
  };

  async function handleTriggerAction(data) {
    const { rowid } = data;
    const { action, openMode } = componentConfig;

    if (editable) return;

    // 打开记录
    if (action === 1 && !_.get(window, 'shareState.shareId')) {
      const { appId } = await homeAppAjax.getAppSimpleInfo({ workSheetId: worksheetId });
      addBehaviorLog('worksheetRecord', worksheetId, { rowId: rowid }); // 埋点

      if (window.isMingDaoApp) {
        location.href = `/app/${appId}/${worksheetId}/${viewId}/row/${rowid}`;
        return;
      }
      if (openMode === 1) {
        if (isMobile) {
          handlePushState('page', 'recordDetail');
        }
        setPreviewRecord({ appId, rowId: rowid });
      }
      if (openMode === 2) {
        location.href = `/app/${appId}/${worksheetId}/${viewId}/row/${rowid}`;
      }
      if (openMode === 3) {
        window.open(`/app/${appId}/${worksheetId}/${viewId}/row/${rowid}`);
      }
    }

    // 打开链接
    if (action === 2) {
      const content = data[url];
      const targetUrl = getUrlList(content)[0];
      if (targetUrl && openMode === 1) {
        window.open(targetUrl);
      }
      if (targetUrl && openMode === 2) {
        location.href = targetUrl;
      }
    }

    // 打开图片
    if (action === 3) {
      if (imageControl.type === 14) {
        const hideFunctions = ['editFileName', 'saveToKnowlege', 'share'];
        const allowDownload = imageControl.advancedSetting.allowdownload || '1';
        if (allowDownload === '0') {
          hideFunctions.push('download');
        }
        previewAttachments({
          index: currentIndex,
          attachments: imageData,
          callFrom: 'player',
          showThumbnail: true,
          hideFunctions,
        });
      }
      if (imageControl.type === 47) {
        const img = contentRef.current.querySelector('.slick-list .slick-active img');
        previewQiniuUrl(img.src, { disableDownload: true, ext: 'png', name: 'code.png', theme: 'light' });
      }
    }
  }

  const renderEmptyContent = () => {
    if (code === 0) {
      return (
        <div className="flexColumn valignWrapper w100 h100" style={{ justifyContent: 'center' }}>
          <Icon icon="picture" className="Font64 Gray_c mBottom10" />
          <div className="Gray_9e Font13">{_l('暂无轮播图片')}</div>
        </div>
      );
    }
    if (code === 1) {
      return (
        <div className="flexColumn valignWrapper w100 h100" style={{ justifyContent: 'center' }}>
          <Icon icon="workflow_failure" className="Font64 Gray_c mBottom10" />
          <div className="Gray_9e Font20 mBottom2">{_l('无法形成轮播图')}</div>
          <div className="Gray_9e Font16">{_l('构成要素不存在或已删除')}</div>
        </div>
      );
    }
  };

  const renderLoading = () => {
    return (
      <div className="flexRow valignWrapper w100 h100">
        <LoadDiv />
      </div>
    );
  };

  const renderFileImage = (record, data) => {
    const url = `${data.viewUrl}&|imageView2/0/q/100`;
    if (config.fill === 3) {
      return <img onClick={() => handleTriggerAction(record)} src={url} className="w100 h100" />;
    } else {
      return (
        <div
          onClick={() => handleTriggerAction(record)}
          className={cx('image pointer', { fill: config.fill === 1, full: config.fill === 2 })}
          style={{ backgroundImage: `url(${url})` }}
        />
      );
    }
  };

  const renderBarCode = (record, data) => {
    const { advancedSetting: { width, faultrate } = {}, enumDefault } = imageControl;
    const parseWidth = parseFloat(width);
    return (
      <div
        onClick={() => handleTriggerAction(record)}
        className="image pointer flexRow alignItemsCenter justifyContentCenter"
      >
        {enumDefault === 1 ? (
          <BarCode value={data.image} renderer="img" renderWidth={contentWidth} />
        ) : (
          <Qr
            gap={6}
            content={data.image}
            width={contentHeight}
            height={contentHeight}
            correctLevel={QRErrorCorrectLevel[faultrate]}
          />
        )}
      </div>
    );
  };

  const renderImage = data => {
    const record = _.find(rowData, { rowid: data.rowId }) || {};
    const titleControl = _.find(controls, { controlId: title }) || {};
    const subTitleControl = _.find(controls, { controlId: subTitle }) || {};
    return (
      <div key={data.fileID}>
        <div style={style}>
          {imageControl.type === 14 && renderFileImage(record, data)}
          {imageControl.type === 47 && renderBarCode(record, data)}
          <div className="mask" />
          {(record[title] || record[subTitle]) && (
            <Explain
              title={dealMaskValue({ value: record[title], advancedSetting: titleControl.advancedSetting })}
              subTitle={dealMaskValue({ value: record[subTitle], advancedSetting: subTitleControl.advancedSetting })}
              onClick={() => handleTriggerAction(record)}
            />
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <Fragment>
        <CarouselComponent
          autoplay={previewRecord.rowId ? false : config.autoplaySpeed !== false}
          arrows={true}
          prevArrow={
            <div>
              <Icon className="Font30" icon="navigate_before" />
            </div>
          }
          nextArrow={
            <div>
              <Icon className="Font30" icon="navigate_next" />
            </div>
          }
          effect={config.effect}
          autoplaySpeed={config.autoplaySpeed * 1000}
          afterChange={index => {
            setCurrentIndex(index);
          }}
        >
          {imageData.map(data => renderImage(data))}
        </CarouselComponent>
        {previewRecord.rowId &&
          (isMobile ? (
            <RecordInfoModal
              className="full"
              visible={!!previewRecord.rowId}
              appId={previewRecord.appId}
              worksheetId={worksheetId}
              viewId={viewId}
              rowId={previewRecord.rowId}
              onClose={() => {
                setPreviewRecord({});
              }}
            />
          ) : (
            <RecordInfoWrapper
              from={3}
              visible={!!previewRecord.rowId}
              appId={previewRecord.appId}
              worksheetId={worksheetId}
              viewId={viewId}
              recordId={previewRecord.rowId}
              hideRecordInfo={() => {
                setPreviewRecord({});
              }}
            />
          ))}
      </Fragment>
    );
  };

  return (
    <div className="w100 h100" ref={contentRef}>
      {loading ? renderLoading() : imageData.length ? renderContent() : renderEmptyContent()}
    </div>
  );
}
