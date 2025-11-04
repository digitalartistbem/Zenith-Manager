
// FIX: Import `useEffect` from React to resolve `Cannot find name 'useEffect'` errors.
import React, { useState, useMemo, useEffect } from 'react';
// FIX: Add .tsx extension to import to resolve module error.
import { useAppData } from '../hooks/useAppData.tsx';
// FIX: Add .ts extension to import to resolve module error.
import { Transaction, TransactionType, Account, AccountIcon, IncomeCategory, ExpenseCategory } from '../types.ts';
// FIX: Add .tsx extension to import to resolve module error.
import { PlusIcon, TrashIcon, BankIcon, CashIcon, WalletIcon } from './Icons.tsx';

const AccountIcons: Record<AccountIcon, React.ReactNode> = {
    bank: <BankIcon className="w-6 h-6" />,
    cash: <CashIcon className="w-6 h-6" />,
    wallet: <WalletIcon className="w-6 h-6" />,
};

const AccountManager: React.FC = () => {
    const { data, addAccount, deleteAccount } = useAppData();
    const [name, setName] = useState('');
    const [initialBalance, setInitialBalance] = useState('');
    const [icon, setIcon] = useState<AccountIcon>('wallet');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && initialBalance) {
            addAccount({ name, icon, initialBalance: parseFloat(initialBalance) });
            setName('');
            setInitialBalance('');
        }
    };

    return (
        <div className="bg-surface p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Manage Accounts</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
                <input type="text" placeholder="Account Name" value={name} onChange={e => setName(e.target.value)} required className="bg-background border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"/>
                <input type="number" placeholder="Initial Balance" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} required className="bg-background border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"/>
                <select value={icon} onChange={e => setIcon(e.target.value as AccountIcon)} className="bg-background border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="wallet">Wallet</option>
                    <option value="bank">Bank</option>
                    <option value="cash">Cash</option>
                </select>
                <button type="submit" className="flex justify-center items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-pink-500 transition-colors font-semibold">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add
                </button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.accounts.map(acc => (
                     <div key={acc.id} className="bg-background p-4 rounded-lg flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <span className="text-primary">{AccountIcons[acc.icon]}</span>
                            <span className="font-semibold">{acc.name}</span>
                        </div>
                        <button onClick={() => deleteAccount(acc.id)} className="text-text-secondary hover:text-secondary"><TrashIcon className="w-5 h-5"/></button>
                     </div>
                ))}
            </div>
        </div>
    );
};

const TransactionForm: React.FC = () => {
    const { data, addTransaction } = useAppData();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>('expense');
    const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>('personal');
    const [accountId, setAccountId] = useState<string>('');

    useEffect(() => {
        if(data.accounts.length > 0 && !accountId) {
            setAccountId(data.accounts[0].id);
        }
    }, [data.accounts, accountId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description && amount && accountId) {
            addTransaction({
                description,
                amount: parseFloat(amount),
                type,
                category,
                accountId,
                date: new Date().toISOString()
            });
            setDescription('');
            setAmount('');
            setType('expense');
            setCategory('personal');
        } else if (!accountId && data.accounts.length > 0) {
            alert('Please select an account.');
        } else if (data.accounts.length === 0) {
            alert('Please create an account first.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl space-y-4">
            <h3 className="text-xl font-bold">Add Transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="bg-background border border-gray-600 rounded-md px-3 py-2"/>
                <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required className="bg-background border border-gray-600 rounded-md px-3 py-2"/>
                <select value={type} onChange={e => { setType(e.target.value as TransactionType); setCategory(e.target.value === 'income' ? 'salary' : 'personal');}} className="bg-background border border-gray-600 rounded-md px-3 py-2">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                <select value={category} onChange={e => setCategory(e.target.value as any)} className="bg-background border border-gray-600 rounded-md px-3 py-2">
                    {type === 'income' ? <>
                        <option value="salary">Salary</option>
                        <option value="business">Business Income</option>
                        <option value="gifts">Gifts</option>
                    </> : <>
                        <option value="personal">Personal</option>
                        <option value="bills">Bills</option>
                        <option value="business">Business</option>
                    </>}
                </select>
                <select value={accountId} onChange={e => setAccountId(e.target.value)} required className="bg-background border border-gray-600 rounded-md px-3 py-2">
                    <option value="" disabled>Select Account</option>
                    {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
            </div>
             <button type="submit" className="w-full flex justify-center items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-pink-500 transition-colors font-semibold">
                <PlusIcon className="w-5 h-5 mr-2" /> Add
            </button>
        </form>
    );
};

export const Budget: React.FC = () => {
    const { data } = useAppData();
    const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
    
    useEffect(() => {
        if(data.accounts.length > 0 && selectedAccountId === 'all') {
            // No default selection, user can see all
        }
    }, [data.accounts, selectedAccountId]);


    const { balance, totalIncome, totalExpenses } = useMemo(() => {
        const account = data.accounts.find(a => a.id === selectedAccountId);
        const transactions = selectedAccountId === 'all' 
            ? data.transactions 
            : data.transactions.filter(t => t.accountId === selectedAccountId);
        
        const initial = selectedAccountId === 'all'
            ? data.accounts.reduce((sum, acc) => sum + acc.initialBalance, 0)
            : account?.initialBalance || 0;
            
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        return { balance: initial + income - expenses, totalIncome: income, totalExpenses: expenses };

    }, [data, selectedAccountId]);
    
    const transactionsToShow = (selectedAccountId === 'all' 
            ? data.transactions 
            : data.transactions.filter(t => t.accountId === selectedAccountId))
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">Budget Manager</h1>
            <AccountManager />
            <TransactionForm />
            
            <div className="bg-surface rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Account Overview</h3>
                     <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="bg-background border border-gray-600 rounded-md px-3 py-2">
                        <option value="all">All Accounts</option>
                        {data.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-background rounded-xl p-6 text-center">
                        <h4 className="text-lg text-green-400 font-semibold">Income</h4>
                        <p className="text-3xl font-bold">₱{totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="bg-background rounded-xl p-6 text-center">
                        <h4 className="text-lg text-red-400 font-semibold">Expenses</h4>
                        <p className="text-3xl font-bold">₱{totalExpenses.toFixed(2)}</p>
                    </div>
                    <div className="bg-background rounded-xl p-6 text-center">
                        <h4 className={`text-lg font-semibold ${balance >= 0 ? 'text-blue-400' : 'text-yellow-400'}`}>Current Balance</h4>
                        <p className="text-3xl font-bold">₱{balance.toFixed(2)}</p>
                    </div>
                </div>

                 <h3 className="text-xl font-bold mb-4">Transaction History</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-600">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Category</th>
                                <th className="p-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionsToShow.map(t => (
                                <tr key={t.id} className="border-b border-gray-700">
                                    <td className="p-3 text-text-secondary">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="p-3">{t.description}</td>
                                    <td className="p-3 capitalize">{t.category}</td>
                                    <td className={`p-3 text-right font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                        {t.type === 'income' ? '+' : '-'}₱{t.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                 {transactionsToShow.length === 0 && <p className="text-center text-text-secondary py-8">No transactions for this account.</p>}
            </div>
        </div>
    );
};