import React from 'react';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import Back from '../../components/Back';
import { Dialog, SpinLoading, ActionSheet, Input } from 'antd-mobile';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

class ApplyList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { params } = this.props.match;
    this.props.dispatch(actions.getAppApplyInfo({ appId: params.appId }));
    $('html').addClass('applyCon');
  }

  componentWillUnmount() {
    $('html').removeClass('applyCon');
    this.actionSheetHandler && this.actionSheetHandler.close();
  }

  showActionSheet = id => {
    const { applyList, roleList } = this.props.applyData;
    const { params } = this.props.match;
    this.actionSheetHandler = ActionSheet.show({
      actions: roleList.map(item => {
        return {
          key: item.roleId,
          text: (
            <span className="Bold">
              {_l('设为%0', item.name)}
            </span>
          )
        }
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('申请管理')}</span>
          <div className="closeIcon" onClick={() => this.actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        if (index < roleList.length) {
          this.props.dispatch(
            actions.editAppApplyStatus({
              ids: [id],
              appId: params.appId,
              status: 2,
              role: roleList[index],
              roleId: roleList[index].roleId,
            }),
          );
        }
        this.actionSheetHandler.close();
      }
    });
  };

  render() {
    const { applyData, isApplyLoading } = this.props;
    const { applyList, roleList } = applyData;
    const { params } = this.props.match;

    if (isApplyLoading) {
      return (
      <div className="flexRow justifyContentCenter alignItemsCenter h100">
        <SpinLoading color='primary' />
      </div>
      );
    }

    return (
      <React.Fragment>
        {applyList.length ? (
          <React.Fragment>
            {_.map(applyList, (item, i) => {
              return (
                <React.Fragment key={item.id}>
                  <div className="listApply pTop20 pLeft10 pRight10" key={item.id}>
                    <div className="flexRow">
                      <span className="Gray Font17 flex">{item.accountInfo.fullName}</span>
                      <div>
                        <span
                          className="InlineBlock toBeBtn rejectBtn"
                          onClick={() => {
                            Dialog.confirm({
                              title: _l('拒绝'),
                              content: (
                                <div className="TxtCenter">
                                  {_l('请填写拒绝的原因')}
                                  <Input className="mTop10 pAll5 rejectConfirmInput" style={{ borderRadius: 4, border: '1px solid #ededed', '--font-size': 13 }} />
                                </div>
                              ),
                              cancelText: _l('取消'),
                              confirmText: _l('确认'),
                              onConfirm: () => {
                                const el = document.querySelector('.rejectConfirmInput input');
                                this.props.dispatch(
                                  actions.editAppApplyStatus({
                                    ids: [item.id],
                                    appId: params.appId,
                                    status: 3,
                                    remark: el.value,
                                  }),
                                );
                              }
                            });
                          }}
                        >
                          {_l('拒绝')}
                        </span>
                        <span
                          className="InlineBlock toBeBtn mLeft15"
                          onClick={() => {
                            this.showActionSheet(item.id);
                          }}
                        >
                          {_l('同意')}
                        </span>
                      </div>
                    </div>
                    {item.remark ? <div className="Gray_9e Font13 mTop10 applyInfo">{item.remark}</div> : null}
                  </div>
                </React.Fragment>
              );
            })}
          </React.Fragment>
        ) : (
          <div className="h100">
            <WithoutRows text={_l('暂无申请')} />
          </div>
        )}
        <Back
          className="low"
          onClick={() => {
            history.back();
          }}
        />
      </React.Fragment>
    );
  }
}

export default connect(state => {
  const { applyData, isApplyLoading } = state.mobile;
  return {
    applyData,
    isApplyLoading,
  };
})(ApplyList);
