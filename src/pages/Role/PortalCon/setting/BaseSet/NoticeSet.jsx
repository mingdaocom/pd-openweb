import React from 'react';
import { useSetState } from 'react-use';
import { Icon } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import WorkflowDialog from 'src/pages/workflow/components/WorkflowDialog';
import { SwitchStyle } from './style';

let ajaxRequest = null;

export default function (props) {
  const { admin, exAccountSmsNotice, epDiscussWorkFlow, portalSetModel, onChangePortalSet, appId } = props;
  const { noticeScope = {} } = portalSetModel;
  const [{ showWorkflowDialog }, setCommonState] = useSetState({ showWorkflowDialog: false });
  const createWorkFlow = callback => {
    if (ajaxRequest) {
      ajaxRequest.abort();
    }
    ajaxRequest = externalPortalAjax.createEPDiscussWorkFlow({
      appId,
    });
    ajaxRequest.then(res => {
      const { portalSet = {} } = props;
      const { portalSetModel = {} } = portalSet;
      const { noticeScope = {} } = portalSetModel;
      onChangePortalSet({
        portalSetModel: {
          ...portalSetModel,
          noticeScope: { ...noticeScope, discussionNotice: true },
        },
        epDiscussWorkFlow: res,
      });
      callback && callback(res);
    });
  };
  return (
    <>
      <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('通知设置')}</h6>
      <div className="mTop12">
        <SwitchStyle>
          <Icon
            icon={admin ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  noticeScope: { ...noticeScope, admin: !admin },
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
            {_l('新用户注册、激活时通知管理员')}
          </div>
        </SwitchStyle>
      </div>
      <div className="mTop5">
        <SwitchStyle>
          <Icon
            icon={exAccountSmsNotice ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  noticeScope: { ...noticeScope, exAccountSmsNotice: !exAccountSmsNotice },
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
            {_l('审核结果短信通知外部用户')}
          </div>
        </SwitchStyle>
      </div>
      <div className="mTop5">
        <SwitchStyle>
          <Icon
            icon={noticeScope.discussionNotice ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              //开启
              if (!noticeScope.discussionNotice && !epDiscussWorkFlow.workFlowId) {
                createWorkFlow();
              } else {
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    noticeScope: { ...noticeScope, discussionNotice: !noticeScope.discussionNotice },
                  },
                });
              }
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
            <div>{_l('有讨论消息时（被提到、被回复）通知外部用户')}</div>
          </div>
          <div className="Gray_9e Font12" style={{ marginLeft: 44, marginTop: -5 }}>
            {_l('消息通过短信、邮件、服务号消息发送给外部用户')}
          </div>
        </SwitchStyle>
      </div>
      {noticeScope.discussionNotice && (
        <div className="exAccountSendCon flexRow Font13 mTop5" style={{ marginLeft: 44 }}>
          {epDiscussWorkFlow.workFlowName && (
            <span className="flex">
              {epDiscussWorkFlow.workFlowName}
              {!epDiscussWorkFlow.isEnable && <span className="Font13 mLeft5 Red">{_l('未启用')}</span>}
            </span>
          )}
          <span
            className="ThemHoverColor3 editFlow Hand"
            onClick={() => {
              if (!epDiscussWorkFlow.workFlowId) {
                createWorkFlow(() => {
                  setCommonState({ showWorkflowDialog: true });
                });
              } else {
                setCommonState({ showWorkflowDialog: true });
              }
            }}
          >
            {_l('编辑工作流')}
          </span>
        </div>
      )}
      {showWorkflowDialog && (
        <WorkflowDialog
          flowId={epDiscussWorkFlow.workFlowId}
          onBack={value => {
            setCommonState({ showWorkflowDialog: false });
            onChangePortalSet({
              epDiscussWorkFlow: { ...epDiscussWorkFlow, isEnable: value },
            });
          }}
        />
      )}
    </>
  );
}
