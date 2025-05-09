#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images/tarot/placeholders

# Create a simple SVG for card error
cat > public/images/tarot/placeholders/card-error.svg << EOF
<svg width="140" height="240" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a2e"/>
  <text x="70" y="110" font-family="Arial" font-size="14" fill="#d4af37" text-anchor="middle">Image</text>
  <text x="70" y="130" font-family="Arial" font-size="14" fill="#d4af37" text-anchor="middle">Not Found</text>
  <circle cx="70" cy="70" r="30" stroke="#d4af37" stroke-width="2" fill="none"/>
  <line x1="55" y1="70" x2="85" y2="70" stroke="#d4af37" stroke-width="2"/>
  <line x1="70" y1="55" x2="70" y2="85" stroke="#d4af37" stroke-width="2"/>
</svg>
EOF

# Create a simple SVG for card back error
cat > public/images/tarot/placeholders/card-back-error.svg << EOF
<svg width="140" height="240" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0f0f1a"/>
  <text x="70" y="120" font-family="Arial" font-size="14" fill="#d4af37" text-anchor="middle">Card Back</text>
  <text x="70" y="140" font-family="Arial" font-size="14" fill="#d4af37" text-anchor="middle">Not Found</text>
  <rect x="40" y="60" width="60" height="40" stroke="#d4af37" stroke-width="2" fill="none"/>
  <line x1="40" y1="60" x2="100" y2="100" stroke="#d4af37" stroke-width="1"/>
  <line x1="40" y1="100" x2="100" y2="60" stroke="#d4af37" stroke-width="1"/>
</svg>
EOF

# Create a default card back
cat > public/images/tarot/card-back.svg << EOF
<svg width="140" height="240" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0f0f1a"/>
  <rect x="10" y="10" width="120" height="220" stroke="#d4af37" stroke-width="2" fill="none"/>
  
  <!-- Decorative pattern -->
  <circle cx="70" cy="120" r="50" stroke="#d4af37" stroke-width="1" fill="none"/>
  <circle cx="70" cy="120" r="40" stroke="#d4af37" stroke-width="1" fill="none"/>
  <circle cx="70" cy="120" r="30" stroke="#d4af37" stroke-width="1" fill="none"/>
  
  <!-- Stars -->
  <polygon points="70,50 74,62 87,62 76,70 80,82 70,75 60,82 64,70 53,62 66,62" fill="#d4af37"/>
  <polygon points="70,170 74,182 87,182 76,190 80,202 70,195 60,202 64,190 53,182 66,182" fill="#d4af37"/>
  
  <!-- Moon -->
  <path d="M110,50 A20,20 0 0,1 130,70 A20,20 0 0,1 110,90 A15,15 0 0,0 125,70 A15,15 0 0,0 110,50" fill="#d4af37"/>
</svg>
EOF

echo "Placeholder images created successfully!"