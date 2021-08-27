import React from 'react';
import config from '../../../config';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let lineMount = this.props.widget.data.hint.match(/\n/g) ? this.props.widget.data.hint.match(/\n/g).length : 0;
  }

  componentWillReceiveProps() {
    let lineMount = this.props.widget.data.hint.match(/\n/g) ? this.props.widget.data.hint.match(/\n/g).length : 0;
  }

  render() {
    let { widget } = this.props;
    let { data } = widget;
    return (
      <div className="editModel editTextareaInput">
        <textarea type="textarea" ref="txt" placeholder={data.hint} style={{ height: '36px', display: 'block', overflow: 'hidden' }} />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.TEXTAREA_INPUT.type,
  EditModel,
};
