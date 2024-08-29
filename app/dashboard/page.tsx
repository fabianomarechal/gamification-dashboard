import { CaptureBadges } from '@/components/capture-badges';
import { Tabs } from '@/components/ui/tabs';

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
      <div className="w-ful">
        <CaptureBadges />     
      </div>
        {/* <TabsContent value="all">
          <GoogleTable code={code} />
        </TabsContent> */}
    </Tabs>
  );
}
