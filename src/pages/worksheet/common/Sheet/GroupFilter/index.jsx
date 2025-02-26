import React, { useEffect, useRef, useState, useCallback } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, ScrollView, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import sheetAjax from 'src/api/worksheet';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { updateGroupFilter, getNavGroupCount } from 'worksheet/redux/actions';
import { getAdvanceSetting } from 'src/util';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import _ from 'lodash';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import { getFilledRequestParams } from 'worksheet/util';
import { emitter } from 'src/util';
import { sortDataByCustomNavs, getSourceControlByNav } from './util';
import { Con } from './style';

let getNavGroupRequest = null;
let preWorksheetIds = [];

const TYPES = {
  26: {
    name: 'fullname',
    id: 'accountId',
  },
  27: {
    name: 'departmentName',
    id: 'departmentId',
  },
  48: {
    name: 'organizeName',
    id: 'organizeId',
  },
};

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
    sheetSwitchPermit = [],
    navGroupFilters,
  } = props;
  const inputRef = useRef(null);
  const { appId, worksheetId, viewId } = base;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const navGroup = _.isEmpty(view.navGroup) ? {} : view.navGroup[0];
  let [keywords, setKeywords] = useState();
  const [navGroupData, setGroupFilterData] = useState([]);
  const [rowIdForFilter, setRowIdForFilter] = useState('');
  const [navName, setNavName] = useState('');
  const [openKeys, setOpenKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    emitter.addListener('ROWS_UPDATE', getNavGroupCount);
    return () => {
      emitter.removeListener('ROWS_UPDATE', getNavGroupCount);
    };
  }, []);
  useEffect(() => {
    setRowIdForFilter('');
    setNavName('');
    setKeywords('');
  }, [navGroup, navGroup.controlId, navGroup.viewId, navGroup.isAsc]);
  useEffect(() => {
    if (_.isEmpty(navGroupFilters)) {
      setRowIdForFilter('');
    }
  }, [navGroupFilters]);
  useEffect(() => {
    let source = getSourceControlByNav(navGroup, controls);
    if ([29, 26, 27, 48].includes(source.type) && getAdvanceSetting(view).navshow === '1' && isOpenGroup) {
      getNavGroupCount();
    }
    isOpenGroup && fetch();
  }, [
    navGroup.controlId,
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
  ]);
  useEffect(() => {
    isOpenGroup && getNavGroupCount();
  }, [filters, quickFilter, isOpenGroup]);
  useEffect(() => {
    fetch();
  }, [keywords]);
  useEffect(() => {
    let source = getSourceControlByNav(navGroup, controls);
    let { navshow } = getAdvanceSetting(view);
    if ([26, 27, 48, 29].includes(source.type) && navshow === '1') {
      fetch();
    }
  }, [navGroupCounts]);
  const handleSearch = useCallback(
    _.debounce(value => {
      let keyWords = value.trim();
      setKeywords(keyWords);
      updateFilter('');
    }, 500),
    [],
  );
  useEffect(() => {
    if (!navGroup.controlId || !rowIdForFilter) {
      updateGroupFilter([], view);
    } else {
      let source = getSourceControlByNav(navGroup, controls);
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
  const isSoucreTree = () => {
    let source = getSourceControlByNav(navGroup, controls);
    return source.type === 35 || (source.type === 29 && navGroup.viewId);
  };
  const isTreeStyle = () => {
    return !keywords && isSoucreTree();
  };
  const fetch = () => {
    if (inputRef && inputRef.current) {
      inputRef.current.value = keywords;
    }
    const { controlId } = navGroup;
    let { navfilters = '[]', navshow } = getAdvanceSetting(view);
    if (controlId === 'wfstatus' && !isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit)) {
      navshow = '0';
    }
    setOpenKeys([]);
    if (!controlId) {
      setGroupFilterData([]);
      return;
    } else {
      try {
        navfilters = JSON.parse(navfilters);
      } catch (error) {
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
    const { rowId, cb } = obj || {};
    let key = keywords;
    let data = [];
    let source = getSourceControlByNav(navGroup, controls);
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
        loadData({
          worksheetId: source.dataSource,
          viewId: 29 === source.type ? navGroup.viewId : source.viewId,
          rowId,
          cb,
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
          data = !navGroup.isAsc ? data.slice().reverse() : data;
          break;
        case 26:
        case 27:
        case 48:
          let { navfilters = '[]', navshow } = getAdvanceSetting(view);
          try {
            navfilters = JSON.parse(navfilters);
          } catch (error) {
            navfilters = [];
          }
          data = navfilters.map(o => {
            const item = safeParse(o) || {};
            return {
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
  const renderTxt = (item, control, viewId) => {
    let source = getSourceControlByNav(navGroup, controls);
    if (keywords && (source.type === 35 || (source.type === 29 && navGroup.viewId && !!viewId && !!item.path))) {
      //视图是否删除 !!viewId
      const path = safeParse(item.path, 'array');
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
            {text}
            {!isLast && <span> / </span>}
          </React.Fragment>
        );
      });
    }
    return control ? renderCellText(Object.assign({}, control, { value: item[control.controlId] })) : _l('未命名');
  };

  const fetchData = ({ worksheetId, viewId, rowId, cb }) => {
    if (!isOpenGroup) {
      return;
    }
    let source = getSourceControlByNav(navGroup, controls);
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
    param.keyWords = keywords;
    let { navfilters = '[]', navshow } = getAdvanceSetting(view);
    try {
      navfilters = JSON.parse(navfilters);
    } catch (error) {
      navfilters = [];
    }
    if (source.type !== 35 && navfilters.length > 0 && ['3'].includes(navshow)) {
      /// 显示 符合筛选条件的处理
      let filterControls = navfilters.map(o => handleCondition(o));
      param = { ...param, filterControls };
    }
    if (source.type === 29) {
      //关联表作为
      param.sortControls = safeParse(_.get(view, 'advancedSetting.navsorts'), 'array');
      if (!!_.get(source, 'advancedSetting.searchcontrol') && keywords) {
        param.controlId = _.get(source, 'controlId');
      }
      if (!!_.get(view, 'advancedSetting.navsearchcontrol') && keywords) {
        param.keyWords = undefined;
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
    }
    if (
      getNavGroupRequest &&
      getNavGroupRequest.abort &&
      preWorksheetIds.includes(`${base.worksheetId}-${base.viewId}`)
    ) {
      getNavGroupRequest.abort();
    }
    preWorksheetIds.push(`${base.worksheetId}-${base.viewId}`);
    getNavGroupRequest = sheetAjax.getFilterRows(
      getFilledRequestParams({
        worksheetId,
        viewId,
        pageIndex: 1,
        pageSize: 10000,
        isGetWorksheet: true,
        kanbanKey: rowId,
        ...param,
      }),
    );
    getNavGroupRequest.then(result => {
      getNavGroupRequest = null;
      preWorksheetIds = (preWorksheetIds || []).filter(o => o !== `${base.worksheetId}-${base.viewId}`);
      if (result.resultCode === 4) {
        //视图删除的情况下，显示成未选中视图的状态
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
        let newDate = data;
        if (source.type !== 35 && navfilters.length > 0 && navshow === '2') {
          newDate = [];
          const ids = navfilters.map(value => safeParse(value).id);
          ids.map(it => {
            newDate = newDate.concat(data.find(o => o.rowid === it));
          });
        }
        newDate = newDate.filter(o => !!o);
        const controls = _.get(result, ['template', 'controls']) || [];
        const control = controls.find(item => item.attribute === 1);
        dataUpdate({
          filterData: navGroupData,
          data: newDate.map((item = {}) => {
            return {
              value: item.rowid,
              txt: renderTxt(item, control, viewId),
              isLeaf: !item.childrenids,
              text: item[control.controlId],
            };
          }),
          rowId,
          cb,
        });
      }
    });
  };

  const loadData = obj => {
    fetchData(obj);
  };
  const dataUpdate = ({ filterData, data, rowId, cb }, notUpdate) => {
    if (rowId && !keywords) {
      filterData.forEach(item => {
        if (item.value === rowId) {
          item.children = data;
        } else if (_.isArray(item.children)) {
          dataUpdate({ filterData: item.children, data, rowId }, true);
        }
      });
      !notUpdate && setGroupFilterData(filterData);
    } else {
      !notUpdate && setGroupFilterData(data);
    }
    setLoading(false);
    cb && cb();
  };
  const renderTree = (data, level, str) => {
    return data.map(d => {
      let hasChildren = !d.isLeaf;
      let isClose = hasChildren && !openKeys.includes(d.value);
      let count = Number(
        (navGroupCounts.find(o => o.key === (!d.value ? 'all' : d.value === 'null' ? '' : d.value)) || {}).count || 0,
      );
      let source = getSourceControlByNav(navGroup, controls);
      const { advancedSetting, type } = source;
      const { allpath = '0' } = advancedSetting;
      const nStr = allpath === '1' && type === 35 ? (!!str ? str + '/' : '') + d.txt : d.txt; //级联选项控件，结果显示层级路径
      const showCount = count > 0 && view.viewType !== 2;
      return (
        <React.Fragment>
          <li
            className={cx('gList Hand', {
              current: rowIdForFilter === d.value,
              WordBreak: !isTreeStyle(),
              overflow_ellipsis: !isTreeStyle(),
            })}
            style={{ paddingLeft: (!level ? 0 : 18 * level) + 6 }}
            onClick={() => {
              updateFilter(d.value);
              setNavName(keywords && type === 35 ? d.text : nStr);
            }}
          >
            <div className={cx('gListDiv', { hasCount: showCount })}>
              <span className={cx({ arrow: !keywords })}>
                {hasChildren && (
                  <Icon
                    className="Hand Font12 iconArrow"
                    icon={!isClose ? 'arrow-down' : 'arrow-right-tip'}
                    onClick={e => {
                      e.stopPropagation();
                      if (isClose) {
                        if (!d.children) {
                          setData({
                            rowId: d.value,
                            cb: () => {
                              setOpenKeys(openKeys.concat(d.value));
                            },
                          });
                        } else {
                          setOpenKeys(openKeys.concat(d.value));
                        }
                      } else {
                        setOpenKeys(openKeys.filter(o => o !== d.value));
                      }
                    }}
                  />
                )}
              </span>
              {d.txt || _l('未命名')}
              {showCount && <span className="count">{count}</span>}
            </div>
          </li>
          {hasChildren && d.children && !isClose && renderTree(d.children, !!level ? level + 1 : 1, nStr)}
        </React.Fragment>
      );
    });
  };

  const updateFilter = id => {
    setRowIdForFilter(id);
  };

  const conRender = () => {
    let { showallitem, allitemname = '', shownullitem, nullitemname = '' } = getAdvanceSetting(view);
    if (!isOpenGroup) {
      return (
        <span
          className="pLeft8 InlineBlock w100 pRight8 WordBreak Gray_9e TxtCenter Bold h100 Hand"
          onClick={() => {
            props.changeGroupStatus(!isOpenGroup);
          }}
        ></span>
      );
    }
    if (loading) {
      return <LoadDiv className="pTop16" />;
    }
    if (navGroupData && navGroupData.length <= 0 && keywords) {
      return <div className="noData mTop35 TxtCenter Gray_9e">{_l('没有搜索结果')}</div>;
    }
    let source = getSourceControlByNav(navGroup, controls);
    let navData = navGroupData;
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
    return (
      <ScrollView className="flex">
        <div className={cx('groupWrap', { isTree: isSoucreTree() })}>
          {isSoucreTree() ? (
            <ul className={cx({ canScroll: isSoucreTree() })}>{renderTree(navData)}</ul>
          ) : (
            <ul>
              {navData.map((o, i) => {
                let styleCss =
                  isOption && source.enumDefault2 === 1 && !!o.key
                    ? {
                        backgroundColor: o.color,
                      }
                    : {};
                let count = Number(
                  (navGroupCounts.find(d => d.key === (!o.value ? 'all' : o.value === 'null' ? '' : o.value)) || {})
                    .count || 0,
                );
                // 显示有数据的项 //排除全部和空
                if (navshow === '1' && count <= 0 && !['null', ''].includes(o.value)) {
                  return;
                }
                const showCount = count > 0 && view.viewType !== 2;
                const keyStr = _.includes([26, 27, 48], source.type) ? TYPES[source.type].name : '';
                const txtName =
                  keyStr && !['null', ''].includes(o.value) ? safeParse(o.txt)[keyStr] : o.txt || _l('未命名');
                return (
                  <li
                    className={cx('gList Hand', {
                      current: rowIdForFilter === o.value,
                      WordBreak: !isSoucreTree(),
                      overflow_ellipsis: !isSoucreTree(),
                      hasCount: showCount,
                    })}
                    onClick={() => {
                      updateFilter(o.value);
                      setNavName(o.txt);
                    }}
                  >
                    <div className={cx('gListDiv')}>
                      {isOption && source.enumDefault2 === 1 && !!o.key && (
                        <span className="option" style={styleCss}></span>
                      )}
                      <span className="optionTxt InlineBlock WordBreak overflow_ellipsis">{txtName}</span>
                      {showCount && <span className="count">{count}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </ScrollView>
    );
  };
  return (
    <Con
      className="groupFilterWrap h100 flexColumn"
      width={width}
      style={{ borderRight: !isOpenGroup ? '1px solid rgba(0, 0, 0, 0.04)' : '0' }}
    >
      <div
        className={cx('searchBar flexRow', {
          pAll0: !isOpenGroup,
          TxtCenter: !isOpenGroup,
        })}
      >
        {isOpenGroup && (
          <React.Fragment>
            <i className="icon icon-search"></i>
            <input
              type="text"
              placeholder={_l('搜索')}
              ref={inputRef}
              className={cx('flex', { placeholderColor: !keywords })}
              onChange={e => handleSearch(e.target.value)}
            />
          </React.Fragment>
        )}
        {keywords && (
          <i
            className="icon icon-cancel1 Hand"
            onClick={() => {
              setKeywords('');
              updateFilter('');
            }}
          ></i>
        )}
        {!keywords && (
          <i
            className={cx(`icon Font12 icon-${!isOpenGroup ? 'next-02' : 'back-02'} Hand LineHeight34`, {
              pLeft9: !isOpenGroup,
            })}
            onClick={() => {
              props.changeGroupStatus(!isOpenGroup);
            }}
          ></i>
        )}
      </div>
      {conRender()}
    </Con>
  );
}

export default connect(
  state => ({
    ...state.sheet,
  }),
  dispatch =>
    bindActionCreators(
      {
        updateGroupFilter,
        getNavGroupCount,
      },
      dispatch,
    ),
)(GroupFilter);
