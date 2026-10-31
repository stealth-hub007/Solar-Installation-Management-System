import { useState, useMemo } from 'react';

export const useTechnicianFilters = ({
  initialData = [],
  initialPage = 1,
  initialPageSize = 10,
  searchFields = ['id', 'customerName', 'siteAddress', 'jobNumber'],
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState('scheduledDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const filteredData = useMemo(() => {
    let result = [...initialData];

    // Status filtering
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((item) => {
        const itemStatus = (item.status || item.survey_status || item.installation_status || '').toUpperCase();
        return itemStatus === statusFilter.toUpperCase();
      });
    }

    // Search filtering
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          return val ? String(val).toLowerCase().includes(q) : false;
        })
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortColumn] ?? '';
      let bVal = b[sortColumn] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [initialData, search, statusFilter, sortColumn, sortDirection, searchFields]);

  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortColumn,
    sortDirection,
    handleSort,
    filteredData,
    paginatedData,
    totalRecords,
    totalPages,
  };
};

export default useTechnicianFilters;

