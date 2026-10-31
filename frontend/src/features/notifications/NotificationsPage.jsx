import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import OperationalAlerts from '../dashboard/components/OperationalAlerts';
import {
  fetchOperationalAlerts,
  createAlert,
  deleteAlert,
  setAlertSeverity,
} from '../dashboard/dashboardSlice';
import { selectSortedAlerts, selectOperationalAlertsState } from '../dashboard/dashboardSelectors';

export const NotificationsPage = () => {
  const dispatch = useDispatch();
  const sortedAlerts = useSelector(selectSortedAlerts);
  const alertsState = useSelector(selectOperationalAlertsState);

  return (
    <PageContainer>
      <PageHeader
        title="Notification & Broadcast Center"
        subtitle="Manage real-time administrative alerts, warehouse low stock warnings, and technician escalations"
      />

      <OperationalAlerts
        alerts={sortedAlerts}
        filterSeverity={alertsState.filterSeverity}
        onFilterChange={(severity) => {
          dispatch(setAlertSeverity(severity));
          dispatch(fetchOperationalAlerts({ severity }));
        }}
        isLoading={alertsState.isLoading}
        error={alertsState.error}
        onRetry={() => dispatch(fetchOperationalAlerts({ severity: alertsState.filterSeverity }))}
        onCreateAlert={async (data) => {
          await dispatch(createAlert(data));
        }}
        onDismissAlert={async (id) => {
          await dispatch(deleteAlert(id));
        }}
      />
    </PageContainer>
  );
};

export default NotificationsPage;

