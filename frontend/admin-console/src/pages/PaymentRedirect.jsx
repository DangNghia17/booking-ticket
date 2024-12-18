import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Result } from 'antd';

const PaymentRedirect = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/payment-list');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Result
        status="success"
        title={t('payment.success')}
        subTitle={t('payment.redirect')}
      />
    </div>
  );
};

export default PaymentRedirect; 