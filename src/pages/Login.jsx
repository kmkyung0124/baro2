import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    if (role === 'supplier') {
      navigate('/supplier');
    } else {
      navigate('/site-manager');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>로그인</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
          서비스를 이용할 회원 유형을 선택해주세요.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => handleLogin('supplier')}
            style={{ padding: '1rem', fontSize: '1.1rem' }}
          >
            공급업체로 시작하기
          </button>
          
          <button 
            onClick={() => handleLogin('site-manager')}
            style={{ 
              padding: '1rem', 
              fontSize: '1.1rem',
              backgroundColor: 'var(--secondary-color)',
              color: 'var(--primary-color)',
              border: '2px solid var(--primary-color)'
            }}
          >
            현장 담당자로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
