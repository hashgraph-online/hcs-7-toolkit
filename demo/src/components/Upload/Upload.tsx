'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { HCSClient } from '../../services/hcs-client';
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';
import { Job } from './Job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallets';
import useStartInscription, { PostData } from '@/hooks/useStartInscription';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Typography from '@/components/ui/typography';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import { calculateTieredPricing } from '@/services/cost';

const uploadStyles = 'p-0 text-center cursor-pointer text-white w-full mt-1';

interface UploadProps {
  title: string;
  network: string;
  setCurrentFile?: (file: string | null) => void;
  disableRedirects?: boolean;
  onUploadSuccess?: (job: Job) => void;
  disableBorder?: boolean;
  memo?: string;
  setMemo?: (memo: string) => void;
  onSubmitPublish?: () => Promise<void>;
  selectedTopic?: string | null;
}

interface SelectFileProps {
  isDragActive: boolean;
  file: Blob | null;
  title: string;
  isJSON?: boolean;
}

export const SelectFile = ({ file, title }: SelectFileProps) => {
  const [uploadCost, setUploadCost] = useState<number>(0);

  useEffect(() => {
    const compute = async () => {
      if (!file) {
        return;
      }

      const client = await HCSClient.create(file.type);

      let fileMessages = Math.round(Number(file?.size) / 700);

      const arrayBuffer = await file.arrayBuffer();

      const totalMessages = !Boolean(arrayBuffer)
        ? fileMessages
        : await client.getTotalMessages(Buffer.from(arrayBuffer));

      let totalFiles = 2;
      const baseCost = await calculateTieredPricing(totalMessages, totalFiles);
      const totalActualCost = baseCost;

      setUploadCost(totalActualCost);
    };
    compute();
  }, [file]);
  return (
    <div className='text-black dark:text-white'>
      <Typography variant='h3'>{title}</Typography>
      {file && (
        <div className='mt-2'>
          <Typography variant='p'>
            File Size: {(file.size / 1024).toFixed(2)} KB
          </Typography>
          <Typography variant='p'>
            Estimated Cost: {uploadCost.toFixed(8)} HBAR
          </Typography>
        </div>
      )}
    </div>
  );
};

export const getTitle = () => {
  return 'Upload HCS-1 File';
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const useSafeUppy = (factory: () => Uppy) => {
  const ref = useRef<Uppy>();
  const getterRef = useRef(() => {
    if (ref.current === undefined) {
      ref.current = factory();
    }
    return ref.current;
  });
  useEffect(() => {
    return () => {
      if (ref.current !== undefined) {
        ref.current.close();
        ref.current = undefined;
      }
    };
  }, []);
  return getterRef;
};

const allowedFileTypes = [
  'application/javascript',
  'text/javascript',
  'text/html',
  'text/css',
  'text/typescript',
  'application/json',
  'text/markdown',
  'text/plain', // For README files and other documentation
];

const allowedFileExtensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.html',
  '.css',
  '.json',
  '.md',
  '.txt',
];

