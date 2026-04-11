from sqlalchemy.orm import Session
from app.models.notification import Notification

def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    message: str,
    link: str = None
):
    """Utility to create a notification for a user."""
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def notify_all_students(
    db: Session,
    type: str,
    title: str,
    message: str,
    link: str = None
):
    """Utility to notify all students."""
    from app.models.user import User
    students = db.query(User).filter(User.role == "student").all()
    for student in students:
        notif = Notification(
            user_id=student.id,
            type=type,
            title=title,
            message=message,
            link=link
        )
        db.add(notif)
    db.commit()
