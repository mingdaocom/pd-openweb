import React from 'react';
import SectionStyleItem from './SectionStyleItem';
import { getOptionsByEnumDefault } from './config';
import DropComponent from 'src/pages/widgetConfig/components';
import './index.less';
const { Dropdown } = DropComponent;

const getDropData = () => {
  return Array.from({ length: 7 }).map((item, index) => {
    const param = {
      advancedSetting: getOptionsByEnumDefault(index),
      controlName: _l('标题'),
      enumDefault: index,
      enumDefault2: 1,
      controlId: index,
    };
    return {
      value: index,
      children: <SectionStyleItem data={param} from="setting" />,
    };
  });
};

export default function StyleSetting(props) {
  const { data, handleChange } = props;

  return (
    <Dropdown
      overlayClassName="sectionStyleDrop"
      value={data.enumDefault}
      data={getDropData()}
      renderDisplay={() => {
        return (
          <div className="mTop5 w100 mBottom5">
            <SectionStyleItem data={{ ...data, enumDefault2: 1, controlName: _l('标题') }} from="setting" />
          </div>
        );
      }}
      onChange={value => {
        const options = getOptionsByEnumDefault(value);
        handleChange(options, value);
      }}
    />
  );
}
