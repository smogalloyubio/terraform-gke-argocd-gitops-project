import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownLeft, ArrowUpRight, Search, Filter, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { User, Account, Transaction } from '../types';

interface HistoryProps {
  user: User;
  accounts: Account[];
  activeAccount: Account | null;
}

export default function History({ user, accounts, activeAccount }: HistoryProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(activeAccount?.id || accounts[0]?.id || '');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtering & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTransactions = async () => {
    if (!selectedAccountId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/transactions/${selectedAccountId}`);
      setTransactions(response.data);
    } catch (err) {
      console.error('Error loading transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedAccountId]);

  // Apply filters and searches
  useEffect(() => {
    let result = [...transactions];

    // Filter by type
    if (typeFilter !== 'ALL') {
      result = result.filter(tx => tx.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter(tx => tx.status === statusFilter);
    }

    // Search term check
    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      result = result.filter(tx => 
        tx.id.toLowerCase().includes(lower) || 
        (tx.description && tx.description.toLowerCase().includes(lower)) ||
        tx.type.toLowerCase().includes(lower) ||
        tx.amount.toString().includes(lower)
      );
    }

    setFilteredTransactions(result);
  }, [transactions, typeFilter, statusFilter, searchTerm]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

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

  return (
    <div id="history-wrapper" className="space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium tracking-wider text-gray-400 uppercase">
            Ledger Audit
          </span>
          <h1 className="text-3xl font-sans font-semibold text-gray-900 tracking-tight">
            Transaction History Logs
          </h1>
          <p className="text-sm text-gray-500">
            View, filter, and audit every ledger entry made on your active banking accounts.
          </p>
        </div>
        
        {/* Account Selector for Ledger view */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Audit Target:</span>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E9ECEF] rounded-lg text-xs font-medium focus:outline-none"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.accountType} ({acc.accountNumber})
              </option>
            ))}
          </select>
          <button
            onClick={fetchTransactions}
            className="p-1.5 bg-white border border-[#E9ECEF] hover:bg-gray-50 rounded-lg text-gray-600 transition cursor-pointer"
            title="Refresh Ledger Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by amount, ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F9FB] border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Type Filter */}
        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-2 py-2 text-xs bg-[#F8F9FB] border border-[#E9ECEF] rounded-lg focus:outline-none"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="DEPOSIT">Direct Deposits</option>
            <option value="TRANSFER_OUT">Outbound Wires</option>
            <option value="TRANSFER_IN">Inbound Wires</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3 flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2 py-2 text-xs bg-[#F8F9FB] border border-[#E9ECEF] rounded-lg focus:outline-none"
          >
            <option value="ALL">All Settlement Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Counter Display */}
        <div className="md:col-span-1 text-right text-xs text-gray-400 font-semibold">
          {filteredTransactions.length} items
        </div>

      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E9ECEF] overflow-hidden">
        
        {loading ? (
          <div className="py-24 text-center text-xs text-gray-400">Loading ledger data logs...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-24 text-center text-gray-400 space-y-2">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold">No audit matches found</p>
            <p className="text-xs">Adjust your search parameters or filter constraints.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-[#E9ECEF] text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp / ID</th>
                  <th className="py-3.5 px-6">Transaction Type</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6 text-right">Amount (USD)</th>
                  <th className="py-3.5 px-6 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF]">
                {filteredTransactions.map((tx) => {
                  const isIncoming = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN';
                  const isFailed = tx.status === 'FAILED';
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/20 transition">
                      
                      {/* Timestamp / ID */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div>
                            <div className="text-gray-900 font-medium whitespace-nowrap">{formatDate(tx.createdDate)}</div>
                            <div className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {tx.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          isFailed 
                            ? 'bg-rose-50 text-rose-700'
                            : isIncoming 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-amber-50 text-amber-700'
                        }`}>
                          {isFailed ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          ) : isIncoming ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-amber-600" />
                          )}
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-6">
                        <div className="text-gray-800 max-w-xs truncate font-medium">
                          {tx.description || 'Automatic Core Transaction'}
                        </div>
                        {selectedAccount && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Account: {selectedAccount.accountNumber}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 text-right">
                        <div className={`font-mono font-bold text-sm ${
                          isFailed 
                            ? 'text-rose-500 line-through'
                            : isIncoming 
                              ? 'text-emerald-600' 
                              : 'text-gray-900'
                        }`}>
                          {isIncoming ? '+' : '-'}{formatCurrency(tx.amount)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
