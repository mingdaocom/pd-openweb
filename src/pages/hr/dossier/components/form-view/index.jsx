import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';

import Item from './item';
import Controls from '../form-control';
import UploadFiles from 'src/components/UploadFiles';

import './style.less';

class List extends Component {
  /**
   * 渲染表单
   */
  renderForm = (controlList) => {
    const formList = [];

    if (controlList && controlList.length) {
      // 前一个 row
      let prevRow = 0;
      // 前一个 col
      let prevCol = 0;

      controlList.map((item, i, list) => {
        if (item.type !== 'DIVIDER') {
          // add clearfix for different row
          if (item.row !== prevRow) {
            formList.push(<div className="mui-clearfix" key={`clearfix-${item.row}`} />);
          }

          if (item.type === Controls.type.FORMGROUP) {
            const contents = this.renderGroup(item);
            const statistics = this.generateStatistics(item);

            formList.push(
              <div key={`item-${item.row}-${item.col}`} className="mui-formview-formgroup">
                <h3>{item.label}</h3>
                {contents}
                {statistics}
              </div>
            );
          } else if (item.type === Controls.type.FILEATTACHMENT) {
            const contents = this.renderFileAttachment(item);

            formList.push(
              <li key={`item-${item.row}-${item.col}`} className="mui-formview-item">
                <span className="mui-formview-item-label" title={item.label}>
                  {_l(item.label)}
                </span>
                <span className="mui-formview-item-value">{contents}</span>
              </li>
            );
          } else if (item.type === Controls.type.SIGNGROUP) {
            const contents = this.renderForm(item.data);

            formList.push(
              <div key={`item-${item.row}-${item.col}`} className="mui-formview-signgroup">
                {contents}
              </div>
            );
          } else {
            // form item
            formList.push(<Item key={`item-${item.row}-${item.col}`} size={item.size} label={item.label} value={item.valueText} />);
          }

          // update row and col
          prevRow = item.row;
          prevCol = item.col;
        }

        return null;
      });
    }
    return formList;
  };

  renderGroup = (group) => {
    if (!group.config || !group.config.values) {
      return;
    }

    const list = group.config.values.map((values, i) => {
      const controls = group.data.map((item, j) => {
        const _item = _.cloneDeep(item);
        _item.value = values[_item.id].value;
        _item.valueText = values[_item.id].valueText;

        return _item;
      });

      const contents = this.renderForm(controls);

      return (
        <section key={`subgroup-${i}`}>
          <h4>{`${group.label}-${i + 1}`}</h4>
          {contents}
        </section>
      );
    });

    return list;
  };

  generateStatistics = (group) => {
    const list = {};
    const data = [];
    group.data.map((item) => {
      if (item.config && item.config.sum) {
        list[item.id] = {
          value: 0,
        };

        data.push({
          id: item.id,
          label: item.label,
          value: 0,
        });
      }

      return null;
    });

    group.value.map((item) => {
      for (const id in item) {
        if (item[id] !== undefined && list[id]) {
          const value = parseFloat(item[id]) ? parseFloat(item[id]) : 0;
          list[id].value = list[id].value + value;
        }
      }

      return null;
    });

    data.map((item) => {
      item.value = list[item.id].value;

      return null;
    });

    const trs = data.map((item, i) => {
      return (
        <tr key={i}>
          <td>{`${item.label}${_l('统计')}`}</td>
          <td>{item.value}</td>
        </tr>
      );
    });

    return (
      <div className="mui-formview-formgroup-statistics">
        <table>
          <thead>
            <tr>
              <th colSpan="2">{_l('统计')}</th>
            </tr>
          </thead>
          <tbody>{trs}</tbody>
        </table>
      </div>
    );
  };

  parseFiles = (value) => {
    const data = {
      // 本地附件
      attachments: [],
      // 知识附件
      knowledgeAtt: [],
      // 已保存的附件
      attachmentData: [],
    };

    if (value && value.map) {
      value.map((_file, i, list) => {
        if (_file.refType) {
          data.knowledgeAtt.push(_file);
        } else {
          data.attachments.push(_file);
        }

        data.attachmentData.push(_file);

        return null;
      });
    }

    return data;
  };

  renderFileAttachment = (item) => {
    const data = this.parseFiles(item.value);

    return <UploadFiles isUpload={false} attachmentData={data.attachmentData} />;
  };

  render() {
    let content = [];
    if (this.props.data && this.props.data.length) {
      content = this.renderForm(this.props.data);
    }

    return <ul className="mui-formview">{content}</ul>;
  }
}

List.propTypes = {
  /**
   * 表单数据
   */
  data: PropTypes.any,
};

List.defaultProps = {
  data: [],
};

export default List;
