# admin/management/commands/wait_for_db.py - SIMPLIFIED
import time
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError

class Command(BaseCommand):
    """Django command to pause execution until database is available"""
    
    def handle(self, *args, **options):
        self.stdout.write('Waiting for database...')
        db_conn = None
        attempts = 0
        max_attempts = 30
        
        while attempts < max_attempts:
            try:
                db_conn = connections['default']
                with db_conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                self.stdout.write(self.style.SUCCESS('✓ Database available!'))
                return
            except OperationalError:
                attempts += 1
                self.stdout.write(f'Database unavailable, attempt {attempts}/{max_attempts}...')
                time.sleep(1)
        
        self.stdout.write(self.style.ERROR('✗ Database unavailable after timeout!'))
        exit(1)