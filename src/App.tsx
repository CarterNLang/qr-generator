import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
}

const STORAGE_KEY = "budgetTrackerData";

export default function BudgetTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Load from localStorage on initial render
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [];
  });

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("income");
  const [filter, setFilter] = useState<TransactionType | "all">("all");
  const pdfRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

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

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;

    try {
      const canvas = await html2canvas(pdfRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("budget-summary.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

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
          <div>
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
            <button onClick={handleExportPDF} className="export-btn">
              Export as PDF
            </button>
            <button onClick={handleClearAll} className="clear-btn">
              Clear All
            </button>
          </div>
        </div>

        {/* PDF Content (hidden from view but captured for PDF) */}
        <div ref={pdfRef} style={{ position: "absolute", left: "-9999px" }}>
          <h2>Budget Summary</h2>
          <p>Generated on: {new Date().toLocaleDateString()}</p>

          <div className="pdf-summary">
            <p>
              <strong>Total Balance:</strong>
              <span className={balance >= 0 ? "positive" : "negative"}>
                ${Math.abs(balance).toFixed(2)}
              </span>
            </p>
            <p>
              <strong>Total Income:</strong> ${income.toFixed(2)}
            </p>
            <p>
              <strong>Total Expenses:</strong> ${expense.toFixed(2)}
            </p>
          </div>

          <h3>Transaction History</h3>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.description}</td>
                  <td>{t.type}</td>
                  <td className={t.type}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visible transaction list */}
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
