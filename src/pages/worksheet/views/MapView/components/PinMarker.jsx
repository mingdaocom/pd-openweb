import React, { useEffect, useState } from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, func, number, shape } from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import SheetContext from 'worksheet/common/Sheet/SheetContext';
import { sortControlByIds } from 'src/utils/control';
import { addBehaviorLog } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import { getRecordColor, getRecordColorConfig } from 'src/utils/record';
import EditableCard from '../../components/EditableCard';
import Marker from '../amap/Maker';

const wrapStyles = `
.iconCon {
  position: relative;
  .pinIcon {
    position: relative;
    z-index: 9;
  }
  .searchRecordSign {
    width: 48px;
    height: 16px;
    background: rgba(255, 147, 0, 0.3);
    border: 1px solid #ff9300;
    border-radius: 100%;
    position: absolute;
    top: 24px;
    left: -6px;
  }
}
.markCon {
  display: flex;
  position: relative;
  left: -17px;
  transform: translateX(50%);
}
.markCon > .content {
  margin-left: 6px;
  white-space: nowrap;
  background-color: transparent;
  border-radius: 4px;
  font-size: 13px;
  color: #151515;
  position: relative;
  .text {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    white-space: nowrap;
    max-width: 200px;
    padding: 6px 10px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: top;
  }
  &::before {
    content: ' ';
    position: absolute;
    display: block;
    right: 0px;
    bottom: 30px;
    height: 10px;
    width: calc(100% + 40px);
  }
  &:hover {
    .pinDetail {
      display: inline-flex;
    }
  }
}
.recordOperateWrap {
  display: none !important;
}
`;
const AMapCon = styled(Marker)`
  ${wrapStyles}
`;
const GMapCon = styled.div`
  ${wrapStyles}
`;

const PinCardCon = styled.div`
  position: absolute;
  z-index: 99;
  left: -135px;
  bottom: 40px;
  flex-direction: row;
  width: 300px;
  border-radius: 3px;
  background-color: #fff;
  box-shadow:
    rgba(0, 0, 0, 0.12) 0px 1px 4px 0px,
    rgba(0, 0, 0, 0.12) 0px 0px 2px 0px;
  color: #151515;
  display: block;
  overflow: hidden;
  &.active {
    .contentWrap {
      display: block !important;
    }
  }
  .contentWrap {
    display: none;
  }
`;

function getTagColor(tagType, colorControl, record = {}) {
  if (tagType === '1') {
    return {
      color: '#fff',
      bgColor: '#151515',
    };
  } else if (tagType === '2') {
    try {
      let activeKey = safeParse(record[colorControl.controlId], 'array')[0];

      if (activeKey && typeof activeKey === 'string' && activeKey.startsWith('other')) {
        activeKey = 'other';
      }

      const activeOption = colorControl.options.find(c => c.key === activeKey);
      const color = colorControl.enumDefault2 === 0 ? '#fff' : activeOption.color;

      return {
        bgColor: color,
        color: new TinyColor(color).isLight() ? '#151515' : '#fff',
      };
    } catch (err) {
      console.log(err);
      return {
        color: '#151515',
        bgColor: '#fff',
      };
    }
  } else {
    return {
      color: '#151515',
      bgColor: '#fff',
    };
  }
}

