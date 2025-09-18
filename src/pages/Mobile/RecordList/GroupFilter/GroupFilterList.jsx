import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Breadcrumb } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, Input, LoadDiv, ScrollView } from 'ming-ui';
import departmentAjax from 'src/api/department.js';
import fixedDataController from 'src/api/fixedData';
import sheetAjax from 'src/api/worksheet';
import { RecordInfoModal } from 'mobile/Record';
import * as actions from 'mobile/RecordList/redux/actions';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { AREA, TYPES } from 'src/pages/worksheet/common/Sheet/GroupFilter/constants';
import {
  formatData,
  getAllDepartmentIds,
  getListByNavlayer,
  getSourceControlByNav,
  isSourceTree,
  prepareRequestParams,
  renderTxt,
  sortDataByCustomNavs,
  transformCountsToData,
} from 'src/pages/worksheet/common/Sheet/GroupFilter/util';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import * as worksheetActions from 'src/pages/worksheet/redux/actions';
import * as navFilterActions from 'src/pages/worksheet/redux/actions/navFilter';
import { getFilledRequestParams } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import './index.less';

let ajaxRequest = null;
let getNavGroupRequest = null;
let apiRequest = null;
let preWorksheetIds = [];

const GroupFilterList = props => {
  const {
    className,
    views = [],
    base = {},
    controls = [],
    navGroupCounts,
    sheetSwitchPermit,
    filters,
    viewFlag,
    style = {},
    showSearch = true,
    worksheetInfo = {},
    sliderCurrentGroup = {},
    handleClickItem = () => {},
    updateGroupFilter = () => {},
  } = props;
  const { appId, viewId } = base;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const { navshow, showallitem, allitemname, shownullitem, nullitemname, appnavtype } = getAdvanceSetting(view) || {};
  const navGroup = view.navGroup && view.navGroup.length > 0 ? view.navGroup[0] : {};
  let [keywords, setKeywords] = useState();
  const [navGroupData, setGroupFilterData] = useState([]); //当前的列表数据
  const [rowIdForFilter, setRowIdForFilter] = useState(''); //当前选中的项
  const [navName, setNavName] = useState(''); //创建新纪录时，需要根据当前选中的项带到的默认值
  const [source, setSource] = useState(getSourceControlByNav(navGroup, controls) || {}); //筛选字段信息 sourceControlType=>type
  const [currentGroup, setCurrentGroup] = useState(
    appnavtype === '3' && showallitem !== '1' ? { txt: _l('全部'), value: '', isLeaf: true } : {},
  );
  const [currentNodeId, setCurrentNodeId] = useState();
  const [breadNavHeight, setBreadMavHeight] = useState();
  const [loading, setLoading] = useState(true);
  const [searchRecordList, setSearchRecordList] = useState([]);
  const [nextData, setNextData] = useState([]);
  const [previewRecordId, setPreviewRecordId] = useState();
  const keyStr = _.includes([26, 27, 48], source.type) ? TYPES[source.type].name : '';

  let isOption = [9, 10, 11].includes(source.type) || [9, 10, 11].includes(source.sourceControlType); //是否选项
  const breadNavBar = useRef();

  const onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => setPreviewRecordId(undefined));
  };

  useEffect(() => {
    ajaxRequest = null;
    getNavGroupRequest = null;
    preWorksheetIds = [];
  }, [viewFlag]);
  useEffect(() => {
    let height = breadNavBar.current ? breadNavBar.current.clientHeight : 0;
    setBreadMavHeight(height);
    window.addEventListener('popstate', onQueryChange);

    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, []);

  useEffect(() => {
    if (props.navGroupFilters && _.isEmpty(props.navGroupFilters)) {
      setRowIdForFilter('');
    }
  }, [props.navGroupFilters]);

  useEffect(() => {
    setSource(getSourceControlByNav(navGroup, controls) || {});
  }, [navGroup, controls]);

  useEffect(() => {
    fetch();
  }, [keywords]);

  useEffect(() => {
    if (source.controlId) {
      setCurrentNodeId();
      setKeywords();
      fetch();
      setRowIdForFilter('');
      setNavName('');
      props.getNavGroupCount();
    }
  }, [navGroup.controlId, viewId, filters]);

  useEffect(() => {
    if ([26, 27, 48, 29].includes(source.type) && navshow === '1') {
      fetch();
    }

    // 侧滑默认选中第一项(配置显示‘全部’项时，默认选中全部，否则选中第一项)
    if (view.viewType === 0 && (appnavtype === '2' || !appnavtype) && _.isEmpty(sliderCurrentGroup)) {
      let navData = getNavData(navGroupData);
      if (!navData || !navData.length) return;
      const selected = navData[0];
      toList(selected);
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

  const fetch = () => {
    let { navfilters = '[]', navshow } = getAdvanceSetting(view);
    if (navGroup.controlId === 'wfstatus' && !isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit)) {
      navshow = '0';
    }
    if (!navGroup.controlId) {
      setGroupFilterData([]);
      return;
    } else {
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
    }
  };

  const setData = obj => {
    const { rowId, cb, isNext } = obj || {};
    const { navshow, navlayer } = getAdvanceSetting(view);

    const loadFromApi = () =>
      loadData({
        worksheetId: source.dataSource,
        viewId: source.type === 29 ? navGroup.viewId : source.viewId,
        rowId,
        cb,
        isNext,
      });

    //关联 级联
    if ([29, 35].includes(source.type)) {
      if (source.type === 29 && navshow === '1' && !keywords) {
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
      if (keywords) {
        data = data.filter(o => o.txt.includes(keywords));
      }

      setGroupFilterData(data);
      setLoading(false);
    }
  };

  const fetchData = ({ worksheetId, viewId, rowId, cb, isNext }) => {
    const requestParams = prepareRequestParams({ worksheetId, viewId, rowId, appId }, view, source, controls, keywords);
    handleRequestCancellation();
    if (apiRequest && apiRequest.abort) {
      apiRequest.abort();
    }
    apiRequest = makeApiRequest({ worksheetId, viewId, rowId, params: requestParams });
    apiRequest.then(result => {
      cleanupRequest();
      processApiResponse({ result, worksheetId, viewId, rowId, cb, isNext });
    });
  };

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
  const makeApiRequest = ({ rowId, params }) => {
    const isArea = AREA.includes(source.type);
    const { navshow, navlayer } = getAdvanceSetting(view);

    // 地区字段请求
    if (isArea) {
      return fixedDataController.getCitysByParentID({
        parentId: rowId || _.get(source, 'advancedSetting.chooserange') || '',
        keywords,
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
            keywords,
            pageIndex: 1,
            pageSize: 10000,
          });
    }

    params.langType = window.shareState.shareId ? getCurrentLangCode() : undefined;

    // 默认工作表数据请求
    return sheetAjax.getFilterRows(getFilledRequestParams(params));
  };

  //处理API响应
  const processApiResponse = ({ result, worksheetId, viewId, rowId, cb, isNext }) => {
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
        txt: keywords ? item.path : item.name, // 有关键词时显示完整路径
        isLeaf: item.last, // 是否是最后一级
        text: JSON.stringify({ code: item.id, name: item.path }),
      }));
    }
    // 处理部门数据
    else if (source.type === 27 && navshow === '2' && navlayer === '999') {
      responseData = (result || []).map(item => ({
        value: item.departmentId,
        isLeaf: !item.haveSubDepartment, // 没有子部门
        txt: JSON.stringify({ departmentId: item.departmentId, departmentName: item.departmentName }),
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
          keywords,
          control,
          viewId,
          navGroup,
        });
      } else {
        let data = result.data || [];
        if (source.type !== 35 && filters.length > 0 && navshow === '2') {
          const ids = filters.map(value => safeParse(value).id);
          data = ids.map(id => data.find(o => o.rowid === id)).filter(Boolean);
        }
        responseData = data.map(item => ({
          value: item.rowid,
          txt: renderTxt(source, keywords, item, control, viewId, navGroup), // 渲染显示文本
          isLeaf: !item.childrenids, // 没有子节点时是叶子节点
          text: item[control.controlId], // 原始文本
        }));
      }
    }

    if (isNext) {
      setNextData(responseData);
    }

    // 更新导航组数据
    updateNavGroupData({
      filterData: navGroupData,
      data: responseData,
      rowId,
      cb,
    });
  };

  // 清理请求状态
  const cleanupRequest = () => {
    getNavGroupRequest = null;
    preWorksheetIds = (preWorksheetIds || []).filter(o => o !== `${base.worksheetId}-${base.viewId}`); // 从预处理列表中移除当前工作表
  };

  const loadData = obj => fetchData(obj);

  //更新当前的navGroupData
  const updateNavGroupData = ({ filterData, data, rowId, cb }, notUpdate) => {
    if (rowId && !keywords) {
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

  const getNavData = data => {
    let navData = nextData.length ? nextData : data;
    navData = sortDataByCustomNavs(navData, view, controls);
    if (!keywords) {
      if ((source.type === 29 && !!navGroup.viewId) || [35].includes(source.type)) {
        //关联记录以层级视图时|| 级联没有显示项
        navData = [
          {
            txt: _l('全部'),
            value: '',
            isLeaf: true,
          },
        ].concat(navData);
      } else {
        navData =
          showallitem !== '1'
            ? [
                {
                  txt: allitemname || _l('全部'),
                  value: '',
                  isLeaf: true,
                },
              ].concat(navData)
            : navData;
        navData =
          shownullitem === '1'
            ? navData.concat({
                txt: nullitemname || _l('为空'),
                value: 'null',
                isLeaf: true,
              })
            : navData;
      }
    }
    let isOption = [9, 10, 11, 28].includes(source.type) || [9, 10, 11, 28].includes(source.sourceControlType); //是否选项
    let { navfilters = '[]', navshow } = getAdvanceSetting(view);
    try {
      navfilters = JSON.parse(navfilters);
    } catch (error) {
      console.log(error);
      navfilters = [];
    }
    //系统字段关闭，且为状态时，默认显示成 全部
    if (navGroup.controlId === 'wfstatus' && !isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit)) {
      navshow = '0';
    }
    if (navfilters.length > 0 && navshow === '2') {
      // 显示 指定项 //加上全部和空
      if (isOption) {
        let list = ['', ...navfilters, 'null'];
        const data = navData;
        navData = [];
        list.map(it => {
          navData = navData.concat(data.find(o => o.value === it));
        });
        navData = navData.filter(o => !!o);
      }
    }

    navData = navData.filter(_.identity).map(item => {
      return {
        ...item,
        count: Number(
          (
            (navGroupCounts || []).find(
              o => o.key === (!item.value ? 'all' : item.value === 'null' ? '' : item.value),
            ) || {}
          ).count || 0,
        ),
        txt: keyStr && !['null', ''].includes(item.value) ? safeParse(item.txt)[keyStr] : item.txt || _l('未命名'),
      };
    });

    return navData;
  };

  const clickRightArrow = (e, item) => {
    e.stopPropagation();
    setCurrentNodeId(item.value);
    if (!item.children) {
      setData({
        rowId: item.value,
        isNext: true,
      });
    }
  };
  const renderBreadcrumb = () => {
    let breadlist = (getParentId(navGroupData, currentNodeId) || []).map(item => {
      return {
        ...item,
        txt: keyStr && !['null', ''].includes(item.value) ? safeParse(item.txt)[keyStr] : item.txt || _l('未命名'),
      };
    });
    breadlist = breadlist.length ? breadlist.concat([{ ...source, txt: source.controlName }]) : [];
    if (breadlist.length) {
      return (
        <div className="breadNavbar" ref={breadNavBar}>
          <Breadcrumb separator={''}>
            {breadlist.reverse().map((item, index) => {
              return (
                <Breadcrumb.Item
                  key={item.value}
                  onClick={() => {
                    if (!item.value && (item.txt === _l('全部') || item.txt === allitemname)) {
                      fetchData({ worksheetId: item.wsid, appId, viewId: navGroup.viewId });
                    } else {
                      fetchData({
                        worksheetId: source.dataSource,
                        appId,
                        viewId: 29 === source.type ? navGroup.viewId : source.viewId,
                        rowId: item.value,
                        isNext: true,
                      });
                    }
                    setCurrentNodeId(item.value);
                  }}
                >
                  {item.txt}
                  {index < breadlist.length - 1 && <Icon icon="arrow-right-border" className="breadIcon Font4" />}
                </Breadcrumb.Item>
              );
            })}
          </Breadcrumb>
        </div>
      );
    }
  };
  const toList = item => {
    handleClickItem(item);
    setCurrentGroup(item);
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
    if (item.value === 'null') {
      //为空
      filterType = FILTER_CONDITION_TYPE.ISNULL;
    }

    let navGroupFilters = [
      {
        ...obj,
        values: item.value === 'null' ? [] : [item.value],
        dataType: source.type,
        filterType,
        navNames: [item.txt],
      },
    ];
    if (!item.value) {
      props.changeMobileGroupFilters([]);
      if (view.viewType === 8) {
        props.updateGroupFilter([], view);
      } else {
        props.fetchSheetRows();
      }
    } else {
      props.changeMobileGroupFilters(navGroupFilters);
      if (view.viewType === 8) {
        props.updateGroupFilter(navGroupFilters, view);
      } else {
        props.fetchSheetRows({ navGroupFilters });
      }
    }
  };
  const renderContent = data => {
    return data.map(item => {
      const { count } = item;
      let hasChildren = !item.isLeaf;
      let { navshow } = getAdvanceSetting(view);

      if (isSourceTree(source, navGroup, view)) {
        return (
          <React.Fragment key={item.value}>
            {
              <div className="flexRow" onClick={() => toList(item)}>
                {/* <div className="mRight16"></div> */}
                <div
                  className={cx('groupItem flexRow Font14 borderBottom flex', {
                    pLeft10: !appnavtype || appnavtype === '2',
                    pLeft16: _.includes(['1', '3'], appnavtype),
                  })}
                >
                  <div className="flex">{item.txt}</div>
                  {count > 0 && appnavtype !== '3' && <div className="count">{count}</div>}
                  {hasChildren && <div className="line"></div>}
                  {hasChildren && (
                    <div className="rightArrow" onClick={e => clickRightArrow(e, item)}>
                      <Icon icon="arrow-right-border" />
                    </div>
                  )}
                </div>
              </div>
            }
          </React.Fragment>
        );
      } else {
        // 显示有数据的项 //排除全部和空
        if (navshow === '1' && count <= 0 && !['null', ''].includes(item.value)) {
          return;
        }

        return (
          <React.Fragment key={item.value}>
            <div
              className={cx('flexRow listItem flex borderBottom', {
                pLeft8: appnavtype === '1' || view.viewType !== 0,
                active: currentGroup.value === item.value,
                pRight0: appnavtype === '3',
              })}
              onClick={() => toList(item)}
            >
              <div
                className={cx('mRight7', {
                  optionColor: isOption && source.enumDefault2 === 1,
                })}
                style={
                  appnavtype === '3'
                    ? {}
                    : { backgroundColor: isOption && source.enumDefault2 === 1 && !!item.value ? item.color : '' }
                }
              ></div>
              <div className={cx('radioGroupFilterTxt flex', { mRight16: appnavtype !== '3' })}>{item.txt}</div>
              {count > 0 && appnavtype !== '3' && <div className="count">{count}</div>}
            </div>
          </React.Fragment>
        );
      }
    });
  };
  const getParentId = (list, id) => {
    for (let i in list) {
      if (list[i].value == id) {
        return [list[i]];
      }
      if (list[i].children) {
        let node = getParentId(list[i].children, id);
        if (node !== undefined) {
          return node.concat(list[i]);
        }
      }
    }
  };
  const conRender = () => {
    if (loading) {
      return <LoadDiv />;
    }
    if (_.isEmpty(navGroupData) && _.isEmpty(searchRecordList) && keywords) {
      return (
        <div className="mobileSearchNoData noData mTop35 TxtCenter Gray_9e">
          <div className="iconBox">
            <Icon icon="search" className="Font64 searchIcon" />
          </div>
          {_l('没有搜索结果')}
        </div>
      );
    }

    let navData = getNavData(navGroupData);

    return (
      <ScrollView
        className="flex"
        style={appnavtype !== '3' ? { maxHeight: `calc(100% - 56px - ${breadNavHeight}px)` } : {}}
      >
        {keywords && <div className="pLeft16 mBottom6 Font13 Bold Gray_75">{_l('分组')}</div>}
        <div className="listBox">{renderContent(navData)}</div>
        {appnavtype === '1' && keywords && (
          <div className="mTop16 pLeft16 mBottom6 Font13 Bold Gray_75">{_l('记录')}</div>
        )}
        {keywords && (
          <div className="searchRecordResult">
            {(searchRecordList || []).map(item => {
              let txt = getTitleTextFromControls(controls, item);
              return (
                <div
                  className="recordItem"
                  onClick={() => {
                    handlePushState('page', 'recordDetail');
                    setPreviewRecordId(item.rowid);
                  }}
                >
                  {txt}
                </div>
              );
            })}
          </div>
        )}
      </ScrollView>
    );
  };
  const getSearchRecordResult = keywords => {
    let param = keywords
      ? {}
      : source.type === 35
        ? {
            getType: 10,
          }
        : {
            appId,
            searchType: 1,
          };

    if (ajaxRequest && ajaxRequest.abort) {
      ajaxRequest.abort();
    }
    ajaxRequest = sheetAjax.getFilterRows({
      worksheetId: base.worksheetId,
      viewId: view.viewId,
      keywords,
      pageIndex: 1,
      pageSize: 10000,
      isGetWorksheet: true,
      langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
      ...param,
    });
    ajaxRequest.then(res => {
      const { data = [] } = res;
      setSearchRecordList(data);
    });
  };

  return (
    <div className={`groupFilterContainer ${className}`} style={style}>
      {showSearch && (
        <div className="searchBar flexRow">
          <i className="icon icon-search Font17"></i>
          <Input
            value={keywords || ''}
            placeholder={_l('搜索')}
            className="flex"
            onChange={value => {
              let keyWords = value.trim();
              setKeywords(keyWords);
              setCurrentNodeId();
              setGroupFilterData([]);
              setNextData([]);
              if (appnavtype === '1') {
                _.debounce(() => getSearchRecordResult(keyWords), 500);
              }
            }}
          />
        </div>
      )}
      {!keywords && navGroupData && currentNodeId && renderBreadcrumb()}
      {conRender()}

      <RecordInfoModal
        className="full"
        visible={!!previewRecordId}
        enablePayment={worksheetInfo.enablePayment}
        appId={base.appId}
        worksheetId={base.worksheetId}
        viewId={base.viewId}
        rowId={previewRecordId}
        onClose={() => {
          setPreviewRecordId(undefined);
        }}
      />
    </div>
  );
};

export default connect(
  state => ({
    controls: state.sheet.controls,
    views: state.sheet.views,
    ...state.sheet,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
    pcQuickFilter: state.sheet.quickFilter,
    ..._.pick(state.mobile, [
      'base',
      'isCharge',
      'worksheetInfo',
      'viewResultCode',
      'mobileNavGroupFilters',
      'batchOptVisible',
      'appColor',
      'currentSheetRows',
      'filters',
      'quickFilter',
      'quickFilterWithDefault',
      'savedFilters',
      'activeSavedFilter',
    ]),
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick({ ...worksheetActions, ...actions, ...navFilterActions }, [
          'fetchSheetRows',
          'getNavGroupCount',
          'changeMobielSheetLoading',
          'updateMobileViewPermission',
          'addNewRecord',
          'openNewRecord',
          'changeBatchOptVisible',
          'changeMobileGroupFilters',
          'unshiftSheetRow',
          'changeMobileSheetRows',
          'updateGroupFilter',
          'updateFilters',
          'updateActiveSavedFilter',
        ]),
      },
      dispatch,
    ),
)(GroupFilterList);
