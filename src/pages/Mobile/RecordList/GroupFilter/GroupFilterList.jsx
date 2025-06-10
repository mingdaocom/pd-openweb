import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Breadcrumb } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, Input, LoadDiv, ScrollView } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { RecordInfoModal } from 'mobile/Record';
import * as actions from 'mobile/RecordList/redux/actions';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import { getSourceControlByNav, sortDataByCustomNavs } from 'src/pages/worksheet/common/Sheet/GroupFilter/util';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import * as worksheetActions from 'src/pages/worksheet/redux/actions';
import * as navFilterActions from 'src/pages/worksheet/redux/actions/navFilter';
import { getAdvanceSetting } from 'src/utils/control';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import { TYPES } from './util';
import './index.less';

let ajaxFn = null;
let ajaxRequest = null;
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
  } = props;
  const { appId, viewId } = base;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const navGroup = view.navGroup && view.navGroup.length > 0 ? view.navGroup[0] : {};
  const { advancedSetting = {} } = view;
  const { showallitem, allitemname, shownullitem, nullitemname, appnavtype } = advancedSetting;
  const [navGroupData, setGroupFilterData] = useState([]);
  let [keywords, setKeywords] = useState();
  const [currentNodeId, setCurrentNodeId] = useState();
  const [breadNavHeight, setBreadMavHeight] = useState();
  const [loading, setLoading] = useState(true);
  const [searchRecordList, setSearchRecordList] = useState([]);
  const [nextData, setNextData] = useState([]);
  const [previewRecordId, setPreviewRecordId] = useState();
  const [currentGroup, setCurrentGroup] = useState(
    appnavtype === '3' && showallitem !== '1' ? { txt: _l('全部'), value: '', isLeaf: true } : {},
  );
  let source = getSourceControlByNav(navGroup, controls);
  const keyStr = _.includes([26, 27, 48], source.type) ? TYPES[source.type].name : '';

  let isOption = [9, 10, 11].includes(source.type) || [9, 10, 11].includes(source.sourceControlType); //是否选项
  const breadNavBar = useRef();

  const onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => setPreviewRecordId(undefined));
  };

  useEffect(() => {
    ajaxFn = null;
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
    fetch();
  }, [keywords]);
  useEffect(() => {
    let { navshow } = getAdvanceSetting(view);
    if ([29, 26, 27, 48].includes(source.type) && navshow === '1') {
      fetch();
    }

    // 侧滑默认选中第一项(配置显示‘全部’项时，默认选中全部，否则选中第一项)
    if (
      view.viewType === 0 &&
      (appnavtype === '2' || !appnavtype) &&
      !_.isEmpty(navGroupData) &&
      _.isEmpty(sliderCurrentGroup)
    ) {
      let navData = getNavData(navGroupData);
      const selected = navData[0];
      toList(selected);
    }
  }, [navGroupCounts]);
  useEffect(() => {
    setCurrentNodeId();
    setKeywords('');
    fetch();
    props.getNavGroupCount();
  }, [navGroup.controlId, viewId, filters]);
  const fetch = () => {
    const { controlId } = navGroup;
    if (!controlId) {
      setGroupFilterData([]);
      return;
    } else {
      setLoading(true);
      setData();
    }
  };
  const isSoucreTree = () => {
    return source.type === 35 || (source.type === 29 && navGroup.viewId);
  };
  const setData = obj => {
    const { rowId, cb, isNext } = obj || {};
    let key = keywords;
    let data = [];
    let { navshow } = getAdvanceSetting(view);
    //级联选择字段 或 已配置层级展示的关联字段
    if ([29, 35].includes(source.type)) {
      if (29 === source.type && navshow === '1' && !key) {
        dataUpdate({
          filterData: navGroupData,
          data: navGroupCounts
            .filter(o => !['all', ''].includes(o.key)) //排除全部和空
            .map(item => {
              return {
                value: item.key,
                txt: item.name, //renderTxt(item, control, viewId),
                isLeaf: false,
              };
            }),
          rowId,
          cb,
        });
      } else {
        fetchData({
          worksheetId: source.dataSource,
          viewId: 29 === source.type ? navGroup.viewId : source.viewId,
          rowId,
          cb,
          isNext,
        });
      }
    } else if ([26, 27, 48].includes(source.type) && navshow === '1') {
      dataUpdate({
        filterData: navGroupData,
        data: navGroupCounts
          .filter(o => !['all', ''].includes(o.key)) //排除全部和空
          .map(item => {
            return {
              value: item.key,
              txt: item.name,
              isLeaf: false,
            };
          }),
        rowId,
        cb,
      });
    } else {
      switch (source.type) {
        case 9:
        case 10:
        case 11:
          let options = (controls.find(o => o.controlId === _.get(navGroup, 'controlId')) || {}).options || [];
          data = !navGroup.isAsc ? options.slice().reverse() : options;
          data = data
            .filter(o => !o.isDeleted)
            .map(o => {
              return {
                ...o,
                txt: o.value,
                value: o.key,
              };
            });
          break;
        case 28:
          data = [
            ...new Array(
              parseInt(
                _.get(controls.find(o => o.controlId === _.get(source, 'controlId')) || {}, 'advancedSetting.max') ||
                  '1',
                10,
              ),
            ),
          ].map((o, i) => {
            return {
              txt: _l('%0 级', parseInt(i + 1, 10)),
              value: JSON.stringify(i + 1),
            };
          });
          break;
        case 26:
        case 27:
        case 48:
          let { navfilters = '[]' } = getAdvanceSetting(view);
          try {
            navfilters = JSON.parse(navfilters);
          } catch (error) {
            navfilters = [];
          }

          data = navfilters.map(o => {
            const item = safeParse(o) || {};
            return {
              data: item,
              txt: JSON.stringify({
                [TYPES[source.type].id]: item.id,
                [TYPES[source.type].name]: item.name,
                avatar: item.avatar,
              }),
              value: item.id,
              isLeaf: false,
            };
          });
          break;
        default:
          break;
      }
      data = data.filter(o => (key ? o.txt.indexOf(key) >= 0 : true));
      setGroupFilterData(data);
      setLoading(false);
    }
  };

  const fetchData = ({ worksheetId, viewId, rowId, cb, isNext }) => {
    ajaxFn && ajaxFn.abort();
    let param =
      source.type === 35
        ? {
            getType: 10,
          }
        : {
            appId,
            searchType: 1,
            getType: !viewId ? 7 : 10,
            viewId: viewId || source.viewId, //关联记录时，如果有关联视图，应该按照视图设置的排序方式排序
          };
    let { navfilters = '[]', navshow } = getAdvanceSetting(view);
    try {
      navfilters = JSON.parse(navfilters);
    } catch (error) {
      navfilters = [];
    }
    if (source.type !== 35 && navfilters.length > 0 && ['3'].includes(navshow)) {
      /// 显示 符合筛选条件的处理
      let filterControls = navfilters.map(handleCondition);
      param = { ...param, filterControls };
    }
    if (source.type === 29) {
      if (!!_.get(source, 'advancedSetting.searchcontrol') && keywords) {
        param.controlId = _.get(source, 'controlId');
      }
      if (!!_.get(view, 'advancedSetting.navsearchcontrol') && keywords) {
        param.keywords = undefined;
        param.getType = 7;
        param.navGroupFilters = [
          {
            spliceType: 1,
            isGroup: true,
            groupFilters: [
              {
                dataType: (
                  ((controls.find(o => o.controlId === _.get(source, 'controlId')) || {}).relationControls || []).find(
                    o => o.controlId === _.get(view, 'advancedSetting.navsearchcontrol'),
                  ) || {}
                ).type,
                spliceType: 1,
                dynamicSource: [],
                controlId: _.get(view, 'advancedSetting.navsearchcontrol'),
                values: [keywords],
                filterType: _.get(view, 'advancedSetting.navsearchtype') === '1' ? 2 : 1,
              },
            ],
          },
        ];
      }
      param.relationWorksheetId = view.worksheetId;
      param.sortControls = safeParse(_.get(view, 'advancedSetting.navsorts'), 'array'); //视图id
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
      } else if (result.resultCode === 7) {
        dataUpdate({
          filterData: navGroupData,
          data: [],
          rowId,
          cb,
        });
      } else {
        let { data = [] } = result;
        let newData = data;
        if (source.type !== 35 && navfilters.length > 0 && navshow === '2') {
          newData = [];
          const ids = navfilters.map(value => safeParse(value).id);
          ids.map(it => {
            newData = newData.concat(data.find(o => o.rowid === it));
          });
        }
        newData = newData.filter(o => !!o);
        const controls = _.get(result, ['template', 'controls']) || [];
        const control = controls.find(item => item.attribute === 1);
        ajaxFn = '';
        if (isNext) {
          setNextData(
            newData.map((item = {}) => {
              return {
                value: item.rowid,
                isLeaf: !item.childrenids,
                text: item[control.controlId],
                txt: getTitleTextFromControls(controls, item),
              };
            }),
          );
        }
        dataUpdate({
          filterData: navGroupData,
          data: newData.map((item = {}) => {
            return {
              value: item.rowid,
              isLeaf: !item.childrenids,
              text: item[control.controlId],
              txt: getTitleTextFromControls(controls, item),
            };
          }),
          rowId,
          cb,
        });
      }
    });
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

    navData = navData.map(item => {
      return {
        ...item,
        count: Number(
          (navGroupCounts.find(o => o.key === (!item.value ? 'all' : item.value === 'null' ? '' : item.value)) || {})
            .count || 0,
        ),
        txt: keyStr && !['null', ''].includes(item.value) ? safeParse(item.txt)[keyStr] : item.txt || _l('未命名'),
      };
    });

    return navData;
  };

  const dataUpdate = ({ filterData, data, rowId, cb }) => {
    if (rowId && !keywords) {
      filterData.forEach(item => {
        if (item.value === rowId) {
          item.children = data;
          setGroupFilterData(data);
        } else if (_.isArray(item.children)) {
          dataUpdate({ filterData: item.children, data, rowId });
        }
      });
      setGroupFilterData(filterData);
    } else {
      setGroupFilterData(data);
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
        isNext: true,
      });
    }
  };
  const renderBreadcrumb = () => {
    let breadlist = getParentId(navGroupData, currentNodeId) || [];
    breadlist = breadlist.length ? breadlist.concat([{ ...source, txt: source.controlName }]) : [];
    if (breadlist.length) {
      return (
        <div className="breadNavbar" ref={breadNavBar}>
          <Breadcrumb separator={''}>
            {breadlist.reverse().map((item, index) => {
              return (
                <Breadcrumb.Item
                  key={item.value}
                  onClick={e => {
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

      if (isSoucreTree()) {
        return (
          <React.Fragment key={item.value}>
            {
              <div className="flexRow" onClick={() => toList(item)}>
                <div className="mRight16"></div>
                <div className="groupItem flexRow Font14 borderBottom flex">
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
      <ScrollView style={appnavtype !== '3' ? { maxHeight: `calc(100% - 56px - ${breadNavHeight}px)` } : {}}>
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
              if (appnavtype === '1') {
                getSearchRecordResult(value);
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
