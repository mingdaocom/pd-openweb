import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Checkbox, Dropdown, Icon, Tooltip } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { formatObjWithNavfilters } from 'src/pages/worksheet/common/ViewConfig/util';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import FastFilterCon from './fastFilterCon';
import bgFastFilters from './img/bgFastFilters.png';
import { formatFastFilterData, getSetDefault } from './util';
import './index.less';

const Wrap = styled.div`
  .hasData {
    .checkBox {
      vertical-align: middle;
    }
    .ming.Checkbox.Checkbox--disabled {
      color: #151515;
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
      color: #151515;
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
  }
  .fastFilterControlDropdown {
    height: auto;
    min-height: 36px;
    .itemT {
      background: #f5f5f5;
      border-radius: 4px 4px 4px 4px;
      padding: 3px 8px 3px 10px;
      border: 1px solid #e0e0e0;
      i {
        color: #9e9e9e;
        &:hover {
          color: #757575;
        }
      }
    }
    .Dropdown--border,
    .dropdownTrigger .Dropdown--border {
      min-height: 36px !important;
      height: auto !important;
    }
    .Dropdown--input .value {
      display: flex !important;
      & > div {
        flex: 1 !important;
        display: flex !important;
        flex-flow: row wrap !important;
        gap: 5px;
      }
    }
  }
`;

