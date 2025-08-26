import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { permitList } from 'src/pages/FormSet/config';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { getAdvanceSetting } from 'src/utils/control';
import { AREA, TYPES } from './constants.js';
import { isSourceTree, sortDataByCustomNavs } from './util';

export default function NavGroup(props) {
  const {
    view = {},
    openKeys,
    navGroup,
    controls,
    isOpenGroup,
    keywords,
    loading,
    navGroupData,
    navGroupCounts,
    rowIdForFilter,
    updateFilter,
    setNavName,
    setData,
    source,
    setOpenKeys,
    sheetSwitchPermit = [],
  } = props;

  const { showallitem, allitemname = '', shownullitem, nullitemname = '' } = getAdvanceSetting(view);

  const isTreeStyle = () => {
    return !keywords && isSourceTree(source, navGroup, view);
  };

  if (!isOpenGroup) {
    return (
      <span
        className="pLeft8 InlineBlock w100 pRight8 WordBreak Gray_9e TxtCenter Bold h100 Hand"
        onClick={() => props.changeGroupStatus(!isOpenGroup)}
      />
    );
  }

  if (loading) {
    return <LoadDiv className="pTop16" />;
  }
  if (navGroupData && navGroupData.length <= 0 && keywords) {
    return <div className="noData mTop35 TxtCenter Gray_9e">{_l('没有搜索结果')}</div>;
  }
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

  const renderTree = (data, level, str) => {
    return data.map(d => {
      let hasChildren = !d.isLeaf;
      let isClose = hasChildren && !openKeys.includes(d.value);
      let count = Number(
        (navGroupCounts.find(o => o.key === (!d.value ? 'all' : d.value === 'null' ? '' : d.value)) || {}).count || 0,
      );
      const { advancedSetting, type } = source;
      const { allpath = '0' } = advancedSetting;
      const nStr = allpath === '1' && type === 35 ? (str ? str + '/' : '') + d.txt : d.txt; //级联选项控件，结果显示层级路径
      const showCount = count > 0 && view.viewType !== 2;
      const txtName = (d?.txt || '').startsWith('{') && type === 27 ? '' : d?.txt || _l('未命名');
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
              setNavName(
                (keywords && type === 35) ||
                  (type === 27 && _.get(view, 'advancedSetting.navlayer') === '999') ||
                  AREA.includes(type)
                  ? d.text
                  : nStr,
              );
            }}
          >
            <div className={cx('gListDiv', { hasCount: showCount })}>
              <span className={cx({ arrow: !keywords })}>
                {hasChildren && !keywords && (
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
              <span title={txtName}>{txtName}</span>
              {showCount && <span className="count">{count}</span>}
            </div>
          </li>
          {hasChildren && d.children && !isClose && renderTree(d.children, level ? level + 1 : 1, nStr)}
        </React.Fragment>
      );
    });
  };

  return (
    <ScrollView className="flex">
      <div className={cx('groupWrap', { isTree: isSourceTree(source, navGroup, view) })}>
        {isSourceTree(source, navGroup, view) ? (
          <ul className={cx({ canScroll: isSourceTree(source, navGroup, view) })}>{renderTree(navData)}</ul>
        ) : (
          <ul>
            {navData.map(o => {
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
                keyStr && !['null', ''].includes(o.value)
                  ? !o.txt
                    ? _.includes([27, 48], source.type)
                      ? _l('已删除')
                      : _l('未命名')
                    : o.txt.startsWith('{')
                      ? safeParse(o.txt)[keyStr]
                      : o.txt
                  : o.txt || _l('未命名');
              return (
                <li
                  className={cx('gList Hand', {
                    current: rowIdForFilter === o.value,
                    WordBreak: !isSourceTree(source, navGroup, view),
                    overflow_ellipsis: !isSourceTree(source, navGroup, view),
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
                    <span className="optionTxt InlineBlock WordBreak overflow_ellipsis" title={txtName}>
                      {txtName}
                    </span>
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
}
