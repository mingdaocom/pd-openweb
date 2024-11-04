import React from 'react';
import './createOrAdd.less';
import 'src/pages/accountLogin/components/message.less';

export default class CreateOrAdd extends React.Component {
  constructor(props) {
    super(props);
  }

  renderCon = () => {
    const { setStep = () => {} } = this.props;

    return (
      <React.Fragment>
        <div
          className="gNextBox mTop32"
          onClick={() => {
            setStep('add');
          }}
        >
          <h5 className="Gray Font18 Bold">
            {_l('加入')}
            <span style={{ color: '#00BCD7' }} className="mLeft3 mRight3">
              {_l('已有')}
            </span>
            {_l('组织')}
          </h5>
          <p className="Gray Font13 mTop12">{_l('同事已经在用，我要找到并加入组织')}</p>
        </div>
        <div
          className="gNextBox mTop24 mBottom25"
          onClick={() => {
            setStep('create');
          }}
        >
          <h5 className="Gray Font18 Bold">
            {_l('创建')}
            <span style={{ color: '#3E4DB9' }} className="mLeft3 mRight3">
              {_l('新的')}
            </span>
            {_l('组织')}
          </h5>
          <p className="Gray Font13 mTop12">{_l('我想自己创建一个新组织')}</p>
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { setStep = () => {} } = this.props;

    return (
      <React.Fragment>
        <div className="titleHeader">
          <span
            className="mTop40 Font15 InlineBlock Hand backspaceT"
            onClick={() => {
              setStep('registerName');
            }}
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
