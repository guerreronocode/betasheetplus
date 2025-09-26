import React from 'react';
import { Layout } from '@/components/Layout';

const LancamentosSimple = () => {
  console.log('LancamentosSimple component rendering...');
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-fnb-ink mb-1">Lançamentos (Teste)</h1>
          <p className="text-fnb-ink/70 text-sm">Página de teste para verificar funcionamento básico</p>
        </div>

        <div className="bg-white p-4 rounded border">
          <p>Esta é uma página de teste simplificada para verificar se o layout básico funciona.</p>
          <p>Se você consegue ver este texto, o problema não é com o Layout ou roteamento básico.</p>
        </div>
      </div>
    </Layout>
  );
};

export default LancamentosSimple;