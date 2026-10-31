import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import RecentServiceTickets from '../dashboard/components/RecentServiceTickets';
import {
  fetchRecentServiceTickets,
  createServiceTicket,
  updateServiceTicket,
  deleteServiceTicket,
  setServiceTicketsFilters,
  setServiceTicketsPagination,
  resetServiceTicketsFilters,
} from '../dashboard/dashboardSlice';
import { selectRecentServiceTickets } from '../dashboard/dashboardSelectors';

export const ServiceTicketsPage = () => {
  const dispatch = useDispatch();
  const serviceTicketsState = useSelector(selectRecentServiceTickets);

  useEffect(() => {
    dispatch(
      fetchRecentServiceTickets({
        page: serviceTicketsState.pagination.page,
        pageSize: serviceTicketsState.pagination.pageSize,
        search: serviceTicketsState.filters.search,
        priority: serviceTicketsState.filters.priority,
        sortBy: serviceTicketsState.filters.sortBy,
        sortDirection: serviceTicketsState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    serviceTicketsState.pagination.page,
    serviceTicketsState.pagination.pageSize,
    serviceTicketsState.filters.search,
    serviceTicketsState.filters.priority,
    serviceTicketsState.filters.sortBy,
    serviceTicketsState.filters.sortDirection,
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Service Ticket & Warranty O&M"
        subtitle="Manage rooftop solar breakdown incidents, inverter fault codes, and engineer dispatch dispatches"
      />

      <RecentServiceTickets
        data={serviceTicketsState.data}
        pagination={serviceTicketsState.pagination}
        filters={serviceTicketsState.filters}
        isLoading={serviceTicketsState.isLoading}
        error={serviceTicketsState.error}
        onPageChange={(page) => dispatch(setServiceTicketsPagination({ page }))}
        onPageSizeChange={(pageSize) => dispatch(setServiceTicketsPagination({ pageSize, page: 1 }))}
        onFiltersChange={(filters) => dispatch(setServiceTicketsFilters(filters))}
        onResetFilters={() => dispatch(resetServiceTicketsFilters())}
        onRetry={() => dispatch(fetchRecentServiceTickets())}
        onCreateTicket={async (data) => {
          await dispatch(createServiceTicket(data));
          dispatch(fetchRecentServiceTickets(serviceTicketsState.pagination));
        }}
        onDeleteTicket={async (id) => {
          await dispatch(deleteServiceTicket(id));
          dispatch(fetchRecentServiceTickets(serviceTicketsState.pagination));
        }}
      />
    </PageContainer>
  );
};

export default ServiceTicketsPage;

