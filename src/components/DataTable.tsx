import type { Book, SortConfig, SortColumn } from '../../types/types';
import Spinner from './Spinner';

type DataTableProps = {
  data: Book[];
  columns: (keyof Book)[];
  sortConfig: SortConfig;
  onSort: (column: SortColumn) => void;
  onCellEdit: (isbn: string, column: keyof Book, value: string) => void;
  modifiedRows: Set<string>;
  isLoading: boolean;
  loadingText: string;
  rowCountText: string;
};

const DataTable = ({
  data,
  columns,
  sortConfig,
  onSort,
  onCellEdit,
  modifiedRows,
  isLoading,
  loadingText,
  rowCountText,
}: DataTableProps) => {
  const renderHeaders = () => {
    return columns.map((column) => {
      const isSorted = sortConfig.column === column;
      const sortClass = isSorted
        ? sortConfig.direction === 'asc'
          ? 'sort-asc'
          : 'sort-desc'
        : '';
      return (
        <th
          key={column}
          scope='col'
          className={`px-6 py-3 cursor-pointer select-none hover:bg-slate-200 ${sortClass}`}
          onClick={() => onSort(column)}
        >
          {column}
        </th>
      );
    });
  };

  if (isLoading) {
    return <Spinner text={loadingText} />;
  }

  if (data.length === 0) {
    return (
      <div className='text-center p-8 text-slate-500'>
        <h3 className='text-lg font-semibold'>No Results Found</h3>
        <p>Your search query did not match any records.</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg border border-slate-200 overflow-x-auto'>
      <div className='text-sm text-slate-500 font-medium p-4 border-b'>
        {rowCountText}
      </div>
      <table className='w-full text-sm text-left text-slate-500'>
        <thead className='text-xs text-slate-700 uppercase bg-slate-100'>
          <tr>{renderHeaders()}</tr>
        </thead>
        <tbody className='divide-y divide-slate-200'>
          {data.map((row) => (
            <tr
              key={row.ISBN}
              className={`bg-white hover:bg-slate-50 transition ${
                modifiedRows.has(row.ISBN) ? 'highlight-modified' : ''
              }`}
            >
              {columns.map((key) => (
                <td
                  key={key}
                  className='px-6 py-4'
                  contentEditable={key !== 'ISBN'}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onCellEdit(row.ISBN, key, e.currentTarget.textContent || '')
                  }
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {String(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
