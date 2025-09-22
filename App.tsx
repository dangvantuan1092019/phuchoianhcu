
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { UploadedImage, RestorationResult } from './types';
import { restoreImage } from './services/geminiService';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<UploadedImage | null>(null);
  const [restoredResult, setRestoredResult] = useState<RestorationResult | null>(null);
  const [prompt, setPrompt] = useState<string>('phục hồi ảnh này, khử nhiễu và làm rõ nét các chi tiết');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setOriginalImage(image);
    setRestoredResult(null);
    setError(null);
  }, []);

  const handleRestoreClick = async () => {
    if (!originalImage) {
      setError('Vui lòng tải ảnh lên trước.');
      return;
    }
    if (!prompt) {
      setError('Vui lòng nhập yêu cầu phục hồi.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRestoredResult(null);

    try {
      const result = await restoreImage(originalImage.base64, originalImage.file.type, prompt);
      setRestoredResult(result);
    } catch (e) {
      console.error(e);
      setError('Đã xảy ra lỗi trong quá trình phục hồi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (restoredResult?.image) {
      const link = document.createElement('a');
      link.href = restoredResult.image;
      link.download = `restored_${originalImage?.file.name ?? 'image.png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col gap-8">
          {/* Controls Section */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <h2 className="text-xl font-bold mb-4 text-amber-400">1. Tải ảnh lên</h2>
                <ImageUploader onImageUpload={handleImageUpload} />
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4 text-amber-400">2. Nhập yêu cầu</h2>
                <p className="text-sm text-gray-400 mb-2">
                  Mô tả những gì bạn muốn AI thực hiện (ví dụ: tô màu, xóa vết xước, làm rõ nét).
                </p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-28 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 placeholder-gray-500 disabled:opacity-50"
                  placeholder="Ví dụ: Tô màu cho ảnh này và xóa các vết nứt..."
                  disabled={!originalImage}
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleRestoreClick}
                disabled={isLoading || !originalImage}
                className="w-full md:w-1/2 bg-amber-500 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-amber-400 transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {isLoading ? <Spinner /> : 'Bắt đầu phục hồi'}
              </button>
              {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
          </div>

          {/* Results Section */}
          {originalImage ? (
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-semibold mb-4 text-center">Ảnh gốc</h3>
                    <div className="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                       <img src={originalImage.base64} alt="Original" className="object-contain w-full h-full" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-semibold mb-4 text-center">Ảnh đã phục hồi</h3>
                    <div className="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                      {isLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-10">
                            <Spinner />
                            <p className="mt-4 text-lg">AI đang xử lý, vui lòng chờ...</p>
                        </div>
                      )}
                      {restoredResult?.image ? (
                        <>
                          <img src={restoredResult.image} alt="Restored" className="object-contain w-full h-full" />
                          <button 
                            onClick={handleDownload}
                            className="absolute top-3 right-3 bg-gray-900 bg-opacity-70 p-2 rounded-full text-white hover:bg-opacity-100 hover:text-amber-400 transition-all duration-200"
                            title="Tải ảnh xuống"
                          >
                            <DownloadIcon />
                          </button>
                        </>
                      ) : (
                        !isLoading && <p className="text-gray-500">Kết quả sẽ hiển thị ở đây</p>
                      )}
                    </div>
                  </div>
                </div>

                {restoredResult?.text && (
                   <div className="mt-8 w-full bg-gray-800 p-4 rounded-lg shadow-lg">
                      <h4 className="font-bold text-amber-400">Ghi chú từ AI:</h4>
                      <p className="text-gray-300 mt-1">{restoredResult.text}</p>
                   </div>
                )}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-800 rounded-xl shadow-lg">
                <p className="text-gray-500 text-xl">Vui lòng tải ảnh lên ở mục 1 để bắt đầu</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
