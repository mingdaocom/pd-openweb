import React from 'react';
import { applicationIcon } from 'src/util';
import { config } from '../config';

export default function Apps(props) {
  return (
    <div className="contacts-apps">
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'system' });
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: applicationIcon('system', 'large') }} className="contacts-apps-icon" />
        <span className="Font16">{_l('系统')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'post' });
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: applicationIcon('post', 'large') }} className="contacts-apps-icon" />
        <span className="Font16">{_l('动态')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'task' });
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: applicationIcon('task', 'large') }} className="contacts-apps-icon" />
        <span className="Font16">{_l('任务')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'worksheet' });
        }}
      >
        <span
          dangerouslySetInnerHTML={{ __html: applicationIcon('worksheet', 'large') }}
          className="contacts-apps-icon"
        />
        <span className="Font16">{_l('应用')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'calendar' });
        }}
      >
        <span
          dangerouslySetInnerHTML={{ __html: applicationIcon('calendar', 'large') }}
          className="contacts-apps-icon"
        />
        <span className="Font16">{_l('日程')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'knowledge' });
        }}
      >
        <span
          dangerouslySetInnerHTML={{ __html: applicationIcon('knowledge', 'large') }}
          className="contacts-apps-icon"
        />
        <span className="Font16">{_l('知识')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'hr' });
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: applicationIcon('hr', 'large') }} className="contacts-apps-icon" />
        <span className="Font16">{_l('人事')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'file-transfer' });
        }}
      >
        <span
          dangerouslySetInnerHTML={{ __html: applicationIcon('uploadhelper', 'large') }}
          className="contacts-apps-icon"
        />
        <span className="Font16">{_l('文件传输助手')}</span>
      </div>
      <div
        className="contacts-apps-item"
        onClick={() => {
          config.callback({ type: 'workflow' });
        }}
      >
        <span
          dangerouslySetInnerHTML={{ __html: applicationIcon('workflow', 'large') }}
          className="contacts-apps-icon"
        />
        <span className="Font16">{_l('工作流')}</span>
      </div>
    </div>
  );
}
