import { auth } from '@/lib/auth';
import { oAuthGoogle } from '@/lib/google';
import chromium from '@sparticuz/chromium-min';
import { uploadToGoogleDrive } from 'app/dashboard/actions';
import { google } from 'googleapis';
import { Browser, defaultArgs, launch, Page } from 'puppeteer-core';
import { Readable } from 'stream';

export class ScreenshotService {
	private browser: Browser | null = null;
	private page: Page | null = null;
	private _screenshotCount: number = 0;

	async initializeBrowser() {
    const isLocal = process.env.IS_LOCAL;
    const executablePath = isLocal
      ? "/opt/homebrew/bin/Chromium"
      : await chromium.executablePath(
          `https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar`
        );

    this.browser = await launch({
      args: isLocal ? defaultArgs() : chromium.args,
      executablePath,
      headless: chromium.headless,
    });

    this.page = await this.browser.newPage();
  }

	async navigateToPage(url: string) {
    await this.page!.goto(url);
    await this.page!.setViewport({ width: 1920, height: 1080 });
    await this.page!.waitForNetworkIdle();
  }

	async performLoginAndSetup() {
    await this.page!.waitForSelector('.imageBackground');
    await this.page!.click('.imageBackground');

    await this.page!.waitForNetworkIdle();
    const dateInputSelector = '.date-slicer-control:nth-child(1) > .date-slicer-input';
    await this.page!.locator(dateInputSelector).fill('2406');
    await this.page!.waitForSelector(dateInputSelector).then((selector: any) => selector.press('Enter'));

    await this.clickButtonUntilVisible('.ui-role-button-fill', 2);
  }

	private async clickButtonUntilVisible(selector: string, minVisible: number) {
    let buttons = await this.page!.$$(selector);
    while (buttons.length <= minVisible) {
      await this.page!.waitForNetworkIdle();
      buttons = await this.page!.$$(selector);
      if (buttons.length > minVisible) break;
      await buttons[1].click();
    }
    await buttons[3].click();
    await this.page!.waitForNetworkIdle();
  }

	async getTotalScreenshots() {
    if (this.screenshotCount) return this.screenshotCount;
    const elements = await this.page!.$$('::-p-xpath(//visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div/div/div[2])');
    this.screenshotCount = elements.length;

    await this.closeBrowser();
    return this.screenshotCount;
  }

	async createFolder(): Promise<string> {
    const folderName = this.generateFolderName();
    const session = await auth();
    oAuthGoogle.setCredentials({ access_token: session?.accessToken });
		const drive = google.drive({ version: 'v3', auth: oAuthGoogle });

    const folderId = '1KM43NCF_Ig1mp-BumIpvNjh8PavotIcA';
    const newFolder = await drive.files.create({
      requestBody: {
        driveId: '0ACrIqDScuJJ9Uk9PVA',
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId],
      },
      supportsAllDrives: true,
      fields: 'id',
    });

    return newFolder.data.id ?? '';
  }

	private generateFolderName(): string {
    const date = new Date();
    return `${date.toLocaleDateString('pt-BR').split('/').reverse().join('-')} ${date.toLocaleTimeString('pt-BR')}`;
  }

	async captureScreenshot(index: number, total: number, folderId: string) {
    await this.initializeBrowser();
    await this.navigateToPage('https://app.powerbi.com/view?r=eyJrIjoiNzRhMWRjNTgtYWFlZS00ZTViLTkyMjEtZGFmYTE5Zjg0YjI5IiwidCI6IjNkZDBiZGZlLTNkYmUtNGM5MC1iYmIxLWU4ZjljNjQzZjY0YyJ9');
    await this.performLoginAndSetup();

    const elements = await this.page!.$$('::-p-xpath(//visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div/div/div[2])');
    await elements[index].click();
    await this.page!.waitForNetworkIdle();

    const names = await this.page!.$$('::-p-xpath(//visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div/div/span)');
    const name = await (await names[index].getProperty('innerText')).jsonValue();

    const header = await this.page!.$('.textRun');
    await header?.scrollIntoView();
    const filename = `${name}-${this.generateFolderName()}.png`;
    const screenshotBuffer = await this.page!.screenshot({
      type: 'png',
      clip: { x: 660, y: 125, width: 610, height: 610 },
    });

    await this.uploadScreenshot(filename, Readable.from(screenshotBuffer), folderId);
    await this.closeBrowser();
  }

	private async uploadScreenshot(filename: string, fileStream: Readable, folderId: string) {
    await uploadToGoogleDrive({ folderId, filename, fileStream });
  }

	async closeBrowser() {
		await this.browser?.close();
	}

	get screenshotCount() {
		return this._screenshotCount;
	}

	set screenshotCount(value: number) {
		if (value < 0 ) return;
		this._screenshotCount = value;
	}

}