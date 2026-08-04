import { uploadData, getUrl } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';

// Altar card photo uploads — replaces Base44's UploadFile integration.
export async function uploadFile({ file }) {
  const user = await getCurrentUser();
  const path = `altar-cards/${user.userId}/${Date.now()}-${file.name}`;
  await uploadData({ path, data: file, options: { contentType: file.type } }).result;
  const { url } = await getUrl({ path });
  return { file_url: url.toString() };
}
