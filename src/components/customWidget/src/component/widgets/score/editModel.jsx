import React from 'react';
import config from '../../../config';
import Score from 'ming-ui/components/Score';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { data } = this.props.widget;

    return (
      <div className="editModel editModelScore">
        {data.enumDefault === 2 ? <span className="mRight10">0/10</span> : undefined}
        <Score type={data.enumDefault === 1 ? 'star' : 'line'} count={data.enumDefault === 1 ? 5 : 10} />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.SCORE.type,
  EditModel,
};
