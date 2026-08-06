import React from 'react';
import _ from 'lodash';
import GalleryCard from './GalleryCard';
import GalleryGroup from './GalleryGroup';

// 按当前视图是否开启分组，选择普通卡片列表或分组卡片列表。
const GalleryContent = props => {
  const { base = {}, galleryview = {}, views = [], opKeys, setOpKeys, cardWidth } = props;
  const { gallery = [] } = galleryview;
  const currentView = views.find(o => o.viewId === base.viewId) || {};

  // 分组画廊的数据按分组承载 rows，普通画廊直接按记录列表渲染。
  if (_.get(currentView, 'advancedSetting.groupsetting')) {
    return gallery.map(row => (
      <GalleryGroup
        {...props}
        key={row.key}
        row={row}
        currentView={currentView}
        cardWidth={cardWidth}
        opKeys={opKeys}
        setOpKeys={setOpKeys}
      />
    ));
  }

  return gallery.map(item => (
    <GalleryCard {...props} key={item.rowid} item={item} currentView={currentView} cardWidth={cardWidth} />
  ));
};

export default GalleryContent;
