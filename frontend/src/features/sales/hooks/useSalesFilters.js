import { useState, useMemo, useCallback } from 'react';
import useDebounce from '../../../hooks/useDebounce';

/**
 * Custom hook to manage client/server filtering, sorting, pagination, and debounced search
 */
export const useSalesFilters = ({
  initialData = [],
  initialPageSize = 10,
  filterFields = [],
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const debouncedSearch = useDebounce(search, 250);

  // Handle Sort Toggle
  const handleSort = useCallback((column) => {
    setSortColumn((prevCol) => {
      if (prevCol === column) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return column;
      }
      setSortDirection('asc');
      return column;
    });
  }, []);

  // Filtered and Sorted records
  const filteredData = useMemo(() => {
    let result = [...initialData];

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((item) => {
        const itemStatus = item.status || item.enquiryStatus || item.orderStatus || item.approvalStatus;
        return String(itemStatus).toLowerCase() === String(statusFilter).toLowerCase();
      });
    }

    // Debounced search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter((item) => {
        return Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (aVal === bVal) return 0;
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        const res = aVal > bVal ? 1 : -1;
        return sortDirection === 'desc' ? -res : res;
      });
    }

    return result;
  }, [initialData, statusFilter, debouncedSearch, sortColumn, sortDirection]);

  // Pagination calculation
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((val) => {
    setStatusFilter(val);
    setPage(1);
  }, []);

  return {
    search,
    debouncedSearch,
    setSearch: handleSearchChange,
    page: currentPage,
    setPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    sortColumn,
    sortDirection,
    handleSort,
    filteredData,
    paginatedData,
    totalRecords,
    totalPages,
  };
};

export default useSalesFilters;

