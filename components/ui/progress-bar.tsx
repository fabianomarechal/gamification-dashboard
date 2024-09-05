'use client';
import { StatusEnum } from 'app/dashboard/enums/status.enum';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export default function ProgressBar({ status, total, current, message }: { status: string, total: number, current: number, message?: string }) {
  const [ width, setWidth ] = useState(0);

  useEffect(() => {
    if(total === 0) return;
    setWidth(current / total * 100);
  }, [status, total, current]);

  return (
    <div className='w-full h-36'>
      <h4 className="sr-only">Processamento {current}</h4>
      <p className="text-sm font-medium text-gray-900">{message}</p>
      <div aria-hidden="true" className="mt-6">
        <div className="overflow-hidden rounded-full bg-gray-200">
          <div style={{ width: `${width}%` }} className="h-2 rounded-full bg-indigo-600" />
        </div>
        <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
          {Object.values(StatusEnum).map((s) => (
            <div key={s} className={clsx(
              s === StatusEnum.NOT_STARTED ? 'text-left' : s === StatusEnum.COMPLETED ? 'text-right' : 'text-center',
              s === StatusEnum.NOT_STARTED ? 'col-start-1' : s === StatusEnum.COMPLETED ? 'col-end-5' : 'col-span-1',
              s === status ? 'text-indigo-600 text-xl' : 'text-gray-900 text-md',
              s === status && status === StatusEnum.PROCESSING ? 'animate-pulse' : ''
            )}>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
