# FROM python:3.11-slim

# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     gcc \
#     postgresql-client \
#     && rm -rf /var/lib/apt/lists/*

# # Install Python dependencies
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy only admin app for now (we'll add customer later)
# COPY admin/ /app/admin/
# COPY customer/ /app/customer/

# # Set Python path
# ENV PYTHONPATH=/app

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Create staticfiles directories
RUN mkdir -p /app/admin/staticfiles /app/customer/staticfiles

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health/ || exit 1

# Create non-root user
RUN useradd -m -u 1001 railway
RUN chown -R railway:railway /app
USER railway

EXPOSE $PORT

CMD ["bash", "-c", "echo 'Container started. Use Railway services.' && sleep infinity"]