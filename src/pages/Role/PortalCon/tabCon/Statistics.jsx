import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Modal, Select } from 'ming-ui/antd-components';
import externalPortalAjax from 'src/api/externalPortal';
import LoginInfoDialog from 'src/pages/Role/PortalCon/components/LoginInfo';
import * as actions from '../redux/actions';

const Wrap = styled.div`
  padding: 16px 32px 40px;
  .timeTypeDrop {
    width: 180px;
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
    label: _l('最近 7 天'),
  },
  {
    value: 1,
    label: _l('最近一个月'),
  },
  {
    value: 2,
    label: _l('最近一季度'),
  },
  {
    value: 3,
    label: _l('最近半年'),
  },
  {
    value: 4,
    label: _l('最近一年'),
  },
]; //颗粒度：最近7天、最近一个月、最近一季度、最近半年、最近一年

function Statistics(props) {
  const { appId } = props;
  const [show, setShow] = useState(false);
  const [timeType, setTimeType] = useState(props.timeType || 0); //时间段
  const [dataRegister, setData] = useState([]); //注册量
  //访问量
  const [dataVisits, setDataLogin] = useState([]);
  const [g2plotComponent, setG2plotComponent] = useState(null);
  const registerEl = useRef(null);
  const loginEl = useRef(null);
  const chartOptions = useMemo(
    () => ({
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
          'g2-tooltip-list-item': { textAlign: 'left', color: 'var(--color-text-title)' },
          'g2-tooltip-title': { color: 'var(--color-text-secondary)' },
        },
      },
      interactions: [{ type: 'marker-active' }],
    }),
    [],
  );
  useEffect(() => {
    let isMounted = true;

    import('@antv/g2plot').then(data => {
      if (isMounted) {
        setG2plotComponent(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    //查看量
    externalPortalAjax
      .dateHistogram({
        appId,
        type: timeType, //0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
      })
      .then((res = {}) => {
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

        for (let key in registerData) {
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
  }, [appId, timeType]);
  useEffect(() => {
    const chartContainer = loginEl.current;

    if (!chartContainer || !g2plotComponent) {
      return;
    }

    const { Line } = g2plotComponent;
    const chart = new Line(chartContainer, {
      ...chartOptions,
      data: dataRegister,
    });
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [chartOptions, dataRegister, g2plotComponent]);

  useEffect(() => {
    const chartContainer = registerEl.current;

    if (!chartContainer || !g2plotComponent) {
      return;
    }

    const { Line } = g2plotComponent;
    const chart = new Line(chartContainer, {
      ...chartOptions,
      data: dataVisits,
    });
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [chartOptions, dataVisits, g2plotComponent]);

  return (
    <Wrap>
      <div>
        <span className="textSecondary LineHeight36">{_l('周期')}</span>
        <Select
          options={TIME}
          value={timeType}
          className={cx('flex timeTypeDrop mLeft16')}
          onChange={newValue => {
            setTimeType(newValue);
          }}
        />
      </div>
      <h6 className="mTop28 Font17">{_l('用户注册量')}</h6>
      <div className={'flex registerLine'} ref={registerEl}></div>
      <h6 className="mTop80 Font17">
        {_l('用户访问量')}
        <Button
          type="primary"
          style={{ height: 32 }}
          className="Right"
          onClick={() => {
            setShow(true);
          }}
        >
          {_l('日志')}
        </Button>
      </h6>
      <div className={'flex loginLine'} ref={loginEl}></div>
      {show && (
        <Modal
          width={1120}
          open={show}
          title={_l('日志')}
          mask={{ closable: true }}
          keyboard
          onCancel={() => setShow(false)}
        >
          <LoginInfoDialog appId={appId} />
        </Modal>
      )}
    </Wrap>
  );
}

const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Statistics);
