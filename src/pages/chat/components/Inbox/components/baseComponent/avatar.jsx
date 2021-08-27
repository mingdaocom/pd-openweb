import React from 'react';
import { MSGTYPES } from '../../constants';
import { applicationIcon } from 'src/util';

import cx from 'classnames';
import 'mdBusinessCard';

const formatUser = function (props) {
  const { accountId, fullname, avatar, inboxType, appId } = props;
  // 系统消息 应用类型
  let applicationType = '';

  switch (inboxType) {
    case MSGTYPES.SystemMessage:
      applicationType = 'system';
      break;
    case MSGTYPES.CalendarMessage:
      applicationType = 'calendar';
      break;
    case MSGTYPES.TaskMessage:
    case MSGTYPES.FolderMessage:
      applicationType = 'task';
      break;
    case MSGTYPES.KCMessage:
      applicationType = 'knowledge';
      break;
    case MSGTYPES.ApprovalMessage:
      applicationType = 'approval';
      break;
    case MSGTYPES.AttendanceMessage:
      applicationType = 'check';
      break;
    case MSGTYPES.DossierMessage:
      applicationType = 'dossier';
      break;
    case MSGTYPES.WorkSheetMessage:
      applicationType = 'worksheet';
      break;
    case MSGTYPES.WorkFlowMessage:
      applicationType = 'workflow';
      break;
    default:
      break;
  }
  return {
    accountId,
    fullname,
    avatar,
    applicationType,
  };
};

let date = null;

export default class Avatar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      binded: false,
      ...formatUser(props),
    };
  }

  bindBusinessCard() {
    if (this.state.binded || !this.card) return false;

    this.setState({
      binded: true,
    });
    $(this.card)
      .mdBusinessCard({
        accountId: this.state.accountId,
      })
      .trigger('mouseenter');
  }

  componentWillUnMount() {
    if (this.card) {
      $(this.carad).mdBusinessCard('destroy');
    }
  }

  render() {
    const { accountId, fullname, avatar, applicationType } = this.state;

    if (applicationType) {
      return (
        <span
          className={cx('ThemeColor2 msgIcon', { calendar: applicationType === 'calendar ' })}
          data-date={date || (date = new Date().getDate())}
          dangerouslySetInnerHTML={{ __html: applicationIcon(applicationType, 'small') }}
        />
      );
    } else {
      return (
        <a
          href={'/user_' + accountId}
          target="_blank"
          className="inboxAvatar"
          onMouseOver={this.bindBusinessCard.bind(this)}
          ref={elem => {
            this.card = elem;
          }}
        >
          <img src={avatar} title={fullname} />
        </a>
      );
    }
  }
}
