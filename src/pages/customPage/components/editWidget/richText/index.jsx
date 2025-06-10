import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { RichText as RichTextComponent } from 'ming-ui';
import { updateWidget } from 'src/pages/customPage/redux/action';

const ContentWrap = styled.div`
  border-radius: 3px;
  border: 1px dashed transparent !important;
  .ck.ck-editor__top {
    width: 100%;
    position: absolute;
    top: -1px;
    transform: translateY(-100%);
    display: var(--tool-show);
    z-index: 99;
  }
  .editorNull {
    background: transparent !important;
  }
  .ck.ck-content.ck-focused {
    border-color: transparent !important;
  }
  .ck.ck-content.ck-blurred {
    border-color: transparent !important;
  }
  .ck.ck-content {
    border-radius: 6px !important;
    background: #fff !important;
  }
  &.focusedWrap {
    border-color: #2196f3 !important;
  }
  &.transparent {
    .ck.ck-content {
      background: transparent !important;
    }
  }
`;

const getContainerForCard = (event, widgetId) => {
  const tabContainers = document.querySelectorAll('.widgetContent.richText');
  for (let container of tabContainers) {
    if (container.contains(event.target)) {
      return container.querySelector(`.richText-${widgetId}`);
    }
  }
  return null;
}

export const EditRichText = props => {
  const { editable, value, widget, updateWidget } = props;
  const { componentConfig = {} } = widget;
  const { showType = 2 } = componentConfig;
  const elementRef = useRef(null);
  const richTextRef = useRef(null);
  const [isFocus, setIsFocus] = useState(false);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const isFocus = !!widget.editRichText;
    const rect = elementRef.current ? elementRef.current.getBoundingClientRect() : {};
    const parentNodeEl = _.get(document.querySelector(`.richText-${widget.id || widget.uuid}`), 'parentNode.parentNode');
    if (isFocus && parentNodeEl && rect.top < 100) {
      parentNodeEl.setAttribute('richText-offset-top', 'true');
    } else if (parentNodeEl) {
      parentNodeEl.removeAttribute('richText-offset-top');
    }
    if (isFocus) {
      setTimeout(() => {
        const ref = _.get(richTextRef, 'current.table');
        ref && ref.focus();
      }, 0);
    }
    setIsFocus(isFocus);
  }, [widget.editRichText]);

  useEffect(() => {
    const componentsWrap = document.querySelector('.customPageContentWrap');
    const handleClickActiveWrap = event => {
      const richTextContainer = getContainerForCard(event, widget.id || widget.uuid);
      if (!richTextContainer) {
        setIsFocus(false);
        updateWidget({
          widget,
          editRichText: false
        });
      }
    }
    editable && componentsWrap.addEventListener('click', handleClickActiveWrap);
    return () => {
      editable && componentsWrap.removeEventListener('click', handleClickActiveWrap);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (elementRef.current) {
        setHeight(elementRef.current.offsetHeight);
        setWidth(elementRef.current.offsetWidth);
      }
    }
    const resizeObserver = new ResizeObserver(handleResize);
    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }
    return () => {
      if (elementRef.current) {
        resizeObserver.unobserve(elementRef.current);
      }
    }
  }, []);

  return (
    <ContentWrap
      className={cx('w100 h100', {
        transparent: showType === 1,
        focusedWrap: editable && widget.editRichText && isFocus,
        disableDrag: widget.editRichText,
        childrenDisableDrag: widget.editRichText
      })}
      ref={elementRef}
      onMouseEnter={() => setIsFocus(true)}
      style={{
        '--tool-show': isFocus ? 'block' : 'none',
        '--test-height': height
      }}
    >
      {!!height && (
        editable ? (
          <RichTextComponent
            ref={richTextRef}
            data={widget.value || ''}
            disabled={!widget.editRichText}
            autoFocus={widget.editRichText}
            showTool={false}
            maxWidth={width || undefined}
            minHeight={height - 2}
            maxHeight={height - 2}
            onActualSave={(value) => {
              updateWidget({
                widget,
                value
              });
            }}
            backGroundColor={showType === 1 ? 'transparent' : undefined}
          />
        ) : (
          value ? (
            <RichTextComponent
              data={value}
              minHeight={height - 2}
              maxHeight={height - 2}
              disabled={true}
              backGroundColor={showType === 1 ? 'transparent' : undefined}
            />
          ) : (
            <div className="h100 flexColumn alignItemsCenter justifyContentCenter Gray_9e">
              <div className="Font17">{_l('暂无内容')}</div>
            </div>
          )
        )
      )}
    </ContentWrap>
  );
}

export default connect(
  (state) => ({}),
  dispatch => bindActionCreators({ updateWidget }, dispatch)
)(EditRichText);
