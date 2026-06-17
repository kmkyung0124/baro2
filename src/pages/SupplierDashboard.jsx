import React, { useState, useEffect } from 'react';
import { createReceipt, fetchSupplierDashboardData } from '../services/api';

function SupplierDashboard() {
  const [formData, setFormData] = useState({
    siteName: '',
    address: '',
    itemCategory: '',
    details: [{ detailItem: '', qty: '', unit: '', unitPrice: '' }],
    driverName: '',
    vehicleNo: '',
    driverPhone: '',
    deliveryFee: ''
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // API 호출하여 미수금 및 최근 내역 로드
    fetchSupplierDashboardData('USR_0001').then(data => setDashboardData(data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailChange = (index, e) => {
    const newDetails = [...formData.details];
    newDetails[index][e.target.name] = e.target.value;
    setFormData({ ...formData, details: newDetails });
  };

  const addDetail = () => {
    setFormData({ 
      ...formData, 
      details: [...formData.details, { detailItem: '', qty: '', unit: '', unitPrice: '' }] 
    });
  };

  const removeDetail = (index) => {
    const newDetails = formData.details.filter((_, i) => i !== index);
    setFormData({ ...formData, details: newDetails });
  };

  // 1차 버튼: 유효성 검사 후 모달 띄우기
  const handlePreview = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  // 2차 버튼: 실제 API 호출 (알림톡 전송)
  const confirmAndSubmit = async () => {
    setIsSubmitting(true);
    const result = await createReceipt(formData);
    setIsSubmitting(false);
    
    if (result && result.success) {
      alert('인수증 발행 및 알림톡 전송이 완료되었습니다.');
      setFormData({ 
        siteName: '', 
        address: '', 
        itemCategory: '', 
        details: [{ detailItem: '', qty: '', unit: '', unitPrice: '' }], 
        driverName: '', 
        vehicleNo: '',
        driverPhone: '',
        deliveryFee: ''
      });
      setShowModal(false);
    } else {
      console.error("API Error Result:", result);
      alert(`오류가 발생했습니다: ${result?.message || result?.error || '서버 오류'}`);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', position: 'relative' }}>
      
      {/* 미리보기 모달 */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', 
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)', textAlign: 'center' }}>
              전자인수증 발행 첫 페이지 화면과<br/>발행 내용을 확인해주세요!
            </h3>
            
            {/* 알림톡 디자인 iframe 미리보기 */}
            <div style={{ 
              width: '100%', height: '400px', margin: '1rem 0', borderRadius: '12px', 
              border: '8px solid #374151', overflow: 'hidden', backgroundColor: '#f3f4f6' 
            }}>
              <iframe 
                src="https://trusteel.lovable.app/" 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="알림톡 디자인 미리보기"
              />
            </div>

            {/* 입력 내용 요약 (수신자용 공개 항목만) */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>현장명:</strong> {formData.siteName}</p>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>현장주소:</strong> {formData.address}</p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>[납품 내역] - {formData.itemCategory}</strong></p>
                {formData.details.map((d, idx) => (
                  <div key={idx} style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.3rem', paddingLeft: '0.5rem' }}>
                    • {d.detailItem} : <strong>{d.qty}{d.unit}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 버튼 2개 */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                disabled={isSubmitting}
              >
                발행 취소
              </button>
              <button 
                type="button" 
                onClick={confirmAndSubmit} 
                style={{ flex: 1, backgroundColor: '#f59e0b' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? '전송 중...' : '알림톡 전송'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel">
        <h2 style={{ marginTop: 0, color: 'var(--primary-color)' }}>새 인수증 발행</h2>
        <form onSubmit={handlePreview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>현장명</label>
            <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>현장 주소</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>품목</label>
            <select name="itemCategory" value={formData.itemCategory} onChange={handleChange} required>
              <option value="">선택하세요</option>
              <option value="레미콘">레미콘</option>
              <option value="철근">철근</option>
              <option value="시멘트">시멘트</option>
            </select>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 500, margin: 0 }}>세부항목 내역</label>
              <button type="button" onClick={addDetail} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#10b981' }}>+ 항목 추가</button>
            </div>
            
            {formData.details.map((detail, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '1.5 1 120px' }}>
                  <input 
                    type="text" 
                    name="detailItem" 
                    value={detail.detailItem} 
                    onChange={(e) => handleDetailChange(index, e)} 
                    placeholder="세부항목 (예: 25-24-150)" 
                    required 
                    style={{ marginBottom: 0 }} 
                  />
                </div>
                <div style={{ flex: '2 1 150px', display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    name="qty" 
                    value={detail.qty} 
                    onChange={(e) => handleDetailChange(index, e)} 
                    placeholder="수량" 
                    required 
                    style={{ marginBottom: 0, flex: 2 }} 
                  />
                  <input 
                    type="text" 
                    name="unit" 
                    value={detail.unit} 
                    onChange={(e) => handleDetailChange(index, e)} 
                    placeholder="단위" 
                    required 
                    style={{ marginBottom: 0, flex: 1 }} 
                  />
                </div>
                <div style={{ flex: '1.2 1 100px' }}>
                  <input 
                    type="number" 
                    name="unitPrice" 
                    value={detail.unitPrice} 
                    onChange={(e) => handleDetailChange(index, e)} 
                    placeholder="단가(원)" 
                    required 
                    style={{ marginBottom: 0 }} 
                  />
                </div>
                {formData.details.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeDetail(index)} 
                    style={{ backgroundColor: '#ef4444', padding: '0.75rem', marginBottom: 0, flex: '0 0 auto' }}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#0284c7' }}>운반기사 정보</h4>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>운반기사 (이름)</label>
                <input type="text" name="driverName" value={formData.driverName} onChange={handleChange} required placeholder="김기사" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>차량번호</label>
                <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleChange} required placeholder="서울88가1234" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>연락처</label>
                <input type="tel" name="driverPhone" value={formData.driverPhone} onChange={handleChange} required placeholder="010-0000-0000" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>운반비 (원)</label>
                <input type="number" name="deliveryFee" value={formData.deliveryFee} onChange={handleChange} required placeholder="50000" />
              </div>
            </div>
          </div>

          <button type="submit" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
            전자인수증 발행
          </button>
        </form>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginTop: 0 }}>미수금 요약</h3>
          {dashboardData ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-light)' }}>총 미수금</p>
                  <h2 style={{ margin: 0, color: '#ef4444' }}>₩ {dashboardData.receivables.totalBalance.toLocaleString()}</h2>
                </div>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-light)' }}>연체 건수</p>
                  <h2 style={{ margin: 0, color: '#f59e0b' }}>{dashboardData.receivables.delayedCount}건</h2>
                </div>
              </div>
              <table style={{ width: '100%', fontSize: '0.9rem', textAlign: 'left', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>현장명</th>
                    <th>대상 월</th>
                    <th>잔액</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.receivables.list.map(item => (
                    <tr key={item.misuId}>
                      <td style={{ padding: '0.5rem 0' }}>{item.siteName}</td>
                      <td>{item.targetMonth}</td>
                      <td style={{ color: '#ef4444', fontWeight: 600 }}>₩ {item.balance.toLocaleString()}</td>
                      <td><span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p>로딩 중...</p>}
        </div>
        
        <div className="glass-panel" style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0 }}>최근 납품 내역</h3>
          {dashboardData && dashboardData.recentReceipts.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {dashboardData.recentReceipts.map(r => (
                <li key={r.receiptId} style={{ padding: '1rem 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{r.siteName}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{r.item} | {r.qty}대 | 단가: {r.unitPrice.toLocaleString()}원</div>
                  </div>
                  <div style={{ color: '#10b981', fontWeight: 600 }}>{r.status}</div>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: 'var(--text-light)' }}>등록된 내역이 없습니다.</p>}
        </div>
      </div>
    </div>
  );
}

export default SupplierDashboard;
