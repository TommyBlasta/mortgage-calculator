const i18n = {
  en: {
    title: 'Mortgage Calculator',
    subtitle: 'Calculate monthly payments or find the loan you can afford',
    tab_payment: 'Find Payment',
    tab_sum: 'Find Loan Amount',
    label_loan: 'Loan amount',
    label_monthly: 'Monthly payment',
    label_rate: 'Annual interest rate',
    label_years: 'Loan duration (years)',
    suffix_yr: 'yr',
    result_monthly: 'Monthly payment',
    result_loan: 'Affordable loan amount',
    total_paid: 'Total paid',
    total_interest: 'Total interest',
    expand_btn: 'Can I afford this?',
    afford_title: 'ČNB Affordability Check',
    afford_badge: 'Regulatory',
    label_income: 'Net monthly income',
    label_debt: 'Existing monthly debt payments',
    label_dti: 'DTI limit (× annual income)',
    label_dsti: 'DSTI limit (% of income)',
    dti_desc: 'Total debt ÷ annual income',
    dsti_desc: 'Monthly payments ÷ monthly income',
    min_income_label: 'Minimum net monthly income required',
    enter_income: 'Enter income to check',
    limit: 'limit',
    mo: '/mo',
  },
  cs: {
    title: 'Hypoteční kalkulačka',
    subtitle: 'Vypočítejte měsíční splátky nebo zjistěte, kolik si můžete půjčit',
    tab_payment: 'Najít splátku',
    tab_sum: 'Najít výši úvěru',
    label_loan: 'Výše úvěru',
    label_monthly: 'Měsíční splátka',
    label_rate: 'Roční úroková sazba',
    label_years: 'Doba splácení (roky)',
    suffix_yr: 'let',
    result_monthly: 'Měsíční splátka',
    result_loan: 'Dostupná výše úvěru',
    total_paid: 'Celkem zaplaceno',
    total_interest: 'Celkem na úrocích',
    expand_btn: 'Mohu si to dovolit?',
    afford_title: 'Kontrola dle ČNB',
    afford_badge: 'Regulace',
    label_income: 'Čistý měsíční příjem',
    label_debt: 'Stávající měsíční splátky',
    label_dti: 'Limit DTI (× roční příjem)',
    label_dsti: 'Limit DSTI (% příjmu)',
    dti_desc: 'Celkový dluh ÷ roční příjem',
    dsti_desc: 'Měsíční splátky ÷ měsíční příjem',
    min_income_label: 'Minimální požadovaný čistý měsíční příjem',
    enter_income: 'Zadejte příjem pro kontrolu',
    limit: 'limit',
    mo: '/měs',
  }
};

let lang = 'en';
let mode = 'payment';
let panelOpen = false;

function setLang(l) {
  lang = l;
  document.getElementById('lang-en').classList.toggle('active', l === 'en');
  document.getElementById('lang-cs').classList.toggle('active', l === 'cs');
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (i18n[l][key]) el.textContent = i18n[l][key];
  });
  calculate();
}

function t(key) {
  return i18n[lang][key] || i18n.en[key] || key;
}

function togglePanel() {
  panelOpen = !panelOpen;
  document.getElementById('side-col').classList.toggle('open', panelOpen);
  document.getElementById('page-wrap').classList.toggle('collapsed', !panelOpen);
  document.getElementById('expand-btn').classList.toggle('open', panelOpen);
  if (panelOpen) calculate();
}

function dotFmt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseDots(str) {
  return parseInt(str.replace(/\./g, '').replace(/[^\d]/g, ''), 10) || 0;
}

function formatAndCalc(el) {
  var raw = el.value.replace(/[^\d]/g, '');
  if (raw === '') { el.value = ''; calculate(); return; }
  var num = parseInt(raw, 10);
  var formatted = dotFmt(num);
  var cursorFromEnd = el.value.length - (el.selectionStart || 0);
  el.value = formatted;
  var pos = Math.max(0, formatted.length - cursorFromEnd);
  el.setSelectionRange(pos, pos);
  calculate();
}

function setMode(m) {
  mode = m;
  document.getElementById('tab-payment').classList.toggle('active', m === 'payment');
  document.getElementById('tab-sum').classList.toggle('active', m === 'sum');
  document.getElementById('tab-payment').setAttribute('aria-selected', m === 'payment');
  document.getElementById('tab-sum').setAttribute('aria-selected', m === 'sum');
  document.getElementById('field-principal').hidden = m === 'sum';
  document.getElementById('field-payment').hidden = m === 'payment';
  calculate();
}

function fmt(n) {
  return dotFmt(n) + ' Kč';
}

