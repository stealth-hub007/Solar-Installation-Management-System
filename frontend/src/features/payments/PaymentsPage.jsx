import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import RecentPayments from '../dashboard/components/RecentPayments';
import {
  fetchRecentPayments,
  updatePayment,
  deletePayment,
  setPaymentsFilters,
  setPaymentsPagination,
  resetPaymentsFilters,
} from '../dashboard/dashboardSlice';
import { selectRecentPayments } from '../dashboard/dashboardSelectors';

export const PaymentsPage = () => {
  const dispatch = useDispatch();
  const paymentsState = useSelector(selectRecentPayments);

  useEffect(() => {
    dispatch(
      fetchRecentPayments({
        page: paymentsState.pagination.page,
        pageSize: paymentsState.pagination.pageSize,
        search: paymentsState.filters.search,
        status: paymentsState.filters.status,
        sortBy: paymentsState.filters.sortBy,
        sortDirection: paymentsState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    paymentsState.pagination.page,
    paymentsState.pagination.pageSize,
    paymentsState.filters.search,
    paymentsState.filters.status,
    paymentsState.filters.sortBy,
    paymentsState.filters.sortDirection,
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Payment & Collections Management"
        subtitle="Track customer milestone receipts, advance booking payments, and DISCOM direct subsidy transfers"
      />

      <RecentPayments
        data={paymentsState.data}
        pagination={paymentsState.pagination}
        filters={paymentsState.filters}
        isLoading={paymentsState.isLoading}
        error={paymentsState.error}
        onPageChange={(page) => dispatch(setPaymentsPagination({ page }))}
        onPageSizeChange={(pageSize) => dispatch(setPaymentsPagination({ pageSize, page: 1 }))}
        onFiltersChange={(filters) => dispatch(setPaymentsFilters(filters))}
        onResetFilters={() => dispatch(resetPaymentsFilters())}
        onRetry={() => dispatch(fetchRecentPayments())}
        onDeletePayment={async (id) => {
          await dispatch(deletePayment(id));
          dispatch(fetchRecentPayments(paymentsState.pagination));
        }}
      />
    </PageContainer>
  );
};

export default PaymentsPage;

