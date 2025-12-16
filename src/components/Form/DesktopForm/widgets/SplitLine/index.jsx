import React from 'react';
import _ from 'lodash';
import SplitLineSection from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/SplitLineSection.jsx';

const SplitLine = props => {
  const { from, renderData, setNavVisible, registerCell, worksheetId } = props;
  const sectionStyle = _.get(props, 'widgetStyle.sectionstyle') || '0';

  return (
    <SplitLineSection
      data={props}
      from={from}
      fromType="display"
      worksheetId={worksheetId}
      sectionstyle={sectionStyle}
      renderData={renderData}
      setNavVisible={setNavVisible}
      registerCell={registerCell}
    />
  );
};

export default SplitLine;
