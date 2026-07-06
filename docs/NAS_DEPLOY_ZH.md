# Libre Closet NAS 部署说明

这份说明面向个人 NAS 使用场景，默认使用 SQLite 数据库和本地文件存储。它适合 Synology、QNAP、Unraid、TrueNAS、CasaOS、Portainer 等常见环境。

## 推荐方式

使用仓库里的 `docker-compose.nas.yml`：

```bash
docker compose -f docker-compose.nas.yml up -d
```

启动后打开：

```text
http://你的NAS局域网IP:3000
```

## 首次使用前建议修改

打开 `env.nas.example`，至少修改下面两项：

```env
APP_NAME=My Closet
ACCESS_TOKEN_SECRET=ChangeThisToALongRandomSecret
```

如果你准备用域名或反向代理访问，也建议设置：

```env
SITE_URL=https://closet.example.com
```

## 数据保存位置

默认 compose 会创建一个 Docker volume：

```text
librecloset_data
```

应用数据库、上传图片和日志都会放在容器内的 `/app/data`，并由这个 volume 持久化保存。

## 账号和注册

当前 NAS 示例默认不启用登录，适合只在个人 NAS 或受信任访问链接中使用：

```env
AUTH_ENABLED=false
```

如果以后你仍然想开启一个简单账号，可以改成：

```env
AUTH_ENABLED=true
DISABLE_REGISTRATION=false
```

然后重启容器：

```bash
docker compose -f docker-compose.nas.yml up -d
```

## 发布自己的镜像

这个 fork 已经配置为可以发布到 GitHub Container Registry：

```text
ghcr.io/kimo2411/libre-closet:latest
```

通常流程是：

1. 修改代码并推送到 GitHub。
2. 在 GitHub Actions 里运行 Docker Publish。
3. NAS 继续使用 `docker-compose.nas.yml` 拉取你的镜像。

如果你的 GitHub Packages 默认是私有包，需要在 GitHub 仓库的 Packages 设置里把镜像改成 public，或者在 NAS 上登录 GitHub 容器镜像仓库。

## 后续升级

在 NAS 上执行：

```bash
docker compose -f docker-compose.nas.yml pull
docker compose -f docker-compose.nas.yml up -d
```

升级前建议先备份 Docker volume 或 NAS 上映射出来的数据目录。
