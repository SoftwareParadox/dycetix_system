#!/bin/bash
set -e

echo "=== Running customer migrations ==="
cd customer
python manage.py migrate --noinput

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== Starting Gunicorn for customer ==="
gunicorn dycetix_project.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
