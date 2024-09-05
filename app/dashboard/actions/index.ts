'use server';
import { auth } from '@/lib/auth';
import { oAuthGoogle } from '@/lib/google';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { handleScreenshots } from './screenshot';

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
		const drive = google.drive({ version: 'v3', auth: oAuthGoogle });
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
	const session = await auth();

	oAuthGoogle.setCredentials({
		access_token: session?.accessToken
	});

	const drive = google.drive({ version: 'v3', auth: oAuthGoogle });

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

export { handleScreenshots };
