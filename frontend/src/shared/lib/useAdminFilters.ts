import { useState } from "react";

export function useAdminFilters<T extends object>(initialFilters: T) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<T>(initialFilters);

  const setFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setFilters(initialFilters);
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    (Object.keys(initialFilters) as Array<keyof T>).some(
      (key) => filters[key] !== initialFilters[key],
    );

  return {
    searchInput,
    setSearchInput,
    searchQuery,
    page,
    setPage,
    filters,
    setFilter,
    handleSearchSubmit,
    resetFilters,
    hasActiveFilters,
  };
}
