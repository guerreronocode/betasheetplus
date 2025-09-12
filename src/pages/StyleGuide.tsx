import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const StyleGuide = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="fnb-heading text-4xl text-fnb-ink">
            Futuro no Bolso
          </h1>
          <p className="fnb-body text-lg text-muted-foreground">
            Guia de Identidade Visual & Componentes
          </p>
        </div>

        {/* Cores */}
        <section className="space-y-6">
          <h2 className="fnb-heading text-2xl text-fnb-ink">Paleta de Cores</h2>
          
          {/* Cores Institucionais */}
          <div className="space-y-4">
            <h3 className="fnb-heading text-lg text-fnb-ink">Cores Institucionais</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card className="fnb-shape">
                <CardHeader>
                  <div className="w-full h-20 bg-fnb-primary fnb-shape"></div>
                </CardHeader>
                <CardContent>
                  <h4 className="fnb-heading text-sm">Primária</h4>
                  <p className="fnb-body text-xs text-muted-foreground">#C8D641</p>
                  <p className="fnb-mono text-xs">hsl(71, 73%, 51%)</p>
                </CardContent>
              </Card>
              
              <Card className="fnb-shape">
                <CardHeader>
                  <div className="w-full h-20 bg-fnb-ink fnb-shape"></div>
                </CardHeader>
                <CardContent>
                  <h4 className="fnb-heading text-sm">Ink/Texto</h4>
                  <p className="fnb-body text-xs text-muted-foreground">#092220</p>
                  <p className="fnb-mono text-xs">hsl(174, 79%, 8%)</p>
                </CardContent>
              </Card>
              
              <Card className="fnb-shape">
                <CardHeader>
                  <div className="w-full h-20 bg-fnb-cream fnb-shape border"></div>
                </CardHeader>
                <CardContent>
                  <h4 className="fnb-heading text-sm">Creme/Fundo</h4>
                  <p className="fnb-body text-xs text-muted-foreground">#F5F3E1</p>
                  <p className="fnb-mono text-xs">hsl(56, 57%, 92%)</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cores Secundárias */}
          <div className="space-y-4">
            <h3 className="fnb-heading text-lg text-fnb-ink">Cores Secundárias/Apoio</h3>
            <div className="grid grid-cols-5 gap-4">
              <Card className="fnb-shape">
                <CardHeader>
                  <div className="w-full h-16 bg-fnb-red fnb-shape"></div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="fnb-heading text-sm">Vermelho</h4>
                  <p className="fnb-mono text-xs">#D93E3E</p>
                </CardContent>
              </Card>
              
              <Card className="fnb-shape">
                <CardHeader>
                  <div className="w-full h-16 bg-fnb-orange fnb-shape"></div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="fnb-heading text-sm">Laranja</h4>
                  <p className="fnb-mono text-xs">#D97C3E</p>
                </CardContent>
              </Card>
              
              <Card className="fnb-shape">
                <CardHeader>
                  <div className="w-full h-16 bg-fnb-blue fnb-shape"></div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="fnb-heading text-sm">Azul</h4>
                  <p className="fnb-mono text-xs">#3E7FD9</p>
                </CardContent>
              </Card>
              
              <Card className="fnb-shape">
                <CardHeader>
                  <div className="w-full h-16 bg-fnb-purple fnb-shape"></div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="fnb-heading text-sm">Roxo</h4>
                  <p className="fnb-mono text-xs">#6A3ED9</p>
                </CardContent>
              </Card>
              
              <Card className="fnb-shape">
                <CardHeader>
                  <div className="w-full h-16 bg-fnb-green fnb-shape"></div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="fnb-heading text-sm">Verde</h4>
                  <p className="fnb-mono text-xs">#3ED94E</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tipografia */}
        <section className="space-y-6">
          <h2 className="fnb-heading text-2xl text-fnb-ink">Tipografia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="fnb-shape">
              <CardHeader>
                <CardTitle className="fnb-heading">Host Grotesk</CardTitle>
                <CardDescription>Títulos e destaques</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h1 className="fnb-heading text-4xl">Aa</h1>
                  <h2 className="fnb-heading text-2xl">Título Principal</h2>
                  <h3 className="fnb-heading text-lg">Subtítulo</h3>
                  <p className="fnb-heading text-sm">Texto em destaque</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="fnb-shape">
              <CardHeader>
                <CardTitle className="fnb-heading">Roboto</CardTitle>
                <CardDescription>Corpo de texto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="fnb-body text-lg">Texto grande</p>
                  <p className="fnb-body text-base">Texto padrão para leitura</p>
                  <p className="fnb-body text-sm">Texto pequeno</p>
                  <p className="fnb-body text-xs">Texto auxiliar</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="fnb-shape">
              <CardHeader>
                <CardTitle className="fnb-heading">Roboto Mono</CardTitle>
                <CardDescription>Números e valores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="fnb-mono text-2xl">R$ 1.234,56</p>
                  <p className="fnb-mono text-lg">123.456.789</p>
                  <p className="fnb-mono text-base">01/01/2024</p>
                  <p className="fnb-mono text-sm">12:34:56</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Formas e Componentes */}
        <section className="space-y-6">
          <h2 className="fnb-heading text-2xl text-fnb-ink">Formas e Componentes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Botões */}
            <Card className="fnb-shape">
              <CardHeader>
                <CardTitle className="fnb-heading">Botões</CardTitle>
                <CardDescription>Estilos de botão com formas geométricas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button className="fnb-shape">Primário</Button>
                  <Button variant="secondary" className="fnb-shape">Secundário</Button>
                  <Button variant="outline" className="fnb-shape">Outline</Button>
                  <Button variant="ghost" className="fnb-shape">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="fnb-shape-sm">Pequeno</Button>
                  <Button size="lg" className="fnb-shape-lg">Grande</Button>
                </div>
              </CardContent>
            </Card>

            {/* Inputs */}
            <Card className="fnb-shape">
              <CardHeader>
                <CardTitle className="fnb-heading">Inputs</CardTitle>
                <CardDescription>Campos de entrada com bordas arredondadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Campo padrão" className="fnb-shape" />
                <Input placeholder="Campo focado" className="fnb-shape ring-2" />
                <div className="flex gap-2">
                  <Input placeholder="Pequeno" className="fnb-shape-sm" />
                  <Input placeholder="Grande" className="fnb-shape-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges e Estados */}
        <section className="space-y-6">
          <h2 className="fnb-heading text-2xl text-fnb-ink">Badges e Estados</h2>
          
          <Card className="fnb-shape">
            <CardHeader>
              <CardTitle className="fnb-heading">Estados de Feedback</CardTitle>
              <CardDescription>Cores para diferentes estados da interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge className="fnb-shape bg-fnb-success text-white">Sucesso</Badge>
                <Badge className="fnb-shape bg-fnb-error text-white">Erro</Badge>
                <Badge className="fnb-shape bg-fnb-warning text-white">Aviso</Badge>
                <Badge className="fnb-shape bg-fnb-info text-white">Informação</Badge>
                <Badge className="fnb-shape bg-fnb-primary text-fnb-ink">Primário</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sombras */}
        <section className="space-y-6">
          <h2 className="fnb-heading text-2xl text-fnb-ink">Sombras</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="fnb-shape fnb-shadow">
              <CardHeader>
                <CardTitle className="fnb-heading">Sombra Padrão</CardTitle>
                <CardDescription>Elevação sutil para cards</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="fnb-body text-sm text-muted-foreground">
                  Classe: <code className="fnb-mono">fnb-shadow</code>
                </p>
              </CardContent>
            </Card>
            
            <Card className="fnb-shape fnb-shadow-hover">
              <CardHeader>
                <CardTitle className="fnb-heading">Sombra Hover</CardTitle>
                <CardDescription>Elevação para interações</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="fnb-body text-sm text-muted-foreground">
                  Classe: <code className="fnb-mono">fnb-shadow-hover</code>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dark Mode */}
        <section className="space-y-6">
          <h2 className="fnb-heading text-2xl text-fnb-ink">Modo Escuro</h2>
          
          <Card className="fnb-shape">
            <CardHeader>
              <CardTitle className="fnb-heading">Suporte a Dark Mode</CardTitle>
              <CardDescription>Todas as cores se adaptam automaticamente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="fnb-body text-sm text-muted-foreground">
                O sistema de cores foi configurado para funcionar automaticamente em modo escuro,
                mantendo a cor primária #C8D641 como acento e derivando o fundo escuro do ink #092220.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default StyleGuide;