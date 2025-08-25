import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSetState } from 'react-use';
import { Skeleton } from 'antd';
import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import sheetAjax from 'src/api/worksheet';
import EditableCard from '../components/EditableCard';
import EditingRecordItem from '../components/EditingRecordItem';
import RecordPortal from '../components/RecordPortal';

const GalleryItem = props => {
  const {
    sheetSwitchPermit,
    data,
    worksheetInfo,
    base,
    views,
    isCharge,
    fieldShowCount,
    allowEditForGroup,
    groups,
    groupControl,
    galleryViewCard = {},
    updateGalleryViewCard = () => {},
  } = props;
  const $ref = useRef(null);
  const { viewId, appId } = base;
  const view = views.find(o => o.viewId === viewId) || {};
  const { projectId } = worksheetInfo;
  const [{ isEditTitle }, setState] = useSetState({
    isEditTitle: false,
  });
  const skeletonHeight = galleryViewCard?.height || data.fields?.length * 30 || 200;
  const skeletonRows = Math.floor(skeletonHeight / 40);
  const { ref, inView } = useInView({
    root: null,
    rootMargin: '100px',
    threshold: 0,
  });

  useEffect(() => {
    if (inView && galleryViewCard.needUpdate && $ref.current) {
      const height = $ref.current.getBoundingClientRect().height;
      updateGalleryViewCard({ height, needUpdate: false });
    }
  }, [inView, galleryViewCard.needUpdate]);

  const updateTitleData = control => {
    const { data, onUpdateFn, base, views } = props;
    const { viewId } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    let newControl = control;
    if (!control.controlId && control.data) {
      const { fields = [] } = data;
      const controlId = Object.keys(control.data)[0];
      newControl = {
        ...(fields.find(o => o.controlId === controlId) || {}),
        value: _.get(control, `data[${controlId}]`),
      };
    }
    worksheetAjax
      .updateWorksheetRow({
        rowId: data.rowId,
        ..._.pick(view, ['worksheetId', 'viewId']),
        newOldControl: [newControl],
      })
      .then(({ data, resultCode }) => {
        if (data && resultCode === 1) {
          onUpdateFn([data.rowid], _.omit(data, ['allowedit', 'allowdelete']));
        }
      });
  };

  const getStyle = () => {
    const $dom = $ref.current;
    if (!$dom) return {};
    const { top, left, width } = $dom.getBoundingClientRect();
    return { top, left, width };
  };

  const onCloseEdit = () => {
    setState({ isEditTitle: false });
  };

  return (
    <div ref={ref}>
      {inView ? (
        <EditableCard
          type="board"
          ref={$ref}
          data={data}
          currentView={{
            ...view,
            projectId: projectId,
            appId,
          }}
          fieldShowCount={fieldShowCount}
          isCharge={isCharge}
          allowCopy={worksheetInfo.allowAdd && data.allowEdit}
          allowRecreate={worksheetInfo.allowAdd}
          {..._.pick(worksheetInfo, ['entityName', 'roleType'])}
          sheetSwitchPermit={sheetSwitchPermit}
          editTitle={() => {
            setState({ isEditTitle: true });
          }}
          onUpdate={item => {
            //移动到另一分组下 更新数据
            props.onUpdateFn('', item);
          }}
          onDelete={() => {
            sheetAjax
              .deleteWorksheetRows({ rowIds: [data.rowId], ..._.pick(view, ['worksheetId', 'viewId']) })
              .then(res => {
                if (res.isSuccess) {
                  props.onDeleteFn(data.rowId);
                } else {
                  alert(_l('删除失败请稍后再试'), 2);
                }
              });
          }}
          onCopySuccess={props.onCopySuccess}
          updateTitleData={updateTitleData}
          onAdd={({ item }) => {
            props.onAdd(item);
          }}
          allowEditForGroup={allowEditForGroup}
          groups={groups}
          groupControl={groupControl}
        />
      ) : (
        <div className="skeletonBox" style={{ height: skeletonHeight }}>
          <Skeleton paragraph={{ rows: skeletonRows }} />
        </div>
      )}
      {isEditTitle && (
        <RecordPortal closeEdit={onCloseEdit}>
          <EditingRecordItem
            type="board"
            currentView={view}
            data={data}
            fieldShowCount={fieldShowCount}
            style={{
              ...getStyle(),
            }}
            isCharge={isCharge}
            closeEdit={onCloseEdit}
            updateTitleData={updateTitleData}
            allowEditForGroup={allowEditForGroup}
            groups={groups}
            groupControl={groupControl}
          />
        </RecordPortal>
      )}
    </div>
  );
};

export default GalleryItem;
