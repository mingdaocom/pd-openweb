import React, { Component, Fragment } from 'react';
import { func, shape, arrayOf, string } from 'prop-types';
import Dialog from 'ming-ui/components/Dialog';
import ScrollView from 'ming-ui/components/ScrollView';
import dialogContentDisplay from 'ming-ui/decorators/dialogContentDisplay';
import StatusIcon from '../../components/StatusIcon';
import EmptyStatus from '../../components/Empty';
import './index.less';

@dialogContentDisplay
export default class MsgTemplate extends Component {
  static propTypes = {
    closeLayer: func,
    handleScroll: func,
    data: arrayOf(
      shape({
        crateDate: string,
        messageContent: string,
        id: string,
        cratedBy: string,
      })
    ),
  };
  static defaultProps = {
    closeLayer: () => {},
    handleScroll: () => {},
  };
  render() {
    const { closeLayer, data, handleScroll } = this.props;
    return (
      <div className="workflowMsgTemplateDialogWrap">
        <Dialog title={_l('短信模版')} className="workflowMsgTemplateDialog" visible footer={null} onCancel={closeLayer}>
          {data.length ? (
            <ul>
              <li className="header">
                <div className="content flex">{_l('短信内容')}</div>
                <div className="status">{_l('审核状态')}</div>
                <div className="msgTemplateCreateTime">{_l('创建时间')}</div>
              </li>
              <ScrollView className="workflowMsgTemplateScrollView" style={{ height: 600 }} updateEvent={handleScroll}>
                {data.map((template, index) => {
                  const { companySignature, messageContent, status, createDate } = template;
                  return (
                    <li key={index} className="templates">
                      <div className="content flex">
                        [{companySignature}] {messageContent}
                      </div>
                      <div className="status">
                        <StatusIcon status={status} />
                      </div>
                      <div className="msgTemplateCreateTime">{createDate}</div>
                    </li>
                  );
                })}
              </ScrollView>
            </ul>
          ) : (
            <EmptyStatus icon="workflow_sms" explain={_l('还没有短信模版')} className="workflowMsgTemplateEmpty">
              <div className="moreTips Gray_9e mTop12">{_l('短信模版可在编辑短信节点时创建')}</div>
            </EmptyStatus>
          )}
        </Dialog>
      </div>
    );
  }
}
