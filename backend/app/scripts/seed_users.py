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
    },
    {
        "user": {
            "username": "Sneha Reddy",
            "email": "sneha.reddy@nitw.ac.in",
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Sneha Reddy",
            "headline": "Computer Science • Senior • NIT Warangal",
            "location": "Warangal, Telangana",
            "study_mode": "Hybrid Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "sneha_r#3310",
            "linkedin_url": "https://linkedin.com/in/snehareddy-cs",
            "about": "Competitive programmer (Codeforces Expert) prepping for SDE interviews. Loves breaking down hard DP problems with a buddy.",
            "proof_of_work": {
                "github": {"username": "snehareddy", "topRepo": "cp-templates", "stars": 52, "url": "https://github.com"},
                "medium": {"username": "sneha.writes", "url": "https://medium.com"}
            },
            "study_specs": {
                "wants_to_learn": ["System Design", "Golang", "Kafka"],
                "can_teach": ["Competitive Programming", "DP", "Graphs", "C++"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Mon/Tue/Thu - 7 PM to 10 PM"],
                "learning_approach": "Timed contests & editorial discussions"
            },
            "work_history": [
                {"role": "SDE Intern", "company": "Zoho", "duration": "May 2026 - Jul 2026", "description": "Built internal tooling in Go."}
            ],
            "featured_posts": [
                {"id": "post_sneha_1", "platform": "Medium", "title": "Demystifying Segment Trees", "url": "https://medium.com", "claps": 212, "date": "2 weeks ago"}
            ]
        }
    },
    {
        "user": {
            "username": "Karan Mehta",
            "email": "karan.mehta@bits-pilani.ac.in",
            "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Karan Mehta",
            "headline": "Electronics & Computer Engg • Junior • BITS Pilani",
            "location": "Pilani, Rajasthan",
            "study_mode": "Online Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "karan_m#1190",
            "linkedin_url": "https://linkedin.com/in/karanmehta-ece",
            "about": "Embedded systems enthusiast moving into full-stack web dev. Building a home-automation side project with FastAPI + React.",
            "proof_of_work": {
                "github": {"username": "karanmehta", "topRepo": "iot-home-hub", "stars": 19, "url": "https://github.com"}
            },
            "study_specs": {
                "wants_to_learn": ["React", "FastAPI", "WebSockets"],
                "can_teach": ["Embedded C", "Arduino", "Digital Logic Design"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Weekends - Full Day"],
                "learning_approach": "Build-along project sessions"
            },
            "work_history": [],
            "featured_posts": []
        }
    },
    {
        "user": {
            "username": "Ishita Verma",
            "email": "ishita.verma@du.ac.in",
            "avatar_url": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Ishita Verma",
            "headline": "Computer Science • Sophomore • Delhi University",
            "location": "New Delhi, Delhi",
            "study_mode": "In-Person Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "ishita_v#5567",
            "linkedin_url": "https://linkedin.com/in/ishitaverma",
            "about": "UI/UX focused frontend dev who also dabbles in product design on Dribbble. Looking for a DSA accountability partner.",
            "proof_of_work": {
                "github": {"username": "ishitaverma", "topRepo": "design-system-react", "stars": 15, "url": "https://github.com"},
                "dribbble": {"username": "ishita.designs", "url": "https://dribbble.com"}
            },
            "study_specs": {
                "wants_to_learn": ["Data Structures", "Algorithms", "SQL"],
                "can_teach": ["Figma", "React", "CSS/Tailwind", "Design Systems"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Mon/Wed/Fri - 5 PM to 8 PM"],
                "learning_approach": "Whiteboard problem walkthroughs"
            },
            "work_history": [
                {"role": "Product Design Intern", "company": "Swiggy", "duration": "Dec 2025 - Feb 2026", "description": "Designed onboarding flows for a new vertical."}
            ],
            "featured_posts": [
                {"id": "post_ishita_1", "platform": "Dribbble", "title": "StudyBuddy Dark Mode Concepts", "url": "https://dribbble.com", "likes": 87, "date": "1 month ago"}
            ]
        }
    },
    {
        "user": {
            "username": "Vikram Nair",
            "email": "vikram.nair@nitk.edu.in",
            "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Vikram Nair",
            "headline": "Information Technology • Senior • NIT Karnataka",
            "location": "Surathkal, Karnataka",
            "study_mode": "Hybrid Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "vikram_n#7745",
            "linkedin_url": "https://linkedin.com/in/vikramnair-dev",
            "about": "DevOps-curious backend engineer. Currently automating CI/CD pipelines and writing about it on dev.to.",
            "proof_of_work": {
                "github": {"username": "vikramnair", "topRepo": "ci-cd-templates", "stars": 41, "url": "https://github.com"},
                "devTo": {"username": "vikramnair", "url": "https://dev.to"}
            },
            "study_specs": {
                "wants_to_learn": ["Kubernetes", "Terraform", "AWS"],
                "can_teach": ["Docker", "GitHub Actions", "Linux", "Bash Scripting"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Tue/Thu - Evenings", "Sat - Full Day"],
                "learning_approach": "Hands-on labs & infra walkthroughs"
            },
            "work_history": [
                {"role": "DevOps Intern", "company": "Freshworks", "duration": "Jun 2026 - Aug 2026", "description": "Set up automated deployment pipelines."}
            ],
            "featured_posts": [
                {"id": "post_vikram_1", "platform": "Dev.to", "title": "Zero-Downtime Deploys with GitHub Actions", "url": "https://dev.to", "claps": 134, "date": "3 weeks ago"}
            ]
        }
    },
    {
        "user": {
            "username": "Meera Joshi",
            "email": "meera.joshi@manipal.edu",
            "avatar_url": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Meera Joshi",
            "headline": "Data Science • Junior • Manipal Institute of Technology",
            "location": "Manipal, Karnataka",
            "study_mode": "Online Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "meera_j#2283",
            "linkedin_url": "https://linkedin.com/in/meerajoshi-ds",
            "about": "Kaggle competitor working on time-series forecasting. Wants a buddy for SQL interview prep.",
            "proof_of_work": {
                "github": {"username": "meerajoshi", "topRepo": "timeseries-forecasting", "stars": 28, "url": "https://github.com"},
                "kaggle": {"username": "meera_j", "tier": "Expert", "url": "https://kaggle.com"}
            },
            "study_specs": {
                "wants_to_learn": ["SQL", "System Design", "A/B Testing"],
                "can_teach": ["Pandas", "Scikit-learn", "Statistics", "Python"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Daily - Mornings before 10 AM"],
                "learning_approach": "Dataset deep-dives & case studies"
            },
            "work_history": [],
            "featured_posts": []
        }
    },
    {
        "user": {
            "username": "Arjun Rao",
            "email": "arjun.rao@iiit-delhi.ac.in",
            "avatar_url": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Arjun Rao",
            "headline": "Computer Science & Design • Junior • IIIT Delhi",
            "location": "New Delhi, Delhi",
            "study_mode": "Hybrid Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "arjun_r#6689",
            "linkedin_url": "https://linkedin.com/in/arjunrao-csd",
            "about": "Full-stack dev building a startup MVP on nights/weekends. Happy to trade React help for DSA practice.",
            "proof_of_work": {
                "github": {"username": "arjunrao", "topRepo": "startup-mvp-nextjs", "stars": 37, "url": "https://github.com"}
            },
            "study_specs": {
                "wants_to_learn": ["DSA", "System Design"],
                "can_teach": ["Next.js", "Node.js", "MongoDB", "React"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Mon-Fri - Late nights (10 PM+)"],
                "learning_approach": "Mock interviews & timed rounds"
            },
            "work_history": [
                {"role": "Founding Engineer", "company": "Stealth Startup", "duration": "2026 - Present", "description": "Built the product MVP end-to-end."}
            ],
            "featured_posts": []
        }
    },
    {
        "user": {
            "username": "Divya Krishnan",
            "email": "divya.krishnan@annauniv.edu",
            "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Divya Krishnan",
            "headline": "Information Technology • Sophomore • Anna University",
            "location": "Chennai, Tamil Nadu",
            "study_mode": "In-Person Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "divya_k#4451",
            "linkedin_url": "https://linkedin.com/in/divyakrishnan",
            "about": "New to backend dev, coming from a frontend background. Wants to pair on building REST APIs properly.",
            "proof_of_work": {
                "github": {"username": "divyakrishnan", "topRepo": "recipe-app-react", "stars": 9, "url": "https://github.com"}
            },
            "study_specs": {
                "wants_to_learn": ["FastAPI", "PostgreSQL", "REST API Design"],
                "can_teach": ["HTML/CSS", "JavaScript", "React Basics"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Weekends - Afternoons"],
                "learning_approach": "Step-by-step project building"
            },
            "work_history": [],
            "featured_posts": []
        }
    },
    {
        "user": {
            "username": "Siddharth Kapoor",
            "email": "siddharth.kapoor@thapar.edu",
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Siddharth Kapoor",
            "headline": "Computer Engineering • Senior • Thapar University",
            "location": "Patiala, Punjab",
            "study_mode": "Online Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "sid_kapoor#8803",
            "linkedin_url": "https://linkedin.com/in/siddharthkapoor",
            "about": "Final-year student grinding Leetcode daily for placements. Also writes short tutorials on Medium.",
            "proof_of_work": {
                "github": {"username": "siddharthkapoor", "topRepo": "leetcode-patterns", "stars": 61, "url": "https://github.com"},
                "medium": {"username": "sid.codes", "url": "https://medium.com"}
            },
            "study_specs": {
                "wants_to_learn": ["System Design", "Behavioral Interviews"],
                "can_teach": ["DSA Patterns", "Java", "OOP"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Daily - 9 PM to 12 AM"],
                "learning_approach": "Pattern-based problem grinding"
            },
            "work_history": [
                {"role": "SDE Intern", "company": "Paytm", "duration": "Jan 2026 - Jun 2026", "description": "Worked on payment reconciliation services."}
            ],
            "featured_posts": [
                {"id": "post_sid_1", "platform": "Medium", "title": "10 LeetCode Patterns That Cover 80% of Interviews", "url": "https://medium.com", "claps": 340, "date": "1 week ago"}
            ]
        }
    },
    {
        "user": {
            "username": "Tanvi Desai",
            "email": "tanvi.desai@nirmauni.ac.in",
            "avatar_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
            "time_zone": "Asia/Kolkata",
        },
        "profile": {
            "name": "Tanvi Desai",
            "headline": "Computer Science • Junior • Nirma University",
            "location": "Ahmedabad, Gujarat",
            "study_mode": "Hybrid Mode",
            "trust_score": "Verified Learner",
            "discord_handle": "tanvi_d#9934",
            "linkedin_url": "https://linkedin.com/in/tanvidesai",
            "about": "Mobile dev (Flutter) exploring backend with FastAPI for a cross-platform app. Open to a weekly pairing session.",
            "proof_of_work": {
                "github": {"username": "tanvidesai", "topRepo": "flutter-expense-tracker", "stars": 22, "url": "https://github.com"}
            },
            "study_specs": {
                "wants_to_learn": ["FastAPI", "Docker", "System Design"],
                "can_teach": ["Flutter", "Dart", "Firebase"],
                "timezone": "IST (UTC+5:30)",
                "availability": ["Sat/Sun - Mornings"],
                "learning_approach": "Weekly pairing + code review"
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
