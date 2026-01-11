#!/bin/bash
set -e

echo "=== Running admin migrations ==="
cd admin
python manage.py migrate --noinput

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== Starting Gunicorn for admin ==="
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
