"""
Comprehensive seed script:
- Seeds GCE Levels & Subjects (idempotent)
- Creates 2 test student accounts
- Creates enrollments & progress records for testing
"""
from sqlmodel import Session, select
from db.database import engine
from models.user import User
from models.content import Level, Subject
from models.progress import Enrollment, PaperProgress, Streak, Badge, UserBadge
from core.security import get_password_hash
from datetime import datetime, timedelta
import uuid

# ────────────────────────────────────────────────────────────
# TEST ACCOUNTS
# ────────────────────────────────────────────────────────────
TEST_ACCOUNTS = [
    {
        "full_name": "Amara Nkeng",
        "email": "amara@test.cm",
        "password": "Test1234!",
        "role": "student",
        "level": "O-Level",
        "whatsapp_number": "+237655001001",
    },
    {
        "full_name": "Brice Fotso",
        "email": "brice@test.cm",
        "password": "Test1234!",
        "role": "student",
        "level": "A-Level",
        "whatsapp_number": "+237655002002",
    },
]

# ────────────────────────────────────────────────────────────
# BADGES
# ────────────────────────────────────────────────────────────
BADGES = [
    {"name": "First Step", "description": "Completed your first paper", "icon": "🎯"},
    {"name": "Week Warrior", "description": "Maintained a 7-day streak", "icon": "🔥"},
    {"name": "Subject Master", "description": "Completed all papers in a subject", "icon": "📚"},
    {"name": "Quick Starter", "description": "Enrolled in 3 subjects", "icon": "🚀"},
]


def seed():
    with Session(engine) as db:
        print("\n-- Seeding Levels & Subjects -------------------")
        # Levels
        o_level = db.exec(select(Level).where(Level.name == "O-Level")).first()
        a_level = db.exec(select(Level).where(Level.name == "A-Level")).first()

        if not o_level:
            o_level = Level(name="O-Level")
            db.add(o_level)
        if not a_level:
            a_level = Level(name="A-Level")
            db.add(a_level)
        db.commit()
        db.refresh(o_level)
        db.refresh(a_level)

        # Subjects
        o_subjects_data = [
            "Mathematics", "English Language", "Biology", "Physics", "Chemistry",
            "Geography", "History", "Computer Science", "Economics", "French"
        ]
        a_subjects_data = [
            "Pure Mathematics with Statistics", "Physics", "Chemistry", "Biology",
            "Economics", "Computer Science", "Literature in English", "Further Mathematics"
        ]

        o_subjects = []
        for name in o_subjects_data:
            existing = db.exec(select(Subject).where(Subject.name == name, Subject.level_id == o_level.id)).first()
            if not existing:
                s = Subject(name=name, level_id=o_level.id)
                db.add(s)
                db.flush()
                o_subjects.append(s)
            else:
                o_subjects.append(existing)

        a_subjects = []
        for name in a_subjects_data:
            existing = db.exec(select(Subject).where(Subject.name == name, Subject.level_id == a_level.id)).first()
            if not existing:
                s = Subject(name=name, level_id=a_level.id)
                db.add(s)
                db.flush()
                a_subjects.append(s)
            else:
                a_subjects.append(existing)

        db.commit()
        print(f"[OK] {len(o_subjects)} O-Level subjects, {len(a_subjects)} A-Level subjects ready.")

        print("\n-- Seeding Badges -----------------------")
        badge_objects = {}
        for b in BADGES:
            existing = db.exec(select(Badge).where(Badge.name == b["name"])).first()
            if not existing:
                badge = Badge(**b)
                db.add(badge)
                db.flush()
                badge_objects[b["name"]] = badge
                print(f"[OK] Badge created: {b['name']}")
            else:
                badge_objects[b["name"]] = existing
        db.commit()

        print("\n-- Seeding Test Accounts ----------------")
        created_users = []
        for account in TEST_ACCOUNTS:
            existing = db.exec(select(User).where(User.email == account["email"])).first()
            if existing:
                print(f"  [SKIP] Account already exists: {account['email']}")
                created_users.append(existing)
                continue

            user = User(
                full_name=account["full_name"],
                email=account["email"],
                password_hash=get_password_hash(account["password"]),
                role=account["role"],
                level=account["level"],
                whatsapp_number=account["whatsapp_number"],
            )
            db.add(user)
            db.flush()
            created_users.append(user)
            print(f"[OK] Created: {account['full_name']} ({account['email']}) - {account['level']}")

        db.commit()
        for u in created_users:
            db.refresh(u)

        print("\n-- Seeding Enrollments & Progress -------")
        # Amara (O-Level) → enroll in Maths, Biology, Physics
        amara = created_users[0]
        amara_subjects = o_subjects[:3]  # Maths, English, Biology

        for subj in amara_subjects:
            existing_enr = db.exec(
                select(Enrollment).where(
                    Enrollment.user_id == amara.id,
                    Enrollment.subject_id == subj.id
                )
            ).first()
            if not existing_enr:
                db.add(Enrollment(user_id=amara.id, subject_id=subj.id))

        db.commit()
        print(f"[OK] Amara enrolled in {len(amara_subjects)} subjects")

        # Brice (A-Level) → enroll in Pure Maths, Physics, Chemistry
        brice = created_users[1]
        brice_subjects = a_subjects[:3]

        for subj in brice_subjects:
            existing_enr = db.exec(
                select(Enrollment).where(
                    Enrollment.user_id == brice.id,
                    Enrollment.subject_id == subj.id
                )
            ).first()
            if not existing_enr:
                db.add(Enrollment(user_id=brice.id, subject_id=subj.id))

        db.commit()
        print(f"[OK] Brice enrolled in {len(brice_subjects)} subjects")

        print("\n-- Seeding Streaks ----------------------")
        for user, streak_days in [(amara, 5), (brice, 12)]:
            existing_streak = db.exec(select(Streak).where(Streak.user_id == user.id)).first()
            if not existing_streak:
                s = Streak(
                    user_id=user.id,
                    current_streak=streak_days,
                    longest_streak=streak_days,
                    last_activity_date=datetime.utcnow()
                )
                db.add(s)
        db.commit()
        print("[OK] Streaks seeded: Amara=5 days, Brice=12 days")

        print("\n-- Seeding Badges for Test Users --------")
        # Give Amara "First Step" badge, Brice "Week Warrior"
        amara_badge = badge_objects.get("First Step")
        brice_badge = badge_objects.get("Week Warrior")

        for user, badge in [(amara, amara_badge), (brice, brice_badge)]:
            if badge:
                existing_ub = db.exec(
                    select(UserBadge).where(
                        UserBadge.user_id == user.id,
                        UserBadge.badge_id == badge.id
                    )
                ).first()
                if not existing_ub:
                    db.add(UserBadge(user_id=user.id, badge_id=badge.id))

        db.commit()
        print("[OK] Badges awarded to test users")

        print("\n================================================")
        print("  SEEDING COMPLETE")
        print("------------------------------------------------")
        print("  Test Account 1: amara@test.cm / Test1234!  (O-Level)")
        print("  Test Account 2: brice@test.cm / Test1234!  (A-Level)")
        print("================================================\n")


if __name__ == "__main__":
    seed()
