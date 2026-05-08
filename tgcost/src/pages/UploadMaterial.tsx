import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileImage, Check, X, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type UploadStatus = 'idle' | 'uploading' | 'pending' | 'approved' | 'rejected';

export default function UploadMaterial() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [rejectionReason] = useState('Изображение не соответствует техническим требованиям. Размер должен быть не менее 1920x1080.');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatus('pending');
  };

  const simulateApproval = () => setStatus('approved');
  const simulateRejection = () => setStatus('rejected');

  return (
    <div className="min-h-screen bg-background">
      {}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Загрузка макета</h1>
        </div>
      </div>

      <div className="p-4">
        {}
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label className="block cursor-pointer">
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 transition-colors hover:border-primary hover:bg-primary/5">
                {preview ? (
                  <div className="relative w-full">
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto max-h-64 rounded-xl object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        setPreview(null);
                      }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/80 text-background"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <p className="mb-1 text-sm font-medium">Загрузить файл</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, MP4 до 50 МБ</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <div className="mt-4">
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                  <FileImage className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} МБ
                    </p>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={handleUpload}>
                  Загрузить
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {}
        {status === 'uploading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-12 text-center"
          >
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="font-medium">Загрузка...</p>
          </motion.div>
        )}

        {}
        {status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </div>
            <h2 className="mb-2 text-lg font-bold">На проверке</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Ваш макет отправлен на модерацию. Мы уведомим вас о результате.
            </p>

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mx-auto mb-6 max-h-48 rounded-xl object-contain"
              />
            )}

            {}
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="mb-3 text-xs text-muted-foreground">
                💡 Демо: имитировать результат модерации
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={simulateApproval}
                >
                  <Check className="mr-2 h-4 w-4 text-success" />
                  Одобрить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={simulateRejection}
                >
                  <X className="mr-2 h-4 w-4 text-destructive" />
                  Отклонить
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {}
        {status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-12 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="mb-2 text-lg font-bold">Макет одобрен!</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Ваша реклама будет размещена в указанные даты.
            </p>
            <Button onClick={() => navigate('/profile')} className="w-full" size="lg">
              Перейти в профиль
            </Button>
          </motion.div>
        )}

        {}
        {status === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h2 className="mb-2 text-lg font-bold">Макет отклонён</h2>
            <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-left">
              <p className="text-sm font-medium text-destructive">Причина:</p>
              <p className="mt-1 text-sm text-muted-foreground">{rejectionReason}</p>
            </div>
            <Button
              onClick={() => {
                setStatus('idle');
                setFile(null);
                setPreview(null);
              }}
              className="w-full"
              size="lg"
            >
              Загрузить другой файл
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
