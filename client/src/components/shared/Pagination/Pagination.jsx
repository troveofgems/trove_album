import React from 'react';
import classnames from 'classnames';
import { usePagination, ELLIPSES } from '../../../hooks/usePagination.hook';
import './Pagination.css';
const Pagination = props => {
    const {
        onPageChange,
        totalCount,
        siblingCount = 1,
        currentPage,
        pageSize,
        className
    } = props;

    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize
    });

    if (currentPage === 0 || paginationRange?.length < 2 || !paginationRange) {
        return null;
    }

    const onNext = () => {
        onPageChange(currentPage + 1);
    };

    const onPrevious = () => {
        onPageChange(currentPage - 1);
    };

    let lastPage = paginationRange[paginationRange.length - 1];
    return (
        <ul
            className={classnames('pagination-container', { [className]: className })}
        >
            <li
                key={`item-prev-key-0`}
                className={classnames('pagination-item', {
                    disabled: currentPage === 1
                })}
                onClick={onPrevious}
            >
                <div className="arrow left" />
            </li>
            {paginationRange.map((pageNumber, i) => {
                if (pageNumber === ELLIPSES) {
                    return <li key={`ellipses-key-${i}`} className="pagination-item ellipsis">&#8230;</li>;
                }

                return (
                    <li
                        key={`item-key-${i}`}
                        className={classnames('pagination-item', {
                            selected: (pageNumber === currentPage)
                        })}
                        onClick={() => onPageChange(pageNumber)}
                    >
                        {pageNumber}
                    </li>
                );
            })}
            <li
                key={`item-next-key-0`}
                className={classnames('pagination-item', {
                    disabled: (currentPage === lastPage)
                })}
                onClick={onNext}
            >
                <div className="arrow right" />
            </li>
        </ul>
    );
};

export default Pagination;
