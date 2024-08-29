'use server';
import { auth, signOut } from '@/lib/auth';
import { oAuthGoogle } from '@/lib/google';
import chromium from '@sparticuz/chromium-min';
import { google } from 'googleapis';
import { Browser, defaultArgs, ElementHandle, launch, Page } from 'puppeteer-core';
import { Readable } from 'stream';

const drive = google.drive({ version: 'v3', auth: oAuthGoogle });

class Screenshot {
	browser: Browser | null;
	page: Page | null;
	total: number = 0;
	folderId?: string|null;

	linksSelector?: ElementHandle<Element>[];
	nomesSelector?: ElementHandle<Element>[];

	constructor() {
		this.browser = null;
		this.page = null;
	}

	async init() {
		const browser = await launch({ 
			args: process.env.IS_LOCAL ? defaultArgs() : chromium.args, //[...chromium.args, '--hide-scrollbars', '--disable-web-security'],
			// defaultViewport: chromium.defaultViewport,
			executablePath: process.env.IS_LOCAL ? "/opt/homebrew/bin/Chromium" : await chromium.executablePath(
				`https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar`
			),
			headless: chromium.headless,
			// ignoreHTTPSErrors: true,
		 });
		const page = await browser.newPage();
	}

	async goToPage() {
		if(!this.page) {
			return;
		};
		// Navigate the page to a URL
		await this.page.goto('https://app.powerbi.com/view?r=eyJrIjoiNzRhMWRjNTgtYWFlZS00ZTViLTkyMjEtZGFmYTE5Zjg0YjI5IiwidCI6IjNkZDBiZGZlLTNkYmUtNGM5MC1iYmIxLWU4ZjljNjQzZjY0YyJ9');

		this.page.on('dialog', async (dialog: any) => {
			await dialog.accept();
		})
	
		// Set screen size
		await this.page.setViewport({width: 1920, height: 1080});
	
		//Ir para a página de login
		await this.page.waitForNetworkIdle();
		await this.page.waitForSelector('.imageBackground');
		await this.page.click('.imageBackground');
	
	
		// Preencher senha e login
		await this.page.waitForNetworkIdle();
		const inputSelector = '.date-slicer-control:nth-child(1) > .date-slicer-input';
		await this.page.locator(inputSelector).fill('2406')
		await this.page.waitForSelector(inputSelector).then((selector: any) => selector.press('Enter'));
	
		// clicar em IR
		let buttons = await this.page.$$('.ui-role-button-fill', );
		while (buttons.length <= 2) {
			await this.page.waitForNetworkIdle();
			buttons = await this.page.$$('.ui-role-button-fill');
			if(buttons.length > 2) {
				break;
			}
			await buttons[1].click();
		}
	
		buttons = await this.page.$$('.ui-role-button-fill', );
		await buttons[3].click();
	
		await this.page.waitForNetworkIdle();
	
		this.linksSelector = await this.page.$$('::-p-xpath(//visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div/div/div[2])')
		this.nomesSelector = await this.page.$$('::-p-xpath(//visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div/div/span)');
		this.total = this.linksSelector.length;
	}

	async createFolder() {
		const folder = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-') + ' ' + new Date().toLocaleTimeString('pt-BR')
		const session = await auth();
		oAuthGoogle.setCredentials({
			access_token: session?.accessToken
		});
		const folderId = '1KM43NCF_Ig1mp-BumIpvNjh8PavotIcA';
		const newFolder = await drive.files.create({
			requestBody: {
				driveId: '0ACrIqDScuJJ9Uk9PVA',
				name: folder, 
				mimeType: 'application/vnd.google-apps.folder',
				parents: [folderId]
			},
			supportsAllDrives: true,
			fields: 'id'
		});
		this.folderId = newFolder.data.id;
	}

	async takeScreenshot(contador: number) {
		if(!this.page || !this.linksSelector || !this.nomesSelector || !this.browser) return;
		await this.linksSelector[screenshot.total].click();
		await this.page.waitForNetworkIdle();

		const nome = await (await (this.nomesSelector[contador]).getProperty('innerText')).jsonValue()

		console.log(`Tirando screenshot de ${nome}`);

		const header = await this.page.$('.textRun');
		await header?.scrollIntoView();
		const date = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
		const filename = `${nome}-${date}.png`
		const file = await this.page.screenshot({
			type: 'png',
			clip: {
				x: 660,
				y: 125,
				width: 610,
				height: 610
			}
		})
		const fileStream = Readable.from(file);

		await this.copyToFolder(filename, fileStream);

		if(this.total === contador) {
			await this.close();
		}
	}

	async copyToFolder(filename: string, fileStream: Readable) {
		await uploadToGoogleDrive({ folderId: this.folderId!, filename, fileStream});
	}

	async close() {
		await this.browser?.close();
	}

}

const screenshot = new Screenshot();

export async function getUser() {
  const session = await auth();

  return { user: session?.user };
}

export async function getGoogleDriveFiles() {
	const session = await auth();

	oAuthGoogle.setCredentials({
		access_token: session?.accessToken
	});
	
	try	{
		// search for folder: Banners de Evolução e Reconhecimento
		const files = await drive.files.list({
			driveId: '0ACrIqDScuJJ9Uk9PVA',
			pageSize: 10,
			q: "mimeType='application/vnd.google-apps.folder'",
			fields: 'files(id, name)',
			corpora: 'drive',
			includeItemsFromAllDrives: true,
			supportsAllDrives: true,
		});
		return files.data.files ?? [];
	} catch (error) {
		console.error('Error getting files from Google Drive', error);
	}
	
	return [];
}

export async function uploadToGoogleDrive({folderId, fileStream, filename}: {folderId: string, filename: string, fileStream: Readable}) {
	
	await drive.files.create({
		requestBody: {
			driveId: '0ACrIqDScuJJ9Uk9PVA',
			name: filename,
			mimeType: 'image/png',
			parents: [folderId]
		},
		media: {
			mimeType: 'image/png',
			body: fileStream
		},
		supportsAllDrives: true,
	});
}

export const handleScreenshots = async (contador: number): Promise<{status: string, total: number, current: number}> => {
	if(!(contador<0)) {
		if(!screenshot.browser && !screenshot.page){
			console.log('Iniciando browser');
			await screenshot.init();
		}
		console.log('Iniciando página');
		await screenshot.goToPage();

		if(screenshot.total===0) return {total: screenshot.total, status: 'Erro ao tirar screenshots', current: contador};
		await screenshot.createFolder();
		console.log('Pasta criada', screenshot.folderId);
		return {total: screenshot.total, status: 'Capturando badges', current: 0};
	}

	try {
		await screenshot.takeScreenshot(contador);
		return {total: screenshot.total, status: 'Screenshots tiradas', current: ++contador};
	} catch (error: any) {
		console.error('Error taking screenshots', error);
		if(error.code === 401) {
			await signOut({
				redirectTo: '/'
			});
		}
		return {total: screenshot.total, status: 'Erro ao tirar screenshots', current: contador};
	}

}
