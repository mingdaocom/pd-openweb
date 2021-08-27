import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import homeApp from 'src/api/homeApp';

const Title = styled.span`
  display: inline-block;
  max-width: 100%;
`;

export default class CopyApp extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {
    pending: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(nextState.pending, this.state.pending);
  }

  copyApp = () => {
    const { para, onCopy, onCancel, title } = this.props;
    const { pending } = this.state;
    if (pending) return;
    this.setState({ pending: true });
    homeApp
      .copyApp({ appName: `${title}-复制`, ...para })
      .then(result => {
        onCancel();
        if (result && typeof result === 'string') {
          alert(_l('复制成功'));
          onCopy && onCopy({ appId: result });
        } else {
          Dialog.confirm({
            title: _l('复制失败'),
            removeCancelBtn: true,
            description: (
              <Fragment>
                <div className="Gray_75 mBottom15">{_l('以下工作表存在错误配置：')}</div>
                {result.worksheetNames.map((item, i) => {
                  return (
                    <div className="mTop5" key={i}>
                      {item}
                    </div>
                  );
                })}
              </Fragment>
            ),
          });
        }
      })
      .always(() => {
        this.setState({ pending: false });
      });
  };
  render() {
    const { title, ...rest } = this.props;
    const { pending } = this.state;
    return (
      <Dialog
        visible
        title={<Title className="overflow_ellipsis">{_l('复制应用 ”%0“', title)}</Title>}
        okText={pending ? _l('复制中...') : _l('复制')}
        onOk={this.copyApp}
        {...rest}
      >
        <div className="Gray_75">{_l('将复制目标应用的应用结构、流程和角色。应用下的数据和成员不会被复制')}</div>
      </Dialog>
    );
  }
}
