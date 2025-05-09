// Share Modal Script - Improved version with better error handling
(function() {
  // Wait for window to load completely
  window.addEventListener('load', function() {
    // Add a delay to ensure all dynamic content is loaded
    setTimeout(initShareModal, 1000);
  });

  function initShareModal() {
    try {
      console.log("Initializing share modal functionality");
      
      // Helper to create element with attrs
      function create(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
        children.forEach(child => {
          if (child) el.appendChild(child);
        });
        return el;
      }

      // Ensure share button exists
      let shareButton = document.getElementById('share-button');
      if (!shareButton) {
        shareButton = create('button', {
          id: 'share-button',
          style: 'position:fixed;bottom:20px;right:20px;padding:10px 15px;background:#805ad5;color:#fff;border:none;border-radius:4px;cursor:pointer;z-index:1000;'
        });
        shareButton.textContent = 'Connect';
        document.body.appendChild(shareButton);
      }

      // Ensure share modal exists
      let shareModal = document.getElementById('share-modal');
      if (!shareModal) {
        // Overlay
        shareModal = create('div', {
          id: 'share-modal',
          style: 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;opacity:0;transition:opacity 0.3s ease;pointer-events:none;'
        });
        
        // Modal content
        const box = create('div', {
          style: 'background:#1a1a2e;color:#fff;padding:30px;border-radius:8px;max-width:90%;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);transform:scale(0.9);transition:transform 0.3s ease;'
        });
        
        // Close button
        const closeBtn = create('button', {
          id: 'share-modal-close',
          style: 'position:absolute;top:10px;right:10px;background:none;border:none;font-size:24px;cursor:pointer;color:#fff;'
        });
        closeBtn.innerHTML = '&times;';
        
        // Title
        const title = create('h3', {
          style: 'margin-top:0;font-family:"Cinzel",serif;font-size:24px;margin-bottom:20px;'
        });
        title.textContent = 'Connect with Mystic Arcana';
        
        // Description
        const desc = create('p', {
          style: 'margin-bottom:20px;font-size:16px;line-height:1.5;'
        });
        desc.textContent = 'Follow us on social media or sign up for a premium account to unlock more features.';
        
        box.appendChild(title);
        box.appendChild(desc);
        
        // Custom action buttons
        const actions = [
          { label: 'Sign Up', url: '/signup', color: '#805ad5' },
          { label: 'Instagram', url: 'https://instagram.com/mysticarcana', color: '#E1306C' },
          { label: 'Twitter', url: 'https://twitter.com/mysticarcana', color: '#1DA1F2' },
          { label: 'LinkedIn', url: 'https://www.linkedin.com/company/mysticarcana', color: '#0077B5' }
        ];
        
        const buttonContainer = create('div', {
          style: 'display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px;'
        });
        
        actions.forEach(({ label, url, color }) => {
          const btn = create('a', {
            href: url,
            target: '_blank',
            style: `padding:10px 15px;border:none;border-radius:4px;cursor:pointer;display:inline-block;text-decoration:none;color:#fff;background:${color};font-weight:bold;transition:transform 0.2s ease,opacity 0.2s ease;`
          });
          btn.textContent = label;
          buttonContainer.appendChild(btn);
        });
        
        box.appendChild(buttonContainer);
        shareModal.appendChild(box);
        shareModal.appendChild(closeBtn);
        document.body.appendChild(shareModal);
      }

      // Show modal function
      const showModal = () => {
        if (shareModal) {
          shareModal.style.opacity = '1';
          shareModal.style.pointerEvents = 'auto';
          const modalContent = shareModal.querySelector('div');
          if (modalContent) modalContent.style.transform = 'scale(1)';
        }
      };

      // Close modal function
      const closeModal = () => {
        if (shareModal) {
          shareModal.style.opacity = '0';
          shareModal.style.pointerEvents = 'none';
          const modalContent = shareModal.querySelector('div');
          if (modalContent) modalContent.style.transform = 'scale(0.9)';
        }
      };

      // Add event listeners safely
      if (shareButton) {
        // Remove any existing event listeners to prevent duplicates
        const newShareButton = shareButton.cloneNode(true);
        if (shareButton.parentNode) {
          shareButton.parentNode.replaceChild(newShareButton, shareButton);
        }
        shareButton = newShareButton;
        
        shareButton.addEventListener('click', function(e) {
          e.preventDefault();
          showModal();
        });
      }

      const closeButton = document.getElementById('share-modal-close');
      if (closeButton) {
        // Remove any existing event listeners to prevent duplicates
        const newCloseButton = closeButton.cloneNode(true);
        if (closeButton.parentNode) {
          closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        }
        
        newCloseButton.addEventListener('click', closeModal);
      }

      if (shareModal) {
        // Remove any existing event listeners to prevent duplicates
        const newShareModal = shareModal.cloneNode(true);
        if (shareModal.parentNode) {
          shareModal.parentNode.replaceChild(newShareModal, shareModal);
        }
        shareModal = newShareModal;
        
        shareModal.addEventListener('click', function(e) {
          if (e.target === shareModal) closeModal();
        });
      }

      console.log("Share modal initialized successfully");
    } catch (error) {
      console.error("Error initializing share modal:", error);
    }
  }
})();
