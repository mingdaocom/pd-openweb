import React, { useEffect, useState, useRef } from 'react';
import sheetAjax from 'src/api/worksheet';
import { Icon, Input, ScrollView, LoadDiv, Button } from 'ming-ui';
import { Breadcrumb } from 'antd';
import { Drawer } from 'antd-mobile';
import { renderCellText } from 'src/pages/worksheet/components/CellControls';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { RecordInfoModal } from 'mobile/Record';
import { openAddRecord } from 'mobile/Record/addRecord';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { permitList } from 'src/pages/FormSet/config';
import SheetView from '../View/SheetView';
import GalleryView from '../View/GalleryView';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { getAdvanceSetting } from 'src/util';
import cx from 'classnames';
import './index.less';

const { sheet, gallery } = VIEW_DISPLAY_TYPE;
const TYPE_TO_COMP = {
  [sheet]: SheetView,
  [gallery]: GalleryView,
};

let ajaxFn = null;
const GroupFilter = props => {
  const {
    views = [],
    base = {},
    controls = [],
    navGroupCounts,
    isCharge,
    sheetSwitchPermit,
    batchOptVisible,
    worksheetInfo,
    appColor,
    mobileNavGroupFilters,
  } = props;
  const { appId, viewId } = base;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const navGroup = view.navGroup && view.navGroup.length > 0 ? view.navGroup[0] : {};
  const [previewRecordId, setPreviewRecordId] = useState();
  const [navGroupData, setGroupFilterData] = useState([]);
  let [keywords, setKeywords] = useState();
  const [renderData, setRenderData] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState();
  const [breadNavHeight, setBreadMavHeight] = useState();
  const [loading, setLoading] = useState(true);
  const [searchRecordList, setSearchRecordList] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({});
  let soucre = controls.find(o => o.controlId === navGroup.controlId) || {};
  let isOption = [9, 10, 11].includes(soucre.type); //是否选项
  const breadNavBar = useRef();
  const Component = TYPE_TO_COMP[String(view.viewType)];
  const viewProps = {
    ...base,
    isCharge,
    view,
  };
  const canDelete = isOpenPermit(permitList.delete, sheetSwitchPermit, view.viewId);
  const showCusTomBtn = isOpenPermit(permitList.execute, sheetSwitchPermit, view.viewId);
  useEffect(() => {
    let height = breadNavBar.current ? breadNavBar.current.clientHeight : 0;
    setBreadMavHeight(height);
  });
  useEffect(() => {
    fetch();
  }, [keywords]);
  useEffect(() => {
    setCurrentNodeId();
    setKeywords('');
    fetch();
    props.getNavGroupCount();
  }, [navGroup.controlId, viewId]);
  const fetch = () => {
    const { controlId } = navGroup;
    if (!controlId) {
      setGroupFilterData([]);
      setRenderData([]);
      return;
    } else {
      setLoading(true);
      setData();
    }
  };
  const isSoucreTree = () => {
    return soucre.type === 35 || (soucre.type === 29 && navGroup.viewId);
  };
  const setData = obj => {
    const { rowId, cb } = obj || {};
    let key = keywords;
    let data = [];
    //级联选择字段 或 已配置层级展示的关联字段
    if ([29, 35].includes(soucre.type)) {
      fetchData({
        worksheetId: soucre.dataSource,
        viewId: 29 === soucre.type ? navGroup.viewId : soucre.viewId,
        rowId,
        cb,
      });
    } else {
      let options = (controls.find(o => o.controlId === navGroup.controlId) || {}).options || [];
      data = !navGroup.isAsc ? options.slice().reverse() : options;
      data = data
        .filter(o => !o.isDeleted)
        .map(o => {
          return {
            ...o,
            txt: o.value,
            value: o.key,
          };
        })
        .filter(o => (key ? o.txt.indexOf(key) >= 0 : true));
      setGroupFilterData(data);
      setRenderData(data);
      setLoading(false);
    }
  };

  const fetchData = ({ worksheetId, viewId, rowId, cb }) => {
    ajaxFn && ajaxFn.abort();
    let param =
      soucre.type === 35 || keywords
        ? {
            getType: 10,
          }
        : {
            appId,
            searchType: 1,
            getType: !viewId ? 7 : 10,
          };
    let { navfilters = '[]', navshow } = getAdvanceSetting(view);
    try {
      navfilters = JSON.parse(navfilters);
    } catch (error) {
      navfilters = [];
    }
    if (soucre.type !== 35 && navfilters.length > 0 && ['3'].includes(navshow)) {
      /// 显示 符合筛选条件的处理
      let filterControls = navfilters.map(handleCondition);
      param = { ...param, filterControls };
    }
    ajaxFn = sheetAjax.getFilterRows({
      worksheetId,
      viewId,
      keywords,
      pageIndex: 1,
      pageSize: 10000,
      isGetWorksheet: true,
      kanbanKey: rowId,
      ...param,
    });
    ajaxFn.then(result => {
      if (result.resultCode === 4) {
        //视图删除的情况下，显示成为选中视图的状态
        fetchData({ worksheetId, viewId: '', rowId, cb });
      } else {
        let { data = [] } = result;
        if (soucre.type !== 35 && navfilters.length > 0 && navshow === '2') {
          data = data.filter(o => navfilters.includes(o.rowid));
        }
        const controls = _.get(result, ['template', 'controls']) || [];
        const control = controls.find(item => item.attribute === 1);
        ajaxFn = '';
        dataUpdate({
          filterData: navGroupData,
          data: data.map(item => {
            return {
              value: item.rowid,
              txt: renderSearchTxt(item, control),
              isLeaf: !item.childrenids,
              ...item,
            };
          }),
          rowId,
          cb,
        });
      }
    });
  };

  const dataUpdate = ({ filterData, data, rowId, cb }) => {
    if (rowId && !keywords) {
      filterData.forEach(item => {
        if (item.value === rowId) {
          item.children = data;
          setGroupFilterData(data);
          setRenderData(data);
        } else if (_.isArray(item.children)) {
          dataUpdate({ filterData: item.children, data, rowId });
        }
      });
      setGroupFilterData(filterData);
    } else {
      setGroupFilterData(data);
      setRenderData(data);
    }
    setLoading(false);
    cb && cb();
  };
  const clickRightArrow = (e, item) => {
    e.stopPropagation();
    setCurrentNodeId(item.value);
    if (!item.children) {
      setData({
        rowId: item.value,
      });
    }
  };
  const renderBreadcrumb = () => {
    let breadlist = getParentId(navGroupData, currentNodeId) || [];
    breadlist = breadlist.length ? breadlist.concat([{ ...soucre, txt: soucre.controlName }]) : [];
    if (breadlist.length) {
      return (
        <div className="breadNavbar" ref={breadNavBar}>
          <Breadcrumb separator={''}>
            {breadlist.reverse().map((item, index) => {
              return (
                <Breadcrumb.Item
                  key={item.value}
                  onClick={e => {
                    if (!item.value && item.txt === _l('全部')) {
                      fetchData({ worksheetId: item.wsid, appId, viewId: navGroup.viewId });
                    } else {
                      fetchData({
                        worksheetId: soucre.dataSource,
                        appId,
                        viewId: 29 === soucre.type ? navGroup.viewId : soucre.viewId,
                        rowId: item.value,
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
    setDrawerVisible(true);
    setCurrentGroup(item);
    let obj = _.omit(navGroup, ['isAsc']);
    let navGroupFilters = [
      {
        ...obj,
        values: [item.value],
        dataType: soucre.type,
        filterType: soucre.type === 29 || soucre.type === 35 ? 24 : 2,
        navNames: [item.txt],
      },
    ];
    if (!item.value) {
      props.changeMobileGroupFilters([]);
      props.fetchSheetRows();
    } else {
      props.changeMobileGroupFilters(navGroupFilters);
      props.fetchSheetRows({ navGroupFilters });
    }
  };
  const renderContent = data => {
    return data.map(item => {
      let count = Number((navGroupCounts.find(o => o.key === (!item.value ? 'all' : item.value)) || {}).count || 0);
      let { navshow } = getAdvanceSetting(view);
      let hasChildren = !item.isLeaf;
      if (isSoucreTree()) {
        return (
          <React.Fragment key={item.value}>
            {
              <div
                className="flexRow"
                onClick={() => {
                  toList(item);
                }}
              >
                <div className="mRight16"></div>
                <div className="groupItem flexRow Font14 borderBottom flex">
                  <div className="flex">{item.txt || _l('未命名')}</div>
                  {count > 0 && <div className="count">{count}</div>}
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
        // 显示有数据的项
        if (navshow === '1' && count <= 0) {
          return;
        }
        return (
          <React.Fragment key={item.value}>
            <div className="flexRow" onClick={() => toList(item)}>
              <div
                className={cx('mRight16 width4', {
                  borderStyle: isOption && soucre.enumDefault2 === 1 && !!item.value,
                })}
                style={{ backgroundColor: isOption && soucre.enumDefault2 === 1 && !!item.value ? item.color : '' }}
              ></div>
              <div className="flexRow listItem flex borderBottom">
                <div className="radioGroupFilterTxt">{item.txt || _l('未命名')}</div>
                {count > 0 && <div className="count">{count}</div>}
              </div>
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
  const renderSearchTxt = (item, control) => {
    if (keywords && (soucre.type === 35 || (soucre.type === 29 && navGroup.viewId))) {
      const path = JSON.parse(item.path);
      return path.map((text, i) => {
        const isLast = i === path.length - 1;
        if (text.indexOf(keywords) > -1) {
          return (
            <React.Fragment key={i}>
              <span className="ThemeColor3">{text}</span>
              {!isLast && <span> / </span>}
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={i}>
            <span>{text}</span>
            {!isLast && <span> / </span>}
          </React.Fragment>
        );
      });
    }
    return control ? renderCellText(Object.assign({}, control, { value: item[control.controlId] })) : _l('未命名');
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
    let tempData = keywords
      ? renderData
      : !keywords && navGroupData && currentNodeId
      ? renderData
      : [{ txt: _l('全部'), value: '', isLeaf: true }].concat(renderData);
    let { navfilters = '[]', navshow } = getAdvanceSetting(view);
    try {
      navfilters = JSON.parse(navfilters);
    } catch (error) {
      navfilters = [];
    }
    if (isOption && navfilters.length > 0 && navshow === '2') {
      // 显示 指定项
      tempData = tempData.filter(o => navfilters.includes(o.value) || !o.value);
    }
    return (
      <ScrollView style={{ maxHeight: `calc(100% - 56px - ${breadNavHeight}px)` }}>
        {keywords && <div className="pLeft16 mBottom6 Font13 Bold Gray_75">{_l('分组')}</div>}
        <div className="listBox">{renderContent(tempData)}</div>
        {keywords && <div className="mTop16 pLeft16 mBottom6 Font13 Bold Gray_75">{_l('记录')}</div>}
        {keywords && (
          <div className="searchRecordResult">
            {(searchRecordList || []).map(item => {
              let txt = getTitleTextFromControls(controls, item);
              return (
                <div
                  className="recordItem"
                  onClick={() => {
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
    let param =
      soucre.type === 35 || keywords
        ? {
            getType: 10,
          }
        : {
            appId,
            searchType: 1,
          };
    sheetAjax
      .getFilterRows({
        worksheetId: base.worksheetId,
        viewId: view.viewId,
        keywords,
        pageIndex: 1,
        pageSize: 10000,
        isGetWorksheet: true,
        ...param,
      })
      .then(res => {
        const { data = [] } = res;
        setSearchRecordList(data);
      });
  };
  const handleOpenDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };
  const getDefaultValueInCreate = () => {
    if (_.isEmpty(mobileNavGroupFilters)) return;
    let data = mobileNavGroupFilters[0];
    if ([9, 10, 11].includes(data.dataType)) {
      return { [data.controlId]: JSON.stringify([data.values[0]]) };
    } else if ([29, 35]) {
      return {
        [data.controlId]: JSON.stringify([
          {
            sid: data.values[0],
            name: data.navNames[0] || '',
          },
        ]),
      };
    }
  };
  return (
    <div className="groupFilterContainer">
      <div className="searchBar flexRow">
        <i className="icon icon-search Font17"></i>
        <Input
          value={keywords || ''}
          placeholder={_l('搜索')}
          className="flex"
          onChange={value => {
            let keyWords = value.trim();
            setKeywords(keyWords);
            getSearchRecordResult(value);
          }}
        />
      </div>
      {!keywords && navGroupData && currentNodeId && renderBreadcrumb()}
      {conRender()}
      <RecordInfoModal
        className="full"
        visible={!!previewRecordId}
        appId={base.appId}
        worksheetId={base.worksheetId}
        viewId={base.viewId}
        rowId={previewRecordId}
        onClose={() => {
          setPreviewRecordId(undefined);
        }}
      />
      <Drawer
        className={cx('groupFilterDrawer')}
        position="right"
        sidebar={
          <div className="groupDetailBox">
            {!batchOptVisible && (
              <div
                className="groupTitle"
                onClick={() => {
                  setDrawerVisible(false);
                }}
              >
                <Icon icon="arrow-left-border" className="mRight2 Gray_75 TxtMiddle mBottom3" />
                <span>{currentGroup.txt}</span>
              </div>
            )}
            <div className="groupDetailCon">
              <Component {...viewProps} />
              {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
              worksheetInfo.allowAdd &&
              !batchOptVisible ? (
                <div className="addRecordItemWrapper">
                  <Button
                    style={{ backgroundColor: appColor }}
                    className={cx('addRecordBtn flex valignWrapper', {})}
                    onClick={() => {
                      let defaultFormData = getDefaultValueInCreate();
                      let param = {
                        defaultFormData,
                        defaultFormDataEditable: true,
                      };
                      openAddRecord({
                        ...param,
                        className: 'full',
                        worksheetInfo,
                        appId,
                        worksheetId: worksheetInfo.worksheetId,
                        viewId: view.viewId,
                        addType: 2,
                        entityName: worksheetInfo.entityName,
                        onAdd: data => {
                          if (view.viewType) {
                            props.addNewRecord(data, view);
                          } else {
                            props.unshiftSheetRow(data);
                          }
                        },
                      });
                    }}
                  >
                    <Icon icon="add" className="Font22 mRight5" />
                    {worksheetInfo.entityName}
                  </Button>
                </div>
              ) : null}
            </div>
            {(canDelete || showCusTomBtn) && view.viewType === 0 && !batchOptVisible && (
              <div className="batchOperation" onClick={() => props.changeBatchOptVisible(true)}>
                <Icon icon={'task-complete'} className="Font24" />
              </div>
            )}
          </div>
        }
        open={drawerVisible}
        onOpenChange={handleOpenDrawer}
      >
        <React.Fragment />
      </Drawer>
    </div>
  );
};

export default GroupFilter;