function calculate() {
  var rateAnnual = parseFloat(document.getElementById('rate').value);
  var years = parseFloat(document.getElementById('years').value);

  if (isNaN(rateAnnual) || isNaN(years) || years <= 0) {
    setResult('—', '—', '—');
    calcRegulatory(0, 0);
    return;
  }

  var n = years * 12;
  var r = rateAnnual / 100 / 12;

  if (mode === 'payment') {
    var P = parseDots(document.getElementById('principal').value);
    if (P <= 0) { setResult('—', '—', '—'); calcRegulatory(0, 0); return; }

    var M;
    if (r === 0) { M = P / n; }
    else { M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1); }

    var totalPaid = M * n;
    var totalInterest = totalPaid - P;

    document.getElementById('result-label').textContent = t('result_monthly');
    setResult(fmt(M), fmt(totalPaid), fmt(totalInterest));
    calcRegulatory(M, P);
  } else {
    var M = parseDots(document.getElementById('monthly').value);
    if (M <= 0) { setResult('—', '—', '—'); calcRegulatory(0, 0); return; }

    var P;
    if (r === 0) { P = M * n; }
    else { P = M * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)); }

    var totalPaid = M * n;
    var totalInterest = totalPaid - P;

    document.getElementById('result-label').textContent = t('result_loan');
    setResult(fmt(P), fmt(totalPaid), fmt(totalInterest));
    calcRegulatory(M, P);
  }
}

function setResult(main, total, interest) {
  document.getElementById('result-value').textContent = main;
  document.getElementById('total-paid').textContent = total;
  document.getElementById('total-interest').textContent = interest;
}

function calcRegulatory(monthlyPayment, loanAmount) {
  if (!panelOpen) return;

  var income = parseDots(document.getElementById('income').value);
  var otherDebt = parseDots(document.getElementById('other-debt').value);
  var dtiLimit = parseFloat(document.getElementById('dti-limit').value);
  var dstiLimit = parseFloat(document.getElementById('dsti-limit').value);

  var dtiEl = document.getElementById('dti-value');
  var dtiDot = document.getElementById('dti-dot');
  var dtiDetail = document.getElementById('dti-detail');
  var dstiEl = document.getElementById('dsti-value');
  var dstiDot = document.getElementById('dsti-dot');
  var dstiDetail = document.getElementById('dsti-detail');
  var minEl = document.getElementById('min-income');

  if (!monthlyPayment || !loanAmount || isNaN(dtiLimit) || isNaN(dstiLimit)) {
    dtiEl.textContent = '—';
    dstiEl.textContent = '—';
    dtiDot.className = 'status-dot neutral';
    dstiDot.className = 'status-dot neutral';
    dtiDetail.textContent = t('dti_desc');
    dstiDetail.textContent = t('dsti_desc');
    minEl.textContent = '—';
    return;
  }

  var totalDebt = loanAmount;
  var totalMonthlyDebt = monthlyPayment + otherDebt;
  var minIncomeDTI = totalDebt / dtiLimit / 12;
  var minIncomeDSTI = totalMonthlyDebt / (dstiLimit / 100);
  var minRequired = Math.max(minIncomeDTI, minIncomeDSTI);
  minEl.textContent = fmt(minRequired);

  if (income > 0) {
    var annualIncome = income * 12;
    var dtiRatio = totalDebt / annualIncome;
    var dstiRatio = (totalMonthlyDebt / income) * 100;

    dtiEl.textContent = dtiRatio.toFixed(1) + '×';
    dtiDot.className = 'status-dot ' + (dtiRatio <= dtiLimit ? 'pass' : 'fail');
    dtiDetail.textContent = fmt(totalDebt) + ' ÷ ' + fmt(annualIncome) + ' (' + t('limit') + ' ' + dtiLimit + '×)';

    dstiEl.textContent = dstiRatio.toFixed(0) + ' %';
    dstiDot.className = 'status-dot ' + (dstiRatio <= dstiLimit ? 'pass' : 'fail');
    dstiDetail.textContent = fmt(totalMonthlyDebt) + t('mo') + ' ÷ ' + fmt(income) + t('mo') + ' (' + t('limit') + ' ' + dstiLimit + ' %)';
  } else {
    dtiEl.textContent = '—';
    dstiEl.textContent = '—';
    dtiDot.className = 'status-dot neutral';
    dstiDot.className = 'status-dot neutral';
    dtiDetail.textContent = t('enter_income');
    dstiDetail.textContent = t('enter_income');
  }
}

document.addEventListener('DOMContentLoaded', calculate);
