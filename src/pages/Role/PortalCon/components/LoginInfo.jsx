import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import moment from 'moment';
import { Icon, Radio, MdAntDateRangePicker, Dropdown } from 'ming-ui';
import PorTalTable from 'src/pages/Role/PortalCon/tabCon/portalComponent/PortalTable';
import cx from 'classnames';
import autoSize from 'ming-ui/decorators/autoSize';
const AutoSizePorTalTable = autoSize(PorTalTable);
import externalPortalAjax from 'src/api/externalPortal';
import { pageSize } from '../tabCon/util';
import _ from 'lodash';

const Wrap = styled.div`
  .con {
    min-height: 400px;
    padding-bottom: 20px;
    overflow: auto;
  }
  .topAct {
    padding-bottom: 16px;
    .searchWrapper {
      width: 230px;
      height: 32px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 3px;
      vertical-align: middle;
      .cursorText {
        height: 30px;
        border: none;
      }

      display: flex;
      padding: 0 5px;
      input {
        flex: 1;
        width: 178px;
        border: none;
        line-height: 32px;
        box-sizing: border-box;
        vertical-align: top;
      }
      i::before {
        line-height: 32px;
      }
      .none {
        display: none;
      }
    }
    .ant-picker {
      width: 410px;
      .ant-picker-input {
        height: 32px;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 3px;
        padding: 0 15px;
      }
    }
  }
`;

let ajaxFn = null;
function LoginInfo(props) {
  const { appId } = props;
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setloading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setLastTimeStart] = useState('');
  const [endDate, setLastTimeTimeEnd] = useState('');
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [columns, setColumns] = useState([
    {
      id: 'accountId',
      width: 150,
      name: _l('用户'),
      render: (control, data = {}) => {
        return (
          <div className="userImgBox">
            {/* <img src={data.log.avatar} alt="" width={26} srcset="" /> */}
            <span className="name mLeft5">{data.log.fullname}</span>
          </div>
        );
      },
    },
    {
      id: 'mobilePhone',
      width: 150,
      name: _l('手机号'),
      render: (control, data = {}) => {
        return data.log.mobilePhone;
      },
    },
    {
      id: 'email',
      width: 150,
      name: _l('邮箱'),
      render: (control, data = {}) => {
        return data.log.email;
      },
    },
    {
      id: 'userAgent',
      width: 170,
      name: _l('终端平台'),
      render: (control, data = {}) => {
        return data.log.userAgent;
      },
    },
    {
      id: 'ip',
      width: 150,
      name: _l('IP地址'),
      render: (control, data = {}) => {
        return data.log.ip;
      },
    },
    {
      id: 'date',
      name: _l('登录时间'),
      width: 170,
      render: (control, data = {}) => {
        return data.date;
      },
    },
  ]);
  const getList = () => {
    if (loading) {
      return;
    }
    setloading(true);
    ajaxFn && ajaxFn.abort();
    ajaxFn = externalPortalAjax.getUserActionLogs({
      appId,
      fullnameOrMobilePhone: searchValue, //用户名或手机号
      startDate,
      endDate,
      pageIndex,
      pageSize,
    });
    _.debounce(() => {
      ajaxFn.then(res => {
        setloading(false);
        const { data = {} } = res;
        setList(data.list || []);
        setCount(data.totalCount || 0);
      });
    }, 500)();
  };
  useEffect(() => {
    getList();
  }, [searchValue, startDate, endDate, pageIndex]);
  return (
    <Wrap>
      <div className="topAct">
        <span className="title InlineBlock Gray_75">{_l('用户')}</span>
        <div className="searchWrapper InlineBlock mLeft16">
          <Icon icon="search" className="Font18 Gray_9e" />
          <input
            type="text"
            className="cursorText"
            placeholder={_l('搜索用户名称、手机号、邮箱')}
            onChange={event => {
              const searchValue = _.trim(event.target.value);
              if (!searchValue) {
                setSearchValue('');
              } else {
                setSearchValue(searchValue);
              }
            }}
            value={searchValue}
          />
          {searchValue && (
            <Icon
              icon="cancel"
              className="Font18 Hand Gray_9e"
              onClick={() => {
                setSearchValue('');
              }}
            />
          )}
        </div>
        <span className="Gray_75 mLeft50 InlineBlock">{_l('登录时间')}</span>
        <MdAntDateRangePicker
          defaultValue={[]}
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          onChange={(moments, dateString) => {
            setLastTimeStart(!moments || !moments[0] ? '' : moments[0].format('YYYY-MM-DD HH:mm'));
            setLastTimeTimeEnd(!moments || !moments[1] ? '' : moments[1].format('YYYY-MM-DD HH:mm'));
          }}
          onOk={moments => {
            setLastTimeStart(!moments || !moments[0] ? '' : moments[0].format('YYYY-MM-DD HH:mm'));
          }}
        />
      </div>
      <div className="con">
        <AutoSizePorTalTable
          columns={columns}
          noShowCheck
          list={list}
          pageSize={pageSize}
          pageIndex={pageIndex}
          total={count}
          changePage={pageIndex => {
            setPageIndex(pageIndex);
          }}
        />
      </div>
    </Wrap>
  );
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LoginInfo);
