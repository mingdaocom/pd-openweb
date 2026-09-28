import React, { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Popover } from 'ming-ui/antd-components';
import SheetContext from 'worksheet/common/Sheet/SheetContext';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import EditableCard from 'src/pages/worksheet/views/components/EditableCard.jsx';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isTimeStyle } from 'src/utils/domain/control/type';
import { transferValue } from 'src/utils/domain/control/value';
import { SYS_CONTROLS_WORKFLOW } from 'src/utils/domain/control/widget';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { RECORD_COLOR_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';
import { getRecordColorConfig } from 'src/utils/domain/worksheet/record';
import { getEmbedValue } from 'src/utils/services/app/embed';
import { getRecordAttachments } from 'src/utils/services/worksheet/view';
import { RENDER_RECORD_NECESSARY_ATTR } from 'src/utils/services/worksheet/view';
import { CARD_WIDTH } from './constants';
import { isEmojiCharacter } from './util';

const eventCardCleanups = new WeakMap();
let activeEventCardCleanup;

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
  getButtonsCheckStatus,
  ...props
}) => {
  // 准备卡片数据
  const item = _.cloneDeep(_.get(info, 'event.extendedProps'));

  if (item?.info?.begin && item[item.info.begin]) {
    item[item.info.begin] = isTimeStyle(_.get(item, 'info.startData'))
      ? moment(item[item.info.begin])
      : item[item.info.begin];
  }

  if (item?.info?.end && item[item.info.end]) {
    item[item.info.end] = isTimeStyle(_.get(item, 'info.endData')) ? moment(item[item.info.end]) : item[item.info.end];
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
          worksheetInfo={worksheetInfo}
          hoverShowAll
          canDrag={false}
          isCharge={isCharge}
          currentView={{ ...currentView, appId, worksheetId, groupId, projectId: worksheetInfo.projectId }}
          buttonsCheckStatus={getButtonsCheckStatus()}
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
  initialVisible = false,
  getButtonsCheckStatus,
  ...props
}) => {
  const eventEl = info.el;
  const [visible, setVisible] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const hoverRef = useRef(null);
  const handleMouseMoveRef = useRef(null);

  const setHoverElement = useCallback(
    node => {
      hoverRef.current = node;

      if (node) {
        setVisible(initialVisible && eventEl.matches(':hover'));
      }
    },
    [eventEl, initialVisible],
  );

  useEffect(() => {
    handleMouseMoveRef.current = _.throttle(e => {
      if (!hoverRef.current) return;

      const timebarRect = hoverRef.current.getBoundingClientRect();
      const timebarWidth = timebarRect.width;

      if (timebarWidth > CARD_WIDTH) {
        const mouseX = e.clientX - timebarRect.left;
        let cardLeft = mouseX - CARD_WIDTH / 2;

        if (cardLeft < 0) {
          cardLeft = 0;
        } else if (cardLeft + CARD_WIDTH > timebarWidth) {
          cardLeft = timebarWidth - CARD_WIDTH;
        }

        setOffsetX(cardLeft);
      } else {
        setOffsetX(0);
      }
    }, 50);

    return () => {
      handleMouseMoveRef.current?.cancel();
      handleMouseMoveRef.current = null;
    };
  }, []);

  const handleMouseMove = e => {
    handleMouseMoveRef.current?.(e);
  };

  return (
    <Popover
      content={
        <EventCardContent
          info={info}
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
          getButtonsCheckStatus={getButtonsCheckStatus}
        />
      }
      align={{
        offset: [offsetX, -5],
      }}
      destroyOnHidden={false}
      title={undefined}
      trigger="hover"
      // trigger="click"
      placement="topLeft"
      classNames={{ root: 'event-card-popover calendarPopoverWrap' }}
      noPadding
      open={visible && !isMove}
      onOpenChange={visible => {
        setVisible(visible);
      }}
    >
      <div
        ref={setHoverElement}
        className="event-hover-area"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'auto',
        }}
        onMouseMove={handleMouseMove}
      />
    </Popover>
  );
};

const applyEventStyle = (info, currentView) => {
  const { event, el: eventEl } = info;
  const { stringColor, backgroundColor, borderColor, textColor, recordColor } = _.get(event, 'extendedProps', {});
  const colortype = getAdvanceSetting(currentView).colortype || RECORD_COLOR_SHOW_TYPE.BG;

  if (!_.get(event, ['extendedProps', 'editable'])) {
    eventEl.style.cursor = 'not-allowed';
  }

  const titleEl = eventEl.querySelector('.fc-event-title');

  if (titleEl) {
    titleEl.style.setProperty('color', textColor, 'important');
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

  ['Top', 'Bottom', 'Left', 'Right'].forEach(side => {
    eventEl.style[`border${side}`] = `1px solid ${borderColor}`;
  });
  eventEl.style.setProperty('background-color', 'var(--color-background-primary)', 'important');
  if (colortype !== RECORD_COLOR_SHOW_TYPE.LINE || !recordColor) {
    eventEl.style.setProperty(
      'background-image',
      `linear-gradient(${backgroundColor}, ${backgroundColor})`,
      'important',
    );
  } else {
    eventEl.style.removeProperty('background-image');
  }

  if ([RECORD_COLOR_SHOW_TYPE.LINE, RECORD_COLOR_SHOW_TYPE.LINE_BG].includes(colortype) && recordColor) {
    eventEl.style.borderLeft = `4px solid ${stringColor}`;
  }
};

export const eventDidMount = (
  info,
  currentView,
  controls,
  worksheetInfo,
  base,
  sheetSwitchPermit,
  isCharge,
  props,
  eventClick,
  isMove,
  getButtonsCheckStatus,
) => {
  applyEventStyle(info, currentView);
  let container;
  let root;
  let cleaned = false;

  const disposeEventCard = () => {
    if (!root) return;

    root.unmount();
    container.remove();
    root = undefined;
    container = undefined;

    if (activeEventCardCleanup === disposeEventCard) {
      activeEventCardCleanup = undefined;
    }
  };

  const mountEventCard = () => {
    if (root || cleaned) return;

    activeEventCardCleanup?.();
    container = document.createElement('div');
    container.className = `custom-card-container_${_.get(info, 'event.extendedProps.rowid')}`;
    info.el.appendChild(container);
    root = createRoot(container);
    root.render(
      <EventCard
        key={`custom-card_${_.get(info, 'event.extendedProps.rowid')}`}
        initialVisible
        isMove={isMove}
        info={info}
        currentView={currentView}
        controls={controls}
        worksheetInfo={worksheetInfo}
        base={base}
        sheetSwitchPermit={sheetSwitchPermit}
        getButtonsCheckStatus={getButtonsCheckStatus}
        isCharge={isCharge}
        eventClick={eventClick}
        {...props}
      />,
    );
    activeEventCardCleanup = disposeEventCard;
  };

  const cleanup = () => {
    if (cleaned) return;

    cleaned = true;
    info.el.removeEventListener('mouseenter', mountEventCard);
    disposeEventCard();
    eventCardCleanups.delete(info.el);
  };

  eventCardCleanups.get(info.el)?.();
  info.el.addEventListener('mouseenter', mountEventCard);
  eventCardCleanups.set(info.el, cleanup);

  return cleanup;
};

export const eventWillUnmount = info => {
  eventCardCleanups.get(info.el)?.();
};
