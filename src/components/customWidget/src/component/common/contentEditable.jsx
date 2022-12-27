import React from 'react';
import global from '../../config/globalConfig';
import _ from 'lodash';

class ContentEditable extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props;
  }

  componentWillReceiveProps(nexProps) {
    this.setState({
      html: _.cloneDeep(nexProps.html),
    });
  }

  saveClickFormulaIndex() {
    global.clickFormulaIndex = this.props.index;
  }

  render() {
    return (
      <span
        className="singleFormula singleFormulaText"
        contentEditable="true"
        onClick={this.props.saveClickFormulaIndex.bind(this, this.props.index)}
        onFocus={this.saveClickFormulaIndex.bind(this)}
        onKeyUp={this.props.filterCharacter.bind(this)}
        onPaste={this.props.filterCharacter.bind(this)}
        dangerouslySetInnerHTML={{ __html: this.state.html }}
      />
    );
  }
}

export default ContentEditable;
