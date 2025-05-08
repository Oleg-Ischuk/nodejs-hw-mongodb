# nodejs-hw-mongodb

Цей репозиторій містить Node.js додаток з інтеграцією MongoDB.

## Передумови

Перед початком роботи переконайтеся, що у вас встановлено:
- [Node.js](https://nodejs.org/) (рекомендовано v14 або вище)
- [MongoDB](https://www.mongodb.com/try/download/community) (локальна установка або доступ до MongoDB Atlas)
- [Git](https://git-scm.com/downloads)

## Встановлення

1. Клонуйте репозиторій:
```bash
git clone https://github.com/Oleg-Ischuk/nodejs-hw-mongodb.git
```

2. Перейдіть до директорії проекту:
```bash
cd nodejs-hw-mongodb
```

3. Перейдіть на гілку hw2-mongodb:
```bash
git checkout hw2-mongodb
```

4. Встановіть залежності:
```bash
npm install
```

5. Створіть файл змінних середовища:
```bash
cp .env.example .env
```

6. Налаштуйте ваш файл `.env` з рядком підключення до MongoDB та іншими необхідними змінними середовища:
```
PORT=3000
MONGODB_USER=<your_username>
MONGODB_PASSWORD=<your_password>
MONGODB_URL=<your_url>
MONGODB_DB=<your_dbname>
```

## Запуск сервера

Для запуску сервера розробки:

```bash
npm run dev
```

Для запуску в режимі продакшн:

```bash
npm start
```

## Структура проекту

- `/src` - Директорія з вихідним кодом
- `.editorconfig` - Конфігурація редактора для узгодженого стилю кодування
- `.env.example` - Приклад змінних середовища
- `.gitignore` - Визначає файли, які ігноруються Git
- `.prettierrc` - Конфігурація Prettier для форматування коду
- `eslint.config.mjs` - Конфігурація ESLint для перевірки коду
- `package.json` - Метадані проекту та залежності
- `package-lock.json` - Точні версії залежностей

## Доступні скрипти

- `npm start` - Запускає додаток у режимі продакшн
- `npm run dev` - Запускає додаток у режимі розробки з гарячим перезавантаженням
