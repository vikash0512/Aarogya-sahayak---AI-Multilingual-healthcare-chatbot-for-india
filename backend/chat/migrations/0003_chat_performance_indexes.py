# Generated manually for performance indexes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_alter_chatmessage_sender'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chatsession',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name='chatmessage',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AddIndex(
            model_name='chatsession',
            index=models.Index(fields=['user', '-created_at'], name='chat_sess_user_created_idx'),
        ),
        migrations.AddIndex(
            model_name='chatsession',
            index=models.Index(fields=['is_active', '-created_at'], name='chat_sess_active_created_idx'),
        ),
        migrations.AddIndex(
            model_name='chatmessage',
            index=models.Index(fields=['session', '-timestamp'], name='chat_msg_sess_time_idx'),
        ),
        migrations.AddIndex(
            model_name='chatmessage',
            index=models.Index(fields=['sender', '-timestamp'], name='chat_msg_sender_time_idx'),
        ),
    ]
