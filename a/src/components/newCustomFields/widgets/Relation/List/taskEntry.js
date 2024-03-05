import React from 'react';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { Provider } from 'react-redux';
import store from 'redux/configureStore';
import TaskDetail from 'src/pages/task/containers/taskDetail/taskDetail';

export default taskId =>
  functionWrap(
    ({ closeCallback }) => (
      <Provider store={store}>
        <TaskDetail visible openType={3} taskId={taskId} closeCallback={closeCallback} />
      </Provider>
    ),
    { closeFnName: 'closeCallback' },
  );
