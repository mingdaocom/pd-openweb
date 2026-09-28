import React, { forwardRef, lazy, Suspense } from 'react';
import { LoadDiv } from 'ming-ui';

const createLazyComponent = loader => lazy(() => loader().then(module => ({ default: module.default })));

const LazyTable = createLazyComponent(() => import('antd/es/table'));
const LazyTree = createLazyComponent(() => import('antd/es/tree'));
const LazyDirectoryTree = lazy(() =>
  import('antd/es/tree').then(module => ({ default: module.default.DirectoryTree })),
);
const LazyTreeSelect = createLazyComponent(() => import('antd/es/tree-select'));

const tableFallback = <LoadDiv className="mTop10" />;
const treeFallback = null;

const withSuspense = (LazyComponent, defaultFallback, displayName) => {
  const AsyncComponent = forwardRef(({ lazyFallback = defaultFallback, ...props }, ref) => (
    <Suspense fallback={lazyFallback}>
      <LazyComponent ref={ref} {...props} />
    </Suspense>
  ));

  AsyncComponent.displayName = displayName;

  return AsyncComponent;
};

export const Table = withSuspense(LazyTable, tableFallback, 'AsyncAntdTable');
export const Tree = withSuspense(LazyTree, treeFallback, 'AsyncAntdTree');
export const DirectoryTree = withSuspense(LazyDirectoryTree, treeFallback, 'AsyncAntdDirectoryTree');
export const TreeSelect = withSuspense(LazyTreeSelect, treeFallback, 'AsyncAntdTreeSelect');

TreeSelect.SHOW_ALL = 'SHOW_ALL';
TreeSelect.SHOW_PARENT = 'SHOW_PARENT';
TreeSelect.SHOW_CHILD = 'SHOW_CHILD';
