// 안티그래비티에서 보낸 POST 요청 처리
function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    
    if (action === "createReceipt") {
      return createJsonResponse(createNewReceipt(requestData));
    } else if (action === "submitSignature") {
      // return createJsonResponse(processSignature(requestData)); // 서명 모듈 보류
    } else if (action === "createStatement") {
      // return createJsonResponse(createStatement(requestData)); // 명세서 모듈 보류
    }
    
    return createJsonResponse({ success: false, message: "Unknown action" });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

// 안티그래비티에서 보낸 GET 요청 처리
function doGet(e) {
  try {
    var action = e.parameter.action;
    var userId = e.parameter.userId;
    
    if (action === "getSupplierDashboard") {
      return createJsonResponse(getSupplierDashboardData(userId));
    } else if (action === "getSiteManagerReceipts") {
      return createJsonResponse(getSiteManagerReceipts(userId));
    }
    return createJsonResponse({ status: 'ok', message: 'API is running' });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
                       .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 1. 새 인수증 생성 로직 (Receipts 탭에 저장)
// ==========================================
function createNewReceipt(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Receipts");
  if (!sheet) return { success: false, message: "Receipts 시트를 찾을 수 없습니다." };
  
  // 시트가 완전히 비어있는 경우 첫 줄에 헤더(항목명)를 자동으로 추가합니다.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Receipt_ID", "Supplier_ID", "Site_Name", "Site_Address", "Item_Name", 
      "Quantity(단위포함)", "Unit_Price", "Driver_Name", "Vehicle_No", "Driver_Phone", 
      "Delivery_Fee", "Driver_Photo", "Signature_Photo", "Status", "Secure_Hash", "Signed_At", "Created_At"
    ]);
    // 헤더 스타일 꾸미기 (선택사항)
    sheet.getRange(1, 1, 1, 17).setBackground("#f3f4f6").setFontWeight("bold");
  }
  
  var supplierId = "USR_0001"; // (임시) 현재 로그인된 공급업체 ID
  var now = new Date();
  var timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  var createdIds = [];
  
  // details 배열(세부항목)을 순회하며 시트에 각각 한 줄씩 추가
  var details = data.details || [];
  for (var i = 0; i < details.length; i++) {
    var detail = details[i];
    var receiptId = "REC_" + now.getTime() + "_" + i; // 고유 ID 발급
    
    // 해시 생성 (보안)
    var hash = generateSecureHash(receiptId, detail.qty, detail.unitPrice, timestamp);
    var itemNameFull = data.itemCategory + " - " + detail.detailItem; // 레미콘 - 25-24-150
    var qtyWithUnit = detail.qty + (detail.unit ? " " + detail.unit : ""); // 25 대
    
    // 시트에 추가할 데이터 배열
    var rowData = [
      receiptId,          // A: Receipt_ID
      supplierId,         // B: Supplier_ID
      data.siteName,      // C: Site_Name
      data.address,       // D: Site_Address
      itemNameFull,       // E: Item_Name
      qtyWithUnit,        // F: Quantity (수량 + 단위)
      detail.unitPrice,   // G: Unit_Price
      data.driverName,    // H: Driver_Name
      data.vehicleNo,     // I: Vehicle_No
      data.driverPhone,   // J: Driver_Phone
      data.deliveryFee,   // K: Delivery_Fee
      "",                 // L: Driver_Photo (향후 서명 시 업데이트)
      "",                 // M: Signature_Photo (향후 서명 시 업데이트)
      "발행완료",           // N: Status
      hash,               // O: Secure_Hash
      "",                 // P: Signed_At
      timestamp           // Q: Created_At
    ];
    
    sheet.appendRow(rowData); // 시트의 마지막 줄에 데이터 삽입
    createdIds.push(receiptId);
  }
  
  return { success: true, receiptIds: createdIds };
}

// ==========================================
// 2. 공급업체 대시보드 조회 (Receivables, Receipts)
// ==========================================
function getSupplierDashboardData(userId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var receiptsSheet = ss.getSheetByName("Receipts");
  var receivablesSheet = ss.getSheetByName("Receivables");
  
  var recentReceipts = [];
  var receivablesList = [];
  var totalBalance = 0;
  var delayedCount = 0;

  // 2-1. 최근 납품 내역 가져오기
  if (receiptsSheet) {
    var rData = receiptsSheet.getDataRange().getValues();
    // 배열을 거꾸로 순회하여 최신순으로 5개만 가져옴 (첫번째 행 헤더 제외)
    for (var i = rData.length - 1; i > 0; i--) {
      if (rData[i][1] === userId) {
        recentReceipts.push({
          receiptId: rData[i][0],
          siteName: rData[i][2],
          item: rData[i][4],
          qty: rData[i][5],
          unitPrice: rData[i][6],
          status: rData[i][10]
        });
        if (recentReceipts.length >= 5) break;
      }
    }
  }

  // 2-2. 미수금 현황 가져오기
  if (receivablesSheet) {
    var mData = receivablesSheet.getDataRange().getValues();
    for (var j = 1; j < mData.length; j++) {
      if (mData[j][1] === userId) {
        var balance = Number(mData[j][6]) || 0;
        var status = mData[j][8];
        totalBalance += balance;
        if (status === "지연") delayedCount++;
        
        receivablesList.push({
          misuId: mData[j][0],
          siteName: mData[j][2],
          targetMonth: mData[j][3],
          balance: balance,
          status: status
        });
      }
    }
  }

  return {
    receivables: {
      totalBalance: totalBalance,
      delayedCount: delayedCount,
      list: receivablesList
    },
    recentReceipts: recentReceipts
  };
}

// ==========================================
// 3. 현장 담당자 입고 내역 조회
// ==========================================
function getSiteManagerReceipts(userId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Receipts");
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  var list = [];
  
  for (var i = 1; i < data.length; i++) {
    list.push({
      receiptId: data[i][0],
      supplier: data[i][1], // 향후 Users 탭과 조인하여 회사명 반환 필요
      siteName: data[i][2],
      item: data[i][4],
      qty: data[i][5],
      price: data[i][6],
      status: data[i][10],
      date: data[i][13] ? Utilities.formatDate(new Date(data[i][13]), Session.getScriptTimeZone(), "yyyy-MM-dd") : ""
    });
  }
  
  return list.reverse(); // 최신순 정렬
}

// 위변조 방지 해시 로직
function generateSecureHash(receiptId, qty, price, time) {
  var rawString = receiptId + qty + price + time + "BARO_INSU_SECRET_KEY";
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawString, Utilities.Charset.UTF_8);
  var hash = "";
  for (var i = 0; i < signature.length; i++) {
    var byteValue = signature[i];
    if (byteValue < 0) byteValue += 256;
    var byteString = byteValue.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    hash += byteString;
  }
  return hash;
}
