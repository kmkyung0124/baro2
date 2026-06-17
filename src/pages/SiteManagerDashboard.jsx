import React, { useState, useEffect, useRef } from 'react';
import { fetchSiteManagerReceipts, createStatement } from '../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function SiteManagerDashboard() {
  const [receipts, setReceipts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    fetchSiteManagerReceipts('USR_0002').then(data => setReceipts(data));
  }, []);

  const handleCheckboxChange = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleGenerateStatement = async () => {
    if (selectedIds.size === 0) {
      alert('명세서를 발행할 내역을 선택해주세요.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // 1. GAS 백엔드에 선택된 ID 배열 전송 (Statement 생성)
      const response = await createStatement(Array.from(selectedIds));
      
      if (response && response.success) {
        // 2. PDF 생성 (html2canvas -> jsPDF)
        const element = printRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const data = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`거래명세서_${new Date().getTime()}.pdf`);
        
        alert(`명세서 발행 완료! (Statement ID: ${response.statementId})\nPDF 다운로드가 완료되었습니다.`);
        setSelectedIds(new Set()); // 초기화
      } else {
        alert('오류가 발생했습니다: ' + (response?.message || response?.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error("PDF 생성 에러:", error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 선택된 영수증 데이터 필터링 및 합계 계산
  const selectedReceipts = receipts.filter(r => selectedIds.has(r.receiptId));
  const totalAmount = selectedReceipts.reduce((sum, r) => sum + (Number(r.qty) * Number(r.price)), 0);

  return (
    <div style={{ position: 'relative' }}>
      {/* 화면 밖 숨겨진 거래명세서 렌더링 영역 (PDF용) */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={printRef} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', backgroundColor: '#fff', color: '#000', boxSizing: 'border-box' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '28pt', borderBottom: '2px solid #000', paddingBottom: '15px' }}>거 래 명 세 서</h1>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '12pt' }}>
            <div>
              <strong>[ 공급받는자 ]</strong><br/>
              <strong>현 장 명:</strong> 송정동 호텔공사 1158<br/>
              <strong>발행일자:</strong> {new Date().toLocaleDateString()}<br/>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>[ 공급자 ]</strong><br/>
              <strong>상 호:</strong> {selectedReceipts.length > 0 ? selectedReceipts[0].supplier : ''}<br/>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '11pt' }}>
            <thead>
              <tr style={{ borderTop: '2px solid #000', borderBottom: '1px solid #000', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'center' }}>일자</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>품목 및 규격</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>수량</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>단가</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>공급가액</th>
              </tr>
            </thead>
            <tbody>
              {selectedReceipts.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{r.date}</td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>{r.item}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{r.qty}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{Number(r.price).toLocaleString()}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{(Number(r.qty) * Number(r.price)).toLocaleString()}</td>
                </tr>
              ))}
              {/* 빈 줄 채우기 (최소 5줄 유지) */}
              {Array.from({ length: Math.max(0, 5 - selectedReceipts.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', fontWeight: 'bold', fontSize: '12pt', backgroundColor: '#f8fafc' }}>
                <td colSpan="4" style={{ padding: '15px', textAlign: 'right' }}>합계 금액:</td>
                <td style={{ padding: '15px', textAlign: 'right', color: '#1d4ed8' }}>{totalAmount.toLocaleString()} 원</td>
              </tr>
            </tfoot>
          </table>
          
          <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '10pt', color: '#64748b' }}>
            <p>위와 같이 계산함. (바로인수 전자인수증 시스템 자동 발급)</p>
          </div>
        </div>
      </div>

      {/* 실제 화면 UI */}
      <div className="glass-panel">
        <h2 style={{ marginTop: 0, color: 'var(--primary-color)' }}>자재 입고 내역</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="date" style={{ width: 'auto' }} />
            <span style={{ alignSelf: 'center' }}>~</span>
            <input type="date" style={{ width: 'auto' }} />
            <button style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-dark)', border: '1px solid #d1d5db' }}>조회</button>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ backgroundColor: '#10b981' }}>종이 증빙 OCR 업로드</button>
            <button 
              onClick={handleGenerateStatement} 
              disabled={isGenerating}
              style={{ backgroundColor: isGenerating ? '#94a3b8' : 'var(--primary-color)' }}
            >
              {isGenerating ? 'PDF 생성 중...' : '선택 항목 거래명세서(PDF) 일괄 다운로드'}
            </button>
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <th style={{ padding: '1rem 0' }}><input type="checkbox" disabled /></th>
              <th>날짜</th>
              <th>공급업체</th>
              <th>품목</th>
              <th>수량</th>
              <th>단가</th>
              <th>합계</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length > 0 ? (
              receipts.map(r => (
                <tr key={r.receiptId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(r.receiptId)} 
                      onChange={() => handleCheckboxChange(r.receiptId)} 
                    />
                  </td>
                  <td>{r.date}</td>
                  <td style={{ fontWeight: 500 }}>{r.supplier}</td>
                  <td>{r.item}</td>
                  <td>{r.qty}</td>
                  <td>{Number(r.price).toLocaleString()}원</td>
                  <td style={{ fontWeight: 600 }}>{(Number(r.qty) * Number(r.price)).toLocaleString()}원</td>
                  <td><span style={{ color: '#10b981', fontWeight: 600 }}>{r.status}</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)' }}>
                  입고된 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SiteManagerDashboard;
