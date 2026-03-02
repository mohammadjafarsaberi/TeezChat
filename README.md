### TeezChat

TeezChat is a realtime chat starter built on **Laravel 12**, **Inertia**, and **React**, designed as a modern baseline for building interactive applications.

## Tech stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 with Inertia
- **Styling**: Tailwind CSS
- **Database**: SQLite (default, via `database/database.sqlite`)
- **Tooling**: Vite, ESLint, Prettier, Laravel Pint, PHPUnit

## Requirements

- **PHP**: 8.2 or higher
- **Composer**
- **Node.js**: 20+ (recommended)
- **npm**

## Installation

- **Clone the repository**:

```bash
git clone <your-repo-url> teezChat
cd teezChat
```

- **Install PHP dependencies**:

```bash
composer install
```

- **Install JS dependencies**:

```bash
npm install
```

## Environment configuration

1. **Create your environment file**:

   - Create a new file named `.env` in the project root.
   - Copy the contents from `.env.example` (see template below) into `.env`.

2. **Generate the application key**:

```bash
php artisan key:generate
```

3. **Ensure the SQLite database file exists**:

```bash
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate
```

### Suggested `.env.example` template

Create a file named `.env.example` with content similar to:

```bash
APP_NAME=TeezChat
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

CACHE_STORE=database
QUEUE_CONNECTION=database

SESSION_DRIVER=database
SESSION_LIFETIME=120

SESSION_ENCRYPT=false
SESSION_EXPIRE_ON_CLOSE=false

FILESYSTEM_DISK=local

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

You can customize mail, Redis, and other service credentials as needed for your environment.

## Running the application

- **Local development** (Laravel server + queue + Vite):

```bash
composer dev
```

This runs the PHP server, a queue worker, and the Vite dev server concurrently.

## Testing and quality

- **Run the test suite**:

```bash
php artisan test
```

- **PHP code style check (Pint)**:

```bash
composer lint:check
```

Refer to `package.json` and `composer.json` for additional scripts such as linting, formatting, and CI checks.

