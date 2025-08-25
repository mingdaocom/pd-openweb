import React from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';
import PropTypes from 'prop-types';
import Button from 'ming-ui/components/Button';
import DatePicker from 'ming-ui/components/DatePicker';
import Dialog from 'ming-ui/components/Dialog';
import Input from 'ming-ui/components/Input';
import postAjax from 'src/api/post';

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

    root.render(<EditVoteEndTimeDialog postItem={postItem} callback={callback} dispose={() => dispose()} />);
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
      <Dialog
        visible
        title={_l('修改截止日期')}
        footer={
          <div className="footer">
            <Button type="link" onClick={() => this.props.dispose()}>
              {_l('取消')}
            </Button>
            <Button action={() => this.submit()}>{_l('确定')}</Button>
          </div>
        }
        onCancel={() => this.props.dispose()}
      >
        <span className="mRight10">{_l('截止日期')}: </span>
        <div className="InlineBlock">
          <DatePicker
            selectedValue={this.state.deadline}
            timePicker
            timeMode="hour"
            allowClear={false}
            onSelect={deadline => this.setState({ deadline })}
          >
            <Input size="small" value={this.state.deadline.format('LL') + ' ' + this.state.deadline.format('LT')} />
          </DatePicker>
        </div>
      </Dialog>
    );
  }
}
