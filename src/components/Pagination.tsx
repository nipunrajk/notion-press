export default function Pagination({
  totalPages,
  currentPage,
  setCurrentPage,
}: {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}) {
  if (totalPages <= 1) return null;

  const pageButtons = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <button
        key={i}
        onClick={() => setCurrentPage(i)}
        className={`px-3 py-1 text-sm font-medium rounded-md transition ${
          currentPage === i
            ? 'text-white bg-blue-600'
            : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className='mt-6 flex items-center justify-between'>
      <span className='text-sm text-slate-700'>
        Page {currentPage} of {totalPages}
      </span>
      <div className='flex items-center space-x-2'>
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className='px-3 py-1 text-sm font-medium rounded-md transition text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed'
        >
          First
        </button>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className='px-3 py-1 text-sm font-medium rounded-md transition text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed'
        >
          Previous
        </button>
        {startPage > 1 && (
          <span className='px-3 py-1 text-sm font-medium'>...</span>
        )}
        {pageButtons}
        {endPage < totalPages && (
          <span className='px-3 py-1 text-sm font-medium'>...</span>
        )}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1)) 
          }
          disabled={currentPage === totalPages}
          className='px-3 py-1 text-sm font-medium rounded-md transition text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed'
        >
          Next
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className='px-3 py-1 text-sm font-medium rounded-md transition text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed'
        >
          Last
        </button>
      </div>
    </div>
  );
}
