import React, { useState } from 'react';
import { Camera, ChevronRight, ChevronLeft, CheckCircle, Upload, RefreshCw, Image as ImageIcon, Check, AlertCircle, X, RotateCcw } from 'lucide-react';


 import JSZip from 'jszip';

 import anhminhhoa1 from './assets/Ref_1.jpg';
 import anhminhhoa2 from './assets/Ref_2.jpg';
 import anhminhhoa3 from './assets/Ref_3.jpg';
 import anhminhhoa4 from './assets/Ref_4.jpg';
 import anhminhhoa5 from './assets/Ref_5.jpg';
 import anhminhhoa6 from './assets/Ref_6.jpg';
 import anhminhhoa7 from './assets/Ref_7.jpg';


// --- DANH SÁCH 8 CÂU HỎI ---

const QUESTIONS = [
  { id: 1, title: "1. Ảnh tổng quan Inverter, Tủ AC Solar", desc: "Có bị chất đồ dễ gây cháy không?", refImage: anhminhhoa1 },
  { id: 2, title: "2. Ảnh mở cửa tủ AC Solar", desc: "Chụp ảnh trong tủ AC Solar", refImage: anhminhhoa2 },
  { id: 3, title: "3. Ảnh kiểm tra cờ chống sét", desc: "Kiểm tra tất cả cờ chống sét AC/DC có chuyển màu bất thường không?", refImage: anhminhhoa3 },
  { id: 4, title: "4. Ảnh đấu nối Solar và tủ MSB Cửa hàng", desc: "Kiểm tra xem phần đấu nối có khả năng phát nhiệt không?", refImage: anhminhhoa4 },
  { id: 5, title: "5. Ảnh các đầu MC4 ở tủ AC", desc: "Có bị biến dạng không? (Chảy nhựa,...)", refImage: anhminhhoa5 },
  { id: 6, title: "6. Ảnh các đầu MC4 ở Inverter", desc: "Có bị biến dạng không? (chảy nhựa,...)", refImage: anhminhhoa6 },
  { id: 7, title: "7. Ảnh vị trí gắn Inverter với tường", desc: "Có khả năng bị bung ra không?", refImage: anhminhhoa7 },
  { id: 8, title: "8. Ảnh vị trí gắn tủ AC với tường", desc: "Có khả năng bị bung ra không?", refImage: "https://placehold.co/600x400/e2e8f0/475569?text=Minh+Hoa" },
];

