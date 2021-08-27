import PropTypes from 'prop-types';
import React from 'react';
import { classSet } from '../../utils/util';
import './singleFormula.less';

class SingleFormula extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    removeSingleFormulaItem: PropTypes.func.isRequired,
  };

  handleClick() {
    this.props.removeSingleFormulaItem(this.props.id);
  }

  render() {
    let { id, name, addComma } = this.props;

    return (
      <span className="singleFormula" data-id={id}>
        <span className={classSet({ singleFormulaNotFound: !name }, 'singleFormulaName')}>
          {name || '--'}
          <i className="icon-closeelement-bg-circle" onClick={this.handleClick.bind(this)} />
        </span>
        {addComma ? <span className="addComma">，</span> : ''}
      </span>
    );
  }
}

export default SingleFormula;
