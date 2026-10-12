import { getAccessToken } from './firebase.ts';
import { SubjectId } from '../types/index.ts';

const SUBJECT_NAMES: Record<SubjectId, string> = {
  combined_maths: 'Combined Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
};

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

interface DriveFolder {
  id: string;
  name: string;
}

export async function findOrCreateFolder(
  folderName: string,
  parentId?: string,
  customToken?: string
): Promise<DriveFolder> {
  const token = customToken || getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token is not available. Please sign in with Google.');
  }

  // 1. Search for existing folder
  const queryParts = [
    `name = '${folderName.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
  ];
  if (parentId) {
    queryParts.push(`'${parentId}' in parents`);
  } else {
    queryParts.push("'root' in parents");
  }

  const query = encodeURIComponent(queryParts.join(' and '));
  const searchRes = await fetch(`${DRIVE_API_URL}?q=${query}&fields=files(id,name)&spaces=drive`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!searchRes.ok) {
    const errorData = await searchRes.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to search Google Drive folders (${searchRes.status})`
    );
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return {
      id: searchData.files[0].id,
      name: searchData.files[0].name,
    };
  }

  // 2. Folder does not exist, create it
  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const createRes = await fetch(DRIVE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to create folder '${folderName}' in Google Drive`
    );
  }

  const createdData = await createRes.json();
  return {
    id: createdData.id,
    name: createdData.name,
  };
}

export async function ensureSubjectHierarchy(
  subjectId: SubjectId,
  year: number = 2026,
  customToken?: string
): Promise<{ rootFolderId: string; subjectFolderId: string; yearFolderId: string }> {
  // Root: A/L Progress Tracker
  const root = await findOrCreateFolder('A/L Progress Tracker', undefined, customToken);
  // Subject: Combined Mathematics / Physics / Chemistry
  const subjectName = SUBJECT_NAMES[subjectId] || 'General';
  const subjectFolder = await findOrCreateFolder(subjectName, root.id, customToken);
  // Year: e.g. 2026
  const yearFolder = await findOrCreateFolder(String(year), subjectFolder.id, customToken);

  return {
    rootFolderId: root.id,
    subjectFolderId: subjectFolder.id,
    yearFolderId: yearFolder.id,
  };
}

export async function uploadPdfToDrive(params: {
  file: File | Blob;
  filename: string;
  folderId: string;
  customToken?: string;
}): Promise<{ id: string; name: string; webViewLink?: string; size?: string }> {
  const token = params.customToken || getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token missing. Sign in to Google first.');
  }

  const metadata = {
    name: params.filename,
    mimeType: 'application/pdf',
    parents: [params.folderId],
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const arrayBuffer = await params.file.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;
  const mediaHeader = `${delimiter}Content-Type: application/pdf\r\n\r\n`;

  const encoder = new TextEncoder();
  const metadataBuffer = encoder.encode(metadataPart);
  const mediaHeaderBuffer = encoder.encode(mediaHeader);
  const closeDelimiterBuffer = encoder.encode(closeDelimiter);

  const totalLength =
    metadataBuffer.length + mediaHeaderBuffer.length + fileBytes.length + closeDelimiterBuffer.length;
  const combinedBuffer = new Uint8Array(totalLength);

  let offset = 0;
  combinedBuffer.set(metadataBuffer, offset);
  offset += metadataBuffer.length;
  combinedBuffer.set(mediaHeaderBuffer, offset);
  offset += mediaHeaderBuffer.length;
  combinedBuffer.set(fileBytes, offset);
  offset += fileBytes.length;
  combinedBuffer.set(closeDelimiterBuffer, offset);

  const res = await fetch(
    `${DRIVE_UPLOAD_URL}&fields=id,name,webViewLink,webContentLink,size`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combinedBuffer,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google Drive upload failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    webViewLink: data.webViewLink,
    size: data.size,
  };
}

export async function testDriveConnection(customToken?: string): Promise<{ success: boolean; userEmail?: string }> {
  const token = customToken || getAccessToken();
  if (!token) return { success: false };

  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, userEmail: data.user?.emailAddress };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}
