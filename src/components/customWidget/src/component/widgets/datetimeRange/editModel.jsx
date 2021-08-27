import React from 'react';
import config from '../../../config';

import { RangeLengthType, SignType } from './data';

class EditModel extends React.Component {
  renderContent = () => {
    const dataSource = this.props.widget.data.dataSource;
    if (!dataSource || dataSource === SignType.DATETIMERANGE) {
      let value = this.props.widget.data.hint || _l('选择开始和结束时间');
      if (this.props.widget.data.enumDefault2 === RangeLengthType.show) {
        value += _l(' 时长：');
      }
      return (
        <div className="editModel">
          <textarea
            readOnly
            value={value}
            style={{
              color: '#ccc',
              border: '0',
              background: 'transparent',
            }}
          />
        </div>
      );
    } else if (dataSource === SignType.LEAVE) {
      return (
        <div className="editModel">
          <table className="editDetailedList">
            <tbody>
              <tr>
                <td>请假类型：</td>
                <td />
              </tr>
              <tr>
                <td>请假时段：</td>
                <td />
              </tr>
              <tr>
                <td>请假时长：</td>
                <td />
              </tr>
              <tr>
                <td>请假原因：</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      );
    } else if (dataSource === SignType.OVERTIME) {
      return (
        <div className="editModel">
          <table className="editDetailedList">
            <tbody>
              <tr>
                <td>加班时段：</td>
                <td />
              </tr>
              <tr>
                <td>加班时长：</td>
                <td />
              </tr>
              <tr>
                <td>加班事由：</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      );
    } else if (dataSource === SignType.FIELDWORK) {
      return (
        <div className="editModel">
          <table className="editDetailedList">
            <tbody>
              <tr>
                <td>出差时段：</td>
                <td />
              </tr>
              <tr>
                <td>出差时长：</td>
                <td />
              </tr>
              <tr>
                <td>出差事由：</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      );
    } else if (dataSource === SignType.OUTWORK) {
      return (
        <div className="editModel">
          <table className="editDetailedList">
            <tbody>
              <tr>
                <td>出差时段：</td>
                <td />
              </tr>
              <tr>
                <td>出差时长：</td>
                <td />
              </tr>
              <tr>
                <td>出差事由：</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  render() {
    const content = this.renderContent();

    return content;
  }
}

export default {
  type: config.WIDGETS.DATE_TIME_RANGE.type,
  EditModel,
};
