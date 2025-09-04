import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Popover } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import SheetContext from 'worksheet/common/Sheet/SheetContext';
import { getEmbedValue } from 'src/components/newCustomFields/tools/formUtils';
import { permitList } from 'src/pages/FormSet/config';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import EditableCard from 'src/pages/worksheet/views/components/EditableCard.jsx';
import { getRecordAttachments } from 'src/pages/worksheet/views/util.js';
import { RENDER_RECORD_NECESSARY_ATTR } from 'src/pages/worksheet/views/util.js';
import { dateConvertToServerZone } from 'src/utils/project';
import { getRecordColorConfig } from 'src/utils/record';
import { isEmojiCharacter, isTimeStyle } from './util';

const EventCardContent = ({
  info,
  currentView = {},
  controls,
  worksheetInfo,
  base,
  sheetSwitchPermit,
  isCharge,
  sheetButtons = [],
  printList = [],
  eventClick,
  ...props
}) => {
  // 准备卡片数据
  const item = _.cloneDeep(_.get(info, 'event.extendedProps'));
  if (item?.info?.begin && item[item.info.begin]) {
    item[item.info.begin] = dateConvertToServerZone(moment(item[item.info.begin]));
  }
  if (item?.info?.end && item[item.info.end]) {
    item[item.info.end] = dateConvertToServerZone(moment(item[item.info.end]));
  }
  const coverCid = currentView.coverCid || _.get(worksheetInfo, 'advancedSetting.coverid');
  let formData = controls.map(o => ({ ...o, value: item[o.controlId] }));
  const { coverImage, allAttachments } = getRecordAttachments(item[coverCid]);
  const { viewId, appId, worksheetId, groupId } = base;
  let coverData = { ...(controls.find(it => it.controlId === coverCid) || {}), value: item[coverCid] };

  if (coverData.type === 45) {
    let dataSource = transferValue(coverData.value);
    let urlList = [];
    dataSource.forEach(o => {
      if (o.staticValue) {
        urlList.push(o.staticValue);
      } else {
        urlList.push(
          getEmbedValue(
            {
              projectId: worksheetInfo.projectId,
              appId,
              groupId,
              worksheetId,
              viewId,
              recordId: item.rowid,
            },
            o.cid,
          ),
        );
      }
    });
    coverData = { ...coverData, value: urlList.join('') };
  }

  const formDataForCard = row => {
    const { displayControls = [] } = currentView;
    const parsedRow = row;
    const arr = [];

    const titleControl = controls.find(o => o.attribute === 1);
    if (titleControl) {
      arr.push({
        ..._.pick(titleControl, RENDER_RECORD_NECESSARY_ATTR),
        value: parsedRow[titleControl.controlId],
      });
    }

    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    let displayControlsCopy = !isShowWorkflowSys
      ? displayControls.filter(it => !_.includes(SYS_CONTROLS_WORKFLOW, it))
      : displayControls;

    displayControlsCopy.forEach(id => {
      const currentControl = _.find(controls, ({ controlId }) => controlId === id);
      if (currentControl) {
        const value = parsedRow[id];
        arr.push({ ..._.pick(currentControl, RENDER_RECORD_NECESSARY_ATTR), value });
      }
    });
    return arr;
  };

  const data = {
    coverData,
    coverImage,
    allAttachments,
    allowEdit: false,
    allowDelete: item.allowdelete,
    rawRow: item,
    recordColorConfig: getRecordColorConfig(currentView),
    fields: formDataForCard(item),
    formData,
    rowId: item.rowid,
  };

  return (
    <div className="cardCon" style={{ width: '300px' }} onClick={eventClick}>
      <SheetContext.Provider
        value={{
          isCharge,
          projectId: worksheetInfo.projectId,
          appId,
          groupId,
          worksheetId,
          config: { props },
          isRequestingRelationControls: worksheetInfo.isRequestingRelationControls,
          controls,
          view: currentView,
          sheetButtons,
          printList,
          sheetSwitchPermit,
        }}
      >
        <EditableCard
          type="board"
          showNull={true}
          data={data}
          hoverShowAll
          canDrag={false}
          isCharge={isCharge}
          currentView={{ ...currentView, appId, worksheetId, groupId }}
          allowCopy={worksheetInfo.allowAdd}
          allowRecreate={worksheetInfo.allowAdd}
          sheetSwitchPermit={sheetSwitchPermit}
          editTitle={() => {}}
          onCopySuccess={() => {
            props.refresh();
            props.refreshEventList();
          }}
          onDelete={() => {
            props.refresh();
            props.refreshEventList();
          }}
        />
      </SheetContext.Provider>
    </div>
  );
};

