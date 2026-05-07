import React, { memo, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'ming-ui/antd-components';
import { fetchFilterData, formatFilterConditionToText } from '../../../../../../core/utils';

const AsyncTooltip = props => {
  const {
    filterId,
    worksheetId,
    filterConditions,
    setFilterConditionsMap,
    controls,
    setWorksheetControlsMap,
    children,
  } = props;

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [formattedCondition, setFormattedCondition] = useState('');

  const timerRef = useRef(null);
  // 组件是否卸载
  const mountedRef = useRef(true);
  // 防止重复请求
  const inFlightRef = useRef(false);

  // 页面卸载或组件销毁时清理
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
    };
  }, []);

  // 监听 filterConditions 变化，生成显示文本
  useEffect(() => {
    if (filterConditions && controls) {
      setFormattedCondition(formatFilterConditionToText(filterConditions, controls));
    }
  }, [filterConditions, controls]);

  const fetchData = async () => {
    if (filterConditions?.length || inFlightRef.current || !filterId) return;

    inFlightRef.current = true;
    setLoading(true);

    try {
      await fetchFilterData({
        worksheetId,
        filterId,
        setWorksheetControlsMap,
        setFilterConditionsMap,
      });
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const handleMouseEnter = () => {
    setVisible(true);
    // 延迟 300ms 请求
    if (!filterConditions) {
      timerRef.current = setTimeout(fetchData, 300);
    }
  };

  const handleMouseLeave = () => {
    // 清理定时器
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <Tooltip visible={visible} title={loading ? _l('加载中...') : formattedCondition || ''}>
      <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer' }}>
        {children}
      </span>
    </Tooltip>
  );
};

export default memo(AsyncTooltip);
