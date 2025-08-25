import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Button, Dialog, Textarea } from 'ming-ui';
import homeApp from 'src/api/homeApp';

const TextareaWrapper = styled(Textarea)`
  &::placeholder {
    color: #bdbdbd;
  }
`;

export default class AppFixStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fixRemark: props.fixRemark || '',
    };
  }
  componentDidMount() {
    let appFixTextarea = document.getElementById('appFixTextarea');
    appFixTextarea.focus();
  }
  handleCloseFix = () => {
    const { appId, projectId, onCancel, onChangeStatus } = this.props;
    homeApp
      .editFix({
        appId,
        projectId,
        fixed: false,
      })
      .then(result => {
        result && onChangeStatus({ fixed: false, fixRemark: '' });
      });
    onCancel();
  };
  handleSave = () => {
    const { appId, projectId, onCancel, onChangeStatus } = this.props;
    const { fixRemark } = this.state;
    homeApp
      .editFix({
        appId,
        projectId,
        fixed: true,
        fixRemark,
      })
      .then(result => {
        result && onChangeStatus({ fixed: true, fixRemark });
      });
    onCancel();
  };
  renderHeader() {
    const { fixed } = this.props;
    return (
      <div className="flexRow mBottom4">
        <span className="Font17 overflow_ellipsis Bold">{fixed ? _l('更新维护状态') : _l('设为维护状态')}</span>
      </div>
    );
  }
  renderFooter() {
    const { fixed, onCancel } = this.props;
    if (fixed) {
      return (
        <Fragment>
          <Button type="ghostgray" onClick={this.handleCloseFix}>
            {_l('结束维护')}
          </Button>
          <Button type="primary" onClick={this.handleSave}>
            {_l('更新公告')}
          </Button>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={this.handleSave}>
            {_l('确定')}
          </Button>
        </Fragment>
      );
    }
  }
  render() {
    const { fixRemark } = this.state;
    const { fixed, onCancel } = this.props;
    const options = {
      title: this.renderHeader(),
      visible: true,
      footer: this.renderFooter(),
      width: 520,
      type: 'scroll',
      overlayClosable: false,
      onCancel: onCancel,
    };
    return (
      <Dialog {...options}>
        <div className="mBottom20 Gray_75 Font13">
          {fixed
            ? _l('若应用已更新维护完毕请结束维护使应用恢复正常，您也可以重新编辑公告内容。')
            : _l('应用设为维护状态后，普通成员无法使用应用，管理员可对应用进行更新维护。')}
        </div>
        <div className="Font13 mBottom5">{_l('维护公告')}</div>
        <TextareaWrapper
          id="appFixTextarea"
          value={fixRemark}
          className="Font13"
          placeholder={_l('简短说明维护原因，预计恢复时间...')}
          onChange={value => {
            this.setState({ fixRemark: value });
          }}
        />
      </Dialog>
    );
  }
}
