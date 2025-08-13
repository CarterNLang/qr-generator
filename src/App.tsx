import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReceiptDoc from "./ReceiptDoc";

type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
}

interface SavingsGoal {
  targetAmount: number;
  targetDate: string;
}

const STORAGE_KEY = "budgetTrackerData";
const SAVINGS_KEY = "budgetTrackerSavings";

export default function BudgetTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [];
  });

  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal>(() => {
    const savedSavings = localStorage.getItem(SAVINGS_KEY);
    return savedSavings
      ? JSON.parse(savedSavings)
      : { targetAmount: 0, targetDate: "" };
  });

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("income");
  const [filter, setFilter] = useState<TransactionType | "all">("all");
  const [newTargetAmount, setNewTargetAmount] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("");

  // Calculate balance, income, and expense based on current transactions
  const balance = transactions.reduce(
    (total, t) => (t.type === "income" ? total + t.amount : total - t.amount),
    0
  );

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate savings progress
  const savingsProgress =
    savingsGoal.targetAmount > 0
      ? Math.min((balance / savingsGoal.targetAmount) * 100, 100)
      : 0;

  // Calculate days remaining
  const daysRemaining = savingsGoal.targetDate
    ? Math.ceil(
        (new Date(savingsGoal.targetDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // Save to localStorage whenever transactions or savings goal changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    localStorage.setItem(SAVINGS_KEY, JSON.stringify(savingsGoal));
  }, [transactions, savingsGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim()) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: +amount,
      type,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
    setDescription("");
    setAmount("");
  };

  const handleSetSavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetAmount || !newTargetDate) return;

    setSavingsGoal({
      targetAmount: +newTargetAmount,
      targetDate: newTargetDate,
    });
    setNewTargetAmount("");
    setNewTargetDate("");
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL transactions? This cannot be undone."
      )
    ) {
      setTransactions([]);
    }
  };

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  return (
    <div className="budget-tracker">
      <h1>Budget Tracker</h1>

      <div className="balance">
        <h2>Your Balance</h2>
        <p className={balance >= 0 ? "positive" : "negative"}>
          ${Math.abs(balance).toFixed(2)}
        </p>

        <div className="summary">
          <div>
            <h3>Income</h3>
            <p className="positive">${income.toFixed(2)}</p>
          </div>
          <div>
            <h3>Expenses</h3>
            <p className="negative">${expense.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Savings Goal Section */}
      <div className="savings-goal">
        <h2>Savings Goal</h2>
        {savingsGoal.targetAmount > 0 && savingsGoal.targetDate ? (
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${savingsProgress}%` }}
              role="progressbar"
              aria-valuenow={savingsProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
            <p>
              ${balance.toFixed(2)} of ${savingsGoal.targetAmount.toFixed(2)}{" "}
              saved ({savingsProgress.toFixed(0)}%)
            </p>
            <p>
              Target date:{" "}
              {new Date(savingsGoal.targetDate).toLocaleDateString()}(
              {daysRemaining > 0
                ? `${daysRemaining} days remaining`
                : "Target date reached"}
              )
            </p>
            {balance >= savingsGoal.targetAmount && (
              <p className="positive">
                Congratulations! You've reached your savings goal!
              </p>
            )}
          </div>
        ) : (
          <p>No savings goal set</p>
        )}

        <form onSubmit={handleSetSavingsGoal} className="savings-form">
          <div className="form-group">
            <label htmlFor="targetAmount">Target Amount</label>
            <input
              type="number"
              id="targetAmount"
              value={newTargetAmount}
              onChange={(e) => setNewTargetAmount(e.target.value)}
              placeholder="Enter target amount..."
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="targetDate">Target Date</label>
            <input
              type="date"
              id="targetDate"
              value={newTargetDate}
              onChange={(e) => setNewTargetDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <button type="submit">
            {savingsGoal.targetAmount > 0 ? "Update Goal" : "Set Goal"}
          </button>
        </form>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        <h2>Add Transaction</h2>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="form-group radio-group">
          <label>
            <input
              type="radio"
              name="type"
              checked={type === "income"}
              onChange={() => setType("income")}
            />
            Income
          </label>
          <label>
            <input
              type="radio"
              name="type"
              checked={type === "expense"}
              onChange={() => setType("expense")}
            />
            Expense
          </label>
        </div>

        <button type="submit">Add Transaction</button>
      </form>

      <div className="transactions">
        <div className="filter-controls">
          <h2>Transactions</h2>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as TransactionType | "all")
              }
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>

            <PDFDownloadLink
              document={<ReceiptDoc transactions={transactions} />}
              fileName="receipt.pdf"
            >
              {({ loading }) => (
                <button type="button" disabled={loading}>
                  {loading ? "Preparing…" : "Print Receipt"}
                </button>
              )}
            </PDFDownloadLink>

            <button onClick={handleClearAll} className="clear-btn">
              Clear All
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <ul>
            {filteredTransactions.map((t) => (
              <li key={t.id} className={t.type}>
                <div>
                  <h3>{t.description}</h3>
                  <p>{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className={t.type}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </p>
                  <button onClick={() => handleDelete(t.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
