import React, { useState } from 'react';
import { processOneTimePayment } from '../services/paymentService';
import { supabase } from '../services/supabaseClient';

interface PaymentComponentProps {
  userId: string;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

export const PaymentComponent: React.FC<PaymentComponentProps> = ({ 
  userId, 
  onPaymentSuccess,
  onPaymentCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const handlePayment = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // In a real implementation, you would integrate with a payment processor
      // For now, we'll simulate a successful payment
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user as subscriber in Supabase
      const { error } = await supabase
        .from('users')
        .update({ is_subscriber: true })
        .eq('id', userId);
        
      if (error) throw error;
      
      setMessage('Payment successful! You now have unlimited access.');
      setMessageType('success');
      
      // Call the success callback
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    } catch (error: any) {
      console.error('Payment error:', error);
      setMessage(error.message || 'Payment failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900/50 border border-slate-700 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Upgrade to Unlimited Access</h2>
      
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-lg text-slate-200 mb-2">Premium Features</h3>
        <ul className="space-y-2 text-slate-300">
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Unlimited queries per day
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Receive analysis results via email
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Priority access to new features
          </li>
        </ul>
      </div>
      
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-fuchsia-400">$10</p>
        <p className="text-slate-400">One-time payment</p>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          messageType === 'success' ? 'bg-green-900/50 border border-green-700' : 
          messageType === 'error' ? 'bg-red-900/50 border border-red-700' : 
          'bg-blue-900/50 border border-blue-700'
        }`}>
          {message}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={onPaymentCancel}
          disabled={loading}
          className="flex-1 bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-md hover:bg-fuchsia-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay $10'}
        </button>
      </div>
    </div>
  );
};import React, { useState } from 'react';
import { processOneTimePayment } from '../services/paymentService';
import { supabase } from '../services/supabaseClient';

interface PaymentComponentProps {
  userId: string;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

export const PaymentComponent: React.FC<PaymentComponentProps> = ({ 
  userId, 
  onPaymentSuccess,
  onPaymentCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const handlePayment = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // In a real implementation, you would integrate with a payment processor
      // For now, we'll simulate a successful payment
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user as subscriber in Supabase
      const { error } = await supabase
        .from('users')
        .update({ is_subscriber: true })
        .eq('id', userId);
        
      if (error) throw error;
      
      setMessage('Payment successful! You now have unlimited access.');
      setMessageType('success');
      
      // Call the success callback
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    } catch (error: any) {
      console.error('Payment error:', error);
      setMessage(error.message || 'Payment failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900/50 border border-slate-700 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Upgrade to Unlimited Access</h2>
      
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-lg text-slate-200 mb-2">Premium Features</h3>
        <ul className="space-y-2 text-slate-300">
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Unlimited queries per day
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Receive analysis results via email
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Priority access to new features
          </li>
        </ul>
      </div>
      
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-fuchsia-400">$10</p>
        <p className="text-slate-400">One-time payment</p>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          messageType === 'success' ? 'bg-green-900/50 border border-green-700' : 
          messageType === 'error' ? 'bg-red-900/50 border border-red-700' : 
          'bg-blue-900/50 border border-blue-700'
        }`}>
          {message}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={onPaymentCancel}
          disabled={loading}
          className="flex-1 bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-md hover:bg-fuchsia-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay $10'}
        </button>
      </div>
    </div>
  );
};