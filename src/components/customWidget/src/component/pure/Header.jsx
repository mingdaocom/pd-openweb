import React, { Component } from 'react';
import config from '../../config';

export default class Header extends Component {
  render() {
    const { sourceName, txt, toggleBackgroundClass, cancelSubmit, submitForm } = this.props;
    return (
      <div className="customHead">
        <div className="customHeadBox flexRow">
          <span className="goback">
            <i className="ming Icon icon icon-knowledge-return" onClick={cancelSubmit} />
          </span>
          <div className="editDetailWrap">
            <span className="bold">{_l('正在编辑%0：', txt)}</span>
            <span className="overflow_ellipsis" style={{ maxWidth: '360px' }}>
              {sourceName}
            </span>
          </div>
          <span
            className="customSave pointer Font14 ThemeBGColor3"
            ref={customSave => (this.customSave = customSave)}
            onClick={() => {
              if (this.customSave && this.customSave.getAttribute('reload') === '1') {
                submitForm(false);
              } else {
                submitForm(true);
              }
            }}
            onMouseOver={evt => toggleBackgroundClass(evt)}
            onMouseOut={evt => toggleBackgroundClass(evt)}
          >
            {_l('保存')}
          </span>
        </div>
      </div>
    );
  }
}
