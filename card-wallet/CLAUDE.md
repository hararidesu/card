# 診察券ウォレットアプリ - Documentation

## Overview
This is a medical card (診察券) management app similar to Apple Wallet, built with Next.js, TypeScript, Tailwind CSS, and Supabase. The app allows users to digitally store and manage their medical cards with a secure passcode entry system.

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: React useState hooks
- **Storage**: LocalStorage (fallback) + Supabase

### Project Structure
```
card-wallet/
├── app/
│   ├── globals.css      # Global styles with Tailwind
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page with app logic
├── components/
│   ├── PasscodeScreen.tsx   # Passcode entry (0314)
│   ├── CardList.tsx         # Apple Wallet-style card list
│   ├── CardDetail.tsx       # Detailed card view
│   ├── AddCard.tsx          # Card addition with camera simulation
│   └── EditCard.tsx         # Card editing interface
├── lib/
│   └── supabase.ts          # Supabase client and card service
├── types/
│   └── card.ts              # TypeScript type definitions
└── supabase/
    └── migrations/          # Database migrations
```

## Features

### 1. Secure Access
- Passcode: **0314**
- Numeric keypad interface
- Visual feedback for correct/incorrect entry

### 2. Card Management
- **Add Card**: Real camera + photo upload with Google OCR
- **View Cards**: Apple Wallet-style list with card images
- **Card Details**: Full view with QR codes and contact info
- **Edit Card**: Update all card information
- **Delete Card**: With confirmation dialog

### 3. Enhanced Local OCR
- **Advanced Image Processing**: Multi-stage image enhancement for better text recognition
- **Tesseract.js with Preprocessing**: Optimized for Japanese medical cards
- **Smart Text Parsing**: Intelligent extraction of clinic names, member numbers, phone numbers, and URLs
- **Client-side Processing**: No API dependencies, works offline

### 4. Card Information
Each card stores:
- Store name (店名) - Auto-detected
- Member number (会員番号) - Auto-detected  
- Barcode/QR code data - Auto-detected
- Phone number (optional) - Auto-detected
- URL (optional) - Auto-detected
- Front and back card images

## Setup Instructions

### 1. Install Dependencies
```bash
cd card-wallet
npm install
```

### 2. Configure Supabase
1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_create_cards_table.sql`
3. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000`

## Usage

### First Time Setup
1. Enter passcode: **0314**
2. Three sample cards will be automatically loaded

### Adding a New Card
1. Click the + button (bottom right)
2. Align card in the camera frame
3. Capture front side
4. Capture back side (optional - can skip)
5. Edit extracted information
6. Save card

### Managing Cards
- **View**: Tap any card in the list
- **Edit**: Tap card → Edit button
- **Delete**: Tap card → Delete button → Confirm
- **Call**: Tap phone number in card detail
- **Visit Website**: Tap URL in card detail

## Design Guidelines

### Color Scheme (Tailwind)
- Primary: `bg-blue-600`
- Secondary: `bg-gray-100/800`
- Success: `bg-green-500`
- Warning: `bg-yellow-500`
- Danger: `bg-red-500`

### Animations
- Card entrance: `animate-slide-up`
- Fade effects: `animate-fade-in`
- Hover states: `hover:scale-105`
- Loading: `animate-pulse`

### Mobile-First Design
- Max width: `max-w-md`
- Responsive breakpoints: `sm:`, `md:`, `lg:`
- Touch-friendly buttons and spacing

## Data Persistence

### LocalStorage (Current)
- Cards are saved to browser localStorage
- Automatic save on any change
- Sample data loaded on first use

### Supabase Integration
- Database schema ready
- Service methods implemented
- Switch from localStorage to Supabase by:
  1. Uncommenting Supabase calls in `app/page.tsx`
  2. Removing localStorage logic
  3. Adding proper error handling

## Security Considerations

1. **Passcode**: Currently hardcoded (0314) - should be configurable
2. **Data**: Stored locally - consider encryption for sensitive data
3. **Images**: Base64 encoded - consider cloud storage for production
4. **API Keys**: Ensure Supabase RLS policies are configured

## Enhanced OCR Features

### Image Processing Pipeline
1. **Grayscale Conversion**: Optimizes text contrast
2. **Noise Reduction**: Median filtering removes image artifacts
3. **Contrast Enhancement**: Improves text visibility
4. **Sharpening**: Enhances text edges for better recognition

### Tesseract.js Optimization
- **Japanese + English Recognition**: Dual language support
- **Custom Character Whitelist**: Optimized for medical card text
- **Page Segmentation**: Configured for structured text blocks
- **Parameter Tuning**: Optimized for medical card layouts

### Smart Text Parsing
- **Clinic Name Detection**: Medical keyword-based scoring system
- **Member Number Extraction**: Multiple pattern matching
- **Phone Number Recognition**: Format normalization
- **URL Detection**: Automatic protocol addition
- **Duplicate Prevention**: Cross-field validation

## Future Enhancements

1. **User Authentication**: Multi-user support with Supabase Auth
2. **Cloud Sync**: Enhanced Supabase integration features
3. **Biometric Lock**: Face ID/Touch ID instead of passcode
4. **Export Feature**: PDF or image export of cards
5. **Search/Filter**: Search cards by name or number
6. **Categories**: Organize cards by type (hospital, clinic, dental, etc.)
7. **Batch Processing**: Multiple card scanning
8. **OCR Confidence Scores**: Display recognition confidence

## Testing

### Manual Testing Checklist
- [ ] Passcode entry (correct: 0314)
- [ ] Passcode entry (incorrect)
- [ ] View sample cards
- [ ] Add new card (with back)
- [ ] Add new card (skip back)
- [ ] Edit card information
- [ ] Delete card with confirmation
- [ ] Phone number tap action
- [ ] URL tap action
- [ ] QR code display
- [ ] Responsive design on mobile

## Deployment

### Vercel Deployment
```bash
npm run build
vercel
```

### Environment Variables
Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues
1. **Passcode not working**: Ensure it's exactly "0314"
2. **Cards not saving**: Check browser localStorage permissions
3. **Images not displaying**: Check Next.js image configuration
4. **Supabase connection**: Verify environment variables

### Debug Mode
Add to `.env.local`:
```
NEXT_PUBLIC_DEBUG=true
```

## License
Private use only - Medical card management application