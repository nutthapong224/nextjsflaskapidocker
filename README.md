# nextjsfastapikube

This repo contains a minimal example with:

- frontend/ — Next.js app (Dockerized)
- backend/ — Flask API (Dockerized)
- Postgres database
- docker-compose.yaml to run all services together

Quick start

1. Ensure Docker & docker-compose are installed.
2. From the repo root run:

   docker compose up --build

3. Visit http://localhost:3000 to view the Next.js app. It calls the backend at http://localhost:5000 (internal network name `backend`).

Troubleshooting

- If the frontend shows backend connection errors, check container logs:

  docker compose logs backend
  docker compose logs frontend
  docker compose logs db

- Database persistence is in a named volume `db-data`.

- คำสั่ง ลง docker
<!-- ```bash
sudo apt update
sudo apt install software-properties-common -y
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt install ansible -y

``` -->
```
# ติดตั้ง Dependencies
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# เพิ่ม Docker's Official GPG Key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# เพิ่ม Repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# ติดตั้ง Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# เปิดใช้งาน Service
sudo systemctl enable --now docker

```
-คำสั่ง clone และเข้าไปยัง folder ของ repository
```bash
git clone https://github.com/nutthapong224/nextjsflaskapidocker.git 
cd nextjsflaskapidocker

```
-ใช้งาน ansible

<!-- ```
ansible-playbook docker-install.yml

``` -->
-แก้ไข .env  แก้  TUNNEL_TOKEN ใส่ token ใน cloudflare
```
nano .env 
```
-คำสั่งรัน
```
docker compose up -d --build
```
Environment notes

- The frontend reads `NEXT_PUBLIC_API_URL` to locate the backend. When running with Docker Compose the value is set to `http://backend:5000` so the frontend can call the backend by service name.
- The backend uses the `DATABASE_URL` env var (set in `docker-compose.yaml`) to connect to Postgres.

Testing the CRUD API (examples)

Once the stack is up (docker compose up --build) you can test the API with these examples from your host:

Create an item:

```bash
curl -X POST -H "Content-Type: application/json" \
  http://localhost:5000/items -d '{"name":"My Item"}'
```

List items:

```bash
curl http://localhost:5000/items
```

Get single item (id 1):

```bash
curl http://localhost:5000/items/1
```

Update item:

```bash
curl -X PUT -H "Content-Type: application/json" \
  http://localhost:5000/items/1 -d '{"name":"Updated"}'
```

Delete item:

```bash
curl -X DELETE http://localhost:5000/items/1
```

Project structure & DB seeding

- Backend is split into small modules: `backend/db.py`, `backend/models.py`, `backend/crud.py`, and `backend/app.py` (routes). This keeps DB access and business logic separated.
- On startup the backend will create tables if missing and run a small seed (inserting two sample items) if the `items` table is empty. That is handled by `backend/seed.py` called from `app.py`.

Frontend multi-stage (nginx)

- The frontend `Dockerfile` uses a multi-stage build: it builds the Next.js app in a Node builder stage, then copies artifacts into an `nginx`-based runner image.
- `frontend/nginx.conf` proxies requests for static assets and `_next` to the local Next.js server started inside the container. The container runs both `nginx` and `npm start` so nginx can act as a reverse-proxy.

Cloudflare Tunnel (optional)

- A `cloudflared` service was added to `docker-compose.yaml` as a placeholder. To expose your local app over Cloudflare Tunnel, you'll need to provide tunnel credentials or a tunnel token. Two common ways:
  1. Create a tunnel on Cloudflare, download the credentials file, mount it into the container and run `tunnel run`.
  2. Use the tunnel token as an environment variable and run `tunnel run --token <TOKEN>`.

Example (host machine):

```bash
# using a token (not recommended to check into git)
export CLOUDFLARE_TUNNEL_TOKEN=__YOUR_TOKEN__
docker compose up --build
```

Or mount credentials:

```bash
mkdir -p cloudflared
# put credentials.yml from Cloudflare in cloudflared/
docker compose up --build
```

Be careful not to commit secrets to the repository.


