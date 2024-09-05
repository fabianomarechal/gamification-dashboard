import { signOut } from '@/lib/auth';
import { ScreenshotService } from 'classes/screenshot';
import { StatusEnum } from '../enums/status.enum';

const screenshotService = new ScreenshotService();

export const handleScreenshots = async (
  currentStep: number,
  totalSteps: number,
  folderId?: string
): Promise<{status: string, total: number, current: number, folderId?: string, message?: string}> => {
  try {
    if(currentStep < 0 && !folderId) {
      await initializeScreenshotProcess();

      if (await screenshotService.getTotalScreenshots() === 0) {
        return createResponse('Error capturing screenshots', currentStep);
      }

      const newFolderId = await screenshotService.createFolder();
      return createResponse('Capturing badges', 0, newFolderId);
    }

    screenshotService.screenshotCount = totalSteps;
    await screenshotService.captureScreenshot(currentStep, totalSteps, folderId!);

    return await createResponse('Screenshots taken', currentStep + 1, folderId);
  } catch (error) {
    await handleScreenshotError(error, currentStep, folderId);
    return createResponse('Error capturing screenshots', currentStep, folderId);
  } finally {
    await screenshotService.closeBrowser();
  }
}
 
const initializeScreenshotProcess = async () => {
  await screenshotService.initializeBrowser();
  await screenshotService.navigateToPage(
    'https://app.powerbi.com/view?r=eyJrIjoiNzRhMWRjNTgtYWFlZS00ZTViLTkyMjEtZGFmYTE5Zjg0YjI5IiwidCI6IjNkZDBiZGZlLTNkYmUtNGM5MC1iYmIxLWU4ZjljNjQzZjY0YyJ9'
  );
  await screenshotService.performLoginAndSetup();
  await screenshotService.getTotalScreenshots();
};

const handleScreenshotError = async (error: any, currentStep: number, folderId?: string) => {
  await screenshotService.closeBrowser();
  if (error.code === 401) {
    await signOut({ redirectTo: '/' });
  }
};

const createResponse = async (
  status: string,
  currentStep: number,
  folderId?: string
): Promise<{ status: string; total: number; current: number; folderId?: string, message?: string }> => {
  const screenshotsTotal = await screenshotService.getTotalScreenshots();
  return {
    status: currentStep===screenshotsTotal ? StatusEnum.COMPLETED : StatusEnum.PROCESSING,
    total: screenshotsTotal,
    current: currentStep,
    folderId,
    message: currentStep===screenshotsTotal ? 'Concluído' : `${currentStep} de ${screenshotsTotal}`
  };
};