export const Upload = ({
  title,
  network,
  setCurrentFile,
  disableRedirects,
  onUploadSuccess,
  memo,
  setMemo,
  onSubmitPublish,
  selectedTopic,
}: UploadProps) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileData, setFileData] = useState<Blob | null>(null);
  const [message, setMessage] = useState<string>('');
  const [showDashboard, setShowDashboard] = useState(true);
  const walletContext = useWallet();
  const hederaAddress = walletContext?.accountInfo?.accountId;

  const { postTransaction, inscription, clear } = useStartInscription(
    network,
    (inscribeJob: Job) => {
      if (onUploadSuccess) {
        onUploadSuccess(inscribeJob);
      }
    }
  );

  const fetchSelectedMessages = useCallback(async () => {
    if (selectedTopic) {
      const selectedTopicMessages = await walletContext?.sdk?.getMessages(
        selectedTopic
      );
      const existingTopic = selectedTopicMessages?.messages?.filter(
        (message) => {
          return message.t_id === inscription?.topic_id;
        }
      );
    }
  }, [selectedTopic, walletContext?.sdk, inscription?.topic_id]);

  useEffect(() => {
    fetchSelectedMessages();
  }, [fetchSelectedMessages]);

  const locationCallback = useCallback((location: string) => {
    const replaceSearch = `${baseUrl}/api/uploads/`;
    return location.replace(replaceSearch, '');
  }, []);

  const uppy = useSafeUppy(() => {
    const instance = new Uppy({
      id: `uppy-instance`,
      allowMultipleUploadBatches: false,
      allowMultipleUploads: false,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: allowedFileTypes,
        maxFileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }).use(Tus, {
      id: `uppy-instance-tus`,
      endpoint: `${baseUrl}/api/uploads`,
      chunkSize: 5 * 1024 * 1024,
    });

    instance.on('file-added', (file) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!allowedFileExtensions.includes(`.${fileExtension}`)) {
        instance.removeFile(file.id);
        setError(
          'Invalid file type. Please upload a valid developer content file.'
        );
      }
    });

    instance.on('complete', (result) => {
      result?.successful?.forEach((file) => {
        if (file.response && file.response.uploadURL) {
          const currentLocation = locationCallback(file.response.uploadURL);
          setUploadFile(currentLocation);
          setFileName(file.name || '');
        }
      });
    });

    instance.on('file-added', async (file) => {
      try {
        const arrayBuffer = await file.data.arrayBuffer();
        const fileBlob = new Blob([arrayBuffer], {
          type: file.type,
        });
        setFileData(fileBlob);
        const result = await instance.upload();
        if (setCurrentFile && result?.successful?.[0]?.preview) {
          setCurrentFile(result?.successful?.[0]?.preview);
        }
      } catch (e) {
        console.error('Error processing file:', e);
      }
    });
    return instance;
  })?.current;

  useEffect(() => {
    if (inscription) {
      setShowDashboard(false);
    }
  }, [inscription]);

  const progressValue = useMemo(() => {
    if (!inscription) return 0;
    const { messages, maxMessages } = inscription;
    return Math.min(((messages || 0) / (maxMessages || 1)) * 100, 100);
  }, [inscription]);

  const handleUpload = useCallback(async () => {
    if (!uploadFile) {
      setError('Please upload a file first.');
      return;
    }

    if (uploading) {
      return;
    }
    try {
      setUploading(true);

      let currentFile = uploadFile;

      let payload: PostData = {
        fileURL: currentFile,
        fileName: fileName,
        // @ts-ignore
        holderId: hederaAddress,
        mode: 'upload',
        type: 'file',
        network,
        creator: '',
        description: '',
        fileStandard: '1',
      };

      await postTransaction(payload);
      setShowDashboard(false);
    } catch (e) {
      console.error(e);
      setUploading(false);
      setError(
        'Upload failed. Please try again. Ensure your upload is in the correct format.'
      );
    }
  }, [
    uploadFile,
    uploading,
    fileName,
    hederaAddress,
    network,
    postTransaction,
  ]);

  const handleNewUpload = useCallback(() => {
    setShowDashboard(true);
    clear();
    setUploadFile(null);
    setFileData(null);
    setFileName('');
    setError('');
    setMessage('');
    // Clear the cached transaction ID
    localStorage.removeItem('lastTransactionId');
  }, [clear]);

  let buttonIsDisabled = !hederaAddress || !uploadFile;

  const isAuthenticated = Boolean(hederaAddress);

  const isCompleted =
    progressValue === 100 || inscription?.status === 'completed';

  return (
    <div className='space-y-6'>
      {message && <Alert>{message}</Alert>}
      {error && <Alert variant='destructive'>{error}</Alert>}

      {selectedTopic && (
        <Card className='shadow-md border border-gray-200 dark:border-gray-700'>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {!isAuthenticated ? (
              <Typography variant='p'>
                Please connect your wallet to upload.
              </Typography>
            ) : (
              <>
                {showDashboard && (
                  <>
                    <div className={uploadStyles}>
                      <SelectFile
                        file={fileData}
                        isDragActive={false}
                        title={getTitle()}
                      />
                      <Dashboard
                        uppy={uppy()}
                        plugins={['tus']}
                        proudlyDisplayPoweredByUppy={false}
                        theme='light'
                        width='100%'
                        note={`Allowed file types: ${allowedFileExtensions.join(
                          ', '
                        )}`}
                      />
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || buttonIsDisabled}
                      className='w-full'
                    >
                      {uploading ? 'Inscribing...' : 'Inscribe File'}
                    </Button>
                  </>
                )}
                {!showDashboard && (
                  <Button onClick={handleNewUpload} className='w-full'>
                    Upload New File
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {inscription && (
        <Card className='shadow-md border border-gray-200 dark:border-gray-700'>
          <CardHeader>
            <CardTitle>Inscription Progress</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between items-center'>
              <Typography variant='p'>{inscription.name}</Typography>
              <Badge variant='outline'>
                <Typography variant='p'>
                  TopicId:{' '}
                  <Link
                    className='text-blue-500'
                    href={`https://hashscan.io/${network}/topic/${inscription.topic_id}`}
                    target='_blank'
                  >
                    {inscription.topic_id}
                  </Link>
                </Typography>
              </Badge>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Typography variant='p'>{`${inscription?.messages || 0} / ${
                  inscription?.maxMessages || 'N/A'
                } messages`}</Typography>
                <Typography variant='p'>{`${progressValue.toFixed(
                  2
                )}%`}</Typography>
              </div>
              <Progress value={progressValue} className='w-full' />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
