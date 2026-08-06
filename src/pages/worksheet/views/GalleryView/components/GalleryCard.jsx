import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { getAdvanceSetting } from 'src/utils/control';
import GalleryItem from '../GalleryItem';
import { formatGalleryItem, getGalleryItemGroupInfo } from '../utils/formatGalleryItem';

// 连接画廊行数据和通用卡片组件，处理卡片级更新、删除、复制和新增回写。
const GalleryCard = props => {
  const { item, rowKey, currentView, cardWidth, onRecordClick, updateRow, deleteRow, galleryview = {} } = props;
  const { galleryViewCard } = galleryview;
  const { groupsetting } = getAdvanceSetting(currentView);
  const data = formatGalleryItem(item, props, currentView);
  const groupInfo = getGalleryItemGroupInfo(item, rowKey, props, currentView);

  // 卡片宽度由画廊视图统一计算，内部继续复用通用卡片渲染和操作能力。
  return (
    <div
      key={item.rowid}
      className={cx('galleryItem')}
      style={{ width: cardWidth }}
      onClick={() => onRecordClick(currentView, item, rowKey)}
    >
      <GalleryItem
        key={`galleryItem-${item.rowid}`}
        {...props}
        data={data}
        onUpdateFn={(updated, item) => {
          // 修改分组字段后记录归属会变化，需要同步目标分组并从原分组移除。
          if (
            !!item?.group?.key &&
            _.get(safeParse(groupsetting, 'array'), '[0].controlId') &&
            item?.group?.key !== rowKey
          ) {
            updateRow(item, item?.group?.key);
            deleteRow(item.rowid, rowKey);
            return;
          }

          updateRow(item, rowKey);
        }}
        onDeleteFn={id => deleteRow(id, rowKey)}
        onCopySuccess={it => updateRow(it, rowKey)}
        onAdd={data => updateRow(data, rowKey)}
        {...groupInfo}
        galleryViewCard={galleryViewCard}
      />
    </div>
  );
};

export default GalleryCard;
