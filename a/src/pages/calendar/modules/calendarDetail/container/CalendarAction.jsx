import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'ming-ui/components/Button';
import cx from 'classnames';

export default class CalendarAction extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    confirm: PropTypes.func.isRequired,
    refuse: PropTypes.func.isRequired,
  };

  componentDidAppear() {
    if (this.elem) $(this.elem).addClass('action-bar-active');
  }

  componentDidEnter() {
    // need at least one tick to fire transition
    setTimeout(() => {
      if (this.elem) $(this.elem).addClass('action-bar-active');
    }, 1);
  }

  componentWillLeave(callback) {
    if (this.elem) $(this.elem).removeClass('action-bar-active');
    setTimeout(callback, 300);
  }

  render() {
    const { type, save, cancel, confirm, refuse } = this.props;
    return (
      <div
        className={cx('calendarAction clearfix', `${type}Calendar`)}
        ref={elem => {
          this.elem = elem;
        }}
      >
        <div className="calendarActionWrapper">
          {type === 'update' ? <span className="actionHint">{_l('日程内容已更改')}</span> : <span className="actionHint">{_l('邀请您参加此日程')}</span>}
          {(() => {
            switch (type) {
              case 'update':
                return (
                  <div className="Right">
                    <Button type="link" size="small" className="White mRight15" onClick={cancel}>
                      {_l('取消')}
                    </Button>
                    <Button type="ghost" size="small" className="mRight20 ghostBtn" onClick={save}>
                      {_l('更新')}
                    </Button>
                  </div>
                );
              case 'confirm':
                return (
                  <div className="Right">
                    <Button className="White mRight15" size="small" type="link" onClick={refuse}>
                      {_l('不能参加')}
                    </Button>
                    <Button type="ghost" size="small" className="mRight20 ghostBtn" onClick={confirm}>
                      {_l('参加')}
                    </Button>
                  </div>
                );
            }
          })()}
        </div>
      </div>
    );
  }
}
