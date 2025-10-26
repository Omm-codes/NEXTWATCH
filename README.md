# NextWatch 🎬 – Your Personal Movie & TV Platform

NextWatch is a modern, feature-rich movie and TV show discovery platform that helps you find, save, and enjoy the best content from around the world. Combining traditional search with personalized recommendations and a smart quiz, NextWatch makes discovering your next favorite show effortless and fun.

![NextWatch Screenshot](./screenshot/homepage.jpg)

## 🌟 Features

- **Search & Discovery**: Browse thousands of movies, TV shows, and web series by genre, rating, or mood
- **Personalized Quiz**: Get AI-powered recommendations based on your mood and preferences
- **Watchlist**: Save movies and shows to your personal watchlist
- **User Accounts**: Sign up with email or Google, manage your profile and preferences
- **Trending & Popular**: See what's trending and highly rated
- **Responsive Design**: Enjoy a seamless experience on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nextwatch.git
   cd nextwatch
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # TMDB API Configuration
   REACT_APP_TMDB_API_KEY=your_tmdb_api_key
   REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3

   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id

   # Groq API Configuration (for AI-powered features)
   REACT_APP_GROQ_API_KEY=your_groq_api_key
   ```

   **Note:** Get your Groq API key from [https://console.groq.com](https://console.groq.com) to enable AI-powered recommendations.

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## 📁 Project Structure

```
nextwatch/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API and Firebase logic
│   ├── contexts/          # React contexts
│   ├── assets/            # Images & static files
│   ├── styles/            # Global styles
│   └── utils/             # Utility functions
├── .env
├── package.json
└── README.md
```

## 🛠️ Technologies Used

- **React**: Frontend library for building user interfaces
- **Firebase**: Authentication and Firestore database
- **TMDB API**: For movie and TV show data
- **Groq API with llama3-8b-8192**: AI-powered recommendations and content descriptions
- **CSS3**: For styling components

## 🤖 AI-Powered Features

NextWatch uses the **Groq API with the llama3-8b-8192 model** to provide intelligent, personalized recommendations. The AI powers:

- **Mood-based recommendations**: Describe your mood and get perfectly matched content
- **Smart content descriptions**: Engaging, personalized descriptions for movies and shows
- **Review summaries**: AI-generated summaries of user reviews
- **Personalized quiz**: Intelligent recommendations based on your quiz answers

### Verifying the LLM Model

To check if the LLM model is working correctly:

```bash
# Run the verification script
node scripts/verify-llm-model.js

# Or run the unit tests
npm test -- --testPathPattern=openai.test.js --watchAll=false

# Or run integration tests (requires API key)
npm test -- --testPathPattern=openai.integration.test.js --watchAll=false
```

For detailed information about the LLM model status, see [LLM_MODEL_STATUS.md](./LLM_MODEL_STATUS.md).

## 🎯 Key Features & Usage

### Search & Discovery
Find movies, TV shows, and web series by name, genre, or mood. Use advanced filters to narrow down results.

### Personalized Quiz
Take a quick quiz to get recommendations tailored to your mood, available time, and preferences.

### Watchlist
Save your favorite content to your personal watchlist and keep track of what you want to watch next.

### User Accounts
Sign up with email or Google, manage your profile, and sync your watchlist across devices.

### Trending & Popular
Stay up-to-date with trending and highly rated content.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Netlify or Vercel
- Build the project: `npm run build`
- Drag and drop the `build` folder to Netlify or use `vercel` CLI for Vercel

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Make your changes and commit them (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

Please ensure your code follows the project's coding standards.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For inquiries or support, please contact:

- Om Chavan - [LinkedIn](https://www.linkedin.com/in/om-chavan003) | [Instagram](https://www.instagram.com/om_chavan_003)
- Email: [omsanjay975@gmail.com](mailto:omsanjay975@gmail.com)

---

Made with ❤️ by Om Chavan for movie lovers everywhere.

*NextWatch – Discover. Watch. Enjoy.*
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



---

Made with ❤️ by Om Chavan for movie lovers everywhere.

*NextWatch - Discover. Watch. Enjoy.*
