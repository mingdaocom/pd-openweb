import React from 'react';
import SplitLineSection from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/SplitLineSection.jsx';

export default function SplitLine(props) {
  const { from, renderData, setNavVisible, registerCell } = props;
  const sectionStyle = _.get(props, 'widgetStyle.sectionstyle') || '0';

  return (
    <SplitLineSection
      data={props}
      from={from}
      fromType="display"
      sectionstyle={sectionStyle}
      renderData={renderData}
      setNavVisible={setNavVisible}
      registerCell={registerCell}
    />
  );
}
