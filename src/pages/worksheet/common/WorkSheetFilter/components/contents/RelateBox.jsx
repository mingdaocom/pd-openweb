import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes, { string } from 'prop-types';
import { Icon } from 'ming-ui';
import '@mdfe/selectize';
import { relateDy } from 'src/pages/worksheet/common/WorkSheetFilter/util.js';
import { getIconByType } from 'src/pages/widgetConfig/util';
import withClickAway from 'ming-ui/decorators/withClickAway';
import _ from 'lodash';
import { DEFAULT_COLUMNS } from '../../enum';

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

  renderCustom = (data, id) => {
    const { onChangeFn } = this.props;
    let showData = _.find(data, i => i.controlId === id);
    if (!showData) return null;

    return (
      <ul className={cx({ customSelectUl: id === 'rowid' })}>
        {_.map([showData], (item, i) =>
          this.renderLi(item, -1, () => {
            onChangeFn({ ...item, cid: item.controlId, rcid: '' }, true);
          }),
        )}
      </ul>
    );
  };

  render() {
    const {
      relateSheetList = [],
      columns,
      showUl,
      onChangeFn,
      keywords,
      setKeys,
      conditionType,
      control,
      defaultValue,
      sourceControlId = '',
      globalSheetControls = [], // globalSheetControls 主记录Controls
      from,
      showCustom,
    } = this.props;
    // 自定义动态筛选值(此刻、记录id)
    let customColums = showCustom ? DEFAULT_COLUMNS : [];
    let customData = !keywords
      ? customColums
      : _.filter(listColumn, o => o.controlName.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0);
    //符合动态筛选值规则的本表控件
    let listColumn = relateDy(conditionType, columns, control, defaultValue);
    let columnsData = !keywords
      ? listColumn
      : _.filter(listColumn, o => o.controlName.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0);
    //符合动态筛选值规则主表控件
    let listglobalSheetColumn = relateDy(conditionType, globalSheetControls, control, defaultValue);
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
                  {showCustom && _.includes([15, 16, 46], control.type) && this.renderCustom(customData, 'currenttime')}
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
                  {showCustom && _.includes([2], control.type) && this.renderCustom(customData, 'rowid')}
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
