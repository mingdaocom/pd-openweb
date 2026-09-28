import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Button } from 'ming-ui/antd-components';

export default class CalendarAction extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    confirm: PropTypes.func.isRequired,
    refuse: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
    isResponding: PropTypes.bool,
    isRefuseDialogOpen: PropTypes.bool,
  };

  render() {
    const { type, save, cancel, confirm, refuse, isSaving, isResponding, isRefuseDialogOpen } = this.props;
    return (
      <div className={cx('calendarAction action-bar-active clearfix', `${type}Calendar`)}>
        <div className="calendarActionWrapper">
          {type === 'update' ? (
            <span className="actionHint">{_l('日程内容已更改')}</span>
          ) : (
            <span className="actionHint">{_l('邀请您参加此日程')}</span>
          )}
          {(() => {
            switch (type) {
              case 'update':
                return (
                  <div className="Right">
                    <Button
                      color="primary"
                      variant="link"
                      className="calendarActionLink textWhite mRight15"
                      disabled={isSaving}
                      onClick={cancel}
                    >
                      {_l('取消')}
                    </Button>
                    <Button
                      color="primary"
                      variant="outlined"
                      className="mRight20 ghostBtn"
                      loading={isSaving}
                      onClick={save}
                    >
                      {_l('更新')}
                    </Button>
                  </div>
                );
              case 'confirm':
                return (
                  <div className="Right">
                    <Button
                      color="primary"
                      variant="link"
                      className="calendarActionLink textWhite mRight15"
                      disabled={isResponding || isRefuseDialogOpen}
                      onClick={refuse}
                    >
                      {_l('不能参加')}
                    </Button>
                    <Button
                      color="primary"
                      variant="outlined"
                      className="mRight20 ghostBtn"
                      loading={isResponding}
                      disabled={isRefuseDialogOpen}
                      onClick={confirm}
                    >
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
