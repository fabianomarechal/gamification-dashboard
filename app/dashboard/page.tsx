import { GoogleButton, ScreenShotButton } from '@/components/ui/button';
import { GoogleTable } from '@/components/ui/table-google';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { takeScreenshots } from './actions';

export const maxDuration = 300;


export default async function MainPage({
  searchParams
}: {
  searchParams: { q: string; offset: string, code: string };
}) {
  const search = searchParams.q ?? '';
  const code = searchParams.code ?? '';
  const offset = searchParams.offset ?? 0;

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <div className="ml-auto flex items-center gap-2">
          <GoogleButton />
          <ScreenShotButton onClick={takeScreenshots} />

        </div>
      </div>
        <TabsContent value="all">
          <GoogleTable code={code} />
        </TabsContent>
    </Tabs>
  );
}
