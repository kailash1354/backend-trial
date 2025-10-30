import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage, endPage;
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
      }
      if (startPage > 2) {
        pages.push("...");
      }
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const handlePageClick = (page) => {
    if (page !== "..." && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      className="flex items-center justify-between text-primary"
      aria-label="Pagination"
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`inline-flex items-center px-5 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
            currentPage === 1
              ? "text-muted cursor-not-allowed"
              : "text-primary hover:bg-highlight hover:scale-105"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              disabled={page === "..."}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                page === currentPage
                  ? "bg-accent text-white shadow-lg scale-110"
                  : page === "..."
                  ? "text-muted cursor-default"
                  : "text-primary hover:bg-highlight hover:scale-105"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={page === "..." ? "More pages" : `Page ${page}`}
            >
              {page === "..." ? <MoreHorizontal className="w-5 h-5" /> : page}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center px-5 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
            currentPage === totalPages
              ? "text-muted cursor-not-allowed"
              : "text-primary hover:bg-highlight hover:scale-105"
          }`}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      <div className="hidden sm:flex items-center text-sm text-primary">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        {totalPages > 1 && (
          <span className="ml-3 text-muted">({totalPages} total pages)</span>
        )}
      </div>

      <div className="sm:hidden flex items-center space-x-3">
        <span className="text-sm text-primary">
          {currentPage} / {totalPages}
        </span>
      </div>
    </nav>
  );
};

export default Pagination;
