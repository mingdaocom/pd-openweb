import React from 'react';
import _ from 'lodash';
import GroupByControl from 'src/pages/worksheet/components/GroupByControl.jsx';
import { getAdvanceSetting } from 'src/utils/control';
import { canEditForGroupControl } from '../util';
import AddGalleryCard from './AddGalleryCard';
import GalleryCard from './GalleryCard';
import ViewMore from './ViewMore';

// 渲染一个画廊分组，包括分组头、组内卡片、新增入口和组内分页。
const GalleryGroup = props => {
  const {
    row = { totalNum: 0 },
    currentView,
    cardWidth,
    opKeys = [],
    setOpKeys,
    base = {},
    controls = [],
    galleryview = {},
    fetchMoreByGroup,
    worksheetInfo,
  } = props;
  const { viewId, appId, worksheetId } = base;
  const { groupsetting } = getAdvanceSetting(currentView);
  const { galleryGroupLoading, gallery = [] } = galleryview;
  const control = controls.find(o => o.controlId === _.get(safeParse(groupsetting, 'array'), '[0].controlId')) || {};
  const allowAdd = canEditForGroupControl({
    allowAdd: worksheetInfo?.allowAdd,
    control,
  });
  const isOpen = opKeys.includes(row.key);
  const rows = row.rows || [];

  // 每个分组独立处理展开状态、组内新增和组内分页加载。
  return (
    <React.Fragment>
      <GroupByControl
        className="groupByControlForGallery"
        appId={appId}
        projectId={worksheetInfo.projectId}
        allowAdd={allowAdd}
        worksheetId={worksheetId}
        viewId={viewId}
        view={currentView}
        folded={!isOpen}
        allFolded={opKeys.length >= gallery.length}
        count={row.totalNum}
        control={control}
        groupKey={row.key}
        name={row.name}
        onFold={() => {
          setOpKeys(isOpen ? opKeys.filter(o => o !== row.key) : [...opKeys, row.key]);
        }}
        onAllFold={value => {
          setOpKeys(value ? [] : gallery.map(o => o.key));
        }}
        onAdd={data => props.updateRow(data, row.key)}
      />
      {isOpen && (
        <React.Fragment>
          {rows.length <= 0 && <AddGalleryCard {...props} rowKey={row.key} cardWidth={cardWidth} />}
          {rows.map(it => (
            <GalleryCard
              {...props}
              key={safeParse(it)?.rowid}
              item={safeParse(it)}
              rowKey={row.key}
              cardWidth={cardWidth}
            />
          ))}
          {/* 分组内记录每次加载 20 条，与 galleryview action 的分组分页大小一致。 */}
          {row.totalNum > rows.length && (
            <ViewMore
              disabled={galleryGroupLoading}
              onClick={() => {
                if (galleryGroupLoading) return;
                fetchMoreByGroup(Math.floor(rows.length / 20 + 1), row.key);
              }}
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default GalleryGroup;
