import Link from 'next/link';

const Pagination = ({ page, pageSize, totalItems, searchParams = {} }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const getUrl = (newPage) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== 'page') {
        params.append(key, value);
      }
    }
    params.set('page', newPage);
    return `/properties?${params.toString()}`;
  };

  return (
    <section className='container mx-auto flex justify-center items-center my-8'>
      {page > 1 ? (
        <Link
          className='mr-2 px-2 py-1 border border-gray-300 rounded'
          href={getUrl(page - 1)}
        >
          Anterior
        </Link>
      ) : null}

      <span className='mx-2'>
        {' '}
        Página {page} de {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          className='ml-2 px-2 py-1 border border-gray-300 rounded'
          href={getUrl(page + 1)}
        >
          Siguiente
        </Link>
      ) : null}
    </section>
  );
};
export default Pagination;
