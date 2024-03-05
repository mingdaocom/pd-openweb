import React from 'react';
import ColumnRulesCon from '../components/columnRules/ColumnRulesCon';
import * as columnRules from '../components/columnRules/redux/actions/columnRules';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { LoadDiv } from 'ming-ui';

class ColumnRules extends React.Component {
  componentDidMount() {
    const { loadColumnRules } = this.props;
    loadColumnRules(this.props);
  }

  render() {
    const { formSet } = this.props;
    return (
      <React.Fragment>
        {formSet.loading ? (
          <LoadDiv />
        ) : (
          <div className="displayRulesCon">
            <ColumnRulesCon {...this.props} />
          </div>
        )}
      </React.Fragment>
    );
  }
}
const mapStateToProps = state => ({
  formSet: state.formSet,
});
const mapDispatchToProps = dispatch => bindActionCreators(columnRules, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ColumnRules);
