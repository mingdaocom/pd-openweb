import React from 'react';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import Back from '../../components/Back';
import { List, Flex, ActionSheet, ActivityIndicator, WhiteSpace, Modal } from 'antd-mobile';
import { WithoutRows } from 'mobile/RecordList/SheetRows';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import './index.less';

const prompt = Modal.prompt;

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
    ActionSheet.close();
  }

  showActionSheet = (id) => {
    const { applyList, roleList } = this.props.applyData;
    const { params } = this.props.match;
    const BUTTONS = _.map(roleList, (item, i) => {
      return (
        <span className="Bold" key={`${item.roleId}-${i}`}>
          {_l('设为%0', item.name)}
        </span>
      );
    });
    ActionSheet.showActionSheetWithOptions({
      options: BUTTONS,
      maskClosable: true,
      message: (
        <div className="flexRow header">
          <span className="Font13">{_l('申请管理')}</span>
          <div className="closeIcon" onClick={() => { ActionSheet.close(); }}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      'data-seed': 'logId',
    }, (buttonIndex) => {
      if (buttonIndex === -1) return;
      if (buttonIndex < roleList.length) {
        this.props.dispatch(actions.editAppApplyStatus({
          id,
          appId: params.appId,
          status: 2,
          role: roleList[buttonIndex],
          roleId: roleList[buttonIndex].roleId,
        }));
      }
    });
  }

  render() {
    const { applyData, isApplyLoading } = this.props;
    const { applyList, roleList } = applyData;
    const { params } = this.props.match;

    if (isApplyLoading) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    return (
      <React.Fragment>
        {
          applyList.length ? (
            <React.Fragment>
              {_.map(applyList, (item, i) => {
                return (
                  <React.Fragment key={item.id}>
                  <WhiteSpace size="xl"/>
                    <List.Item className="listApply" key={item.id}>
                      <div className="flexRow">
                        <span className="Gray Font17 flex">{item.accountInfo.fullName}</span>
                        <div>
                          <span
                            className="InlineBlock toBeBtn rejectBtn"
                            onClick={() => {
                              prompt(_l('拒绝'), _l('请填写拒绝的原因'), [
                                { text: _l('取消') },
                                {
                                  text: _l('确认'),
                                  onPress: value => {
                                    this.props.dispatch(actions.editAppApplyStatus({
                                      id: item.id,
                                      appId: params.appId,
                                      status: 3,
                                      remark: value
                                    }));
                                  }
                              }
                              ]);
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
                    </List.Item>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ) : (
            <div className="h100">
              <WithoutRows text={_l('暂无申请')} />
            </div>
          )
        }
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

export default connect((state) => {
  const { applyData, isApplyLoading } = state.mobile;
  return {
    applyData, isApplyLoading,
  };
})(ApplyList);
