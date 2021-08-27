import React from 'react';
import MultipleDropdown from 'ming-ui/components/MultipleDropdown';

class DropDownCheck extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const multipleDropdownOptions = [{
      label: _l('选择本页'),
      value: 1,
      // },
      // {
      //   label: _l('选择所有'),
      //   value: 2,
    }]

    return <MultipleDropdown
      className={'toolBtn ThemeColor3 mLeft20'}
      label={' '}
      options={multipleDropdownOptions}
      onClick={(e, value) => {
        switch (value) {
          case 1:
            this.props.chooseThisPage()
            break;
          case 2:
            this.props.chooseAll()
            break;
        }
      }} />
  }
}

export default DropDownCheck;