import React from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';
import PropTypes from 'prop-types';
import { DatePicker, Modal } from 'ming-ui/antd-components';
import postAjax from 'src/api/post';
import AntdConfigProvider from 'src/common/providers/theme/AntdConfigProvider';

const HOUR_PICKER_CONFIG = { format: 'HH' };

export default class EditVoteEndTimeDialog extends React.Component {
  static propType = {
    postItem: PropTypes.object,
    callback: PropTypes.func,
    dispose: PropTypes.func,
  };
  static show(postItem, callback) {
    const div = document.createElement('div');

    document.body.appendChild(div);

    const root = createRoot(div);

    const dispose = () => {
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(div);
      }, 100);
    };

    root.render(
      <AntdConfigProvider>
        <EditVoteEndTimeDialog postItem={postItem} callback={callback} dispose={() => dispose()} />
      </AntdConfigProvider>,
    );
  }
  constructor(props) {
    super(props);
    this.state = { deadline: moment(this.props.postItem.Deadline) };
  }
  submit() {
    return postAjax
      .editVoteDeadline({
        postId: this.props.postItem.postID,
        deadline: this.state.deadline.format(),
      })
      .then(result => {
        if (result) {
          alert(_l('修改成功'));
          if (this.props.callback) {
            this.props.callback(this.state.deadline.format('YYYY-MM-DD HH:mm'));
          }

          this.props.dispose();
        } else {
          alert(_l('修改失败'), 2);
        }
      });
  }
  render() {
    return (
      <Modal open title={_l('修改截止日期')} onOk={() => this.submit()} onCancel={() => this.props.dispose()}>
        <span className="mRight10">{_l('截止日期')}: </span>
        <div className="InlineBlock">
          <DatePicker
            allowClear={false}
            format="LL LT"
            needConfirm
            showTime={HOUR_PICKER_CONFIG}
            size="small"
            value={this.state.deadline}
            onChange={deadline => this.setState({ deadline: deadline.clone().startOf('hour') })}
          />
        </div>
      </Modal>
    );
  }
}
