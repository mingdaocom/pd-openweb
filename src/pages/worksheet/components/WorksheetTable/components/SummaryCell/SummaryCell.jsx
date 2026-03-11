import React from 'react';
import cx from 'classnames';
import _, { includes } from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { Menu, MenuItem } from 'ming-ui';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { emitter } from 'src/utils/common';
import { getSummaryInfo } from 'src/utils/record';
import SummaryContent from './SummaryContent';
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

  handleChange = value => {
    const { control, changeWorksheetSheetViewSummaryType } = this.props;
    this.setState({
      menuVisible: false,
    });
    changeWorksheetSheetViewSummaryType({ controlId: control.controlId, value });
  };

  renderMenu() {
    const { control } = this.props;
    let type = includes([29, 34], control.type) ? control.type : control.sourceControlType || control.type;
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

  hideMenu = () => {
    this.setState({ menuVisible: false });
  };

  render() {
    const {
      disabled,
      isChildTableSummaryCell,
      className,
      isGroupTitle,
      noBackground,
      control,
      summaryType,
      summaryValue,
      rowHeadOnlyNum,
      rows,
      selectedIds,
      allWorksheetIsSelected,
    } = this.props;
    const style = { ...(this.props.style || {}) };
    if (!isGroupTitle) {
      style.height = 28 + 'px';
      style.lineHeight = 28 + 'px';
    }
    const { menuVisible } = this.state;
    if (!control) {
      return (
        <div
          style={{
            ...style,
            backgroundColor: noBackground ? 'transparent' : 'var(--color-background-secondary)',
          }}
          className={cx(className, 'sheetSummaryInfo noRightBorder')}
        />
      );
    }
    let type = control.sourceControlType || control.type;
    if (_.includes([10010, 33, 45, 47], type) || (control.type === 30 && control.strDefault === '10')) {
      return <div className={cx('sheetSummaryInfo withBackground disabled', className)} style={style} />;
    }
    if (type === 'summaryhead') {
      return (
        <div
          className={cx('summaryCellHead noRightBorder', className)}
          style={{ ...style, padding: rowHeadOnlyNum ? '0 12px' : '0 24px 0 40px' }}
        >
          =
        </div>
      );
    }
    // 公式类型按照数值统计
    if (type === 31 || (control.type === 37 && control.enumDefault2 === 6)) {
      type = 6;
    }
    return (
      <ClickAwayable
        className={cx('sheetSummaryInfo ellipsis', className, {
          withBackground: !isGroupTitle && !noBackground,
          'cell groupTitleSummary': isGroupTitle,
          disabled,
        })}
        onClickAwayExceptions={['.summaryCellMenu']}
        style={style}
        onClick={() => {
          if (disabled) {
            return;
          }
          this.setState({ menuVisible: true });
        }}
        onClickAway={() => this.setState({ menuVisible: false })}
      >
        <Trigger
          style={style}
          action={['click']}
          popupVisible={!disabled && menuVisible}
          popupClassName={'summaryCellMenu'}
          popup={this.renderMenu()}
          popupAlign={{
            points: ['bl', 'tl'],
            offset: [0, 0],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          }}
          onPopupVisibleChange={newVisible => {
            if (newVisible) {
              this.addListener();
            }
          }}
        >
          <SummaryContent
            isChildTableSummaryCell={isChildTableSummaryCell}
            disabled={disabled}
            control={control}
            type={type}
            summaryType={summaryType}
            summaryValue={summaryValue}
            rows={rows}
            selectedIds={selectedIds}
            allWorksheetIsSelected={allWorksheetIsSelected}
          />
        </Trigger>
      </ClickAwayable>
    );
  }
}
