## Base Identity & Reputation

Простой MVP-проект для сети Base: on-chain identity + reputation.

### Идея

- Регистрация on-chain профиля по адресу кошелька.
- Метаданные профиля (строка / ссылка / IPFS-URL).
- Выдача репутации другим адресам (upvote) с ограничением.
- Просмотр суммарной репутации адреса через контракт и простой фронтенд.

### Структура

- `contracts/` — смарт-контракты и Hardhat-конфигурация.
- `frontend/` — React + Vite фронтенд.

### Контракты: настройка и деплой

1. Перейти в директорию контрактов:

   ```bash
   cd contracts
   npm install
   ```

2. Создать файл `.env` со значениями для Base Sepolia:

   ```bash
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   PRIVATE_KEY=0xВАШ_ПРИВАТНЫЙ_КЛЮЧ
   ```

   Приватный ключ — от аккаунта, из которого вы будете деплоить контракт (без кавычек).

3. Скомпилировать контракт:

   ```bash
   npx hardhat compile
   ```

4. Задеплоить контракт в Base Sepolia:

   ```bash
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```

   В консоли появится адрес контракта вида:

   ```text
   BaseIdentityReputation deployed to: 0x...
   ```

   Скопируйте этот адрес — он понадобится фронтенду.

### Фронтенд: настройка и запуск

1. Перейти в директорию фронтенда:

   ```bash
   cd ../frontend
   npm install
   ```

2. Создать файл `.env` (рядом с `package.json`) со следующими переменными:

   ```bash
   VITE_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   VITE_IDENTITY_CONTRACT_ADDRESS=0xАДРЕС_ВАШЕГО_КОНТРАКТА
   ```

3. Запустить dev-сервер:

   ```bash
   npm run dev
   ```

4. Открыть указанный в консоли адрес (обычно `http://localhost:5173`) и:
   - подключить кошелёк (MetaMask) к сети **Base Sepolia (chainId 84532)**;
   - зарегистрировать профиль (metadata URI — любая строка/URL/IPFS-ссылка);
   - при желании выдать репутацию другим адресам.

После деплоя не забудь скопировать адрес контракта в переменную `VITE_IDENTITY_CONTRACT_ADDRESS` во фронтенде.


