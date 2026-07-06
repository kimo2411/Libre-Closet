# 家庭衣物相册

这是一个适合个人 NAS 使用的家庭衣物位置相册。它不是复杂的穿搭管理软件，而是用最简单的方式记录“衣服照片”和“衣服放在哪里”。

你可以先创建多个存储位置，例如主卧衣柜、玄关收纳箱、儿童房抽屉、换季衣物箱。然后点进某个位置，批量上传衣物照片。以后在手机或电脑上打开网页，就能快速查看家里有哪些衣物，以及它们放在哪。

## 功能

- 中文界面
- 无需登录，适合个人 NAS 私有使用
- 创建衣物存储位置
- 每个位置可以上传一张位置封面图
- 每个位置可以批量上传衣物照片
- 支持手机、平板、电脑浏览器访问
- 默认使用 SQLite 和本地文件存储
- Docker 部署，适合群晖、威联通、Unraid、TrueNAS、CasaOS、Portainer 等环境

## 推荐端口

默认外部访问端口改为：

```text
32180
```

容器内部仍然使用 `3000`，NAS 或路由器只需要放行外部端口 `32180`。访问地址通常是：

```text
http://你的NAS局域网IP:32180
```

例如：

```text
http://192.168.1.20:32180
```

## 方式一：Docker Compose 安装

在 NAS 的 Docker、Container Manager、Portainer、CasaOS 或类似面板里，新建一个 `docker-compose.yml`，粘贴下面这一整段：

```yaml
services:
  closet-album:
    image: ghcr.io/kimo2411/libre-closet:latest
    container_name: closet-album
    ports:
      - "32180:3000"
    environment:
      APP_NAME: 家庭衣物相册
      AUTH_ENABLED: "false"
      DISABLE_REGISTRATION: "true"
      PWA_ENABLED: "false"
      DATA_PATH: /app/data
      DATABASE_TYPE: sqlite
      FILE_STORAGE_TYPE: local
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

启动后访问：

```text
http://你的NAS局域网IP:32180
```

## 方式二：SSH 一键安装

如果你习惯 SSH 登录 NAS，可以复制下面整段命令，一次性粘贴执行：

```bash
mkdir -p ~/docker/closet-album && cd ~/docker/closet-album && cat > docker-compose.yml <<'EOF'
services:
  closet-album:
    image: ghcr.io/kimo2411/libre-closet:latest
    container_name: closet-album
    ports:
      - "32180:3000"
    environment:
      APP_NAME: 家庭衣物相册
      AUTH_ENABLED: "false"
      DISABLE_REGISTRATION: "true"
      PWA_ENABLED: "false"
      DATA_PATH: /app/data
      DATABASE_TYPE: sqlite
      FILE_STORAGE_TYPE: local
    volumes:
      - ./data:/app/data
    restart: unless-stopped
EOF
docker compose pull && docker compose up -d
```

安装完成后打开：

```text
http://你的NAS局域网IP:32180
```

## 使用方法

1. 打开网页后，点击“新增位置”。
2. 填写位置名称，例如“主卧衣柜左侧”。
3. 可选上传一张位置照片。
4. 保存后点进这个位置。
5. 点击“上传衣物照片”，一次选择多张图片上传。
6. 以后按位置查看照片，就能知道衣物放在哪里。

## 数据保存在哪里

默认数据会保存在 compose 文件同目录下的：

```text
./data
```

里面会保存 SQLite 数据库、上传图片和日志。迁移或备份时，优先备份这个 `data` 文件夹。

## 升级

进入 `docker-compose.yml` 所在目录，执行：

```bash
docker compose pull && docker compose up -d
```

升级前建议先备份 `data` 文件夹。

## 如果提示 denied

如果安装时看到类似下面的错误：

```text
Head "https://ghcr.io/v2/kimo2411/libre-closet/manifests/latest": denied
```

说明 GitHub 容器镜像还没有公开可拉取。处理方式：

1. 打开 GitHub 仓库的 `Actions` 页面，确认 `Docker Publish` 已经运行成功。
2. 打开仓库右侧或个人主页里的 `Packages`，找到 `libre-closet`。
3. 如果 package 是 private，把 visibility 改成 public。
4. 等 1 到 3 分钟后，在 NAS 上重新执行：

```bash
docker compose pull && docker compose up -d
```

以后 main 分支更新后会自动重新构建 `latest` 镜像。

## 换端口

如果 `32180` 和你的其它应用冲突，可以把 compose 里的这一行：

```yaml
- "32180:3000"
```

改成其它端口，例如：

```yaml
- "32280:3000"
```

然后访问：

```text
http://你的NAS局域网IP:32280
```

## 是否需要账号密码

默认不需要账号密码，更适合个人 NAS 私有使用。

如果你准备公网访问，建议优先用 NAS 自带的反向代理、访问控制、VPN、Cloudflare Zero Trust、Tailscale、WireGuard 等方式保护入口。

## 开发说明

本项目基于 Libre Closet fork 改造，当前主线已经简化为个人衣物位置相册：

- 运行时只保留 SQLite、本地图片、位置相册等核心能力
- Docker 生产镜像使用 `npm ci --omit=dev`，减少不必要依赖
- 旧穿搭、日历、邮件、S3、背景抠除、PWA 安装脚本等不再作为主功能使用

本地开发：

```bash
npm install
npm run build
npm test -- --runInBand
```

## 许可证

本项目继承原项目许可证：AGPL-3.0。
