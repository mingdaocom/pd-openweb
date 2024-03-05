import React from 'react';
import SplitLineSection from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/SplitLineSection.jsx';

export default function SplitLine(props) {
  const { from, totalErrors, renderData, setNavVisible } = props;
  const sectionStyle = _.get(props, 'widgetStyle.sectionstyle') || '0';

  return (
    <SplitLineSection
      data={props}
      from={from}
      fromType="display"
      totalErrors={totalErrors}
      sectionstyle={sectionStyle}
      renderData={renderData}
      setNavVisible={setNavVisible}
    />
  );
}
