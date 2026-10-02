"""create_messages_table

Revision ID: 70cd8f5e4e31
Revises: b6d74aff7b8b
Create Date: 2026-10-01 23:34:08.252476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '70cd8f5e4e31'
down_revision: Union[str, Sequence[str], None] = 'b6d74aff7b8b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('sender_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False, index=True),
        sa.Column('receiver_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False, index=True),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_messages_sender_receiver', 'messages', ['sender_id', 'receiver_id'])
    op.create_index('ix_messages_receiver_sender', 'messages', ['receiver_id', 'sender_id'])

    # Best-effort: enable Supabase Realtime + a permissive RLS policy on this table.
    # Safe no-ops on a plain (non-Supabase) Postgres instance.
    conn = op.get_bind()
    statements = [
        "ALTER TABLE messages ENABLE ROW LEVEL SECURITY;",
        "CREATE POLICY messages_select_all ON messages FOR SELECT USING (true);",
        "CREATE POLICY messages_insert_all ON messages FOR INSERT WITH CHECK (true);",
        "GRANT SELECT, INSERT ON messages TO anon, authenticated;",
        "GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO anon, authenticated;",
        "ALTER PUBLICATION supabase_realtime ADD TABLE messages;",
    ]
    for stmt in statements:
        savepoint = conn.begin_nested()
        try:
            conn.execute(sa.text(stmt))
            savepoint.commit()
        except Exception:
            savepoint.rollback()


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_messages_receiver_sender', table_name='messages')
    op.drop_index('ix_messages_sender_receiver', table_name='messages')
    op.drop_table('messages')
