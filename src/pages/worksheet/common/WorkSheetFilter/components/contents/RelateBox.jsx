import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes, { string } from 'prop-types';
import { Icon } from 'ming-ui';
import '@mdfe/selectize';
import { relateDy } from 'src/pages/worksheet/common/WorkSheetFilter/util.js';
import { getIconByType } from 'src/pages/widgetConfig/util';
import withClickAway from 'ming-ui/decorators/withClickAway';
import _ from 'lodash';

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
      <li className={cx('controlLi overflow_ellipsis WordBreak', {})} key={i} onClick={onChangeFn}>
        <Icon icon={getIconByType(item.type)} className={cx('controlIcon mRight5 Font16')} />
        {item.controlName}
      </li>
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
    } = this.props;
    //符合动态筛选值规则的本表控件
    let listColumn = relateDy(conditionType, columns, control, defaultValue);
    let columnsData = !keywords ? listColumn : _.filter(listColumn, o => o.controlName.indexOf(keywords) >= 0);
    //符合动态筛选值规则主表控件
    let listglobalSheetColumn = relateDy(conditionType, globalSheetControls, control, defaultValue);
    let globalSheetControlsData = !keywords
      ? listglobalSheetColumn
      : _.filter(listglobalSheetColumn, o => o.controlName.indexOf(keywords) >= 0);
    return (
      <React.Fragment>
        {showUl && (
          <div className="selectBox">
            {listColumn.length > 0 || listglobalSheetColumn.length > 0 ? (
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
                  {columnsData.length <= 0 && globalSheetControlsData.length <= 0 && (
                    <div className="pTop20 pBottom20 LineHeight80 TxtCenter Gray_9e">{_l('暂无搜索结果')}</div>
                  )}
                  {columnsData.length > 0 && (
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
                      {<p className="">{_l('主记录')}</p>}
                      {_.map(globalSheetControlsData, (item, i) =>
                        this.renderLi(item, i, () => {
                          onChangeFn({ ...item, rcid: 'parent', cid: item.controlId }, true);
                        }),
                      )}
                    </ul>
                  )}
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
