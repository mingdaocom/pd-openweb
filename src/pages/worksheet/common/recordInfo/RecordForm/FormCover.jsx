import React, { useState, useEffect, useRef } from 'react';
import { Icon, ScrollView } from 'ming-ui';
import { Carousel } from 'antd';
import styled from 'styled-components';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { FILL_COLOR } from 'src/pages/widgetConfig/widgetDisplay/components/WidgetStyle';
import _ from 'lodash';
import { browserIsMobile } from 'src/util/sso';
import { addBehaviorLog } from 'src/util';
import cx from 'classnames';

const videoReg = (data = {}) => {
  return /(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4)/i.test(data.ext || '');
};
const imgReg = (data = {}) => {
  return /(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif|tiff)/i.test(data.ext || '');
};

const FormCoverWrap = styled.div`
  display: flex;
  .thumbnailBox {
    height: ${props => `${props.height || 600}px`};
    width: ${props => (props.coverType === '1' ? '174px' : '176px')};
    .nano-content {
      padding-right: 10px;
    }
    .thumbnailContainer {
      width: 100%;
      height: 100%;
      ${props => (props.coverType === '1' ? '' : 'padding-left: 2px;')}
      background: ${props => props.bgColor || '#151515'};
    }
  }
`;

const CoverImgWrap = styled.div`
  position: relative;
  width: ${props => (props.fromThumbnail ? '164px' : '100%')};
  height: ${({ isMobile, height = 600, fromThumbnail }) => {
    return isMobile ? '240px' : fromThumbnail ? '112px' : `${height}px`;
  }};
  background: ${props => props.bgColor || 'transparent'};
  overflow: hidden;
  cursor: pointer;
  box-sizing: border-box;
  ${props => (props.fromThumbnail ? 'border: 3px solid transparent;' : '')}
  ${props => (props.isActive ? 'border-color: #2196f3;' : '')}
  ${({ fromThumbnail, coverType }) => (fromThumbnail && coverType !== '1' ? 'margin: 1px 0' : '')}
  &:first-child {
    margin-top: 0px;
  }
  &:last-child {
    margin-bottom: 0px;
  }
  video {
    width: 100%;
    height: 100%;
    object-fit: ${props => (props.coverType === '1' ? 'contain' : 'cover')};
  }
  .playIcon {
    position: absolute;
    left: calc(50% - 25px);
    bottom: 80px;
    background: rgba(0, 0, 0, 0.3);
    width: 50px;
    height: 50px;
    text-align: center;
    line-height: 50px;
    border-radius: 50%;
    font-size: 36px;
    color: rgba(255, 255, 255, 0.85);
  }
  .image {
    width: 100%;
    height: 100%;
    background-position: 50%;
    background-image: ${props => `url(${props.url})`};
    ${props => (props.isBgBlur ? 'position: absolute;z-index: 2;' : '')};
    ${props =>
      props.coverType === '1' ? 'background-repeat: no-repeat;background-size: contain;' : 'background-size: cover;'}
  }
  .bgBlur {
    width: 120%;
    height: 120%;
    margin-left: -10%;
    margin-top: -3%;
    position: absolute;
    left: 0px;
    top: 0px;
    background-repeat: no-repeat;
    background-size: cover !important;
    background: ${props => `url(${props.url})`};
    background-position: 50%;
    -webkit-filter: blur(30px);
    -moz-filter: blur(30px);
    -o-filter: blur(30px);
    -ms-filter: blur(30px);
    filter: blur(30px);
  }
`;

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
        opacity: 1;
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

const CarouseWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  z-index: 3;
  .showNumWrap {
    width: 46px;
    height: 24px;
    position: absolute;
    right: 0;
    bottom: 10px;
    border-bottom-left-radius: 12px;
    border-top-left-radius: 12px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    text-align: center;
  }
  .maskDotBg {
    width: 100%;
    height: 60px;
    position: absolute;
    left: 0px;
    bottom: 0px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%);
    opacity: 0.1;
    z-index: 3;
  }
