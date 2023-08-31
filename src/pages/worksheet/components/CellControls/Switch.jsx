/**
 * 工作表控件-Checkbox
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Checkbox, Switch as SwitchComponent, RadioGroup, Tooltip } from 'ming-ui';
import { autobind } from 'core-decorators';
import { FROM } from './enum';
import { getSwitchItemNames } from 'src/pages/widgetConfig/util';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

export default class Switch extends React.Component {
  static propTypes = {
    from: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.shape({}),
    updateCell: PropTypes.func,
    cell: PropTypes.shape({ value: PropTypes.string }),
    onClick: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value === '1' || props.cell.value === 1,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: nextProps.cell.value === '1' });
    }
  }

  @autobind
  handleTableKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        this.handleChange(!!this.state.value);
        break;
      default:
        break;
    }
  }

  @autobind
  handleChange(checked) {
    const { updateCell } = this.props;
    this.setState(
      {
        value: !checked,
      },
      () => {
        updateCell({
          value: checked ? '0' : '1',
        });
      },
    );
  }

  renderContent() {
    const { value } = this.state;
    const {
      cell: { advancedSetting = {}, hint = '' },
      editable,
    } = this.props;
    const checkedValue = value ? '1' : '0';
    const showtype = advancedSetting.showtype;
    const itemnames = getSwitchItemNames(this.props.cell);

    if (showtype === '1') {
      const text = value ? _.get(itemnames[0], 'value') : _.get(itemnames[1], 'value');
      return (
        <Fragment>
          <SwitchComponent
            disabled={!editable}
            checked={value}
            className={cx('InlineBlock', { mobileFormSwitchDisabled: !editable })}
            onClick={this.handleChange}
          />
          {text && <span className="mLeft6">{text}</span>}
        </Fragment>
      );
    }

    if (showtype === '2') {
      return (
        <RadioGroup
          size="middle"
          disabled={!editable}
          className="InlineBlock"
          checkedValue={checkedValue}
          data={itemnames.map(item => ({ text: item.value, value: item.key }))}
          onChange={type => this.handleChange(type !== '1')}
        />
      );
    }

    return (
      <Tooltip text={<span>{hint}</span>} popupPlacement="bottom" disable={!hint}>
        <div className="flexCenter">
          <Checkbox className="InlineBlock" disabled={!editable} checked={value} onClick={this.handleChange} />
        </div>
      </Tooltip>
    );
  }

  render() {
    const {
      className,
      recordId,
      style,
      from,
      mode,
      cell: { advancedSetting = {} },
      onClick,
    } = this.props;
    const isMobile = browserIsMobile();
    const forPortal = mode === 'portal';
    // 视图卡片（radio显示文案）|| (移动端或者外部门户只显示checkbox)
    if (
      (from === FROM.CARD && advancedSetting.showtype === '2') ||
      ((isMobile || forPortal) && _.includes(['1', '2'], advancedSetting.showtype))
    ) {
      const checkedValue = this.state.value ? '1' : '0';
      const formatNames = getSwitchItemNames(this.props.cell, { needDefault: true });
      const currentName =
        _.get(
          _.find(formatNames, i => i.key === checkedValue),
          'value',
        ) || '';
      return (
        (isMobile ? <span className="overflow_ellipsis InlineBlock w100">{currentName}</span> : currentName) || (
          <div className="emptyTag"></div>
        )
      );
    }
    return (
      <div className={cx('cellSwitch cellControl', className)} style={style} onClick={onClick}>
        <div
          className="InlineBlock"
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {recordId !== 'empty' && this.renderContent()}
        </div>
      </div>
    );
  }
}
