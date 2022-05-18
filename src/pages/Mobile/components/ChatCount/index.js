import React, { Component } from 'react';
import discussionAjax from 'src/api/discussion';
import { Icon } from 'ming-ui';
import styled from 'styled-components';

const ChartCountWrap = styled.div`
  width: 60px;
  height: 32px;
  color: #757575;
  text-align: center;
  line-height: 32px;
  border-radius: 16px;
  background-color: #fff;
  box-shadow: 0 3px 6px 0px rgba(0, 0, 0, 0.16);
  position: fixed;
  bottom: 60px;
  right: 20px;
  z-index: 99;
`;

export default class ChatCount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discussionCount: 0,
    };
  }

  componentDidMount() {
   this.getDiscussionsCount();
  }

  getDiscussionsCount = () => {
    const { worksheetId, rowId, allowExAccountDiscuss, exAccountDiscussEnum } = this.props;
    let entityType = 0;
    //外部用户且未开启讨论 不能内部讨论
    if (md.global.Account.isPortal && allowExAccountDiscuss && exAccountDiscussEnum === 1) {
      entityType = 2;
    }
    discussionAjax
      .getDiscussionsCount({
        sourceId: worksheetId + '|' + rowId,
        sourceType: 8,
        entityType,
      })
      .then(res => {
        this.setState({ discussionCount: res.data });
      });
  };

  render() {
    const { onClick = () => {} } = this.props;
    const { discussionCount } = this.state;
    return (
      <ChartCountWrap onClick={onClick}>
        <Icon icon="chat" className="mRight5 TxtMiddle Font20" />
        <span>{discussionCount}</span>
      </ChartCountWrap>
    );
  }
}
