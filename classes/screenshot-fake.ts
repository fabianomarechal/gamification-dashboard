import { randomInt } from 'crypto';
import { Browser, Page } from 'puppeteer-core';

export class ScreenshotService {
	private browser: Browser | null = null;
	private page: Page | null = null;
	private _screenshotCount: number = 0;

  async getTotalScreenshots () {
    if (this._screenshotCount > 0) {
      return this._screenshotCount;
    }
    return randomInt(15, 30);
  }

  async createFolder () {
    return 'fake-folder-id';
  }

  async captureScreenshot (currentStep: number, totalSteps: number, folderId: string) {
    console.log('Capturing screenshot', currentStep, totalSteps, folderId);
    await new Promise(resolve => setTimeout(resolve, 900));
  }

  async closeBrowser () {
    console.log('Closing browser');
  }

  async initializeBrowser () {
    console.log('Initializing browser');
  }
  
  async navigateToPage (url: string) {
    console.log('Navigating to page', url);
  }

  async performLoginAndSetup () {
    console.log('Performing login and setup');
  }

	get screenshotCount() {
		return this._screenshotCount;
	}

	set screenshotCount(value: number) {
		if (value < 0 ) return;
		this._screenshotCount = value;
	}

}