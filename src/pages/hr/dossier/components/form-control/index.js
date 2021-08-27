// control types
// control types
const type = {};

// control type list
const types = [
  'COMPONENT',
  'TEXTINPUT',
  'PHONENUMBER',
  'RADIOGROUP',
  'CHECKBOXGROUP',
  'DROPDOWN',
  'DATETIME',
  'DATETIMERANGE',
  'USERPICKER',
  'AREAPICKER',
  'DEPARTMENTPICKER',
  'COMPANYPICKER',
  'TEXTVIEW',
  'FILEATTACHMENT',
  'RANGE',
  'LINKPICKER',
  'FORMGROUP',
  'SIGNGROUP',
  'RELATESHEET',
  'SHEETFIELD',
  'SWITCH',
];

types.map((item, i, list) => {
  type[item] = item;

  return null;
});

const FormControl = {
  type,
  types,
};

export default FormControl;
