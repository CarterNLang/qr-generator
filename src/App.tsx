import React, { useState } from "react";
import QRCode from "qrcode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [darkColor, setDarkColor] = useState<string>("#000000");
  const [lightColor, setLightColor] = useState<string>("#ffffff");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateQR = async () => {
    if (!text.trim()) {
      toast.error("Please enter text or URL!");
      return;
    }

    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrCode(qrDataUrl);
    } catch (err) {
      toast.error("Failed to generate QR code");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `qr-code-${new Date().getTime()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            QR Code Generator
          </h1>

          {/* Input Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Enter Text or URL
            </label>
            <div></div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              onKeyPress={(e) => e.key === "Enter" && generateQR()}
            />
          </div>

          {/* Color Pickers - Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Dark Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-12 h-12 cursor-pointer"
                />
                <span className="ml-2 text-gray-600">{darkColor}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Light Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-12 h-12 cursor-pointer"
                />
                <span className="ml-2 text-gray-600">{lightColor}</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateQR}
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              isGenerating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </button>

          {/* QR Code Display */}
          {qrCode && (
            <div className="mt-8 flex flex-col items-center">
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <img
                  src={qrCode}
                  alt="Generated QR Code"
                  className="w-48 h-48" // Fixed size for consistency
                />
              </div>
              <button
                onClick={downloadQR}
                className="mt-4 w-full sm:w-auto py-2 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Download PNG
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  );
};

export default App;
