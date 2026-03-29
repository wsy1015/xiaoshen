"""
PolarDB 基础连接测试脚本（已废弃，请改用 full-test.py）
─────────────────────────────────────────────────────
推荐用法：
  cd testdb
  /Users/wenshaoyang/miniforge3/bin/python3.10 scripts/full-test.py

已知 PolarDB 连接限制（本脚本已修正）：
  - 必须加 sslmode='disable'（不然 psycopg2 SSL 握手会导致连接关闭）
  - 不能设 application_name 参数
  - 不能调用 pg_extension / pgcrypto 等需要特权的函数
"""

import os
import subprocess
import sys
import venv

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENV_PATH = os.path.join(ROOT_DIR, '.env')
VENV_DIR = os.path.join(ROOT_DIR, '.venv-db-test')
IS_WINDOWS = os.name == 'nt'
VENV_PYTHON = os.path.join(
    VENV_DIR,
    'Scripts' if IS_WINDOWS else 'bin',
    'python.exe' if IS_WINDOWS else 'python',
)


# ========== 读取 .env 配置 ==========
def load_env():
    if not os.path.exists(ENV_PATH):
        print('❌ 未找到 .env 文件，请在项目根目录创建')
        sys.exit(1)

    with open(ENV_PATH, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip()


def ensure_driver():
    try:
        import psycopg2  # type: ignore
        return psycopg2
    except ImportError:
        pass

    # 第一次缺少驱动时，自动在项目目录创建虚拟环境并重启脚本。
    if os.environ.get('DB_TEST_BOOTSTRAPPED') == '1':
        print('❌ 已尝试自动安装 psycopg2-binary，但仍然失败。')
        print('请把终端完整报错发给我，我继续帮你处理。')
        sys.exit(1)

    print('⏳ 未检测到 psycopg2，正在创建本地虚拟环境...')
    if not os.path.exists(VENV_PYTHON):
        venv.EnvBuilder(with_pip=True).create(VENV_DIR)

    print('📦 正在安装 psycopg2-binary 到项目虚拟环境...')
    subprocess.run(
        [VENV_PYTHON, '-m', 'pip', 'install', 'psycopg2-binary'],
        check=True,
    )

    print('🔁 安装完成，正在重新启动测试脚本...')
    new_env = os.environ.copy()
    new_env['DB_TEST_BOOTSTRAPPED'] = '1'
    os.execve(VENV_PYTHON, [VENV_PYTHON, __file__], new_env)


load_env()

CONFIG = {
    'host': os.environ.get('DB_HOST'),
    'port': os.environ.get('DB_PORT', '5432'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'dbname': os.environ.get('DB_NAME', 'lixin'),
}

psycopg2 = ensure_driver()

# ========== 连接测试 ==========
def test():
    print()
    print('═' * 45)
    print('   PolarDB 连接测试')
    print('═' * 45)
    print()
    print(f'🔗 目标：{CONFIG["host"]}:{CONFIG["port"]}')
    print(f'👤 用户：{CONFIG["user"]}')
    print(f'🗄️  数据库：{CONFIG["dbname"]}')
    print()

    try:
        conn = psycopg2.connect(
            host=CONFIG['host'],
            port=CONFIG['port'],
            user=CONFIG['user'],
            password=CONFIG['password'],
            dbname=CONFIG['dbname'],
            connect_timeout=10,
        )
        cur = conn.cursor()

        cur.execute('SELECT version()')
        version = cur.fetchone()[0]
        print(f'✅ 连接成功！')
        print(f'📦 版本：{version}')
        print()

        # 列出所有表
        cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
        tables = [row[0] for row in cur.fetchall()]
        if tables:
            print(f'📋 表：{", ".join(tables)}')
        else:
            print('📋 当前库中没有表')

        cur.close()
        conn.close()
        print()
        print('🎉 测试通过！')

    except psycopg2.OperationalError as e:
        print(f'❌ 连接失败：{e}')
        print()
        print('💡 请检查：')
        print('   1. .env 中的 DB_PASSWORD 是否正确')
        print('   2. 阿里云白名单是否放通了你的 IP')
        print('   3. PolarDB 实例是否正在运行')

    print()
    print('═' * 45)

if __name__ == '__main__':
    test()
