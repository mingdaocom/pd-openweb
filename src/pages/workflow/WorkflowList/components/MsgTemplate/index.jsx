import React, { Component, Fragment } from 'react';
import { func, shape, arrayOf, string } from 'prop-types';
import { Dialog, ScrollView, Checkbox, Icon } from 'ming-ui';
import dialogContentDisplay from 'ming-ui/decorators/dialogContentDisplay';
import StatusIcon from '../../components/StatusIcon';
import EmptyStatus from '../../components/Empty';
import flowNode from '../../../api/flowNode';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

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
      }),
    ),
  };
  static defaultProps = {
    closeLayer: () => {},
    handleScroll: () => {},
  };
  state = {
    messageTemplateIds: [],
  };
  delTemplate = () => {
    const _this = this;
    const { messageTemplateIds = [] } = this.state;
    Dialog.confirm({
      width: 550,
      title: _l('您确认删除模板?'),
      description: (
        <span className="Gray">
          {_l('删除后，工作流中新添加的短信节点将不能在选到此模板，之前已使用此模板的节点不受影响')}
        </span>
      ),
      onOk: () => {
        _this.props.handleDelete(messageTemplateIds);
        this.setState({ messageTemplateIds: [] });
      },
    });
  };
  render() {
    const { closeLayer, data, handleScroll } = this.props;
    let { messageTemplateIds = [], isAsc } = this.state;
    return (
      <div className="workflowMsgTemplateDialogWrap">
        <Dialog
          title={
            <div className="flexRow templateTitle">
              <div>{_l('短信模版')}</div>
              {!_.isEmpty(messageTemplateIds) && (
                <div className="actBox Font13">
                  <span className="mRight10">{_l('已选择%0个模板', messageTemplateIds.length)}</span>
                  <span className="del Hand" onClick={this.delTemplate}>
                    {_l('删除')}
                  </span>
                </div>
              )}
            </div>
          }
          className="workflowMsgTemplateDialog"
          visible
          footer={null}
          onCancel={closeLayer}
        >
          {data.length ? (
            <ul>
              <li className="header">
                <div className="content flex">{_l('短信内容')}</div>
                <div className="status">{_l('审核状态')}</div>
                <div
                  className={cx('msgTemplateCreateTime', { theneColor: !_.isUndefined(isAsc) })}
                  onClick={() => {
                    let val = _.isUndefined(isAsc) ? true : isAsc === true ? false : undefined;
                    this.setState({ isAsc: val }, () => {
                      this.props.handleSorter({
                        isAsc: val,
                        sortId: _.isUndefined(val) ? undefined : 'createDate',
                        pageIndex: 1,
                      });
                    });
                  }}
                >
                  {_l('创建时间')}
                  {(isAsc === true || isAsc === false) && (
                    <Icon icon={isAsc ? 'score-up' : 'score-down'} className="Gray_75" />
                  )}
                </div>
              </li>
              <ScrollView className="workflowMsgTemplateScrollView" updateEvent={handleScroll}>
                {data.map((template, index) => {
                  const { companySignature, messageContent, status, createDate } = template;
                  return (
                    <li key={index} className="templates">
                      <Checkbox
                        disabled={template.status === 0}
                        checked={_.includes(messageTemplateIds, template.id)}
                        onClick={checked => {
                          let copyCheckedIds = [...messageTemplateIds];
                          if (!checked) {
                            copyCheckedIds.push(template.id);
                          } else {
                            copyCheckedIds = copyCheckedIds.filter(item => item !== template.id);
                          }
                          this.setState({ messageTemplateIds: copyCheckedIds });
                        }}
                      />
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
