import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { DEFAULT_COLUMNS } from '../../enum';
import RelateBox from './RelateBox';

export default class RelateFilter extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    values: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
  };
  static defaultProps = {
    values: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      keywords: '',
      showUl: false,
    };
  }

  onChangeFn = data => {
    const { onChange } = this.props;
    this.setState({
      keywords: '',
      showUl: false,
    });
    onChange({
      dynamicSource: [
        {
          cid: data.cid || '',
          rcid: data.rcid || '',
          staticValue: '',
        },
      ],
      isDynamicsource: true,
    });
  };

  remove = num => {
    const { dynamicSource = {}, onChange } = this.props;
    const dy = dynamicSource.filter((u, i) => i !== num);
    onChange({
      dynamicSource: [...dy],
      isDynamicsource: true,
    });
  };

  renderName = (item, nameList, i, isParent) => {
    if (!nameList) {
      return (
        <Tooltip title={_l('ID: %0', item.cid)} placement="bottom">
          <span className="isWrong">{_l('该字段已删除')}</span>
        </Tooltip>
      );
    }
    return (
      <span>
        {nameList.controlName}
        {isParent && <i>{_l('主记录')}</i>}
        <i
          className="icon-delete icon"
          onClick={e => {
            e.stopPropagation();
            this.remove(i);
          }}
        />
      </span>
    );
  };

  render() {
    const {
      disabled,
      currentColumns = [],
      dynamicSource = {},
      relateSheetList = [],
      conditionType,
      control,
      type,
      sourceControlId,
      from,
      showCustom,
      widgetControlData,
    } = this.props;
    return (
      <div className={cx('worksheetFilterRelateCondition', { disabled })}>
        <div
          className={cx('inputText', { focusInput: this.state.showUl })}
          onClick={() => {
            this.setState({
              showUl: true,
            });
          }}
        >
          {!dynamicSource.length || dynamicSource.length <= 0
            ? _.includes(['fastFilter'], from)
              ? _l('选择已添加的筛选项')
              : _l('选择当前表单字段')
            : _.map(dynamicSource, (item, i) => {
                if (showCustom && _.includes(['rowid', 'currenttime', 'user-self'], item.cid)) {
                  return this.renderName(
                    item,
                    {
                      controlName: _.get(
                        _.find(DEFAULT_COLUMNS, d => d.controlId === item.cid),
                        'controlName',
                      ),
                    },
                    i,
                  );
                }
                // 当前记录
                if (!_.includes(['parent', 'fastFilter', 'navGroup'], item.rcid)) {
                  let nameList = _.find(currentColumns, v => item.cid === v.controlId);
                  return this.renderName(item, nameList, i);
                } else {
                  //主记录
                  let nameList = _.find(this.props.globalSheetControls, v => item.cid === v.controlId);
                  return this.renderName(item, nameList, i, _.includes(['parent'], item.rcid));
                }
              })}
          <Icon icon={'expand_more'} className="Gray_9e moreIntro Font16" />
        </div>
        {this.state.showUl && (
          <RelateBox
            from={from}
            showUl={this.state.showUl}
            keywords={this.state.keywords}
            columns={currentColumns}
            onChangeFn={this.onChangeFn}
            relateSheetList={relateSheetList}
            conditionType={conditionType}
            control={control}
            defaultValue={type}
            sourceControlId={sourceControlId}
            showCustom={showCustom}
            widgetControlData={widgetControlData}
            setKeys={keywords => {
              this.setState({
                keywords,
              });
            }}
            onClickAwayExceptions={['dynamicSource']}
            onClickAway={() => {
              this.setState({ showUl: false, keywords: '' });
            }}
            globalSheetControls={this.props.globalSheetControls} // globalSheetControls 主记录Controls
          />
        )}
      </div>
    );
  }
}
