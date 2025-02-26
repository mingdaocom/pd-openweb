import React from 'react';
import { config } from '../config';
import cx from 'classnames';
import { APPLICATION_ICON } from 'src/util/enum';

export default function Apps(props) {
  const { forbidSuites } = md.global.SysSettings;
  return (
    <div className="contacts-apps">
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'worksheet' });
        }}
      >
        <span className="contacts-apps-icon">
          <span className={cx(APPLICATION_ICON['worksheet'], 'circle large')} />
        </span>
        <span className="Font14">{_l('应用')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'workflow' });
        }}
      >
        <span className="contacts-apps-icon">
          <span className={cx(APPLICATION_ICON['workflow'], 'circle large')} />
        </span>
        <span className="Font14">{_l('工作流')}</span>
      </div>
      {!forbidSuites.includes('1') && (
        <div
          className="contacts-apps-item"
          onClick={() => {
            config.callback({ type: 'post' });
          }}
        >
          <span className="contacts-apps-icon">
            <span className={cx(APPLICATION_ICON['post'], 'circle large')} />
          </span>
          <span className="Font14">{_l('动态')}</span>
        </div>
      )}
      {!forbidSuites.includes('2') && (
        <div
          className="contacts-apps-item"
          onClick={() => {
            config.callback({ type: 'task' });
          }}
        >
          <span className="contacts-apps-icon">
            <span className={cx(APPLICATION_ICON['task'], 'circle large')} />
          </span>
          <span className="Font14">{_l('任务')}</span>
        </div>
      )}
      {!forbidSuites.includes('3') && (
        <div
          className="contacts-apps-item"
          onClick={() => {
            config.callback({ type: 'calendar' });
          }}
        >
          <span className="contacts-apps-icon">
            <span className={cx(APPLICATION_ICON['calendar'], 'circle large')} />
          </span>
          <span className="Font14">{_l('日程')}</span>
        </div>
      )}
      {!forbidSuites.includes('4') && (
        <div
          className="contacts-apps-item"
          onClick={() => {
            config.callback({ type: 'knowledge' });
          }}
        >
          <span className="contacts-apps-icon">
            <span className={cx(APPLICATION_ICON['knowledge'], 'circle large')} />
          </span>
          <span className="Font14">{_l('知识')}</span>
        </div>
      )}
      {!forbidSuites.includes('5') && (
        <div
          className="contacts-apps-item"
          onClick={() => {
            config.callback({ type: 'hr' });
          }}
        >
          <span className="contacts-apps-icon">
            <span className={cx(APPLICATION_ICON['hr'], 'circle large')} />
          </span>
          <span className="Font14">{_l('人事')}</span>
        </div>
      )}
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'system' });
        }}
      >
        <span className="contacts-apps-icon">
          <span className={cx(APPLICATION_ICON['system'], 'circle large')} />
        </span>
        <span className="Font14">{_l('系统')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'file-transfer' });
        }}
      >
        <span className="contacts-apps-icon">
          <span className={cx(APPLICATION_ICON['uploadhelper'], 'circle large')} />
        </span>
        <span className="Font14">{_l('文件传输助手')}</span>
      </div>
    </div>
  );
}
