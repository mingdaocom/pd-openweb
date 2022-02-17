import React, { createRef, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Dropdown } from 'ming-ui';
import cx from 'classnames';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { canNavGroup, getSetDefault, getSetHtmlData } from './util';
import bgNavGroups from './img/bgNavGroups.png';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import sheetAjax from 'src/api/worksheet';

const Wrap = styled.div`
  .hasData {
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
        height: 212px;
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
`;

export default function NavGroup(params) {
  let ajaxInfoFn = null;
  const { worksheetControls = [], view = {}, updateCurrentView, worksheetId } = params;
  let [navGroup, setData] = useState({});
  let [filterData, setDatas] = useState();
  let [showAddCondition, setShowAddCondition] = useState();
  const [relateSheetInfo, setRelateSheetInfo] = useState([]);
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
  const updateView = navGroup => {
    setData(navGroup);
    updateCurrentView(
      Object.assign(view, {
        navGroup: navGroup ? [navGroup] : [],
        editAttrs: ['navGroup'],
      }),
    );
  };
  const addNavGroups = data => {
    const d = getSetDefault(data);
    updateView(d);
    setShowAddCondition(false);
    data.type === 29 && data.dataSource && getRelate(data.dataSource);
  };

  const getRelate = worksheetId => {
    ajaxInfoFn && ajaxInfoFn.abort();
    ajaxInfoFn = sheetAjax.getWorksheetInfo({ worksheetId, getViews: true });
    ajaxInfoFn.then(data => {
      ajaxInfoFn = '';
      const fieldList = data.views
        .filter(item => item.viewType === 2 && String(item.childType) !== '2') //非多表关联层级视图
        .map(o => {
          return { value: o.viewId, text: o.name };
        });
      setRelateSheetInfo(fieldList);
    });
  };

  const renderAdd = ({ width, comp }) => {
    return (
      <AddCondition
        renderInParent
        className="addControl"
        columns={worksheetControls.filter(
          o => canNavGroup(o, worksheetId), // && !navGroup.controlId === o.controlId,
        )}
        onAdd={addNavGroups}
        style={{
          width: width || '360px',
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
    if (!htmlData.types && data.type !== 29) {
      return '';
    }
    if (data.type === 29) {
      htmlData.types = relateSheetInfo;
      if (relateSheetInfo.length <= 0) {
        htmlData.types = [
          { text: <span className="Gray_9e">{_l('关联表中没有本表关联类型的层级视图，请先去添加一个')}</span>, isTip: true },
        ];
      }
    }
    return (
      <React.Fragment>
        {htmlData.txt && <div className="title mTop30 Gray">{htmlData.txt}</div>}
        {htmlData.des && <div className="des mTop5 Gray_9e">{htmlData.des}</div>}
        <Dropdown
          data={htmlData.types}
          value={!navGroup[htmlData.key] && data.type === 29 ? null : navGroup[htmlData.key]}
          className="flex"
          onChange={newValue => {
            updateView({ ...navGroup, [htmlData.key]: newValue });
          }}
          cancelAble={[29, 35].includes(data.type)}
          renderError={() => {
            if (data.type === 29 && relateSheetInfo.length <= 0) {
              return '';
            }
            return (
              <span className="Red TxtMiddle">
                <Icon icon={'error1'} className={cx('mRight12 Font16')} />
                <span className="">{_l('该视图已删除')}</span>
              </span>
            );
          }}
        />
      </React.Fragment>
    );
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
              <div className="title mTop25 Gray">
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
                        {filterData.isErr ? _l('该字段已删除') : _.get(filterData, ['controlName'])}
                      </div>
                      <Icon icon={'arrow-down-border'} className="mLeft12 Gray_9e" />
                    </div>
                  );
                },
              })}
              {filterData && !filterData.isErr && renderDrop(filterData)}
            </div>
          </React.Fragment>
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
