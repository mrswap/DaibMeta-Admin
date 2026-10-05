import { useState } from "react";

/* ================= NORMALISE ================= */
const normalise = (col) => {
  if ("header" in col) {
    return {
      label: col.header,
      align: col.align || "center",
      getCell: (row, idx) => {
        if (col.render) {
          return col.accessor
            ? col.render(row[col.accessor], row, idx)
            : col.render(row, row, idx);
        }
        if (col.accessor) return row[col.accessor] ?? "—";
        return "—";
      },
    };
  }

  return {
    label: col.label,
    align: col.align || "center",
    getCell: (row, idx) => {
      if (col.render) return col.render(row[col.key], row, idx);
      return row[col.key] ?? "—";
    },
  };
};

/* ================= ROW ================= */
const TableRow = ({ row, normCols, isLast, index }) => {
  return (
    <tr
      className={`bg-table-row-bg hover:bg-table-row-hover-bg transition-colors ${
        !isLast ? "border-b border-table-row-border" : ""
      }`}
    >
      {normCols.map((col, i) => (
        <td
          key={i}
          className="px-5 py-3 text-[13px] font-medium text-table-cell-text text-left whitespace-nowrap"
        >
          {col.getCell(row, index)}
        </td>
      ))}
    </tr>
  );
};

/* ================= ICONS ================= */
const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
    <path
      d="M13 16l-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
    <path
      d="M7 4l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/* ================= PAGE BUTTON ================= */
const PageBtn = ({ children, onClick, isActive, isDisabled, title }) => {
  const base =
    "min-w-[32px] h-8 rounded-md flex items-center justify-center text-sm transition-all";

  let variant = "";
  if (isActive) {
    variant =
      "bg-table-page-active-bg text-table-page-active-text font-bold shadow-md cursor-pointer";
  } else if (isDisabled) {
    variant =
      "bg-table-page-btn-disabled-bg text-table-page-btn-disabled-text cursor-not-allowed";
  } else {
    variant =
      "border border-table-page-btn-border text-table-page-btn-text hover:border-table-page-btn-hover-border hover:text-table-page-btn-hover-text cursor-pointer";
  }

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${variant}`}
    >
      {children}
    </button>
  );
};

/* ================= MAIN TABLE ================= */
const CustomeTable = ({
  columns = [],
  data = [],
  serverSide = false,
  currentPage: extCurrentPage = 1,
  totalPages: extTotalPages = 1,
  totalItems: extTotalItems = 0,
  onPageChange,
  itemsPerPage = 10,
  emptyText = "No data found.",
}) => {
  const normCols = columns.map(normalise);
  const [localPage, setLocalPage] = useState(1);

  const currentPage = serverSide ? extCurrentPage : localPage;
  const totalItems = serverSide ? extTotalItems : data.length;
  const totalPages = serverSide
    ? extTotalPages
    : Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = serverSide
    ? data
    : data.slice((localPage - 1) * itemsPerPage, localPage * itemsPerPage);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const rowStartIndex = (currentPage - 1) * itemsPerPage;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    if (serverSide) {
      onPageChange?.(page);
    } else {
      setLocalPage(page);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];
    if (currentPage > 3) pages.push("left-dots");

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("right-dots");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="w-full bg-table-bg shadow-xs border rounded-xl border-table-border overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar w-full">
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="bg-table-head-bg">
            <tr>
              {normCols.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-sm font-bold text-table-head-text text-left whitespace-nowrap border-b border-table-head-border"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={normCols.length}
                  className="text-center py-12 text-table-empty-text text-sm"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow
                  key={row.id ?? i}
                  row={row}
                  normCols={normCols}
                  isLast={i === paginatedData.length - 1}
                  index={rowStartIndex + i}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-table-page-border gap-3">
          <span className="text-sm text-table-page-text">
            Showing <strong>{startItem}</strong> to <strong>{endItem}</strong>{" "}
            of <strong>{totalItems}</strong>
          </span>

          <div className="flex gap-2 flex-wrap">
            <PageBtn
              title="Previous"
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
            >
              <ChevronLeft />
            </PageBtn>

            {getPageNumbers().map((page, i) =>
              page === "left-dots" || page === "right-dots" ? (
                <span
                  key={`dots-${i}`}
                  className="px-2 py-1 text-table-dots self-center"
                >
                  ...
                </span>
              ) : (
                <PageBtn
                  key={`page-${page}`}
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PageBtn>
              ),
            )}

            <PageBtn
              title="Next"
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
            >
              <ChevronRight />
            </PageBtn>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomeTable;
