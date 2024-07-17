'use client';
import { cn } from '@/lib/utils';
import { getGoogleDriveFiles } from 'app/dashboard/actions';
import { useEffect, useState } from 'react';

export const GoogleTable = ({
  className,
  code,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { code?: string}) => {
  const [ files, setFiles ] = useState<any[]>([]);


  useEffect(() => {
    getGoogleDriveFiles().then(files => {
      setFiles(files);
    });
  }, []);

  return <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  >
    <h2 className="text-lg font-semibold">Google Drive Files</h2>
      <div className="flex flex-col space-y-2">
        {files.map((file, i) => (
          <div key={i} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                {file.name[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{file.name}</span>
                <span className="text-sm">{file.mimeType}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>;
}