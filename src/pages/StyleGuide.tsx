import React from 'react';

const StyleGuide = () => {
  return (
    <div className="min-h-screen p-8">
      <section className="card">
        <h1>Futuro no Bolso – Style Guide</h1>
        <p>Texto padrão do app. <strong>Negrito</strong> e <em>itálico</em>.</p>
        <div className="flex gap-4 mt-4">
          <button className="btn-primary">Ação Primária</button>
          <button className="btn-secondary">Ação Secundária</button>
        </div>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2>Tabela Financeira</h2>
        <table className="table-finance w-full">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th className="val">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10/09</td>
              <td>Salário</td>
              <td className="val pos fn-money">+ 7.000,00</td>
            </tr>
            <tr>
              <td>12/09</td>
              <td>Aluguel</td>
              <td className="val neg fn-money">- 2.000,00</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2>Tipografia</h2>
        <h1>H1 - Host Grotesk Bold</h1>
        <h2>H2 - Host Grotesk Bold</h2>
        <h3>H3 - Roboto Semibold</h3>
        <p>Parágrafo normal - Roboto Regular</p>
        <div className="fn-money">1.234,56 - Roboto Mono (dinheiro)</div>
        <div className="fn-number">9876543210 - Roboto Mono (números)</div>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2>Feedback Utilitários</h2>
        <div className="is-success p-4 mb-2 rounded">Sucesso</div>
        <div className="is-error p-4 mb-2 rounded">Erro</div>
        <div className="is-warning p-4 mb-2 rounded">Aviso</div>
        <div className="is-info p-4 mb-2 rounded">Informação</div>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2>Inputs</h2>
        <div className="space-y-4">
          <input className="input w-full" type="text" placeholder="Campo de texto" />
          <select className="input w-full">
            <option>Opção 1</option>
            <option>Opção 2</option>
          </select>
          <textarea className="input w-full" rows={3} placeholder="Área de texto"></textarea>
        </div>
      </section>
    </div>
  );
};

export default StyleGuide;