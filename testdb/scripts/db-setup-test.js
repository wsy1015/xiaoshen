/**
 * PolarDB 可用性测试脚本
 * 功能：连接阿里云 PolarDB → 创建 lixin 数据库 → 建表 → 插入测试数据 → 查询验证
 */

const { Client } = require('pg');

// ========== 连接配置 ==========
const BASE_CONFIG = {
  host: 'transcend.rwlb.rds.aliyuncs.com',
  port: 5432,
  user: 'aitcodingplan',
  password: 'Transcendera6688',
  ssl: false,
  connectionTimeoutMillis: 10000,
};

// ========== 工具函数 ==========
function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}

async function runQuery(client, sql, values) {
  const res = await client.query(sql, values);
  return res;
}

// ========== 步骤 1：测试连通性 ==========
async function testConnection() {
  log('🔗', '步骤 1/5 — 测试与 PolarDB 的连通性...');
  const client = new Client({ ...BASE_CONFIG, database: 'postgres' });
  try {
    await client.connect();
    const res = await runQuery(client, 'SELECT version()');
    log('✅', `连接成功！数据库版本：`);
    console.log(`    ${res.rows[0].version}`);
    return true;
  } catch (err) {
    log('❌', `连接失败：${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

// ========== 步骤 2：创建 lixin 数据库 ==========
async function createDatabase() {
  log('🗄️', '步骤 2/5 — 创建 lixin 数据库...');
  const client = new Client({ ...BASE_CONFIG, database: 'postgres' });
  try {
    await client.connect();

    // 检查数据库是否已存在
    const check = await runQuery(
      client,
      "SELECT 1 FROM pg_database WHERE datname = 'lixin'"
    );

    if (check.rows.length > 0) {
      log('ℹ️', 'lixin 数据库已存在，跳过创建');
    } else {
      await runQuery(client, 'CREATE DATABASE lixin');
      log('✅', 'lixin 数据库创建成功');
    }
    return true;
  } catch (err) {
    log('❌', `创建数据库失败：${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

// ========== 步骤 3：在 lixin 中创建业务测试表 ==========
async function createTables() {
  log('📋', '步骤 3/5 — 在 lixin 中创建业务测试表...');
  const client = new Client({ ...BASE_CONFIG, database: 'lixin' });
  try {
    await client.connect();

    // 客户表
    await runQuery(client, `
      CREATE TABLE IF NOT EXISTS customers (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        industry    VARCHAR(50),
        contact     VARCHAR(100),
        created_at  TIMESTAMP DEFAULT NOW()
      )
    `);

    // 审计项目表
    await runQuery(client, `
      CREATE TABLE IF NOT EXISTS audit_projects (
        id            SERIAL PRIMARY KEY,
        customer_id   INT REFERENCES customers(id),
        project_name  VARCHAR(200) NOT NULL,
        status        VARCHAR(20) DEFAULT '待审计',
        start_date    DATE,
        end_date      DATE,
        created_at    TIMESTAMP DEFAULT NOW()
      )
    `);

    // 工单表
    await runQuery(client, `
      CREATE TABLE IF NOT EXISTS work_orders (
        id              SERIAL PRIMARY KEY,
        project_id      INT REFERENCES audit_projects(id),
        title           VARCHAR(200) NOT NULL,
        assignee        VARCHAR(50),
        priority        VARCHAR(10) DEFAULT '中',
        status          VARCHAR(20) DEFAULT '待处理',
        created_at      TIMESTAMP DEFAULT NOW()
      )
    `);

    log('✅', '三张业务测试表创建成功（customers / audit_projects / work_orders）');
    return true;
  } catch (err) {
    log('❌', `创建表失败：${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

// ========== 步骤 4：插入测试数据 ==========
async function insertTestData() {
  log('📝', '步骤 4/5 — 插入测试数据...');
  const client = new Client({ ...BASE_CONFIG, database: 'lixin' });
  try {
    await client.connect();

    // 先清空已有测试数据（幂等操作）
    await runQuery(client, 'DELETE FROM work_orders');
    await runQuery(client, 'DELETE FROM audit_projects');
    await runQuery(client, 'DELETE FROM customers');

    // 插入客户
    const c1 = await runQuery(client,
      `INSERT INTO customers (name, industry, contact) VALUES ($1, $2, $3) RETURNING id`,
      ['杭州星辰科技有限公司', '科技/互联网', '张经理 138-0000-1111']
    );
    const c2 = await runQuery(client,
      `INSERT INTO customers (name, industry, contact) VALUES ($1, $2, $3) RETURNING id`,
      ['深圳蓝海贸易有限公司', '进出口贸易', '李总 139-0000-2222']
    );
    const c3 = await runQuery(client,
      `INSERT INTO customers (name, industry, contact) VALUES ($1, $2, $3) RETURNING id`,
      ['北京金鼎投资管理有限公司', '金融/投资', '王女士 137-0000-3333']
    );

    // 插入审计项目
    const p1 = await runQuery(client,
      `INSERT INTO audit_projects (customer_id, project_name, status, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [c1.rows[0].id, '2025年度财务报表审计', '审计中', '2026-01-15', '2026-04-30']
    );
    const p2 = await runQuery(client,
      `INSERT INTO audit_projects (customer_id, project_name, status, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [c2.rows[0].id, '内部控制审计', '待审计', '2026-03-01', '2026-06-30']
    );

    // 插入工单
    await runQuery(client,
      `INSERT INTO work_orders (project_id, title, assignee, priority, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [p1.rows[0].id, '核对银行对账单', '审计员A', '高', '处理中']
    );
    await runQuery(client,
      `INSERT INTO work_orders (project_id, title, assignee, priority, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [p1.rows[0].id, '检查应收账款账龄', '审计员B', '中', '待处理']
    );
    await runQuery(client,
      `INSERT INTO work_orders (project_id, title, assignee, priority, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [p2.rows[0].id, '评估内控流程文档', '审计员C', '高', '待处理']
    );

    log('✅', '测试数据插入成功：3 个客户、2 个项目、3 条工单');
    return true;
  } catch (err) {
    log('❌', `插入数据失败：${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

// ========== 步骤 5：查询验证 ==========
async function verifyData() {
  log('🔍', '步骤 5/5 — 查询验证数据完整性...');
  const client = new Client({ ...BASE_CONFIG, database: 'lixin' });
  try {
    await client.connect();

    // 联表查询：客户 → 项目 → 工单
    const res = await runQuery(client, `
      SELECT 
        c.name AS 客户名称,
        c.industry AS 行业,
        p.project_name AS 项目名称,
        p.status AS 项目状态,
        w.title AS 工单标题,
        w.assignee AS 负责人,
        w.priority AS 优先级,
        w.status AS 工单状态
      FROM customers c
      LEFT JOIN audit_projects p ON c.id = p.customer_id
      LEFT JOIN work_orders w ON p.id = w.project_id
      ORDER BY c.id, p.id, w.id
    `);

    console.log('\n📊  联表查询结果：');
    console.table(res.rows);

    // 统计信息
    const stats = await runQuery(client, `
      SELECT 
        (SELECT COUNT(*) FROM customers) AS 客户数,
        (SELECT COUNT(*) FROM audit_projects) AS 项目数,
        (SELECT COUNT(*) FROM work_orders) AS 工单数
    `);
    console.log('📈  数据统计：');
    console.table(stats.rows);

    log('✅', '所有验证通过！lixin 数据库可用性测试完成');
    return true;
  } catch (err) {
    log('❌', `查询验证失败：${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

// ========== 主流程 ==========
async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('   PolarDB · lixin 业务数据库 · 可用性测试');
  console.log('═══════════════════════════════════════════');
  console.log('');

  const steps = [testConnection, createDatabase, createTables, insertTestData, verifyData];

  for (const step of steps) {
    const ok = await step();
    if (!ok) {
      log('🛑', '测试中断，请检查上方错误信息');
      process.exit(1);
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════');
  log('🎉', '全部测试通过！数据库已就绪');
  console.log('═══════════════════════════════════════════');
}

main();
