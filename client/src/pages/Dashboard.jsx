import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [upiMessage, setUpiMessage] = useState("");
    const [showGraph, setShowGraph] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            navigate("/");
        } else {
            setUser(storedUser);
            const phoneNumber = storedUser.phone || storedUser.phoneNumber || storedUser.mobile;
            if (phoneNumber) {
                fetchExpenses(phoneNumber);
            } else {
                console.error("No phone number found in user object:", storedUser);
                alert("Error: Phone number not found. Please login again.");
            }
        }
    }, [navigate]);

    const fetchExpenses = async (phoneNumber) => {
        try {
            
            const res = await axios.get(`https://expense-tracker-back-ac9z.onrender.com/api/expenses/${phoneNumber}`);
            setExpenses(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching expenses:", err);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleMagicPaste = async () => {
        if (!upiMessage.trim()) return alert("Paste a valid message!");

        const userPhone = user.phone || user.phoneNumber || user.mobile;
        
        if (!userPhone) {
            alert("Error: Phone number not found. Please login again.");
            console.error("User object:", user);
            return;
        }

        try {
            const isCredited = /credited by/i.test(upiMessage);
            const isDebited = /debited by/i.test(upiMessage);

            if (!isCredited && !isDebited) {
                return alert("Could not parse the message. Make sure it's a UPI transaction message.");
            }

            let amount, sender, transactionType;

            if (isCredited) {
                const creditRegex = /credited by Rs\.?\s*([\d,.]+)\s*from\s*([^\s.]+@[a-z]+)/i;
                const match = upiMessage.match(creditRegex);
                
                if (!match) {
                    return alert("Could not parse credit transaction. Check message format.");
                }
                
                amount = parseFloat(match[1].replace(/,/g, ''));
                sender = match[2];
                transactionType = "Credit";
            } else {
                const debitRegex = /debited by Rs\.?\s*([\d,.]+)\s*towards\s*([^\s.]+@[a-z]+)/i;
                const match = upiMessage.match(debitRegex);
                
                if (!match) {
                    return alert("Could not parse debit transaction. Check message format.");
                }
                
                amount = parseFloat(match[1].replace(/,/g, ''));
                sender = match[2];
                transactionType = "Debit";
            }

            console.log("Parsed:", { amount, sender, transactionType });

            if (isNaN(amount) || amount <= 0) {
                return alert("Invalid amount detected!");
            }

            const title = isCredited 
                ? `💰 Received from ${sender}` 
                : `💸 Paid to ${sender}`;
            
            const category = transactionType;
            const date = new Date();

            const payload = {
                title,
                amount,
                category,
                date,
                userPhone: userPhone
            };

            console.log("Sending payload:", payload);

            
            const res = await axios.post("https://expense-tracker-back-ac9z.onrender.com/api/expenses", payload);

            setExpenses([res.data, ...expenses]);
            setUpiMessage("");
            
            setShowGraph(true);
            setTimeout(() => setShowGraph(false), 5000);
            
            alert(`${transactionType} transaction added successfully!`);
        } catch (err) {
            console.error("Error parsing/pasting expense:", err);
            console.error("Error response:", err.response?.data);
            alert(`Failed to add transaction: ${err.response?.data?.message || err.message}`);
        }
    };

    
    const getMonthlyData = () => {
        const monthlyStats = {};
        
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            
            if (!monthlyStats[monthYear]) {
                monthlyStats[monthYear] = { credits: 0, debits: 0, total: 0 };
            }
            
            if (expense.category === "Credit") {
                monthlyStats[monthYear].credits += expense.amount;
            } else {
                monthlyStats[monthYear].debits += expense.amount;
            }
            monthlyStats[monthYear].total = monthlyStats[monthYear].credits - monthlyStats[monthYear].debits;
        });
        
        return Object.entries(monthlyStats)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .slice(-6); // Last 6 months
    };

    const monthlyData = getMonthlyData();
    const maxAmount = Math.max(...monthlyData.map(([_, data]) => 
        Math.max(data.credits, data.debits)
    ), 100);

    return (
        <div className="container mt-5 pt-5">
            <Navbar />
            <h1>Welcome, {user?.name}!</h1>
            <p className="text-muted">Phone: {user?.phone || user?.phoneNumber || user?.mobile}</p>

            <div className="mt-4 mb-5">
                <h4>Magic Paste 🪄</h4>
                <p>Paste your UPI transaction message below and it will be added automatically.</p>
                <textarea
                    className="form-control"
                    rows="3"
                    value={upiMessage}
                    onChange={(e) => setUpiMessage(e.target.value)}
                    placeholder="Paste UPI credit or debit message here..."
                ></textarea>
                <button
                    className="btn btn-success mt-2"
                    onClick={handleMagicPaste}
                >
                    Add Transaction
                </button>
            </div>

            {/* Monthly Graph */}
            {showGraph && monthlyData.length > 0 && (
                <div 
                    className="card mb-4" 
                    style={{ 
                        animation: 'fadeIn 0.5s ease-in',
                        transition: 'opacity 0.5s ease-out'
                    }}
                >
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Monthly Overview</h5>
                        <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setShowGraph(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '250px', gap: '10px' }}>
                            {monthlyData.map(([month, data]) => (
                                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end', height: '200px' }}>
                                        {/* Credit Bar */}
                                        <div
                                            style={{
                                                width: '30px',
                                                height: `${(data.credits / maxAmount) * 100}%`,
                                                backgroundColor: '#28a745',
                                                borderRadius: '5px 5px 0 0',
                                                position: 'relative',
                                                animation: 'growUp 0.8s ease-out',
                                                minHeight: data.credits > 0 ? '10px' : '0'
                                            }}
                                            title={`Credit: ₹${data.credits}`}
                                        >
                                            {data.credits > 0 && (
                                                <span style={{ 
                                                    position: 'absolute', 
                                                    top: '-20px', 
                                                    left: '50%', 
                                                    transform: 'translateX(-50%)',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    color: '#28a745'
                                                }}>
                                                    ₹{data.credits.toFixed(0)}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div
                                            style={{
                                                width: '30px',
                                                height: `${(data.debits / maxAmount) * 100}%`,
                                                backgroundColor: '#dc3545',
                                                borderRadius: '5px 5px 0 0',
                                                position: 'relative',
                                                animation: 'growUp 0.8s ease-out 0.2s backwards',
                                                minHeight: data.debits > 0 ? '10px' : '0'
                                            }}
                                            title={`Debit: ₹${data.debits}`}
                                        >
                                            {data.debits > 0 && (
                                                <span style={{ 
                                                    position: 'absolute', 
                                                    top: '-20px', 
                                                    left: '50%', 
                                                    transform: 'translateX(-50%)',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    color: '#dc3545'
                                                }}>
                                                    ₹{data.debits.toFixed(0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div style={{ 
                                        marginTop: '10px', 
                                        fontSize: '12px', 
                                        textAlign: 'center',
                                        fontWeight: '500'
                                    }}>
                                        {month}
                                    </div>
                                    <div style={{ 
                                        fontSize: '11px', 
                                        color: data.total >= 0 ? '#28a745' : '#dc3545',
                                        fontWeight: 'bold'
                                    }}>
                                        {data.total >= 0 ? '+' : ''}₹{data.total.toFixed(0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 d-flex justify-content-center gap-4">
                            <div><span style={{ color: '#28a745', fontWeight: 'bold' }}>●</span> Credits</div>
                            <div><span style={{ color: '#dc3545', fontWeight: 'bold' }}>●</span> Debits</div>
                        </div>
                    </div>
                </div>
            )}

            {!showGraph && monthlyData.length > 0 && (
                <div className="mb-4">
                    <button 
                        className="btn btn-outline-primary"
                        onClick={() => setShowGraph(true)}
                    >
                        Show Monthly Graph
                    </button>
                </div>
            )}

            <div className="mt-5">
                <h3>Your Transactions</h3>
                <table className="table table-striped mt-3">
                    <thead className="table-dark">
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                        ) : expenses.length > 0 ? (
                            expenses.map((expense) => {
                                const isCredit = expense.category === "Credit";
                                return (
                                    <tr key={expense._id}>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>{expense.title}</td>
                                        <td>
                                            <span className={`badge ${isCredit ? 'bg-success' : 'bg-danger'}`}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className={`fw-bold ${isCredit ? 'text-success' : 'text-danger'}`}>
                                            {isCredit ? '+' : '-'}₹{expense.amount}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-muted">No transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4" style={{ paddingBottom: '60px' }}>
                <button
                    className="btn btn-danger"
                    onClick={handleLogout}
                    style={{ backgroundColor: 'red' }}
                >
                    Logout
                </button>
            </div>

            <style>{`
                @keyframes growUp {
                    from {
                        height: 0;
                    }
                    to {
                        height: var(--final-height);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;