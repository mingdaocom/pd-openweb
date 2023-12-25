import React, { createRef, useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, Dropdown, Checkbox, Tooltip, Input } from 'ming-ui';
import cx from 'classnames';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { canNavGroup, getSetDefault, getSetHtmlData } from './util';
import bgNavGroups from './img/bgNavGroups.png';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import sheetAjax from 'src/api/worksheet';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util';
import NavShow from './NavShow';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import _ from 'lodash';
import { MaxNavW, MinNavW, defaultNavOpenW } from 'src/pages/worksheet/common/ViewConfig/config.js';

const Wrap = styled.div`
  .hasData {
    .navWidth {
      input[type='number'] {
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          margin: 0;
          -webkit-appearance: none !important;
        }
      }
      .unit {
        right: 12px;
        line-height: 34px;
      }
      .ming.Input {
        font-size: 13px;
        border: 1px solid #ddd;
        &:hover {
          border-color: #bbb;
        }
        &:focus {
          border-color: #2196f3;
        }
      }
    }
    .cancle {
      color: #9e9e9e;
      cursor: pointer;
      &:hover {
        color: #757575;
      }
    }
    .Dropdown {
      width: 100%;
      display: flex;
      line-height: 36px;
      height: 36px;
      opacity: 1;
      background: #ffffff;
      border-radius: 4px;
      margin: 8px 0;
      box-sizing: border-box;
      .actionIcon {
        width: 13px;
      }
      & > div {
        flex: 1;
      }
      .Dropdown--input {
        padding: 0 12px 0 12px;
        width: 100%;
        display: flex;
        border: 1px solid #dddddd;
        border-radius: 4px;
        height: 36px;
        &.active {
          border: 1px solid #2196f3;
        }
        .value,
        .Dropdown--placeholder {
          flex: 1;
          max-width: 100%;
        }
        .Icon {
          line-height: 34px;
        }
        .List {
          width: 100%;
          top: 104% !important;
        }
      }
    }
    .inputBox {
      width: 100%;
      display: flex;
      line-height: 36px;
      height: 36px;
      opacity: 1;
      background: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 4px;
      padding: 0 12px 0 12px;
      .icon {
        line-height: 35px;
      }
      .itemText {
        text-align: left;
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .addFilterCondition {
      width: 100% !important;
      position: relative;
      margin: 14px 0 0;
      height: auto !important;
      border: 0px !important;
      line-height: 1 !important;
      text-align: center;
      &:hover {
        color: #333 !important;
      }
      & > span {
        width: 100% !important;
        display: block !important;
        padding: 0 0 !important;
      }
      span.addIcon {
        position: relative;
        background: #f8f8f8;
        color: #2196f3;
        border-radius: 3px;
        display: block;
        padding: 12px 0;
        cursor: pointer;
        text-align: center;
        font-weight: bold;
        .icon {
          font-size: 20px;
        }
        &:hover {
          color: #1565c0;
          background: #f5f5f5;
        }
      }
      &.active {
        .inputBox {
          border: 1px solid #2196f3;
        }
      }
    }
    .checkBox {
      vertical-align: middle;
    }
    .ming.Checkbox.checked .Checkbox-box {
      // background-color: #9e9e9e;
    }
    .ming.Checkbox.Checkbox--disabled {
      color: #333;
    }
    .iconWrap {
      display: inline-block;
      vertical-align: middle;
      margin-left: 8px;
    }
  }
  .noData {
    .cover {
      padding-top: 60px;
      img {
        width: 100%;
        display: block;
      }
    }
    h6 {
      font-size: 20px;
      font-weight: 500;
      color: #333333;
      text-align: center;
      padding: 0;
      padding-top: 32px;
      margin: 0;
    }
    .text {
      font-weight: 400;
      text-align: center;
      color: #9e9e9e;
      line-height: 20px;
      font-size: 13px;
      width: 80%;
      margin: 24px auto 0;
    }
    .addFilterCondition {
      width: 100% !important;
      position: relative;
      width: auto !important;
      height: auto !important;
      border: 0px !important;
      line-height: 1 !important;
      text-align: center;
      &.nodata {
        margin: 32px auto 0 !important;
      }
      & > span {
        width: 100% !important;
        display: block !important;
        padding: 0 0 !important;
      }
      span.addIcon {
        position: relative;
        background: #2196f3;
        border-radius: 3px;
        color: #fff;
        display: inline-block;
        padding: 12px 32px;
        cursor: pointer;
        font-weight: bold;
        .icon {
          font-size: 20px;
        }
        &:hover {
          background: #1565c0;
        }
      }
    }
  }
  .RelateRecordDropdown-selected {
    height: auto;
  }
`;

