import React from 'react';
import Header from 'src/components/worksheetConfigHeader';
import DocumentTitle from 'react-document-title';
import Sidenav from './containers/Sidenav';
import ValidationRules from './containers/ValidationRules';
import ColumnRules from './containers/ColumnRules';
import Print from './containers/Print';
import Alias from './containers/Alias';
import FunctionalSwitch from './containers/FunctionalSwitch';
import CustomBtnFormSet from './containers/CustomBtnFormSet';
import FormIndexSetting from './containers/FormIndexSetting';
import SubmitFormSetting from './containers/SubmitFormSetting';
import './index.less';
import ErrorState from 'src/components/errorPage/errorState';
import { MODULE_TYPE_TO_NAME } from './config';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper.jsx';
import LoadDiv from 'ming-ui/components/LoadDiv';
import sheetAjax from 'src/api/worksheet';
import { replaceControlsTranslateInfo } from 'worksheet/util';
import { getTranslateInfo } from 'src/util';
import { navigateToApp } from 'src/pages/widgetConfig/util/data';
class FormSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      worksheetName: '',
      loading: true,
      worksheetControls: [],
      worksheetRuleControls: [],
      worksheetInfo: {},
    };
  }

  componentWillMount() {
    this.getWorksheetInfo();
  }

  componentDidMount() {
    $('html').addClass('formSetWorksheet');
  }

  componentWillUnmount() {
    $('html').removeClass('formSetWorksheet');
  }

  getWorksheetInfo = () => {
    const { match = {} } = this.props;
    const { worksheetId } = match.params;
    sheetAjax
      .getWorksheetInfo({
        worksheetId: worksheetId,
        getTemplate: true,
        getViews: true,
        getSwitchPermit: true,
      })
      .then(data => {
        data.name = getTranslateInfo(data.appId, worksheetId).name || data.name;
        data.template.controls = replaceControlsTranslateInfo(data.appId, data.template.controls);
        //0：非成员 1：表负责人（弃用） 2：管理员 3：成员 4:开发者
        if (![2, 4].includes(data.roleType)) {
          this.setState({
            noRight: true,
            loading: false,
          });
        } else {
          const controls = _.sortBy(data.template.controls, o => o.row);
          this.setState({
            worksheetName: data.name,
            loading: false,
            worksheetControls: data.template.controls,
            worksheetRuleControls: controls,
            worksheetInfo: data,
          });
        }
      });
  };

  renderCon = type => {
    const { match = {} } = this.props;
    const { worksheetId } = match.params;
    const param = {
      ...this.props,
      ...this.state,
      worksheetId,
      onChange: worksheetInfo => {
        this.setState({
          worksheetInfo,
        });
      },
    };
    switch (type) {
      case 'alias':
        return <Alias {...param} />;
      case 'display':
        return <ColumnRules {...this.state} />;
      case 'validationBox':
        return <ValidationRules />;
      case 'printTemplate':
        return <Print {...param} />;
      case 'functionalSwitch':
        return <FunctionalSwitch {...param} />;
      case 'customBtn':
        return <CustomBtnFormSet {...param} />;
      case 'indexSetting':
        return <FormIndexSetting {...param} />;
      case 'submitForm':
        return <SubmitFormSetting {...param} />;
      default:
        return <SubmitFormSetting {...param} />;
    }
  };

  render() {
    const { match = { params: {} } } = this.props;
    const { worksheetId, type = '' } = match.params;
    const { loading, noRight = false, worksheetName } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
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
            <Sidenav {...this.props} />
            <DocumentTitle
              title={_l('表单设置 - %0 - %1', MODULE_TYPE_TO_NAME[type || 'submitForm'], worksheetName || '')}
            />
            <ErrorBoundary>{this.renderCon(type)}</ErrorBoundary>
          </div>
        )}
      </div>
    );
  }
}
export default FormSet;
