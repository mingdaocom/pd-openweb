import React, { useMemo, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Select, Tooltip } from 'ming-ui/antd-components';
import { formatObjWithNavfilters } from 'src/pages/worksheet/common/ViewConfig/util';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { formatFastFilterData, getSetDefault } from 'src/utils/domain/worksheet/fastFilter';
import { setSysWorkflowTimeControlFormat } from 'src/utils/services/worksheet/calendar';
import FastFilterCon from './fastFilterCon';
import bgFastFilters from './img/bgFastFilters.png';
import './index.less';

const Wrap = styled.div`
  .hasData {
    .checkBox {
      vertical-align: middle;
    }
    .iconWrap {
      display: inline-block;
      vertical-align: middle;
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
      color: var(--color-text-title);
      text-align: center;
      padding: 0;
      padding-top: 32px;
      margin: 0;
    }
    .text {
      font-weight: 400;
      text-align: center;
      color: var(--color-text-tertiary);
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
      background: var(--color-background-secondary);
      border-radius: 4px 4px 4px 4px;
      padding: 3px 8px 3px 10px;
      border: 1px solid var(--color-border-secondary);
      i {
        color: var(--color-text-tertiary);
        &:hover {
          color: var(--color-text-secondary);
        }
      }
    }
  }
`;

export default function FastFilter(params) {
  const { worksheetControls = [], setFastFilter, view = {}, updateCurrentView, currentSheetInfo } = params;
  const { advancedSetting = {} } = view;
  let { enablebtn, clicksearch, fastrequired, requiredcids } = advancedSetting;
  const fastFilters = useMemo(
    () => setSysWorkflowTimeControlFormat(view.fastFilters || [], currentSheetInfo.switches || []),
    [view.fastFilters, currentSheetInfo.switches],
  );
  let [showAddCondition, setShowAddCondition] = useState();

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
    updateCurrentView({
      ...view,
      fastFilters: formatFastFilterData(
        fastFilters.map(o => {
          return formatObjWithNavfilters(o);
        }),
      ),
      advancedSetting: data,
      editAttrs: ['fastFilters', 'advancedSetting'],
      editAdKeys: Object.keys(data),
    });
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

  const requiredControlIds = safeParse(requiredcids, 'array');
  const requiredControlOptions = fastFilters
    .map(o => {
      const info = worksheetControls.find(it => it.controlId === o.controlId) || {};
      return {
        ...o,
        value: o.controlId,
        label: info.controlName,
        type: info.type,
      };
    })
    .filter(o => o.type !== 36 && !!o.type);

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
          <div className="textSecondary mTop8 mBottom4">
            {_l('选择字段作为快速筛选器平铺显示在视图中，以帮助用户快速查询记录。')}
          </div>
          {renderFastFilterCon()}
          <div className="textPrimary mTop32 Bold">{_l('设置')}</div>
          <div className="mTop13 flexRow alignItemsCenter">
            <Checkbox
              disabled={fastFilters.length > 3}
              className="checkBox"
              checked={enablebtn === '1'}
              onChange={() => {
                updateAdvancedSettingWithEitAdKeys({
                  enablebtn: enablebtn !== '1' ? '1' : '0',
                  fastrequired: '',
                });
              }}
            >
              {_l('启用查询按钮')}
            </Checkbox>
            <Tooltip placement="bottom" title={_l('启用按钮后，点击查询按钮执行筛选。当筛选字段超过3个时必须启用。')}>
              <div className="iconWrap pointer">
                <Icon icon="help" className="textTertiary helpIcon Font18" />
              </div>
            </Tooltip>
          </div>
          {enablebtn === '1' && (
            <div className="mTop15 mLeft30">
              <React.Fragment>
                <Checkbox
                  className="checkBox"
                  checked={fastrequired === '1'}
                  onChange={() => {
                    updateAdvancedSettingWithEitAdKeys({
                      fastrequired: fastrequired !== '1' ? '1' : '0',
                    });
                  }}
                >
                  {_l('查询时必填')}
                </Checkbox>
                {fastrequired === '1' && (
                  <Select
                    mode="multiple"
                    placeholder={_l('请选择')}
                    className={cx('w100 mTop8 fastFilterControlDropdown', {
                      hs: requiredControlIds.length > 0,
                    })}
                    optionRender={option => {
                      const item = option.data;
                      const isCur = requiredControlIds.includes(item.value);
                      return (
                        <div
                          className={cx('itemText flexRow alignItemsCenter', {
                            isCur,
                          })}
                        >
                          <Icon icon={getIconByType(item.type)} className="Font18 Relative textTertiary" />
                          <span className="mLeft10 flex textPrimary">{item.label}</span>
                        </div>
                      );
                    }}
                    tagRender={({ value, closable, onClose }) => {
                      const info = worksheetControls.find(o => o.controlId === value);
                      const isDel = !fastFilters.find(item => item.controlId === value) || !info;
                      return (
                        <span
                          className={cx('itemT InlineBlock mRight4', { Red: isDel })}
                          onMouseDown={event => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                        >
                          {!isDel ? info.controlName : _l('已删除')}
                          {closable && <Icon icon="close" className="Hand mLeft3" onClick={onClose} />}
                        </span>
                      );
                    }}
                    value={requiredControlIds}
                    onChange={data => {
                      updateAdvancedSettingWithEitAdKeys({
                        requiredcids: JSON.stringify(data),
                      });
                    }}
                    allowClear
                    showPopupSearch
                    optionFilterProp="label"
                    options={requiredControlOptions}
                  />
                )}
              </React.Fragment>
            </div>
          )}
          <div className="mTop15 flexRow alignItemsCenter">
            <Checkbox
              className="checkBox"
              checked={clicksearch === '1'}
              onChange={() => {
                updateAdvancedSettingWithEitAdKeys({
                  clicksearch: clicksearch !== '1' ? '1' : '0',
                });
              }}
            >
              {_l('在执行查询后显示数据')}
            </Checkbox>

            <Tooltip placement="bottom" title={_l('勾选后，进入视图初始不显示数据，查询后显示符合筛选条件的数据。')}>
              <div className="iconWrap pointer">
                <Icon icon="help " className="textTertiary helpIcon Font18" />
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
          <p className="text textSecondary">{_l('将字段作为快速筛选器显示在视图顶部，以帮助用户快速查找记录。')}</p>
          {renderFastFilterCon()}
        </div>
      )}
    </Wrap>
  );
}
