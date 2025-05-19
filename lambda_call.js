import path from 'path';

const baseRequest = async (url, method, body) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.error(`Failed to ${method} ${url}`);
    return;
  }
  const data = await response.json();
  return data;
};

const createConvertedFileUrl = async (fileName, fileUrl) => {
  const apiUrl = process.env.API_URL;
  const response = await baseRequest(`${apiUrl}/user/upload`, 'POST', {
    fileName,
    fileUrl,
  });
  return response;
};

const login = async () => {
  const apiUrl = process.env.API_URL;
  const response = await baseRequest(`${apiUrl}/login`, 'POST', {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  });
  return response;
};

const checkUUID = (fileName) => {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      fileName,
    );
  return isUuid;
};

export const handler = async (event) => {
  const {
    Records: [record],
  } = event;

  const { s3 } = record;
  if (!s3) {
    console.error('No S3 event found');
    return;
  }

  const { bucket, object } = s3;
  const bucketName = bucket.name;
  const fileName = object.key;
  const inputS3UrlFile = `s3://${bucketName}/${fileName}`;
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);

  // Check baseName is uuid
  const isUuid = checkUUID(baseName);
  if (!isUuid) {
    console.error('File name is not a valid UUID');
    return;
  }

  // Call api create file using fetch
  //   const { accessToken } = await login();
  const data = await createConvertedFileUrl(baseName, inputS3UrlFile);

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'File created successfully',
      data,
    }),
  };
};
