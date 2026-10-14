/**
 * কবর পথের সামগ্রী - Interactive JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Product Data for Modal Dialog ---
  const productData = {
    kafan: {
      category: 'দাফন ও কাফন প্যাকেজ',
      title: 'কাফনের কাপড়',
      image: 'assets/images/product-kafan.jpg',
      desc: 'শরীয়তসম্মত উপায়ে প্রস্তুতকৃত উন্নত মানের ১০০% সুতি সাদা কাফনের কাপড়ের সেট। পুরুষ, মহিলা ও শিশু—সকলের জন্য পৃথক পরিমাপ অনুযায়ী প্রস্তুত রাখা হয়।',
      items: [
        'পুরুষের জন্য ৩ খণ্ড অথবা মহিলার জন্য ৫ খণ্ড উন্নত সাদা কাফনের থান',
        'কাফন বাঁধার জন্য ৩টি সুতি ফিতা',
        'গোসলের জন্য সুগন্ধি সাবান ও জীবাণুনাশক সামগ্রী',
        'উন্নত মানের প্রাকৃতিক কাফুর (কর্পূর) ও চন্দন গুঁড়া',
        'খাঁটি অ্যালকোহলমুক্ত আতর ও সুরমা',
        'পর্যাপ্ত পরিমাণ পরিষ্কার জীবাণুমুক্ত তুলা'
      ],
      whatsappMsg: 'আসসালামু আলাইকুম, আমি "কাফনের কাপড়" প্যাকেজটি সম্পর্কে জানতে ও অর্ডার করতে আগ্রহী।'
    },
    dafon: {
      category: 'কবর ও দাফন সামগ্রী',
      title: 'দাফনের প্রয়োজনীয় সামগ্রী',
      image: 'assets/images/product-dafon.jpg',
      desc: 'কবর খনন পরবর্তী প্রস্তুতি ও সম্পূর্ণ দাফন প্রক্রিয়ার জন্য অপরিহার্য সকল সামগ্রীর নির্ভরযোগ্য কমপ্লিট সেট।',
      items: [
        'উন্নত মানের বাঁশের কাঠি ও শক্ত বাঁশের চাটাই',
        'মজবুত সুতা ও মরদেহ নামানোর সুতি রশি',
        'দাফনকারীদের জন্য বিশেষ সাদা সুতি গ্লাভস',
        'মাটি সমান করা ও কবর খনন সহায়ক সামগ্রী',
        'কবরের ওপর বিছানোর পলিথিন ও সুরক্ষা স্তর'
      ],
      whatsappMsg: 'আসসালামু আলাইকুম, আমি "দাফনের প্রয়োজনীয় সামগ্রী" সেট সম্পর্কে বিস্তারিত জানতে ও অর্ডার করতে চাই।'
    },
    janaza: {
      category: 'নামাজ ও দোয়া সামগ্রী',
      title: 'জানাজার সামগ্রী',
      image: 'assets/images/product-janaza.jpg',
      desc: 'জানাজার নামাজ সুষ্ঠু ও সুশৃঙ্খলভাবে সম্পন্ন করার জন্য প্রয়োজনীয় সকল সহায়ক সামগ্রী।',
      items: [
        'ইমাম সাহেবের জন্য বিশেষ আরামদায়ক জায়নামাজ',
        'উপস্থিত মুসল্লিদের জন্য উন্নত মানের নামাজের টুপি',
        'পবিত্র কাঠের সুগন্ধি তাসবীহ',
        'জানাজায় আগতদের ব্যবহারের জন্য সুরভিত খাঁটি আতর',
        'ইমামতি চাদর বা পবিত্র শাল'
      ],
      whatsappMsg: 'আসসালামু আলাইকুম, আমি "জানাজার সামগ্রী" সেটটি সম্পর্কে জানতে ও সংগ্রহ করতে চাই।'
    },
    other: {
      category: 'সহায়ক ও পবিত্র পণ্য',
      title: 'অন্যান্য প্রয়োজনীয় পণ্য',
      image: 'assets/images/product-attar.jpg',
      desc: 'দাফন ও শেষ বিদায়ের আয়োজনের জন্য সহায়ক ও সুগন্ধি পবিত্র উপাদানসমূহ।',
      items: [
        'খাঁটি ও প্রাকৃতিক সুগন্ধি আতর (নন-অ্যালকোহলিক)',
        'বিশুদ্ধ গোলাপ জল ও সুগন্ধি স্প্রে',
        'বিশুদ্ধ প্রাকৃতিক কাফুর ও লোবান',
        'মেডিকেল গ্রেড জীবাণুমুক্ত তুলার বান্ডিল',
        'গোসলের জন্য খাঁটি সাবান ও সুরমা'
      ],
      whatsappMsg: 'আসসালামু আলাইকুম, আমি "অন্যান্য প্রয়োজনীয় পণ্য" তালিকা থেকে অর্ডার করতে চাই।'
    }
  };

  // --- 2. Modal Logic ---
  const modal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modalProductImg');
  const modalTitle = document.getElementById('modalProductTitle');
  const modalDesc = document.getElementById('modalProductDesc');
  const modalCategory = document.getElementById('modalProductCategory');
  const modalPackageItems = document.getElementById('modalPackageItems');
  const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  function openProductModal(productId) {
    const data = productData[productId];
    if (!data) return;

    modalImg.src = data.image;
    modalImg.alt = data.title;
    modalTitle.textContent = data.title;
    modalCategory.textContent = data.category;
    modalDesc.textContent = data.desc;

    // Populate items list
    modalPackageItems.innerHTML = '';
    data.items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      modalPackageItems.appendChild(li);
    });

    // Update WhatsApp Link
    const waUrl = `https://wa.me/8801844687759?text=${encodeURIComponent(data.whatsappMsg)}`;
    modalWhatsappBtn.href = waUrl;

    // Show modal
    modal.removeAttribute('hidden');
    // Force reflow
    void modal.offsetWidth;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }, 300);
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      openProductModal(targetId);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProductModal);
  }

  // Close modal when clicking backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProductModal();
      }
    });
  }

  // Close modal on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeProductModal();
    }
  });

  // --- 3. Mobile Navigation Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        navMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      } else {
        navMenu.classList.add('open');
        mobileMenuBtn.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- 4. Scroll To Top Button Visibility & Action ---
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    if (scrollTopBtn) {
      if (window.scrollY > 350) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- 5. ScrollSpy: Highlight active navigation link on scroll ---
  const sections = document.querySelectorAll('section[id], footer[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').replace('#', '');
      if (href === current) {
        link.classList.add('active');
      }
    });
  });

  // --- 6. Smooth Scroll for all internal anchors ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
