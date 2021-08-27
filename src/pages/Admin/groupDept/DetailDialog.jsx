import React, { Component } from 'react';

export default class DetailDialog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { typeName, data = [], url, urlDetail } = this.props;
    return (
      <div className="mationBox pBottom20">
        <h3 className="Font15 Normal Gray">{_l('%0列表', typeName)}</h3>
        <ul style={{maxHeight: '300px', overflowY: 'auto'}}>
          <li className="headerLi GrayBG LineHeight35">
            <span className="InlineBlock pLeft40 Width200">{typeName}</span>
            <span className="InlineBlock ">{_l('操作')}</span>
          </li>
          {data.length &&
            data.map(item => {
              return (
                <li className="LineHeight35" key={item.sourceId}>
                  <span className="InlineBlock pLeft40 Width200 color_b overflow_ellipsis">{item.sourceName}</span>
                  <span className="InlineBlock Hand ThemeColor3">
                    <a href={url + item.sourceId + urlDetail} target="_blank">
                      {_l('查看%0', typeName)}
                    </a>
                  </span>
                </li>
              );
            })}
        </ul>
      </div>
    );
  }
}
