import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useParams } from 'react-router-dom';

function ReceiptSign() {
  const { id } = useParams();
  const sigCanvas = useRef({});
  const [photo, setPhoto] = useState(null);

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
    }
  };

  const handleSubmit = () => {
    if (sigCanvas.current.isEmpty()) {
      alert('서명을 입력해주세요.');
      return;
    }
    if (!photo) {
      alert('하차 사진을 촬영해주세요.');
      return;
    }
    alert('인수 확인이 완료되었습니다. 감사합니다!');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div className="glass-panel">
        <h2 style={{ marginTop: 0, textAlign: 'center', color: 'var(--primary-color)' }}>전자 인수증 서명</h2>
        
        <div style={{ backgroundColor: 'var(--background-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}><strong>인수증 번호:</strong> {id || 'REC_TEST_001'}</p>
          <p style={{ margin: '0 0 0.5rem 0' }}><strong>현장명:</strong> 서울숲 벨라두 신축현장</p>
          <p style={{ margin: '0 0 0.5rem 0' }}><strong>품목:</strong> 레미콘 (25대)</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>1. 하차 사진 등록</h3>
          <div style={{ 
            border: '2px dashed #d1d5db', 
            borderRadius: '8px', 
            padding: '2rem', 
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {photo ? (
              <img src={photo} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
            ) : (
              <div>
                <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>터치하여 카메라로 사진을 촬영하세요.</p>
                <button type="button" style={{ pointerEvents: 'none' }}>카메라 열기</button>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handlePhotoUpload}
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>2. 서명란</h3>
            <button 
              onClick={clearSignature}
              style={{ 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.8rem', 
                backgroundColor: '#e5e7eb', 
                color: 'var(--text-dark)' 
              }}
            >
              다시 쓰기
            </button>
          </div>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white' }}>
            <SignatureCanvas 
              ref={sigCanvas} 
              canvasProps={{ width: 400, height: 200, className: 'sigCanvas', style: { width: '100%', height: '200px' } }} 
            />
          </div>
        </div>

        <button onClick={handleSubmit} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          인수 확인 완료
        </button>
      </div>
    </div>
  );
}

export default ReceiptSign;
