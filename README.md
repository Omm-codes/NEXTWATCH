# NextWatch 🎬

A modern movie and TV show discovery platform built with React. Discover your next favorite movie through personalized recommendations and intuitive browsing.

## 🌟 Features

- **🔍 Search & Browse** - Find movies, TV shows, and web series
- **📚 Personal Watchlist** - Save content to watch later
- **🎯 Personalized Quiz** - Get recommendations based on your mood
- **🔐 User Accounts** - Sign up with email or Google
- **📱 Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **React 18** - Frontend framework
- **Firebase** - Authentication & database
- **TMDB API** - Movie & TV data
- **CSS3** - Styling

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation
```bash
git clone https://github.com/your-username/nextwatch.git
cd nextwatch
npm install
```

### Environment Setup
Create a `.env` file:
```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

### Run Development Server
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API & Firebase
├── contexts/      # React contexts
└── assets/        # Images & static files
```

## 🚀 Deployment

```bash
npm run build
firebase deploy
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file.

## 📞 Contact

**Om Chavan** - [LinkedIn](https://www.linkedin.com/in/om-chavan003) | omsanjay975@gmail.com

---

Made with ❤️ for movie lovers everywhere.
git clone https://github.com/your-username/nextwatch.git
cd nextwatch
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Environment Variables
Create a `.env` file in the root directory:

```env
# TMDB API Configuration
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### API Setup

#### 1. TMDB API Key
1. Visit [The Movie Database](https://www.themoviedb.org/)
2. Create an account and request an API key
3. Add your API key to the `.env` file

#### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Create a Firestore database
5. Add your Firebase config to the `.env` file

### Run the Development Server
```bash
npm start
# or
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📝 Available Scripts

### Development
- **`npm start`** - Runs the app in development mode
- **`npm test`** - Launches the test runner
- **`npm run build`** - Builds the app for production
- **`npm run eject`** - Ejects from Create React App (one-way operation)

### Linting & Formatting
- **`npm run lint`** - Run ESLint to check code quality
- **`npm run lint:fix`** - Fix auto-fixable ESLint issues
- **`npm run format`** - Format code with Prettier

## 🏗️ Project Structure

```
nextwatch/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar/
│   │   ├── MovieCard/
│   │   ├── Footer/
│   │   └── LoadingSkeleton/
│   ├── pages/             # Page components
│   │   ├── Home/
│   │   ├── Movies/
│   │   ├── MovieDetails/
│   │   ├── Watchlist/
│   │   ├── Profile/
│   │   ├── Auth/
│   │   ├── About/
│   │   ├── Contact/
│   │   ├── Terms/
│   │   └── Privacy/
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js
│   ├── services/          # API and external services
│   │   ├── api.js
│   │   └── firebase.js
│   ├── assets/            # Static assets
│   │   ├── images/
│   │   └── logo.png
│   ├── styles/            # Global styles
│   └── utils/             # Utility functions
├── .env                   # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🎯 Key Features Implementation

### Authentication System
- Firebase Authentication with email/password
- Google OAuth integration
- Protected routes and user sessions
- User profile management

### Movie Discovery
- TMDB API integration for real-time data
- Advanced search with filters
- Genre-based browsing
- Personalized recommendation quiz

### User Experience
- Responsive design for all screen sizes
- Smooth animations and transitions
- Loading states and error handling
- Accessibility compliance (WCAG guidelines)

### Data Management
- Firebase Firestore for user data
- Real-time watchlist synchronization
- User preferences and viewing history
- Offline data caching

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Deploy
firebase deploy
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Drag and drop the `build` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📋 Roadmap

### Upcoming Features
- [ ] Movie reviews and ratings system
- [ ] Social features (friends, sharing)
- [ ] Advanced filtering options
- [ ] Movie recommendations based on viewing history
- [ ] Offline mode support
- [ ] Mobile app (React Native)
- [ ] Watch party features
- [ ] Integration with streaming platforms

### Performance Improvements
- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Bundle size optimization

## 🐛 Known Issues

- Search results may take longer to load with slow internet connections
- Some movie posters may not display if TMDB images are unavailable
- Offline functionality is limited

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The Movie Database (TMDB)** - For providing comprehensive movie and TV show data
- **Firebase** - For authentication and database services
- **React Community** - For the amazing ecosystem and tools
- **Contributors** - Thank you to all contributors who help improve this project

## 📞 Contact & Support

### Developer
- **Om Chavan** - [LinkedIn](https://www.linkedin.com/in/om-chavan003) | [Instagram](https://www.instagram.com/om_chavan_003)
- **Email** - omsanjay975@gmail.com

### Support
- 📧 **Email Support** - omsanjay975@gmail.com
- 🐛 **Bug Reports** - [GitHub Issues](https://github.com/your-username/nextwatch/issues)
- 💡 **Feature Requests** - [GitHub Discussions](https://github.com/your-username/nextwatch/discussions)

### Links
- **Live Demo** - [NextWatch App](https://your-demo-url.com)
- **Documentation** - [Wiki](https://github.com/your-username/nextwatch/wiki)
- **API Reference** - [TMDB API Docs](https://developers.themoviedb.org/3)

---

Made with ❤️ by Om Chavan for movie lovers everywhere.

*NextWatch - Discover. Watch. Enjoy.*
