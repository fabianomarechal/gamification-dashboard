'use client';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const STATUS = [
  'Capturando badges',
  'Copiando arquivos',
  'Concluído'
];

export default function ProgressBar({ status=STATUS[1], total, current }: { status: string, total: number, current: number }) {
  const [ width, setWidth ] = useState(0);

  useEffect(() => {
    if(total === 0) return;
    setWidth(current / total * 100);
  }, [status, total, current]);

  return (
    <div className='w-full h-36'>
      <h4 className="sr-only">Processamento {current}</h4>
      <p className="text-sm font-medium text-gray-900">{(STATUS[STATUS.length-1]) == (status) ? status : (status+'...')} {current}</p>
      <div aria-hidden="true" className="mt-6">
        <div className="overflow-hidden rounded-full bg-gray-200">
          <div style={{ width: `${width}%` }} className="h-2 rounded-full bg-indigo-600" />
        </div>
        <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
          {STATUS.map((s, i) => (
            <div key={i} className={clsx(
              i === 0 ? 'text-left' : i === STATUS.length - 1 ? 'text-right' : 'text-center',
              i === 0 ? 'col-start-1' : i === STATUS.length - 1 ? 'col-end-5' : 'col-span-1',
              s === status ? 'text-indigo-600' : 'text-gray-900'
            )}>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
