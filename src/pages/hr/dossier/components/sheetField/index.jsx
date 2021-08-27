import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';
import Linkify from 'react-linkify';
import UploadFiles from 'src/components/UploadFiles';
import UserHead from 'src/pages/feed/components/userHead';
import List from '../link-picker/list';
import './style.less';

class SheetField extends Component {
  static propTypes = {
    /**
     * 当前选中的值
     */
    value: PropTypes.any,
    // 关联的字段的类型
    sourceControlType: PropTypes.number, // 字段类型
    sourceControlId: PropTypes.string, // 字段id
    options: PropTypes.array, // 单选多选单选下拉的选项
    enumDefault: PropTypes.number,
    unit: PropTypes.string,
  };
  render() {
    const sourceControlType = this.props.sourceControlType;
    if (this.props.value) {
      let value;
      try {
        value = JSON.parse(this.props.value).filter(item => item);
      } catch (err) {
        return '';
      }
      if (sourceControlType === 26 || sourceControlType === 27 || sourceControlType === 14 || sourceControlType === 21) {
        value = value.filter(item => JSON.parse(item).length > 0);
      }
      if (sourceControlType === 17 || sourceControlType === 18) {
        value = value.filter(item => JSON.parse(item)[0] && JSON.parse(item)[1]);
      }
      if (sourceControlType === 28) {
        value = value.filter(item => item !== '0');
      }
      switch (this.props.sourceControlType) {
        case 2:
          return (<div className="mui-textview Gray_75 WordBreak">
            <Linkify properties={{ target: '_blank' }}>{value.join ? value.join('、') : value}</Linkify>
          </div>);
        case 6:
        case 8:
          return (<div className="mui-textview Gray_75 WordBreak">
            {value.join ? value.map(item => (item.indexOf('.') > -1 ? item.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,') : item.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')) + (this.props.unit ? this.props.unit : '')).join('、') : value}
          </div>);
        case 9:
        case 11: {
          return (<div className="mui-textview Gray_75 WordBreak">{value.map((valueItem) => {
            const selectItem = this.props.options.filter(optionItem => optionItem.key == valueItem);
            return selectItem.length > 0 ? selectItem[0].value : '';
          }).join('、')}</div>);
        }
        case 10: {
          return (<div className="mui-textview Gray_75 WordBreak">{value.map((valueItem) => {
            const text = [];
            if (valueItem) {
              const arr = [];
              const selectArr = valueItem.toString().split('');
              selectArr.forEach((selectValue, key) => {
                if (selectValue !== '0') {
                  arr.push((parseInt(selectValue, 10) * Math.pow(10, selectArr.length - key - 1)).toString());
                }
              });
              this.props.options.forEach((optItem, index) => {
                if (arr.indexOf(optItem.key) >= 0) {
                  text.push(optItem.value);
                }
              });
            }
            return text.join(',');
          }).join('、')}</div>);
        }
        case 14: {
          let attachmentData = []
          _.forEach(value, (valueItem) => {
            attachmentData = attachmentData.concat(JSON.parse(valueItem));
          })
          return (
            <UploadFiles
              isUpload={false}
              attachmentData={attachmentData}
            />
          );
        }
        case 15:
          return (<div className="mui-textview Gray_75 WordBreak">
            { value.map(time => moment(time).format('YYYY/MM/DD')).join('、') }
          </div>);
        case 16:
          return (<div className="mui-textview Gray_75 WordBreak">
            { value.map(time => moment(time).format('YYYY/MM/DD HH:mm')).join('、') }
          </div>);
        case 17:
        case 18:
          return (<div className="mui-textview Gray_75 WordBreak">
            {value.map ? value.map((valueItem) => {
              if (!valueItem) {
                return '';
              }
              let times = JSON.parse(valueItem);
              times = times.map(time => (sourceControlType === 17 ? moment(time).format('YYYY/MM/DD') : moment(time).format('YYYY/MM/DD HH:mm')));
              return _l('%0 至 %1', times[0] || '-', times[1] || '-');
            }).join('、') : value}
          </div>);
        case 21: {
          let data = []
          _.forEach(value, (valueItem) => {
            data = data.concat(valueItem ? JSON.parse(valueItem) : []);
          })
          return (<List className='mTop5' data={data} disabled />);
        }
        case 26: {
          let data = []
          _.forEach(value, (valueItem) => {
            data = data.concat(valueItem ? JSON.parse(valueItem) : []);
          })
          return (data.map((item, index) =>
            <UserHead
              className="userHead InlineBlock mRight6 TxtMiddle mTop6"
              alwaysBindCard
              key={index}
              user={{
                userHead: item.avatar,
                accountId: item.accountId,
              }}
              size={24}
              lazy='false'
            />)
          );
        }
        case 27:
          return (<div className="mui-textview Gray_75 WordBreak">
            {value.map ? value.map((valueItem) => { return valueItem ? JSON.parse(valueItem)[0].departmentName : ''; }).join('、') : value}
          </div>);
        case 28:
          return (<div className="mui-textview Gray_75 WordBreak">
            {value.join ? value.map((item) => { return this.props.enumDefault === 1 ? item + '星' : item + '级'; }).join('、') : value}
          </div>);
        default: {
          if (this.props.sourceControlId === 'ownerid' || this.props.sourceControlId === 'caid') {
            let data = []
            _.forEach(value, (valueItem) => {
              data = data.concat(valueItem ? JSON.parse(valueItem) : []);
            })
            return (data.map((item, index) =>
              <UserHead
                className="userHead InlineBlock mRight6 mTop6"
                alwaysBindCard
                key={index}
                user={{
                  userHead: item.avatar,
                  accountId: item.accountId,
                }}
                size={24}
                lazy='false'
              />)
            );
          }
          return (<div className="mui-textview Gray_75 WordBreak">
            {value.join ? value.join('、') : value}
          </div>);
        }
      }
    }
    return null;
  }
}

SheetField.defaultProps = {
  value: [],
};

export default SheetField;
