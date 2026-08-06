import React, { useCallback, useEffect, useRef, useState } from 'react';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import LoadDiv from 'ming-ui/components/LoadDiv';
import sheetAjax from 'src/api/worksheet';
import ErrorState from 'src/components/errorPage/errorState';
import Header from 'src/components/worksheetConfigHeader';
import { navigateToApp } from 'src/pages/widgetConfig/util/data';
import { getTranslateInfo } from 'src/utils/app';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import { MODULE_TYPE_TO_NAME } from './config';
import AIAction from './containers/AIAction';
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

export default function FormSet(props) {
  const { match = { params: {} } } = props;
  const { worksheetId, type = '' } = match.params;

  const [worksheetName, setWorksheetName] = useState('');
  const [loading, setLoading] = useState(true);
  const [worksheetControls, setWorksheetControls] = useState([]);
  const [worksheetRuleControls, setWorksheetRuleControls] = useState([]);
  const [worksheetInfo, setWorksheetInfo] = useState({});
  const [noRight, setNoRight] = useState(false);
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);

  const getWorksheetInfo = useCallback(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setNoRight(false);

    sheetAjax
      .getWorksheetInfo({
        worksheetId,
        getTemplate: true,
        getViews: true,
        getSwitchPermit: true,
      })
      .then(data => {
        if (!mountedRef.current || requestId !== requestIdRef.current) return;

        data.name = getTranslateInfo(data.appId, null, worksheetId).name || data.name;
        data.template.controls = replaceControlsTranslateInfo(data.appId, worksheetId, data.template.controls);
        !_.isUndefined(data.appTimeZone) && (window[`timeZone_${data.appId}`] = data.appTimeZone);

        //清理缓存时间
        window.clearLocalDataTime({
          requestData: { worksheetId },
          clearSpecificKeys: ['Worksheet_GetWorksheetInfo', 'Worksheet_GetWorksheetBaseInfo'],
        });

        //0：非成员 1：表负责人（弃用） 2：管理员 3：成员 4:开发者 6:开发者+运营者
        if (![2, 4, 6].includes(data.roleType)) {
          setNoRight(true);
          setLoading(false);
        } else {
          const controls = _.sortBy(data.template.controls, o => o.row);
          setWorksheetName(data.name);
          setLoading(false);
          setWorksheetControls(data.template.controls);
          setWorksheetRuleControls(controls);
          setWorksheetInfo(data);
        }
      });
  }, [worksheetId]);

  useEffect(() => {
    mountedRef.current = true;
    getWorksheetInfo();
    $('html').addClass('formSetWorksheet');
    return () => {
      mountedRef.current = false;
      $('html').removeClass('formSetWorksheet');
    };
  }, [getWorksheetInfo]);

  const handleChange = useCallback(info => {
    setWorksheetInfo(info);
  }, []);

  // renderCon 在渲染期直接调用，不需要 useCallback
  const renderCon = renderType => {
    const param = {
      ...props,
      worksheetId,
      worksheetName,
      loading,
      worksheetControls,
      worksheetRuleControls,
      worksheetInfo,
      noRight,
      onChange: handleChange,
    };

    switch (renderType) {
      case 'alias':
        return <Alias {...param} />;
      case 'display':
        return <ColumnRules {...{ worksheetControls, worksheetRuleControls, worksheetInfo, loading, noRight }} />;
      case 'printTemplate':
        return <Print {...param} />;
      case 'functionalSwitch':
        return <FunctionalSwitch {...param} />;
      case 'customAction':
        return <CustomBtnFormSet {...param} />;
      case 'aiAction':
        return <AIAction {...param} />;
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
        <div className="w100 bgPrimary Absolute" style={{ top: 0, bottom: 0, zIndex: 2 }}>
          <ErrorState
            text={_l('权限不足，无法编辑')}
            showBtn
            btnText={_l('返回')}
            callback={() => navigateToApp(worksheetId)}
          />
        </div>
      ) : (
        <div className="flexBox columnRulesBox">
          <Sidenav {...props} projectId={worksheetInfo.projectId} />
          <DocumentTitle
            title={_l('表单设置 - %0 - %1', MODULE_TYPE_TO_NAME[type || 'submitForm'], worksheetName || '')}
          />
          <ErrorBoundary>{renderCon(type)}</ErrorBoundary>
        </div>
      )}
    </div>
  );
}
