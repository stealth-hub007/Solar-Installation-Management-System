import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import RecentProjects from '../dashboard/components/RecentProjects';
import {
  fetchRecentProjects,
  deleteProject,
  setProjectsFilters,
  setProjectsPagination,
  resetProjectsFilters,
} from '../dashboard/dashboardSlice';
import { selectRecentProjects } from '../dashboard/dashboardSelectors';

export const InstallationsPage = () => {
  const dispatch = useDispatch();
  const projectsState = useSelector(selectRecentProjects);

  useEffect(() => {
    dispatch(
      fetchRecentProjects({
        page: projectsState.pagination.page,
        pageSize: projectsState.pagination.pageSize,
        search: projectsState.filters.search,
        status: projectsState.filters.status,
        sortBy: projectsState.filters.sortBy,
        sortDirection: projectsState.filters.sortDirection,
      })
    );
  }, [
    dispatch,
    projectsState.pagination.page,
    projectsState.pagination.pageSize,
    projectsState.filters.search,
    projectsState.filters.status,
    projectsState.filters.sortBy,
    projectsState.filters.sortDirection,
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Installation & Field Execution"
        subtitle="Track technician work orders, rooftop structure mounting, PV stringing, and DISCOM net-meter grid syncing"
      />

      <RecentProjects
        data={projectsState.data}
        pagination={projectsState.pagination}
        filters={projectsState.filters}
        isLoading={projectsState.isLoading}
        error={projectsState.error}
        onPageChange={(page) => dispatch(setProjectsPagination({ page }))}
        onPageSizeChange={(pageSize) => dispatch(setProjectsPagination({ pageSize, page: 1 }))}
        onFiltersChange={(filters) => dispatch(setProjectsFilters(filters))}
        onResetFilters={() => dispatch(resetProjectsFilters())}
        onRetry={() => dispatch(fetchRecentProjects())}
        onDeleteProject={async (id) => {
          await dispatch(deleteProject(id));
          dispatch(fetchRecentProjects(projectsState.pagination));
        }}
      />
    </PageContainer>
  );
};

export default InstallationsPage;

