import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import RecentEnquiries from '../dashboard/components/RecentEnquiries';
import {
  fetchRecentEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  setEnquiriesFilters,
  setEnquiriesPagination,
  resetEnquiriesFilters,
} from '../dashboard/dashboardSlice';
import { selectRecentEnquiries } from '../dashboard/dashboardSelectors';

export const EnquiriesPage = () => {
  const dispatch = useDispatch();
  const enquiriesState = useSelector(selectRecentEnquiries);

  useEffect(() => {
    dispatch(
      fetchRecentEnquiries({
        page: enquiriesState.pagination.page,
        pageSize: enquiriesState.pagination.pageSize,
        search: enquiriesState.filters.search,
        status: enquiriesState.filters.status,
        sortBy: enquiriesState.filters.sortBy,
        sortDirection: enquiriesState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    enquiriesState.pagination.page,
    enquiriesState.pagination.pageSize,
    enquiriesState.filters.search,
    enquiriesState.filters.status,
    enquiriesState.filters.sortBy,
    enquiriesState.filters.sortDirection,
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Enquiry & Lead Management"
        subtitle="Manage prospective rooftop solar consumer enquiries, channel partner leads, and qualification workflows"
      />

      <RecentEnquiries
        data={enquiriesState.data}
        pagination={enquiriesState.pagination}
        filters={enquiriesState.filters}
        isLoading={enquiriesState.isLoading}
        error={enquiriesState.error}
        onPageChange={(page) => dispatch(setEnquiriesPagination({ page }))}
        onPageSizeChange={(pageSize) => dispatch(setEnquiriesPagination({ pageSize, page: 1 }))}
        onFiltersChange={(filters) => dispatch(setEnquiriesFilters(filters))}
        onResetFilters={() => dispatch(resetEnquiriesFilters())}
        onRetry={() => dispatch(fetchRecentEnquiries())}
        onCreateEnquiry={async (data) => {
          await dispatch(createEnquiry(data));
          dispatch(fetchRecentEnquiries(enquiriesState.pagination));
        }}
        onUpdateEnquiry={async ({ id, data }) => {
          await dispatch(updateEnquiry({ id, data }));
          dispatch(fetchRecentEnquiries(enquiriesState.pagination));
        }}
        onDeleteEnquiry={async (id) => {
          await dispatch(deleteEnquiry(id));
          dispatch(fetchRecentEnquiries(enquiriesState.pagination));
        }}
      />
    </PageContainer>
  );
};

export default EnquiriesPage;

