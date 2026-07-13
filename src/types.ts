export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number;
  accountType: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  createdDate: string;
  description?: string;
}

export type ViewType = 'DASHBOARD' | 'TRANSFER' | 'HISTORY';
