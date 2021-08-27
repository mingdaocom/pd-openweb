/**
 * 工作表控件-关联他表
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import RecordInfoWrapper from '../../common/recordInfo/RecordInfoWrapper';
import { renderCellText } from '../../components/CellControls';
import { browserIsMobile } from 'src/util';

class RelateWorksheet extends Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    cell: PropTypes.shape({}),
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      activeRecordId: undefined,
    };
  }
  render() {
    const { cell, style, className } = this.props;
    const { activeRecordId } = this.state;
    const { value, dataSource, appId, viewId } = cell;
    const isMobile = browserIsMobile();
    let relateWorksheetData;
    if (cell.enumDefault === 1) {
      try {
        relateWorksheetData = JSON.parse(value);
      } catch (err) {
        relateWorksheetData = [];
      }
      if (!_.isArray(relateWorksheetData)) {
        relateWorksheetData = [];
      }
    }

    let content;
    if (cell.enumDefault === 1 && cell.type !== 34) {
      content = relateWorksheetData.slice(0, 6).map((record, index) => (
        <span
          className="cellRelateWorksheetRecord ThemeHoverColor3 ellipsis"
          key={index}
          onClick={evt => {
            if (isMobile) {
              return;
            }
            this.setState({ activeRecordId: record.sid });
            evt.stopPropagation();
          }}
        >
          <i className="icon icon-link-worksheet"></i>
          {renderCellText(Object.assign({}, cell, { type: cell.sourceControlType, value: record.name === '未命名' ? '' : record.name })) || _l('未命名')}
        </span>
      ));
    } else {
      content =
        !value || value === '0' ? (
          ''
        ) : (
          <span className="cellRelateWorksheetRecord mutiple">
            <i className="icon icon-link-worksheet"></i>
            {(value + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </span>
        );
    }

    return (
      <div className={cx('cellRelateWorksheets cellOptions cellControl', className)} style={style} onClick={this.props.onClick}>
        {activeRecordId && (
          <RecordInfoWrapper
            appId={appId}
            viewId={viewId}
            from={2}
            visible={!!activeRecordId}
            recordId={activeRecordId}
            worksheetId={dataSource}
            hideRecordInfo={() => {
              this.setState({ activeRecordId: undefined });
            }}
          />
        )}
        {content}
      </div>
    );
  }
}

export default RelateWorksheet;
