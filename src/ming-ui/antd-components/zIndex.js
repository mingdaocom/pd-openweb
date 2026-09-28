import { CONTAINER_MAX_OFFSET, containerBaseZIndexOffset } from 'antd/es/_util/hooks/useZIndex';

const ANTD_CONTAINER_SELECTOR = '[class*="-modal-wrap"], [class*="-drawer"]';
const GLOBAL_FEEDBACK_RESERVED_CONTAINER_COUNT = 100;

const hasClassSuffix = (element, suffix) =>
  Array.from(element.classList || []).some(className => className.endsWith(suffix));

const toFiniteNumber = value => {
  try {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  } catch {
    return 0;
  }
};

const getElementStyle = element => {
  if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') return element.style || {};

  return window.getComputedStyle(element);
};

const getVisibleContainerZIndex = element => {
  const isModalWrap = hasClassSuffix(element, '-modal-wrap');
  const isOpenDrawer = hasClassSuffix(element, '-drawer') && hasClassSuffix(element, '-drawer-open');

  if (!isModalWrap && !isOpenDrawer) return 0;

  const style = getElementStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return 0;

  return toFiniteNumber(style.zIndex);
};

// Ant Design 静态 API 会创建独立 React Root，只能从已渲染的容器恢复当前层级。
const getCurrentContainerZIndex = () => {
  if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return 0;

  return Array.from(document.querySelectorAll(ANTD_CONTAINER_SELECTOR)).reduce(
    (maxZIndex, element) => Math.max(maxZIndex, getVisibleContainerZIndex(element)),
    0,
  );
};

// 为旧命令式弹层预留固定层级区间，避免无法获取调用位置 ZIndexContext 时被父层遮挡。
export const LEGACY_STATIC_MODAL_Z_INDEX = 2_000_000;
// 全局反馈额外预留 100 个 Ant Design 容器区间，避免深层弹层超过提示层。
export const GLOBAL_FEEDBACK_Z_INDEX =
  LEGACY_STATIC_MODAL_Z_INDEX + CONTAINER_MAX_OFFSET * GLOBAL_FEEDBACK_RESERVED_CONTAINER_COUNT;

export const getLegacyStaticModalZIndex = zIndex => {
  const configuredZIndex = toFiniteNumber(zIndex);
  const currentContainerZIndex = getCurrentContainerZIndex();

  return Math.max(
    LEGACY_STATIC_MODAL_Z_INDEX,
    configuredZIndex,
    currentContainerZIndex ? currentContainerZIndex + containerBaseZIndexOffset.Modal : 0,
  );
};
