// IBD Drug Cost Calculator - Main Application
document.addEventListener('DOMContentLoaded', function () {
    // State management
    const state = {
        diseaseType: 'UC',
        weight: 60,
        paymentRatio: 0.2,
        upperLimit: 10000,
        selectedDrugs: new Set(),
        currentPeriod: 'monthly'
    };

    // Chart instances
    let costChart = null;
    let comparisonChart = null;

    // DOM Elements
    const elements = {
        diseaseUC: document.getElementById('disease-uc'),
        diseaseCD: document.getElementById('disease-cd'),
        weight: document.getElementById('weight'),
        paymentRatio: document.getElementById('payment-ratio'),
        upperLimit: document.getElementById('upper-limit'),
        drugCategories: document.getElementById('drug-categories'),
        resultsSection: document.getElementById('results-section'),
        resultsGrid: document.getElementById('results-grid'),
        timelineSection: document.getElementById('timeline-section'),
        timelineSummary: document.getElementById('timeline-summary'),
        comparisonSection: document.getElementById('comparison-section'),
        comparisonTableBody: document.getElementById('comparison-table-body'),
        // Floating panel elements
        floatingPanel: document.getElementById('floating-panel'),
        floatingToggle: document.getElementById('floating-toggle'),
        floatingOpen: document.getElementById('floating-open'),
        floatingDrugCount: document.getElementById('floating-drug-count'),
        floatingMonthlyTotal: document.getElementById('floating-monthly-total'),
        floatingMonthlySelf: document.getElementById('floating-monthly-self'),
        floatingYearlySelf: document.getElementById('floating-yearly-self'),
        floating5YearSelf: document.getElementById('floating-5year-self'),
        floatingPaymentInfo: document.getElementById('floating-payment-info')
    };

    // Initialize the application
    function init() {
        renderDrugCategories();
        setupEventListeners();
        updateResults();
    }

    // Render drug categories
    function renderDrugCategories() {
        const container = elements.drugCategories;
        container.innerHTML = '';

        DRUG_DATABASE.categories.forEach((category, index) => {
            const filteredDrugs = category.drugs.filter(drug =>
                drug.indication.includes(state.diseaseType)
            );

            if (filteredDrugs.length === 0) return;

            const categoryEl = document.createElement('div');
            categoryEl.className = `drug-category ${category.cssClass}`;
            categoryEl.innerHTML = `
                <div class="category-header" data-category="${category.id}">
                    <div class="category-info">
                        <div class="category-icon">${category.icon}</div>
                        <span class="category-name">${category.name}</span>
                        <span class="category-count">${filteredDrugs.length}剤</span>
                    </div>
                    <svg class="category-toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="category-drugs" id="category-drugs-${category.id}">
                    <div class="drug-grid">
                        ${filteredDrugs.map(drug => renderDrugCard(drug)).join('')}
                    </div>
                </div>
            `;
            container.appendChild(categoryEl);

            // Auto-expand first category
            if (index === 0) {
                setTimeout(() => {
                    const header = categoryEl.querySelector('.category-header');
                    toggleCategory(header);
                }, 100);
            }
        });
    }

    // Render individual drug card
    function renderDrugCard(drug) {
        const isSelected = state.selectedDrugs.has(drug.id);
        const priceInfo = calculateDrugPriceInfo(drug);

        return `
            <div class="drug-card ${isSelected ? 'selected' : ''}" data-drug-id="${drug.id}">
                <div class="drug-card-header">
                    <div>
                        <div class="drug-name">${drug.brandName}</div>
                        <div class="drug-generic">${drug.genericName}</div>
                    </div>
                    <div class="drug-checkbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>
                <div class="drug-indication">
                    ${drug.indication.includes('UC') ? '<span class="indication-badge uc">UC</span>' : ''}
                    ${drug.indication.includes('CD') ? '<span class="indication-badge cd">CD</span>' : ''}
                </div>
                <div class="drug-price-info">
                    ${priceInfo.formulation} | ${priceInfo.dosing}
                    ${drug.pricing.note ? `<br><small>※${drug.pricing.note}</small>` : ''}
                </div>
            </div>
        `;
    }

    // Calculate drug price info for display
    function calculateDrugPriceInfo(drug) {
        let dosing = '';

        if (drug.dosing.type === 'weight-based' && drug.dosing.standard.dosePerKg) {
            dosing = `${drug.dosing.standard.dosePerKg}mg/kg`;
        } else if (drug.dosing.standard.dose) {
            dosing = `${drug.dosing.standard.dose}${drug.dosing.standard.unit}`;
        }

        if (drug.dosing.standard.interval > 1) {
            dosing += ` / ${drug.dosing.standard.interval}日毎`;
        } else {
            dosing += ` ${drug.dosing.standard.frequency}`;
        }

        return {
            formulation: drug.pricing.formulation,
            dosing: dosing
        };
    }

    // Toggle category expansion
    function toggleCategory(header) {
        const categoryId = header.dataset.category;
        const drugsContainer = document.getElementById(`category-drugs-${categoryId}`);
        const toggle = header.querySelector('.category-toggle');

        drugsContainer.classList.toggle('show');
        toggle.classList.toggle('expanded');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Disease type change
        elements.diseaseUC.addEventListener('change', () => {
            state.diseaseType = 'UC';
            state.selectedDrugs.clear();
            renderDrugCategories();
            updateResults();
        });

        elements.diseaseCD.addEventListener('change', () => {
            state.diseaseType = 'CD';
            state.selectedDrugs.clear();
            renderDrugCategories();
            updateResults();
        });

        // Weight change
        elements.weight.addEventListener('input', (e) => {
            state.weight = parseFloat(e.target.value) || 60;
            updateResults();
        });

        // Payment ratio change
        elements.paymentRatio.addEventListener('change', (e) => {
            state.paymentRatio = parseFloat(e.target.value);
            updateResults();
        });

        // Upper limit change
        elements.upperLimit.addEventListener('change', (e) => {
            state.upperLimit = parseInt(e.target.value) || 0;
            updateResults();
        });

        // Category header click
        elements.drugCategories.addEventListener('click', (e) => {
            const header = e.target.closest('.category-header');
            if (header) {
                toggleCategory(header);
            }
        });

        // Drug card click
        elements.drugCategories.addEventListener('click', (e) => {
            const drugCard = e.target.closest('.drug-card');
            if (drugCard) {
                const drugId = drugCard.dataset.drugId;
                toggleDrugSelection(drugId);
                drugCard.classList.toggle('selected');
                updateResults();
            }
        });

        // Timeline period buttons
        document.querySelectorAll('.timeline-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.timeline-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentPeriod = btn.dataset.period;
                updateCharts();
            });
        });

        // Floating panel - Desktop: close button, Mobile: toggle collapse
        if (elements.floatingToggle) {
            elements.floatingToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.innerWidth <= 768) {
                    // Mobile: toggle collapsed state
                    elements.floatingPanel.classList.toggle('collapsed');
                } else {
                    // Desktop: hide panel completely  
                    elements.floatingPanel.classList.add('hidden');
                    if (elements.floatingOpen) {
                        elements.floatingOpen.classList.add('visible');
                    }
                }
            });
        }

        // Mobile: tap header to collapse/expand
        const floatingHeader = document.getElementById('floating-header');
        if (floatingHeader) {
            floatingHeader.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && e.target.closest('.floating-panel-toggle') === null) {
                    elements.floatingPanel.classList.toggle('collapsed');
                }
            });
        }

        if (elements.floatingOpen) {
            elements.floatingOpen.addEventListener('click', () => {
                elements.floatingPanel.classList.remove('hidden');
                elements.floatingOpen.classList.remove('visible');
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                elements.floatingPanel.classList.remove('collapsed');
            }
        });
    }

    // Toggle drug selection
    function toggleDrugSelection(drugId) {
        if (state.selectedDrugs.has(drugId)) {
            state.selectedDrugs.delete(drugId);
        } else {
            state.selectedDrugs.add(drugId);
        }
    }

    // Find drug by ID
    function findDrug(drugId) {
        for (const category of DRUG_DATABASE.categories) {
            const drug = category.drugs.find(d => d.id === drugId);
            if (drug) return { drug, category };
        }
        return null;
    }

    // Calculate monthly drug cost
    function calculateMonthlyCost(drug) {
        const pricing = drug.pricing;
        const dosing = drug.dosing;
        let costPerDose = 0;
        let dosesPerMonth = 0;

        // Calculate cost per dose
        if (dosing.type === 'weight-based' && pricing.mgPerUnit) {
            const dosePerKg = dosing.standard.dosePerKg || dosing.standard.maintenanceDose / state.weight;
            const totalDose = Math.min(
                dosePerKg * state.weight,
                dosing.standard.maxDose || Infinity
            );
            const unitsNeeded = Math.ceil(totalDose / pricing.mgPerUnit);
            costPerDose = unitsNeeded * pricing.unitPrice;
        } else if (pricing.unitsPerDose) {
            if (pricing.weightBased && pricing.dosePerKg) {
                // Weight-based oral drugs (like tacrolimus)
                const totalDailyDose = pricing.dosePerKg * state.weight * 2; // twice daily
                const unitsNeeded = Math.ceil(totalDailyDose / 1); // 1mg per capsule
                costPerDose = unitsNeeded * pricing.unitPrice;
            } else {
                costPerDose = pricing.unitsPerDose * pricing.unitPrice;
            }
        }

        // Calculate doses per month (30 days)
        const interval = dosing.standard.interval || 1;
        if (interval === 1) {
            dosesPerMonth = 30;
        } else {
            dosesPerMonth = 30 / interval;
        }

        return {
            costPerDose,
            dosesPerMonth,
            totalMonthlyCost: costPerDose * dosesPerMonth,
            interval,
            isInjection: pricing.isInjection || false
        };
    }

    // Calculate self payment with upper limit
    function calculateSelfPayment(totalCost, isMonthly = true) {
        let payment = totalCost * state.paymentRatio;

        if (state.upperLimit > 0 && isMonthly) {
            payment = Math.min(payment, state.upperLimit);
        }

        return payment;
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Update all results
    function updateResults() {
        // Always update floating panel (even when no drugs selected)
        updateFloatingPanel();

        if (state.selectedDrugs.size === 0) {
            showEmptyState();
            return;
        }

        showResults();
        updateResultsGrid();
        updateCharts();
        updateComparisonTable();
    }

    // Show empty state
    function showEmptyState() {
        elements.resultsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">💊</div>
                <p class="empty-state-text">上記のカテゴリから薬剤を選択してください</p>
            </div>
        `;
        elements.timelineSection.style.display = 'none';
        elements.comparisonSection.style.display = 'none';
    }

    // Show results
    function showResults() {
        elements.timelineSection.style.display = 'block';
        elements.comparisonSection.style.display = 'block';
    }

    // Update results grid
    function updateResultsGrid() {
        let totalMonthlyCost = 0;
        let totalYearlyCost = 0;
        const drugCount = state.selectedDrugs.size;

        state.selectedDrugs.forEach(drugId => {
            const result = findDrug(drugId);
            if (result) {
                const costs = calculateMonthlyCost(result.drug);
                totalMonthlyCost += costs.totalMonthlyCost;
            }
        });

        totalYearlyCost = totalMonthlyCost * 12;

        const monthlySelfPayment = calculateSelfPayment(totalMonthlyCost, true);
        const yearlySelfPayment = monthlySelfPayment * 12;

        elements.resultsGrid.innerHTML = `
            <div class="result-card">
                <div class="result-label">選択薬剤数</div>
                <div class="result-value">${drugCount}</div>
                <div class="result-unit">剤</div>
            </div>
            <div class="result-card">
                <div class="result-label">月額薬価（総額）</div>
                <div class="result-value">${formatCurrency(totalMonthlyCost)}</div>
                <div class="result-unit">保険適用前</div>
            </div>
            <div class="result-card">
                <div class="result-label">月額自己負担</div>
                <div class="result-value highlight">${formatCurrency(monthlySelfPayment)}</div>
                <div class="result-unit">${state.paymentRatio * 100}%負担${state.upperLimit > 0 ? '・上限適用' : ''}</div>
            </div>
            <div class="result-card">
                <div class="result-label">年間自己負担（予測）</div>
                <div class="result-value highlight">${formatCurrency(yearlySelfPayment)}</div>
                <div class="result-unit">12ヶ月分</div>
            </div>
        `;
    }

    // Update charts
    function updateCharts() {
        updateCostChart();
        updateComparisonChart();
        updateTimelineSummary();
    }

    // Update cost timeline chart
    function updateCostChart() {
        const ctx = document.getElementById('cost-chart').getContext('2d');

        if (costChart) {
            costChart.destroy();
        }

        let labels, datasets;

        if (state.currentPeriod === 'monthly') {
            labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
            datasets = generateMonthlyDatasets();
        } else {
            labels = ['1年目', '2年目', '3年目', '4年目', '5年目'];
            datasets = generateYearlyDatasets();
        }

        costChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#9ca3af',
                            font: {
                                family: "'Noto Sans JP', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(31, 41, 55, 0.9)',
                        titleColor: '#f9fafb',
                        bodyColor: '#d1d5db',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function (value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Generate monthly datasets
    function generateMonthlyDatasets() {
        const colors = [
            { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
            { border: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.2)' },
            { border: '#f43f5e', bg: 'rgba(244, 63, 94, 0.2)' },
            { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' },
            { border: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' }
        ];

        const datasets = [];
        let colorIndex = 0;

        state.selectedDrugs.forEach(drugId => {
            const result = findDrug(drugId);
            if (result) {
                const costs = calculateMonthlyCost(result.drug);
                const monthlyCost = calculateSelfPayment(costs.totalMonthlyCost, true);
                const data = Array(12).fill(monthlyCost);

                const color = colors[colorIndex % colors.length];
                datasets.push({
                    label: result.drug.brandName,
                    data,
                    borderColor: color.border,
                    backgroundColor: color.bg,
                    tension: 0.3,
                    fill: true
                });
                colorIndex++;
            }
        });

        // Add cumulative line
        const cumulativeData = [];
        let cumulative = 0;
        for (let i = 0; i < 12; i++) {
            let monthTotal = 0;
            state.selectedDrugs.forEach(drugId => {
                const result = findDrug(drugId);
                if (result) {
                    const costs = calculateMonthlyCost(result.drug);
                    monthTotal += calculateSelfPayment(costs.totalMonthlyCost, true);
                }
            });
            cumulative += monthTotal;
            cumulativeData.push(cumulative);
        }

        if (state.selectedDrugs.size > 1) {
            datasets.push({
                label: '累計自己負担',
                data: cumulativeData,
                borderColor: '#22c55e',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.3,
                fill: false,
                yAxisID: 'y'
            });
        }

        return datasets;
    }

    // Generate yearly datasets
    function generateYearlyDatasets() {
        const datasets = [];
        const cumulativeData = [];
        let yearlyTotal = 0;

        state.selectedDrugs.forEach(drugId => {
            const result = findDrug(drugId);
            if (result) {
                const costs = calculateMonthlyCost(result.drug);
                const monthlyPayment = calculateSelfPayment(costs.totalMonthlyCost, true);
                yearlyTotal += monthlyPayment * 12;
            }
        });

        for (let i = 0; i < 5; i++) {
            cumulativeData.push(yearlyTotal * (i + 1));
        }

        datasets.push({
            label: '累計自己負担額',
            data: cumulativeData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            tension: 0.3,
            fill: true
        });

        return datasets;
    }

    // Update comparison chart
    function updateComparisonChart() {
        const ctx = document.getElementById('comparison-chart').getContext('2d');

        if (comparisonChart) {
            comparisonChart.destroy();
        }

        const labels = [];
        const drugPrices = [];
        const selfPayments = [];

        state.selectedDrugs.forEach(drugId => {
            const result = findDrug(drugId);
            if (result) {
                const costs = calculateMonthlyCost(result.drug);
                labels.push(result.drug.brandName);
                drugPrices.push(costs.totalMonthlyCost);
                selfPayments.push(calculateSelfPayment(costs.totalMonthlyCost, true));
            }
        });

        comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: '月額薬価',
                        data: drugPrices,
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: '#3b82f6',
                        borderWidth: 1
                    },
                    {
                        label: '月額自己負担',
                        data: selfPayments,
                        backgroundColor: 'rgba(45, 212, 191, 0.6)',
                        borderColor: '#2dd4bf',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#9ca3af',
                            font: {
                                family: "'Noto Sans JP', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(31, 41, 55, 0.9)',
                        titleColor: '#f9fafb',
                        bodyColor: '#d1d5db',
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#6b7280',
                            callback: function (value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Update timeline summary
    function updateTimelineSummary() {
        let totalMonthlyCost = 0;

        state.selectedDrugs.forEach(drugId => {
            const result = findDrug(drugId);
            if (result) {
                const costs = calculateMonthlyCost(result.drug);
                totalMonthlyCost += costs.totalMonthlyCost;
            }
        });

        const monthlyPayment = calculateSelfPayment(totalMonthlyCost, true);
        const quarterlyPayment = monthlyPayment * 3;
        const yearlyPayment = monthlyPayment * 12;
        const fiveYearPayment = yearlyPayment * 5;

        elements.timelineSummary.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">月額</div>
                <div class="summary-value">${formatCurrency(monthlyPayment)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">四半期</div>
                <div class="summary-value">${formatCurrency(quarterlyPayment)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">年間</div>
                <div class="summary-value">${formatCurrency(yearlyPayment)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">5年間</div>
                <div class="summary-value">${formatCurrency(fiveYearPayment)}</div>
            </div>
        `;
    }

    // Update comparison table
    function updateComparisonTable() {
        const tbody = elements.comparisonTableBody;
        tbody.innerHTML = '';

        state.selectedDrugs.forEach(drugId => {
            const result = findDrug(drugId);
            if (result) {
                const costs = calculateMonthlyCost(result.drug);
                const monthlyPayment = calculateSelfPayment(costs.totalMonthlyCost, true);
                const yearlyPayment = monthlyPayment * 12;

                let intervalText = '';
                if (costs.interval === 1) {
                    intervalText = '毎日';
                } else if (costs.interval === 7) {
                    intervalText = '週1回';
                } else if (costs.interval === 14) {
                    intervalText = '2週毎';
                } else if (costs.interval === 28) {
                    intervalText = '4週毎';
                } else if (costs.interval === 56) {
                    intervalText = '8週毎';
                } else if (costs.interval === 84) {
                    intervalText = '12週毎';
                } else {
                    intervalText = `${costs.interval}日毎`;
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="drug-name-cell">
                        ${result.drug.brandName}
                        <br><small style="color: var(--gray-500)">${result.drug.genericName}</small>
                    </td>
                    <td>${intervalText}</td>
                    <td class="price-cell">${formatCurrency(costs.totalMonthlyCost)}</td>
                    <td class="price-cell">${formatCurrency(monthlyPayment)}</td>
                    <td class="price-cell">${formatCurrency(yearlyPayment)}</td>
                `;
                tbody.appendChild(row);
            }
        });
    }

    // Update floating panel with current calculations
    function updateFloatingPanel() {
        let totalMonthlyCost = 0;
        const drugCount = state.selectedDrugs.size;

        state.selectedDrugs.forEach(drugId => {
            const result = findDrug(drugId);
            if (result) {
                const costs = calculateMonthlyCost(result.drug);
                totalMonthlyCost += costs.totalMonthlyCost;
            }
        });

        const monthlySelfPayment = calculateSelfPayment(totalMonthlyCost, true);
        const yearlySelfPayment = monthlySelfPayment * 12;
        const fiveYearSelfPayment = yearlySelfPayment * 5;

        // Update floating panel values
        if (elements.floatingDrugCount) {
            elements.floatingDrugCount.textContent = `${drugCount} 剤`;
        }
        if (elements.floatingMonthlyTotal) {
            elements.floatingMonthlyTotal.textContent = formatCurrency(totalMonthlyCost);
        }
        if (elements.floatingMonthlySelf) {
            elements.floatingMonthlySelf.textContent = formatCurrency(monthlySelfPayment);
        }
        if (elements.floatingYearlySelf) {
            elements.floatingYearlySelf.textContent = formatCurrency(yearlySelfPayment);
        }
        if (elements.floating5YearSelf) {
            elements.floating5YearSelf.textContent = formatCurrency(fiveYearSelfPayment);
        }

        // Update payment info
        if (elements.floatingPaymentInfo) {
            const ratioText = `${Math.round(state.paymentRatio * 100)}割`;
            const limitText = state.upperLimit > 0 ? ` 上限${formatCurrency(state.upperLimit)}` : '';
            elements.floatingPaymentInfo.textContent = ratioText + limitText;
        }

        // Add/remove selection animation
        if (elements.floatingPanel) {
            if (drugCount > 0) {
                elements.floatingPanel.classList.add('has-selection');
            } else {
                elements.floatingPanel.classList.remove('has-selection');
            }
        }
    }

    // Initialize
    init();
});
