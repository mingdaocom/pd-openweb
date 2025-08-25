import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { ROW_ID_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { relateDy } from 'src/pages/worksheet/common/WorkSheetFilter/util.js';
import { isSheetDisplay } from '../../../../../widgetConfig/util';
import { API_ENUM_TO_TYPE, DEFAULT_COLUMNS, FILTER_CONDITION_TYPE } from '../../enum';

@withClickAway
export default class RelateBox extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    values: PropTypes.arrayOf(PropTypes.string),
  };
  static defaultProps = {
    values: [],
  };

  renderLi = (item, i, onChangeFn) => {
    return (
      <React.Fragment>
        {item.isNavGroup && i !== 0 && <div className="BorderTopGrayC"></div>}
        <li className={cx('controlLi overflow_ellipsis WordBreak', {})} key={i} onClick={onChangeFn}>
          <Icon icon={getIconByType(item.type)} className={cx('controlIcon mRight5 Font16')} />
          {item.controlName}
        </li>
      </React.Fragment>
    );
  };

  renderCustom = (data, type, isTop) => {
    const id = _.includes([2, 15, 16, 26, 46], type)
      ? _.get(
          _.find(DEFAULT_COLUMNS, d => d.type === type),
          'controlId',
        )
      : '';
    if (!id || (isTop && _.includes(['rowid'], id)) || (!isTop && !_.includes(['rowid'], id))) return null;
    const { onChangeFn } = this.props;
    let showData = _.find(data, i => i.controlId === id);
    if (!showData) return null;

    return (
      <ul className={cx({ customSelectUl: !isTop })}>
        {_.map([showData], item =>
          this.renderLi(item, -1, () => {
            onChangeFn({ ...item, cid: item.controlId, rcid: '' }, true);
          }),
        )}
      </ul>
    );
  };

  // 符合动态值的本表字段异化，关联记录筛选用
  filterDynamicControls = isGlobal => {
    const {
      conditionType,
      columns,
      globalSheetControls,
      control,
      defaultValue,
      widgetControlData = {},
      from,
    } = this.props;
    const dynamicControls = isGlobal ? globalSheetControls : columns;
    let avaControls = relateDy(conditionType, dynamicControls, control, defaultValue);
    const { globalSheetId, dataSource, controlId } = widgetControlData;

    if (isGlobal && _.isUndefined(globalSheetControls)) return avaControls;
    // 记录id能反选到关联本表的关联记录
    if (
      control.controlId === 'rowid' &&
      from === 'relateSheet' &&
      _.includes([FILTER_CONDITION_TYPE.EQ, FILTER_CONDITION_TYPE.NE], defaultValue)
    ) {
      avaControls = avaControls.concat(
        _.filter(
          dynamicControls,
          items =>
            _.includes([29, 51], items.type) &&
            items.dataSource === dataSource &&
            items.controlId !== controlId &&
            (widgetControlData.isSubList ? !isSheetDisplay(items) : true),
        ),
      );
    }
    // 关联记录字段关联本表，支持rowid
    if (
      from === 'relateSheet' &&
      conditionType === API_ENUM_TO_TYPE.RELATESHEET &&
      globalSheetId &&
      control.dataSource === globalSheetId
    ) {
      avaControls = avaControls.concat(ROW_ID_CONTROL);
    }
    return avaControls;
  };

  render() {
    const {
      showUl,
      onChangeFn,
      keywords,
      setKeys,
      control,
      sourceControlId = '',
      globalSheetControls = [], // globalSheetControls 主记录Controls
      from,
      showCustom,
    } = this.props;
    // 自定义动态筛选值(此刻、记录id、当前用户)，只有业务规则支持当前用户，其他暂不支持
    let customColums = showCustom
      ? from === 'rule'
        ? DEFAULT_COLUMNS
        : DEFAULT_COLUMNS.filter(d => !_.includes(['user-self'], d.controlId))
      : [];
    let customData = !keywords
      ? customColums
      : _.filter(listColumn, o => o.controlName.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0);
    //符合动态筛选值规则的本表控件
    let listColumn = this.filterDynamicControls();
    let columnsData = !keywords
      ? listColumn
      : _.filter(listColumn, o => o.controlName.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0);
    //符合动态筛选值规则主表控件
    let listglobalSheetColumn = this.filterDynamicControls(true);
    let globalSheetControlsData = !keywords
      ? listglobalSheetColumn
      : _.filter(
          listglobalSheetColumn,
          o => o.controlName.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0,
        );

    const showResult =
      listColumn.length > 0 || listglobalSheetColumn.length > 0 || (showCustom && customColums.length > 0);
    const searchResult =
      columnsData.length <= 0 && globalSheetControlsData.length <= 0 && (showCustom ? customData.length <= 0 : true);
    return (
      <React.Fragment>
        {showUl && (
          <div className="selectBox">
            {showResult ? (
              <React.Fragment>
                <div className="searchInput">
                  <Icon icon={'h5_search'} className="Gray_9e searchIcon Font16" />
                  <input
                    type="text"
                    className=""
                    placeholder={_l('搜索字段')}
                    value={keywords}
                    onChange={e => {
                      setKeys(e.target.value);
                    }}
                  />
                </div>
                <div className="selectBoxCom">
                  {searchResult && (
                    <div className="pTop20 pBottom20 LineHeight80 TxtCenter Gray_9e">{_l('暂无搜索结果')}</div>
                  )}
                  {showCustom && this.renderCustom(customData, control.type, true)}
                  {columnsData.length > 0 && !_.includes(['fastFilter'], from) && (
                    <ul>
                      <p>{globalSheetControls.length <= 0 ? _l('当前表单') : _l('当前子表记录')}</p>
                      {_.map(columnsData, (item, i) =>
                        this.renderLi(item, i, () => {
                          onChangeFn({ ...item, cid: item.controlId, rcid: sourceControlId }, true);
                        }),
                      )}
                    </ul>
                  )}
                  {globalSheetControlsData.length > 0 && (
                    <ul>
                      {_.includes(['fastFilter'], from) ? '' : <p className="">{_l('当前表单')}</p>}
                      {_.map(globalSheetControlsData, (item, i) =>
                        this.renderLi(item, i, () => {
                          onChangeFn(
                            {
                              ...item,
                              rcid: _.includes(['fastFilter'], from)
                                ? item.isNavGroup
                                  ? 'navGroup'
                                  : 'fastFilter'
                                : 'parent',
                              cid: item.controlId,
                            },
                            true,
                          );
                        }),
                      )}
                    </ul>
                  )}
                  {showCustom && this.renderCustom(customData, control.type)}
                </div>
              </React.Fragment>
            ) : (
              <div className="LineHeight40 pLeft10 Gray_9e">{_l('没有可选字段')}</div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}
