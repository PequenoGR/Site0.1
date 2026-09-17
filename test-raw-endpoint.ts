/**
 * Automated Verification Test Suite for LuauRaw /raw/:id Endpoint
 * Tests all requirements:
 * 1. GET /raw/:id existente público retorna 200 OK com text/plain e o código correto
 * 2. GET /raw/:id inexistente retorna 404 com text/plain e "Script not found"
 * 3. GET /raw/:id protegido com chave válida retorna 200 OK com text/plain
 * 4. GET /raw/:id protegido sem chave retorna 401 com text/plain e "Unauthorized"
 * 5. GET /raw/:id protegido com ?pass=SENHA válida retorna 200 OK com text/plain
 * 6. Garantia de que NENHUM endpoint retorna HTML, JSON ou redirecionamento.
 */

import http from 'http';

const BASE_URL = 'http://127.0.0.1:3000';

interface HttpResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}

function fetchUrl(urlPath: string): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(urlPath, BASE_URL);
    const req = http.get(fullUrl, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          body,
        });
      });
    });
    req.on('error', (err) => reject(err));
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ SUCESSO: ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 INICIANDO TESTES AUTOMATIZADOS DO ENDPOINT /raw/:id');
  console.log('======================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TESTE 1: GET /raw/w33umz (Script Principal Existente)
    // -------------------------------------------------------------------------
    console.log('--- Teste 1: Script público existente (/raw/w33umz) ---');
    const res1 = await fetchUrl('/raw/w33umz');
    assert(res1.status === 200, `Status HTTP deve ser 200 OK (recebido: ${res1.status})`);
    
    const contentType1 = (res1.headers['content-type'] || '').toLowerCase();
    assert(
      contentType1.includes('text/plain'),
      `Content-Type deve ser text/plain (recebido: ${contentType1})`
    );
    assert(
      contentType1.includes('utf-8'),
      `Content-Type deve especificar charset=utf-8 (recebido: ${contentType1})`
    );
    assert(
      !res1.body.includes('<!DOCTYPE') && !res1.body.includes('<html') && !res1.body.includes('{"'),
      'Corpo NÃO deve conter HTML, páginas do site ou JSON'
    );
    assert(
      res1.body.includes('InterfaceScript') || res1.body.includes('print(') || res1.body.includes('game:GetService'),
      'Corpo deve conter o código Luau original do script'
    );

    // -------------------------------------------------------------------------
    // TESTE 1B: GET /raw/wgj62t (Script wgj62t solicitado pelo usuário)
    // -------------------------------------------------------------------------
    console.log('--- Teste 1B: Script público wgj62t (/raw/wgj62t) ---');
    const res1b = await fetchUrl('/raw/wgj62t');
    assert(res1b.status === 200, `Status HTTP deve ser 200 OK para /raw/wgj62t (recebido: ${res1b.status})`);
    assert(
      (res1b.headers['content-type'] || '').toLowerCase().includes('text/plain'),
      `Content-Type de /raw/wgj62t deve ser text/plain`
    );
    assert(
      res1b.body.includes('InterfaceScript') || res1b.body.includes('GRHub'),
      'Corpo de /raw/wgj62t deve conter o código Luau'
    );

    // -------------------------------------------------------------------------
    // TESTE 1C: GET /raw/d44evg (Script d44evg solicitado pelo usuário)
    // -------------------------------------------------------------------------
    console.log('--- Teste 1C: Script público d44evg (/raw/d44evg) ---');
    const res1c = await fetchUrl('/raw/d44evg');
    assert(res1c.status === 200, `Status HTTP deve ser 200 OK para /raw/d44evg (recebido: ${res1c.status})`);
    assert(
      (res1c.headers['content-type'] || '').toLowerCase().includes('text/plain'),
      `Content-Type de /raw/d44evg deve ser text/plain`
    );
    assert(
      res1c.body.includes('InterfaceScript') || res1c.body.includes('GRHub'),
      'Corpo de /raw/d44evg deve conter o código Luau'
    );

    // -------------------------------------------------------------------------
    // TESTE 2: GET /raw/fly-speed-v2 (Outro Script Público Existente)
    // -------------------------------------------------------------------------
    console.log('\n--- Teste 2: Script público utilitário (/raw/fly-speed-v2) ---');
    const res2 = await fetchUrl('/raw/fly-speed-v2');
    assert(res2.status === 200, `Status HTTP deve ser 200 OK (recebido: ${res2.status})`);
    assert(
      (res2.headers['content-type'] || '').toLowerCase().includes('text/plain'),
      'Content-Type deve ser text/plain'
    );
    assert(
      res2.body.includes('Luau Utility Script') && res2.body.includes('WalkSpeed'),
      'Corpo deve conter o código Luau de fly-speed-v2'
    );

    // -------------------------------------------------------------------------
    // TESTE 3: GET /raw/inexistente (Script Inexistente)
    // -------------------------------------------------------------------------
    console.log('\n--- Teste 3: Script inexistente (/raw/script-que-nao-existe-999) ---');
    const res3 = await fetchUrl('/raw/script-que-nao-existe-999');
    assert(res3.status === 404, `Status HTTP deve ser 404 Not Found (recebido: ${res3.status})`);
    assert(
      (res3.headers['content-type'] || '').toLowerCase().includes('text/plain'),
      `Content-Type de erro 404 deve ser text/plain (recebido: ${res3.headers['content-type']})`
    );
    assert(
      res3.body.trim() === 'Script not found',
      `Corpo do 404 deve ser "Script not found" sem HTML (recebido: "${res3.body.trim()}")`
    );
    assert(
      !res3.body.includes('<html') && !res3.body.includes('<!DOCTYPE'),
      '404 NÃO deve redirecionar para HTML do SPA'
    );

    // -------------------------------------------------------------------------
    // TESTE 4: GET /raw/admin-hub-vip (Script Protegido SEM Chave/Senha)
    // -------------------------------------------------------------------------
    console.log('\n--- Teste 4: Script protegido sem chave/senha (/raw/admin-hub-vip) ---');
    const res4 = await fetchUrl('/raw/admin-hub-vip');
    assert(res4.status === 401, `Status HTTP deve ser 401 Unauthorized (recebido: ${res4.status})`);
    assert(
      (res4.headers['content-type'] || '').toLowerCase().includes('text/plain'),
      `Content-Type de erro 401 deve ser text/plain (recebido: ${res4.headers['content-type']})`
    );
    assert(
      res4.body.trim() === 'Unauthorized',
      `Corpo do 401 deve ser "Unauthorized" (recebido: "${res4.body.trim()}")`
    );

    // -------------------------------------------------------------------------
    // TESTE 5: GET /raw/admin-hub-vip?key=TOKEN (Protegido COM Chave Válida)
    // -------------------------------------------------------------------------
    console.log('\n--- Teste 5: Script protegido com chave válida (?key=key_demo_vip_access_2026) ---');
    const res5 = await fetchUrl('/raw/admin-hub-vip?key=key_demo_vip_access_2026');
    assert(res5.status === 200, `Status HTTP deve ser 200 OK (recebido: ${res5.status})`);
    assert(
      (res5.headers['content-type'] || '').toLowerCase().includes('text/plain'),
      'Content-Type deve ser text/plain'
    );
    assert(
      res5.body.includes('Admin Hub VIP') && res5.body.includes('VIP'),
      'Corpo deve conter o código Luau protegido liberado'
    );

    // -------------------------------------------------------------------------
    // TESTE 6: GET /raw/admin-hub-vip?pass=SENHA (Protegido COM Senha Válida)
    // -------------------------------------------------------------------------
    console.log('\n--- Teste 6: Script protegido com senha válida (?pass=segredo123) ---');
    const res6 = await fetchUrl('/raw/admin-hub-vip?pass=segredo123');
    assert(res6.status === 200, `Status HTTP deve ser 200 OK (recebido: ${res6.status})`);
    assert(
      (res6.headers['content-type'] || '').toLowerCase().includes('text/plain'),
      'Content-Type deve ser text/plain'
    );
    assert(
      res6.body.includes('Admin Hub VIP'),
      'Corpo deve conter o código Luau protegido liberado via senha'
    );

    // -------------------------------------------------------------------------
    // TESTE 7: GET /raw/admin-hub-vip?pass=SENHA_ERRADA (Protegido com Senha Incorreta)
    // -------------------------------------------------------------------------
    console.log('\n--- Teste 7: Script protegido com senha incorreta (?pass=senha_errada) ---');
    const res7 = await fetchUrl('/raw/admin-hub-vip?pass=senha_errada');
    assert(res7.status === 401, `Status HTTP deve ser 401 Unauthorized (recebido: ${res7.status})`);
    assert(
      res7.body.trim() === 'Unauthorized',
      `Corpo deve ser "Unauthorized" (recebido: "${res7.body.trim()}")`
    );

    // -------------------------------------------------------------------------
    // TESTE 8: Tolerância a case-insensitivity e extensão .lua
    // -------------------------------------------------------------------------
    console.log('\n--- Teste 8: Case-insensitivity e extensão .lua (/raw/W33UMZ.lua) ---');
    const res8 = await fetchUrl('/raw/W33UMZ.lua');
    assert(res8.status === 200, `Status HTTP deve ser 200 OK para W33UMZ.lua (recebido: ${res8.status})`);
    assert(
      res8.body.includes('InterfaceScript') || res8.body.includes('print('),
      'Corpo deve ser o mesmo código Luau de w33umz'
    );

    console.log('\n======================================================');
    console.log('🎉 TODOS OS TESTES FORAM CONCLUÍDOS COM SUCESSO 100%!');
    console.log('O endpoint /raw/:id está 100% em conformidade com o Roblox!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('Erro executando os testes:', error);
    process.exit(1);
  }
}

runTests();
