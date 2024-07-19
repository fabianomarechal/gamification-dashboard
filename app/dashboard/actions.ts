'use server';
import { auth, signOut } from '@/lib/auth';
import { oAuthGoogle } from '@/lib/google';
import chromium from '@sparticuz/chromium-min';
import { google } from 'googleapis';
import { defaultArgs, launch } from 'puppeteer-core';
import { Readable } from 'stream';

const drive = google.drive({ version: 'v3', auth: oAuthGoogle });

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

export const takeScreenshots = async () => {
	try {
	console.log('Taking screenshots');
  const browser = await launch({ 
		args: process.env.IS_LOCAL ? defaultArgs() : chromium.args, //[...chromium.args, '--hide-scrollbars', '--disable-web-security'],
		// defaultViewport: chromium.defaultViewport,
		executablePath: process.env.IS_LOCAL ? "/tmp/localChromium/chromium/mac_arm-1329859/chrome-mac/Chromium.app/Contents/MacOS/Chromium" : await chromium.executablePath(
      `https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar`
    ),
    headless: chromium.headless,
    // ignoreHTTPSErrors: true,
	 });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto('https://app.powerbi.com/view?r=eyJrIjoiNzRhMWRjNTgtYWFlZS00ZTViLTkyMjEtZGFmYTE5Zjg0YjI5IiwidCI6IjNkZDBiZGZlLTNkYmUtNGM5MC1iYmIxLWU4ZjljNjQzZjY0YyJ9');

	page.on('dialog', async (dialog: any) => {
		await dialog.accept();
	})

  // Set screen size
  await page.setViewport({width: 1920, height: 1080});

	//Ir para a página de login
	await page.waitForNetworkIdle();
	await page.waitForSelector('.imageBackground');
  await page.click('.imageBackground');


	// Preencher senha e login
	await page.waitForNetworkIdle();
	const inputSelector = '.date-slicer-control:nth-child(1) > .date-slicer-input';
	await page.locator(inputSelector).fill('2406')
	await page.waitForSelector(inputSelector).then((selector: any) => selector.press('Enter'));

	// clicar em IR
	let buttons = await page.$$('.ui-role-button-fill', );
	while (buttons.length <= 2) {
		await page.waitForNetworkIdle();
		buttons = await page.$$('.ui-role-button-fill');
		if(buttons.length > 2) {
			break;
		}
		await buttons[1].click();
	}

	buttons = await page.$$('.ui-role-button-fill', );
	await buttons[3].click();

	await page.waitForNetworkIdle();

	let contador = 0;
	const linksSelector = await page.$$('::-p-xpath(//visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div/div/div[2])')
	const nomesSelector = await page.$$('::-p-xpath(//visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div/div/span)');
	const total = linksSelector.length;
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
	
	do {
		await linksSelector[contador].click();
		await page.waitForNetworkIdle();

		const nome = await (await (nomesSelector[contador]).getProperty('innerText')).jsonValue()

		console.log(`Tirando screenshot de ${nome}`);

		const header = await page.$('.textRun');
		await header?.scrollIntoView();
		const date = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
		const filename = `${nome}-${date}.png`
		const file = await page.screenshot({
			type: 'png',
			clip: {
				x: 660,
				y: 125,
				width: 610,
				height: 610
			}
		})
		const fileStream = Readable.from(file);

	await uploadToGoogleDrive({ folderId: newFolder.data.id!, filename, fileStream});
	} while(++contador < total);
	console.log('Screenshots tiradas');
	await browser.close();
	} catch (error: any) {
		console.error('Error taking screenshots', error);
		if(error.code === 401) {
			await signOut({
				redirectTo: '/'
			});
		}
	}

}
