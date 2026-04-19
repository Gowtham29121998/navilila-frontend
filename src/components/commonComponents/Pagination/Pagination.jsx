import React from 'react';
import ReactPaginateComponent from 'react-paginate';
import { ChevronLeft, ChevronRight } from '../../../assets/images/icons.jsx';
import './Pagination.css';

// Handle both ESM and CommonJS exports safely
const ReactPaginate = ReactPaginateComponent.default || ReactPaginateComponent;

const Pagination = ({ pages, page, onChange }) => {
  if (pages <= 1) return null;

  const handlePageClick = (event) => {
    onChange(event.selected + 1);
  };

  return (
    <div className="pagination-wrapper">
      <ReactPaginate
        breakLabel="..."
        nextLabel={<ChevronRight size={20} />}
        onPageChange={handlePageClick}
        pageRangeDisplayed={1}
        marginPagesDisplayed={1}
        pageCount={pages}
        forcePage={page - 1}
        previousLabel={<ChevronLeft size={20} />}
        renderOnZeroPageCount={null}
        containerClassName="pagination"
        pageClassName="pagination-item"
        pageLinkClassName="pagination-btn"
        previousClassName="pagination-item prev"
        previousLinkClassName="pagination-btn"
        nextClassName="pagination-item next"
        nextLinkClassName="pagination-btn"
        breakClassName="pagination-item break"
        breakLinkClassName="pagination-btn"
        activeLinkClassName="active"
        disabledClassName="disabled"
      />
    </div>
  );
};

export default Pagination;
