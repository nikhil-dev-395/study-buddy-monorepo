# StudyBuddy MVP Checklist

## ✅ Core Features

- [ ] User Authentication
  - [ ] Sign up
  - [ ] Login
  - [ ] JWT Authentication

  // we will going to add accesstoken , and refreshtoken

- [ ] User Profiles
  - [ ] View profile
  - [ ] Edit profile
  - [ ] Add bio
  - [ ] Add skills

- [ ] Skill Listings
  - [ ] Teach a skill
  - [ ] Learn a skill
  - [ ] Browse available skills

- [ ] Buddy Matching
  - [ ] Find users by skill
  - [ ] Send buddy request
  - [ ] Accept/Reject request

- [ ] Chat
  - [ ] One-to-one messaging
  - [ ] Real-time updates

- [ ] Session Scheduling
  - [ ] Create session
  - [ ] View upcoming sessions
  - [ ] Cancel/Reschedule session

---

## 🤖 AI Features

- [ ] AI Study Roadmap
  - [ ] Enter learning goal
  - [ ] Select duration (e.g., 30 days)
  - [ ] Generate personalized roadmap

- [ ] AI Quiz Generator
  - [ ] Enter topic
  - [ ] Generate 5–10 questions
  - [ ] Show answers/explanations

- [ ] AI Notes Summarizer
  - [ ] Paste notes or upload text
  - [ ] Generate concise summary
  - [ ] Highlight key points

- [ ] AI Chat Tutor
  - [ ] Ask subject-related questions
  - [ ] AI responds with explanations
  - [ ] Maintain chat history

---

## 🛠 Tech Stack

- [ ] Frontend: React
- [ ] Backend: FastAPI
- [ ] Database: Supabase
- [ ] AI: OpenAI API or an open-source model via an API

---

## 🚀 Optional (If Time Allows)

- [ ] Notifications
- [ ] Dark mode
- [ ] Profile avatars
- [ ] Responsive UI
- [ ] Deployment



### google auth architecture
```
Frontend (React)
      |
      | 1. User clicks "Sign in with Google"
      ↓
Google OAuth
      |
      | 2. Returns Google ID token
      ↓
Frontend sends token to FastAPI
      |
      | 3. Verify token
      ↓
FastAPI creates/finds user
      |
      | 4. Returns your own JWT access token

```
