import React, { useEffect } from 'react';
import styled from 'styled-components';
import SingleView from 'worksheet/common/SingleView';

const Con = styled.div`
  height: 100%;
  background: #fff;
  .SingleViewHeader {
    padding-right: 10px;
  }
  .queryInput .inputCon > i {
    font-size: 20px !important;
    margin-top: 2px;
  }
`;

export default function ViewLand(props) {
  const { appId, worksheetId, viewId } = _.get(props, 'match.params') || {};
  useEffect(() => {
    window.hideColumnHeadFilter = true;
    return () => {
      window.hideColumnHeadFilter = false;
    };
  }, []);
  return (
    <Con>
      <SingleView showPageTitle showHeader appId={appId} worksheetId={worksheetId} viewId={viewId} />
    </Con>
  );
}
