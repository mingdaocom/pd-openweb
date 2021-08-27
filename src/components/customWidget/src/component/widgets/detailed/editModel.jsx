import React from 'react';
import config from '../../../config';
import { getEditModel } from '../../editBox/editModels';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { widget } = this.props;
    let { data } = widget;
    let EditModels;
    return (
      <div className="editModel editDetailed">
        <div className="Font14 bold">{data.controlName}</div>
        <table className="editDetailedList">
          <tbody>
            <tr>
              <td colSpan="2">{data.controlName}-1</td>
            </tr>
            {_.map(data.controls, (item, index) => {
              if (!item.type) {
                return (
                  <tr key={index}>
                    <td />
                    <td />
                  </tr>
                );
              }

              EditModels = getEditModel(item.type);
              return (
                <tr key={index}>
                  <td>{item.data.controlName}</td>
                  <td>
                    <EditModels widget={item} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.DETAILED.type,
  EditModel,
};
