import React from 'react';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import LoadDiv from 'ming-ui/components/LoadDiv';
import sheetAjax from 'src/api/worksheet';
import ErrorState from 'src/components/errorPage/errorState';
import Header from 'src/components/worksheetConfigHeader';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper.jsx';
import { navigateToApp } from 'src/pages/widgetConfig/util/data';
import { getTranslateInfo } from 'src/utils/app';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import { MODULE_TYPE_TO_NAME } from './config';
import Alias from './containers/Alias';
import ColumnRules from './containers/ColumnRules';
import CustomBtnFormSet from './containers/CustomBtnFormSet';
import EditProtect from './containers/EditProtect';
import FormIndexSetting from './containers/FormIndexSetting';
import FunctionalSwitch from './containers/FunctionalSwitch';
import Print from './containers/Print';
import Share from './containers/Share';
import Sidenav from './containers/Sidenav';
import SubmitFormSetting from './containers/SubmitFormSetting/index';
import './index.less';

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
        data.name = getTranslateInfo(data.appId, null, worksheetId).name || data.name;
        data.template.controls = replaceControlsTranslateInfo(data.appId, worksheetId, data.template.controls);
        !_.isUndefined(data.appTimeZone) && (window[`timeZone_${data.appId}`] = data.appTimeZone);

        //清理缓存时间
        const { worksheetId } = match.params;
        window.clearLocalDataTime({ requestData: { worksheetId }, clearSpecificKey: 'Worksheet_GetWorksheetInfo' });

        //0：非成员 1：表负责人（弃用） 2：管理员 3：成员 4:开发者 6:开发者+运营者
        if (![2, 4, 6].includes(data.roleType)) {
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
      case 'printTemplate':
        return <Print {...param} />;
      case 'functionalSwitch':
        return <FunctionalSwitch {...param} />;
      case 'customBtn':
        return <CustomBtnFormSet {...param} />;
      case 'indexSetting':
        return <FormIndexSetting {...param} />;
      case 'editProtect':
        return <EditProtect {...param} />;
      case 'submitForm':
        return <SubmitFormSetting {...param} />;
      case 'share':
        return <Share {...param} />;
      default:
        return <SubmitFormSetting {...param} />;
    }
  };

  render() {
    const { match = { params: {} } } = this.props;
    const { worksheetId, type = '' } = match.params;
    const { loading, noRight = false, worksheetName, worksheetInfo } = this.state;
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
          onBack={({ redirectfn }) => {
            if (redirectfn) {
              redirectfn();
              return;
            }
            navigateToApp(worksheetId);
          }}
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
            <Sidenav {...this.props} projectId={worksheetInfo.projectId} />
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
