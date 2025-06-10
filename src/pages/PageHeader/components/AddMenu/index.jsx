import React from 'react';
import cx from 'classnames';
import addFriends from 'src/components/addFriends';
import createCalendar from 'src/components/createCalendar/createCalendar';
import createTask from 'src/components/createTask/createTask';
import createFeed from 'src/pages/feed/components/createFeed';
import createGroup from 'src/pages/Group/createGroup';
import './index.less';

export default function UserMenu({ onClose = () => {} }) {
  const feedVisible = !md.global.SysSettings.forbidSuites.includes('1');
  const taskVisible = !md.global.SysSettings.forbidSuites.includes('2');
  const calendarVisible = !md.global.SysSettings.forbidSuites.includes('3');
  const knowledgeVisible = !md.global.SysSettings.forbidSuites.includes('4');

  return (
    <div className="commonTopBarMenu Relative Normal" onClick={onClose}>
      <ul>
        {feedVisible && (
          <li onClick={() => createFeed()} className="ThemeBGColor3">
            <i className="icon icon-edit Font14" />
            {_l('创建动态')}
          </li>
        )}
        {taskVisible && (
          <li onClick={() => createTask()} className="ThemeBGColor3">
            <i className="icon icon-task-responsible" />
            {_l('创建任务')}
          </li>
        )}
        {calendarVisible && (
          <li onClick={() => createCalendar()} className="ThemeBGColor3">
            <i className="icon icon-bellSchedule" />
            {_l('创建日程')}
          </li>
        )}
        {knowledgeVisible && (
          <li onClick={() => window.open('/apps/kcupload')} className="ThemeBGColor3">
            <i className="icon icon-knowledge-cloud" />
            {_l('上传文件')}
          </li>
        )}
      </ul>
      <ul
        className={cx({
          'BorderTopGrayC mTop5 pTop5': feedVisible || taskVisible || calendarVisible || knowledgeVisible,
        })}
      >
        <li onClick={() => addFriends({ selectProject: true })} className="inviteMember ThemeBGColor3">
          <i className="icon icon-invite" />
          {_l('邀请')}
        </li>
        <li onClick={() => createGroup({})} className="linkCreateGroup ThemeBGColor3">
          <i className="icon icon-group" />
          {_l('群组')}
        </li>
      </ul>
    </div>
  );
}
