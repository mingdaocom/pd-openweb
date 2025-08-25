import React from 'react';
import { Popup } from 'antd-mobile';
import { QuickFilter } from 'mobile/RecordList/QuickFilter';

export default function QuickFilterView(props) {
  const {
    controls = [],
    worksheetInfo = {},
    fastFilters = [],
    view,
    filtersVisible,
    onChangeFiltersVisible,
    onChangeQuickFilter,
  } = props;
  return (
    <Popup
      bodyStyle={{
        borderRadius: '14px 0 0 14px',
        overflow: 'hidden',
      }}
      position="right"
      visible={filtersVisible}
      onMaskClick={() => onChangeFiltersVisible(!filtersVisible)}
      onClose={() => onChangeFiltersVisible(!filtersVisible)}
    >
      {!!controls.length && (
        <QuickFilter
          base={{ worksheetId: worksheetInfo.worksheetId }}
          view={view}
          filterText={false}
          projectId={worksheetInfo.projectId}
          appId={worksheetInfo.appId}
          worksheetId={worksheetInfo.worksheetId}
          filters={fastFilters}
          controls={controls}
          onHideSidebar={() => onChangeFiltersVisible(false)}
          updateQuickFilter={onChangeQuickFilter}
        />
      )}
    </Popup>
  );
}
