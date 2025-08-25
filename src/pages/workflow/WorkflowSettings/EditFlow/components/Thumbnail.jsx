import React, { useEffect, useRef, useState } from 'react';
import { Drawer } from 'antd';
import domtoimage from 'dom-to-image';
import styled from 'styled-components';

const thumbnailWidth = 240;
const thumbnailHeight = 240;

const Thumbnail = styled.div`
  margin: 20px;
`;

const Box = styled.div`
  width: ${thumbnailWidth}px;
  height: ${thumbnailHeight}px;
  background-color: #f5f5f9;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.16);
  border-radius: 6px;
  border: 5px solid transparent;
  box-sizing: initial;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: top center;
  overflow: hidden;
  position: relative;
`;

const Frame = styled.div`
  border: 1px solid #1677ff;
  border-radius: 3px;
  position: absolute;
`;

let draggable = {
  status: false,
  x: 0,
  y: 0,
};

export default ({ visible, refreshPosition, refreshThumbnail }) => {
  const thumbnailContainer = useRef(null);
  const dragElement = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [isRefreshThumbnail, setRefreshThumbnail] = useState(false);

  const getThumbnailWidthMessage = () => {
    const workflowContainer = document.getElementsByClassName('workflowEdit')[0];
    const container = document.getElementsByClassName('workflowEditContent')[0];

    // 盒子大小
    const boxWidth = workflowContainer.clientWidth;
    const boxHeight = workflowContainer.clientHeight;

    // 内容实际大小
    const containerWidth = container.clientWidth;
    const containerHeight = container.scrollHeight;

    // 滚动条位置
    const scrollLeft = workflowContainer.scrollLeft;
    const scrollTop = workflowContainer.scrollTop;

    return {
      workflowContainer,
      boxWidth,
      boxHeight,
      containerWidth,
      containerHeight,
      scrollLeft,
      scrollTop,
    };
  };

  const setThumbnailPosition = () => {
    const { boxWidth, boxHeight, containerWidth, containerHeight, scrollLeft, scrollTop } = getThumbnailWidthMessage();

    const width = (boxWidth / containerWidth) * thumbnailWidth;
    const height = (boxHeight / containerHeight) * thumbnailHeight;

    setWidth(width);
    setHeight(height);
    setLeft(thumbnailWidth - width === 0 ? 0 : ((thumbnailWidth - width) * scrollLeft) / (containerWidth - boxWidth));
    setTop(
      thumbnailHeight - height === 0 ? 0 : ((thumbnailHeight - height) * scrollTop) / (containerHeight - boxHeight),
    );

    if (dragElement.current) {
      dragElement.current.style.transform = `translateX(0px) translateY(0px)`;
    }
  };

  const setFlowViewPosition = (newLeft, newTop) => {
    const width = dragElement.current.offsetWidth;
    const height = dragElement.current.offsetHeight;
    const { workflowContainer, boxWidth, boxHeight, containerWidth, containerHeight } = getThumbnailWidthMessage();

    if (newLeft < 0) {
      newLeft = 0;
    } else if (newLeft + width > thumbnailWidth) {
      newLeft = thumbnailWidth - width;
    }

    if (newTop < 0) {
      newTop = 0;
    } else if (newTop + height > thumbnailHeight) {
      newTop = thumbnailHeight - height;
    }

    workflowContainer.scrollLeft = (containerWidth - boxWidth) / ((thumbnailWidth - width) / newLeft);
    workflowContainer.scrollTop = (containerHeight - boxHeight) / ((thumbnailHeight - height) / newTop);
  };

  const clickPosition = event => {
    if (event.target === dragElement.current) return;

    const { clientX, clientY } = event;
    let newLeft = clientX - width / 2 - event.target.offsetLeft;
    let newTop = clientY - height / 2 - event.target.offsetTop;

    setFlowViewPosition(newLeft, newTop);
  };

  useEffect(() => {
    document.addEventListener('mousemove', event => {
      if (!draggable.status) return;
      dragElement.current.style.transform = `translateX(${event.clientX - draggable.x}px) translateY(${
        event.clientY - draggable.y
      }px)`;
    });

    document.addEventListener('mouseup', () => {
      if (!draggable.status) return;

      const transform = dragElement.current.style.transform.match(/\(.*?\)/g);

      setFlowViewPosition(
        parseInt(dragElement.current.style.left) + parseInt(transform[0].replace(/[^-\d]/g, '')),
        parseInt(dragElement.current.style.top) + parseInt(transform[1].replace(/[^-\d]/g, '')),
      );
      draggable.status = false;
    });
  }, []);

  useEffect(() => {
    if (visible) {
      if (isRefreshThumbnail) {
        domtoimage.toPng(document.getElementsByClassName('workflowEditContent')[0]).then(function (url) {
          setImgUrl(url);
          setRefreshThumbnail(false);
          setThumbnailPosition();
        });
      } else {
        setThumbnailPosition();
      }
    }
  }, [visible, isRefreshThumbnail]);

  useEffect(() => {
    setRefreshThumbnail(true);
  }, [refreshThumbnail]);

  useEffect(() => {
    if (visible && refreshPosition) {
      setThumbnailPosition();
    }
  }, [refreshPosition]);

  return (
    <Drawer
      placement="left"
      className="workflowThumbnail"
      visible={visible}
      closable={false}
      mask={false}
      bodyStyle={{ padding: 0 }}
      width={290}
    >
      <Thumbnail>
        <Box style={{ backgroundImage: `url(${imgUrl})` }} ref={thumbnailContainer} onClick={clickPosition}>
          <Frame
            style={{ width, height, left, top }}
            ref={dragElement}
            onMouseDown={event => {
              draggable = {
                status: true,
                x: event.clientX,
                y: event.clientY,
              };
            }}
          />
        </Box>
      </Thumbnail>
    </Drawer>
  );
};
