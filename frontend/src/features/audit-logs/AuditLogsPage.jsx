import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import RecentActivity from '../dashboard/components/RecentActivity';
import {
  fetchRecentActivity,
  setActivityFilters,
  setActivityPagination,
  resetActivityFilters,
} from '../dashboard/dashboardSlice';
import { selectRecentActivity } from '../dashboard/dashboardSelectors';

export const AuditLogsPage = () => {
  const dispatch = useDispatch();
  const activityState = useSelector(selectRecentActivity);

  useEffect(() => {
    dispatch(
      fetchRecentActivity({
        page: activityState.pagination.page,
        pageSize: activityState.pagination.pageSize,
        search: activityState.filters.search,
        module: activityState.filters.module,
        sortBy: activityState.filters.sortBy,
        sortDirection: activityState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    activityState.pagination.page,
    activityState.pagination.pageSize,
    activityState.filters.search,
    activityState.filters.module,
    activityState.filters.sortBy,
    activityState.filters.sortDirection,
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs & Activity Stream"
        subtitle="Immutable security trail of administrative actions, payment verifications, and technician site updates"
      />

      <RecentActivity
        data={activityState.data}
        pagination={activityState.pagination}
        filters={activityState.filters}
        isLoading={activityState.isLoading}
        error={activityState.error}
        onPageChange={(page) => dispatch(setActivityPagination({ page }))}
        onPageSizeChange={(pageSize) => dispatch(setActivityPagination({ pageSize, page: 1 }))}
        onFiltersChange={(filters) => dispatch(setActivityFilters(filters))}
        onResetFilters={() => dispatch(resetActivityFilters())}
        onRetry={() => dispatch(fetchRecentActivity())}
      />
    </PageContainer>
  );
};

export default AuditLogsPage;

