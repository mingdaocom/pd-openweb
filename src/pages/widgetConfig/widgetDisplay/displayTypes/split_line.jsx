import React, { useEffect, useState } from 'react';
import _, { head } from 'lodash';
import { genWidgetRowAndCol } from '../../util';
import SplitLineSection from '../../widgetSetting/components/SplitLineConfig/SplitLineSection';

export default function SplitLine(props) {
  const { data, styleInfo, path = [], widgets = [], activeWidget } = props;
  const row = head(path);
  const styleConfig = _.get(styleInfo, 'info.sectionstyle') || '0';
  const [sectionStyle, setStyle] = useState(styleConfig);

  useEffect(() => {
    if (styleConfig !== sectionStyle) {
      setStyle(styleConfig);
    }
  }, [data.controlId, styleConfig]);

  return (
    <SplitLineSection
      row={row}
      data={data}
      widgets={genWidgetRowAndCol(widgets)}
      sectionstyle={sectionStyle}
      activeWidget={activeWidget}
    />
  );
}
