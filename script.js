// DOM Elements
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInputs = document.querySelectorAll('input[name="type"]');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const clearAllBtn = document.getElementById('clear-all');
const transactionList = document.getElementById('transaction-list');
const totalBalanceElement = document.getElementById('total-balance');
const totalIncomeElement = document.getElementById('total-income');
const totalExpenseElement = document.getElementById('total-expense');
const transactionCountElement = document.getElementById('transaction-count');
const lastWeekTotalElement = document.getElementById('last-week-total');
const filterTypeSelect = document.getElementById('filter-type');
const filterCategorySelect = document.getElementById('filter-category');

// Error message elements
const descriptionError = document.getElementById('description-error');
const amountError = document.getElementById('amount-error');

// State
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initialize the app
function init() {
  // Set default date to today
  dateInput.valueAsDate = new Date();

  // Load transactions from localStorage
  updateUI();

  // Add event listeners
  transactionForm.addEventListener('submit', handleFormSubmit);
  clearAllBtn.addEventListener('click', handleClearAll);
  filterTypeSelect.addEventListener('change', updateUI);
  filterCategorySelect.addEventListener('change', updateUI);

  // Real-time validation
  descriptionInput.addEventListener('input', validateDescription);
  amountInput.addEventListener('input', validateAmount);
}

// Form validation functions
function validateDescription() {
  const description = descriptionInput.value.trim();

  if (description.length === 0) {
    descriptionError.textContent = 'Description is required';
    return false;
  } else if (description.length < 3) {
    descriptionError.textContent = 'Description must be at least 3 characters';
    return false;
  } else {
    descriptionError.textContent = '';
    return true;
  }
}

function validateAmount() {
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    amountError.textContent = 'Amount must be a positive number';
    return false;
  } else {
    amountError.textContent = '';
    return true;
  }
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  // Validate form
  const isDescriptionValid = validateDescription();
  const isAmountValid = validateAmount();

  if (!isDescriptionValid || !isAmountValid) {
    return;
  }

  // Get form values
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = document.querySelector('input[name="type"]:checked').value;
  const category = categorySelect.value;
  const date = dateInput.value;

  // Create transaction object
  const transaction = {
    id: Date.now(),
    description,
    amount,
    type,
    category,
    date,
  };

  // Add to transactions array
  transactions.push(transaction);

  // Save to localStorage
  saveTransactions();

  // Update UI
  updateUI();

  // Reset form
  transactionForm.reset();
  dateInput.valueAsDate = new Date();
  descriptionError.textContent = '';
  amountError.textContent = '';
}

// Handle clear all transactions
function handleClearAll() {
  if (transactions.length === 0) {
    return;
  }

  if (confirm('Are you sure you want to delete all transactions?')) {
    transactions = [];
    saveTransactions();
    updateUI();
  }
}

// Delete a single transaction
function deleteTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  saveTransactions();
  updateUI();
}

// Save transactions to localStorage
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Calculate totals
function calculateTotals() {
  let totalIncome = 0;
  let totalExpense = 0;

  // Filter transactions based on selected filters
  const filteredTransactions = getFilteredTransactions();

  filteredTransactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  const totalBalance = totalIncome - totalExpense;

  return {
    totalBalance: totalBalance.toFixed(2),
    totalIncome: totalIncome.toFixed(2),
    totalExpense: totalExpense.toFixed(2),
  };
}

// Get transactions from the last 7 days
function getLastWeekTotal() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const lastWeekTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= oneWeekAgo;
  });

  const total = lastWeekTransactions.reduce((sum, transaction) => {
    if (transaction.type === 'income') {
      return sum + transaction.amount;
    } else {
      return sum - transaction.amount;
    }
  }, 0);

  return total.toFixed(2);
}

// Get filtered transactions based on filter selections
function getFilteredTransactions() {
  let filtered = [...transactions];

  // Filter by type
  const typeFilter = filterTypeSelect.value;
  if (typeFilter !== 'all') {
    filtered = filtered.filter(transaction => transaction.type === typeFilter);
  }

  // Filter by category
  const categoryFilter = filterCategorySelect.value;
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(
      transaction => transaction.category === categoryFilter,
    );
  }

  return filtered;
}

// Update the transaction list in UI
function updateTransactionList() {
  // Get filtered transactions
  const filteredTransactions = getFilteredTransactions();

  // Clear the transaction list
  transactionList.innerHTML = '';

  if (filteredTransactions.length === 0) {
    // Show empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
            <i class="fas fa-receipt"></i>
            <p>No transactions found. Try changing your filters.</p>
        `;
    transactionList.appendChild(emptyState);
    return;
  }

  // Sort transactions by date (newest first)
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Create transaction items
  filteredTransactions.forEach(transaction => {
    const transactionItem = document.createElement('div');
    transactionItem.className = `transaction-item ${transaction.type}`;

    // Format date for display
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Format category for display
    const categoryMap = {
      salary: 'Salary',
      freelance: 'Freelance',
      investment: 'Investment',
      food: 'Food & Dining',
      shopping: 'Shopping',
      transport: 'Transportation',
      entertainment: 'Entertainment',
      bills: 'Bills & Utilities',
      other: 'Other',
    };

    const formattedCategory =
      categoryMap[transaction.category] || transaction.category;

    transactionItem.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-meta">
                    <span class="transaction-date">${formattedDate}</span>
                    <span class="transaction-category">${formattedCategory}</span>
                </div>
            </div>
            <div class="transaction-amount">$${transaction.amount.toFixed(2)}</div>
            <button class="delete-btn" data-id="${transaction.id}">
                <i class="fas fa-times"></i>
            </button>
        `;

    transactionList.appendChild(transactionItem);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', e => {
      const id = parseInt(e.currentTarget.getAttribute('data-id'));
      deleteTransaction(id);
    });
  });
}

// Update the entire UI
function updateUI() {
  // Calculate and update totals
  const totals = calculateTotals();
  totalBalanceElement.textContent = `$${totals.totalBalance}`;
  totalIncomeElement.textContent = `$${totals.totalIncome}`;
  totalExpenseElement.textContent = `$${totals.totalExpense}`;

  // Update transaction count
  transactionCountElement.textContent = transactions.length;

  // Update last week total
  lastWeekTotalElement.textContent = `$${getLastWeekTotal()}`;

  // Update transaction list
  updateTransactionList();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
