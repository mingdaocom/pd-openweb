import React, { Component } from 'react';

// import './components.less';

import {
  TextInput,
  PhoneNumber,
  Button,
  Radio,
  RadioGroup,
  CheckBox,
  Dropdown,
  CheckBoxGroup,
  DateTime,
  DateTimeRange,
  UserPicker,
  DepartmentPicker,
  CompanyPicker,
  AreaPicker,
  Divider,
  FormContainer,
  Tab,
  Attachment,
  FileUploader,
  FormItem,
} from './components';

import { UiFormView, UiFormContainer, UiFormGroup, UiCheckBoxGroup, UiPrintView, UiPermissionsView } from './ui';

import ApiData from './data/api';
import ApiFormData from './data/form';

import { FormAdapter, GroupAdapter, PermissionAdapter } from './lib/data-adapter';

import FormData from './data/form-data';
import FormGroupData from './data/form-group-data';

import Icon from 'ming-ui/components/Icon';

class DossierComponents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      textInputValue: 'TextInput',
      radioGroupData: [
        {
          label: 'AAABBBCCCDDD',
          value: 1,
        },
        {
          label: 'BBB',
          value: 2,
        },
        {
          label: 'CCC',
          value: 3,
        },
        {
          label: 'DDD',
          value: 4,
        },
        {
          label: 'EEE',
          value: 5,
        },
      ],
      permissionData: PermissionAdapter.convert(ApiData).groupData,
      formData: GroupAdapter.convert(ApiData, {
        autoRow: 2,
      }),
      apiFormData: FormAdapter.convert(ApiFormData),
      showError: false,
      checkboxGroupData: [
        {
          id: '111',
          name: '111',
          data: [
            {
              label: 'AAA',
              value: 'AAA',
            },
            {
              label: 'BBB',
              value: 'BBB',
            },
            {
              label: 'CCC',
              value: 'CCC',
            },
            {
              label: 'DDD',
              value: 'DDD',
            },
          ],
        },
        {
          id: '222',
          name: '222',
          data: [
            {
              label: 'AAA',
              value: 'AAA',
            },
            {
              label: 'BBB',
              value: 'BBB',
            },
            {
              label: 'CCC',
              value: 'CCC',
            },
            {
              label: 'DDD',
              value: 'DDD',
            },
          ],
        },
      ],
    };

    // console.log(this.state.permissionData);
    // console.log(this.state.formData);
    // console.log(this.state.apiFormData);
  }

  textInputOnChange = (event, value, data) => {
    this.setState({
      textInputValue: value,
    });
  };

  textInputOnError = (error) => {
    // console.log(error);
  };

  phoneNumberOnChange = (event, value, data) => {
    console.log(value);
  };

  phoneNumberOnError = (error) => {
    console.log(error);
  };

  buttonOnClick = (event) => {
    // console.log('button on click');
  };

  formContainerOnChange = (event, id, data) => {
    // console.log(data);
  };

  formContainerOnError = (error, id, errorData) => {
    console.log(id, error, errorData);
  };

  formContainerOnValid = (id, errorData) => {
    // console.log(id, errorData);
  };

  uiFormViewDeleteForm = (id, index) => {
    // console.log(`delete form, id=${ id }, index=${ index }`);
  };

  uiFormViewSaveForm = (id, values, index) => {
    // console.log(`save form, id=${ id }, index=${ index }`, values);
  };

  toggleShowError = () => {
    this.setState({
      showError: !this.state.showError,
    });
  };

  areaPickerOnChange = (event, value, data) => {
    console.log(value);
  };

  departmentPickerOnChange = (event, value, data) => {
    console.log(value);
  };

  companyPickerOnChange = (event, value, data) => {
    console.log(value);
  };

  render() {
    return (
      <div
        style={{
          paddingTop: '50px',
          overflow: 'auto',
          boxSizing: 'border-box',
          backgroundColor: '#FFF',
        }}
      >
        {/*
        <h2>UiPermissionsView</h2>
        <UiPermissionsView
            data={ this.state.permissionData }
            onChange={ (event, data) => { console.log(data); } } />
        <h2>UiPrintView</h2>
        <UiPrintView
            data={ this.state.formData } />
        <h2>FileUploader</h2>
        <FileUploader />
        <h2>UiCheckBoxGroup</h2>
        <UiCheckBoxGroup
            data={ this.state.checkboxGroupData }
            onChange={ (event, values) => { console.log(values); } } />
        <h2>Attachment</h2>
        <Attachment />
        */}
        <h2>FormContainer</h2>
        <FormContainer data={this.state.apiFormData} />
        <FormContainer
          data={FormData}
          showError={this.state.showError}
          onChange={this.formContainerOnChange}
          onError={this.formContainerOnError}
          onValid={this.formContainerOnValid}
        />
        <Button label="Show Error" onClick={this.toggleShowError} />
        <h2>Tab</h2>
        <Tab value={2} data={this.state.radioGroupData} />
        <Tab value={2} checkable={false} data={this.state.radioGroupData} />
        <Tab value={2} itemAlign="center" data={this.state.radioGroupData} />
        <Tab value={2} itemAlign="right" data={this.state.radioGroupData} />
        <h2>UiFormView</h2>
        <UiFormView data={this.state.formData} deleteForm={this.uiFormViewDeleteForm} saveForm={this.uiFormViewSaveForm} />
        <UiFormView data={FormGroupData} deleteForm={this.uiFormViewDeleteForm} saveForm={this.uiFormViewSaveForm} />
        <h2>TextInput</h2>
        <TextInput value={this.state.textInputValue} required minLength={5} maxLength={12} onChange={this.textInputOnChange} onError={this.textInputOnError} />
        <TextInput
          value={this.state.textInputValue}
          required
          minLength={5}
          maxLength={12}
          onChange={this.textInputOnChange}
          onError={this.textInputOnError}
          disabled
        />
        <TextInput
          value={this.state.textInputValue}
          required
          minLength={5}
          maxLength={12}
          onChange={this.textInputOnChange}
          onError={this.textInputOnError}
          multipleLine
          defaultLines={4}
        />
        <TextInput
          value={this.state.textInputValue}
          required
          minLength={5}
          maxLength={12}
          onChange={this.textInputOnChange}
          onError={this.textInputOnError}
          disabled
          multipleLine
          defaultLines={4}
        />
        <h2>PhoneNumber</h2>
        <PhoneNumber value="+8613312312312" required onChange={this.phoneNumberOnChange} onError={this.phoneNumberOnError} />
        <h2>.mui-forminput(style)</h2>
        <button className="mui-forminput">
          <span className="mui-forminput-label">form input</span>
        </button>
        <button className="mui-forminput">
          <span className="mui-forminput-label">form input with icon and extra text</span>
          <Icon icon="arrow-down-border" />
        </button>
        <button className="mui-forminput mui-forminput-singleline">
          <span className="mui-forminput-label">form input with icon and extra text</span>
          <Icon icon="bellSchedule" />
        </button>
        <button className="mui-forminput mui-forminput-error">
          <span className="mui-forminput-label">form input error</span>
        </button>
        <button className="mui-forminput" disabled>
          <span className="mui-forminput-label">form input disabled</span>
        </button>
        <h2>Button</h2>
        <Button type="default" label="DEFAULT" onClick={this.buttonOnClick} />
        <Button type="default" label="ERROR" color="error" onClick={this.buttonOnClick} />
        <Button type="default" disabled label="DISABLED" onClick={this.buttonOnClick} />
        <Button type="ghost" label="GHOST" onClick={this.buttonOnClick} />
        <Button type="ghost" label="ERROR" color="error" onClick={this.buttonOnClick} />
        <Button type="ghost" disabled label="DISABLED" onClick={this.buttonOnClick} />
        <h2>Radio</h2>
        <Radio checked label="CHECKED" />
        <Radio label="UNCHECKED" />
        <Radio checked label="DISABLED" disabled />
        <Radio label="DISABLED" disabled />
        <h2>RadioGroup</h2>
        <RadioGroup data={this.state.radioGroupData} value={2} />
        <RadioGroup data={this.state.radioGroupData} value={2} disabled />
        <RadioGroup data={this.state.radioGroupData} value={7} required display="grid" itemsInSingleRow={6} />
        <h2>CheckBox</h2>
        <CheckBox checked label="CHECKED" />
        <CheckBox label="UNCHECKED" />
        <CheckBox checked label="DISABLED" disabled />
        <CheckBox label="DISABLED" disabled />
        <h2>CheckBoxGroup</h2>
        <CheckBoxGroup
          data={this.state.radioGroupData}
          value={{
            2: true,
          }}
        />
        <CheckBoxGroup
          data={this.state.radioGroupData}
          value={{
            2: true,
          }}
          disabled
        />
        <CheckBoxGroup
          data={this.state.radioGroupData}
          value={{
            7: true,
          }}
          required
          display="grid"
          itemsInSingleRow={6}
        />
        <h2>Dropdown</h2>
        <Dropdown value={7} data={this.state.radioGroupData} label="Dropdown" required />
        <Dropdown value={2} data={this.state.radioGroupData} label="disabled" disabled />
        <h2>DateTime</h2>
        <DateTime label="Date" required />
        <DateTime label="DateTime" type="datetime" required />
        <DateTime label="disabled" disabled />
        <h2>DateTimeRange</h2>
        <DateTimeRange label="Date" required />
        <DateTimeRange label="DateTime" type="datetime" required />
        <DateTimeRange label="disabled" disabled />
        <h2>UserPicker</h2>
        <UserPicker label="UserPicker" required />
        <UserPicker label="disabled" disabled />
        <h2>DepartmentPicker</h2>
        <DepartmentPicker label="DepartmentPicker" onChange={this.departmentPickerOnChange} />
        <DepartmentPicker label="DepartmentPicker" disabled />
        <h2>CompanyPicker</h2>
        <CompanyPicker label="CompanyPicker" type="jobGrade" onChange={this.companyPickerOnChange} />
        <CompanyPicker label="CompanyPicker" disabled />
        <h2>AreaPicker</h2>
        <AreaPicker label="AreaPicker" onChange={this.areaPickerOnChange} />
        <AreaPicker label="AreaPicker" disabled />
      </div>
    );
  }
}

export default DossierComponents;
