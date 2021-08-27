import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getWorksheetInfo } from 'src/api/worksheet';
import { getAppForManager } from 'src/api/appManagement';
import { useSetState } from 'react-use';

// 获取表信息
export const useSheetInfo = ({ worksheetId, ...rest }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useSetState({});
  useEffect(() => {
    if (!worksheetId || loading) return;
    setLoading(true);
    getWorksheetInfo({ worksheetId, getTemplate: true, getViews: true, ...rest })
      .then(res => {
        const { views, template } = res;
        setData({ info: res, views, controls: _.get(template, 'controls') || [] });
      })
      .always(() => {
        setLoading(false);
      });
  }, [worksheetId]);
  return { loading, data };
};

export const useFocus = () => {
  const ref = useRef(null);
  const setFocus = () => {
    if (ref.current) {
      ref.current.focus();
    }
  };
  return { ref, setFocus };
};

// 获取节点的位置
export const useRect = () => {
  const [rect, setRect] = useState({});
  const ref = useCallback(node => {
    if (node) {
      setRect(node.getBoundingClientRect());
    }
  }, []);
  return [rect, ref];
};

export const useGetApps = (para, dep = []) => {
  const [apps, setApps] = useState([]);
  useEffect(() => {
    getAppForManager(para).then(data => {
      setApps(data);
    });
  }, dep);
  return [apps];
};

// 获取选项集
export const useGetOptionList = (para, dep = []) => {
  const [list, setList] = useState([]);
  useEffect(() => {
    getAppForManager(para).then(data => {
      setList(data);
    });
  }, dep);
  return list;
};

export const useFetchData = (method, para, { deps, format } = { deps: [] }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  useEffect(() => {
    setLoading(true);
    method(para)
      .then(({ code, msg, data }) => {
        if (code === 1) {
          setData(data);
        } else {
          alert(msg);
        }
      })
      .then()
      .always(() => {
        setLoading(false);
      });
  }, deps);
  return [loading, data];
};
