/**
 * Spendly - Modern Personal Finance & Expense Tracker
 * Pure Vanilla JavaScript (ES6) - No external libraries or frameworks
 */

(function () {
  'use strict';

  // LocalStorage Key
  const STORAGE_KEY = 'spendly_transactions';
  const LEGACY_STORAGE_KEY = 'expenseflow_transactions';

  // Category Emoji Mapping
  const CATEGORY_ICONS = {
    Food: '🍔',
    Transport: '🚌',
    Education: '📚',
    Shopping: '🛍️',
    Bills: '💡',
    Entertainment: '🎬',
    Health: '🩺',
    Salary: '💼',
    Other: '📌'
  };

  // Seed sample transactions representing typical college student finances
  // Total Income: ₹20,000 | Total Expenses: ₹7,500 | Balance: ₹12,500
  const DEFAULT_TRANSACTIONS = [
    {
      id: 'tx-1',
      name: 'Monthly Allowance from Parents',
      amount: 15000,
      type: 'Income',
      category: 'Salary',
      date: '2026-09-01',
      createdAt: 1725148800000
    },
    {
      id: 'tx-2',
      name: 'Freelance Tutoring Gig',
      amount: 5000,
      type: 'Income',
      category: 'Salary',
      date: '2026-09-05',
      createdAt: 1725494400000
    },
    {
      id: 'tx-3',
      name: 'Semester Reference Books & Lab Manuals',
      amount: 2200,
      type: 'Expense',
      category: 'Education',
      date: '2026-09-06',
      createdAt: 1725580800000
    },
    {
      id: 'tx-4',
      name: 'College Canteen & Campus Snacks',
      amount: 1450,
      type: 'Expense',
      category: 'Food',
      date: '2026-09-08',
      createdAt: 1725753600000
    },
    {
      id: 'tx-5',
      name: 'Monthly Student Metro & Bus Pass',
      amount: 850,
      type: 'Expense',
      category: 'Transport',
      date: '2026-09-10',
      createdAt: 1725926400000
    },
    {
      id: 'tx-6',
      name: 'Campus Hostel Wi-Fi & Mobile Recharge',
      amount: 600,
      type: 'Expense',
      category: 'Bills',
      date: '2026-09-12',
      createdAt: 1726099200000
    },
    {
      id: 'tx-7',
      name: 'Weekend Movie with College Friends',
      amount: 500,
      type: 'Expense',
      category: 'Entertainment',
      date: '2026-09-14',
      createdAt: 1726272000000
    },
    {
      id: 'tx-8',
      name: 'College Stationery & Notebooks',
      amount: 400,
      type: 'Expense',
      category: 'Education',
      date: '2026-09-15',
      createdAt: 1726358400000
    },
    {
      id: 'tx-9',
      name: 'Pharmacy & Cold Medicine',
      amount: 300,
      type: 'Expense',
      category: 'Health',
      date: '2026-09-16',
      createdAt: 1726444800000
    },
    {
      id: 'tx-10',
      name: 'Campus T-shirt & Backpack Repair',
      amount: 800,
      type: 'Expense',
      category: 'Shopping',
      date: '2026-09-17',
      createdAt: 1726531200000
    },
    {
      id: 'tx-11',
      name: 'Late Night Study Tea & Snacks',
      amount: 400,
      type: 'Expense',
      category: 'Food',
      date: '2026-09-18',
      createdAt: 1726617600000
    }
  ];

  // State
  let transactions = [];
  let deletePendingId = null;

  // DOM Elements
  const totalBalanceEl = document.getElementById('totalBalance');
  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const totalTransactionsEl = document.getElementById('totalTransactions');
  const balanceStatusEl = document.getElementById('balanceStatus');
  const incomeCountEl = document.getElementById('incomeCount');
  const expenseRatioEl = document.getElementById('expenseRatio');
  const greetingTextEl = document.getElementById('greetingText');
  const currentDateEl = document.getElementById('currentDate');

  const transactionForm = document.getElementById('transactionForm');
  const editTransactionIdInput = document.getElementById('editTransactionId');
  const transactionNameInput = document.getElementById('transactionName');
  const transactionAmountInput = document.getElementById('transactionAmount');
  const transactionCategorySelect = document.getElementById('transactionCategory');
  const transactionDateInput = document.getElementById('transactionDate');
  const formTitleEl = document.getElementById('formTitle');
  const editIndicatorEl = document.getElementById('editIndicator');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  const nameError = document.getElementById('nameError');
  const amountError = document.getElementById('amountError');
  const categoryError = document.getElementById('categoryError');
  const dateError = document.getElementById('dateError');

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const typeFilter = document.getElementById('typeFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const filterStatusBar = document.getElementById('filterStatusBar');
  const filterSummaryText = document.getElementById('filterSummaryText');
  const clearAllFiltersLink = document.getElementById('clearAllFiltersLink');

  const transactionTable = document.getElementById('transactionTable');
  const transactionListBody = document.getElementById('transactionListBody');
  const emptyState = document.getElementById('emptyState');
  const emptyStateTitle = document.getElementById('emptyStateTitle');
  const emptyStateMessage = document.getElementById('emptyStateMessage');
  const categoryBreakdownContainer = document.getElementById('categoryBreakdownContainer');

  const deleteModal = document.getElementById('deleteModal');
  const deletePreviewInfo = document.getElementById('deletePreviewInfo');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const toastNotification = document.getElementById('toastNotification');

  /**
   * Currency Formatter for Indian Rupee format
   * Formats numbers into ₹12,500 standard format
   */
  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    const formatted = Math.abs(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(num) ? 0 : 2
    });
    return (num < 0 ? '-₹' : '₹') + formatted;
  }

  /**
   * Format human readable date
   */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Get Today's Date in YYYY-MM-DD
   */
  function getTodayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Show Toast Notification
   */
  let toastTimer = null;
  function showToast(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  /**
   * Initialize Date and Greeting
   */
  function initHeaderDate() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    if (currentDateEl) {
      currentDateEl.textContent = now.toLocaleDateString('en-IN', options);
    }
    
    const hour = now.getHours();
    let greeting = 'Welcome, Student!';
    if (hour < 12) greeting = 'Good Morning, Student!';
    else if (hour < 17) greeting = 'Good Afternoon, Student!';
    else greeting = 'Good Evening, Student!';
    if (greetingTextEl) greetingTextEl.textContent = greeting;
  }

  /**
   * Load Transactions from LocalStorage
   */
  function loadTransactions() {
    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      // Migrate from legacy key if user previously had data
      if (saved === null) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy !== null) {
          saved = legacy;
          try {
            localStorage.setItem(STORAGE_KEY, legacy);
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          } catch (err) {
            // Ignore migration cleanup error
          }
        }
      }

      if (saved !== null) {
        transactions = JSON.parse(saved);
        if (!Array.isArray(transactions)) {
          transactions = [];
        }
      } else {
        // Seed default transactions for a rich initial experience
        transactions = [...DEFAULT_TRANSACTIONS];
        saveTransactions();
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using in-memory state.', e);
      transactions = [...DEFAULT_TRANSACTIONS];
    }
  }

  /**
   * Save Transactions to LocalStorage
   */
  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  /**
   * 1 & 6. Calculate Balance and Update Dashboard
   * Balance = Total Income - Total Expenses
   */
  function updateDashboard() {
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Income') {
        totalIncome += amt;
        incomeCount++;
      } else if (t.type === 'Expense') {
        totalExpenses += amt;
        expenseCount++;
      }
    });

    const balance = totalIncome - totalExpenses;
    const totalCount = transactions.length;

    // Update DOM
    if (totalBalanceEl) {
      totalBalanceEl.textContent = formatCurrency(balance);
      totalBalanceEl.style.color = balance >= 0 ? '#065f46' : '#991b1b';
    }

    if (balanceStatusEl) {
      if (balance > 0) {
        balanceStatusEl.textContent = '🎉 Healthy campus savings';
      } else if (balance === 0) {
        balanceStatusEl.textContent = 'Balanced budget (Income = Expenses)';
      } else {
        balanceStatusEl.textContent = '⚠️ Spending exceeds income';
      }
    }

    if (totalIncomeEl) {
      totalIncomeEl.textContent = formatCurrency(totalIncome);
    }
    if (incomeCountEl) {
      incomeCountEl.textContent = `${incomeCount} income source${incomeCount === 1 ? '' : 's'}`;
    }

    if (totalExpensesEl) {
      totalExpensesEl.textContent = formatCurrency(totalExpenses);
    }
    if (expenseRatioEl) {
      if (totalIncome > 0) {
        const pct = Math.round((totalExpenses / totalIncome) * 100);
        expenseRatioEl.textContent = `${pct}% of allowance spent`;
      } else {
        expenseRatioEl.textContent = `${expenseCount} total expense${expenseCount === 1 ? '' : 's'}`;
      }
    }

    if (totalTransactionsEl) {
      totalTransactionsEl.textContent = totalCount.toString();
    }

    // Update Category Breakdown
    renderCategoryBreakdown(totalExpenses);
  }

  /**
   * Render Category Spending Breakdown
   */
  function renderCategoryBreakdown(totalExpenses) {
    if (!categoryBreakdownContainer) return;

    // Sum expenses by category
    const catTotals = {};
    transactions.forEach(t => {
      if (t.type === 'Expense') {
        const cat = t.category || 'Other';
        catTotals[cat] = (catTotals[cat] || 0) + Number(t.amount);
      }
    });

    const categories = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);

    if (categories.length === 0 || totalExpenses <= 0) {
      categoryBreakdownContainer.innerHTML = '<div class="no-cat-data">No expense data recorded yet</div>';
      return;
    }

    let html = '';
    categories.slice(0, 5).forEach(cat => {
      const amt = catTotals[cat];
      const pct = Math.min(100, Math.round((amt / totalExpenses) * 100));
      const icon = CATEGORY_ICONS[cat] || '📌';

      html += `
        <div class="cat-item">
          <div class="cat-header">
            <span class="cat-name"><span>${icon}</span> ${cat}</span>
            <span class="cat-amount">${formatCurrency(amt)} <span style="font-weight: normal; font-size: 0.75rem; color: #64748b;">(${pct}%)</span></span>
          </div>
          <div class="cat-progress-track">
            <div class="cat-progress-bar" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    });

    categoryBreakdownContainer.innerHTML = html;
  }

  /**
   * Get Selected Transaction Type from Radios
   */
  function getSelectedType() {
    const checked = document.querySelector('input[name="transactionType"]:checked');
    return checked ? checked.value : 'Expense';
  }

  /**
   * Set Selected Transaction Type in Radios
   */
  function setSelectedType(type) {
    const target = type === 'Income' ? 'Income' : 'Expense';
    const radios = document.querySelectorAll('input[name="transactionType"]');
    radios.forEach(radio => {
      if (radio.value === target) {
        radio.checked = true;
      }
    });

    // Update label styles
    document.querySelectorAll('.type-option').forEach(label => {
      const radio = label.querySelector('input[type="radio"]');
      if (radio && radio.checked) {
        label.classList.add('selected');
      } else {
        label.classList.remove('selected');
      }
    });
  }

  /**
   * Reset Form & Validation Errors
   */
  function resetForm() {
    transactionForm.reset();
    editTransactionIdInput.value = '';
    transactionDateInput.value = getTodayString();
    setSelectedType('Expense');

    // Reset UI headers
    formTitleEl.textContent = 'Add Transaction';
    submitBtnText.textContent = 'Add Transaction';
    editIndicatorEl.style.display = 'none';
    cancelEditBtn.style.display = 'none';

    // Clear error states
    clearErrors();
  }

  function clearErrors() {
    [transactionNameInput, transactionAmountInput, transactionCategorySelect, transactionDateInput].forEach(el => {
      if (el) el.classList.remove('is-invalid');
    });
    [nameError, amountError, categoryError, dateError].forEach(el => {
      if (el) el.classList.remove('visible');
    });
  }

  /**
   * Validate Form Inputs
   */
  function validateForm() {
    let isValid = true;
    clearErrors();

    const nameVal = transactionNameInput.value.trim();
    if (!nameVal) {
      transactionNameInput.classList.add('is-invalid');
      nameError.classList.add('visible');
      isValid = false;
    }

    const amountVal = parseFloat(transactionAmountInput.value);
    if (isNaN(amountVal) || amountVal <= 0) {
      transactionAmountInput.classList.add('is-invalid');
      amountError.classList.add('visible');
      isValid = false;
    }

    const categoryVal = transactionCategorySelect.value;
    if (!categoryVal) {
      transactionCategorySelect.classList.add('is-invalid');
      categoryError.classList.add('visible');
      isValid = false;
    }

    const dateVal = transactionDateInput.value;
    if (!dateVal) {
      transactionDateInput.classList.add('is-invalid');
      dateError.classList.add('visible');
      isValid = false;
    }

    return isValid;
  }

  /**
   * 2 & 4. Handle Form Submit: Add or Edit Transaction
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const name = transactionNameInput.value.trim();
    const amount = parseFloat(transactionAmountInput.value);
    const type = getSelectedType();
    const category = transactionCategorySelect.value;
    const date = transactionDateInput.value;
    const editId = editTransactionIdInput.value;

    if (editId) {
      // 4. EDIT TRANSACTION: Update existing without duplicating
      const index = transactions.findIndex(t => t.id === editId);
      if (index !== -1) {
        transactions[index] = {
          ...transactions[index],
          name,
          amount,
          type,
          category,
          date
        };
        showToast(`Transaction "${name}" updated successfully!`);
      }
    } else {
      // 2. ADD TRANSACTION: Create new
      const newTransaction = {
        id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name,
        amount,
        type,
        category,
        date,
        createdAt: Date.now()
      };
      transactions.unshift(newTransaction);
      showToast(`Added: ${name} (${formatCurrency(amount)})`);
    }

    saveTransactions();
    updateDashboard();
    renderTransactions();
    resetForm();
  }

  /**
   * 4. Start Editing a Transaction
   */
  function startEditTransaction(id) {
    const item = transactions.find(t => t.id === id);
    if (!item) return;

    editTransactionIdInput.value = item.id;
    transactionNameInput.value = item.name;
    transactionAmountInput.value = item.amount;
    setSelectedType(item.type);
    transactionCategorySelect.value = item.category;
    transactionDateInput.value = item.date;

    formTitleEl.textContent = 'Edit Transaction';
    submitBtnText.textContent = 'Save Changes';
    editIndicatorEl.style.display = 'inline-block';
    cancelEditBtn.style.display = 'inline-flex';

    clearErrors();

    // Smooth scroll to form on mobile or small viewports
    const formCard = document.getElementById('formCard');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    transactionNameInput.focus();
  }

  /**
   * 5. Prompt for Deletion
   */
  function openDeleteModal(id) {
    const item = transactions.find(t => t.id === id);
    if (!item) return;

    deletePendingId = id;
    if (deletePreviewInfo) {
      deletePreviewInfo.textContent = `${item.name} • ${formatCurrency(item.amount)} (${item.category})`;
    }
    if (deleteModal) {
      deleteModal.style.display = 'flex';
    }
  }

  function closeDeleteModal() {
    deletePendingId = null;
    if (deleteModal) {
      deleteModal.style.display = 'none';
    }
  }

  function confirmDelete() {
    if (!deletePendingId) return;

    const item = transactions.find(t => t.id === deletePendingId);
    const itemName = item ? item.name : 'Transaction';

    transactions = transactions.filter(t => t.id !== deletePendingId);
    saveTransactions();

    // If we were currently editing the deleted transaction, cancel edit
    if (editTransactionIdInput.value === deletePendingId) {
      resetForm();
    }

    closeDeleteModal();
    updateDashboard();
    renderTransactions();
    showToast(`Deleted "${itemName}"`);
  }

  /**
   * 3, 7 & 8. Filter, Search and Render Transaction List
   * Newest transactions first
   */
  function getFilteredTransactions() {
    const searchVal = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const typeVal = typeFilter ? typeFilter.value : 'All';
    const catVal = categoryFilter ? categoryFilter.value : 'All';

    return transactions.filter(t => {
      // Type Filter
      if (typeVal !== 'All' && t.type !== typeVal) {
        return false;
      }

      // Category Filter
      if (catVal !== 'All' && t.category !== catVal) {
        return false;
      }

      // 7. Search Filter (by name or category)
      if (searchVal) {
        const matchesName = (t.name || '').toLowerCase().includes(searchVal);
        const matchesCategory = (t.category || '').toLowerCase().includes(searchVal);
        if (!matchesName && !matchesCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Show newest first by date, then by creation time
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  /**
   * Render Transaction Table & Empty State
   */
  function renderTransactions() {
    const filtered = getFilteredTransactions();
    const totalCount = transactions.length;

    // Toggle search clear button
    const searchVal = (searchInput ? searchInput.value : '').trim();
    if (clearSearchBtn) {
      clearSearchBtn.style.display = searchVal ? 'block' : 'none';
    }

    // Filter status bar
    const typeVal = typeFilter ? typeFilter.value : 'All';
    const catVal = categoryFilter ? categoryFilter.value : 'All';
    const isFiltered = Boolean(searchVal || typeVal !== 'All' || catVal !== 'All');

    if (filterStatusBar) {
      if (isFiltered) {
        filterStatusBar.style.display = 'flex';
        let parts = [];
        if (searchVal) parts.push(`matching "${searchVal}"`);
        if (typeVal !== 'All') parts.push(`Type: ${typeVal}`);
        if (catVal !== 'All') parts.push(`Category: ${catVal}`);
        filterSummaryText.textContent = `Found ${filtered.length} transaction${filtered.length === 1 ? '' : 's'} (${parts.join(', ')})`;
      } else {
        filterStatusBar.style.display = 'none';
      }
    }

    // Empty state handling
    if (filtered.length === 0) {
      if (transactionTable) transactionTable.style.display = 'none';
      if (emptyState) {
        emptyState.style.display = 'block';
        if (totalCount === 0) {
          emptyStateTitle.textContent = 'No transactions yet';
          emptyStateMessage.textContent = 'No transactions yet. Add your first transaction!';
        } else {
          emptyStateTitle.textContent = 'No matching transactions';
          emptyStateMessage.textContent = 'No transactions match your current search and filter criteria.';
        }
      }
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (transactionTable) transactionTable.style.display = 'table';

    let html = '';
    filtered.forEach(item => {
      const isIncome = item.type === 'Income';
      const icon = CATEGORY_ICONS[item.category] || '📌';
      const typeClass = isIncome ? 'income' : 'expense';
      const typeSign = isIncome ? '+' : '-';
      const formattedAmt = `${typeSign}${formatCurrency(item.amount)}`;

      html += `
        <tr data-id="${item.id}">
          <td>
            <span class="transaction-title">${escapeHtml(item.name)}</span>
            <span class="transaction-subtitle">${icon} ${escapeHtml(item.category)} • ${formatDate(item.date)}</span>
          </td>
          <td>
            <span class="category-badge">
              <span>${icon}</span>
              <span>${escapeHtml(item.category)}</span>
            </span>
          </td>
          <td>${formatDate(item.date)}</td>
          <td>
            <span class="type-badge ${typeClass}">
              ${isIncome ? '📈 Income' : '📉 Expense'}
            </span>
          </td>
          <td class="text-right amount-cell ${typeClass}">
            ${formattedAmt}
          </td>
          <td class="text-center">
            <div class="action-btn-group">
              <button 
                type="button" 
                class="action-btn edit-btn" 
                data-action="edit" 
                data-id="${item.id}" 
                title="Edit Transaction"
                aria-label="Edit ${escapeHtml(item.name)}"
              >
                ✏️
              </button>
              <button 
                type="button" 
                class="action-btn delete-btn" 
                data-action="delete" 
                data-id="${item.id}" 
                title="Delete Transaction"
                aria-label="Delete ${escapeHtml(item.name)}"
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    transactionListBody.innerHTML = html;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Event Listeners Setup
   */
  function setupEvents() {
    // Radio toggle interaction
    document.querySelectorAll('.type-option').forEach(label => {
      label.addEventListener('click', () => {
        const radio = label.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          setSelectedType(radio.value);
        }
      });
    });

    // Form submission
    if (transactionForm) {
      transactionForm.addEventListener('submit', handleFormSubmit);
    }

    // Cancel edit
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', resetForm);
    }

    // Quick Add Chip buttons
    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        const name = chip.getAttribute('data-name');
        const amount = chip.getAttribute('data-amount');
        const type = chip.getAttribute('data-type');
        const cat = chip.getAttribute('data-cat');

        transactionNameInput.value = name || '';
        transactionAmountInput.value = amount || '';
        setSelectedType(type || 'Expense');
        transactionCategorySelect.value = cat || 'Food';
        transactionDateInput.value = getTodayString();
        clearErrors();

        const formCard = document.getElementById('formCard');
        if (formCard) {
          formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        transactionAmountInput.focus();
      });
    });

    // Table action buttons (Edit & Delete) via event delegation
    if (transactionListBody) {
      transactionListBody.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        if (action === 'edit') {
          startEditTransaction(id);
        } else if (action === 'delete') {
          openDeleteModal(id);
        }
      });
    }

    // Delete Modal controls
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }
    if (deleteModal) {
      deleteModal.addEventListener('click', e => {
        if (e.target === deleteModal) {
          closeDeleteModal();
        }
      });
    }

    // Keyboard ESC to close modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && deleteModal && deleteModal.style.display === 'flex') {
        closeDeleteModal();
      }
    });

    // 7. Search input (real-time as user types)
    if (searchInput) {
      searchInput.addEventListener('input', renderTransactions);
    }

    // Clear search
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderTransactions();
        searchInput.focus();
      });
    }

    // 8. Filters (Type & Category)
    if (typeFilter) {
      typeFilter.addEventListener('change', renderTransactions);
    }
    if (categoryFilter) {
      categoryFilter.addEventListener('change', renderTransactions);
    }

    // Reset Filters
    function resetAllFilters() {
      if (searchInput) searchInput.value = '';
      if (typeFilter) typeFilter.value = 'All';
      if (categoryFilter) categoryFilter.value = 'All';
      renderTransactions();
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', resetAllFilters);
    }
    if (clearAllFiltersLink) {
      clearAllFiltersLink.addEventListener('click', resetAllFilters);
    }

    // Realtime form error clearing as user fixes inputs
    [transactionNameInput, transactionAmountInput, transactionCategorySelect, transactionDateInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
        });
        input.addEventListener('change', () => {
          input.classList.remove('is-invalid');
        });
      }
    });
  }

  /**
   * App Initialization
   */
  function init() {
    initHeaderDate();
    if (transactionDateInput) {
      transactionDateInput.value = getTodayString();
    }
    loadTransactions();
    updateDashboard();
    renderTransactions();
    setupEvents();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
