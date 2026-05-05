#!/bin/sh
set -e

echo "🚀 Iniciando aplicación..."

# Generar .env desde variables de entorno de Render
cat > /var/www/html/.env <<EOF
APP_NAME=Geriatrico
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}

LOG_CHANNEL=stderr

DB_CONNECTION=pgsql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=sync
EOF

echo "⏳ Esperando a la base de datos..."

RETRIES=20
COUNT=0
until php -r "
try {
    \$host = getenv('DB_HOST');
    \$port = getenv('DB_PORT') ?: '5432';
    \$db   = getenv('DB_DATABASE');
    \$user = getenv('DB_USERNAME');
    echo 'Conectando: pgsql:host=' . \$host . ';port=' . \$port . ';dbname=' . \$db . ' user=' . \$user . PHP_EOL;
    new PDO('pgsql:host=' . \$host . ';port=' . \$port . ';dbname=' . \$db, \$user, getenv('DB_PASSWORD'));
    echo 'DB OK';
} catch (Exception \$e) {
    echo 'Error: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
"; do
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$RETRIES" ]; then
    echo "❌ DB no disponible después de $RETRIES intentos. Abortando."
    exit 1
  fi
  echo "⏳ DB no lista, reintentando ($COUNT/$RETRIES)..."
  sleep 5
done

echo "✅ Base de datos lista"

# Cache (opcional pero recomendado)
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Migraciones
echo "📦 Ejecutando migraciones..."
php artisan migrate --force

# Seeders (opcional en producción, ojo con duplicados)
echo "🌱 Ejecutando seeders..."
php artisan db:seed --force || true

echo "🔥 Iniciando Apache..."
exec apache2-foreground