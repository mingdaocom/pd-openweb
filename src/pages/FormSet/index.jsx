import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { navigateToApp } from 'src/pages/widgetConfig/util/data';
import Header from 'src/components/worksheetConfigHeader';
import DocumentTitle from 'react-document-title';
import * as actions from './redux/actions/action';
import * as columnRules from './redux/actions/columnRules';
import Sidenav from './containers/Sidenav';
import ValidationRules from './containers/ValidationRules';
import ColumnRules from './containers/ColumnRules';
import Print from './containers/Print';
import Alias from './containers/Alias';
import FunctionalSwitch from './containers/FunctionalSwitch';
import CustomBtnFormSet from './containers/CustomBtnFormSet';
import './index.less';
import ErrorState from 'src/components/errorPage/errorState';
import { MODULE_TYPE_TO_NAME } from './config';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper.jsx';
class FormSet extends React.Component {
  // static propTypes = {
  //   match: PropTypes.shape({}),
  //   loadColumnRules: PropTypes.func,
  //   getWorksheetInfo: PropTypes.func,
  //   formSet: PropTypes.shape({}),
  // };
  constructor(props) {
    super(props);
    this.state = {
      showCreateCustomBtn: false,
    };
  }

  componentWillMount() {
    const { match = { params: {} } } = this.props;
    const { worksheetId } = match.params;
    const { getWorksheetInfo } = this.props;
    getWorksheetInfo(worksheetId);
  }

  componentDidMount() {
    $('html').addClass('formSetWorksheet');
  }

  componentWillReceiveProps(nextProps) {
    const { match, getWorksheetInfo } = this.props;
    const { worksheetId, type = '' } = match.params;
    if (type !== nextProps.match.params.type && nextProps.match.params.type === 'alias') {
      getWorksheetInfo(worksheetId);
    }
  }

  componentWillUnmount() {
    $('html').removeClass('formSetWorksheet');
  }

  renderCon = type => {
    {
      switch (type) {
        case 'alias':
          return <Alias />;
        case 'display':
          return <ColumnRules />;
        case 'validationBox':
          return <ValidationRules />;
        case 'printTemplate':
          return <Print />;
        case 'functionalSwitch':
          return <FunctionalSwitch />;
        case 'customBtn':
          return <CustomBtnFormSet />;
        default:
          return <Alias />;
          break;
      }
    }
  };

  render() {
    const { match = { params: {} }, formSet = [], dispalyRulesNum = 0 } = this.props;
    const { worksheetId, type = '' } = match.params;
    const { worksheetName = '', noRight = false } = formSet;
    const { showCreateCustomBtn } = this.state;
    return (
      <div className="columnRulesWrap">
        <Header
          worksheetId={worksheetId}
          worksheetName={worksheetName}
          showSaveButton={false}
          saveLoading={false}
          onBack={() => navigateToApp(worksheetId)}
          onClose={() => navigateToApp(worksheetId)}
        />
        {noRight ? (
          <div className="w100 WhiteBG Absolute" style={{ top: 0, bottom: 0, zIndex: 2 }}>
            <ErrorState
              text={_l('权限不足，无法编辑')}
              showBtn
              btnText={_l('返回')}
              callback={() => navigateToApp(worksheetId)}
            />
          </div>
        ) : (
          <div className="flexBox columnRulesBox">
            <Sidenav worksheetId={worksheetId} type={type} displayNum={dispalyRulesNum} />
            <DocumentTitle
              title={_l('表单设置 - %0 - %1', MODULE_TYPE_TO_NAME[type || 'alias'], worksheetName || '')}
            />
            <ErrorBoundary>{this.renderCon(type)}</ErrorBoundary>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  formSet: state.formSet,
  dispalyRulesNum: state.formSet.dispalyRulesNum,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, ...columnRules }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FormSet);
