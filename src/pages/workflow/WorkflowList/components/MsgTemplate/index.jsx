import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { func } from 'prop-types';
import { Checkbox, Dialog, Icon, ScrollView } from 'ming-ui';
import EmptyStatus from '../../components/Empty';
import './index.less';

export default class MsgTemplate extends Component {
  static propTypes = {
    closeLayer: func,
  };
  static defaultProps = {
    closeLayer: () => {},
  };
  constructor(props) {
    super(props);
    this.state = {
      messageTemplateIds: [],
      data: [],
      pageIndex: 1,
      pageSize: 20,
      haveMoreData: true,
    };
  }
  componentDidMount() {
    this.getData();
    this.pending = true;
  }
  /**
   * 获取数据
   */
  getData = () => {
    const { companyId, api } = this.props;
    let { data, pageIndex, pageSize, haveMoreData, isAsc, sortId } = this.state;
    const para = { companyId, pageIndex, pageSize, isAsc, sortId };
    if (haveMoreData && !this.pending) {
      api(para).then(res => {
        this.pending = false;
        data = pageIndex === 1 ? res : data.concat(res);
        this.setState({
          data,
          pageIndex: pageIndex + 1,
        });

        if (res.length < pageSize) {
          this.setState({ haveMoreData: false });
        }
      });
    }
  };

  /**
   * 滚动加载数据
   */
  handleScroll = () => {
    const { haveMoreData } = this.state;
    if (haveMoreData) {
      this.getData();
      this.pending = true;
    }
  };

  handleSorter = params => {
    const { pageIndex, isAsc, sortId } = params;
    this.setState(
      {
        pageIndex,
        isAsc,
        sortId,
      },
      () => {
        this.getData();
        this.pending = false;
      },
    );
  };

  handleDelete = messageTemplateIds => {
    const { deleteSMSTemplate } = this.props;
    let { data = [] } = this.state;
    deleteSMSTemplate({
      messageTemplateIds,
    }).then(res => {
      if (res) {
        let result = data.filter(item => !_.includes(messageTemplateIds, item.id));
        this.setState({ data: result });
        alert(_l('删除成功'));
      } else {
        alert(_l('删除失败'), 2);
      }
    });
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
        _this.handleDelete(messageTemplateIds);
        this.setState({ messageTemplateIds: [] });
      },
    });
  };
  render() {
    const { closeLayer } = this.props;
    let { messageTemplateIds = [], isAsc, data } = this.state;
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
                <div className="type">{_l('类型')}</div>
                <div
                  className={cx('msgTemplateCreateTime', { theneColor: !_.isUndefined(isAsc) })}
                  onClick={() => {
                    let val = _.isUndefined(isAsc) ? true : isAsc === true ? false : undefined;
                    this.setState({ isAsc: val }, () => {
                      this.handleSorter({
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
              <ScrollView className="workflowMsgTemplateScrollView" onScrollEnd={this.handleScroll}>
                {data.map((template, index) => {
                  const { companySignature, messageContent, createDate, type } = template;
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
                      <div className="type">
                        {type === 2 ? _l('营销推广') : type === 3 ? _l('金融交易') : _l('行业通知')}
                      </div>
                      <div className="msgTemplateCreateTime">{createDate}</div>
                    </li>
                  );
                })}
              </ScrollView>
            </ul>
          ) : (
            <EmptyStatus icon="forum" explain={_l('还没有短信模版')} className="workflowMsgTemplateEmpty">
              <div className="moreTips Gray_75 mTop12">{_l('短信模版可在编辑短信节点时创建')}</div>
            </EmptyStatus>
          )}
        </Dialog>
      </div>
    );
  }
}