export default function NavGroup(params) {
  let ajaxInfoFn = null;
  const { worksheetControls = [], view = {}, updateCurrentView, worksheetId, columns, currentSheetInfo = {} } = params;
  let [navGroup, setData] = useState({});
  let [filterData, setDatas] = useState();
  let [usenav, setUsenav] = useState(); //空或者0：不使用筛选条件作为默认值 1：使用筛选条件作为默认值 ，老数据后端回兼容，新配置需要前端把这个值设为1
  let [showAddCondition, setShowAddCondition] = useState();
  const [relateSheetInfo, setRelateSheetInfo] = useState([]);
  const [relateControls, setRelateControls] = useState([]);
  const [{ navshow, navfilters, navwidth }, setState] = useSetState({
    navshow: 0,
    navfilters: '[]',
    navwidth: defaultNavOpenW,
  });
  useEffect(() => {
    const { advancedSetting = {} } = view;
    setUsenav(!advancedSetting.usenav || advancedSetting.usenav === '0' ? '0' : '1');
    setState({
      navshow: advancedSetting.navshow,
      navfilters: advancedSetting.navfilters || '[]',
      navwidth: advancedSetting.navwidth || defaultNavOpenW,
    });
  }, [view]);
  useEffect(() => {
    const groupData = view.navGroup || [];
    let navGroup = groupData.length > 0 ? groupData[0] : {};
    setData(navGroup);
    let { controlId } = navGroup;
    const d = worksheetControls.find(item => item.controlId === controlId) || {};
    setDatas({ ...navGroup, isErr: !d.controlId, controlName: d.controlName, type: d.type });
    d.type === 29 && d.dataSource && getRelate(d.dataSource);
  }, [view.navGroup]);
  const onDelete = () => {
    updateView(undefined);
  };
  const updateView = (navGroup, advancedSetting) => {
    setData(navGroup);
    let editAttrs = ['navGroup'];
    let param = { navGroup: navGroup ? [navGroup] : [] };
    if (!!advancedSetting) {
      editAttrs.push('advancedSetting');
      param = {
        ...param,
        advancedSetting: updateViewAdvancedSetting(view, {
          ...advancedSetting,
        }),
      };
    }
    updateCurrentView(
      Object.assign(view, {
        ...param,
        editAttrs: editAttrs,
      }),
    );
  };
  const addNavGroups = data => {
    const d = getSetDefault(data);
    let info = {
      shownullitem: '1', //默认新增显示空
    };
    if ([35].includes(data.type)) {
      info = {
        showallitem: '',
      };
    }
    updateView(d, {
      navshow: !['0', '1'].includes(navshow + '') ? '0' : navshow, //新配置需要前端把这个值设为1
      navfilters: JSON.stringify([]),
      usenav: '1', //新配置需要前端把这个值设为1
      ...info,
    });
    setShowAddCondition(false);
    data.type === 29 && data.dataSource && getRelate(data.dataSource);
  };

  const getRelate = worksheetId => {
    ajaxInfoFn && ajaxInfoFn.abort();
    ajaxInfoFn = sheetAjax.getWorksheetInfo({ worksheetId, getViews: true, getTemplate: true });
    ajaxInfoFn.then(data => {
      ajaxInfoFn = '';
      const fieldList = data.views
        .filter(item => item.viewType === 2 && String(item.childType) !== '2') //非多表关联层级视图
        .map(o => {
          return { value: o.viewId, text: o.name };
        });
      setRelateSheetInfo(fieldList);
      setRelateControls(_.get(data, ['template', 'controls']));
    });
  };
  const updateAdvancedSetting = data => {
    updateCurrentView(
      Object.assign(view, {
        advancedSetting: updateViewAdvancedSetting(view, {
          ...data,
        }),
        editAttrs: ['advancedSetting'],
      }),
    );
  };
  const renderAdd = ({ width, comp }) => {
    return (
      <AddCondition
        renderInParent
        className="addControl"
        columns={setSysWorkflowTimeControlFormat(
          filterOnlyShowField(worksheetControls).filter(
            o => canNavGroup(o, worksheetId), // && !navGroup.controlId === o.controlId,
          ),
          currentSheetInfo.switches || [],
        )}
        onAdd={addNavGroups}
        style={{
          width: width || '440px',
        }}
        offset={[0, 0]}
        classNamePopup="addControlDrop"
        comp={comp}
        from="fastFilter" //样式
        defaultVisible={showAddCondition}
      />
    );
  };

  const renderDrop = data => {
    let htmlData = getSetHtmlData(data.type);
    return htmlData.map(o => {
      if (o.key === 'viewId' && data.type === 29) {
        o.types = relateSheetInfo;
        if (relateSheetInfo.length <= 0) {
          o.types = [
            {
              text: <span className="Gray_9e">{_l('关联表中没有本表关联类型的层级视图，请先去添加一个')}</span>,
              isTip: true,
            },
          ];
        }
      }
      if (data.type === 29 && !navGroup.viewId && o.key === 'filterType') {
        //关联记录不是以层级视图时，没有筛选方式
        return '';
      }
      if (data.type === 29 && !!navGroup.viewId && o.key === 'navshow') {
        //关联记录 以层级视图时，没有显示项
        return '';
      }
      let value = !navGroup[o.key] && data.type === 29 ? null : navGroup[o.key];
      if (o.key === 'filterType' && [29, 35].includes(data.type)) {
        value = value === 11 ? value : 24; //筛选方式 24是 | 11包含 老数据是0 按照24走
      }
      if (o.key === 'navshow') {
        return (
          <NavShow
            canShowAll
            canShowNull
            params={o}
            value={navshow}
            onChange={newValue => {
              updateCurrentView(
                Object.assign(view, {
                  advancedSetting: updateViewAdvancedSetting(view, {
                    ...newValue,
                  }),
                  editAttrs: ['advancedSetting'],
                }),
              );
            }}
            advancedSetting={view.advancedSetting}
            navfilters={navfilters}
            filterInfo={{
              relateControls: relateControls,
              allControls: worksheetControls,
              globalSheetInfo: _.pick(currentSheetInfo, [
                'appId',
                'groupId',
                'name',
                'projectId',
                'roleType',
                'worksheetId',
                'switches',
              ]),
              columns,
              viewControl: data.controlId,
            }}
          />
        );
      }
      return (
        <React.Fragment>
          {o.txt && <div className="title mTop30 Gray Bold">{o.txt}</div>}
          {o.des && <div className="des mTop5 Gray_9e">{o.des}</div>}
          <Dropdown
            data={o.types}
            value={value}
            className="flex"
            onChange={newValue => {
              updateView(
                { ...navGroup, [o.key]: newValue },
                o.key === 'viewId' && data.type === 29 //关联记录 以层级视图时，没有显示项
                  ? { navshow: '0', navfilters: JSON.stringify([]) }
                  : null,
              );
            }}
            border
            cancelAble={[29, 35].includes(data.type)}
            renderError={() => {
              if (data.type === 29 && relateSheetInfo.length > 0 && o.key === 'viewId') {
                return (
                  <span className="Red TxtMiddle">
                    <Icon icon={'error1'} className={cx('mRight12 Font16')} />
                    <span className="">{_l('该视图已删除')}</span>
                  </span>
                );
              } else {
                return '';
              }
            }}
          />
        </React.Fragment>
      );
    });
  };

  const updateWidth = e => {
    let value = e.target.value.trim();
    localStorage.removeItem(`navGroupWidth_${view.viewId}`);
    updateAdvancedSetting({ navwidth: value < MinNavW ? MinNavW : value > MaxNavW ? MaxNavW : value });
    e.stopPropagation();
  };

  return (
    <Wrap>
      {!!_.get(navGroup, ['controlId']) ? (
        <div className="hasData">
          <div className="viewSetTitle">{_l('筛选列表')}</div>
          <div className="Gray_9e mTop8 mBottom4">
            {_l('将所选字段选项以列表的形式显示在视图左侧，帮助用户快速查看记录，支持选项、关联记录和级联选择字段。')}
          </div>
          <React.Fragment>
            <div className="con">
              <div className="title mTop25 Gray Bold">
                {_l('筛选字段')}
                <span
                  className="cancle Right"
                  onClick={() => {
                    onDelete();
                  }}
                >
                  {_l('清除')}
                </span>
              </div>
              {renderAdd({
                comp: () => {
                  const iconName = filterData.isErr
                    ? 'error1'
                    : getIconByType(
                        (worksheetControls.find(item => item.controlId === _.get(filterData, ['controlId'])) || {})
                          .type,
                        false,
                      );
                  return (
                    <div className={cx('inputBox mTop6', { Red: filterData.isErr })}>
                      {iconName ? (
                        <Icon
                          icon={iconName}
                          className={cx('mRight12 Font18 ', { Red: filterData.isErr, Gray_75: !filterData.isErr })}
                        />
                      ) : null}
                      <div className="itemText">
                        {filterData.isErr ? (
                          <Tooltip
                            popupPlacement="bottom"
                            text={<span>{_l('ID: %0', _.get(filterData, ['controlId']))}</span>}
                            tooltipClass="deleteHoverTips"
                          >
                            <span>{_l('该字段已删除')}</span>
                          </Tooltip>
                        ) : (
                          _.get(filterData, ['controlName'])
                        )}
                      </div>
                      <Icon icon={'arrow-down-border'} className="mLeft12 Gray_9e" />
                    </div>
                  );
                },
              })}
              {filterData && !filterData.isErr && renderDrop(filterData)}
            </div>
            <div className="title mTop30 Gray Bold">{_l('默认宽度')}</div>
            <div className="Relative navWidth mTop8">
              <Input
                type="number"
                className="flex placeholderColor w100 pRight30"
                value={navwidth}
                placeholder={_l('请输入')}
                onChange={navwidth => {
                  setState({
                    navwidth,
                  });
                }}
                onKeyDown={e => {
                  if (e.keyCode === 13) {
                    updateWidth(e);
                  }
                }}
                onBlur={e => {
                  updateWidth(e);
                }}
              />
              <span className="Absolute unit Gray_9e">px</span>
            </div>
          </React.Fragment>
          <h6 className="mTop30 Font13 Bold">{_l('设置')}</h6>
          <div className="mTop13">
            <Checkbox
              className="checkBox InlineBlock"
              text={_l('创建记录时，以选中列表作为默认值')}
              checked={usenav + '' === '1'}
              onClick={() => {
                updateAdvancedSetting({ usenav: usenav + '' === '1' ? '0' : '1' });
              }}
            />
            <Tooltip
              popupPlacement="bottom"
              text={
                <span>
                  {_l(
                    '如：在商品表中以商品类型（生鲜、副食、饮料等）作为筛选列表时，如果当前选中了饮料分类，则创建记录时商品类型默认为饮料。',
                  )}
                </span>
              }
            >
              <div className="Hand InlineBlock TxtTop mLeft5">
                <Icon icon="workflow_help" className="Gray_9e helpIcon Font18 InlineBlock mTop2" />
              </div>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className="noData">
          <div className="cover">
            <img src={bgNavGroups} alt="" srcset="" />
          </div>
          <h6 className="">{_l('筛选列表')}</h6>
          <p className="text">
            {_l('将所选字段选项以列表的形式显示在视图左侧，帮助用户快速查看记录，支持选项、关联记录和级联选择字段。')}
          </p>
          {renderAdd({
            comp: () => {
              return (
                <span className="addIcon">
                  <i className="icon icon-add Font16 mRight5"></i>
                  {_l('选择字段')}
                </span>
              );
            },
          })}
        </div>
      )}
    </Wrap>
  );
}
