import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import departmentAjax from 'src/api/department.js';
import fixedDataController from 'src/api/fixedData';
import sheetAjax from 'src/api/worksheet';
import { updateGroupFilter } from 'worksheet/redux/actions';
import { getNavGroupCount } from 'worksheet/redux/actions/navFilter';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import { emitter } from 'src/utils/common';
import { getFilledRequestParams } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import { AREA, PARTICULARLY_CITY, TYPES } from './constants.js';
import NavGroupCon from './NavGroup';
import NavSearch from './NavSearch.jsx';
import { Con } from './style';
import {
  formatData,
  getAllDepartmentIds,
  getListByNavlayer,
  getSourceControlByNav,
  prepareRequestParams,
  renderTxt,
  transformCountsToData,
} from './util';

let getNavGroupRequest = null;
let preWorksheetIds = [];

function GroupFilter(props) {
  const {
    views = [],
    width,
    isOpenGroup,
    base,
    controls,
    updateGroupFilter,
    filters,
    quickFilter,
    navGroupCounts,
    getNavGroupCount,
    navGroupFilters,
    worksheetInfo,
  } = props;

  const searchRef = useRef({});
  const { viewId } = base;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const navGroup = _.isEmpty(view.navGroup) ? {} : view.navGroup[0];
  const [navGroupData, setGroupFilterData] = useState([]); //当前的列表数据
  const [rowIdForFilter, setRowIdForFilter] = useState(''); //当前选中的项
  const [navName, setNavName] = useState(''); //创建新纪录时，需要根据当前选中的项带到的默认值
  const [openKeys, setOpenKeys] = useState([]); //树形呈现时，展开的ids
  const [loading, setLoading] = useState(true);
  const source = useMemo(() => getSourceControlByNav(navGroup, controls) || {}, [navGroup, controls]);

  const latestValues = useRef({
    source,
    navGroup,
    view,
    controls,
    base,
    worksheetInfo,
    navGroupData,
    navGroupCounts,
    isOpenGroup,
  });

  useEffect(() => {
    latestValues.current = {
      source,
      navGroup,
      view,
      controls,
      base,
      worksheetInfo,
      navGroupData,
      navGroupCounts,
      isOpenGroup,
    };
  }, [source, navGroup, view, controls, base, worksheetInfo, navGroupData, navGroupCounts, isOpenGroup]);

  useEffect(() => {
    emitter.addListener('ROWS_UPDATE', getNavGroupCount);
    return () => {
      emitter.removeListener('ROWS_UPDATE', getNavGroupCount);
    };
  }, []);

  useEffect(() => {
    setRowIdForFilter('');
    setNavName('');
    searchRef.current.value = '';
  }, [navGroup, navGroup.controlId, navGroup.viewId, navGroup.isAsc]);

  useEffect(() => {
    if (_.isEmpty(navGroupFilters)) {
      setRowIdForFilter('');
    }
  }, [navGroupFilters]);

  useEffect(() => {
    if (isOpenGroup) {
      if ([29, 26, 27, 48].includes(source.type) && getAdvanceSetting(view).navshow === '1') {
        getNavGroupCount();
      }
      source.controlId && fetch();
    }
  }, [
    source.controlId,
    navGroup.viewId,
    navGroup.isAsc,
    isOpenGroup,
    getAdvanceSetting(view).navfilters,
    getAdvanceSetting(view).navsorts,
    getAdvanceSetting(view).customnavs,
    getAdvanceSetting(view).navshow,
    getAdvanceSetting(view).showallitem,
    getAdvanceSetting(view).allitemname,
    getAdvanceSetting(view).shownullitem,
    getAdvanceSetting(view).nullitemname,
    getAdvanceSetting(view).navlayer,
  ]);

  useEffect(() => {
    isOpenGroup && getNavGroupCount();
  }, [filters, quickFilter, isOpenGroup]);

  useEffect(() => {
    let { navshow } = getAdvanceSetting(view);
    if ([26, 27, 48, 29].includes(source.type) && navshow === '1') {
      fetch();
    }
  }, [navGroupCounts]);

  useEffect(() => {
    if (!navGroup.controlId || !rowIdForFilter) {
      updateGroupFilter([], view);
    } else {
      let obj = _.omit(navGroup, ['isAsc']);
      let filterType = 2; //选项的选中
      if ([29, 35].includes(source.type)) {
        if (source.type === 29 && !navGroup.viewId) {
          //未选择了层级视图 按是筛选
          filterType = 24;
        } else {
          filterType = navGroup.filterType === 11 ? navGroup.filterType : 24; //筛选方式 24是 | 11包含 老数据是0 按照24走
        }
      }
      if (AREA.includes(source.type)) {
        filterType = navGroup.filterType === 24 ? 51 : navGroup.filterType;
      }
      if (rowIdForFilter === 'null') {
        //为空
        filterType = FILTER_CONDITION_TYPE.ISNULL;
      }
      updateGroupFilter(
        [
          {
            ...obj,
            values: rowIdForFilter === 'null' ? [] : [rowIdForFilter],
            navNames: [navName],
            dataType: source.type,
            filterType,
          },
        ],
        view,
      );
    }
  }, [rowIdForFilter, navGroup]);

  const fetch = useCallback(() => {
    const { navGroup, view } = latestValues.current;
    let { navfilters = '[]', navshow } = getAdvanceSetting(view);
    setOpenKeys([]);
    if (!navGroup.controlId) {
      setGroupFilterData([]);
      return;
    }

    try {
      navfilters = JSON.parse(navfilters);
    } catch (error) {
      console.log(error);
      navfilters = [];
    }
    if (navshow === '2' && navfilters.length <= 0) {
      //设置了显示项=显示指定项 且 未指定 按空处理
      setLoading(false);
      setGroupFilterData([]);
    } else {
      setLoading(true);
      setData();
    }
  }, []);

  const setData = useCallback((obj = {}) => {
    const { rowId, cb } = obj;
    const { source, navGroup, view, navGroupData, navGroupCounts } = latestValues.current;
    const { navshow, navlayer } = getAdvanceSetting(view);

    const loadFromApi = () => {
      loadData({
        worksheetId: source.dataSource,
        viewId: source.type === 29 ? navGroup.viewId : source.viewId,
        rowId,
        cb,
      });
    };

    //关联 级联
    if ([29, 35].includes(source.type)) {
      if (source.type === 29 && navshow === '1' && !searchRef.current.value) {
        //关联 显示有数据的项 直接用后的返回的navGroupCounts
        updateNavGroupData({
          filterData: navGroupData,
          data: transformCountsToData(navGroupCounts),
          rowId,
          cb,
        });
      } else {
        //级联选择字段 或 已配置层级展示的关联字段
        loadFromApi();
      }
    } else if (
      AREA.includes(source.type) || //地区
      (source.type === 27 && navshow === '2' && navlayer === '999') //部门 指定项 展示所有层级
    ) {
      loadFromApi();
    } else if ([26, 27, 48].includes(source.type) && navshow === '1') {
      //人员 部门 组织 显示有数据的项
      updateNavGroupData({
        filterData: navGroupData,
        data: transformCountsToData(navGroupCounts),
        rowId,
        cb,
      });
    } else {
      let data = formatData(source, navGroup, controls, view);
      if (searchRef.current.value) {
        const keyStr = _.toLower(searchRef.current.value);
        data = data.filter(o => {
          const str =
            o?.txt && _.isString(o.txt) && o.txt.startsWith('{') && [26, 27, 48].includes(source.type)
              ? safeParse(o.txt)[TYPES[source.type].name]
              : o.txt;
          return _.toLower(str).includes(keyStr);
        });
      }
      setGroupFilterData(data);
      setLoading(false);
    }
  }, []);

  const fetchData = useCallback(({ worksheetId, viewId, rowId, cb }) => {
    const { isOpenGroup, view, source, controls, base } = latestValues.current;
    if (!isOpenGroup) return;
    const requestParams = prepareRequestParams(
      { worksheetId, viewId, rowId, appId: base.appId },
      view,
      source,
      controls,
      searchRef.current.value,
    );
    handleRequestCancellation();
    const apiRequest = makeApiRequest({ worksheetId, viewId, rowId, params: requestParams });
    apiRequest.then(result => {
      cleanupRequest();
      processApiResponse({ result, worksheetId, viewId, rowId, cb });
    });
  }, []);

  //处理请求取消逻辑
  const handleRequestCancellation = () => {
    // 如果已有请求且当前工作表在预处理列表中，则取消上一个请求
    if (
      getNavGroupRequest &&
      getNavGroupRequest.abort &&
      preWorksheetIds.includes(`${base.worksheetId}-${base.viewId}`)
    ) {
      getNavGroupRequest.abort();
    }
    // 将当前工作表添加到预处理列表
    preWorksheetIds.push(`${base.worksheetId}-${base.viewId}`);
  };

  //发起API请求
  const makeApiRequest = useCallback(({ rowId, params }) => {
    const { source, view, worksheetInfo } = latestValues.current;
    const isArea = AREA.includes(source.type);
    const { navshow, navlayer } = getAdvanceSetting(view);

    // 地区字段请求
    if (isArea) {
      return fixedDataController.getCitysByParentID({
        parentId:
          rowId ||
          _.get(source, 'advancedSetting.chooserange') ||
          (source.enumDefault === 1 ? '' : source.enumDefault === 0 ? 'CN' : ''),
        keywords: searchRef.current.value,
        layer: source.enumDefault2 || -1,
        textSplit: '/',
        isLast: false,
        projectId: worksheetInfo.projectId,
        langType: getCurrentLangCode(),
        isGetCounty: true,
      });
    }

    // 部门字段特殊处理
    if (source.type === 27 && navshow === '2' && navlayer === '999') {
      const ids = getAllDepartmentIds(view);
      if (ids.length <= 0) return Promise.resolve([]);

      if (!_.find(md.global.Account.projects, item => item.projectId === worksheetInfo.projectId)) {
        alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
        return Promise.resolve([]);
      }
      // 根据是否有rowId决定请求类型
      return rowId
        ? departmentAjax.getProjectSubDepartmentByDepartmentId({
            projectId: worksheetInfo.projectId,
            departmentId: rowId,
          })
        : departmentAjax.appointedDepartment({
            projectId: worksheetInfo.projectId,
            rangeTypeId: 20,
            appointedDepartmentIds: ids,
            keywords: searchRef.current.value,
            pageIndex: 1,
            pageSize: 10000,
          });
    }

    // 默认工作表数据请求
    return sheetAjax.getFilterRows(getFilledRequestParams(params));
  }, []);

  //处理API响应
  const processApiResponse = useCallback(({ result, worksheetId, viewId, rowId, cb }) => {
    const { source, view, navGroupData } = latestValues.current;
    const isArea = AREA.includes(source.type);
    const { navshow, navlayer } = getAdvanceSetting(view);
    const { navfilters = '[]' } = getAdvanceSetting(view);
    const filters = safeParse(navfilters, 'array');

    // 处理视图已删除的情况
    if (result.resultCode === 4) {
      return fetchData({ worksheetId, viewId: '', rowId, cb });
    }
    // 处理无权限情况
    if (result.resultCode === 7) {
      return updateNavGroupData({ filterData: navGroupData, data: [], rowId, cb });
    }

    // 处理成功响应
    let responseData = [];

    // 处理地区数据
    if (isArea) {
      responseData = (result.citys || []).map(item => ({
        value: item.id,
        txt: searchRef.current.value ? item.path : item.name, // 有关键词时显示完整路径
        isLeaf:
          item.last ||
          (item?.path?.split('/')?.length || 1) - 1 >= source.enumDefault2 ||
          (source.enumDefault2 === 2 && PARTICULARLY_CITY.includes(item.id)), // 是否是最后一级
        text: JSON.stringify({ code: item.id, name: item.path }),
      }));
    }
    // 处理部门数据
    else if (source.type === 27 && navshow === '2' && navlayer === '999') {
      responseData = (result || []).map(item => ({
        value: item.departmentId,
        txt: item.departmentName,
        isLeaf: !item.haveSubDepartment, // 没有子部门
        text: JSON.stringify({ departmentId: item.departmentId, departmentName: item.departmentName }),
      }));
    } // 级联 关联
    else {
      let data = result.data || [];
      const controls = _.get(result, ['template', 'controls']) || [];
      const control = controls.find(item => item.attribute === 1);
      if (navlayer && Number(navlayer) > 1 && !rowId) {
        //配置了默认展开层级 接口一次性的返回对于数据 处理成相关结果
        responseData = getListByNavlayer(data, Number(navlayer), {
          source,
          keywords: searchRef.current.value,
          control,
          viewId,
          navGroup,
        });
        setOpenKeys(
          data
            .filter(o => {
              const childrenids = safeParse(o.childrenids, 'array') || [];
              return childrenids.length > 0 && !!data.find(o => o.rowid === childrenids[0]);
            })
            .map(o => o.rowid),
        );
      } else {
        let data = result.data || [];
        if (source.type !== 35 && filters.length > 0 && navshow === '2') {
          const ids = filters.map(value => safeParse(value).id);
          data = ids.map(id => data.find(o => o.rowid === id)).filter(Boolean);
        }
        responseData = data.map(item => ({
          value: item.rowid,
          txt: renderTxt(source, searchRef.current.value, item, control, viewId, navGroup), // 渲染显示文本
          isLeaf: !item.childrenids, // 没有子节点时是叶子节点
          text: item[control.controlId], // 原始文本
        }));
      }
    }

    // 更新导航组数据
    updateNavGroupData({
      filterData: navGroupData,
      data: responseData,
      rowId,
      cb,
    });
  }, []);

  // 清理请求状态
  const cleanupRequest = () => {
    getNavGroupRequest = null;
    preWorksheetIds = (preWorksheetIds || []).filter(o => o !== `${base.worksheetId}-${base.viewId}`); // 从预处理列表中移除当前工作表
  };

  const loadData = obj => fetchData(obj);

  //更新当前的navGroupData
  const updateNavGroupData = ({ filterData, data, rowId, cb }, notUpdate) => {
    if (rowId && !searchRef.current.value) {
      filterData.forEach(item => {
        if (item.value === rowId) {
          item.children = data;
        } else if (_.isArray(item.children)) {
          updateNavGroupData({ filterData: item.children, data, rowId }, true);
        }
      });
      !notUpdate && setGroupFilterData(filterData);
    } else {
      !notUpdate && setGroupFilterData(data);
    }
    setLoading(false);
    cb && cb();
  };

  const updateFilter = id => setRowIdForFilter(id);

  return (
    <Con
      className="groupFilterWrap h100 flexColumn"
      width={width}
      style={{ borderRight: !isOpenGroup ? '1px solid rgba(0, 0, 0, 0.04)' : '0' }}
    >
      <NavSearch
        {...props}
        isOpenGroup={isOpenGroup}
        keywords={searchRef.current.value}
        setKeywords={k => {
          searchRef.current.value = k;
          fetch();
        }}
        updateFilter={updateFilter}
      />
      <NavGroupCon
        {...props}
        openKeys={openKeys}
        view={view}
        navGroup={navGroup}
        controls={controls}
        isOpenGroup={isOpenGroup}
        keywords={searchRef.current.value}
        loading={loading}
        navGroupData={navGroupData}
        navGroupCounts={navGroupCounts}
        rowIdForFilter={rowIdForFilter}
        updateFilter={updateFilter}
        setNavName={setNavName}
        setData={setData}
        source={source}
        setOpenKeys={setOpenKeys}
      />
    </Con>
  );
}

export default connect(
  state => ({ ...state.sheet }),
  dispatch =>
    bindActionCreators(
      {
        updateGroupFilter,
        getNavGroupCount,
      },
      dispatch,
    ),
)(GroupFilter);
