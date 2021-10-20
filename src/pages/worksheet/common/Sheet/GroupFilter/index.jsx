import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Input, Icon, ScrollView, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import sheetAjax from 'src/api/worksheet';
import { renderCellText } from 'src/pages/worksheet/components/CellControls';
import { updateGroupFilter, getNavGroupCount } from 'worksheet/redux/actions';

const Con = styled.div(
  ({ width }) => `
  width: ${width}px;
  transition: width 0.2s;
  border-top: 1px solid #e0e0e0;
  position:relative;
  z-index: 3;
  .searchBar {
    width: ${width}px;
    padding: 0 12px;
    height: 34px;
    .icon {
      line-height: 35px;
      font-size: 20px;
      color: #bdbdbd;
      &.icon-close {
        cursor: pointer;
      }
      &.icon-search{
        &:hover{
          color:#bdbdbd;
        }
      }
      &:hover{
        color: #2196f3;
      }
    }
    .Input {
      width: 100%;
      border: none;
      padding-left: 6px;
      font-size: 13px;
    }
  }
  .nano-content{
    max-height: calc(100% - 40px);
  }
  .groupWrap {
    width: 100%;
    .gList {
      width:auto;
      font-weight: 400;
      padding:0px 6px;
      line-height: 32px;
      .count {
        padding-left: 10px;
        font-size: 13px;
        color: #9e9e9e;
        line-height: 32px;
      }
      &.current {
        .gListDiv{
          background: #e3f3ff;
          &:hover{
            background: #e3f3ff;
          }
        }
      }
      .gListDiv{
        border-radius: 3px;
        padding-left: 6px;
        position:relative;
        height: 32px;
        &:hover{
          background: rgba(0,0,0,0.04);
        }
        .count{
          position: absolute;
          right: 6px;
        }
      }
      .option {
        left: -3px;
        top: 1px;
        height: 30px;
        width: 3px;
        border-radius: 3px 0 0 3px;
        position: absolute;
      }
      .optionTxt {
        width: 100%;
      }
      &.hasCount{
        .optionTxt {
          max-width: calc(100% - 40px);
        }
      }
    }
    &.isTree{
      overflow: auto;
      .canScroll {
        width: auto;
        height: auto;
        display: inline-block;
        min-width: 100%;
      }
      .gList {
        white-space: nowrap;
      }
      .count{
        position: initial!important;
      }
      .arrow{
        display: inline-block;
        width: 22px;
      }
      .iconArrow{
        width: 18px;
        height: 18px;
        display: inline-block;
        line-height: 18px;
        color: #9e9e9e;
        text-align: center;
        border-radius: 4px;
        &:hover{
            background: rgba(0,0,0,0.06);
            color: #757575;
          }
        }
      }
    }
  }
`,
);
let ajaxFn = null;
let ajaxCount = null;
function GroupFilter(props) {
  const {
    views = [],
    width,
    worksheetInfo,
    isOpenGroup,
    base,
    controls,
    updateGroupFilter,
    filters,
    quickFilter,
    navGroupCounts,
    getNavGroupCount,
  } = props;
  const { appId, worksheetId, viewId } = base;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const navGroup = view.navGroup.length > 0 ? view.navGroup[0] : {};
  let [keywords, setKeywords] = useState();
  const [navGroupData, setGroupFilterData] = useState([]);
  const [rowIdForFilter, setRowIdForFilter] = useState('');
  const [openKeys, setOpenKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setRowIdForFilter('');
    setKeywords('');
    isOpenGroup && fetch();
  }, [navGroup, navGroup.controlId, navGroup.viewId, navGroup.isAsc, isOpenGroup]);
  useEffect(() => {
    isOpenGroup && getNavGroupCount();
  }, [filters, quickFilter, isOpenGroup]);
  useEffect(() => {
    fetch();
  }, [keywords]);
  useEffect(() => {
    if (!navGroup.controlId || !rowIdForFilter) {
      updateGroupFilter([], view);
    } else {
      let soucre = controls.find(o => o.controlId === navGroup.controlId) || {};
      let obj = _.omit(navGroup, ['isAsc']);
      updateGroupFilter(
        [
          {
            ...obj,
            values: [rowIdForFilter],
            dataType: soucre.type,
            filterType: soucre.type === 29 || soucre.type === 35 ? 24 : 2,
          },
        ],
        view,
      );
    }
  }, [rowIdForFilter, navGroup]);
  const isSoucreTree = () => {
    let soucre = controls.find(o => o.controlId === navGroup.controlId) || {};
    return soucre.type === 35 || (soucre.type === 29 && navGroup.viewId);
  };
  const isTreeStyle = () => {
    return !keywords && isSoucreTree();
  };
  const fetch = () => {
    const { controlId } = navGroup;
    setOpenKeys([]);
    if (!controlId) {
      setGroupFilterData([]);
      return;
    } else {
      setLoading(true);
      setData();
    }
  };

  const setData = obj => {
    const { rowId, cb } = obj || {};
    let key = keywords;
    let data = [];
    let filter = navGroup;
    let soucre = controls.find(o => o.controlId === filter.controlId) || {};
    //级联选择字段 或 已配置层级展示的关联字段
    if ([29, 35].includes(soucre.type)) {
      loadData({
        worksheetId: soucre.dataSource,
        viewId: 29 === soucre.type ? filter.viewId : soucre.viewId,
        rowId,
        cb,
      });
    } else {
      let options = (controls.find(o => o.controlId === filter.controlId) || {}).options || [];
      data = !filter.isAsc ? options.slice().reverse() : options;
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
      setLoading(false);
    }
  };
  const renderTxt = (item, control) => {
    let soucre = controls.find(o => o.controlId === navGroup.controlId) || {};
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
    ajaxFn && ajaxFn.abort();
    let soucre = controls.find(o => o.controlId === navGroup.controlId) || {};
    let param =
      soucre.type === 35
        ? {
            getType: 10,
          }
        : {
            appId,
            searchType: 1,
            getType: !viewId ? 7 : 10,
          };
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
        const { data = [] } = result;
        const controls = _.get(result, ['template', 'controls']) || [];
        const control = controls.find(item => item.attribute === 1);
        ajaxFn = '';
        dataUpdate({
          filterData: navGroupData,
          data: data.map(item => {
            return {
              value: item.rowid,
              txt: renderTxt(item, control),
              isLeaf: !item.childrenids,
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
  const dataUpdate = ({ filterData, data, rowId, cb }) => {
    if (rowId && !keywords) {
      filterData.forEach(item => {
        if (item.value === rowId) {
          item.children = data;
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
  const renderTree = (data, level) => {
    return data.map(d => {
      let hasChildren = !d.isLeaf;
      let isClose = hasChildren && !openKeys.includes(d.value);
      let count = Number((navGroupCounts.find(o => o.key === (!d.value ? 'all' : d.value)) || {}).count || 0);
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
            }}
          >
            <div className={cx('gListDiv', { hasCount: count > 0 })}>
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
              {count > 0 && <span className="count">{count}</span>}
            </div>
          </li>
          {hasChildren && d.children && !isClose && renderTree(d.children, !!level ? level + 1 : 1)}
        </React.Fragment>
      );
    });
  };

  const updateFilter = id => {
    setRowIdForFilter(id);
  };

  const conRender = () => {
    if (!isOpenGroup) {
      return (
        <span
          className="pLeft8 InlineBlock w100 pRight8 WordBreak Gray_9e TxtCenter Bold h100 Hand"
          onClick={() => {
            props.changeGroupStatus(!isOpenGroup);
          }}
        >
          {/* {(controls.find(o => o.controlId === navGroup.controlId) || {}).controlName || _l('未命名')} */}
        </span>
      );
    }
    if (loading) {
      return <LoadDiv className="pTop16" />;
    }
    if (navGroupData && navGroupData.length <= 0 && keywords) {
      return <div className="noData mTop35 TxtCenter Gray_9e">{_l('没有搜索结果')}</div>;
    }
    let navData = !keywords
      ? [
          {
            txt: _l('全部'),
            value: '',
            isLeaf: true,
          },
        ].concat(navGroupData)
      : navGroupData;
    let soucre = controls.find(o => o.controlId === navGroup.controlId) || {};
    let isOption = [9, 10, 11].includes(soucre.type); //是否选项
    return (
      <ScrollView className="flex">
        <div className={cx('groupWrap', { isTree: isSoucreTree() })}>
          {isSoucreTree() ? (
            <ul className={cx({ canScroll: isSoucreTree() })}>{renderTree(navData)}</ul>
          ) : (
            <ul>
              {navData.map((o, i) => {
                let styleCss =
                  isOption && soucre.enumDefault2 === 1 && !!o.key
                    ? {
                        backgroundColor: o.color,
                      }
                    : {};
                let count = Number((navGroupCounts.find(d => d.key === (!o.value ? 'all' : o.value)) || {}).count || 0);
                return (
                  <li
                    className={cx('gList Hand', {
                      current: rowIdForFilter === o.value,
                      WordBreak: !isSoucreTree(),
                      overflow_ellipsis: !isSoucreTree(),
                      hasCount: count > 0,
                    })}
                    onClick={() => {
                      updateFilter(o.value);
                    }}
                  >
                    <div className={cx('gListDiv')}>
                      {isOption && soucre.enumDefault2 === 1 && !!o.key && (
                        <span className="option" style={styleCss}></span>
                      )}
                      <span className="optionTxt InlineBlock WordBreak overflow_ellipsis">{o.txt || _l('未命名')}</span>
                      {count > 0 && <span className="count">{count}</span>}
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
    <Con width={width} style={{ borderRight: !isOpenGroup ? '1px solid rgba(0, 0, 0, 0.04)' : '0' }}>
      <div
        className={cx('searchBar flexRow', {
          pAll0: !isOpenGroup,
          TxtCenter: !isOpenGroup,
        })}
      >
        {isOpenGroup && (
          <React.Fragment>
            <i className="icon icon-search"></i>
            <Input
              value={keywords}
              placeholder={_l('搜索')}
              className={cx('flex', { placeholderColor: !keywords })}
              onChange={value => {
                let keyWords = value.trim();
                setKeywords(keyWords);
                updateFilter('');
              }}
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
