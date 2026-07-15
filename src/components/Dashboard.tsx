import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpRight, ArrowDownLeft, CreditCard, DollarSign, Plus, Send, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { User, Account, Transaction } from '../types';
import { API_CONFIG } from '../apiConfig';

interface DashboardProps {
  user: User;
  accounts: Account[];
  activeAccount: Account | null;
  onSelectAccount: (account: Account) => void;
  onRefreshAccounts: () => void;
  onNavigateToTransfer: () => void;
  onNavigateToHistory: () => void;
}

export default function Dashboard({
  user,
  accounts,
  activeAccount,
  onSelectAccount,
  onRefreshAccounts,
  onNavigateToTransfer,
  onNavigateToHistory,
}: DashboardProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMessage, setDepositMessage] = useState({ text: '', type: '' });

  // Fetch recent transactions for active account
  const fetchRecentTransactions = async () => {
    if (!activeAccount) return;
    setLoadingTx(true);
    try {
      const response = await axios.get(`${API_CONFIG.TRANSACTION_SERVICE}/api/transactions/${activeAccount.id}`);
      // Take only first 5 recent transactions
      setRecentTransactions(response.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchRecentTransactions();
  }, [activeAccount]);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount || !depositAmount || Number(depositAmount) <= 0) {
      setDepositMessage({ text: 'Please enter a valid deposit amount', type: 'error' });
      return;
    }

    setDepositLoading(true);
    setDepositMessage({ text: '', type: '' });

    try {
      await axios.post(`${API_CONFIG.TRANSACTION_SERVICE}/api/transactions/deposit`, {
        accountId: activeAccount.id,
        amount: Number(depositAmount),
      });
      setDepositMessage({ text: `Successfully deposited $${Number(depositAmount).toFixed(2)}`, type: 'success' });
      setDepositAmount('');
      // Trigger update of state in parent
      onRefreshAccounts();
    } catch (err: any) {
      setDepositMessage({ text: err.response?.data?.message || 'Deposit failed.', type: 'error' });
    } finally {
      setDepositLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Safe check if any accounts exist
  if (accounts.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-2xl border border-[#E9ECEF]">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-sans font-medium text-gray-900 mb-2">No accounts available</h3>
        <p className="text-sm text-gray-500 mb-6">Create a bank account first to get started.</p>
        <button
          onClick={onRefreshAccounts}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div id="dashboard-wrapper" className="space-y-8 animate-fade-in">
      
      {/* Header section with welcome statement */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium tracking-wider text-gray-400 uppercase">
            Customer Dashboard
          </span>
          <h1 className="text-3xl font-sans font-semibold text-gray-900 tracking-tight">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-sm text-gray-500">
            Here is your financial ledger and core banking overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onRefreshAccounts();
              fetchRecentTransactions();
            }}
            className="p-2 bg-white border border-[#E9ECEF] hover:bg-gray-50 rounded-lg text-gray-600 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Refresh Account Balances"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {/* Grid containing primary ledger cards & deposit tool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Account details & selector (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card detailing active account & selector */}
          <div className="bg-white rounded-2xl border border-[#E9ECEF] p-8 space-y-6">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">
                Active Banking Accounts
              </h2>
              <p className="text-xs text-gray-400">Select an account card to view specific logs</p>
            </div>

            {/* Quick selectors styled as credit cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => {
                const isSelected = activeAccount?.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => onSelectAccount(acc)}
                    className={`p-6 rounded-2xl cursor-pointer transition relative overflow-hidden flex flex-col justify-between h-40 ${
                      isSelected
                        ? 'bg-zinc-950 text-white shadow-sm'
                        : 'bg-[#F8F9FB] border border-[#E9ECEF] text-gray-800 hover:bg-gray-100/60'
                    }`}
                  >
                    {/* Visual pattern ornament */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 bg-white"></div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-md ${
                          isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {acc.accountType}
                        </span>
                        <div className={`text-xs font-mono mt-3 ${isSelected ? 'text-zinc-400' : 'text-gray-500'}`}>
                          {acc.accountNumber}
                        </div>
                      </div>
                      <CreditCard className={`w-5 h-5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>

                    <div className="space-y-0.5 z-10">
                      <div className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-zinc-400' : 'text-gray-500'}`}>
                        Available Balance
                      </div>
                      <div className="text-2xl font-bold tracking-tight">
                        {formatCurrency(acc.balance)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats overview panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-gray-500">Inbound Funds</div>
                <div className="text-base font-semibold text-gray-900">100% Secure</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-gray-500">Outbound Limits</div>
                <div className="text-base font-semibold text-gray-900">No Cap Limit</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-gray-500">Account Tier</div>
                <div className="text-base font-semibold text-gray-900">Premier Gold</div>
              </div>
            </div>
          </div>

          {/* LEDGER RECENT HISTORY SECTION */}
          <div className="bg-white rounded-2xl border border-[#E9ECEF] p-8 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">
                  Recent Ledger Transactions
                </h2>
                <p className="text-xs text-gray-400">Showing last 5 active logs</p>
              </div>
              <button
                onClick={onNavigateToHistory}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full History</span>
              </button>
            </div>

            {loadingTx ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading dynamic transactions ledger...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#E9ECEF] rounded-2xl text-xs text-gray-400">
                No ledger logs found on this account. Run a deposit or transfer to activate.
              </div>
            ) : (
              <div className="divide-y divide-[#E9ECEF]">
                {recentTransactions.map((tx) => {
                  const isIncoming = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN';
                  const isFailed = tx.status === 'FAILED';
                  return (
                    <div key={tx.id} className="py-4 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          isFailed 
                            ? 'bg-rose-50 text-rose-600'
                            : isIncoming 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-amber-50 text-amber-600'
                        }`}>
                          {isFailed ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : isIncoming ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-950">
                            {tx.description || (isIncoming ? 'Inbound Funds' : 'Wire Transfer')}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {formatDate(tx.createdDate)} • ID: {tx.id.split('-')[0]}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-bold ${
                          isFailed 
                            ? 'text-rose-500 line-through'
                            : isIncoming 
                              ? 'text-emerald-600' 
                              : 'text-gray-900'
                        }`}>
                          {isIncoming ? '+' : '-'}{formatCurrency(tx.amount)}
                        </div>
                        <div className={`text-[9px] font-semibold rounded px-1.5 py-0.25 inline-block ${
                          tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Deposit panel & Quick wire links (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* DEPOSIT ENGINE FORM */}
          <div className="bg-white rounded-2xl border border-[#E9ECEF] p-8 space-y-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">
                Deposit Sandbox Funds
              </h2>
              <p className="text-xs text-gray-400">Directly mock an incoming payroll or check deposit</p>
            </div>

            {depositMessage.text && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-1.5 ${
                depositMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {depositMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{depositMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Selected Credit Target</label>
                <div className="p-3 bg-[#F8F9FB] border border-[#E9ECEF] rounded-xl text-xs font-semibold flex justify-between">
                  <span className="text-gray-700">{activeAccount?.accountType} Account</span>
                  <span className="font-mono text-gray-500">{activeAccount?.accountNumber}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Deposit Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="100000"
                    placeholder="250.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={depositLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{depositLoading ? 'Depositing...' : 'Execute Cash Deposit'}</span>
              </button>
            </form>
          </div>

          {/* QUICK TRANSFERS BOX */}
          <div className="bg-white rounded-2xl border border-[#E9ECEF] p-8 space-y-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">
                Wire Transfer Portal
              </h2>
              <p className="text-xs text-gray-400">Transfer funds to other accounts instantly</p>
            </div>

            <div className="p-4 bg-[#F8F9FB] rounded-xl space-y-3">
              <div className="text-xs text-gray-500 leading-relaxed">
                Wire funds safely within the sandbox to other accounts using their unique bank numbers.
              </div>
              <button
                onClick={onNavigateToTransfer}
                className="w-full py-2.5 bg-zinc-950 hover:bg-black text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Initiate Wire Transfer</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
