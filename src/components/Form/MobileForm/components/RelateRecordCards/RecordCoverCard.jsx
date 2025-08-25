import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import _, { get, identity } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { validate } from 'uuid';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import { getTitleControlId, getTitleTextFromRelateControl } from '../../../core/utils';
import { getRecordCardStyle } from '../../tools/utils';
import CardCellControls from './CardCellControls';

const Con = styled.div`
  position: relative;
  width: 100%;
  border-radius: 3px;
  background-color: ${({ backgroundColor }) => backgroundColor || 'var(--color-third)'};
  border: 1px solid
    ${({ borderColor, canSelect, selected }) => {
      if (canSelect) {
        return selected ? 'var(--color-primary)' : 'var(--gray-e0)';
      }
      return borderColor || 'var(--gray-e0)';
    }};

  & + & {
    margin-top: ${props => (props.disabled ? 10 : 14)}px;
  }

  .selectIcon {
    position: absolute;
    top: 0;
    right: 0;
    border: 17px solid ${({ selected }) => (selected ? 'var(--color-primary)' : 'var(--gray-e0)')};
    border-left-color: transparent;
    border-bottom-color: transparent;
  }

  .icon-ok {
    position: absolute;
    top: 1px;
    right: 1px;
    font-size: 18px;
    color: var(--color-third);
  }

  .removeBtn {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    font-size: 26px;
    color: var(--gray-9e);
  }

  .exchangeBtn {
    position: absolute;
    top: 0;
    right: 9px;
    transform: translate(-50%, -50%);
    font-size: 26px;
    color: var(--gray-9e);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Title = styled.div`
  width: 100%;
  font-weight: bold;
  line-height: 1.5;
  color: var(--color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  word-break: break-all;
  ${({ titleStyle }) => titleStyle}
`;

const ControlCon = styled.div`
  display: flex;
  flex: 1;
  padding: 12px 16px;
  overflow: hidden;
  flex-direction: column;

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
    hideTitle,
    disabled,
    showAddAsDropdown,
    style = {},
    containerWidth,
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
    sheetSwitchPermit = [],
    onReplaceRecord = () => {},
    canSelect = false,
    selected = false,
  } = props;
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
      style={style}
      className={cx(className, allowlink !== '0')}
      canView={allowlink !== '0'}
      disabled={disabled}
      backgroundColor={get(recordCardStyle, 'cardStyle.backgroundColor')}
      borderColor={get(recordCardStyle, 'cardStyle.borderColor')}
      canSelect={canSelect}
      selected={selected}
    >
      {canSelect && (
        <Fragment>
          <div className="selectIcon" />
          <i className="icon-ok" />
        </Fragment>
      )}
      {!disabled && !showAddAsDropdown && (
        <Fragment>
          {allowReplaceRecord && <i className="icon-exchange exchangeBtn" onClick={click(onReplaceRecord)} />}
          <i className="icon-cancel removeBtn" onClick={click(onDelete)} />
        </Fragment>
      )}
      <ControlCon
        style={{
          ...(controls.length ? { paddingBottom: 10 } : {}),
        }}
      >
        {coverComp}
        <Content>
          {!hideTitle && (
            <Title
              key="title"
              title={title}
              style={{
                marginBottom: controls.length ? 8 : 0,
                fontSize: get(recordCardStyle, 'recordTitleStyle.size'),
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