export default function FastFilter(params) {
  const { worksheetControls = [], setFastFilter, view = {}, updateCurrentView, currentSheetInfo } = params;
  const { advancedSetting = {} } = view;
  let { enablebtn, clicksearch, fastrequired, requiredcids } = advancedSetting;
  let [fastFilters, setData] = useState(view.fastFilters || []);
  let [showAddCondition, setShowAddCondition] = useState();
  const [{ dropDownVisible }, setState] = useSetState({
    dropDownVisible: false,
  });
  useEffect(() => {
    const d = setSysWorkflowTimeControlFormat(view.fastFilters || [], currentSheetInfo.switches || []);
    setData(d);
  }, [view.fastFilters]);
  const handleSortEnd = list => {
    updateView(list);
  };
  const onEdit = id => {
    setFastFilter(true, id);
    setShowAddCondition(false);
  };
  const onDelete = controlId => {
    const ids = safeParse(requiredcids, 'array');
    const data = fastFilters.filter(o => o.controlId !== controlId);
    if (ids.includes(controlId)) {
      updateView(data, { requiredcids: JSON.stringify(ids.filter(o => o !== controlId)) });
    } else {
      updateView(data);
    }
  };
  const updateView = (fastFilters, advanced) => {
    let data =
      fastFilters.length > 0
        ? {
            enablebtn: fastFilters.length > 3 ? '1' : advancedSetting.enablebtn,
          }
        : {
            clicksearch: '0', //
            enablebtn: '0',
            requiredcids: '[]',
            fastrequired: '',
          };
    data = { ...advanced, ...data };
    updateCurrentView(
      Object.assign(view, {
        fastFilters: formatFastFilterData(
          fastFilters.map(o => {
            return formatObjWithNavfilters(o);
          }),
        ),
        advancedSetting: data,
        editAttrs: ['fastFilters', 'advancedSetting'],
        editAdKeys: Object.keys(data),
      }),
    );
  };
  const addFastFilter = data => {
    const d = getSetDefault(data);
    let dd = fastFilters.concat(d);
    if (fastFilters.length <= 0 && dd.length === 1) {
      setShowAddCondition(false);
      setTimeout(() => {
        setShowAddCondition(true);
      }, 500);
    } else {
      setShowAddCondition(undefined);
    }
    updateView(dd);
    setFastFilter(false, data.controlId);
  };

  const updateAdvancedSettingWithEitAdKeys = advanced => {
    setShowAddCondition(false);
    updateCurrentView({
      ...view,
      advancedSetting: advanced,
      editAdKeys: Object.keys(advanced),
      editAttrs: ['advancedSetting'],
    });
  };

  const renderFastFilterCon = () => {
    //系统字段未开启，相关的审批系统字段隐藏
    return (
      <FastFilterCon
        fastFilters={fastFilters}
        worksheetControls={setSysWorkflowTimeControlFormat(worksheetControls, currentSheetInfo.switches || [])}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={addFastFilter}
        onSortEnd={handleSortEnd}
        from="fastFilter"
        showAddCondition={showAddCondition}
      />
    );
  };

  return (
    <Wrap>
      {fastFilters.length > 0 ? (
        <div className="hasData">
          <div className="viewSetTitle">{_l('快速筛选')}</div>
          <div className="Gray_75 mTop8 mBottom4">
            {_l('选择字段作为快速筛选器平铺显示在视图中，以帮助用户快速查询记录。')}
          </div>
          {renderFastFilterCon()}
          <div className="Gray mTop32 Bold">{_l('设置')}</div>
          <div className="mTop13">
            <Checkbox
              disabled={fastFilters.length > 3}
              className="checkBox InlineBlock"
              text={_l('启用查询按钮')}
              checked={enablebtn === '1'}
              onClick={() => {
                updateAdvancedSettingWithEitAdKeys({
                  enablebtn: enablebtn !== '1' ? '1' : '0',
                  fastrequired: '',
                });
              }}
            />
            <Tooltip
              autoCloseDelay={0}
              popupPlacement="bottom"
              text={<span>{_l('启用按钮后，点击查询按钮执行筛选。当筛选字段超过3个时必须启用。')}</span>}
            >
              <div className="iconWrap pointer">
                <Icon icon="help" className="Gray_9e helpIcon Font18" />
              </div>
            </Tooltip>
          </div>
          {enablebtn === '1' && (
            <div className="mTop15 mLeft30">
              <React.Fragment>
                <Checkbox
                  className="checkBox InlineBlock"
                  text={_l('查询时必填')}
                  checked={fastrequired === '1'}
                  onClick={() => {
                    updateAdvancedSettingWithEitAdKeys({
                      fastrequired: fastrequired !== '1' ? '1' : '0',
                    });
                  }}
                />
                {fastrequired === '1' && (
                  <Dropdown
                    selectClose={false}
                    placeholder={_l('请选择')}
                    className={cx('w100 mTop8 fastFilterControlDropdown', {
                      hs: safeParse(requiredcids, 'array').length > 0,
                    })}
                    renderItem={item => {
                      if (item.value === 'all') {
                        return <div className={'itemText Hand forAll flexRow alignItemsCenter'}>{item.text}</div>;
                      }
                      const isCur = !!safeParse(requiredcids, 'array').includes(item.value);
                      return (
                        <div
                          className={cx('itemText flexRow alignItemsCenter', {
                            isCur,
                          })}
                        >
                          <Icon icon={getIconByType(item.type)} className="Font18 Relative" />
                          <span className="mLeft10 flex Gray">{item.text}</span>
                          {isCur && <Icon icon="done" className="Relative ThemeColor3 Font18" />}
                        </div>
                      );
                    }}
                    popupVisible={dropDownVisible}
                    onVisibleChange={visible => setState({ dropDownVisible: visible })}
                    value={safeParse(requiredcids, 'array').length <= 0 ? undefined : safeParse(requiredcids, 'array')}
                    onChange={value => {
                      let data = [];
                      if (!value) {
                        data = [];
                      } else if (value == 'all') {
                        data = fastFilters.map(o => o.controlId);
                      } else if (safeParse(requiredcids, 'array').includes(value)) {
                        data = safeParse(requiredcids, 'array').filter(o => o !== value);
                      } else {
                        data = [...safeParse(requiredcids, 'array'), value];
                      }
                      updateAdvancedSettingWithEitAdKeys({
                        requiredcids: JSON.stringify(data),
                      });
                    }}
                    renderTitle={() => {
                      return (
                        <div className="">
                          {(safeParse(requiredcids, 'array') || []).map(it => {
                            const info = worksheetControls.find(o => o.controlId === it);
                            const isDel = !fastFilters.find(item => item.controlId === it) || !info;
                            return (
                              <div className={cx('itemT InlineBlock', { Red: isDel })}>
                                {!isDel ? info.controlName : _l('已删除')}
                                <Icon
                                  icon={'close'}
                                  className="Hand mLeft3"
                                  onClick={e => {
                                    e.stopPropagation();
                                    let data = safeParse(requiredcids, 'array').filter(a => a !== it);
                                    updateAdvancedSettingWithEitAdKeys({
                                      requiredcids: JSON.stringify(data),
                                    });
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                    border
                    menuClass={'paramControlDropdownMenu paramControlDropdownMenuSet'}
                    cancelAble
                    isAppendToBody
                    openSearch
                    data={[
                      // { value: 'all', text: _l('全部') },
                      ...fastFilters
                        .map(o => {
                          const info = worksheetControls.find(it => it.controlId === o.controlId) || {};
                          return {
                            ...o,
                            value: o.controlId,
                            text: info.controlName,
                            type: info.type,
                          };
                        })
                        .filter(o => o.type !== 36 && !!o.type), //检查项不支持
                    ]}
                  />
                )}
              </React.Fragment>
            </div>
          )}
          <div className="mTop15">
            <Checkbox
              className="checkBox InlineBlock"
              text={_l('在执行查询后显示数据')}
              checked={clicksearch === '1'}
              onClick={() => {
                updateAdvancedSettingWithEitAdKeys({
                  clicksearch: clicksearch !== '1' ? '1' : '0',
                });
              }}
            />

            <Tooltip
              autoCloseDelay={0}
              popupPlacement="bottom"
              text={<span>{_l('勾选后，进入视图初始不显示数据，查询后显示符合筛选条件的数据。')}</span>}
            >
              <div className="iconWrap pointer">
                <Icon icon="help " className="Gray_9e helpIcon Font18" />
              </div>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className="noData">
          <div className="cover">
            <img src={bgFastFilters} alt="" srcset="" />
          </div>
          <h6 className="">{_l('快速筛选')}</h6>
          <p className="text Gray_75">{_l('将字段作为快速筛选器显示在视图顶部，以帮助用户快速查找记录。')}</p>
          {renderFastFilterCon()}
        </div>
      )}
    </Wrap>
  );
}
