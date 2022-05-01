// eslint-disable-next-line import/no-unresolved
import { BinaryFileData, DataURL } from '@excalidraw/excalidraw/types/types';
// eslint-disable-next-line import/no-unresolved
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { randomInteger } from '../../../../common/helpers/utils';

export interface FileReaderResult {
  image: BinaryFileData;
  elm: ExcalidrawElement;
}

let fileId = '',
  fileMimeType = '',
  imgData = '',
  fileHeight: number,
  fileWidth: number,
  lastVersion,
  excalidrawHeight,
  excalidrawWidth;

export const fetchFileWithElm = async (
  url: string,
  file_id: string,
  last_version: number,
  uploaderWhiteboardHeight?: number,
  uploaderWhiteboardWidth?: number,
) => {
  return new Promise<FileReaderResult>(async (resolve, reject) => {
    const res = await fetch(url);
    const imageData = await res.blob();
    if (!imageData) {
      reject(null);
    }

    fileId = file_id;
    lastVersion = last_version;
    excalidrawHeight = uploaderWhiteboardHeight;
    excalidrawWidth = uploaderWhiteboardWidth;
    if (lastVersion < 0) {
      lastVersion = 1;
    }
    const reader = new FileReader();
    const readerBase64 = new FileReader();

    reader.onloadend = () => {
      fileMimeType = getRealMimeType(reader);
      if (fileMimeType !== 'unknown') {
        readerBase64.readAsDataURL(imageData);
      } else {
        reject(null);
      }
    };
    reader.readAsArrayBuffer(imageData);

    readerBase64.onload = () => {
      imgData = readerBase64.result as string;
      imgData = imgData.replace('application/octet-stream', fileMimeType);

      if (fileMimeType !== 'image/svg+xml') {
        const image = new Image();
        image.src = imgData;

        image.onload = async function () {
          await getFileDimension(image.height, image.width);
          const result = prepareForExcalidraw();
          resolve(result);
        };
      } else if (fileMimeType == 'image/svg+xml') {
        fileHeight = excalidrawHeight * 0.8;
        fileWidth = excalidrawWidth * 0.7;
        const result = prepareForExcalidraw();
        resolve(result);
      } else {
        reject('unsupported file');
      }
    };
  });
};

const prepareForExcalidraw = (): FileReaderResult => {
  const image: BinaryFileData = {
    id: fileId as any,
    dataURL: imgData as DataURL,
    mimeType: fileMimeType as any,
    created: Date.now(),
  };

  const percent = Math.round((fileWidth * 100) / excalidrawWidth);
  let reducedBy = 0.4;
  if (percent < 50) {
    reducedBy = 0.7;
  }

  const elm: ExcalidrawElement = {
    id: fileId,
    type: 'image',
    x: excalidrawHeight * reducedBy,
    y: excalidrawWidth * 0.06,
    width: fileWidth,
    height: fileHeight,
    angle: 0,
    strokeColor: 'transparent',
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    strokeSharpness: 'round',
    seed: randomInteger(),
    version: lastVersion + 1,
    versionNonce: randomInteger(),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    status: 'pending',
    fileId: fileId as any,
    scale: [1, 1],
  };

  return {
    image,
    elm,
  };
};

const getRealMimeType = (reader) => {
  const arr = new Uint8Array(reader.result).subarray(0, 4);
  let header = '';
  let realMimeType;

  for (let i = 0; i < arr.length; i++) {
    header += arr[i].toString(16);
  }

  // magic numbers: http://www.garykessler.net/library/file_sigs.html
  switch (header) {
    case '89504e47':
      realMimeType = 'image/png';
      break;
    case '47494638':
      realMimeType = 'image/gif';
      break;
    case 'ffd8ffDB':
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
    case 'ffd8ffe3':
    case 'ffd8ffe8':
      realMimeType = 'image/jpeg';
      break;
    case '3c3f786d':
    case '3c737667':
      realMimeType = 'image/svg+xml';
      break;
    default:
      // Or you can use the blob.type as fallback
      realMimeType = 'unknown';
      break;
  }

  return realMimeType;
};

const getFileDimension = async (height: number, width: number) => {
  fileHeight = Number(`${height}`);
  fileWidth = Number(`${width}`);
  const excalidrawActualHeight = excalidrawHeight - 40;
  const excalidrawActualWidth = excalidrawWidth - 180;

  let reducedBy = 0.01;
  while (fileHeight > excalidrawActualHeight) {
    fileHeight -= fileHeight * reducedBy;
    fileWidth -= fileWidth * reducedBy;
    reducedBy += 0.01;
  }

  reducedBy = 0.01;
  while (fileWidth > excalidrawActualWidth) {
    fileHeight -= fileHeight * reducedBy;
    fileWidth -= fileWidth * reducedBy;
    reducedBy += 0.01;
  }
};