export default function MarkerCard(props) {
  const {
    marker,
    controls,
    mapViewConfig = {},
    view = {},
    appId,
    isCurrent,
    isCharge,
    worksheetInfo,
    sheetSwitchPermit,
    sheetButtons,
    printList,
    viewId,
    mobileCloseCard,
    groupId,
    isMobile,
    type = 'AMap',
    onChangeRecordId = () => {},
    handleRefresh = () => {},
    getData,
    updateNavGroup,
  } = props;
  const { position, title, cover, record } = marker;
  const { titleId, tagType, tagcolorid, showtitle } = mapViewConfig;
  const [active, setActive] = useState(false);
  const recordColorConfig = getRecordColorConfig(view);

  const recordColor =
    recordColorConfig &&
    getRecordColor({
      controlId: recordColorConfig.controlId,
      colorItems: recordColorConfig.colorItems,
      controls,
      row: marker.record,
    });

  useEffect(() => {
    if (mobileCloseCard === 0 || !isMobile || !active) return;
    setActive(false);
  }, [mobileCloseCard]);

  const color = getTagColor(
    tagType,
    _.find(controls, c => c.controlId === tagcolorid),
    record,
  );

  const coverControl = view.coverCid
    ? controls.find(l => l.controlId === view.coverCid)
    : (controls.filter(l => l.type === 14) || [])[0];
  const formData = sortControlByIds(
    controls.map(l => {
      return {
        ...l,
        value: marker.record[l.controlId] || undefined,
      };
    }),
    view.controlsSorts || [],
  );
  let coverUrl;
  try {
    coverUrl = safeParse(cover, 'array')[0] ? safeParse(cover, 'array')[0].previewUrl : '';
  } catch (err) {
    console.log(err);
  }

  const openRecord = () => {
    openRecordInfo({
      appId,
      worksheetId: worksheetInfo.worksheetId,
      recordId: marker.record.rowid,
      viewId,
      appSectionId: groupId,
      isOpenNewAddedRecord: true,
      onClose: () => {
        getData();
        updateNavGroup();
      },
    });
  };

  const updateTitleControlData = control => {
    worksheetAjax.updateWorksheetRow({
      rowId: record.rowid,
      worksheetId: worksheetInfo.worksheetId,
      viewId,
      newOldControl: [control],
    });
  };

  const Con = type === 'AMap' ? AMapCon : GMapCon;

  return (
    <Con {...props} position={[position.x, position.y]} zIndex={active ? 101 : 100}>
      <div className="markCon" style={{ zIndex: isCurrent || active ? 9 : 1 }}>
        <div className="iconCon">
          <Icon
            icon="location_on"
            className="Font34 pinIcon"
            style={{ color: recordColor?.color ? `${recordColor.color}` : '#f44336' }}
            onMouseOver={() => setActive(true)}
            onMouseOut={() => setActive(false)}
            onTouchStartCapture={() => setActive(!active)}
          />
          {isCurrent && <div className="searchRecordSign"></div>}
        </div>
        <div
          className="content"
          onMouseOver={() => setActive(true)}
          onMouseOut={() => setActive(false)}
          onClick={() => {
            if (isMobile) return;
            handleRecordClick(view, marker.record, () => {
              openRecord();
              addBehaviorLog('worksheetRecord', worksheetInfo.worksheetId, { rowId: record.rowid }); // 埋点
            });
          }}
        >
          {title && showtitle !== '0' && (
            <span
              className="text"
              style={{
                backgroundColor: color.bgColor,
                color: color.color,
              }}
              onTouchStartCapture={() => setActive(!active)}
            >
              {title}
            </span>
          )}
          <PinCardCon
            id={`mapViewCard-${record.rowid}`}
            className={cx('mapViewCard', { active: active })}
            style={{
              visibility: active ? 'visible' : 'hidden',
            }}
            onMouseLeave={() => document.body.dispatchEvent(new Event('mousedown'))}
            onTouchStartCapture={e => {
              e.stopPropagation();
              handleRecordClick(view, marker.record, () => {
                if (window.isMingDaoApp && (!window.shareState.shareId || window.APP_OPEN_NEW_PAGE)) {
                  window.location.href = `/mobile/record/${appId}/${worksheetInfo.worksheetId}/${viewId}/${record.rowid}`;
                  return;
                }

                onChangeRecordId(record.rowid);
                addBehaviorLog('worksheetRecord', worksheetInfo.worksheetId, { rowId: record.rowid }); // 埋点
              });
            }}
          >
            <SheetContext.Provider
              value={{
                isCharge,
                projectId: worksheetInfo.projectId,
                appId,
                groupId,
                worksheetId: worksheetInfo.worksheetId,
                config: { props },
                isRequestingRelationControls: worksheetInfo.isRequestingRelationControls,
                controls,
                view,
                sheetButtons,
                printList,
                sheetSwitchPermit,
              }}
            >
              <EditableCard
                type="board"
                showNull={true}
                data={{
                  allAttachments: safeParse(marker.cover, 'array'),
                  allowDelete: record.allowdelete,
                  allowEdit: false,
                  coverData: coverControl,
                  coverImage: coverUrl
                    ? coverUrl.indexOf('imageView2') > -1
                      ? coverUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/0/h/200')
                      : `${coverUrl}&imageView2/0/h/200`
                    : '',
                  fields: formData.filter(l => _.includes((view.displayControls || []).concat([titleId]), l.controlId)),
                  rawRow: JSON.stringify(marker.record),
                  rowId: marker.record.rowid,
                  formData: formData,
                  recordColorConfig,
                }}
                hoverShowAll
                canDrag={false}
                isCharge={isCharge}
                currentView={{ ...view, appId, projectId: worksheetInfo.projectId }}
                allowCopy={worksheetInfo.allowAdd}
                allowRecreate={worksheetInfo.allowAdd}
                sheetSwitchPermit={sheetSwitchPermit}
                onUpdate={() => {}}
                onDelete={handleRefresh}
                onCopySuccess={handleRefresh}
                updateTitleData={updateTitleControlData}
              />
            </SheetContext.Provider>
          </PinCardCon>
        </div>
      </div>
    </Con>
  );
}

MarkerCard.propTypes = {
  position: arrayOf(number),
  mapViewConfig: shape({}),
  marker: shape({}),
  controls: arrayOf(shape({})),
  onClick: func,
};
