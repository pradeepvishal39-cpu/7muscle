// ============================================
// RAZORPAY PAYMENT INTEGRATION
// 7 Muscle Fitness Studio
// ============================================

// ⚠️ Replace with your actual Razorpay Key ID
// Get from: https://dashboard.razorpay.com → Settings → API Keys
const RAZORPAY_KEY = 'rzp_test_SdKVttWYPJgYH0';

const PLANS = {
  monthly: {
    name: 'Monthly Membership',
    amount: 149900, // ₹1,499 in paise
    description: 'Monthly access to all facilities'
  },
  quarterly: {
    name: 'Quarterly Membership',
    amount: 349900, // ₹3,499 in paise
    description: '3-month access — Save 22%'
  },
  yearly: {
    name: 'Annual Membership',
    amount: 999900, // ₹9,999 in paise
    description: 'Full year access — Best value'
  }
};

// ============================================
// INITIATE PAYMENT
// ============================================
async function initiatePayment(planKey) {
  const plan = PLANS[planKey];
  if (!plan) { showToast('Invalid plan selected', 'error'); return; }

  const user = await window.auth.getCurrentUser().catch(() => null);
  
  if (!user) {
    showToast('Please login or sign up to purchase a membership.', 'error');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: plan.amount,
    currency: 'INR',
    name: '7 Muscle Fitness Studio',
    description: plan.description,
    image: window.location.origin + '/img/Fineshyt.png', // Dynamic logo URL
    prefill: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      contact: user?.user_metadata?.phone || ''
    },
    theme: {
      color: '#FFD700',
      backdrop_color: '#0A0A0A'
    },
    modal: {
      confirm_close: true,
      escape: true,
      ondismiss: function () {
        showToast('Payment cancelled. Try again anytime!', 'error');
      }
    },
    handler: async function (response) {
      // Payment successful
      const paymentId = response.razorpay_payment_id;
      showToast('Payment successful! Welcome to 7 Muscle! 🏋️', 'success');

      // Save membership to Supabase
      try {
        await window.membershipApi.createMembership(planKey, paymentId);
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 2000);
      } catch (err) {
        console.error('Membership save error:', err);
        showToast('Error saving membership. Please reach out to support.', 'error');
      }
    }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      showToast('Payment failed: ' + response.error.description, 'error');
    });
    rzp.open();
  } catch (e) {
    showToast('Payment gateway error. Please try again.', 'error');
    console.error(e);
  }
}

// ============================================
// TOAST NOTIFICATION (shared utility)
// ============================================
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span style="margin-right:8px">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    ${message}
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

window.initiatePayment = initiatePayment;
window.showToast = showToast;
