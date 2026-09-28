import { useEffect, useRef } from 'react';

// ScrollView 的翻页依赖 onScrollEnd，而 onScrollEnd 只在真正发生滚动时才会触发。
// 若首屏内容撑不满可视区（接口按固定 size 取数、渲染前又过滤掉了部分数据时很常见），
// 列表既没有滚动条也就永远拿不到下一页，分页停在第一页。
// 这里在「还有下一页且当前内容不足以滚动」时主动补拉，直到滚动条出现或没有下一页。

// 与 ScrollView 默认 allowance 一致：可滚动距离小于它时，滚到底也只差一点，同样视为需要补页
const SCROLLABLE_ALLOWANCE = 20;
// 兜底上限，避免上游 hasMore 恒为 true 时无限翻页
const MAX_AUTO_LOAD_TIMES = 20;

/**
 * @param {object}   params
 * @param {object}   params.scrollViewRef 指向 ming-ui ScrollView 的 ref（需要其 getScrollInfo）
 * @param {boolean}  params.hasMore       是否还有下一页
 * @param {boolean}  params.loading       是否正在整拉（首屏 / 换筛选条件），期间不补页并重置计数
 * @param {boolean}  params.loadingMore   是否正在加载下一页
 * @param {*}        params.contentKey    内容变化标识（一般传列表长度），变化后重新判断能否滚动
 * @param {function} params.onLoadMore    补拉下一页
 */
export default function useAutoLoadUntilScrollable({
  scrollViewRef,
  hasMore,
  loading,
  loadingMore,
  contentKey,
  onLoadMore,
}) {
  const onLoadMoreRef = useRef(onLoadMore);
  const autoLoadTimesRef = useRef(0);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });

  useEffect(() => {
    if (loading) {
      autoLoadTimesRef.current = 0;
      return;
    }

    if (!hasMore || loadingMore || autoLoadTimesRef.current >= MAX_AUTO_LOAD_TIMES) return;

    // 延后一帧再量，避免拿到本次渲染前的 scrollHeight
    const timer = setTimeout(() => {
      const { clientHeight, maxScrollTop } = (scrollViewRef.current && scrollViewRef.current.getScrollInfo()) || {};

      // clientHeight 为 0 说明容器还没完成布局，此时量出的高度不可信，等下次内容变化再判断
      if (!clientHeight || maxScrollTop > SCROLLABLE_ALLOWANCE) return;

      autoLoadTimesRef.current += 1;
      onLoadMoreRef.current();
    }, 0);

    return () => clearTimeout(timer);
  }, [hasMore, loading, loadingMore, contentKey, scrollViewRef]);
}
