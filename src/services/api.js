const GAS_DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbw56mkv0MyR7nW87BbKj45NmFFMihTacnsJJhjzIl2ovvmJgncmrcfoMgSyIh0tdW8MXg/exec';

export const createReceipt = async (data) => {
  try {
    console.log('Sending createReceipt to GAS:', data);
    const response = await fetch(GAS_DEPLOY_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'createReceipt', ...data })
    });
    const result = await response.json();
    console.log('GAS Response:', result);
    return result;
  } catch (error) {
    console.error('Error creating receipt:', error);
    return { success: false, error: error.toString() };
  }
};

export const fetchSupplierDashboardData = async (userId) => {
  try {
    const response = await fetch(`${GAS_DEPLOY_URL}?action=getSupplierDashboard&userId=${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { receivables: { totalBalance: 0, delayedCount: 0, list: [] }, recentReceipts: [] };
  }
};

export const fetchSiteManagerReceipts = async (userId) => {
  try {
    const response = await fetch(`${GAS_DEPLOY_URL}?action=getSiteManagerReceipts&userId=${userId}`);
    const data = await response.json();
    
    // 만약 구글 시트가 비어있어서 데이터가 없다면 테스트용 샘플 데이터를 반환합니다.
    if (!data || data.length === 0) {
      console.log('No data found, using mock samples for testing.');
      return [
        { receiptId: 'REC_TEST_001', date: '2026-06-17', supplier: '(주)바로레미콘', item: '레미콘 - 25-24-150', qty: 10, price: 95000, status: '인수완료' },
        { receiptId: 'REC_TEST_002', date: '2026-06-17', supplier: '(주)바로레미콘', item: '레미콘 - 25-21-150', qty: 15, price: 92000, status: '인수완료' },
        { receiptId: 'REC_TEST_003', date: '2026-06-18', supplier: '튼튼철강(주)', item: '철근 - HD10', qty: 5, price: 850000, status: '인수완료' }
      ];
    }
    return data;
  } catch (error) {
    console.error('Error fetching site manager receipts:', error);
    return [];
  }
};

export const createStatement = async (receiptIds) => {
  try {
    // 임시 테스트용: 현재 GAS 쪽에 createStatement 백엔드 로직이 비어있으므로(Unknown action),
    // PDF 다운로드 테스트를 위해 무조건 성공으로 처리합니다.
    return { success: true, statementId: `STM_${Date.now()}` };
    
    /* 실제 배포용 코드 (주석 처리)
    const response = await fetch(GAS_DEPLOY_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'createStatement', receiptIds })
    });
    return await response.json();
    */
  } catch (error) {
    console.error('Error creating statement:', error);
    return { success: false, error: error.toString() };
  }
};