const EventCard = ({
  info,
  browserIsMobile,
  currentView,
  controls,
  worksheetInfo,
  base,
  sheetSwitchPermit,
  isCharge,
  sheetButtons = [],
  printList = [],
  views,
  eventClick,
  isMove,
  ...props
}) => {
  const { event, el } = info;
  const eventEl = el;
  const [visible, setVisible] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const hoverRef = useRef(null);
  const cardWidth = 300; // 卡片宽度

  const handleEventTimeDisplay = () => {
    const timeEl = eventEl.querySelector('.fc-event-time');
    if (!timeEl) return;
    const { event, view } = info;
    const { allDay } = event;
    const isMonthView = view.type === 'dayGridMonth';
    const setElementVisibility = (element, visible) => {
      element.style.display = visible ? '' : 'none';
    };
    setElementVisibility(
      timeEl,
      !browserIsMobile &&
        isTimeStyle(_.get(info, 'event.extendedProps.startData')) &&
        !(allDay && isMonthView) &&
        !(browserIsMobile && !isMonthView),
    );
  };

  useEffect(() => {
    if (!_.get(event, ['extendedProps', 'editable'])) {
      eventEl.style.cursor = 'not-allowed';
    }

    const titleEl = eventEl.querySelector('.fc-event-title');
    if (titleEl) {
      const mark = _.get(event, ['extendedProps', 'mark']);
      const title = _.get(event, 'title', '');

      if (mark) {
        const markSpan = document.createElement('span');
        markSpan.className = `mLeft10 Normal markTxt ${isEmojiCharacter(mark) ? '' : 'Alpha4'}`;
        markSpan.textContent = mark;

        titleEl.innerHTML = '';
        titleEl.appendChild(document.createTextNode(title));
        titleEl.appendChild(markSpan);
      } else {
        titleEl.textContent = title;
      }

      if (event.allDay) {
        titleEl.style.fontWeight = 'bold';
      }
    }
    handleEventTimeDisplay();
  }, [eventEl, event, currentView]);

  const handleMouseMove = e => {
    if (!hoverRef.current) return;

    const timebarRect = hoverRef.current.getBoundingClientRect();
    const timebarWidth = timebarRect.width;

    if (timebarWidth > cardWidth) {
      const mouseX = e.clientX - timebarRect.left;
      let cardLeft = mouseX - cardWidth / 2;
      if (cardLeft < 0) {
        cardLeft = 0;
      } else if (cardLeft + cardWidth > timebarWidth) {
        cardLeft = timebarWidth - cardWidth;
      }
      setOffsetX(cardLeft);
    } else {
      setOffsetX(0);
    }
  };

  if (browserIsMobile) return null;

  return (
    <Popover
      content={
        <EventCardContent
          info={info}
          browserIsMobile={browserIsMobile}
          currentView={{
            ...currentView,
            displayControls: _.uniq([
              _.get(info, 'event._def.extendedProps.info.begin'),
              _.get(info, 'event._def.extendedProps.info.end'),
              ...currentView.displayControls,
            ]),
          }}
          controls={controls}
          worksheetInfo={worksheetInfo}
          base={base}
          sheetSwitchPermit={sheetSwitchPermit}
          isCharge={isCharge}
          sheetButtons={sheetButtons}
          printList={printList}
          views={views}
          {...props}
          eventClick={eventClick}
        />
      }
      align={{
        offset: [offsetX, 5],
      }}
      zIndex={100}
      arrow={false}
      title={undefined}
      trigger="hover"
      // trigger="click"
      placement="topLeft"
      overlayClassName="event-card-popover calendarPopoverWrap"
      visible={visible && !isMove}
      onVisibleChange={visible => {
        setVisible(visible);
      }}
      destroyTooltipOnHide
    >
      <div
        ref={hoverRef}
        className="event-hover-area"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'auto',
        }}
        onMouseMove={_.throttle(handleMouseMove, 50)}
      />
    </Popover>
  );
};

export const eventDidMount = (
  info,
  browserIsMobile,
  currentView,
  controls,
  worksheetInfo,
  base,
  sheetSwitchPermit,
  isCharge,
  props,
  eventClick,
  isMove,
) => {
  const container = document.createElement('div');
  container.className = `custom-card-container_${_.get(info, 'event.extendedProps.rowid')}`;
  info.el.appendChild(container);

  const root = createRoot(container);

  root.render(
    <EventCard
      key={`custom-card_${_.get(info, 'event.extendedProps.rowid')}`}
      isMove={isMove}
      info={info}
      browserIsMobile={browserIsMobile}
      currentView={currentView}
      controls={controls}
      worksheetInfo={worksheetInfo}
      base={base}
      sheetSwitchPermit={sheetSwitchPermit}
      isCharge={isCharge}
      eventClick={eventClick}
      {...props}
    />,
  );

  return () => {
    root.unmount();
    container.remove();
  };
};
