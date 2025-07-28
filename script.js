let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Elements
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');
const categoryEl = document.getElementById('category');
const addBtn = document.getElementById('add-btn');
const updateBtn = document.getElementById('update-btn');
const cancelBtn = document.getElementById('cancel-btn');
const transactionIdEl = document.getElementById('transaction-id');

const filterMonthEl = document.getElementById('filter-month');
const filterCategoryEl = document.getElementById('filter-category');
const filterBtn = document.getElementById('filter-btn');

const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const balanceEl = document.getElementById('balance');
const transactionListEl = document.getElementById('transaction-list');

const expenseChartEl = document.getElementById('expenseChart');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const bodyEl = document.getElementById('body');
let expenseChart;

// Add Transaction
addBtn.addEventListener('click', () => {
  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const type = typeEl.value;
  const category = categoryEl.value;

  if (!description || isNaN(amount)) {
    alert('Please enter valid description and amount!');
    return;
  }

  const transaction = {
    id: Date.now(),
    description,
    amount,
    type,
    category,
    date: new Date().toISOString().slice(0, 10)
  };

  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  clearForm();
  renderAll();
});

// Filter
filterBtn.addEventListener('click', () => renderAll());

// Delete Transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderAll();
}

// Start Edit
function startEditTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  transactionIdEl.value = transaction.id;
  descriptionEl.value = transaction.description;
  amountEl.value = transaction.amount;
  typeEl.value = transaction.type;
  categoryEl.value = transaction.category;

  addBtn.classList.add('d-none');
  updateBtn.classList.remove('d-none');
  cancelBtn.classList.remove('d-none');
}

// Update Transaction
updateBtn.addEventListener('click', () => {
  const id = parseInt(transactionIdEl.value);
  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const type = typeEl.value;
  const category = categoryEl.value;

  if (!description || isNaN(amount)) {
    alert('Please enter valid description and amount!');
    return;
  }

  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index].description = description;
    transactions[index].amount = amount;
    transactions[index].type = type;
    transactions[index].category = category;
  }

  localStorage.setItem('transactions', JSON.stringify(transactions));
  clearForm();
  renderAll();
});

// Cancel Edit
cancelBtn.addEventListener('click', () => clearForm());

// Clear Form
function clearForm() {
  descriptionEl.value = '';
  amountEl.value = '';
  transactionIdEl.value = '';
  addBtn.classList.remove('d-none');
  updateBtn.classList.add('d-none');
  cancelBtn.classList.add('d-none');
}

// Render Transactions
function renderTransactions() {
  const monthFilter = filterMonthEl.value;
  const categoryFilter = filterCategoryEl.value;

  transactionListEl.innerHTML = '';

  const filtered = transactions.filter(t => {
    const matchMonth = monthFilter ? t.date.startsWith(monthFilter) : true;
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchMonth && matchCategory;
  });

  filtered.forEach(t => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', t.type, 'd-flex', 'justify-content-between', 'align-items-center');
    li.innerHTML = `
      <div>
        <strong>${t.description}</strong> - ₹${t.amount} <small>[${t.category}]</small> 
        <small class="text-muted">(${t.date})</small>
      </div>
      <div>
        <button class="btn btn-sm btn-primary edit-btn" onclick="startEditTransaction(${t.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${t.id})">Delete</button>
      </div>
    `;
    transactionListEl.appendChild(li);
  });
}

// Render Summary
function renderSummary() {
  const monthFilter = filterMonthEl.value;
  let income = 0, expense = 0;

  transactions.forEach(t => {
    const matchMonth = monthFilter ? t.date.startsWith(monthFilter) : true;
    if (matchMonth) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
  });

  totalIncomeEl.textContent = income;
  totalExpenseEl.textContent = expense;
  balanceEl.textContent = income - expense;
}

// Render Chart
function renderChart() {
  const categoryTotals = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0']
    }]
  };

  if (expenseChart) expenseChart.destroy();
  expenseChart = new Chart(expenseChartEl, { type: 'pie', data: data });
}

// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
  bodyEl.classList.toggle('dark-mode');
  const isDark = bodyEl.classList.contains('dark-mode');
  darkModeToggle.textContent = isDark ? '☀ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('darkMode', isDark);
});

// Load Dark Mode Preference
(function initDarkMode() {
  const isDark = JSON.parse(localStorage.getItem('darkMode'));
  if (isDark) {
    bodyEl.classList.add('dark-mode');
    darkModeToggle.textContent = '☀ Light Mode';
  }
})();

// Render All
function renderAll() {
  renderTransactions();
  renderSummary();
  renderChart();
}

// Initial Render
renderAll();
