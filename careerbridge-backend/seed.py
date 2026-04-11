"""
Seed script — run once after first startup to populate the database.

Usage:
    python seed.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.models import *  # noqa: ensure all models registered
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()


# ── Helper ────────────────────────────────────────────────────────────────────

def already_seeded():
    from app.models.user import User
    return db.query(User).first() is not None


# ── Users ─────────────────────────────────────────────────────────────────────

def seed_users():
    from app.models.user import User
    users = [
        User(
            first_name="Admin", last_name="CareerBridge",
            email="admin@career.ai",
            hashed_password=hash_password("admin123"),
            role="admin", is_active=True,
        ),
        User(
            first_name="Bhumika", last_name="Jain",
            email="demo@career.ai",
            enrollment_no="AU2340065",
            hashed_password=hash_password("demo123"),
            role="student", branch="Computer Science & Engineering",
            semester=6, phone="+91 98765 43210",
            preferred_role="Software Engineer",
            location_pref="Bangalore, Remote, Mumbai",
            skills="React,Python,Java,SQL,ML/AI,Git",
            is_active=True,
        ),
        User(
            first_name="Aarav", last_name="Mehta",
            email="aarav@career.ai", enrollment_no="AU2340102",
            hashed_password=hash_password("demo123"),
            role="student", is_active=False,
            skills="Java,C++,SQL",
        ),
        User(
            first_name="Diya", last_name="Shah",
            email="diya@career.ai", enrollment_no="AU2340118",
            hashed_password=hash_password("demo123"),
            role="student", is_active=True,
            skills="Python,ML/AI,TensorFlow",
        ),
        User(
            first_name="Riya", last_name="Patel",
            email="riya@career.ai", enrollment_no="AU2340140",
            hashed_password=hash_password("demo123"),
            role="student", is_active=True,
            skills="Node.js,React,PostgreSQL,AWS",
        ),
    ]
    db.add_all(users)
    db.commit()
    print(f"  ✓ Seeded {len(users)} users")
    return users


# ── Tests + Questions ─────────────────────────────────────────────────────────

DSA_QUESTIONS = [
    dict(question="What is the worst-case time complexity of QuickSort?",
         options=["O(n log n)", "O(n²)", "O(n)", "O(log n)"], answer_idx=1,
         explanation="Worst case when pivot is always min/max element → O(n²). Randomised pivot mitigates this.", domain="dsa", order=1),
    dict(question="Which data structure implements a Priority Queue most efficiently?",
         options=["Array", "Linked List", "Binary Heap", "Stack"], answer_idx=2,
         explanation="Binary Heap gives O(log n) insert and O(log n) delete — optimal for priority queues.", domain="dsa", order=2),
    dict(question="What is the space complexity of DFS on a graph with V vertices?",
         options=["O(V+E)", "O(V)", "O(E)", "O(1)"], answer_idx=1,
         explanation="DFS call stack can grow to O(V) depth; visited array also O(V).", domain="dsa", order=3),
    dict(question="Inorder traversal of a BST yields elements in:",
         options=["Reverse order", "Sorted ascending", "Random order", "Level order"], answer_idx=1,
         explanation="Inorder (Left→Root→Right) visits BST nodes in ascending sorted order.", domain="dsa", order=4),
    dict(question="Time complexity of building a Binary Heap from n elements?",
         options=["O(n log n)", "O(n²)", "O(n)", "O(log n)"], answer_idx=2,
         explanation="Heapify-down from the last non-leaf node runs in O(n) total — a classic amortized result.", domain="dsa", order=5),
    dict(question="What does a Trie primarily optimize?",
         options=["Integer sorting", "String prefix search", "Graph traversal", "Arithmetic ops"], answer_idx=1,
         explanation="Tries give O(m) lookup regardless of dictionary size — ideal for autocomplete.", domain="dsa", order=6),
    dict(question="Floyd-Warshall algorithm solves:",
         options=["Single-source shortest path", "All-pairs shortest path", "Only negative edges", "Unweighted graphs"], answer_idx=1,
         explanation="Floyd-Warshall computes all-pairs shortest paths in O(V³) using dynamic programming.", domain="dsa", order=7),
    dict(question="Worst-case lookup time in a Hash Table?",
         options=["O(1)", "O(log n)", "O(n)", "O(n²)"], answer_idx=2,
         explanation="If all keys hash to the same bucket (collision storm), lookup degrades to O(n).", domain="dsa", order=8),
    dict(question="Which sort is stable AND guaranteed O(n log n) worst case?",
         options=["Quick Sort", "Heap Sort", "Merge Sort", "Shell Sort"], answer_idx=2,
         explanation="Merge Sort is both stable and guarantees O(n log n) in all cases.", domain="dsa", order=9),
    dict(question="BFS vs DFS — key difference:",
         options=["BFS uses a stack", "BFS uses queue, explores level by level", "DFS is always faster", "DFS uses less memory"],
         answer_idx=1, explanation="BFS uses a queue (FIFO) and explores all neighbours at current depth before going deeper.", domain="dsa", order=10),
]

APTITUDE_QUESTIONS = [
    dict(question="A train travels 360 km in 4 hours. Time to travel 540 km at the same speed?",
         options=["5 hours", "6 hours", "5.5 hours", "7 hours"], answer_idx=1,
         explanation="Speed = 90 km/h. Time = 540÷90 = 6 hours.", domain="aptitude", order=1),
    dict(question="Odd one out: 2, 3, 5, 7, 11, 14, 17",
         options=["11", "14", "17", "5"], answer_idx=1,
         explanation="All others are prime. 14 = 2×7 is composite.", domain="aptitude", order=2),
    dict(question="A completes job in 12 days, B in 18 days. Together?",
         options=["7.2 days", "6.8 days", "8 days", "7 days"], answer_idx=0,
         explanation="Combined rate = 1/12+1/18 = 5/36 per day. Time = 36/5 = 7.2 days.", domain="aptitude", order=3),
    dict(question="Next in sequence: 1, 4, 9, 16, 25, ?",
         options=["30", "35", "36", "34"], answer_idx=2,
         explanation="Perfect squares: 1²,2²,...,5². Next = 6² = 36.", domain="aptitude", order=4),
    dict(question="MANGO → OCPIQ. How is APPLE coded?",
         options=["CRRNG", "CRRNF", "DRRNG", "CQQNG"], answer_idx=0,
         explanation="Each letter shifts +2: A→C,P→R,P→R,L→N,E→G = CRRNG.", domain="aptitude", order=5),
]

SYSTEM_QUESTIONS = [
    dict(question="Which consistency model does Apache Cassandra use by default?",
         options=["Strong", "Eventual", "Causal", "Linear"], answer_idx=1,
         explanation="Cassandra defaults to eventual consistency for high availability, tunable per-operation.", domain="system", order=1),
    dict(question="CAP theorem: under network partition you must choose:",
         options=["CA", "CP or AP", "All three", "None"], answer_idx=1,
         explanation="Under partition: CP (Consistency + Partition) or AP (Availability + Partition). CA is impossible.", domain="system", order=2),
    dict(question="Primary purpose of a CDN?",
         options=["DB caching", "Reduced latency via edge servers", "Load balancing only", "Security only"], answer_idx=1,
         explanation="CDNs serve content from geographically distributed edge nodes, reducing latency.", domain="system", order=3),
]

VERBAL_QUESTIONS = [
    dict(question="Antonym of GREGARIOUS:",
         options=["Sociable", "Reclusive", "Talkative", "Vibrant"], answer_idx=1,
         explanation="Gregarious = fond of company. Antonym: Reclusive.", domain="verbal", order=1),
    dict(question="\"The pen is mightier than the sword\" — literary device?",
         options=["Simile", "Metaphor", "Personification", "Alliteration"], answer_idx=1,
         explanation="A metaphor compares pen (ideas) to sword (force) without using 'like/as'.", domain="verbal", order=2),
    dict(question="Grammatically correct:",
         options=["Neither of the students have submitted", "Neither of the students has submitted",
                  "Neither student have submitted", "All are correct"], answer_idx=1,
         explanation="\"Neither\" takes singular verb \"has\".", domain="verbal", order=3),
]


def seed_tests():
    from app.models.assessment import Test, Question

    test_defs = [
        dict(test_id="T-1001", title="DSA & Algorithms", type="Technical",
             total_questions=10, duration_secs=1200, points_per_question=10, cadence="Mon/Wed/Fri", status="Active",
             q_data=DSA_QUESTIONS),
        dict(test_id="T-1002", title="Aptitude & Reasoning", type="Aptitude",
             total_questions=5, duration_secs=720, points_per_question=20, cadence="Tue/Thu", status="Active",
             q_data=APTITUDE_QUESTIONS),
        dict(test_id="T-1003", title="System Design", type="Technical",
             total_questions=3, duration_secs=1800, points_per_question=30, cadence="Weekly", status="Active",
             q_data=SYSTEM_QUESTIONS),
        dict(test_id="T-1004", title="Verbal & Communication", type="Communication",
             total_questions=3, duration_secs=600, points_per_question=10, cadence="Daily", status="Active",
             q_data=VERBAL_QUESTIONS),
        dict(test_id="T-1005", title="Aptitude Assessment", type="Aptitude",
             total_questions=80, duration_secs=2400, points_per_question=5, cadence="Tue/Thu", status="Active",
             q_data=[]),
    ]

    for td in test_defs:
        q_data = td.pop("q_data")
        test = Test(**td)
        db.add(test)
        db.flush()
        for q in q_data:
            db.add(Question(test_id=test.id, **q))

    db.commit()
    print(f"  ✓ Seeded {len(test_defs)} tests")


# ── Internships ───────────────────────────────────────────────────────────────

INTERNSHIPS = [
    dict(company="Google", role="Software Engineer Intern", location="Bangalore, IN", duration="3 Months",
         domain="swe", tags=["React", "Python", "Distributed Sys"], description="Build product-facing web features with scalable frontend architecture.",
         deadline="Mar 31, 2026", color="#4285f4", letter="G", badge="bg", is_new=True, base_match=94),
    dict(company="Microsoft", role="ML Research Intern", location="Hyderabad, IN", duration="6 Months",
         domain="ml", tags=["PyTorch", "NLP", "Azure"], description="Work with research engineers on model prototyping and responsible AI.",
         deadline="Apr 15, 2026", color="#00a4ef", letter="M", badge="bb", is_new=False, base_match=89),
    dict(company="Flipkart", role="Data Engineering Intern", location="Bangalore, IN", duration="3 Months",
         domain="data", tags=["Spark", "SQL", "Kafka"], description="Develop ETL pipelines for commerce analytics.",
         deadline="Apr 30, 2026", color="#f7a828", letter="F", badge="by", is_new=False, base_match=85),
    dict(company="Amazon", role="Backend Developer Intern", location="Hyderabad, IN", duration="6 Months",
         domain="backend", tags=["Java", "AWS", "Microservices"], description="Implement microservice APIs and cloud-native backend deployments.",
         deadline="May 10, 2026", color="#ff9900", letter="A", badge="by", is_new=True, base_match=81),
    dict(company="Razorpay", role="SDE Intern", location="Bangalore, IN", duration="4 Months",
         domain="backend", tags=["Node.js", "Go", "PostgreSQL"], description="Build secure payment platform services.",
         deadline="Apr 20, 2026", color="#2eb8e6", letter="R", badge="bb", is_new=False, base_match=78),
    dict(company="Zomato", role="Data Science Intern", location="Gurugram, IN", duration="3 Months",
         domain="data", tags=["Python", "ML", "SQL"], description="Support demand forecasting and recommendation models.",
         deadline="Apr 25, 2026", color="#e23744", letter="Z", badge="br", is_new=False, base_match=74),
    dict(company="Swiggy", role="Frontend Developer Intern", location="Bangalore, IN", duration="3 Months",
         domain="frontend", tags=["React", "TypeScript", "CSS"], description="Create responsive UIs for high-scale consumer products.",
         deadline="May 5, 2026", color="#fc8019", letter="S", badge="br", is_new=False, base_match=72),
    dict(company="Meesho", role="ML Intern", location="Bangalore, IN", duration="4 Months",
         domain="ml", tags=["TensorFlow", "Python", "MLOps"], description="Train and monitor ML models for catalog intelligence.",
         deadline="May 15, 2026", color="#9c3587", letter="M", badge="bp", is_new=False, base_match=69),
]


def seed_internships():
    from app.models.internship import Internship
    for data in INTERNSHIPS:
        db.add(Internship(**data))
    db.commit()
    print(f"  ✓ Seeded {len(INTERNSHIPS)} internships")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if already_seeded():
        print("Database already seeded — skipping.")
    else:
        print("Seeding database…")
        seed_users()
        seed_tests()
        seed_internships()
        print("Done! ✅")
        print("\nDemo credentials:")
        print("  Student → demo@career.ai / demo123")
        print("  Admin   → admin@career.ai / admin123")
    db.close()
