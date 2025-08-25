import React, { memo, useEffect, useRef } from 'react';
import { PullToRefresh } from 'antd-mobile';
import PropTypes from 'prop-types';
import './index.less';

// 下拉释放的内容
const RenderLoading = () => {
  return (
    <div className="spinnerContainer">
      <div className="spinner"></div>
    </div>
  );
};

const PullToRefreshWrapper = ({
  mode = 'auto',
  onRefresh,
  pullText = '下拉刷新',
  completeText = '',
  threshold = 60,
  autoRefreshDuration = 1500,
  disabled = false,
  children,
}) => {
  const timerRef = useRef();

  const handleRefresh = async () => {
    switch (mode) {
      case 'auto':
        onRefresh();
        await new Promise(resolve => (timerRef.current = setTimeout(resolve, autoRefreshDuration)));
        break;
      case 'manual':
        try {
          await onRefresh();
        } catch (e) {
          console.log(e);
        }
        break;
      default:
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="pullToRefreshContainer">
      <PullToRefresh
        onRefresh={handleRefresh}
        pullText={pullText}
        canReleaseText={<RenderLoading />}
        refreshingText={<RenderLoading />}
        completeText={completeText}
        threshold={threshold}
        disabled={disabled}
      >
        {children}
      </PullToRefresh>
    </div>
  );
};

PullToRefreshWrapper.propTypes = {
  /**
   * 模式
   * auto：自动结束
   * manual：根据异步任务结束
   */
  mode: PropTypes.oneOf(['auto', 'manual']),
  onRefresh: PropTypes.func,
  // 下拉的提示文案
  pullText: PropTypes.node,
  // 完成时的提示文案
  completeText: PropTypes.node,
  // 触发刷新需要下拉多少距离
  threshold: PropTypes.number,
  // 自动结束时间（ms）
  autoRefreshDuration: PropTypes.number,
  children: PropTypes.node.isRequired,
};

export default memo(PullToRefreshWrapper);