const App = () => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [userImages, setUserImages] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // --- XỬ LÝ 1: CHỤP ẢNH ---
  const handleImageCapture = (e, questionId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImages(prev => ({
          ...prev,
          [questionId]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // --- XỬ LÝ 2: XÓA ẢNH ---
  const removeImage = (questionId) => {
    if (window.confirm("Bạn có chắc muốn xóa ảnh này không?")) {
      const newImages = { ...userImages };
      delete newImages[questionId];
      setUserImages(newImages);
    }
  };

  // --- XỬ LÝ 3: UPLOAD FILE LÊN GOOGLE DRIVE (ĐÃ SỬA) ---
  const uploadReport = async () => {
    // Kiểm tra xem đã cài đặt thư viện chưa (tránh lỗi khi chạy demo)
    if (typeof JSZip === 'undefined') {
        alert("Lỗi: Bạn chưa bỏ dấu // ở dòng 'import JSZip' trong code! Hãy sửa lại code trước khi chạy.");
        return;
    }

    if (Object.keys(userImages).length === 0) {
        alert("Chưa có ảnh nào để gửi!");
        return;
    }

    setIsUploading(true);
    
    try {
      // 1. Tạo file ZIP
      const zip = new JSZip(); // Sử dụng thư viện JSZip
      const imgFolder = zip.folder("Hinh_Anh_Bao_Cao");
      
      let reportContent = `BÁO CÁO KIỂM TRA CỬA HÀNG\n`;
      reportContent += `Ngày tạo: ${new Date().toLocaleString('vi-VN')}\n`;
      reportContent += `==========================================\n\n`;

      QUESTIONS.forEach((q) => {
        const imgData = userImages[q.id];
        // Tạo tên file
        const cleanName = q.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").replace(/\./g, "").replace(/[^a-zA-Z0-9_]/g, "");
        const fileName = `${cleanName}.jpg`;

        if (imgData) {
          const base64Data = imgData.split(',')[1];
          imgFolder.file(fileName, base64Data, { base64: true });
          reportContent += `[OK] ${q.title}\n -> Ảnh minh chứng: ${fileName}\n\n`;
        } else {
          reportContent += `[MISSING] ${q.title}\n -> (Không có hình ảnh)\n\n`;
        }
      });
      zip.file("Tong_Hop_Ket_Qua.txt", reportContent);

      // 2. Nén thành Base64 để gửi đi
      const zipBase64 = await zip.generateAsync({ type: "base64" });
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const fileName = `Bao_Cao_${dateStr}.zip`;

      // 3. Gửi lên Google Apps Script
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxRr5SVjOnRawhK-1YzKYPpX_4IZt_JjH5oJOBE5TxdqEMqKEp6a_g2sHplzcvtCpUU2g/exec"; 
      
      if (GOOGLE_SCRIPT_URL.includes("DAN_LINK")) {
          alert("Bạn chưa dán link Google Script vào code!");
          setIsUploading(false);
          return;
      }

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
            filename: fileName,
            fileData: zipBase64
        })
      });

      alert("✅ Gửi báo cáo thành công! Dữ liệu đã được lưu vào Google Drive.");

    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi gửi: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- MÀN HÌNH TỔNG KẾT ---
  if (currentStep === QUESTIONS.length) {
    const capturedCount = Object.keys(userImages).length;
    const missingCount = QUESTIONS.length - capturedCount;

    return (
      <div className="min-h-screen bg-gray-50 p-6 font-sans pb-24">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row h-full">
          
          {/* Cột trái: Thông tin & Nút bấm */}
          <div className={`p-8 md:w-1/3 flex flex-col justify-center items-center text-center text-white ${missingCount > 0 ? 'bg-amber-500' : 'bg-green-600'}`}>
            {missingCount > 0 ? <AlertCircle className="w-24 h-24 mb-4 opacity-90"/> : <CheckCircle className="w-24 h-24 mb-4"/>}
            <h1 className="text-4xl font-bold mb-2">Tổng Kết</h1>
            <p className="text-lg opacity-90 mb-6">Đã chụp {capturedCount} / {QUESTIONS.length} mục</p>
            
            {/* Nút Upload */}
            <button onClick={uploadReport} disabled={isUploading} className="w-full py-4 bg-white text-blue-900 font-bold rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-all disabled:opacity-70">
              {isUploading ? <RefreshCw className="animate-spin"/> : <Upload size={24} />}
              {isUploading ? "Đang đẩy lên Drive..." : "Gửi Báo Cáo Ngay"}
            </button>
            
            <button onClick={() => {if(window.confirm("Xóa hết dữ liệu cũ?")) {setUserImages({}); setCurrentStep(0);}}} className="mt-4 text-sm hover:underline opacity-80 flex items-center gap-1">
              <RotateCcw size={14}/> Làm mới toàn bộ
            </button>
          </div>

          {/* Cột phải: Danh sách chi tiết */}
          <div className="p-6 md:w-2/3 bg-white">
            <h3 className="font-bold text-gray-700 mb-4 text-xl border-b pb-2">Chi tiết hình ảnh:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className={`w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden border ${userImages[q.id] ? 'border-green-500' : 'border-gray-300'}`}>
                    {userImages[q.id] ? <img src={userImages[q.id]} className="w-full h-full object-cover" alt="thumb"/> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20}/></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{q.title}</p>
                    <div className="mt-1">
                        {userImages[q.id] ? (
                            <span className="text-green-600 font-bold text-xs flex items-center gap-1"><Check size={12}/> Đã xong</span>
                        ) : (
                            <label className="text-blue-600 font-bold text-xs flex items-center gap-1 cursor-pointer hover:underline">
                                <Camera size={12}/> Chụp bù
                                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageCapture(e, q.id)} className="hidden" />
                            </label>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH CÂU HỎI (Step by Step) ---
  const currentQ = QUESTIONS[currentStep];
  const hasCaptured = !!userImages[currentQ.id];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm flex flex-col gap-2 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-800 text-lg md:text-xl">Kiểm Tra: {currentQ.title}</h2>
                <span className={`text-xs md:text-sm font-bold px-3 py-1 rounded-full ${hasCaptured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{hasCaptured ? 'Đã chụp' : 'Chưa chụp'}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}></div>
            </div>
            <p className="text-gray-500 text-sm mt-2 hidden md:block">{currentQ.desc}</p>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 pb-24">
        {/* Cột 1: Ảnh Mẫu */}
        <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:h-full">
                <h3 className="text-gray-500 font-bold text-sm uppercase mb-2">Yêu cầu & Ảnh mẫu</h3>
                <p className="text-gray-800 text-lg mb-4 md:hidden">{currentQ.desc}</p>
                <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 aspect-video md:aspect-auto md:h-[400px]">
                    <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md z-10">ẢNH MẪU</span>
                    <img src={currentQ.refImage} alt="Ref" className="w-full h-full object-cover" />
                </div>
            </div>
        </div>

        {/* Cột 2: Camera (Chỉ 1 nút to) */}
        <div className="flex-1 flex flex-col">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
                <h3 className="text-gray-500 font-bold text-sm uppercase mb-4">Ảnh thực tế</h3>
                <div className="relative flex-1 min-h-[300px] md:min-h-0">
                    {hasCaptured ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-green-500 bg-gray-50 group">
                        <img src={userImages[currentQ.id]} alt="Captured" className="w-full h-full object-contain bg-black/5" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button onClick={() => removeImage(currentQ.id)} className="bg-white text-red-600 px-4 py-2 rounded-full font-bold shadow-lg hover:bg-red-50 flex items-center gap-2">
                                <X size={18} /> Chụp lại
                            </button>
                        </div>
                        <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">ĐÃ CÓ ẢNH</span>
                    </div>
                    ) : (
                    <label className="flex flex-col items-center justify-center gap-4 w-full h-full bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer transition-all group">
                        <div className="bg-white p-6 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                             <Camera size={64} className="text-blue-600" />
                        </div>
                        <div className="text-center">
                             <span className="block font-bold text-blue-700 text-2xl">Bấm để chụp ảnh</span>
                             <span className="text-blue-400 text-sm mt-1">Camera sẽ tự động mở</span>
                        </div>
                        <input type="file" accept="image/*" capture="environment" onChange={(e) => handleImageCapture(e, currentQ.id)} className="hidden" />
                    </label>
                    )}
                </div>
           </div>
        </div>
      </main>

      {/* Footer Nav */}
      <div className="bg-white p-4 border-t border-gray-200 fixed bottom-0 left-0 right-0 z-30 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex gap-4 w-full">
          <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="px-6 py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 disabled:opacity-30 flex items-center gap-2 transition-colors">
            <ChevronLeft size={20} /> <span className="hidden md:inline">Quay lại</span>
          </button>
          <button onClick={() => setCurrentStep(currentStep + 1)} className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99] text-lg ${hasCaptured ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 hover:bg-gray-500'}`}>
            {currentStep === QUESTIONS.length - 1 ? <>Hoàn tất <CheckCircle/></> : (hasCaptured ? <>Tiếp theo <ChevronRight/></> : <>Bỏ qua bước này <ChevronRight/></>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;