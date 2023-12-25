import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { Carousel } from 'antd';
import styled from 'styled-components';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { FILL_COLOR } from 'src/pages/widgetConfig/widgetDisplay/components/WidgetStyle';
import _ from 'lodash';
import { browserIsMobile } from 'src/util/sso';
import { addBehaviorLog } from 'src/util';

const WidgetEmptyWrap = styled.div`
  width: 100%;
  height: 100px;
  text-align: center;
  line-height: 100px;
  background: #f5f5f5;
`;

const CoverImgWrap = styled.div`
  position: relative;
  width: 100%;
  height: ${props => `${props.isMobile ? 240 : props.height ? props.height : 600}px`};
  background: ${props => props.bgColor || 'transparent'};
  overflow: hidden;
  .image {
    width: 100%;
    height: 100%;
    background-position: 50%;
    background-image: ${props => `url(${props.url})`};
    ${props => (props.isBgBlur ? 'position: absolute;z-index: 2;' : '')};
    &.fill {
      background-size: cover;
    }
    &.full {
      background-repeat: no-repeat;
      background-size: contain;
    }
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
  width: 100%;
  height: 100%;
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
  } = widgetStyle;
  const [imageData, setImageData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = browserIsMobile();

  useEffect(() => {
    let newData = [];
    if (coverid) {
      const control = _.find(formData, i => i.controlId === coverid) || {};
      newData = JSON.parse(control.value || '[]').filter(i =>
        _.includes(['.png', '.jpg', '.jpeg'], (i.ext || '').toLowerCase()),
      );
    }
    setImageData(newData);
  }, [flag]);

  const handleTriggerAction = () => {
    addBehaviorLog('previewFile', worksheetId, {
      fileId: _.get(imageData, `[${currentIndex}].fileID`),
      rowId: recordId,
    });
    // 打开图片
    previewAttachments({
      index: currentIndex,
      attachments: imageData,
      callFrom: 'player',
      showThumbnail: true,
      hideFunctions: ['editFileName', 'saveToKnowlege', 'share'],
    });
  };

  const renderImage = data => {
    const bgColor = _.get(
      _.find(FILL_COLOR, c => c.value === covercolor),
      'color',
    );
    return (
      <CoverImgWrap
        height={coverheight}
        bgColor={bgColor}
        url={data.viewUrl}
        isBgBlur={covercolor === '4'}
        isMobile={isMobile}
      >
        <div
          onClick={() => handleTriggerAction()}
          className={cx('image pointer', covertype === '1' ? 'full' : 'fill')}
        />
        {covercolor === '4' && <div className="bgBlur"></div>}
      </CoverImgWrap>
    );
  };

  if (!coverid || !_.find(formData, i => i.controlId === coverid)) {
    return null;
  }

  if (!imageData.length) {
    return null;
    // return (
    //   <WidgetEmptyWrap>
    //     <div className="Gray_9e Font14">{_l('暂无图片')}</div>
    //   </WidgetEmptyWrap>
    // );
  }
  return (
    <CarouseWrap>
      <CarouselComponent
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
        {imageData.map(data => renderImage(data))}
      </CarouselComponent>
      {isMobile && (
        <div className="showNumWrap">
          <span className="Font15">{currentIndex + 1}</span>/<span className="Font12">{imageData.length}</span>
        </div>
      )}
      <div className="maskDotBg"></div>
    </CarouseWrap>
  );
}
