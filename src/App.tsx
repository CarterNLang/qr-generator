import React, { useState, useRef } from "react";
import QRCode from "qrcode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [darkColor, setDarkColor] = useState<string>("#000000");
  const [lightColor, setLightColor] = useState<string>("#FFFFFF");
  const qrRef = useRef<HTMLDivElement>(null);

  const generateQR = async () => {
    if (!text.trim()) {
      toast.error("Please enter text or URL!");
      return;
    }

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
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "qr-code.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          QR Code Generator
        </h1>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Enter Text/URL</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Dark Color</label>
            <input
              type="color"
              value={darkColor}
              onChange={(e) => setDarkColor(e.target.value)}
              className="w-full h-10"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Light Color</label>
            <input
              type="color"
              value={lightColor}
              onChange={(e) => setLightColor(e.target.value)}
              className="w-full h-10"
            />
          </div>
        </div>

        <button
          onClick={generateQR}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-4"
        >
          Generate QR Code
        </button>

        {qrCode && (
          <div className="mt-6 flex flex-col items-center">
            <img src={qrCode} alt="QR Code" className="mb-4 border p-2" />
            <button
              onClick={downloadQR}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Download PNG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
