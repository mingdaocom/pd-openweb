import React from 'react';
import config from '../../../config';
import Checkbox from '../../common/checkbox';
import RadioGroup from '../../common/radioGroup';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { widget } = this.props;
    let { data } = widget;
    let checkedIndex = '';
    let radios = data.options.map((item, index) => {
      if (item.isDeleted) {
        return null;
      }
      if (item.checked && !item.isDeleted) {
        checkedIndex = index;
      }
      return {
        value: index,
        name: item.value,
      };
    });
    _.remove(radios, item => item === null);
    return (
      <div className="editModel editOptions">
        {data.type === widget.SINGLE ? (
          <RadioGroup data={radios} checkedValue={checkedIndex} changeRadioValue={() => {}} size="small" />
        ) : (
          data.options.map((item, index) => {
            if (item.isDeleted) {
              return null;
            }
            return <Checkbox name={item.value} key={index} toggleCheckbox={() => {}} checked={item.checked} />;
          })
        )}
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.OPTIONS.type,
  EditModel,
};
