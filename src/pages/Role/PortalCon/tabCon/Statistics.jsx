import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Icon, Radio, Dialog, Dropdown } from 'ming-ui';
import cx from 'classnames';
import LoginInfoDialog from 'src/pages/Role/PortalCon/components/LoginInfo';
import { Line, Bar } from '@antv/g2plot';
import externalPortalAjax from 'src/api/externalPortal';
import moment from 'moment';

const Wrap = styled.div`
  padding: 16px 32px 40px;
  .timeTypeDrop {
    width: 180px;
    height: 36px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    .ming.Menu.List {
      top: 36px !important;
    }
    .Dropdown--input {
      display: flex;
      line-height: 36px;
      padding: 0 10px !important;
      .value {
        flex: 1;
      }
      i {
        &::before {
          line-height: 36px;
        }
      }
    }
  }
  .loginConsole {
    height: 32px;
    background: #2196f3;
    border-radius: 3px;
    line-height: 32px;
    color: #fff;
    font-size: 13px;
    float: right;
    padding: 0 15px;
    &:hover {
      background: #1e88e5;
    }
  }
  .registerLine,
  .loginLine {
    height: 300px;
    margin-top: 24px;
  }
`;
const TIME = [
  {
    value: 0,
    text: _l('最近 7 天'),
  },
  {
    value: 1,
    text: _l('最近一个月'),
  },
  {
    value: 2,
    text: _l('最近一季度'),
  },
  {
    value: 3,
    text: _l('最近半年'),
  },
  {
    value: 4,
    text: _l('最近一年'),
  },
]; //颗粒度：最近7天、最近一个月、最近一季度、最近半年、最近一年
let LineChartRegisterEl = null;
let LineChartLoginEl = null;
function Statistics(props) {
  const { appId } = props;
  const [show, setShow] = useState(false);
  const [timeType, setTimeType] = useState(props.timeType || 0); //时间段
  const [dataRegister, setData] = useState([]); //注册量
  //访问量
  const [dataVisits, setDataLogin] = useState([]);
  const registerEl = useRef(null);
  const loginEl = useRef(null);
  const prarm = {
    xField: 'date',
    yField: 'value',
    label: { offsetY: 5, position: 'top' },
    tooltip: {
      fields: ['date', 'value'],
      formatter: datum => {
        return { name: datum.date, value: datum.value };
      },
      showTitle: true,
      title: v => `${moment().format('MM月DD日')}   ${v}`,
      showContent: true,
      domStyles: {
        'g2-tooltip-list-item': { textAlign: 'left', color: '#333' },
        'g2-tooltip-title': { color: '#757575' },
      },
    },
    interactions: [{ type: 'marker-active' }],
  };
  useEffect(() => {
    //查看量
    externalPortalAjax.dateHistogram({
      appId,
      type: timeType, //0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
    }).then((res = {}) => {
      const { visitsData = {}, registerData = {} } = res;
      let dataVisits = [];
      for (var key in visitsData) {
        dataVisits.push({
          date: key,
          value: visitsData[key],
        });
      }
      dataVisits = dataVisits.sort((a, b) => {
        return a.date > b.date ? 1 : -1;
      });
      setData(dataVisits);
      let dataRegister = [];
      for (var key in registerData) {
        dataRegister.push({
          date: key,
          value: registerData[key],
        });
      }
      dataRegister = dataRegister.sort((a, b) => {
        return a.date > b.date ? 1 : -1;
      });
      setDataLogin(dataRegister);
    });
  }, [timeType]);
  useEffect(() => {
    const $iframe = loginEl.current;
    if (!$iframe) return;
    LineChartLoginEl && LineChartLoginEl.destroy();
    LineChartLoginEl = null;
    LineChartLoginEl = new Line(loginEl.current, {
      ...prarm,
      data: dataRegister,
    });
    return LineChartLoginEl.render();
  }, [timeType, dataRegister]);

  useEffect(() => {
    const $iframe = registerEl.current;
    if (!$iframe) return;
    LineChartRegisterEl && LineChartRegisterEl.destroy();
    LineChartRegisterEl = null;
    LineChartRegisterEl = new Line(registerEl.current, {
      ...prarm,
      data: dataVisits,
    });
    return LineChartRegisterEl.render();
  }, [timeType, dataVisits]);

  return (
    <Wrap>
      <div>
        <span className="Gray_75 LineHeight36">{_l('周期')}</span>
        <Dropdown
          data={TIME}
          value={timeType}
          className={cx('flex InlineBlock timeTypeDrop mLeft16')}
          onChange={newValue => {
            setTimeType(newValue);
          }}
        />
      </div>
      <h6 className="mTop28 Font17">{_l('用户注册量')}</h6>
      <div className={'flex registerLine'} ref={registerEl}></div>
      <h6 className="mTop80 Font17">
        {_l('用户访问量')}
        <span
          className="loginConsole Hand Bold"
          onClick={() => {
            setShow(true);
          }}
        >
          {_l('登录日志')}
        </span>
      </h6>
      <div className={'flex loginLine'} ref={loginEl}></div>
      {show && (
        <Dialog
          className="loginInfo"
          width="1000"
          visible={show}
          title={_l('登录日志')}
          footer={null}
          onCancel={() => {
            setShow(false);
          }}
        >
          <LoginInfoDialog show={show} appId={appId} />
        </Dialog>
      )}
    </Wrap>
  );
}

const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Statistics);
