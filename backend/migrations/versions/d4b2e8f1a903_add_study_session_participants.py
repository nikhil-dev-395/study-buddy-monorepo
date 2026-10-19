"""add_study_session_participants

Group sessions: move the single buddy_id onto a participants table so a
session can have several invitees.

Revision ID: d4b2e8f1a903
Revises: c3a91d7e5f20
Create Date: 2026-10-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4b2e8f1a903'
down_revision: Union[str, Sequence[str], None] = 'c3a91d7e5f20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # The app's startup create_all() may have created this table already.
    if not sa.inspect(op.get_bind()).has_table('study_session_participants'):
        op.create_table(
            'study_session_participants',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('session_id', sa.Integer(), sa.ForeignKey('study_sessions.id', ondelete='CASCADE'), nullable=False, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False, index=True),
            sa.Column('invited_by', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.UniqueConstraint('session_id', 'user_id', name='uq_session_participant'),
        )
    # Carry existing 1:1 sessions over before dropping the old column.
    op.execute(
        "INSERT INTO study_session_participants (session_id, user_id, invited_by, created_at) "
        "SELECT id, buddy_id, host_id, now() FROM study_sessions"
    )
    op.drop_column('study_sessions', 'buddy_id')


def downgrade() -> None:
    """Downgrade schema (keeps the first participant of each session)."""
    op.add_column('study_sessions', sa.Column('buddy_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=True, index=True))
    op.execute(
        "UPDATE study_sessions s SET buddy_id = p.user_id FROM ("
        "  SELECT DISTINCT ON (session_id) session_id, user_id FROM study_session_participants ORDER BY session_id, id"
        ") p WHERE p.session_id = s.id"
    )
    op.drop_table('study_session_participants')
