import React from 'react';
import { mdNotification } from 'ming-ui/functions';

export default function Notification() {
  return (
    <div>
      <button
        onClick={() => {
          // success 成功， error 失败， warning 警告， info 通知
          mdNotification.success({
            title: '这是标题', // 卡片标题
            description: '这是内容', // 卡片描述
            duration: null, // 单位为秒，为null时永不消失
            btnList: [
              // 按钮列表显按数组顺序从右向左显示
              {
                text: '前往查看',
                className: 'btn_btn',
                onClick: () => {
                  alert(1);
                },
              },
              {
                text: '邀请微信好友加入日称',
                className: 'btn_btn',
                onClick: () => {
                  alert(12);
                },
              },
            ],
            onClose: () => {
              alert('关闭了');
            },
          });
        }}
      >
        按钮测试
      </button>
      <button
        onClick={() => {
          mdNotification.success('this is success');
        }}
      >
        success
      </button>
      <button
        onClick={() => {
          mdNotification.error('this is error');
        }}
      >
        error
      </button>
      <button
        onClick={() => {
          mdNotification.warning('this is warning');
        }}
      >
        warning
      </button>
      <button
        onClick={() => {
          mdNotification.info({
            title: 'this is info',
            duration: null,
            description: '这是内容',
            btnList: [
              {
                text: '下载',
                className: 'btn_btn',
                onClick: () => {
                  alert(1);
                },
              },
            ],
          });
        }}
      >
        info
      </button>
      <button
        onClick={() => {
          mdNotification.success({
            title: 'this is success success',
            duration: null,
            description: '这是内容  success',
          });
        }}
      >
        not hide success
      </button>
      {/* <br />
      <button
        onClick={() => {
          const props = {
            themeColor: 'error',
            header: <div>{_l('连接失败，请重新刷新页面')}</div>,
            footer: (
              <div
                className="ThemeColor3"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  location.reload();
                }}
              >
                {_l('刷新')}
              </div>
            ),
          };
          notification.open({
            description: <NotificationContent {...props} />,
            key: 'connectedError' + Math.random(),
            duration: 5,
            maxCount: 3,
          });
        }}
      >
        rc notification
      </button> */}
    </div>
  );
}
// import { notification, NotificationContent } from 'ming-ui/components/Notification';
