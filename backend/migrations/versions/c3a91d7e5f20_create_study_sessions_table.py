"""create_study_sessions_table

Revision ID: c3a91d7e5f20
Revises: 70cd8f5e4e31
Create Date: 2026-10-19 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3a91d7e5f20'
down_revision: Union[str, Sequence[str], None] = '70cd8f5e4e31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'study_sessions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('host_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False, index=True),
        sa.Column('buddy_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False, index=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('skill_tag', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('starts_at', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('ends_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            'status',
            sa.Enum('SCHEDULED', 'CANCELLED', name='studysessionstatus'),
            nullable=False,
            server_default='SCHEDULED',
        ),
        sa.Column('room_id', sa.String(), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('study_sessions')
    sa.Enum(name='studysessionstatus').drop(op.get_bind(), checkfirst=True)
