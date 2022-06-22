import React from 'react';
import cx from 'classnames';
import './index.less';

export default function UserMenu() {
  const feedVisible = !md.global.SysSettings.forbidSuites.includes('1');
  const taskVisible = !md.global.SysSettings.forbidSuites.includes('2');
  const calendarVisible = !md.global.SysSettings.forbidSuites.includes('3');
  const knowledgeVisible = !md.global.SysSettings.forbidSuites.includes('4');
  return (
    <div className="commonTopBarMenu Relative">
      <ul>
        {
          feedVisible && (
            <li
              onClick={() => {
                require(['s'], s => {
                  s();
                });
              }}
              className="ThemeBGColor3"
            >
              <i className="icon icon-edit Font14" />
              {_l('创建动态')}
            </li>
          )
        }
        {
          taskVisible && (
            <li
              onClick={() => {
                require(['t'], t => {
                  t();
                });
              }}
              className="ThemeBGColor3"
            >
              <i className="icon icon-task-responsible" />
              {_l('创建任务')}
            </li>
          )
        }
        {
          calendarVisible && (
            <li
              onClick={() => {
                require(['c'], c => {
                  c();
                });
              }}
              className="ThemeBGColor3"
            >
              <i className="icon icon-bellSchedule" />
              {_l('创建日程')}
            </li>
          )
        }
        {
          knowledgeVisible && (
            <li
              onClick={() => {
                require(['u'], u => {
                  u();
                });
              }}
              className="ThemeBGColor3"
            >
              <i className="icon icon-knowledge-cloud" />
              {_l('上传文件')}
            </li>
          )
        }
      </ul>
      <ul className={cx({'BorderTopGrayC mTop5 pTop5': feedVisible || taskVisible || calendarVisible || knowledgeVisible})}>
        <li
          onClick={() => {
            require(['src/components/invite'], invite => {
              invite();
            });
          }}
          className="inviteMember ThemeBGColor3"
        >
          <i className="icon icon-invite" />
          {_l('邀请')}
        </li>
        <li
          onClick={() => {
            require(['src/components/group/create/creatGroup'], CreatGroup => {
              CreatGroup.createInit({});
            });
          }}
          className="linkCreateGroup ThemeBGColor3"
        >
          <i className="icon icon-group" />
          {_l('群组')}
        </li>
      </ul>
    </div>
  );
}
