import React from 'react';
import ReactDOM from 'react-dom';
import { Linkify, Tooltip } from 'ming-ui';
import _ from 'lodash';
import { FROM } from '../tools/config';
import { browserIsMobile } from 'src/util';

class WidgetsDesc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
    };
  }

  componentDidMount() {
    if (this.formcon && this.formcon.clientHeight <= 48) {
      ReactDOM.findDOMNode(this.formconMoreDesc).setAttribute('style', 'display:none');
    }
  }

  render() {
    const { item, from } = this.props;
    const { isShow } = this.state;
    const isMobile = browserIsMobile();

    if (!item.desc || item.type === 22 || item.type === 10010) {
      return null;
    }

    if (_.includes([FROM.NEWRECORD, FROM.PUBLIC, FROM.H5_ADD], from)) {
      return (
        <Linkify properties={{ target: '_blank' }}>
          <p className="descBox pAll0 mAll0 mBottom0 mTop6 Font12 Gray_9e w100 WordBreak">
            <span className="descTxt" ref={formcon => (this.formconBox = formcon)}>
              <span ref={formcon => (this.formcon = formcon)} className="descText">
                {item.desc}
              </span>
              <span
                ref={formcon => (this.formconMoreDesc = formcon)}
                className="moreDesc Hand Font12"
                onClick={() => {
                  if (!isShow) {
                    ReactDOM.findDOMNode(this.formconBox).setAttribute('style', 'max-height:100%');
                  } else {
                    ReactDOM.findDOMNode(this.formconBox).setAttribute('style', 'max-height:48px');
                  }

                  this.setState({ isShow: !isShow });
                }}
              >
                {isShow ? _l('收起') : _l('更多')}
              </span>
            </span>
          </p>
        </Linkify>
      );
    }

    return (
      <Tooltip
        text={
          <span
            className="Block"
            style={{
              maxWidth: 230,
              maxHeight: 200,
              overflowY: 'auto',
              color: '#fff',
              whiteSpace: 'pre-wrap',
            }}
          >
            {item.desc}
          </span>
        }
        action={[isMobile ? 'click' : 'hover']}
        popupPlacement={'topLeft'}
        offset={[-12, 0]}
      >
        <i className="icon-workflow_error descBoxInfo pointer Font16 Gray_9e mLeft3" />
      </Tooltip>
    );
  }
}

export default WidgetsDesc;
