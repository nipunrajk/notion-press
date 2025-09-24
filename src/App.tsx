import { useEffect, useMemo, useState } from 'react';
import generateFakeData from '../mock';
import type { Book, SortConfig, SortColumn } from '../types/types';
import Spinner from './components/spinner';
import Pagination from './components/pagination';

const CSV_COLUMNS: (keyof Book)[] = [
  'Title',
  'Author',
  'Genre',
  'PublishedYear',
  'ISBN',
];

function App() {
  const [originalData, setOriginalData] = useState<Book[]>([]);
  const [editedData, setEditedData] = useState<Book[]>([]);
  const [modifiedRows, setModifiedRows] = useState<Set<string>>(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: 'asc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Generating records...');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  useEffect(() => {
    setLoadingText('Generating 10,000 book records...');
    setIsLoading(true);
    setTimeout(() => {
      const fakeData = generateFakeData(1000);
      setOriginalData(JSON.parse(JSON.stringify(fakeData)));
      setEditedData(JSON.parse(JSON.stringify(fakeData)));
      setIsLoading(false);
    }, 50);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingText(`Parsing ${file.name}...`);
    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: { data: Book[]; meta: { fields: string[] } }) => {
        const expectedColumns = [
          'Title',
          'Author',
          'Genre',
          'PublishedYear',
          'ISBN',
        ];
        const fileHeaders = results.meta.fields;
        const isValid = expectedColumns.every((col) =>
          fileHeaders.includes(col)
        );

        if (!isValid) {
          alert(
            `Invalid CSV format. Please ensure it has the columns: ${expectedColumns.join(
              ', '
            )}`
          );
          setIsLoading(false);
          return;
        }

        setOriginalData(JSON.parse(JSON.stringify(results.data)));
        setEditedData(JSON.parse(JSON.stringify(results.data)));
        setModifiedRows(new Set());
        setCurrentPage(1);
        setSearchTerm('');
        setSortConfig({ column: null, direction: 'asc' });
        setIsLoading(false);
      },
      error: (error: any) => {
        console.error('Papaparse error:', error);
        alert('An error occurred while parsing the CSV file.');
        setIsLoading(false);
      },
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      setEditedData(JSON.parse(JSON.stringify(originalData)));
      setModifiedRows(new Set());
    }
  };

  const handleDownload = () => {
    const csv = Papa.unparse(editedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'edited_books.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return editedData;
    return editedData.filter((row) => {
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [editedData, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = a[sortConfig.column!];
      const valB = b[sortConfig.column!];
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (column: SortColumn) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.column === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ column, direction });
  };

  const handleCellEdit = (isbn: string, column: keyof Book, value: string) => {
    const newData = editedData.map((row) => {
      if (row.ISBN === isbn) {
        // Handle PublishedYear as a number
        const newValue =
          column === 'PublishedYear' ? parseInt(value, 10) || 0 : value;
        return { ...row, [column]: newValue };
      }
      return row;
    });
    setEditedData(newData);

    const newModifiedRows = new Set(modifiedRows);
    newModifiedRows.add(isbn);
    setModifiedRows(newModifiedRows);
  };

  const rowStart = (currentPage - 1) * rowsPerPage + 1;
  const rowEnd = Math.min(rowStart + rowsPerPage - 1, sortedData.length);
  const rowCountText = `Showing ${
    sortedData.length > 0 ? rowStart : 0
  } to ${rowEnd} of ${sortedData.length} records. (Total: ${
    editedData.length
  })`;

  const renderHeaders = () => {
    return CSV_COLUMNS.map((column) => {
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
          onClick={() => handleSort(column)}
        >
          {column}
        </th>
      );
    });
  };

  return (
    <div className='container mx-auto p-4 md:p-6 lg:p-8'>
      <header className='mb-6'>
        <h1 className='text-3xl font-bold text-slate-900'>
          Notion Press Book Editor
        </h1>
      </header>

      <div className='bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end'>
          <div>
            <label
              htmlFor='search'
              className='block text-sm font-medium text-slate-700 mb-1'
            >
              Filter Data
            </label>
            <input
              type='text'
              id='search'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder='Search across all columns...'
              className='w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
            />
          </div>
          <div>
            <label
              htmlFor='csvFile'
              className='block text-sm font-medium text-slate-700 mb-1'
            >
              Upload CSV
            </label>
            <input
              type='file'
              id='csvFile'
              accept='.csv'
              onChange={handleFileChange}
              className='w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer'
            />
          </div>
          <div className='flex items-center space-x-2 lg:col-span-2 justify-self-start md:justify-self-end'>
            <button
              onClick={handleReset}
              disabled={isLoading || modifiedRows.size === 0}
              className='px-4 py-2 bg-red-500 text-white font-semibold rounded-md shadow-sm hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition'
            >
              Reset Edits
            </button>
            <button
              onClick={handleDownload}
              disabled={isLoading || editedData.length === 0}
              className='px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition'
            >
              Download Edited CSV
            </button>
          </div>

          <div className='flex justify-between items-center mb-4 flex-wrap gap-2'>
            {isLoading ? (
              <Spinner text={loadingText} />
            ) : (
              <div className='h-7'></div>
            )}
            <div className='text-sm text-slate-500 font-medium'>
              {rowCountText}
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-slate-200 overflow-x-auto'>
        <table className='w-full text-sm text-left text-slate-500'>
          <thead className='text-xs text-slate-700 uppercase bg-slate-100'>
            <tr>{renderHeaders()}</tr>
          </thead>
          <tbody className='divide-y divide-slate-200'>
            {paginatedData.map((row, index) => (
              <tr
                key={row.ISBN}
                className={`bg-white hover:bg-slate-50 transition ${
                  modifiedRows.has(row.ISBN) ? 'highlight-modified' : ''
                }`}
              >
                {CSV_COLUMNS.map((key) => (
                  <td
                    key={key}
                    className='px-6 py-4'
                    contentEditable={key !== 'ISBN'}
                    suppressContentEditableWarning={true}
                    onBlur={(e) =>
                      handleCellEdit(
                        row.ISBN,
                        key,
                        e.currentTarget.textContent || ''
                      )
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
        {!isLoading && sortedData.length === 0 && (
          <div className='text-center p-8 text-slate-500'>
            <h3 className='text-lg font-semibold'>No Results Found</h3>
            <p>Your search query did not match any records.</p>
          </div>
        )}
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default App;
