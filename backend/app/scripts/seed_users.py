# app/scripts/seed_users.py
from sqlmodel import Session
from app.db.database import engine
from app.models.user_model import User, UserProfile

DUMMY_STUDENTS = [
    {
        "user": {
            "username": "Priya Sharma",
            "email": "priya.sharma@coep.ac.in",
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Priya Sharma",
            "headline": "Computer Engineering • Sophomore • COEP Pune",
            "location": "Pune, Maharashtra",
            "study_mode": "Hybrid Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "priya_codes#2143",
            "linkedin_url": "https://linkedin.com/in/priyasharma-dev",
            "about": "Sophomore focused on Distributed Systems and Data Structures. Currently prepping for Google Summer of Code and mastering FastAPI.",
            "proof_of_work": {
                "github": {"username": "priyasharma", "topRepo": "go-microservices", "stars": 34, "url": "https://github.com"},
                "devTo": {"username": "priyasharma", "url": "https://dev.to"}
            },
            "study_specs": {
                "wants_to_learn": ["Distributed Systems", "Go", "Docker", "PostgreSQL"],
                "can_teach": ["Data Structures", "C++", "FastAPI", "Python"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Mon/Wed/Fri - 6 PM to 9 PM", "Weekends - Full Day"],
                "learning_approach": "Project building & mock DSA rounds"
            },
            "work_history": [
                {"role": "Backend Intern", "company": "TechInnovate Pune", "duration": "May 2026 - Jul 2026", "description": "Built REST APIs using FastAPI."}
            ],
            "featured_posts": []
        }
    },
    {
        "user": {
            "username": "Aarav Patel",
            "email": "aarav.patel@iitb.ac.in",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Aarav Patel",
            "headline": "Artificial Intelligence • Junior • IIT Bombay",
            "location": "Mumbai, Maharashtra",
            "study_mode": "Online Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "aarav_ai#8821",
            "linkedin_url": "https://linkedin.com/in/aaravpatel-ai",
            "about": "Working on LLM fine-tuning and PyTorch pipelines. Looking for a study buddy to grind LeetCode Mediums and read AI research papers.",
            "proof_of_work": {
                "github": {"username": "aaravpatel", "topRepo": "rag-pipeline-core", "stars": 88, "url": "https://github.com"},
                "kaggle": {"username": "aarav_p", "tier": "Master", "url": "https://kaggle.com"}
            },
            "study_specs": {
                "wants_to_learn": ["Deep Learning", "LLMs", "LangChain", "Vector Databases"],
                "can_teach": ["Python", "Machine Learning", "Linear Algebra"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Tue/Thu/Sat - Evenings", "Sun - Mornings"],
                "learning_approach": "Paper breakdowns & LeetCode sprints"
            },
            "work_history": [
                {"role": "AI Research Assistant", "company": "IITB Vision Lab", "duration": "Jan 2026 - Present", "description": "Trained transformer vision models."}
            ],
            "featured_posts": []
        }
    },
    {
        "user": {
            "username": "Ananya Iyer",
            "email": "ananya.iyer@iiit.ac.in",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Ananya Iyer",
            "headline": "Software Systems • Senior • IIIT Hyderabad",
            "location": "Hyderabad, Telangana",
            "study_mode": "Hybrid Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "ananya_dev#4312",
            "linkedin_url": "https://linkedin.com/in/ananyaiyer",
            "about": "Senior engineering student passionate about System Design and Kubernetes. Preparing for upcoming SDE-1 placement drives.",
            "proof_of_work": {
                "github": {"username": "ananyaiyer", "topRepo": "k8s-autoscaler", "stars": 65, "url": "https://github.com"}
            },
            "study_specs": {
                "wants_to_learn": ["Kubernetes", "AWS Cloud", "System Design", "Microservices"],
                "can_teach": ["TypeScript", "Next.js", "SQL", "Algorithms"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Daily - 8 PM to 11 PM"],
                "learning_approach": "System design diagrams & mock interviews"
            },
            "work_history": [
                {"role": "Fullstack Intern", "company": "HackerRank", "duration": "Summer 2025", "description": "Optimized UI state flows."}
            ],
            "featured_posts": []
        }
    },
    {
        "user": {
            "username": "Rohan Deshmukh",
            "email": "rohan.deshmukh@vit.edu",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Rohan Deshmukh",
            "headline": "Information Technology • Sophomore • VIT Pune",
            "location": "Pune, Maharashtra",
            "study_mode": "In-Person Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "rohan_d#9021",
            "linkedin_url": "https://linkedin.com/in/rohandeshmukh",
            "about": "Frontend-heavy engineer mastering React, TailwindCSS, and Node.js backend integrations.",
            "proof_of_work": {
                "github": {"username": "rohandesh", "topRepo": "study-flow-ui", "stars": 24, "url": "https://github.com"}
            },
            "study_specs": {
                "wants_to_learn": ["GraphQL", "Next.js", "Redis"],
                "can_teach": ["React", "JavaScript", "Tailwind CSS"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Mon/Wed/Fri - 4 PM to 7 PM"],
                "learning_approach": "Pair programming sessions"
            },
            "work_history": [],
            "featured_posts": []
        }
    }
]


def run_seed():
    with Session(engine) as session:
        for item in DUMMY_STUDENTS:
            existing = session.query(User).filter(User.email == item["user"]["email"]).first()
            if existing:
                continue

            user = User(**item["user"])
            session.add(user)
            session.commit()
            session.refresh(user)

            profile = UserProfile(**item["profile"], user_id=user.id) # type:ignore
            session.add(profile)
            session.commit()

        print("Indian dummy profiles seeded successfully!")


if __name__ == "__main__":
    run_seed()
