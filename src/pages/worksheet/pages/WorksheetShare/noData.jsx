import React from 'react';
import cx from 'classnames';
import './noData.less';

class EmptyCon extends React.Component {
  render() {
    return (
      <div className="emptyCon">
        <div className={cx('TxtCenter', {})}>
          <i className="iconBox mBottom12" />
          <span className="Gray_9e Block mBottom20 TxtCenter Font17 Gray_9e">
            {this.props.str ? this.props.str : _l('暂未添加记录')}
          </span>
        </div>
      </div>
    );
  }
}

export default EmptyCon;
