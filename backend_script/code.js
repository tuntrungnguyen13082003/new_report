function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var fileName = data.filename;
    var base64Data = data.fileData;
    
    var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), "application/zip", fileName);
    
    // --- ĐOẠN SỬA LẠI ---
    
    // 1. Lấy thư mục theo ID bạn vừa tìm được
    var folder = DriveApp.getFolderById("1rApCukRbxjEXLSN7zIFW1rmTYZQBoS-9");
    
    // 12. Tạo file trong thư mục đó
    var file = folder.createFile(blob);
    
    // -------------------

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      url: file.getUrl() 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}