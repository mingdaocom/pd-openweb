import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { navigateToApp } from 'src/pages/widgetConfig/util/data';
import { getWorksheetInfo } from 'src/api/worksheet';
import Header from 'src/components/worksheetConfigHeader';
import ErrorState from 'src/components/errorPage/errorState';
import FillEnablePanel from './common/FillEnablePanel';
import QueryEnablePanel from './common/QueryEnablePanel';
import './index.less';

export default function PublicWorksheetConfig(props) {
  const { match = { params: {} } } = props;
  const { worksheetId } = match.params;
  const [worksheetInfo, setworksheetInfo] = useState({});
  const [hederVisible, setHederVisible] = useState(!/detail/.test(location.hash));
  const { name, roleType } = worksheetInfo;
  useEffect(() => {
    getWorksheetInfo({ worksheetId, getTemplate: true, getViews: true }).then(setworksheetInfo);
  }, []);
  const isloading = _.isEmpty(worksheetInfo);
  return (
    <div className="publicWorksheetConfig flexColumn">
      {hederVisible && (
        <Header
          worksheetId={worksheetId}
          worksheetName={name}
          showSaveButton={false}
          saveLoading={false}
          onBack={() => navigateToApp(worksheetId)}
          onClose={() => navigateToApp(worksheetId)}
        />
      )}
      <DocumentTitle title={_l('设置公开表单 - %0', name || '')} />
      {!isloading && roleType !== 2 && (
        <div className="w100 WhiteBG Absolute" style={{ top: 0, bottom: 0 }}>
          <ErrorState
            text={_l('权限不足，无法编辑')}
            showBtn
            btnText={_l('返回')}
            callback={() => navigateToApp(worksheetId)}
          />
        </div>
      )}
      {!isloading && roleType === 2 && (
        <div className="flex">
          <FillEnablePanel worksheetId={worksheetId} setHederVisible={setHederVisible} />
          <QueryEnablePanel worksheetId={worksheetId} worksheetInfo={worksheetInfo} />
        </div>
      )}
    </div>
  );
}

PublicWorksheetConfig.propTypes = {
  match: PropTypes.shape({}),
};
