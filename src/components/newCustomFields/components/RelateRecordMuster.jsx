import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

export default class Widgets extends Component {
  static propTypes = {
    data: PropTypes.array,
    openRelateRecord: PropTypes.func,
  };

  render() {
    const { data, openRelateRecord } = this.props;

    return (
      <Fragment>
        <div style={{ background: '#f5f5f5', height: 10, margin: '0 -1000px', clear: 'both' }} />
        <ul className="customRecordMuster">
          {data.map((item, i) => {
            return (
              <li key={i}>
                <div className="customRecordList flexRow" onClick={() => openRelateRecord(item.controlId)}>
                  <div className="flex Gray_75 ellipsis">{item.controlName}</div>
                  <div className="ThemeColor3 mLeft15">{item.value || 0}</div>
                  <i className="icon-arrow-right-border Font16 Gray_bd mLeft5" style={{ marginRight: -5 }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Fragment>
    );
  }
}
