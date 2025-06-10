import React from 'react';
import { useSetState } from 'react-use';
import { Checkbox, InputNumber, Modal, Tooltip } from 'antd';
import cx from 'classnames';
import _, { get } from 'lodash';
import styled from 'styled-components';
import { Button, Dropdown, Icon } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import worksheetAjax from 'src/api/worksheet';
import { WORKSHEET_ALLOW_SET_ALIGN_CONTROLS } from 'worksheet/constants/enum';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget.js';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { sortControls } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { controlIsNumber } from 'src/utils/control';
import { getSummaryInfo } from 'src/utils/record';
import BatchShowtypeDrop from './BatchShowtypeDrop';

const WrapCon = styled.div`
  overflow: auto;
  max-height: ${(window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight) - 232}px;
  .headerCon {
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
  }
`;
const Wrap = styled.div`
  .liInput {
    width: 110px;
    margin-left: 8px;
    .ant-input-number-handler-wrap {
      display: none;
    }
    .liInputPx {
      top: 7px;
      right: 12px;
    }
    .isText {
      &.ming.Dropdown.disabled,
      .dropdownTrigger.disabled {
        border-radius: 4px;
      }
      &.ming.Dropdown .Dropdown--border,
      .dropdownTrigger .Dropdown--border {
        border-color: #f5f5f5;
        border-radius: 4px;
        overflow: hidden;
      }
      .icon-arrow-down-border {
        display: none;
      }
    }
  }
  .operate {
    width .Dropdown--input {
      width: 20px;
    }
  }
`;

export const showTypeData = [
  { value: 1, text: _l('纯文本') },
  { value: 0, text: _l('标签') },
  { value: 2, text: _l('进度') },
  { value: 3, text: _l('单元格背景色') },
  { value: 4, text: _l('正方形') },
  { value: 5, text: _l('圆形') },
  { value: 6, text: _l('自适应') },
];

export const directionData = [
  { value: 0, text: _l('左对齐') },
  { value: 1, text: _l('居中') },
  { value: 2, text: _l('右对齐') },
];

const getListstyle = (a, b) => {
  const time1 = _.get(safeParse(a), 'time') || 0;
  const time2 = _.get(safeParse(b), 'time') || 0;
  return { styles: (safeParse(time1 > time2 ? a : b) || {}).styles, applyToAll: time2 > time1 };
};

