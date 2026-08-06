import { useEffect, useRef } from 'react';
import _ from 'lodash';
import { getAdvanceSetting } from 'src/utils/control';

const notFetchAttr = [
  'name',
  'worksheetName',
  'showControlName',
  'advancedSetting.rowcolumns',
  'advancedSetting.checkradioid',
  'advancedSetting.maxlinenum',
  'advancedSetting.showcount',
  'advancedSetting.coverstyle',
  'advancedSetting.opencover',
  'advancedSetting.cardwidth',
  'advancedSetting.refreshtime',
];

// 计算分组画廊进入视图或分组数据刷新后的默认展开分组。
const getOpenKeys = props => {
  const { base = {}, views = [], galleryview = {} } = props;
  const { gallery = [] } = galleryview;
  const currentView = views.find(o => o.viewId === base.viewId) || {};

  if (!_.get(currentView, 'advancedSetting.groupsetting')) return null;

  const groupopen = _.get(currentView, 'advancedSetting.groupopen') || '2';

  // 按视图配置初始化分组展开状态：展开首组、全部展开或全部收起。
  if (!['3', '2'].includes(groupopen)) {
    return [_.get(gallery, '[0].key')];
  }

  return groupopen === '2' ? gallery.map(o => o.key) : [];
};

// 监听画廊视图配置、筛选、侧栏状态变化，并按业务规则决定是否重新拉取记录。
export const useGalleryFetchEffect = (props, options) => {
  const { clicksearch, setClicksearch, setOpKeys, getFetch } = options;
  const latestPropsRef = useRef(props);
  const prevPropsRef = useRef();
  const fetchTimerRef = useRef();
  const openKeysTimerRef = useRef();

  latestPropsRef.current = props;

  useEffect(() => {
    getFetch(props);
    openKeysTimerRef.current = setTimeout(() => {
      const openKeys = getOpenKeys(latestPropsRef.current);
      if (openKeys) setOpKeys(openKeys);
    }, 500);

    return () => {
      clearTimeout(fetchTimerRef.current);
      clearTimeout(openKeysTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const prevProps = prevPropsRef.current;

    if (!prevProps) {
      prevPropsRef.current = props;
      return;
    }

    const {
      base = {},
      chatVisible,
      sheetListVisible,
      views = [],
      groupFilterWidth,
      navGroupFilters,
      quickFilter = [],
    } = props;
    const { viewId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const preView = (prevProps.views || []).find(o => o.viewId === _.get(prevProps, 'base.viewId')) || {};
    const { clicksearch: nextClicksearch } = getAdvanceSetting(currentView);

    prevPropsRef.current = props;

    // 点击查询模式下，用户未执行快速筛选前不主动加载记录。
    if (nextClicksearch === '1' && quickFilter.length <= 0) return;

    // 仅展示样式类配置不触发重新取数，避免切换卡片展示项时多余请求。
    const shouldFetch =
      !_.isEqual(_.omit(currentView, notFetchAttr), _.omit(preView, notFetchAttr)) ||
      nextClicksearch !== clicksearch ||
      !_.isEqual(navGroupFilters, prevProps.navGroupFilters);

    if (
      sheetListVisible !== prevProps.sheetListVisible ||
      shouldFetch ||
      viewId !== _.get(prevProps, 'base.viewId') ||
      chatVisible !== prevProps.chatVisible ||
      groupFilterWidth !== prevProps.groupFilterWidth
    ) {
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = setTimeout(
        () => {
          getFetch(props);
        },
        // 记录颜色依赖后端重新计算，颜色字段变更后延迟刷新以拿到最新颜色值。
        _.get(preView, 'advancedSetting.colorid') !== _.get(currentView, 'advancedSetting.colorid') ? 200 : 0,
      );
      props.updateGalleryViewCard({
        needUpdate: true,
      });
    }

    setClicksearch(nextClicksearch);

    if (
      !_.isEqual(
        _.get(props, 'galleryview.gallery', []).map(o => o.key),
        _.get(prevProps, 'galleryview.gallery', []).map(o => o.key),
      ) ||
      _.get(currentView, 'advancedSetting.groupopen') !== _.get(preView, 'advancedSetting.groupopen')
    ) {
      const openKeys = getOpenKeys(props);
      if (openKeys) setOpKeys(openKeys);
    }
  });
};
