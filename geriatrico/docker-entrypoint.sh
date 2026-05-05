#!/bin/sh
set -e

echo "🚀 Iniciando aplicación..."

echo "⏳ Esperando a la base de datos..."

RETRIES=20
COUNT=0
until php -r "
try {
    new PDO(
        'mysql:host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    echo 'DB OK';
} catch (Exception \$e) {
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