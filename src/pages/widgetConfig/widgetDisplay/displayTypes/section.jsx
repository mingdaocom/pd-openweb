import React from 'react';
import Components from '../components';
import { getChildWidgetsBySection } from '../../util/data';
import RowItem from '../rowItem';
import { isEmpty } from 'lodash';
import sectionCom from 'src/pages/widgetConfig/widgetSetting/components/SectionConfig';

const { SectionStyleItem } = sectionCom;

export default function Section(props) {
  const { data, allControls = [], path = [], activeWidget } = props;
  const [row] = path;
  const childWidgets = getChildWidgetsBySection(allControls, data.controlId);

  return (
    <SectionStyleItem data={data} from="display" activeWidget={activeWidget}>
      {childWidgets.map((childRow = [], index = 0) => {
        const id = childRow.reduce((p, c) => p + c.controlId, '');
        return (
          !isEmpty(childRow) && (
            <RowItem
              key={id}
              row={childRow}
              index={row + index + 1}
              displayItemType="section"
              {..._.omit(props, ['data', 'path'])}
            />
          )
        );
      })}
      <Components.BottomDragPointer
        sectionId={data.controlId}
        rowIndex={row + childWidgets.length + 1}
        showEmpty={isEmpty(childWidgets)}
      />
    </SectionStyleItem>
  );
}
