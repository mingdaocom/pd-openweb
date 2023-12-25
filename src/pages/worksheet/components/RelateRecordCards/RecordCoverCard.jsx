import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import _ from 'lodash';
import { validate } from 'uuid';
import { CardButton } from '../Basics';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import { browserIsMobile } from 'src/util';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import CardCellControls from './CardCellControls';
import { FROM } from 'src/components/newCustomFields/tools/config';

const Con = styled.div`
  display: inline-flex;
  flex-direction: row;
  margin: ${({ isMobile }) => (isMobile ? '0 0 10px 0' : '0 14px 14px 0')};
  position: relative;
  border-radius: 3px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 4px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px;
  &:hover {
    ${({ canView, isMobile }) =>
      canView && !isMobile
        ? 'box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 12px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px;'
        : ''}
  }
  .operateButton {
    position: absolute;
    display: flex;
    top: -11px;
    right: -11px;
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
  &:hover {
    .hoverShow {
      visibility: visible;
    }
  }
`;

const Title = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #333;
`;

const ControlCon = styled.div`
  flex: 1;
  padding: 12px 16px;
  overflow: hidden;
`;

function click(func) {
  return e => {
    e.stopPropagation();
    func();
  };
}

export default function RecordCoverCard(props) {
  const {
    from,
    disabled,
    style = {},
    width,
    controls,
    data,
    cover,
    allowReplaceRecord,
    onClick,
    onDelete,
    projectId,
    viewId,
    allowlink,
    sourceEntityName = '',
    parentControl,
    isCharge,
    onReplaceRecord = () => {},
  } = props;
  const coverSize = 50 + 28 * controls.slice(0, 3).length;
  const isMobile = browserIsMobile();
  const [forceShowFullValue, setForceShowFullValue] = useState(false);
  const titleControl = _.find(parentControl.relationControls, { attribute: 1 });
  const titleMasked =
    titleControl &&
    _.get(titleControl, 'advancedSetting.datamask') === '1' &&
    _.get(titleControl, 'advancedSetting.isdecrypt') === '1';
  const title =
    props.title ||
    (data.rowid && validate(data.rowid)
      ? getTitleTextFromRelateControl(parentControl, data, { noMask: forceShowFullValue })
      : _l('关联当前%0', sourceEntityName));
  return (
    <Con
      onClick={onClick}
      style={{ ...style, ...(width ? { width } : {}) }}
      className={!disabled && allowlink !== '0' && 'Hand'}
      canView={allowlink !== '0'}
      isMobile={isMobile}
    >
      {!disabled && (
        <div className="operateButton">
          {allowReplaceRecord && (
            <CardButton
              className="mRight8 tip-bottom"
              style={isMobile ? { visibility: 'visible' } : {}}
              onClick={click(onReplaceRecord)}
              data-tip={_l('重新选择')}
            >
              <i className="icon icon-swap_horiz"></i>
            </CardButton>
          )}
          <CardButton className="red" style={isMobile ? { visibility: 'visible' } : {}} onClick={click(onDelete)}>
            <i className="icon icon-close"></i>
          </CardButton>
        </div>
      )}
      <ControlCon
        style={{
          ...(controls.length ? { paddingBottom: 10 } : {}),
        }}
      >
        <Title key="title" className="ellipsis" title={title} style={{ marginBottom: controls.length ? 8 : 0 }}>
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
        <CardCellControls
          parentControl={parentControl}
          width={width}
          controls={controls}
          data={data}
          worksheetId={parentControl.dataSource}
          projectId={projectId}
          viewId={viewId}
          isCharge={isCharge}
        />
      </ControlCon>
      {cover && !!controls.length && (
        <img
          src={cover}
          style={{
            width: coverSize,
            height: coverSize,
            boxSizing: 'content-box',
            borderTopRightRadius: '3px',
            borderBottomRightRadius: '3px',
            borderLeft: '1px solid rgb(0, 0, 0, .04)',
            objectFit: 'contain',
          }}
          onClick={e => {
            e.stopPropagation();
            previewQiniuUrl(cover.replace(/\|imageView2\/1\/w\/\d+\/h\/\d+/, ''), {
              disableDownload: true,
              ext: (cover.match(/\.(jpg|jpeg|png|gif|bmp)(\?|$)/i) || '')[1] || 'png',
            });
          }}
        />
      )}
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
