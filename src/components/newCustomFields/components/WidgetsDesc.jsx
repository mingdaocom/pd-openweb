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
    if (this.formcon && this.formcon.clientHeight <= 48 && this.formconMoreDesc) {
      this.formconMoreDesc.style.display = 'none';
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !_.isEqual(_.pick(nextProps, ['desc']), _.pick(this.props, ['desc'])) ||
      !_.isEqual(_.pick(nextState, ['isShow']), _.pick(this.state, ['isShow']))
    ) {
      return true;
    }
    return false;
  }

  render() {
    const { item, from } = this.props;
    const { isShow } = this.state;
    const isMobile = browserIsMobile();
    const hintType = _.get(item, 'advancedSetting.hinttype') || '0';
    const hintShowAsText =
      hintType === '0'
        ? _.includes([FROM.NEWRECORD, FROM.PUBLIC_ADD, FROM.H5_ADD, FROM.DRAFT], from) && !item.isSubList
        : hintType === '2';

    if (!item.desc || item.type === 22 || item.type === 10010) {
      return null;
    }

    if (hintShowAsText) {
      return (
        <p className="descBox pAll0 mAll0 mBottom0 mTop6 Font12 Gray_75 w100 WordBreak">
          <span className="descTxt" ref={formcon => (this.formconBox = formcon)}>
            <span ref={formcon => (this.formcon = formcon)} className="descText">
              <Linkify properties={{ target: '_blank' }}>{item.desc}</Linkify>
            </span>
            <span
              ref={formcon => (this.formconMoreDesc = formcon)}
              className="moreDesc Hand Font12"
              onClick={() => {
                if (!isShow) {
                  if (this.formconBox) this.formconBox.style.maxHeight = '100%';
                } else {
                  if (this.formconBox) this.formconBox.style.maxHeight = '48px';
                }

                this.setState({ isShow: !isShow });
              }}
            >
              {isShow ? _l('收起') : _l('更多')}
            </span>
          </span>
        </p>
      );
    }

    return (
      <span className="descBoxInfo">
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
          <i className="icon-workflow_error pointer Font16 Gray_9e mLeft3 InlineBlock" />
        </Tooltip>
      </span>
    );
  }
}

export default WidgetsDesc;
