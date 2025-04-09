import React, { useState, useEffect, createRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { navigateToApp } from 'src/pages/widgetConfig/util/data';
import worksheetAjax from 'src/api/worksheet';
import Header from 'src/components/worksheetConfigHeader';
import ErrorState from 'src/components/errorPage/errorState';
import FillEnablePanel from './common/FillEnablePanel';
import QueryEnablePanel from './common/QueryEnablePanel';
import PayConfig from './common/PayConfig/index';
import { ScrollView, CardNav } from 'ming-ui';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper.jsx';
import VerifyModifyDialog from 'src/pages/widgetConfig/widgetSetting/components/VerifyModifyDialog';
import { NAV_NAME } from './enum';
import { navigateTo } from 'src/router/navigateTo';
import { getFeatureStatus } from 'src/util';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/util/enum';
import { saveSelectExtensionNavType } from 'worksheet/util';
import './index.less';
import _ from 'lodash';

export default function PublicWorksheetConfig(props) {
  const { match = { params: {} } } = props;
  const { worksheetId, type } = match.params;
  const [worksheetInfo, setworksheetInfo] = useState({});
  const [hederVisible, setHederVisible] = useState(!/detail/.test(location.hash));
  const [{ payConfigChanged, cancelActionCallback }, setPayConfigChangedInfo] = useState({});
  const { name, roleType, projectId } = worksheetInfo;
  useEffect(() => {
    worksheetAjax.getWorksheetInfo({ worksheetId, getTemplate: true, getViews: true }).then(setworksheetInfo);
  }, []);
  const isloading = _.isEmpty(worksheetInfo);
  const hasCharge = [2, 4, 6].includes(roleType); //0：非成员 1：表负责人（弃用） 2：管理员 3：成员 4:开发者 6:开发者+运营者
  const payConfigRef = createRef();
  const featureType = getFeatureStatus(projectId, VersionProductType.PAY);

  // 检查支付配置信息是否保存
  const checkPayConfig = () => {
    return payConfigRef && payConfigRef.current && payConfigRef.current.comparePayConfigData();
  };

  const handleChangeTab = url => {
    if (type === 'pay' && checkPayConfig()) {
      setPayConfigChangedInfo({
        payConfigChanged: true,
        cancelActionCallback: () => navigateTo(url),
      });
      return;
    }
    navigateTo(url);
  };

  const renderCon = () => {
    switch (type) {
      case 'publicform':
        return <FillEnablePanel worksheetId={worksheetId} setHederVisible={setHederVisible} projectId={projectId} />;
      case 'query':
        return <QueryEnablePanel worksheetId={worksheetId} worksheetInfo={worksheetInfo} />;
      case 'pay':
        return <PayConfig ref={payConfigRef} worksheetId={worksheetId} worksheetInfo={worksheetInfo} />;
      default:
        return <FillEnablePanel worksheetId={worksheetId} setHederVisible={setHederVisible} projectId={projectId} />;
    }
  };

  const handleClickNav = type => {
    saveSelectExtensionNavType(worksheetId, 'extensionNav', type);
    handleChangeTab(`/worksheet/form/edit/${worksheetId}/${type}`);
  };

  return (
    <div className="publicWorksheetConfig flexColumn">
      <Header
        worksheetId={worksheetId}
        worksheetName={name}
        saveLoading={false}
        onBack={({ redirectfn }) => {
          if (type === 'pay' && checkPayConfig()) {
            setPayConfigChangedInfo({
              payConfigChanged: true,
              cancelActionCallback: redirectfn ? redirectfn : () => navigateToApp(worksheetId),
            });
            return;
          }

          if (redirectfn) {
            redirectfn();
            return;
          }

          navigateToApp(worksheetId);
        }}
        onClose={() => {
          if (type === 'pay' && checkPayConfig()) {
            setPayConfigChangedInfo({ payConfigChanged: true, cancelActionCallback: () => navigateToApp(worksheetId) });
            return;
          }
          navigateToApp(worksheetId);
        }}
      />
      {!isloading && !hasCharge && (
        <div className="w100 WhiteBG Absolute" style={{ top: 0, bottom: 0 }}>
          <ErrorState
            text={_l('权限不足，无法编辑')}
            showBtn
            btnText={_l('返回')}
            callback={() => navigateToApp(worksheetId)}
          />
        </div>
      )}

      {!isloading && hasCharge && (
        <div className="flex extensionWrap">
          <DocumentTitle title={_l('扩展功能 - %0 - %1', NAV_NAME[type || 'publicform'], name || '')} />
          <ScrollView className="sideNavBox">
            <div className="title">{_l('公开发布')}</div>
            <CardNav
              currentNav={type || 'publicform'}
              navList={[
                {
                  icon: 'visibility',
                  title: _l('公开表单'),
                  url: `/worksheet/form/edit/${worksheetId}/publicform`,
                  onClick: () => handleClickNav('publicform'),
                },
                {
                  icon: 'search',
                  title: _l('公开查询'),
                  url: `/worksheet/form/edit/${worksheetId}/query`,
                  onClick: () => handleClickNav('query'),
                },
              ]}
            />
            {/* 应用管理员、开发者支 */}
            {featureType && _.includes([2, 4], roleType) && (
              <Fragment>
                <div className="title">{_l('支付')}</div>
                <CardNav
                  currentNav={type}
                  navList={[
                    {
                      icon: 'sp_payment_white',
                      title: _l('支付'),
                      showUpgradeIcon: featureType === '2',
                      url: `/worksheet/form/edit/${worksheetId}/pay`,
                      onClick: () => {
                        if (featureType === '2') {
                          buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
                          return;
                        }
                        handleClickNav('pay');
                      },
                    },
                  ]}
                />
              </Fragment>
            )}
          </ScrollView>
          <ErrorBoundary>{renderCon(type)}</ErrorBoundary>
        </div>
      )}

      {payConfigChanged && (
        <VerifyModifyDialog
          onOk={() => {
            setPayConfigChangedInfo({ payConfigChanged: false });
            payConfigRef && payConfigRef.current && payConfigRef.current.onSave();
          }}
          onCancel={() => {
            setPayConfigChangedInfo({ payConfigChanged: false });
          }}
          onClose={() => {
            setPayConfigChangedInfo({ payConfigChanged: false });
            cancelActionCallback();
          }}
        />
      )}
    </div>
  );
}

PublicWorksheetConfig.propTypes = {
  match: PropTypes.shape({}),
};
