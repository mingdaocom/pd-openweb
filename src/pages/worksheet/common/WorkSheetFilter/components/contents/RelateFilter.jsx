import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes, { string } from 'prop-types';
import 'selectize';
import { Icon, Tooltip } from 'ming-ui';
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

  onChangeFn = (data, isRelate) => {
    const { dynamicSource = {}, onChange } = this.props;
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
        <Tooltip text={<span>{_l('ID: %0', item.cid)}</span>} popupPlacement="bottom">
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
            ? _l('选择当前表单字段')
            : _.map(dynamicSource, (item, i) => {
                // 当前记录
                if (item.rcid !== 'parent') {
                  let nameList = _.find(currentColumns, v => item.cid === v.controlId);
                  return this.renderName(item, nameList, i);
                } else {
                  //主记录
                  let nameList = _.find(this.props.globalSheetControls, v => item.cid === v.controlId);
                  return this.renderName(item, nameList, i, true);
                }
              })}
          <Icon icon={'expand_more'} className="Gray_9e moreIntro Font16" />
        </div>
        {this.state.showUl && (
          <RelateBox
            showUl={this.state.showUl}
            keywords={this.state.keywords}
            columns={currentColumns}
            onChangeFn={this.onChangeFn}
            relateSheetList={relateSheetList}
            conditionType={conditionType}
            control={control}
            defaultValue={type}
            sourceControlId={sourceControlId}
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
