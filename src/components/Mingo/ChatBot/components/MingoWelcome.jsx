import React, { useState } from 'react';
import cx from 'classnames';
import { get, isEmpty } from 'lodash';
import { match } from 'path-to-regexp';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useGlobalStore } from 'src/common/GlobalStore';
import mingoHead from 'src/pages/chat/containers/ChatList/Mingo/images/mingo.png';
import { getUserRole } from 'src/pages/worksheet/redux/actions/util';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import { emitter } from 'src/utils/common';
import setIconIcon from '../../assets/ai_creare_icon.svg';
import createRecordIcon from '../../assets/ai_create_date.svg';
import appendDataIcon from '../../assets/ai_padding_data.svg';
import worksheetIcon from '../../assets/table_c.svg';
import { getTitleOfTaskType } from '../../modules';
import { MINGO_TASK_TYPE } from '../enum';

const urlParams = match('/app/:appId/:groupId?/:worksheetId?/:viewId?');

const MingoWelcomeWrap = styled.div`
  padding: 0 16px;
  overflow-y: auto;
  > .content {
    height: 100%;
    min-height: 420px;
  }
  .mongoHead {
    width: 105px;
    height: 105px;
    border-radius: 50%;
    background: url(${mingoHead}) no-repeat center center;
    background-size: 100% 100%;
    border: 1px solid #eaeaea;
  }
  .hello {
    margin: 12px 0 5px;
    font-size: 30px;
    font-weight: bold;
  }
  .description {
    font-size: 16px;
    color: #757575;
  }
  .aiTasksTitle {
    margin: 26px 0 8px;
    font-size: 14px;
    color: #757575;
  }
  .aiTasks {
    .aiTask {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 15px;
      color: #151515;
      padding: 0 10px;
      height: 48px;
      border-radius: 6px;
      border: 1px solid #eaeaea;
      margin-bottom: 12px;
      .taskIconCon {
        margin-right: 10px;
        width: 25px;
        display: flex;
        justify-content: center;
      }
      .taskIcon {
        max-width: 25px;
        max-height: 25px;
        &.isSetIcon {
          max-width: 21px;
          max-height: 21px;
        }
      }
      &.disabled {
        background: #f5f5f5;
      }
      &:not(.disabled) {
        cursor: pointer;
        &:hover {
          border-color: var(--color-border-hover);
          background: var(--color-background-hover);
        }
      }
    }
  }
`;

const AI_TASKS = [
  {
    name: getTitleOfTaskType(MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT),
    icon: worksheetIcon,
    type: MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT,
  },
  {
    name: getTitleOfTaskType(MINGO_TASK_TYPE.CREATE_WORKSHEET_DATA_ASSIGNMENT),
    icon: appendDataIcon,
    type: MINGO_TASK_TYPE.CREATE_WORKSHEET_DATA_ASSIGNMENT,
  },
  {
    name: getTitleOfTaskType(MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT),
    icon: createRecordIcon,
    type: MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT,
  },
];

function getHello() {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 6) {
    return _l('深夜了，注意休息🌙');
  } else if (hour >= 6 && hour < 9) {
    return _l('早上好🌅');
  } else if (hour >= 9 && hour < 12) {
    return _l('上午好🌞');
  } else if (hour >= 12 && hour < 14) {
    return _l('中午好☀️');
  } else if (hour >= 14 && hour < 19) {
    return _l('下午好🌤️');
  } else if (hour >= 19 && hour < 23) {
    return _l('晚上好🌛');
  } else {
    return _l('夜深了，早点休息哦✨');
  }
}

function checkIsCharge(appInfo) {
  const { permissionType, isLock } = appInfo;
  return canEditApp(permissionType, isLock);
}

export default function MingoWelcome({ loading, onStartTask = () => {} }) {
  const {
    store: { appInfo, activeWorksheet },
  } = useGlobalStore();
  const appId = urlParams(location.pathname)?.params?.appId || '';
  const [appLoading, setAppLoading] = useState(false);
  const isCharge = appInfo?.id === appId ? checkIsCharge(appInfo) : false;
  const { isOwner, isAdmin, isRunner, isDeveloper } = getUserRole(appInfo?.permissionType);
  const isManager = isOwner || isDeveloper || isRunner || isAdmin;

  const hiddenTypes = cx({
    [MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT]: !appId || !isCharge || !isManager,
    [MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT]:
      !appId || !get(activeWorksheet, 'allowAdd') || !get(activeWorksheet, 'template.controls').length,
    [MINGO_TASK_TYPE.CREATE_WORKSHEET_DATA_ASSIGNMENT]:
      !appId || !get(activeWorksheet, 'allowAdd') || !isManager || !get(activeWorksheet, 'template.controls').length,
  });
  const visibleTasks = AI_TASKS.filter(aiTask => !hiddenTypes.includes(aiTask.type));
  if (appLoading) {
    return <MingoWelcomeWrap className="t-flex-1" />;
  }
  return (
    <MingoWelcomeWrap className="t-flex-1">
      <div className="t-flex t-flex-col t-items-center t-justify-center content">
        <div className="mongoHead"></div>
        <div className="hello">{getHello()}</div>
        {!isEmpty(visibleTasks) && (
          <div className="w100 mTop10">
            <div className="aiTasksTitle">{_l('我可以帮助您')}</div>
            <div className="aiTasks">
              {!loading &&
                visibleTasks.map((aiTask, i) => (
                  <div
                    className={cx('aiTask', {
                      disabled: aiTask.disabled,
                    })}
                    key={i}
                    onMouseDown={() => {
                      if (aiTask.type === MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT) {
                        localStorage.removeItem(
                          `MINGO_CACHE_CREATE_WORKSHEET_BOT_${get(md, 'global.Account.accountId')}`,
                        );
                      }
                      onStartTask(aiTask);
                      if (!window.mingoFixing) {
                        window.mingoPendingStartTask = aiTask;
                        emitter.emit('SET_MINGO_FIXED');
                      }
                    }}
                  >
                    <div className="flexRow valignWrapper">
                      <div className="taskIconCon">
                        <img
                          className={cx('taskIcon', { isSetIcon: aiTask.icon === setIconIcon })}
                          src={aiTask.icon}
                          alt=""
                        />
                      </div>
                      {aiTask.name}
                    </div>
                    {aiTask.disabled && <span className="Gray_bd">{_l('规划中...')}</span>}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </MingoWelcomeWrap>
  );
}

MingoWelcome.propTypes = {
  taskType: PropTypes.number.isRequired,
  onStartTask: PropTypes.func.isRequired,
};
