import React from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0px 0px 4px #0000001f;
  border-radius: 4px;
  padding: 45px 24px;
  cursor: pointer;

  &:hover {
    box-shadow: 0px 2px 7px #00000029;
  }

  h5 {
    font-weight: 500;
    padding: 0;
    margin: 0;
  }
`;
export default class CreateOrAdd extends React.Component {
  constructor(props) {
    super(props);
  }

  renderCon = () => {
    const { onChange = () => {} } = this.props;

    return (
      <React.Fragment>
        <Wrap className="gNextBox mTop32" onClick={() => onChange({ step: 'add' })}>
          <h5 className="Gray Font18 Bold">
            {_l('加入')}
            <span style={{ color: '#00BCD7' }} className="mLeft3 mRight3">
              {_l('已有')}
            </span>
            {_l('组织')}
          </h5>
          <p className="Gray Font13 mTop12">{_l('同事已经在用，我要找到并加入组织')}</p>
        </Wrap>
        <Wrap className="gNextBox mTop24 mBottom25" onClick={() => onChange({ step: 'create' })}>
          <h5 className="Gray Font18 Bold">
            {_l('创建')}
            <span style={{ color: '#3E4DB9' }} className="mLeft3 mRight3">
              {_l('新的')}
            </span>
            {_l('组织')}
          </h5>
          <p className="Gray Font13 mTop12">{_l('我想自己创建一个新组织')}</p>
        </Wrap>
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
          <div className="title Font26 Bold mTop16">{_l('创建或加入组织')}</div>
        </div>

        {this.renderCon()}
      </React.Fragment>
    );
  }
}
