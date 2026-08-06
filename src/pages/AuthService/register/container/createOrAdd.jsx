import React from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  background: var(--color-background-primary) 0% 0% no-repeat padding-box;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  padding: 40px 24px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
  }

  h5 {
    font-weight: 500;
    padding: 0;
    margin: 0;
  }

  .authPrimaryText {
    color: var(--color-primary);
  }
`;
export default class CreateOrAdd extends React.Component {
  constructor(props) {
    super(props);
  }

  renderCon = () => {
    const { onChange = () => {} } = this.props;
    const canCreateProject = md.global.Account.superAdmin || md.global.SysSettings.enableCreateProject;
    return (
      <React.Fragment>
        <Wrap className="gNextBox mTop32" onClick={() => onChange({ step: 'add' })}>
          <h5 className="textPrimary Font18 Bold">
            {_l('加入')}
            <span className="authPrimaryText mLeft3 mRight3">{_l('已有')}</span>
            {_l('组织')}
          </h5>
          <p className="textSecondary Font14 mTop12">{_l('同事已经在用，我要找到并加入组织')}</p>
        </Wrap>
        {canCreateProject && (
          <Wrap className="gNextBox mTop24 mBottom25" onClick={() => onChange({ step: 'create' })}>
            <h5 className="textPrimary Font18 Bold">
              {_l('创建')}
              <span className="authPrimaryText mLeft3 mRight3">{_l('新的')}</span>
              {_l('组织')}
            </h5>
            <p className="textSecondary Font14 mTop12">{_l('我想自己创建一个新组织')}</p>
          </Wrap>
        )}
      </React.Fragment>
    );
  };

  render() {
    const { onChange = () => {} } = this.props;

    return (
      <React.Fragment>
        <div className="titleHeader">
          <span
            className="mTop40 Font15 InlineBlock Hand backspaceT"
            onClick={() => onChange({ step: 'registerName' })}
          >
            <span className="backspace"></span> {_l('返回')}
          </span>
          <div className="title Font28 Bold mTop16">{_l('创建或加入组织')}</div>
        </div>

        {this.renderCon()}
      </React.Fragment>
    );
  }
}
