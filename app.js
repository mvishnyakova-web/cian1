const $$ = (selector) => document.querySelector(selector);
const $$$ = (selector) => [...document.querySelectorAll(selector)];

const buyerView = $$('#buyerView');
const sellerView = $$('#sellerView');
const bidSheet = $$('#bidSheet');
const waitingSheet = $$('#waitingSheet');
const resultSheet = $$('#resultSheet');
const helpSheet = $$('#helpSheet');
let pendingBid = '';

function setRole(role) {
  $$$('.role').forEach((button) => {
    const isActive = button.dataset.role === role;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive);
  });
  buyerView.classList.toggle('active', role === 'buyer');
  sellerView.classList.toggle('active', role === 'seller');
}

function showSheet(sheet) {
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
}

function hideSheet(sheet) {
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
}

function showToast(message) {
  const toast = $$('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU').format(Number(String(value).replace(/\s/g, ''))) + ' ₽';
}

function showResult(type) {
  const success = type === 'success';
  $$('#resultIcon').textContent = success ? '🎉' : '!';
  $$('#resultIcon').classList.toggle('error', !success);
  $$('#resultEyebrow').textContent = success ? 'Ставка принята' : 'Не удалось отправить ставку';
  $$('#resultTitle').textContent = success ? 'Вы лидируете' : 'Попробуйте ещё раз';
  $$('#resultCopy').textContent = success
    ? `Ваша ставка ${formatPrice(pendingBid)} сейчас самая высокая.`
    : 'Проверьте интернет-соединение и повторите попытку. Деньги не списывались.';
  $$('#resultAction').textContent = success ? 'Понятно' : 'Вернуться к ставке';
  $$('#resultAction').dataset.next = success ? 'close' : 'bid';
  showSheet(resultSheet);
}

$$( '.role-switch').addEventListener('click', (event) => {
  const button = event.target.closest('.role');
  if (button) setRole(button.dataset.role);
});

$$('#showSellerFromBuyer').addEventListener('click', () => setRole('seller'));
$$('#goToBuyer').addEventListener('click', () => { setRole('buyer'); showToast('Объявление опубликовано и видно покупателям'); });
$$('#newAuction').addEventListener('click', () => { $$$('.seller-step').forEach(step => step.classList.remove('active')); $$('#sellerForm').classList.add('active'); });

$$('#auctionForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const start = $$('#startPrice').value;
  const step = $$('#bidStep').value;
  $$('#reviewPrice').textContent = formatPrice(start);
  $$('#reviewStep').textContent = formatPrice(step);
  $$('#reviewTime').textContent = $$('#finishTime').value;
  $$$('.seller-step').forEach(item => item.classList.remove('active'));
  $$('#sellerReview').classList.add('active');
});
$$('#backToForm').addEventListener('click', () => { $$$('.seller-step').forEach(item => item.classList.remove('active')); $$('#sellerForm').classList.add('active'); });
$$('#publishAuction').addEventListener('click', () => { $$$('.seller-step').forEach(item => item.classList.remove('active')); $$('#sellerPublished').classList.add('active'); });

$$('#openBid').addEventListener('click', () => {
  if ($$('#auctionCard').classList.contains('closed')) return;
  $$('#bidError').classList.remove('show');
  $$('#bidValue').classList.remove('invalid');
  showSheet(bidSheet);
});
$$('#closeBid').addEventListener('click', () => hideSheet(bidSheet));
$$( '#bidSheet').addEventListener('click', (event) => { if (event.target === bidSheet) hideSheet(bidSheet); });
$$( '.quick-bids').addEventListener('click', (event) => { const bid = event.target.dataset.bid; if (bid) { $$('#bidValue').value = new Intl.NumberFormat('ru-RU').format(bid); $$('#bidError').classList.remove('show'); $$('#bidValue').classList.remove('invalid'); } });

function validateBid() {
  const amount = Number($$('#bidValue').value.replace(/\s/g, ''));
  const valid = amount >= 12750000;
  $$('#bidError').classList.toggle('show', !valid);
  $$('#bidValue').classList.toggle('invalid', !valid);
  return valid;
}

$$('#placeBid').addEventListener('click', () => {
  if (!validateBid()) return;
  pendingBid = $$('#bidValue').value;
  hideSheet(bidSheet);
  showSheet(waitingSheet);
  setTimeout(() => { hideSheet(waitingSheet); showResult('success'); }, 1500);
});
$$('#triggerError').addEventListener('click', () => {
  if (!validateBid()) return;
  pendingBid = $$('#bidValue').value;
  hideSheet(bidSheet);
  showSheet(waitingSheet);
  setTimeout(() => { hideSheet(waitingSheet); showResult('error'); }, 1200);
});
$$('#resultAction').addEventListener('click', (event) => {
  const next = event.target.dataset.next;
  hideSheet(resultSheet);
  if (next === 'bid') showSheet(bidSheet);
  if (next === 'close') { $$('#currentPrice').textContent = formatPrice(pendingBid); showToast('Ставка сохранена. Вы лидируете!'); }
});

$$( '.demo-controls').addEventListener('click', (event) => {
  const button = event.target.closest('.state-control');
  if (!button) return;
  const closed = button.dataset.auctionState === 'closed';
  $$$('.state-control').forEach(item => item.classList.toggle('active', item === button));
  const card = $$('#auctionCard');
  card.classList.toggle('closed', closed);
  card.querySelector('.auction-chip').innerHTML = closed ? '<i></i> Аукцион завершён' : '<i></i> Аукцион идёт';
  $$('#auctionTimer').textContent = closed ? 'завершён в 20:00' : '02:18:46';
  card.querySelector('.primary').innerHTML = closed ? 'Аукцион завершён' : 'Сделать ставку <span>→</span>';
});

$$('#helpButton').addEventListener('click', () => showSheet(helpSheet));
$$('#closeHelp').addEventListener('click', () => hideSheet(helpSheet));
$$( '#helpSheet').addEventListener('click', (event) => { if (event.target === helpSheet) hideSheet(helpSheet); });
