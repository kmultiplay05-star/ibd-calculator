// IBD Drug Cost Calculator - Main Application
document.addEventListener('DOMContentLoaded', function () {
    // State management
    const state = {
        diseaseType: 'UC',
        treatmentPhase: 'maintenance', // 'induction' or 'maintenance'
        weight: 60,
        paymentRatio: 0.2,
        upperLimit: 10000,
        selectedDrugs: new Set(),
        drugAdjustments: new Map(), // 薬剤IDごとの調整オプション: { drugId: adjustmentId }
        currentPeriod: 'monthly'
    };

    // Chart instances
    let costChart = null;
    let comparisonChart = null;

    // DOM Elements
    const elements = {
        diseaseUC: document.getElementById('disease-uc'),
        diseaseCD: document.getElementById('disease-cd'),
        phaseInduction: document.getElementById('phase-induction'),
        phaseMaintenance: document.getElementById('phase-maintenance'),
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
        floatingPhase: document.getElementById('floating-phase'),
        floatingDrugCount: document.getElementById('floating-drug-count'),
        floatingMonthlyTotal: document.getElementById('floating-monthly-total'),
        floatingMonthlySelf: document.getElementById('floating-monthly-self'),
        floatingYearlySelf: document.getElementById('floating-yearly-self')
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
        const adjustmentOptions = getAdjustmentOptions(drug);
        const currentAdjustment = state.drugAdjustments.get(drug.id);

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
                ${adjustmentOptions.length > 0 ? `
                <div class="drug-adjustments">
                    <div class="adjustment-label">用量調整:</div>
                    <div class="adjustment-buttons">
                        <button class="adjustment-btn ${!currentAdjustment ? 'active' : ''}" 
                                data-drug-id="${drug.id}" 
                                data-adjustment-id="standard"
                                title="標準用量">
                            標準
                        </button>
                        ${adjustmentOptions.map(adj => `
                            <button class="adjustment-btn ${currentAdjustment === adj.id ? 'active' : ''}" 
                                    data-drug-id="${drug.id}" 
                                    data-adjustment-id="${adj.id}"
                                    title="${adj.description}">
                                ${adj.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Get adjustment options for a drug based on current disease type
    function getAdjustmentOptions(drug) {
        if (!drug.adjustments) return [];
        const options = drug.adjustments[state.diseaseType];
        return options || [];
    }

    // Calculate drug price info for display
    function calculateDrugPriceInfo(drug) {
        const phaseDosing = drug.dosing[state.treatmentPhase];

        // If no dosing for this phase
        if (!phaseDosing) {
            const phaseNote = state.treatmentPhase === 'induction' ? '維持期専用' : '導入期専用';
            return {
                formulation: drug.pricing.formulation,
                dosing: phaseNote,
                notAvailable: true
            };
        }

        let dosing = '';

        if (phaseDosing.dosePerKg) {
            dosing = `${phaseDosing.dosePerKg}mg/kg`;
        } else if (phaseDosing.dose) {
            dosing = `${phaseDosing.dose}${phaseDosing.unit}`;
        }

        if (phaseDosing.interval > 1) {
            dosing += ` / ${phaseDosing.interval}日毎`;
        } else if (phaseDosing.frequency) {
            dosing += ` ${phaseDosing.frequency}`;
        }

        return {
            formulation: drug.pricing.formulation,
            dosing: dosing,
            description: phaseDosing.description || '',
            notAvailable: false
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

        // Treatment phase: Induction
        if (elements.phaseInduction) {
            elements.phaseInduction.addEventListener('change', () => {
                state.treatmentPhase = 'induction';
                renderDrugCategories();
                updateResults();
            });
        }

        // Treatment phase: Maintenance
        if (elements.phaseMaintenance) {
            elements.phaseMaintenance.addEventListener('change', () => {
                state.treatmentPhase = 'maintenance';
                renderDrugCategories();
                updateResults();
            });
        }

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

        // Adjustment button click
        elements.drugCategories.addEventListener('click', (e) => {
            const adjustmentBtn = e.target.closest('.adjustment-btn');
            if (adjustmentBtn) {
                e.stopPropagation(); // 薬剤カードの選択をトリガーしない
                const drugId = adjustmentBtn.dataset.drugId;
                const adjustmentId = adjustmentBtn.dataset.adjustmentId;

                // Update adjustment state
                if (adjustmentId === 'standard') {
                    state.drugAdjustments.delete(drugId);
                } else {
                    state.drugAdjustments.set(drugId, adjustmentId);
                }

                // Update button styles
                const card = adjustmentBtn.closest('.drug-card');
                card.querySelectorAll('.adjustment-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                adjustmentBtn.classList.add('active');

                // Auto-select drug if not already selected
                if (!state.selectedDrugs.has(drugId)) {
                    state.selectedDrugs.add(drugId);
                    card.classList.add('selected');
                }

                updateResults();
                return;
            }
        });

        // Drug card click (excluding adjustment buttons)
        elements.drugCategories.addEventListener('click', (e) => {
            // Skip if clicking on adjustment buttons
            if (e.target.closest('.adjustment-btn')) return;

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

    // Calculate drug cost based on treatment phase (Excel formula compliant)
    // Induction: 8 weeks total cost (converted to monthly for display)
    // Maintenance: 52 weeks cost converted to monthly
    function calculateMonthlyCost(drug) {
        const pricing = drug.pricing;
        const dosingData = drug.dosing;
        const phaseDosing = dosingData[state.treatmentPhase];

        // If no dosing for this phase, return unavailable
        if (!phaseDosing) {
            return {
                costPerDose: 0,
                totalMonthlyCost: 0,
                totalPhaseCost: 0,
                isInjection: pricing.isInjection || false,
                hasAdjustment: false,
                adjustmentLabel: null,
                notAvailable: true,
                phaseNote: state.treatmentPhase === 'induction' ? '維持期専用' : '導入期専用'
            };
        }

        // Adjustments (maintenance only)
        const adjustmentId = state.drugAdjustments.get(drug.id);
        let adjustment = null;
        if (state.treatmentPhase === 'maintenance' && adjustmentId && drug.adjustments?.[state.diseaseType]) {
            adjustment = drug.adjustments[state.diseaseType].find(a => a.id === adjustmentId);
        }
        const priceMultiplier = adjustment?.priceMultiplier || 1;
        const doseMultiplier = adjustment?.multiplier || 1;
        const intervalMultiplier = adjustment?.intervalMultiplier || 1;

        let totalPhaseCost = 0;
        let costPerDose = 0;
        let unitsNeeded = 0;

        if (state.treatmentPhase === 'induction') {
            // ===== INDUCTION: 8 weeks total =====
            const days = 56;

            switch (drug.id) {
                case 'infliximab': {
                    // IFX: 0・2・6週 5mg/kg → 3回投与
                    const totalDose = 5 * state.weight;
                    const vialsPerDose = Math.ceil(totalDose / pricing.mgPerUnit);
                    unitsNeeded = vialsPerDose * 3;
                    totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    costPerDose = vialsPerDose * pricing.unitPrice;
                    break;
                }
                case 'adalimumab': {
                    // ADA: 0週160mg + 2週80mg + 4,6週40mg = 9本
                    unitsNeeded = phaseDosing.totalUnits || 9;
                    totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    costPerDose = pricing.unitPrice;
                    break;
                }
                case 'golimumab': {
                    // GOL: 0週200mg + 2週100mg + 6週100mg = 8本
                    unitsNeeded = phaseDosing.totalUnits || 8;
                    totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    costPerDose = 2 * pricing.unitPrice;
                    break;
                }
                case 'ustekinumab': {
                    // UST: 点滴(体重帯) + 8週後皮下90mg
                    let ivVials = state.weight <= 55 ? 2 : (state.weight > 85 ? 4 : 3);
                    const ivCost = ivVials * (pricing.ivUnitPrice || 184085);
                    const scCost = 2 * pricing.unitPrice; // 90mg = 45mg×2
                    totalPhaseCost = ivCost + scCost;
                    costPerDose = totalPhaseCost / 2;
                    break;
                }
                case 'risankizumab': {
                    // スキリージ: 0・4・8週 1200mg点滴 = 6瓶
                    unitsNeeded = phaseDosing.totalUnits || 6;
                    totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    costPerDose = 2 * pricing.unitPrice;
                    break;
                }
                case 'mirikizumab': {
                    // オンボー: 0・4・8週 300mg点滴 = 3瓶
                    unitsNeeded = phaseDosing.totalUnits || 3;
                    totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    costPerDose = pricing.unitPrice;
                    break;
                }
                case 'vedolizumab': {
                    // VDZ: 0・2・6週 300mg点滴 = 3瓶
                    unitsNeeded = phaseDosing.totalUnits || 3;
                    totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    costPerDose = pricing.unitPrice;
                    break;
                }
                case 'tofacitinib': {
                    // TOF: 10mg×2回/日 = 4錠/日 × 56日
                    const tabletsPerDay = phaseDosing.tabletsPerDay || 4;
                    unitsNeeded = tabletsPerDay * days;
                    totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    costPerDose = tabletsPerDay * pricing.unitPrice;
                    break;
                }
                case 'upadacitinib': {
                    // UPA: 45mg/日 × 56日
                    unitsNeeded = days;
                    totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    costPerDose = pricing.unitPrice;
                    break;
                }
                case 'filgotinib': {
                    // FIL: 200mg/日 × 56日
                    unitsNeeded = days;
                    totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    costPerDose = pricing.unitPrice;
                    break;
                }
                default: {
                    // Generic: daily oral or fixed interval
                    if (phaseDosing.interval && phaseDosing.interval > 1) {
                        const doses = Math.ceil(days / phaseDosing.interval);
                        if (pricing.mgPerUnit && phaseDosing.dose) {
                            unitsNeeded = Math.ceil(phaseDosing.dose / pricing.mgPerUnit) * doses;
                        } else {
                            unitsNeeded = doses;
                        }
                        totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    } else if (phaseDosing.dose && pricing.mgPerUnit) {
                        const unitsPerDay = Math.ceil(phaseDosing.dose / pricing.mgPerUnit);
                        unitsNeeded = unitsPerDay * days;
                        totalPhaseCost = unitsNeeded * pricing.unitPrice;
                    } else {
                        totalPhaseCost = pricing.unitPrice * days;
                    }
                    costPerDose = pricing.unitPrice;
                }
            }

            return {
                costPerDose,
                unitsNeeded,
                totalPhaseCost,
                totalMonthlyCost: totalPhaseCost / 2, // 8週≈2ヶ月
                isInjection: pricing.isInjection || false,
                hasAdjustment: false,
                adjustmentLabel: null,
                description: phaseDosing.description || '',
                notAvailable: false
            };

        } else {
            // ===== MAINTENANCE: 52 weeks =====
            const weeks = 52;
            const days = 364;
            let yearlyUnits = 0;

            if (phaseDosing.interval && phaseDosing.interval > 1) {
                // Injection: interval in days
                // Apply intervalMultiplier (e.g., 0.5 for weekly instead of biweekly)
                const adjustedInterval = phaseDosing.interval * intervalMultiplier;
                const intervalWeeks = adjustedInterval / 7;
                const doses = Math.floor(weeks / intervalWeeks);

                if (phaseDosing.dosePerKg) {
                    // Weight-based (IFX)
                    const vialsPerDose = Math.ceil(phaseDosing.dosePerKg * state.weight * doseMultiplier / pricing.mgPerUnit);
                    yearlyUnits = vialsPerDose * doses;
                    costPerDose = vialsPerDose * pricing.unitPrice * priceMultiplier;
                    totalPhaseCost = yearlyUnits * pricing.unitPrice * priceMultiplier;
                } else {
                    // Fixed dose - use SC pricing if available for maintenance
                    const unitPrice = pricing.scUnitPrice || pricing.unitPrice;
                    const mgPerUnit = pricing.scMgPerUnit || pricing.mgPerUnit || 1;
                    const unitsPerDose = Math.ceil(phaseDosing.dose * doseMultiplier / mgPerUnit);
                    yearlyUnits = unitsPerDose * doses;
                    costPerDose = unitsPerDose * unitPrice * priceMultiplier;
                    totalPhaseCost = yearlyUnits * unitPrice * priceMultiplier;
                }
            } else {
                // Daily oral
                const tabletsPerDay = phaseDosing.tabletsPerDay ||
                    (phaseDosing.dose && pricing.mgPerUnit ? Math.ceil(phaseDosing.dose / pricing.mgPerUnit) : 1);
                yearlyUnits = tabletsPerDay * days * doseMultiplier;

                // UPA maintenance uses 15mg or 30mg pricing
                if (drug.id === 'upadacitinib' && pricing.price15mg) {
                    costPerDose = pricing.price15mg * priceMultiplier;
                    totalPhaseCost = yearlyUnits * pricing.price15mg * priceMultiplier;
                } else {
                    costPerDose = tabletsPerDay * pricing.unitPrice * priceMultiplier;
                    totalPhaseCost = yearlyUnits * pricing.unitPrice * priceMultiplier;
                }
            }

            // Additional cost (rescue)
            let additionalCost = 0;
            if (adjustment?.additionalCostPerMonth) {
                additionalCost = adjustment.additionalCostPerMonth;
            }

            return {
                costPerDose,
                unitsNeeded: yearlyUnits,
                totalPhaseCost,
                totalMonthlyCost: (totalPhaseCost / 12) + (additionalCost / 12),
                interval: phaseDosing.interval || 1,
                isInjection: pricing.isInjection || false,
                hasAdjustment: !!adjustment,
                adjustmentLabel: adjustment?.label || null,
                description: phaseDosing.description || '',
                notAvailable: false
            };
        }
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
        let availableCount = 0;

        state.selectedDrugs.forEach(drugId => {
            const result = findDrug(drugId);
            if (result) {
                const costs = calculateMonthlyCost(result.drug);
                if (!costs.notAvailable) {
                    totalMonthlyCost += costs.totalMonthlyCost;
                    availableCount++;
                }
            }
        });

        const monthlySelfPayment = calculateSelfPayment(totalMonthlyCost, true);
        const yearlySelfPayment = monthlySelfPayment * 12;

        // Update phase badge
        if (elements.floatingPhase) {
            const phaseText = state.treatmentPhase === 'induction' ? '導入期' : '維持期';
            elements.floatingPhase.textContent = phaseText;
            elements.floatingPhase.className = `floating-phase-badge ${state.treatmentPhase}`;
        }

        // Update floating panel values
        if (elements.floatingDrugCount) {
            if (drugCount > 0 && availableCount < drugCount) {
                elements.floatingDrugCount.textContent = `${availableCount}/${drugCount} 剤`;
            } else {
                elements.floatingDrugCount.textContent = `${drugCount} 剤`;
            }
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
