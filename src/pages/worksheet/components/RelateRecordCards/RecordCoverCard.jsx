import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import _, { get, identity } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { className } from 'twemoji';
import { validate } from 'uuid';
import { getTitleControlId, getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import { browserIsMobile } from 'src/utils/common';
import { getRecordCardStyle } from 'src/utils/control';
import { CardButton } from '../Basics';
import CardCellControls from './CardCellControls';

const Con = styled.div`
  ${({ isMobile }) => (isMobile ? 'margin-bottom:10px' : 'display: inline-flex;')}
  position: relative;
  border-radius: 3px;
  background-color: #fff;
  border: 1px solid #eaeaea;
  width: 100%;
  .operateButton {
    position: absolute;
    display: flex;
    top: -11px;
    right: -11px;
    ${({ isMobile }) => (isMobile ? 'top: -16px;right: -16px;' : '')}
    visibility: hidden;
    z-index: 2;
  }
  &:hover .operateButton {
    visibility: visible;
  }
  &:last-child {
    margin-bottom: 0px;
  }
  .hoverShow {
    visibility: hidden;
  }
  .dragger {
    position: absolute;
    top: 14px;
    left: 1px;
    cursor: grab;
  }
  &.Hand:hover {
    box-shadow:
      rgba(0, 0, 0, 0.12) 0px 4px 12px 0px,
      rgba(0, 0, 0, 0.12) 0px 0px 2px 0px;
    ${({ isMobile }) => (isMobile ? ' box-shadow:unset' : '')};
  }
  &:hover {
    .hoverShow {
      visibility: visible;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  color: #151515;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* autoprefixer: off */
  -webkit-box-orient: vertical;
  /* autoprefixer: on */
  ${({ titleStyle }) => titleStyle}
`;

const ControlCon = styled.div`
  display: flex;
  flex: 1;
  padding: 12px 16px;
  overflow: hidden;
  flex-direction: ${({ small }) => (small ? 'column' : 'row')};
  .cover {
    width: 80px;
    height: 80px;
    box-sizing: content-box;
    border-radius: 3px;
    object-fit: contain;
    border: 1px solid #eaeaea;
    ${({ small }) => (small ? 'margin-bottom: 15px' : 'margin-right: 15px')};
  }
`;

function click(func) {
  return e => {
    e.preventDefault();
    e.stopPropagation();
    func();
  };
}

export default function RecordCoverCard(props) {
  const {
    className,
    from,
    hideTitle,
    disabled,
    showAddAsDropdown,
    DragHandle,
    style = {},
    containerWidth,
    controls,
    data,
    cover,
    allowReplaceRecord,
    onClick,
    onDelete,
    appId,
    projectId,
    viewId,
    allowlink,
    sourceEntityName = '',
    parentControl,
    isCharge,
    sheetSwitchPermit = [],
    onReplaceRecord = () => {},
  } = props;
  const isMobile = browserIsMobile();
  const [forceShowFullValue, setForceShowFullValue] = useState(false);
  const titleControl = _.find(parentControl.relationControls, { attribute: 1 });
  const titleMasked =
    titleControl &&
    _.get(titleControl, 'advancedSetting.datamask') === '1' &&
    _.get(titleControl, 'advancedSetting.isdecrypt') === '1';
  const recordCardStyle = getRecordCardStyle(parentControl);
  const title =
    props.title ||
    (data.rowid && validate(data.rowid)
      ? getTitleTextFromRelateControl(parentControl, data, { noMask: forceShowFullValue })
      : _l('关联当前%0', sourceEntityName));
  const titleControlId = getTitleControlId(parentControl);
  const fullShowCard = containerWidth < 700;
  const coverComp = cover && !!controls.length && (
    <img
      className="cover"
      src={cover}
      onClick={e => {
        e.stopPropagation();
        previewQiniuUrl(cover.replace(/imageView2\/2\/w\/200\|/, ''), {
          disableDownload: true,
          ext: (cover.match(/\.(jpg|jpeg|png|gif|bmp)(\?|$)/i) || '')[1] || 'png',
        });
      }}
    />
  );
  return (
    <Con
      onClick={onClick}
      style={{
        ...style,
        backgroundColor: get(recordCardStyle, 'cardStyle.backgroundColor') || '#fff',
        borderColor: get(recordCardStyle, 'cardStyle.borderColor') || '#eaeaea',
        ...(fullShowCard ? { width: '100%' } : {}),
      }}
      className={cx(className, allowlink !== '0' && 'Hand')}
      canView={allowlink !== '0'}
      isMobile={isMobile}
    >
      {!disabled && !showAddAsDropdown && (
        <div className="operateButton">
          {allowReplaceRecord && (
            <CardButton
              className="mRight8 tip-bottom"
              style={isMobile ? { visibility: 'visible' } : {}}
              onClick={click(onReplaceRecord)}
              data-tip={isMobile ? '' : _l('重新选择')}
              isMobile={isMobile}
            >
              <i className="icon icon-swap_horiz"></i>
            </CardButton>
          )}
          <CardButton
            className={isMobile ? '' : 'red'}
            style={isMobile ? { visibility: 'visible' } : {}}
            onClick={click(onDelete)}
            isMobile={isMobile}
          >
            <i className="icon icon-close"></i>
          </CardButton>
        </div>
      )}
      <ControlCon
        style={{
          ...(controls.length ? { paddingBottom: 10 } : {}),
        }}
        small={containerWidth < 420}
      >
        {coverComp}
        {DragHandle && (
          <DragHandle>
            <i className="icon icon-drag dragger hoverShow Gray_9e Font16 ThemeHoverColor3"></i>
          </DragHandle>
        )}
        <Content>
          {!hideTitle && (
            <Title
              key="title"
              title={title}
              style={{
                marginBottom: controls.length ? 8 : 0,
                fontSize: get(recordCardStyle, 'recordTitleStyle.size') || '15px',
                lineHeight:
                  Math.floor(get(recordCardStyle, 'recordTitleStyle.size', '14px').replace(/[^\d]/g, '') * 1.3) + 'px',
              }}
              titleStyle={get(recordCardStyle, 'recordTitleStyle.valueStyle', {})}
            >
              {title}
              {titleMasked && !forceShowFullValue && (
                <i
                  className="icon icon-eye_off ThemeHoverColor3 Hand maskData Font16 Gray_9e mLeft4 mTop4 hoverShow"
                  style={{ verticalAlign: 'middle' }}
                  onClick={e => {
                    e.stopPropagation();
                    setForceShowFullValue(true);
                  }}
                ></i>
              )}
            </Title>
          )}
          <CardCellControls
            appId={appId}
            fullShowCard={fullShowCard}
            parentControl={parentControl}
            controls={controls.filter(identity).filter(c => c.controlId !== titleControlId || hideTitle)}
            data={data}
            worksheetId={parentControl.dataSource}
            projectId={projectId}
            viewId={viewId}
            isCharge={isCharge}
            sheetSwitchPermit={sheetSwitchPermit}
          />
        </Content>
      </ControlCon>
    </Con>
  );
}

RecordCoverCard.propTypes = {
  disabled: PropTypes.bool,
  title: PropTypes.string,
  width: PropTypes.string,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  data: PropTypes.shape({}),
  cover: PropTypes.string,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
};
