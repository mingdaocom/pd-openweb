import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class NoRecords extends React.PureComponent {
  static propTypes = {
    style: PropTypes.shape(),
    sheetIsFiltered: PropTypes.bool,
    text: PropTypes.bool,
    icon: PropTypes.element,
    allowAdd: PropTypes.bool,
    showNewRecord: PropTypes.func,
  };

  render() {
    const { style, sheetIsFiltered, allowAdd, showNewRecord, text, icon } = this.props;
    return (
      <div className="emptyCon" style={style}>
        <div
          className={cx('TxtCenter', {
            Hand: !(sheetIsFiltered || !allowAdd),
          })}
          onClick={() => {
            if (sheetIsFiltered || !allowAdd) {
              return;
            }
            showNewRecord();
          }}
        >
          {icon || <i className="iconBox mBottom12" />}
          <span className="Gray_9e Block mBottom20 TxtCenter Font17 Gray_9e">
            {text
              ? text
              : sheetIsFiltered
              ? _l('没有符合条件的记录')
              : allowAdd
              ? _l('暂未添加记录，点击创建')
              : _l('暂未添加记录')}
          </span>
        </div>
      </div>
    );
  }
}
