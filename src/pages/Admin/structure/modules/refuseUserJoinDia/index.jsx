import React from 'react'
import './index.less'
import { Dialog, LoadDiv, Icon } from 'ming-ui';
import userController from 'src/api/user';

class RefuseUserJoinDia extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      refuseMessage: ''
    }
  }

  componentDidMount() {
  }

  refuseUserJoin = (fn) => {
    userController.refuseUserJoin({
      projectId: this.props.projectId,
      accountId: this.props.accountId,
      refuseMessage: this.state.refuseMessage,
    }).then((result) => {
      if (result) {
        fn({
          isOk: true
        });
        alert(_l('拒绝成功'));
      } else {
        alert(_l('操作失败'), 2);
      }
    }, () => {
      alert(_l('操作失败'), 2);
    });
    return false;
  };

  render() {
    const { refuseMessage } = this.state;
    return <Dialog
      title={_l('拒绝用户加入')}
      okText={_l('确定')}
      cancelText={_l('取消')}
      className='dialogRefuse'
      onCancel={() => {
        this.props.setValue({
          showDialog: false,
        });
      }}
      onOk={() => {
        this.refuseUserJoin(this.props.setValue)
      }}
      visible={this.props.showDialog}
    >
      <div className="settingItemTitle">{_l('拒绝消息')}</div>
      <textarea type="textarea" className="test-textarea mTop10" value={refuseMessage || ''}
        ref={area => (this.area = area)}
        onChange={(e) => {
          this.setState({
            refuseMessage: e.target.value
          })
        }}
      />
    </Dialog>
  }
}

export default RefuseUserJoinDia;

