import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { autobind } from 'core-decorators';
import { emitter, getSummaryNameByType, getSummaryInfo, controlIsNumber } from 'worksheet/util';
import { Menu, MenuItem } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import './SummaryCell.less';
const ClickAwayable = createDecoratedComponent(withClickAway); //

export default class extends React.Component {
  static propTypes = {
    style: PropTypes.shape({}),
    control: PropTypes.shape({}),
    summaryType: PropTypes.number,
    summaryValue: PropTypes.number,
    changeWorksheetSheetViewSummaryType: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      menuVisible: false,
    };
  }

  componentWillUnmount() {
    if (this.added) {
      emitter.removeListener('MDTABLE_SCROLL', this.hideMenu);
    }
  }

  addListener() {
    if (!this.added) {
      this.added = true;
      emitter.addListener('MDTABLE_SCROLL', this.hideMenu);
    }
  }

  @autobind
  handleChange(value) {
    const { control, changeWorksheetSheetViewSummaryType } = this.props;
    this.setState({
      menuVisible: false,
    });
    changeWorksheetSheetViewSummaryType({ controlId: control.controlId, value });
  }

  renderMenu() {
    const { control } = this.props;
    let type = control.sourceControlType || control.type;
    const summaryInfo = getSummaryInfo(type, control);
    return (
      <Menu>
        <div className="title">{_l('选择统计方式')}</div>
        {summaryInfo.list.map((item, index) =>
          item ? (
            <MenuItem
              key={index}
              onClick={e => {
                e.stopPropagation();
                this.handleChange(item.value);
              }}
            >
              {item.label}
            </MenuItem>
          ) : (
            <hr key={index} />
          ),
        )}
      </Menu>
    );
  }

  @autobind
  hideMenu() {
    this.setState({ menuVisible: false });
  }

  render() {
    const { style, control, summaryType, summaryValue } = this.props;
    const { menuVisible } = this.state;
    if (!control) {
      return <div style={style} />;
    }
    let type = control.sourceControlType || control.type;
    if (type === 10010 || type === 33) {
      return <div className="sheetSummaryInfo disabled" style={style} />;
    }
    if (type === 'summaryhead') {
      return (
        <div className="summaryCellHead" style={style}>
          {_l('统计')}
        </div>
      );
    }
    // 公式类型按照数值统计
    if (type === 31 || (control.type === 37 && control.enumDefault2 === 6)) {
      type = 6;
    }
    let summaryName, summaryDataValue;
    if (summaryType) {
      summaryName = getSummaryNameByType(summaryType);
      if (!_.isUndefined(summaryValue)) {
        summaryDataValue = summaryValue;
        if (_.includes([3, 4, 5, 6], summaryType)) {
          summaryDataValue = String(_.round(summaryValue, control.dot).toFixed(control.dot));
          const reg = summaryDataValue.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
          summaryDataValue = summaryDataValue.replace(reg, '$1,');
        }
      }
    }
    const isNumber = controlIsNumber(control);
    return (
      <ClickAwayable
        className="sheetSummaryInfo ellipsis"
        onClickAwayExceptions={['.summaryCellMenu']}
        style={style}
        onClick={() => {
          this.setState({ menuVisible: true });
        }}
        onClickAway={() => this.setState({ menuVisible: false })}
      >
        <Trigger
          style={style}
          action={['click']}
          popupVisible={menuVisible}
          popupClassName={'summaryCellMenu'}
          popup={this.renderMenu()}
          popupAlign={{
            points: ['bl', 'tl'],
            offset: [0, 0],
          }}
          onPopupVisibleChange={newVisible => {
            if (newVisible) {
              this.addListener();
            }
          }}
        >
          <div
            className={cx('flexRow', {
              hide: type === 25,
              empty: !summaryType,
            })}
          >
            <span className="summaryName">{summaryName + _l('：')}</span>
            {isNumber && <div className="flex"></div>}
            <div className="summaryValue" title={summaryDataValue}>
              {typeof summaryDataValue === 'undefined' || summaryType === 0 ? '-' : summaryDataValue}
            </div>
            {!isNumber && <div className="flex"></div>}
            <i className="iconArrow icon icon-arrow-down-border"></i>
          </div>
        </Trigger>
      </ClickAwayable>
    );
  }
}