`;

export default function FormCover(props) {
  const { formData = [], widgetStyle = {}, flag, worksheetId, recordId } = props;
  const {
    coverid = '',
    covertype = '0',
    covercolor = '3',
    coverheight = '600',
    animation = '1',
    autosecond = '3',
    showthumbnail = '1',
  } = widgetStyle;
  const [imageData, setImageData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = browserIsMobile();
  const $cover = useRef(null);
  const isCurVideo = videoReg(imageData[currentIndex]);
  const bgColor = _.get(
    _.find(FILL_COLOR, c => c.value === covercolor),
    'color',
  );

  useEffect(() => {
    let newData = [];
    if (coverid) {
      const control = _.find(formData, i => i.controlId === coverid) || {};
      newData = JSON.parse(control.value || '[]').filter(i => videoReg(i) || imgReg(i));
    }
    setImageData(newData);
  }, [flag]);

  const handleTriggerAction = () => {
    addBehaviorLog('previewFile', worksheetId, {
      fileId: _.get(imageData, `[${currentIndex}].fileID`),
      rowId: recordId,
    });
    const control = _.find(formData, i => i.controlId === coverid) || {};
    const { advancedSetting } = control;
    const allowDownload = advancedSetting.allowdownload || '1';
    const hideFunctions = ['editFileName', 'saveToKnowlege', 'share'];
    if (allowDownload === '0') {
      hideFunctions.push('download');
    }
    // 打开图片
    previewAttachments({
      index: currentIndex,
      attachments: imageData,
      callFrom: 'player',
      showThumbnail: true,
      hideFunctions,
    });
  };

  const renderImage = ({ data, index, fromThumbnail = false }) => {
    const isVideo = videoReg(data);
    return (
      <CoverImgWrap
        height={coverheight}
        bgColor={bgColor}
        url={data.viewUrl}
        isBgBlur={covercolor === '4'}
        isMobile={isMobile}
        coverType={covertype}
        fromThumbnail={fromThumbnail}
        isActive={fromThumbnail && index === currentIndex}
        onClick={e => {
          e.stopPropagation();
          if (fromThumbnail) {
            setCurrentIndex(index);
            $cover.current && $cover.current.goTo(index);
          } else {
            handleTriggerAction();
          }
        }}
      >
        {isVideo ? (
          <video
            src={data.viewUrl}
            poster={data.previewUrl}
            controls={!isMobile && !fromThumbnail}
            width="100%"
            height="100%"
          ></video>
        ) : (
          <div className="image " />
        )}
        {covercolor === '4' && <div className="bgBlur"></div>}
        {isVideo && isMobile && (
          <div className="playIcon">
            <Icon icon="play_arrow" />
          </div>
        )}
      </CoverImgWrap>
    );
  };

  if (!coverid || !_.find(formData, i => i.controlId === coverid)) {
    return null;
  }

  if (!imageData.length) {
    return null;
  }
  return (
    <FormCoverWrap height={coverheight} coverType={covertype} bgColor={bgColor}>
      <CarouseWrap>
        <CarouselComponent
          ref={$cover}
          autoplay={autosecond !== '0'}
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
          effect={animation === '1' ? 'scrollx' : 'fade'}
          autoplaySpeed={parseInt(autosecond) * 1000}
          afterChange={index => {
            setCurrentIndex(index);
          }}
        >
          {imageData.map((data, index) => renderImage({ data, index }))}
        </CarouselComponent>
        {isMobile && (
          <div className="showNumWrap">
            <span className="Font15">{currentIndex + 1}</span>/<span className="Font12">{imageData.length}</span>
          </div>
        )}
        {!isCurVideo && <div className="maskDotBg"></div>}
      </CarouseWrap>
      {showthumbnail === '1' && !isMobile && imageData.length > 1 && (
        <ScrollView className="thumbnailBox">
          <div className="thumbnailContainer">
            {imageData.map((data, index) => renderImage({ data, index, fromThumbnail: true }))}
          </div>
        </ScrollView>
      )}
    </FormCoverWrap>
  );
}