export default function BatchSetDialog(props) {
  const {
    columns,
    view = {},
    currentSheetInfo,
    onClose,
    visible,
    worksheetId,
    appId,
    updateCurrentView = () => {},
    updateWorksheetInfo = () => {},
    onStyleChange = () => {},
  } = props;
  const liststyle = getListstyle(
    _.get(view, 'advancedSetting.liststyle'),
    _.get(currentSheetInfo, 'advancedSetting.liststyle'),
  );

  const { showControls = [] } = view;
  const isTreeTableView = view.viewType === 2 && get(view, 'advancedSetting.hierarchyViewType') === '3';
  const list = sortControls(
    columns.filter(c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49, 51, 52], c.type)),
  );

  const showList =
    showControls.length <= 0
      ? list.filter(
          o => !ALL_SYS.includes(o.controlId) || (_.get(view, 'advancedSetting.sysids') || []).includes(o.controlId),
        )
      : list
          .filter(o => showControls.includes(o.controlId))
          .sort((a, b) => {
            const indexA = showControls.indexOf(a.controlId);
            const indexB = showControls.indexOf(b.controlId);
            return indexA - indexB;
          });
  const hideList = list.filter(o => !showList.map(o => o.controlId).includes(o.controlId));
  const [{ applyToAll, state, styles, loading }, setState] = useSetState({
    applyToAll: !!_.get(liststyle, 'applyToAll'),
    state: { isOpenShow: true, isOpenHide: false },
    styles:
      _.get(liststyle, 'styles') ||
      list
        .map(o => {
          const sheetcolumnwidths = safeParse(_.get(view, 'advancedSetting.sheetcolumnwidths'));
          if (sheetcolumnwidths[o.controlId]) {
            return { cid: o.controlId, width: sheetcolumnwidths[o.controlId] };
          }
        })
        .filter(o => !!o),
    loading: false,
  });

  const changeValue = data => {
    if (!styles.find(o => o.cid === data.cid)) {
      setState({
        styles: styles.concat(data),
      });
      return;
    }
    const newStyles = styles.map(o => {
      if (data.cid === o.cid) {
        return { ...o, ...data };
      } else {
        return o;
      }
    });
    onStyleChange(newStyles);
    setState({
      styles: newStyles,
    });
  };

  const canSetDirection = o => {
    return (
      WORKSHEET_ALLOW_SET_ALIGN_CONTROLS.includes(o.type === 30 ? o.sourceControlType : o.type) ||
      ['ctime', 'utime'].includes(o.controlId)
    );
  };

  const renderList = type => {
    const list = type === 'Show' ? showList : hideList;
    return (
      <React.Fragment>
        {type !== 'Show' && (
          <div
            className={cx('Bold Hand ThemeHoverColor3', { mTop20: type !== 'Show' })}
            onClick={() =>
              setState({
                state: {
                  ...state,
                  [`isOpen${type}`]: !state[`isOpen${type}`],
                },
              })
            }
          >
            <Icon type={state[`isOpen${type}`] ? 'arrow-down' : 'arrow-right-tip'} className={'Gray_75'} />
            <span className="mLeft5">
              {_l('隐藏')} {list.length || ''}
            </span>
          </div>
        )}
        {state[`isOpen${type}`] && (
          <div className="list">
            {list.map(o => {
              const info = {
                direction: controlIsNumber(o) ? 2 : 0,
                ...(styles.find(a => a.cid === o.controlId) || {}),
              };
              const summaryInfo = getSummaryInfo(o.sourceControlType || o.type, o) || {};
              const directionDataConfig = canSetDirection(o)
                ? directionData
                : directionData.filter(o => [0, 1].includes(o.value));

              const hideReport =
                _.includes([10010, 33, 45, 47, 25], o.type) || (o.type === 30 && o.strDefault === '10');

              return (
                <div className="flexRow mTop8 alignItemsCenter">
                  <div className="flex flex-shrink-0 flexRow alignItemsCenter">
                    <Icon type={getIconByType(o.type)} className="Gray_75 flex-shrink-0" />
                    <span className="mLeft5 WordBreak overflow_ellipsis flex" title={o.controlName}>
                      {o.controlName}
                    </span>
                  </div>
                  <Wrap className="flexRow alignItemsCenter justifyContentRight flex-shrink-0">
                    <div className="liInput">
                      {/* 单选，附件 */}
                      {[9, 11, 14].includes(o.type === 30 ? o.sourceControlType : o.type) && (
                        <BatchShowtypeDrop
                          border
                          placeholder={_l('样式')}
                          menuStyle={{ width: 'auto', 'min-width': '110px' }}
                          className="flex w100"
                          info={info}
                          control={o}
                          data={showTypeData.filter(a =>
                            (o.type === 30 ? o.sourceControlType : o.type) === 14
                              ? [4, 5, 6].includes(a.value)
                              : ![4, 5, 6].includes(a.value),
                          )}
                          changeValue={changeValue}
                        />
                      )}
                    </div>
                    <div className="liInput">
                      {/* // 文本、电话、数值、金额、邮件、日期、日期时间、时间、证件、地区、自动编号、检查框、公式、文本组合、等级、创建时间、最近修改时间、汇总、定位、级联选择、他表字段（根据关联的字段判断是否支持对齐） */}
                      <Dropdown
                        border
                        isAppendToBody
                        className={'flex w100'}
                        menuStyle={{ width: 'auto', 'min-width': '110px' }}
                        value={info.direction}
                        data={directionDataConfig}
                        renderItem={item => {
                          return (
                            <div>
                              {item.text}
                              {item.value === 1 && !canSetDirection(o) && (
                                <span className="Alpha7 Font12">({_l('仅字段名称')})</span>
                              )}
                            </div>
                          );
                        }}
                        onChange={value => {
                          changeValue({
                            ...info,
                            cid: o.controlId,
                            direction: value,
                          });
                        }}
                      />
                    </div>
                    <div className="liInput Relative">
                      <InputNumber
                        type="number"
                        className="w100"
                        value={Math.round(info.width) || ([1, 2].includes(o.type) && o.attribute === 1 ? 350 : 150)}
                        onChange={width => {
                          changeValue({
                            ...info,
                            cid: o.controlId,
                            width,
                          });
                        }}
                        max={1000}
                        min={20}
                      />
                      <span className="Absolute Gray_9e liInputPx">px</span>
                    </div>
                    {!isTreeTableView && (
                      <div className="liInput">
                        <Dropdown
                          border
                          cancelAble
                          disabled={hideReport}
                          placeholder={_l('统计')}
                          isAppendToBody
                          className="flex w100"
                          value={info.report}
                          data={(summaryInfo.list || [])
                            .map(a => {
                              return { ...a, text: (a || {}).label || '' };
                            })
                            .filter(o => !!o.value)}
                          onChange={value => {
                            changeValue({
                              ...info,
                              cid: o.controlId,
                              report: value,
                            });
                          }}
                        />
                      </div>
                    )}
                  </Wrap>
                </div>
              );
            })}
          </div>
        )}
      </React.Fragment>
    );
  };

  const onSave = () => {
    if (loading) return;
    setState({ loading: true });
    const liststyle = JSON.stringify({ time: Date.now(), styles });
    const data = {
      advancedSetting: { liststyle },
      editAdKeys: ['liststyle'],
    };
    if (applyToAll) {
      worksheetAjax.editWorksheetSetting({ worksheetId, appId, ...data }).then(res => {
        updateWorksheetInfo({
          advancedSetting: { ..._.get(currentSheetInfo, 'advancedSetting'), liststyle },
        });
        setState({ loading: false });
        onClose();
      });
    } else {
      updateCurrentView({ ...view, editAttrs: ['advancedSetting'], ...data });
      setState({ loading: false });
      onClose();
    }
  };

  const onChangeBatchDirection = data => {
    const allList = [...showList, ...hideList];
    let batchStyles = [];
    allList.map(o => {
      let direction = data;
      if ('sys' === direction || (2 === direction && !canSetDirection(o))) {
        direction = controlIsNumber(o) ? 2 : 0;
      }
      const info = styles.find(a => o.controlId === a.cid);
      batchStyles = batchStyles.concat({ ...info, cid: o.controlId, direction });
    });
    setState({
      styles: batchStyles,
    });
  };

  return (
    <Modal
      title="编辑列样式"
      visible={visible}
      onCancel={onClose}
      centered={true}
      width={720}
      footer={[
        <div className="flexRow alignItemsCenter pTop6 pBottom6 pLeft8 pRight8">
          <div className="flex flexRow alignItemsCenter justifyContentLeft">
            <Checkbox checked={applyToAll} onChange={() => setState({ applyToAll: !applyToAll })}>
              {_l('同时应用到其它所有表格')}
            </Checkbox>
          </div>
          <Button type="link" onClick={onClose}>
            {_l('取消')}
          </Button>
          <Button type="primary" disabled={loading} onClick={onSave}>
            {_l('保存')}
          </Button>
        </div>,
      ]}
    >
      <div className="flexColumn">
        <WrapCon className="flex w100">
          <div className="headerCon flexRow alignItemsCenter Gray_75 Bold Font13">
            <div className="flex">
              <span className="WordBreak">{_l('字段')}</span>
            </div>
            <Wrap className="flexRow alignItemsCenter justifyContentRight">
              <div className="liInput">
                <span className="">{_l('样式')}</span>
              </div>
              <div className="liInput flexRow alignItemsCenter">
                <span className="flex">{_l('对齐')}</span>
                <Dropdown
                  isAppendToBody
                  menuStyle={{ width: 180 }}
                  points={['tl', 'bl']}
                  offset={[-75, 0]}
                  className="operate"
                  data={[
                    {
                      value: 'sys',
                      text: (
                        <Tooltip title={_l('数值类型的字段右对齐，其他字段左对齐')} zIndex="10000" placement="left">
                          {_l('系统默认')}
                        </Tooltip>
                      ),
                    },
                    ...directionData,
                  ]}
                  onChange={onChangeBatchDirection}
                  renderPointer={() => {
                    return (
                      <Tooltip title={_l('批量设置')}>
                        <Icon className={'operateBtn Font18'} icon="align_setting" />
                      </Tooltip>
                    );
                  }}
                />
              </div>
              <div className="liInput">
                <span className="">{_l('列宽')}</span>
              </div>
              {!isTreeTableView && (
                <div className="liInput">
                  <span className="">{_l('统计')}</span>
                </div>
              )}
            </Wrap>
          </div>
          {renderList('Show')}
          {renderList('Hide')}
        </WrapCon>
      </div>
    </Modal>
  );
}

export const renderBatchSetDialog = props => functionWrap(BatchSetDialog, props);
