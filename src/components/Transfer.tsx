import React, { useState } from 'react';
import axios from 'axios';
import { Send, ArrowLeftRight, CheckCircle2, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';
import { User, Account } from '../types';

interface TransferProps {
  user: User;
  accounts: Account[];
  activeAccount: Account | null;
  onRefreshAccounts: () => void;
  onNavigateToDashboard: () => void;
}

export default function Transfer({
  user,
  accounts,
  activeAccount,
  onRefreshAccounts,
  onNavigateToDashboard,
}: TransferProps) {
  const [sourceAccountId, setSourceAccountId] = useState(activeAccount?.id || accounts[0]?.id || '');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  // Useful shortcut receivers inside the sandbox
  const sampleReceivers = [
    { name: 'Sarah Connor (Rich)', accountNo: 'SB-100200300' },
    { name: 'John Connor', accountNo: 'SB-500600700' },
  ].filter(r => accounts.every(acc => acc.accountNumber !== r.accountNo)); // Hide user's own accounts

  const selectedSourceAccount = accounts.find(a => a.id === sourceAccountId);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ text: '', type: '' });

    if (!sourceAccountId || !receiverAccountNumber || !amount || Number(amount) <= 0) {
      setStatus({ text: 'All fields are required and amount must be positive.', type: 'error' });
      return;
    }

    if (selectedSourceAccount && selectedSourceAccount.balance < Number(amount)) {
      setStatus({ text: 'Insufficient balance for this transfer.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/transactions/transfer', {
        sourceAccountId,
        receiverAccountNumber: receiverAccountNumber.trim(),
        amount: Number(amount),
      });

      setStatus({
        text: response.data.message || 'Transfer completed successfully!',
        type: 'success',
      });
      setAmount('');
      setReceiverAccountNumber('');
      // Update ledger
      onRefreshAccounts();
    } catch (err: any) {
      setStatus({
        text: err.response?.data?.message || 'Transfer failed. Please check details and try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div id="transfer-wrapper" className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div>
        <span className="text-xs font-mono font-medium tracking-wider text-gray-400 uppercase">
          Financial Routing
        </span>
        <h1 className="text-3xl font-sans font-semibold text-gray-900 tracking-tight">
          Initiate Wire Transfer
        </h1>
        <p className="text-sm text-gray-500">
          Send funds securely to internal accounts instantly within the SimpleBank network.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Transfer Form (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E9ECEF] p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#E9ECEF]">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase">Transfer Parameters</h2>
              <p className="text-xs text-gray-400">Funds are verified and wired instantly</p>
            </div>
          </div>

          {/* Status banner */}
          {status.text && (
            <div className={`p-4 rounded-xl text-xs flex gap-2.5 items-start ${
              status.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' 
                : 'bg-rose-50 border border-rose-100 text-rose-800'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold block">{status.type === 'success' ? 'Transaction Settled' : 'Wire Refused'}</span>
                <span className="mt-0.5 block">{status.text}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleTransferSubmit} className="space-y-5">
            
            {/* From Account Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Source Account (Debit Target)</label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountType} ({acc.accountNumber}) — Available: {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Account Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Receiver Account Number</label>
              <input
                type="text"
                required
                placeholder="SB-XXXXXXXXX"
                value={receiverAccountNumber}
                onChange={(e) => setReceiverAccountNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <p className="text-[10px] text-gray-400">Must be a valid SimpleBank routing account identifier starting with "SB-".</p>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Transfer Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent font-semibold text-gray-900"
                />
              </div>
              {selectedSourceAccount && (
                <div className="flex justify-between items-center text-[10px] text-gray-500 pt-0.5">
                  <span>Balance: {formatCurrency(selectedSourceAccount.balance)}</span>
                  {amount && Number(amount) > 0 && (
                    <span className={selectedSourceAccount.balance >= Number(amount) ? 'text-emerald-600 font-medium' : 'text-rose-500 font-bold'}>
                      New balance after wire: {formatCurrency(selectedSourceAccount.balance - Number(amount))}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Secure warning badge */}
            <div className="p-3 bg-[#F8F9FB] border border-[#E9ECEF] rounded-xl flex items-center gap-2 text-gray-500 text-[10px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>SimpleBank Secure Wire transfers utilize direct ledger settlements without clearing delays.</span>
            </div>

            {/* Submit Wire Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="px-4 py-2 border border-[#E9ECEF] hover:bg-gray-50 text-gray-700 rounded-lg text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Executing Wire Transfer...' : 'Settle Wire Transaction'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Sandbox Directory / Help (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick-select recipient directory */}
          {sampleReceivers.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E9ECEF] p-8 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-900 uppercase">Sandbox Recipient Directory</h3>
                <p className="text-xs text-gray-400">Click a recipient below to auto-fill their account number</p>
              </div>

              <div className="space-y-2">
                {sampleReceivers.map((rec) => (
                  <button
                    key={rec.accountNo}
                    type="button"
                    onClick={() => {
                      setReceiverAccountNumber(rec.accountNo);
                      setStatus({ text: '', type: '' });
                    }}
                    className="w-full p-3.5 bg-[#F8F9FB] hover:bg-blue-50/50 border border-[#E9ECEF] hover:border-blue-200 text-left rounded-xl transition flex justify-between items-center text-xs group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-blue-900">{rec.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{rec.accountNo}</div>
                    </div>
                    <span className="text-[10px] text-blue-600 font-semibold group-hover:underline">Select</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-zinc-950 text-white rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-1.5 text-blue-400">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">Wire Settlement Guideline</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              In this SimpleBank sandbox environment, transfers to other registered bank accounts are settled on a peer-to-peer real-time basis.
            </p>
            <div className="text-[10px] text-zinc-500 font-mono">
              Status: Sandbox Online • Port 3000 Ingress
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
