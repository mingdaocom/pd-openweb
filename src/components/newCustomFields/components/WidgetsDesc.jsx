import React from 'react';
import ReactDOM from 'react-dom';
import Linkify from 'react-linkify';

class WidgetsDesc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMore: false,
    };
  }

  componentDidMount() {
    if (this.formcon.clientHeight <= 48) {
      ReactDOM.findDOMNode(this.formconMoreDesc).setAttribute('style', 'display:none');
    }
  }

  render() {
    const { desc, isDescMore, controlId } = this.props;

    if (!desc) {
      return '';
    }

    return (
      <Linkify properties={{ target: '_blank' }}>
        <p className="descBox pAll0 mAll0 mBottom0 mTop6 Font12 Gray_9e w100 WordBreak">
          <span className="descTxt" ref={formcon => (this.formconBox = formcon)}>
            <span ref={formcon => (this.formcon = formcon)} className="descText">
              {desc}
            </span>
            <span
              ref={formcon => (this.formconMoreDesc = formcon)}
              className="moreDesc Hand Font12"
              onClick={() => {
                let arr = isDescMore;
                let index = _.indexOf(arr, controlId);
                let arrNew = index < 0 ? arr.concat(controlId) : _.filter(arr, i => i !== controlId);
                this.props.setData(arrNew);
                if (_.indexOf(isDescMore, controlId) < 0) {
                  ReactDOM.findDOMNode(this.formconBox).setAttribute('style', 'max-height:100%');
                } else {
                  ReactDOM.findDOMNode(this.formconBox).setAttribute('style', 'max-height:48px');
                }
              }}
            >
              {_.indexOf(isDescMore, controlId) < 0 ? _l('更多') : _l('收起')}
            </span>
          </span>
        </p>
      </Linkify>
    );
  }
}

export default WidgetsDesc;
