export const getRelationCellPrintData = ({ control, dataInfo, tableList, record }) => {
  const baseData = {
    ...dataInfo,
    isRelateMultipleSheet: true,
    value: record[control.controlId],
  };

  if (control.type !== 47) {
    return {
      ...baseData,
      dataSource: tableList.controlId,
    };
  }

  return {
    ...baseData,
    worksheetId: tableList.dataSource,
    dataSource: control.dataSource,
    recordId: record.rowid,
    viewIdForPermit: '',
  };
};

const getFormData = (controls = [], record = {}) => {
  return controls.map(control => ({
    ...control,
    value: record[control.controlId],
  }));
};

const parseDataSource = dataSource => {
  if (typeof dataSource !== 'string' || !dataSource) return '';
  if (dataSource.includes('$')) return dataSource.slice(1, -1);
  return dataSource;
};

const withBarcodeSourceControl = ({ control, formData = [], record = {} }) => {
  if (control.type !== 47) return formData;

  const dataSource = parseDataSource(control.dataSource);
  if (!dataSource || dataSource === 'rowid') return formData;

  let hasSourceControl = false;
  const nextFormData = formData.map(item => {
    if (item.controlId !== dataSource) return item;

    hasSourceControl = true;

    if (typeof item.value === 'undefined') {
      return { ...item, value: record[dataSource] };
    }

    return item;
  });

  if (!hasSourceControl) {
    nextFormData.push({
      controlId: dataSource,
      value: record[dataSource],
    });
  }

  return nextFormData;
};

export const getRelationTilePrintData = ({
  control,
  dataInfo,
  tableList,
  record,
  controls,
  allControls,
  fileStyle,
  userInfo,
}) => {
  const controlsFormData = withBarcodeSourceControl({
    control,
    formData: getFormData(controls, record),
    record,
  });
  const allControlsFormData = withBarcodeSourceControl({
    control,
    formData: getFormData(allControls, record),
    record,
  });

  return {
    ...control,
    ...getRelationCellPrintData({ control, dataInfo, tableList, record }),
    showUnit: true,
    fileStyle,
    user_info: userInfo,
    controls: controlsFormData,
    allControls: allControlsFormData,
  };
};
